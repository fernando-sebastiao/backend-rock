import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

dayjs.locale("pt-br");

dayjs.extend(localizedFormat);

export async function Activity(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/:tripId/activities",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (request) => {
      const { tripId } = request.params;

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
        include: {
          activities: true,
        },
      });
      if (!trip) {
        throw new Error("Trip not found");
      }
      if (
        dayjs(accours_at).isBefore(trip.starts_at) ||
        dayjs(accours_at).isAfter(trip.ends_at)
      ) {
        throw new Error("Invalid activity date!");
      }
      const activity = await prisma.activity.create({
        data: {
          title,
          accours_at,
          trip_id: tripId,
        },
      });
      return { activity: activity.id };
    }
  );
}
