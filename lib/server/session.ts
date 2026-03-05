import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";

export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get("access_token")?.value;

  // нет куки — отправляем на логин (не 500)
  if (!token) redirect("/login");

  let payload: ReturnType<typeof verifyAccessToken>;
  try {
    payload = verifyAccessToken(token);
  } catch {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) redirect("/login");

  return user;
}