import { FastifyInstance } from "fastify";

type FastifyErrorHandler = FastifyInstance["errorHandler"];
export const errorHandler: FastifyErrorHandler = (error, request, replay) => {
  console.log(error);

  return replay.status(500).send({ message: "Internal Server Error" });
};
