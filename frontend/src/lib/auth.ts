import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// BẢO MẬT: khóa JWT lấy từ biến môi trường (.env — đã gitignore). KHÔNG hard-code
// vào source: ai đọc được secret là giả mạo được phiên đăng nhập của mọi user.
// Tạo secret mạnh: `openssl rand -base64 48` rồi đặt JWT_SECRET=... trong .env
const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error(
    'Thiếu JWT_SECRET. Tạo file frontend/.env với dòng JWT_SECRET=<chuỗi ngẫu nhiên dài> ' +
    '(vd chạy: openssl rand -base64 48).'
  );
}
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  try {
    return await decrypt(session);
  } catch (error) {
    return null;
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
