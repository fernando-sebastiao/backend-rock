import { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { ClientError } from "./src/error/client-error";
type FastifyErrorHandler = FastifyInstance["errorHandler"];
export const errorHandler: FastifyErrorHandler = (error, request, replay) => {
  console.log(error);
  if (error instanceof ZodError) {
    return replay.status(400).send({
      message: "invalid input",
      errors: error.errors.map((err) => ({
        field: err.path[0],
        message: err.message,
      })),
    });
  }
  if (error instanceof ClientError) {
    return replay.status(400).send({ message: error.message });
  }

  return replay.status(500).send({ message: "Internal Server Error" });
};
