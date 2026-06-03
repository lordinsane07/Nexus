import { NextRequest } from 'next/server';
import { db } from '@/db/index';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['seller']), // Only 'seller' role can sign up; admins are seeded
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ success: false, error: 'Invalid input data' }, { status: 400 });
    }

    const { name, email, password, role } = parsed.data;

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return Response.json({ success: false, error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return Response.json({ success: true, message: 'User created successfully' }, { status: 201 });
  } catch (err) {
    console.error('Signup error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
