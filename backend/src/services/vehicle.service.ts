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

interface SearchFilters {
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

  return prisma.vehicle.findMany({
    where: {
      // Each condition is only included if the corresponding filter
      // was actually provided — undefined fields are ignored by Prisma,
      // so omitted filters simply don't narrow the query.
      make: make ? { equals: make, mode: 'insensitive' } : undefined,
      model: model ? { equals: model, mode: 'insensitive' } : undefined,
      category: category ? { equals: category, mode: 'insensitive' } : undefined,
      price: {
        gte: minPrice ?? undefined,
        lte: maxPrice ?? undefined,
      },
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