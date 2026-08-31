import Fastify from "fastify";
import cors from "@fastify/cors";

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

app.listen({ port: 3000 }, (error, address) => {
  if (error) {
    app.log.error(error);
    process.exit(1);
  }

  console.log(`Servidor rodando em ${address}`);
});