import { NextResponse } from "next/server";

export async function GET() {
  const txt = `# robots.txt generated for Googlebot
User-agent: *
Allow: /

Sitemap: https://lienquanmeta.vercel.app/sitemap.xml
`;

  return new NextResponse(txt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
