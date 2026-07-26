import { auth } from "@/auth";

export async function getSession() {
  const session = await auth();
  if (!session || !session.user) return null;
  
  return {
    id: session.user.id,
    role: (session.user as any).role || 'USER',
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };
}

export async function logout() {
  // logout functionality is now handled by NextAuth signOut
}
