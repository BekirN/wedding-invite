import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function getPrismaClient() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  const connectionString =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    process.env.wedding_PRISMA_DATABASE_URL ??
    process.env.wedding_DATABASE_URL ??
    process.env.wedding_POSTGRES_URL

  if (!connectionString) {
    throw new Error("Database connection string is not configured")
  }

  const client = new PrismaClient({ adapter: new PrismaPg(connectionString) })

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client
  }

  return client
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = typeof body?.name === "string" ? body.name.trim() : ""
    const attending = typeof body?.attending === "boolean" ? body.attending : null
    const plusOnes = Number.isInteger(body?.plusOnes) ? Math.max(0, Math.min(5, body.plusOnes)) : 0
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, 700) : null

    if (!name || attending === null) {
      return NextResponse.json({ error: "Nedostaju podaci" }, { status: 400 })
    }

    const prisma = getPrismaClient()

    await prisma.guest.create({
      data: {
        token: `${Date.now().toString(36)}-${crypto.randomUUID()}`,
        name,
        attending,
        plusOnes,
        message: message || null,
        answeredAt: new Date(),
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server greska" }, { status: 500 })
  }
}
