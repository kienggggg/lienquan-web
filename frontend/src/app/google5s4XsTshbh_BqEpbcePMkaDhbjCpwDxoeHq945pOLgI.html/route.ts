import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse("google-site-verification: google5s4XsTshbh_BqEpbcePMkaDhbjCpwDxoeHq945pOLgI.html", {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
