import request from 'supertest';
import express from 'express';
import { authenticate } from '../../src/middleware/auth.middleware';
import jwt from 'jsonwebtoken';

// A minimal standalone app just for testing the middleware in isolation,
// rather than depending on a real protected route existing yet.
const testApp = express();
testApp.get('/protected', authenticate, (req, res) => {
  res.status(200).json({ message: 'you got in' });
});

describe('authenticate middleware', () => {
  it('should return 401 with no token', async () => {
    const response = await request(testApp).get('/protected');
    expect(response.status).toBe(401);
  });

  it('should return 401 with an invalid token', async () => {
    const response = await request(testApp)
      .get('/protected')
      .set('Authorization', 'Bearer garbage-token');
    expect(response.status).toBe(401);
  });

  it('should return 200 with a valid token', async () => {
    const token = jwt.sign(
      { userId: 'abc', role: 'USER' },
      process.env.JWT_SECRET as string
    );
    const response = await request(testApp)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });
});