import { NextFunction, Request, Response } from 'express';
import { createVehicle, findVehicles, updateVehicle, deleteVehicle, purchaseVehicle, restockVehicle } from '../services/vehicle.service';

export async function create(req: Request, res: Response, next: NextFunction) {
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
  } catch (error) {
      next(error);
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

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const updated = await updateVehicle(id, req.body);

  if (!updated) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  return res.status(200).json(updated);
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await deleteVehicle(id);

  if (!deleted) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  // 204 No Content — successful deletion, nothing meaningful to return
  return res.status(204).send();
}

export async function purchase(req: Request, res: Response) {
  const { id } = req.params;
  const result = await purchaseVehicle(id);

  if (result.error === 'not_found') {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  if (result.error === 'out_of_stock') {
    return res.status(400).json({ error: 'Vehicle is out of stock' });
  }
  return res.status(200).json(result.vehicle);
}

export async function restock(req: Request, res: Response) {
  const { id } = req.params;
  const amount = req.body.amount ?? 1; // default to 1 if not specified

  const updated = await restockVehicle(id, amount);
  if (!updated) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  return res.status(200).json(updated);
}