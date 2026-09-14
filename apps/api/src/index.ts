import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

const app = createApp();

async function main() {
  await prisma.$connect();

  app.listen(env.PORT, () => {
    console.log(
      `BugSense API listening on http://localhost:${env.PORT}`,
    );
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
