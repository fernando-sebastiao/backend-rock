import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import z from "zod";
import { getMailClient } from "../lib/mail";
import { prisma } from "../lib/prisma";

dayjs.locale("pt-br");

dayjs.extend(localizedFormat);

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
          emails_to_invite: z.array(
            z.string().email({ message: "Invalid email" })
          ),
        }),
      },
    },
    async (request) => {
      const {
        destination,
        starts_at,
        ends_at,
        owner_name,
        owner_email,
        emails_to_invite,
      } = request.body as {
        destination: string;
        starts_at: Date;
        ends_at: Date;
        owner_name: string;
        owner_email: string;
        emails_to_invite: string[];
      };
      if (dayjs(starts_at).isBefore(new Date())) {
        throw new Error("Invalid trip start date");
      }
      if (dayjs(ends_at).isBefore(dayjs(starts_at))) {
        throw new Error("Invalid trip end date");
      }
      //criando a trip e o participante
      const trip = await prisma.trip.create({
        data: {
          destination,
          starts_at,
          ends_at,
          pacticipants: {
            createMany: {
              data: [
                {
                  name: owner_name,
                  email: owner_email,
                  is_owner: true,
                  is_confirmed: true,
                },
                ...emails_to_invite.map((email) => {
                  return { email };
                }),
              ],
            },
          },
        },
      });

      const formateStartDate = dayjs(starts_at).format("LL");
      const formateEndDate = dayjs(ends_at).format("LL");

      const confirmatioLink = `http://localhost:3333/trips/${trip.id}/confirm`;

      const mail = await getMailClient();

      const message = await mail.sendMail({
        from: {
          name: "Equipe plann.er",
          address: "oi@plann.er",
        },
        to: {
          name: owner_name,
          address: owner_email,
        },
        subject: `Confirme a sua viagem para ${destination} em ${formateStartDate}`,
        html: `
<div style="font-family: sans-serif; font-size: 16px;line-height: 1.6;">
<p></p>
<p> Você solicitou a criação de uma recolha para  ${destination} nas datas <strong> ${formateStartDate} a ${formateEndDate}</strong> </p>
<p>para confirmar a sua viagem clique no link à baixo</p>
<p>
<a href="${confirmatioLink}">Confirmar viagens</a>
</p>
<p>Caso você não siaba do que se trata este e-mail, apenas ignore o e-mail</p>
</div>
`.trim(),
      });
      console.log(nodemailer.getTestMessageUrl(message));
      return { trip: trip.id };
    }
  );
}
