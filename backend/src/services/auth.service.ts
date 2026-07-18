import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';

export async function registerUser(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  const { password: _password, ...safeUser } = user;
  return safeUser;
}

// Verifies credentials and issues a signed JWT on success.
// Returns null on any failure (user not found OR wrong password) —
// the caller (controller) maps that to a generic 401, so this
// function itself never distinguishes the two failure reasons.
export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return null;
  }

  // bcrypt.compare re-hashes the plaintext input with the same salt
  // stored in `user.password` and checks for a match — we never
  // decrypt the stored hash, because bcrypt hashing is one-way.
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return null;
  }

  // Payload kept minimal and non-sensitive: just enough to identify
  // the user and check permissions later via auth middleware.
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' } // short-lived token; forces re-login after expiry
  );

  return token;
}