import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://consultorio-dental-24jf5kuaw-edi-s-projects2.vercel.app'
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Campo requerido: email' })

  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' })

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  const gmailUser   = process.env.GMAIL_USER
  const gmailPass   = process.env.GMAIL_APP_PASSWORD

  if (!supabaseUrl || !serviceKey || !gmailUser || !gmailPass) {
    return res.status(500).json({ error: 'Configuración del servidor incompleta' })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const token = authHeader.replace('Bearer ', '')
  const { data: { user: caller }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !caller) return res.status(401).json({ error: 'Token inválido' })

  const { data: callerPerfil } = await supabase
    .from('perfiles').select('rol').eq('id', caller.id).single()
  if (callerPerfil?.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden enviar resets' })
  }

  try {
    const appUrl = `https://${req.headers['x-forwarded-host'] || req.headers.host}`
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email.trim(),
      options: { redirectTo: appUrl },
    })
    if (linkErr) throw new Error(`Link: ${linkErr.message}`)

    const resetUrl = linkData?.properties?.action_link
    if (!resetUrl) throw new Error('No se pudo generar el enlace de restablecimiento')

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    })

    await transporter.sendMail({
      from: `DentalCare Pro <${gmailUser}>`,
      to: email.trim(),
      subject: 'Restablecer contraseña — DentalCare Pro',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff">
          <h2 style="color:#0D9488;margin:0 0 4px;font-size:22px">DentalCare Pro</h2>
          <p style="color:#6B7280;margin:0 0 24px;font-size:13px">Sistema de gestión dental · Santa Cruz, Bolivia</p>
          <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 24px">
            Haz clic en el botón para restablecer tu contraseña de acceso al sistema:
          </p>
          <div style="text-align:center;margin:0 0 32px">
            <a href="${resetUrl}"
               style="background:#0D9488;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block">
              Restablecer mi contraseña
            </a>
          </div>
          <p style="color:#9CA3AF;font-size:12px;line-height:1.6;margin:0 0 4px">
            Si el botón no funciona, copia este enlace:
          </p>
          <p style="color:#0D9488;font-size:12px;word-break:break-all;margin:0 0 24px">
            <a href="${resetUrl}" style="color:#0D9488">${resetUrl}</a>
          </p>
          <hr style="border:none;border-top:1px solid #E5E7EB;margin:0 0 16px">
          <p style="color:#9CA3AF;font-size:11px;margin:0">
            Este enlace expira en 24 horas. Si no solicitaste este cambio, ignora este correo.
          </p>
        </div>
      `,
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Reset handler error:', err.message)
    return res.status(500).json({ error: err.message || 'Error desconocido' })
  }
}
