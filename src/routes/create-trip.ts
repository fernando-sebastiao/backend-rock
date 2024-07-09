import dayjs from "dayjs";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips",
    {
      schema: {
        body: z.object({
          destination: z
            .string()
            .min(4, { message: "Destination must have at least 4 characters" }),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
          owner_name: z.string(),
          owner_email: z.string().email({ message: "Invalid email" }),
        }),
      },
    },
    async (request) => {
      const { destination, starts_at, ends_at, owner_name, owner_email } =
        request.body as {
          destination: string;
          starts_at: Date;
          ends_at: Date;
          owner_name: string;
          owner_email: string;
        };
      if (dayjs(starts_at).isBefore(new Date())) {
        throw new Error("Invalid trip start date");
      }
      if (dayjs(ends_at).isBefore(dayjs(starts_at))) {
        throw new Error("Invalid trip end date");
      }
      const trip = await prisma.trip.create({
        data: {
          destination,
          starts_at,
          ends_at,
        },
      });

      return { trip: trip.id };
    }
  );
}
