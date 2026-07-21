'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const sessionData = { userId: user.id, email: user.email, name: user.name, role: user.role };
  const sessionToken = await encrypt(sessionData);

  const cookieStore = await cookies();
  cookieStore.set('session', sessionToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 });

  redirect('/');
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Vui lòng điền đủ thông tin.' };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: 'Sai tài khoản hoặc mật khẩu.' };
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return { error: 'Sai tài khoản hoặc mật khẩu.' };
  }

  const sessionData = { userId: user.id, email: user.email, name: user.name, role: user.role };
  const sessionToken = await encrypt(sessionData);

  const cookieStore = await cookies();
  cookieStore.set('session', sessionToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 });

  redirect('/');
}

// Đăng xuất: xóa cookie phiên rồi về trang chủ.
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/');
}
