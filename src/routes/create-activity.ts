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

export async function createActivity(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/:tripId/activities",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          title: z
            .string()
            .min(4, { message: "Destination must have at least 4 characters" }),
          accours_at: z.coerce.date(),
        }),
      },
    },
    async (request) => {
      const { tripId } = request.params;
      const { title, accours_at } = request.body;

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
      });
      if (!trip) {
        throw new ClientError("Trip not found");
      }
      if (
        dayjs(accours_at).isBefore(trip.starts_at) ||
        dayjs(accours_at).isAfter(trip.ends_at)
      ) {
        throw new ClientError("Invalid activity date!");
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
