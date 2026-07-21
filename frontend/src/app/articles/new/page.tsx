import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NewArticleForm from './form';

// Guard phía server: chưa đăng nhập thì đá về /login.
export default async function NewArticlePage() {
  const session = await getSession();
  if (!session?.userId) redirect('/login');
  return <NewArticleForm />;
}
