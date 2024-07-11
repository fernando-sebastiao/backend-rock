import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import z from "zod";
import { env } from "../env";
import { ClientError } from "../error/client-error";
import { getMailClient } from "../lib/mail";
import { prisma } from "../lib/prisma";

dayjs.locale("pt-br");

dayjs.extend(localizedFormat);

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/:tripId/invites",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          email: z.string().email("Invalid email"),
        }),
      },
    },
    async (request) => {
      const { tripId } = request.params;
      const { email } = request.body;

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
      });
      if (!trip) {
        throw new ClientError("Trip not found");
      }

      const participant = await prisma.pacticipant.create({
        data: {
          email,
          trip_id: tripId,
        },
      });

      const formateStartDate = dayjs(trip.starts_at).format("LL");
      const formateEndDate = dayjs(trip.ends_at).format("LL");

      const mail = await getMailClient();

      const confirmatioLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`;

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
<a href="${confirmatioLink}">Confirmar viagem</a>
</p>
<p>Caso você não siaba do que se trata este e-mail, apenas ignore o e-mail</p>
</div>
`.trim(),
      });

      console.log(nodemailer.getTestMessageUrl(message));

      return { participantId: participant.id };
    }
  );
}
