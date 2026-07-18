import request from 'supertest';
import app from '../../src/index';
import prisma from '../../src/lib/prisma';

describe('POST /api/auth/register', () => {
  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a new user and return 201 with no password field', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'SecurePass123' });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe('test@example.com');
    expect(response.body.password).toBeUndefined();
    expect(response.body.id).toBeDefined();
  });
});