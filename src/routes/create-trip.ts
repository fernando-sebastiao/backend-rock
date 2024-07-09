import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post("/trips", {
    schema:{
        
    }
  },async () => {
    return "Hello World, NLW";
  });
}
