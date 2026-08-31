import "dotenv/config";

import Fastify from "fastify";
import cors from "@fastify/cors";

import { db } from "./db/index.js";
import { dailyRoutes } from "./routes/daily.js";

const app = Fastify({
  logger: true,
});

app.register(cors, {
  origin: true,
});

app.register(dailyRoutes);

app.get("/", async () => {
  return {
    message: "Adivinhe o Ano API está funcionando!",
  };
});

async function start() {
  try {
    await db.execute("SELECT 1");

    console.log("PostgreSQL conectado!");

    await app.listen({
      port: 3000,
    });

    console.log("Servidor rodando em http://localhost:3000");
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();