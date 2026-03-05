import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getCurrentUser() {
  const token = cookies().get("access_token")?.value;
  if (!token) throw new Error("Unauthenticated");
  const payload = verifyAccessToken(token);
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw new Error("User missing");
  return user;
}
