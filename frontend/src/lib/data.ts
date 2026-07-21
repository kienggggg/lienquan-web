import fs from 'fs';
import path from 'path';

export type NewsItem = { title: string; url: string; img: string; type: 'news' | 'event' };
export type NewsData = { updated: string; source: string; items: NewsItem[] };

// Đọc data/news.json (sinh bởi scrape_news.py). Lỗi -> trả rỗng, không sập trang.
export function readNews(): NewsData {
  try {
    const p = path.join(process.cwd(), '..', 'data', 'news.json');
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch {
    return { updated: '', source: '', items: [] };
  }
}
