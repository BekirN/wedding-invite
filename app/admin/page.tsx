import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { login, logout } from './actions'

function getPrisma() {
  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    process.env.wedding_PRISMA_DATABASE_URL ??
    process.env.wedding_DATABASE_URL ??
    process.env.wedding_POSTGRES_URL
  if (!url) throw new Error('DATABASE_URL nije postavljen')
  return new PrismaClient({ adapter: new PrismaPg(url) })
}

export default async function AdminPage() {
  const jar = await cookies()
  const isAuthed =
    !!process.env.ADMIN_PASSWORD &&
    jar.get('admin_auth')?.value === process.env.ADMIN_PASSWORD

  if (!isAuthed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
          <p className="text-center text-[10px] uppercase tracking-[0.5em] text-[#7A5535]">
            Numan &amp; Mirela
          </p>
          <h1 className="mt-2 text-center text-[22px] font-semibold text-gray-900">Admin pristup</h1>
          <form action={login} className="mt-7 space-y-3">
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Unesite šifru"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-gray-900 outline-none focus:border-[#7A5535]"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-[#7A5535] py-3 text-[11px] font-medium uppercase tracking-[0.3em] text-white transition hover:bg-[#6a4729]"
            >
              Uđi
            </button>
          </form>
        </div>
      </div>
    )
  }

  const prisma = getPrisma()
  const guests = await prisma.guest.findMany({ orderBy: { answeredAt: 'desc' } })
  await prisma.$disconnect()

  const attending = guests.filter((g) => g.attending === true)
  const notAttending = guests.filter((g) => g.attending === false)
  const totalGuests = attending.reduce((sum, g) => sum + 1 + g.plusOnes, 0)

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.5em] text-[#7A5535]">Numan &amp; Mirela · 16. avg 2026.</p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900">Lista gostiju</h1>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-[13px] text-gray-500 transition hover:bg-gray-100"
            >
              Odjava
            </button>
          </form>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-widest text-gray-400">Dolaze</p>
            <p className="mt-1 text-3xl font-bold text-green-600">{attending.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-widest text-gray-400">Ne dolaze</p>
            <p className="mt-1 text-3xl font-bold text-red-500">{notAttending.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-widest text-gray-400">Ukupno gostiju</p>
            <p className="mt-1 text-3xl font-bold text-[#7A5535]">{totalGuests}</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {guests.length === 0 ? (
            <div className="py-20 text-center text-[14px] text-gray-400">
              Još nema potvrđenih dolazaka.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-gray-400">Ime</th>
                    <th className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-gray-400">Dolazak</th>
                    <th className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-gray-400">Gostiju</th>
                    <th className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-gray-400">Poruka</th>
                    <th className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-gray-400">Datum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {guests.map((g) => (
                    <tr key={g.id} className="transition hover:bg-gray-50">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{g.name}</td>
                      <td className="px-5 py-3.5">
                        {g.attending ? (
                          <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-medium text-green-700">
                            ✓ Dolazi
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-medium text-red-600">
                            ✗ Ne dolazi
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {g.attending ? 1 + g.plusOnes : '—'}
                      </td>
                      <td className="max-w-[240px] truncate px-5 py-3.5 text-gray-400">
                        {g.message || '—'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-[12px] text-gray-400">
                        {g.answeredAt
                          ? g.answeredAt.toLocaleDateString('sr-Latn-RS', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] text-gray-300">
          Stranica je vidljiva samo vama — čuvajte link i šifru.
        </p>
      </div>
    </div>
  )
}
