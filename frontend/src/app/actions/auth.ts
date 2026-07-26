'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signIn, signOut } from '@/auth';

export async function register(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { error: 'Vui lòng điền đủ thông tin.' };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: 'Email đã được sử dụng.' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // After registration, sign in
  await signIn('credentials', {
    email,
    password,
    redirect: true,
    redirectTo: '/'
  });
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Vui lòng điền đủ thông tin.' };
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: true,
      redirectTo: '/'
    });
  } catch (error: any) {
    if (error.type === 'CredentialsSignin') {
      return { error: 'Sai tài khoản hoặc mật khẩu.' };
    }
    throw error; // Let Next.js handle redirect errors
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/' });
}
