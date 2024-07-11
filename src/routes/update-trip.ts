import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { ClientError } from "../error/client-error";
import { prisma } from "../lib/prisma";

export async function updateTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/trips/:tripId",
    {
      schema: {
        body: z.object({
          destination: z
            .string()
            .min(4, { message: "Destination must have at least 4 characters" }),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
        }),
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (request, replay) => {
      const { tripId } = request.params;
      const { destination, ends_at, starts_at } = request.body;
      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
      });
      if (!trip) {
        throw new ClientError("Trip not found");
      }
      if (dayjs(starts_at).isBefore(new Date())) {
        throw new ClientError("Invalid trip start date");
      }
      if (dayjs(ends_at).isBefore(dayjs(starts_at))) {
        throw new ClientError("Invalid trip end date");
      }

      await prisma.trip.update({
        where: { id: tripId },
        data: {
          destination,
          ends_at,
          starts_at,
        },
      });

      return { tripId: trip.id };
    }
  );
}
