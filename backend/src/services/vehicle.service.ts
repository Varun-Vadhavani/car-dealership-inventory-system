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