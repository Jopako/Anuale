import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      username: string;
      role: "admin";
    };
    user: {
      username: string;
      role: "admin";
    };
  }
}                                                                                                                                                                                                                           