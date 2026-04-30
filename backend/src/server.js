const app = require("./app");
const prisma = require("./config/prisma");

const port = process.env.PORT || 5000;

async function startServer() {
  await prisma.$connect();

  const server = app.listen(port, () => {
    console.log(`API server running on port ${port}`);
  });

  const shutdown = async () => {
    console.log("Shutting down API server...");
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer().catch(async (error) => {
  console.error("Failed to start server", error);
  await prisma.$disconnect();
  process.exit(1);
});
