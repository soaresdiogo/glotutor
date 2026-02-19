import { compare as bcryptCompare, hash as bcryptHash } from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcryptHash(plain, SALT_ROUNDS);
}

export async function comparePassword(
  plain: string,
  hashed: string,
): Promise<boolean> {
  return bcryptCompare(plain, hashed);
}
