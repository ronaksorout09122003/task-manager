const app = require("./app");
const prisma = require("./config/prisma");

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    // 🔌 Connect to database
    await prisma.$connect();
    console.log("✅ Database connected");

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 API server running on port ${PORT}`);
    });

    const shutdown = async () => {
      console.log("🛑 Shutting down server...");

      server.close(async () => {
        try {
          await prisma.$disconnect();
          console.log("✅ Database disconnected");
          process.exit(0);
        } catch (err) {
          console.error("❌ Error during shutdown:", err);
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();