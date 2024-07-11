import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { ClientError } from "../error/client-error";
import { prisma } from "../lib/prisma";

dayjs.locale("pt-br");

dayjs.extend(localizedFormat);

export async function getParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/participant/:participantId",
    {
      schema: {
        params: z.object({
          participantId: z.string().uuid(),
        }),
      },
    },
    async (request) => {
      const { participantId } = request.params;

      const participant = await prisma.pacticipant.findUnique({
        where: {
          id: participantId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          is_confirmed: true,
        },
      });
      if (!participant) {
        throw new ClientError("participant not found");
      }

      return { participant };
    }
  );
}
