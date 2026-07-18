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