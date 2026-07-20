import prisma from '../lib/prisma';

interface CreateVehicleInput {
  make: string;
  model: string;
  year: number;
  category: string;
  price: number;
  quantity: number;
}

// Creates a new vehicle configuration. Relies on the database's
// composite unique constraint (make, model, year, category) to
// reject duplicates — Prisma throws error code P2002 in that case,
// which the controller translates into a 409 response.
export async function createVehicle(data: CreateVehicleInput) {
  return prisma.vehicle.create({ data });
}

export interface SearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

// Returns all vehicles, optionally narrowed by any combination of
// filters. Passing no filters (as GET /api/vehicles does) returns
// everything — this is why list and search share one function.
export async function findVehicles(filters: SearchFilters = {}) {
  const { make, model, category, minPrice, maxPrice } = filters;

  const conditions: any[] = [];

  // Global search matching make, model, category, or year (tokenized multi-term search e.g. "2023 hon")
  if (make) {
    const tokens = make.trim().split(/\s+/).filter(Boolean);

    for (const token of tokens) {
      const matchingYears: number[] = [];
      if (/^\d+$/.test(token)) {
        for (let y = 1900; y <= 2100; y++) {
          if (y.toString().includes(token)) {
            matchingYears.push(y);
          }
        }
      }

      conditions.push({
        OR: [
          { make: { contains: token, mode: 'insensitive' } },
          { model: { contains: token, mode: 'insensitive' } },
          { category: { contains: token, mode: 'insensitive' } },
          ...(matchingYears.length > 0 ? [{ year: { in: matchingYears } }] : []),
        ],
      });
    }
  }

  if (model) {
    conditions.push({ model: { contains: model, mode: 'insensitive' } });
  }

  if (category) {
    conditions.push({ category: { contains: category, mode: 'insensitive' } });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    conditions.push({
      price: {
        gte: minPrice ?? undefined,
        lte: maxPrice ?? undefined,
      },
    });
  }

  return prisma.vehicle.findMany({
    where: conditions.length > 0 ? { AND: conditions } : {},
    orderBy: {
      createdAt: 'asc',
    },
  });
}

interface UpdateVehicleInput {
  make?: string;
  model?: string;
  year?: number;
  category?: string;
  price?: number;
  quantity?: number;
}

// Partial update — only fields present in `data` are changed.
// Returns null if no vehicle with this id exists, rather than
// letting Prisma throw, so the controller can cleanly map that to 404.

// Shared lookup used by both update and delete, so the
// "does this vehicle exist" check lives in exactly one place.
async function findVehicleById(id: string) {
  return prisma.vehicle.findUnique({ where: { id } });
}

export async function updateVehicle(id: string, data: UpdateVehicleInput) {
  const existing = await findVehicleById(id);
  if (!existing) {
    return null;
  }
  return prisma.vehicle.update({ where: { id }, data });
}
  
// Returns true if a vehicle was deleted, false if it didn't exist.
// Same "check first" pattern as update, for the same reason:
// a clean, explicit signal for the controller rather than a caught exception.
export async function deleteVehicle(id: string) {
  const existing = await findVehicleById(id);
  if (!existing) {
    return false;
  }
  await prisma.vehicle.delete({ where: { id } });
  return true;
}

// Atomically decrements quantity by 1, but ONLY if quantity is
// currently > 0 — the check and the write happen as one database
// operation, so two simultaneous purchase requests on the last unit
// can't both "pass" a check before either writes (the race condition
// a naive read-then-write approach would have).
//
// updateMany returns a count of affected rows rather than the row
// itself, so a count of 0 tells us the where clause didn't match
// (either the vehicle doesn't exist, or quantity was already 0) —
// we then re-fetch to distinguish those two cases for the response.
export async function purchaseVehicle(id: string) {
  const result = await prisma.vehicle.updateMany({
    where: { id, quantity: { gt: 0 } },
    data: { quantity: { decrement: 1 } },
  });

  if (result.count === 0) {
    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      return { error: 'not_found' as const };
    }
    return { error: 'out_of_stock' as const };
  }

  const updated = await prisma.vehicle.findUnique({ where: { id } });
  return { vehicle: updated };
}

// Atomically increments quantity by the given amount. No race
// condition risk here since there's no "reject if" condition —
// increment is always safe regardless of current value.
export async function restockVehicle(id: string, amount: number) {
  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }
  return prisma.vehicle.update({
    where: { id },
    data: { quantity: { increment: amount } },
  });
}