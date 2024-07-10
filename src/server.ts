import cors from "@fastify/cors";
import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { confirmParticipant } from "./routes/confirm-participant";
import { confirmTrip } from "./routes/confirm-trip";
import { createActivity } from "./routes/create-activity";
import { createInvite } from "./routes/create-invite";
import { createLink } from "./routes/create-link";
import { createTrip } from "./routes/create-trip";
import { getActivities } from "./routes/get-activity";
import { getLinks } from "./routes/get-links";
import { getParticipants } from "./routes/get-participants";
import { getParticipant } from "./routes/get-partipant";
import { getTripsDetails } from "./routes/get-trip-details";
import { updateTrip } from "./routes/update-trip";
const app = fastify();

app.register(cors, {
  origin: "*",
});

//rotas
app.register(confirmTrip);
app.register(confirmParticipant);
app.register(createTrip);
app.register(createActivity);
app.register(getActivities);
app.register(createLink);
app.register(getLinks);
app.register(getParticipants);
app.register(createInvite);
app.register(updateTrip);
app.register(getTripsDetails);
app.register(getParticipant);

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.get("/teste", () => {
  return "Hello World, NLW";
});
app.get("/", () => {
  return { hello: "server running on fastify 🐱‍🏍" };
});
app.listen({ port: 3333 }).then(() => {
  console.log("HTTP server running!");
});
