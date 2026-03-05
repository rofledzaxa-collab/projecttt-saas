import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function rand(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function daysAgo(n) { return new Date(Date.now() - n*24*60*60*1000); }

async function main() {
  await prisma.event.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const adminPass = await bcrypt.hash("Admin123!", 10);
  const demoPass = await bcrypt.hash("Demo123!", 10);

  const admin = await prisma.user.create({
    data: { email: "admin@projecttt.dev", name: "Admin", passwordHash: adminPass, role: "ADMIN", plan: "PRO" }
  });

  const demo = await prisma.user.create({
    data: { email: "demo@projecttt.dev", name: "Demo User", passwordHash: demoPass, role: "USER", plan: "FREE" }
  });

  const users = [admin, demo];

  const types = ["page_view","add_to_cart","checkout_start","purchase","search","signup_intent"];
  const paths = ["/","/pricing","/blog/how-to","/product/alpha","/product/beta","/checkout"];
  const devices = ["desktop","mobile","tablet"];
  const countries = ["KZ","US","DE","FR","TR","PL","UA"];

  for (const u of users) {
    for (let d = 0; d < 30; d++) {
      const day = daysAgo(29 - d);
      const sessions = 2 + Math.floor(Math.random()*5);
      for (let s = 0; s < sessions; s++) {
        const sessionId = `sess_${u.id}_${d}_${s}`;
        const eventsCount = 2 + Math.floor(Math.random()*10);
        for (let i = 0; i < eventsCount; i++) {
          const type = rand(types);
          await prisma.event.create({
            data: {
              userId: u.id,
              sessionId,
              type,
              path: rand(paths),
              referrer: rand(["google","direct","twitter","tiktok","newsletter"]),
              device: rand(devices),
              country: rand(countries),
              metadata: { value: Math.round(Math.random()*5000)/100 },
              createdAt: new Date(day.getTime() + Math.floor(Math.random()*24*60*60*1000))
            }
          });
        }
      }
    }
  }
  console.log("Seed complete.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
