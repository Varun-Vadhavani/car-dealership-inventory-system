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
});