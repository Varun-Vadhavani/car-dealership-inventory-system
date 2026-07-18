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

  describe('POST /api/auth/login', () => {
  // Register a fresh user before each login test so we have known,
  // valid credentials to test against. Runs before every `it` block
  // in this describe, keeping each test independent (test isolation).
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login@example.com', password: 'SecurePass123' });
  });

  it('should return 200 and a token for valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'SecurePass123' });

    expect(response.status).toBe(200);
    // We only check that a token exists, not its exact value —
    // JWTs are signed and time-sensitive, so asserting on the literal
    // string would make this test brittle for no real benefit.
    expect(response.body.token).toBeDefined();
  });

  it('should return 401 for wrong password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'WrongPassword' });

    expect(response.status).toBe(401);
  });

  it('should return 401 for non-existent email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'SecurePass123' });

    // Same 401 as "wrong password" above — intentionally identical,
    // so the API never reveals whether an email exists in the system.
    expect(response.status).toBe(401);
  });
});
});