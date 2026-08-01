import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NewForumForm from './form';

export default async function NewThaoLuanPage() {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  return <NewForumForm />;
}
