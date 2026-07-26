import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NewArticleForm from './form';
import fs from 'fs';
import path from 'path';

export default async function NewArticlePage() {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  const filePath = path.join(process.cwd(), '..', 'data', 'heroes.json');
  let heroesList: any[] = [];
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    if (data && Array.isArray(data.heroes)) heroesList = data.heroes;
    else if (Array.isArray(data)) heroesList = data;
    else heroesList = Object.entries(data.heroes || data).map(([id, d]: any) => ({ id, ...d }));
    // Sort by name
    heroesList.sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
  } catch (error) {
    console.error("Failed to read heroes data", error);
  }

  return <NewArticleForm heroes={heroesList} />;
}
