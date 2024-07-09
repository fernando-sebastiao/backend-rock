import { FastifyInstance } from "fastify";

export function createTrip(app: FastifyInstance) {
  app.post("/trips", async () => {
    return "Hello World, NLW";
  });
}
