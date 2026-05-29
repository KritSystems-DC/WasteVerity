import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function withAuth(req: NextRequest, handler: (req: NextRequest, session: any) => Promise<Response>) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return handler(req, session);
}

export async function withBusinessAccess(
  req: NextRequest,
  businessId: string,
  handler: (req: NextRequest, session: any) => Promise<Response>
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN" && session.user.businessId !== businessId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return handler(req, session);
}

export async function withAdminAccess(
  req: NextRequest,
  handler: (req: NextRequest, session: any) => Promise<Response>
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
  }

  return handler(req, session);
}
