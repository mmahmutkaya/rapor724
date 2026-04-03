// Supabase Edge Function — doğrudan çağrı VEYA firma_members INSERT webhook ile tetiklenir
// Deploy: npx supabase functions deploy firma-kadro-invite --no-verify-jwt

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const body = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    let email: string
    let firmaId: string
    let memberName: string
    let origin: string | null = null

    // ── Çağrı türünü belirle ─────────────────────────────
    // Webhook: { record: { ... } }
    // Doğrudan: { invite_token, name, origin }
    if (body?.record) {
      // DB webhook
      const record = body.record
      if (!record?.email || !record?.invite_token) {
        return new Response('skip', { status: 200 })
      }
      email     = record.email
      firmaId   = record.firma_id
      memberName = record.name ?? ''
      origin    = null // webhook'ta origin bilinmez → SITE_URL kullanılır
    } else {
      // Doğrudan frontend çağrısı
      const { invite_token, name, origin: clientOrigin } = body
      if (!invite_token) return new Response('missing invite_token', { status: 400 })

      const { data: member, error } = await supabase
        .from('firma_members')
        .select('email, firma_id, name')
        .eq('invite_token', invite_token)
        .single()

      if (error || !member) return new Response('member not found', { status: 404 })

      email      = member.email
      firmaId    = member.firma_id
      memberName = name ?? member.name ?? ''
      origin     = clientOrigin ?? null
    }

    // ── Firma adını çek ──────────────────────────────────
    const { data: firma } = await supabase
      .from('firms')
      .select('name')
      .eq('id', firmaId)
      .single()

    const firmaName  = firma?.name ?? 'Firma'
    const baseUrl    = origin ?? Deno.env.get('SITE_URL') ?? 'https://rapor724.vercel.app'
    const resendKey  = Deno.env.get('RESEND_API_KEY') ?? ''
    const fromEmail  = Deno.env.get('FROM_EMAIL')     ?? 'noreply@rapor724.com'

    // Davetten dönen invite_token'ı bul (webhook'ta record'dan, doğrudan'da body'den)
    const inviteToken = body?.record?.invite_token ?? body?.invite_token
    const inviteUrl   = `${baseUrl}/davet?token=${inviteToken}`
    const greeting    = memberName ? `Merhaba ${memberName},` : 'Merhaba,'

    const html = `<!DOCTYPE html>
      <html><head><meta charset="utf-8" /></head><body>
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1565c0; margin-bottom: 8px;">${firmaName} — Kadro Davetiyesi</h2>
        <p style="color: #555;">${greeting}</p>
        <p style="color: #555;">
          <strong>${firmaName}</strong> firması sizi kadrosuna davet ediyor.
          Aşağıdaki butona tıklayarak sisteme üye olabilir veya giriş yapabilirsiniz.
        </p>
        <a href="${inviteUrl}"
          style="display:inline-block; background:#1565c0; color:#fff;
                 padding:12px 28px; border-radius:6px; text-decoration:none;
                 font-size:15px; margin:20px 0;">
          Daveti Kabul Et
        </a>
        <p style="color:#aaa; font-size:12px; margin-top:32px;">
          Bu bağlantı yalnızca <strong>${email}</strong> adresine gönderilmiştir.
          Başkasıyla paylaşmayınız.
        </p>
      </div></body></html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${firmaName} <${fromEmail}>`,
        to: [email],
        subject: `${firmaName} — Kadro Davetiyesi`,
        html,
      }),
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: res.ok ? 200 : 400,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
