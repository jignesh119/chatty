import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
  } catch (error) {
    console.log("[SERVER_ID_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
