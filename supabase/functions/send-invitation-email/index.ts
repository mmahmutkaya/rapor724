// Supabase Edge Function — Resend API ile davetiye e-postası gönderir
// Deploy: supabase functions deploy send-invitation-email
// Secret:  supabase secrets set RESEND_API_KEY=<key> SITE_URL=https://rapor724.vercel.app

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, firmaName, inviteToken, proposedName } = await req.json()

    const baseUrl    = Deno.env.get('SITE_URL')      ?? 'https://rapor724.vercel.app'
    const resendKey  = Deno.env.get('RESEND_API_KEY') ?? ''
    const fromEmail  = Deno.env.get('FROM_EMAIL')     ?? 'noreply@rapor724.com'

    const inviteUrl  = `${baseUrl}/davet?token=${inviteToken}`
    const greeting   = proposedName ? `Merhaba ${proposedName},` : 'Merhaba,'

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
          Bu bağlantı yalnızca <strong>${to}</strong> adresine gönderilmiştir.
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
        from: `Rapor7/24 <${fromEmail}>`,
        to: [to],
        subject: `${firmaName} — Kadro Davetiyesi`,
        html,
      }),
    })

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: res.ok ? 200 : 400,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
