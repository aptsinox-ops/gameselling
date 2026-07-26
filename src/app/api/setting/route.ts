import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Setting API is active" });
}

export async function POST(req: Request) {
  return NextResponse.json({ message: "Setting API post active" });
}