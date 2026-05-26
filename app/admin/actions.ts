'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const password = String(formData.get('password') ?? '')
  const adminPassword = process.env.ADMIN_PASSWORD

  if (adminPassword && password === adminPassword) {
    const jar = await cookies()
    jar.set('admin_auth', adminPassword, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/admin',
    })
  }

  redirect('/admin')
}

export async function logout(_: FormData) {
  const jar = await cookies()
  jar.delete('admin_auth')
  redirect('/admin')
}
