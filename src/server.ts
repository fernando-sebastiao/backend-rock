import fastify from "fastify";
import { createTrip } from "./routes/create-trip";

const app = fastify();

app.get("/teste", () => {
  return "Hello World, NLW";
});
app.register(createTrip);
app.listen({ port: 3333 }).then(() => {
  console.log("HTTP server running!");
});
