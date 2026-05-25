import 'dotenv/config'
import { defineConfig } from 'prisma/config'

const dbUrl =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL ??
  process.env.wedding_PRISMA_DATABASE_URL ??
  process.env.wedding_DATABASE_URL ??
  process.env.wedding_POSTGRES_URL

export default defineConfig({
  datasource: {
    url: dbUrl!,
  },
})
