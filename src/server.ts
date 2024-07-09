import cors from "@fastify/cors";
import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { createTrip } from "./routes/create-trip";
const app = fastify();
app.register(cors, {});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.get("/teste", () => {
  return "Hello World, NLW";
});
app.register(createTrip);
app.listen({ port: 3333 }).then(() => {
  console.log("HTTP server running!");
});
