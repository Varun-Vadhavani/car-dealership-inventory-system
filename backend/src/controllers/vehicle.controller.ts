import { Request, Response } from 'express';
import { createVehicle, findVehicles } from '../services/vehicle.service';

export async function create(req: Request, res: Response) {
  const { make, model, year, category, price, quantity } = req.body;

  // Basic presence validation. A future refactor could replace this
  // with a schema validator (e.g. zod) once we have several endpoints
  // repeating this pattern — noted for the refactor step, not needed yet.
  if (!make || !model || !year || !category || price == null || quantity == null) {
    return res.status(400).json({ error: 'All vehicle fields are required' });
  }

  try {
    const vehicle = await createVehicle({ make, model, year, category, price, quantity });
    return res.status(201).json(vehicle);
  } catch (error: any) {
    // P2002 = Prisma's unique constraint violation (duplicate configuration)
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'This vehicle configuration already exists' });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export async function list(req: Request, res: Response) {
  const vehicles = await findVehicles();
  return res.status(200).json(vehicles);
}

export async function search(req: Request, res: Response) {
  const { make, model, category, minPrice, maxPrice } = req.query;

  // Query params always arrive as strings (or undefined) — convert
  // numeric ones explicitly before passing to the service.
  const vehicles = await findVehicles({
    make: make as string | undefined,
    model: model as string | undefined,
    category: category as string | undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  });

  return res.status(200).json(vehicles);
}