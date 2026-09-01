import "dotenv/config";

import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import { db } from "./db/index.js";
import { dailyRoutes } from "./routes/daily.js";

const app = Fastify({
  logger: true,
});


app.register(cors, {
  origin: true,
});


app.register(swagger, {
  openapi: {
    info: {
      title: "ANUALE API",
      description:
        "API do jogo ANUALE - Descubra em que ano isso aconteceu.",
      version: "1.0.0",
    },

    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
});

app.register(swaggerUi, {
  routePrefix: "/documentation",
});


app.register(dailyRoutes);

app.get("/", async () => {
  return {
    message: "ANUALE API está funcionando!",
  };
});


async function start() {
  try {
    await db.execute("SELECT 1");

    console.log("PostgreSQL conectado!");

    const port = Number(process.env.PORT) || 3000;

    await app.listen({
      port,
      host: "0.0.0.0",
    });

    console.log(
      `Servidor rodando em http://localhost:${port}`
    );
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();