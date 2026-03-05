import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";

export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get("access_token")?.value;

  if (!token) throw new Error("Unauthenticated");

  const payload = verifyAccessToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.sub }
  });

  if (!user) throw new Error("Unauthenticated");

  return user;
}