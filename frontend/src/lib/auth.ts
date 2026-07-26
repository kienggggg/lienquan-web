import { auth } from "@/auth";

export async function getSession() {
  const session = await auth();
  if (!session || !session.user) return null;
  
  return {
    id: session.user.id as string,
    userId: session.user.id as string, // for backward compatibility
    role: (session.user as any).role || 'USER',
    name: session.user.name || 'Người dùng',
    email: session.user.email as string,
    image: session.user.image as string,
  };
}

export async function logout() {
  // logout functionality is now handled by NextAuth signOut
}
