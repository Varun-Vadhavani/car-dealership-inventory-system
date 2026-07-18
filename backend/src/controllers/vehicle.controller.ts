import { Request, Response } from 'express';
import { createVehicle } from '../services/vehicle.service';

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