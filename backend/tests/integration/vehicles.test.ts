import request from 'supertest';
import app from '../../src/index';
import prisma from '../../src/lib/prisma';
import jwt from 'jsonwebtoken';

// Helper to generate a valid admin token for tests that need one,
// without going through the full register/login flow each time.
function generateToken(role: 'USER' | 'ADMIN' = 'ADMIN') {
  return jwt.sign({ userId: 'test-user-id', role }, process.env.JWT_SECRET as string);
}

describe('POST /api/vehicles', () => {
  afterEach(async () => {
    await prisma.vehicle.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const validVehicle = {
    make: 'Honda',
    model: 'Civic',
    year: 2024,
    category: 'Sedan',
    price: 24999.99,
    quantity: 5,
  };

  it('should create a vehicle and return 201 when authenticated', async () => {
    const token = generateToken();
    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(validVehicle);

    expect(response.status).toBe(201);
    expect(response.body.make).toBe('Honda');
    expect(response.body.id).toBeDefined();
  });

  it('should return 401 with no token', async () => {
    const response = await request(app).post('/api/vehicles').send(validVehicle);
    expect(response.status).toBe(401);
  });

  it('should return 409 if the same make/model/year/category already exists', async () => {
    const token = generateToken();
    // Create it once — should succeed
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(validVehicle);

    // Attempt the exact same configuration again — should be rejected
    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(validVehicle);

    expect(response.status).toBe(409);
  });

  describe('GET /api/vehicles', () => {
  afterEach(async () => {
    await prisma.vehicle.deleteMany();
  });

  it('should return all vehicles', async () => {
    const token = generateToken();
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ make: 'Honda', model: 'Civic', year: 2024, category: 'Sedan', price: 24999.99, quantity: 5 });

    const response = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].make).toBe('Honda');
  });
});

describe('GET /api/vehicles/search', () => {
  afterEach(async () => {
    await prisma.vehicle.deleteMany();
  });

  beforeEach(async () => {
    const token = generateToken();
    // Seed two distinct vehicles so filters have something real to narrow down
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ make: 'Honda', model: 'Civic', year: 2024, category: 'Sedan', price: 24999.99, quantity: 5 });
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ make: 'Ford', model: 'F-150', year: 2024, category: 'Truck', price: 45999.99, quantity: 3 });
  });

  it('should filter by make', async () => {
    const token = generateToken();
    const response = await request(app)
      .get('/api/vehicles/search?make=Honda')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].make).toBe('Honda');
  });

  it('should filter by price range', async () => {
    const token = generateToken();
    const response = await request(app)
      .get('/api/vehicles/search?minPrice=30000&maxPrice=50000')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].make).toBe('Ford');
  });
});

describe('PUT /api/vehicles/:id', () => {
  afterEach(async () => {
    await prisma.vehicle.deleteMany();
  });

  it('should update a vehicle and return 200', async () => {
    const token = generateToken();
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ make: 'Honda', model: 'Civic', year: 2024, category: 'Sedan', price: 24999.99, quantity: 5 });

    const response = await request(app)
      .put(`/api/vehicles/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 22999.99 });

    expect(response.status).toBe(200);
    expect(response.body.price).toBe('22999.99');
  });

  it('should return 404 for a non-existent vehicle', async () => {
    const token = generateToken();
    const response = await request(app)
      .put('/api/vehicles/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 22999.99 });

    expect(response.status).toBe(404);
  });
});

describe('DELETE /api/vehicles/:id', () => {
  afterEach(async () => {
    await prisma.vehicle.deleteMany();
  });

  it('should delete a vehicle and return 204 when admin', async () => {
    const adminToken = generateToken('ADMIN');
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Honda', model: 'Civic', year: 2024, category: 'Sedan', price: 24999.99, quantity: 5 });

    const response = await request(app)
      .delete(`/api/vehicles/${created.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(204);
  });

  it('should return 403 when a non-admin tries to delete', async () => {
    const adminToken = generateToken('ADMIN');
    const userToken = generateToken('USER');
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Honda', model: 'Civic', year: 2024, category: 'Sedan', price: 24999.99, quantity: 5 });

    const response = await request(app)
      .delete(`/api/vehicles/${created.body.id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
  });
});

describe('POST /api/vehicles/:id/purchase', () => {
  afterEach(async () => {
    await prisma.vehicle.deleteMany();
  });

  it('should decrement quantity by 1 and return 200', async () => {
    const token = generateToken();
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ make: 'Honda', model: 'Civic', year: 2024, category: 'Sedan', price: 24999.99, quantity: 5 });

    const response = await request(app)
      .post(`/api/vehicles/${created.body.id}/purchase`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.quantity).toBe(4);
  });

  it('should return 400 when quantity is already 0', async () => {
    const token = generateToken();
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ make: 'Honda', model: 'Civic', year: 2024, category: 'Sedan', price: 24999.99, quantity: 0 });

    const response = await request(app)
      .post(`/api/vehicles/${created.body.id}/purchase`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});

describe('POST /api/vehicles/:id/restock', () => {
  afterEach(async () => {
    await prisma.vehicle.deleteMany();
  });

  it('should increment quantity and return 200 when admin', async () => {
    const adminToken = generateToken('ADMIN');
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Honda', model: 'Civic', year: 2024, category: 'Sedan', price: 24999.99, quantity: 5 });

    const response = await request(app)
      .post(`/api/vehicles/${created.body.id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 10 });

    expect(response.status).toBe(200);
    expect(response.body.quantity).toBe(15);
  });

  it('should return 403 when a non-admin tries to restock', async () => {
    const adminToken = generateToken('ADMIN');
    const userToken = generateToken('USER');
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Honda', model: 'Civic', year: 2024, category: 'Sedan', price: 24999.99, quantity: 5 });

    const response = await request(app)
      .post(`/api/vehicles/${created.body.id}/restock`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 5 });

    expect(response.status).toBe(403);
  });
});

});