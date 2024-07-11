import "dayjs/locale/pt-br";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { env } from "../env";
import { ClientError } from "../error/client-error";
import { prisma } from "../lib/prisma";

export async function confirmParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/participants/:participantId/confirm",
    {
      schema: {
        params: z.object({
          participantId: z.string().uuid(),
        }),
      },
    },
    async (request, replay) => {
      const { participantId } = request.params;

      const participants = await prisma.pacticipant.findUnique({
        where: {
          id: participantId,
        },
      });

      if (!participants) {
        throw new ClientError("Participant not found");
      }
      if (participants.is_confirmed) {
        return replay.redirect(
          `${env.WEB_BASE_URL}/trips/${participants.trip_id}`
        );
      }

      await prisma.pacticipant.update({
        where: { id: participantId },
        data: { is_confirmed: true },
      });

      return replay.redirect(
        `${env.WEB_BASE_URL}/trips/${participants.trip_id}`
      );
    }
  );
}
//done
