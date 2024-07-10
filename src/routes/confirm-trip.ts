import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import z from "zod";
import { getMailClient } from "../lib/mail";
import { prisma } from "../lib/prisma";

export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:tripId/confirm",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (request, replay) => {
      const { tripId } = request.params;

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
        include: {
          pacticipants: {
            where: {
              is_owner: false,
            },
          },
        },
      });

      if (!trip) {
        throw new Error("Trip not found");
      }
      if (trip.is_confirmed) {
        return replay.redirect(`http://localhost:3000/trips/${trip.id}`);
      }
      await prisma.trip.update({
        where: { id: tripId },
        data: { is_confirmed: true },
      });

      const formateStartDate = dayjs(trip.starts_at).format("LL");
      const formateEndDate = dayjs(trip.ends_at).format("LL");

      const mail = await getMailClient();

      await Promise.all(
        trip.pacticipants.map(async (participant) => {
          const confirmatioLink = `http://localhost:3333/participants/${participant.id}/confirm`;
          const message = await mail.sendMail({
            from: {
              name: "Equipe plann.er",
              address: "oi@plann.er",
            },
            to: participant.email,
            subject: `Confirme a sua presença na viagem para ${trip.destination} em ${formateStartDate}`,
            html: `
    <div style="font-family: sans-serif; font-size: 16px;line-height: 1.6;">
    <p></p>
    <p> Você foi  convidado para participar de uma viagem para  ${trip.destination} nas datas <strong> ${formateStartDate} a ${formateEndDate}</strong> </p>
    <p>Para confirmar a sua presença na viagem, clique ao link abaixo</p>
    <p>
    <a href="${confirmatioLink}">Confirmar viagens</a>
    </p>
    <p>Caso você não siaba do que se trata este e-mail, apenas ignore o e-mail</p>
    </div>
    `.trim(),
          });
          console.log(nodemailer.getTestMessageUrl(message));
        })
      );

      return replay.redirect(`http://localhost:3000/trips/${tripId}`);
    }
  );
}
