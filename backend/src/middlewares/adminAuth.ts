import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

export async function adminAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
  } catch (error) {
    console.error("Erro JWT:", error);

    return reply.code(401).send({
      error: "Não autorizado.",
    });
  }

  if (request.user.role !== "admin") {
    return reply.code(403).send({
      error: "Acesso negado.",
    });
  }
}