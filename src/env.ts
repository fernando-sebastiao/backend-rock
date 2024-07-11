import dotenv from "dotenv";
import z from "zod";

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_BASE_URL: z.string().url(),
  WEB_BASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3333),
});

export const env = envSchema.parse(process.env);
