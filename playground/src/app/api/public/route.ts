import { NextResponse } from "next/server";

export async function GET() {
  const data = { message: "Hello world" };

  return NextResponse.json({ data });
}
