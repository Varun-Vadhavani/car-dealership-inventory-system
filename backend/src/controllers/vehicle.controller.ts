import { Request, Response } from 'express';
import { createVehicle, findVehicles, updateVehicle, deleteVehicle, purchaseVehicle, restockVehicle, type SearchFilters } from '../services/vehicle.service';

export async function create(req: Request, res: Response) {
  const { make, model, year, category, price, quantity, imageUrl } = req.body;

  if (!make || !model || !year || !category || price == null || quantity == null) {
    return res.status(400).json({ error: 'All vehicle fields are required' });
  }

  try {
    const payload = {
      make: String(make).trim(),
      model: String(model).trim(),
      year: Number(year),
      category: String(category).trim(),
      price: Number(price),
      quantity: Number(quantity),
      ...(imageUrl ? { imageUrl: String(imageUrl).trim() } : {}),
    };

    const vehicle = await createVehicle(payload);
    return res.status(201).json(vehicle);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to create vehicle' });
  }
}

export async function list(req: Request, res: Response) {
  try {
    const vehicles = await findVehicles();
    return res.status(200).json(vehicles);
  } catch {
    return res.status(200).json([]);
  }
}

export async function search(req: Request, res: Response) {
  const { make, model, category, minPrice, maxPrice } = req.query;

  const filters: SearchFilters = {};
  if (typeof make === 'string' && make.trim()) filters.make = make.trim();
  if (typeof model === 'string' && model.trim()) filters.model = model.trim();
  if (typeof category === 'string' && category.trim()) filters.category = category.trim();
  if (minPrice) filters.minPrice = Number(minPrice);
  if (maxPrice) filters.maxPrice = Number(maxPrice);

  try {
    const vehicles = await findVehicles(filters);
    return res.status(200).json(vehicles);
  } catch {
    return res.status(200).json([]);
  }
}

export async function update(req: Request, res: Response) {
  const id = String(req.params.id);
  try {
    const updated = await updateVehicle(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Update failed' });
  }
}

export async function remove(req: Request, res: Response) {
  const id = String(req.params.id);
  try {
    const deleted = await deleteVehicle(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    return res.status(204).send();
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Delete failed' });
  }
}

export async function purchase(req: Request, res: Response) {
  const id = String(req.params.id);
  try {
    const result = await purchaseVehicle(id);
    if (result.error === 'not_found') {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    if (result.error === 'out_of_stock') {
      return res.status(400).json({ error: 'Vehicle is out of stock' });
    }
    return res.status(200).json(result.vehicle);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Purchase failed' });
  }
}

export async function restock(req: Request, res: Response) {
  const id = String(req.params.id);
  const amount = req.body.amount ?? 1;

  try {
    const updated = await restockVehicle(id, amount);
    if (!updated) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Restock failed' });
  }
}