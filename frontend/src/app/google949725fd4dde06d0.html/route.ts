import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse("google-site-verification: google949725fd4dde06d0.html", {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
