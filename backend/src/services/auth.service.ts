import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';

export async function registerUser(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  const { password: _password, ...safeUser } = user;
  return safeUser;
}