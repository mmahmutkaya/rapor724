// Supabase Edge Function — Magic Link emailini Resend ile Rapor7/24 markalı gönderir
// Deploy: supabase functions deploy send-magic-link
// Secret:  supabase secrets set RESEND_API_KEY=<key> SITE_URL=https://rapor724.vercel.app
//          SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key>

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()
    if (!email) throw new Error('Email gerekli')

    const siteUrl      = Deno.env.get('SITE_URL')                   ?? 'https://rapor724.vercel.app'
    const resendKey    = Deno.env.get('RESEND_API_KEY')              ?? ''
    const fromEmail    = Deno.env.get('FROM_EMAIL')                  ?? 'noreply@rapor724.com'
    const supabaseUrl  = Deno.env.get('SUPABASE_URL')                ?? ''
    const serviceKey   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')   ?? ''

    // Admin client ile magic link üret
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { data, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: siteUrl }
    })

    if (linkError) throw linkError

    const magicLink = data?.properties?.action_link
    if (!magicLink) throw new Error('Link üretilemedi')

    const html = `<!DOCTYPE html>
      <html><head><meta charset="utf-8" /></head><body>
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #3D4849; margin-bottom: 8px;">Rapor7/24 — Giriş Linki</h2>
        <p style="color: #555;">Merhaba,</p>
        <p style="color: #555;">
          Aşağıdaki butona tıklayarak şifre girmeden giriş yapabilirsiniz.<br/>
          Bu link <strong>yalnızca bir kez</strong> kullanılabilir ve <strong>1 saat</strong> geçerlidir.
        </p>
        <a href="${magicLink}"
          style="display:inline-block; background:#3D4849; color:#fff;
                 padding:12px 28px; border-radius:4px; text-decoration:none;
                 font-size:15px; margin:20px 0;">
          Giriş Yap
        </a>
        <p style="color:#aaa; font-size:12px; margin-top:32px;">
          Bu link yalnızca <strong>${email}</strong> adresine gönderilmiştir.
          Giriş yapmak istemediyseniz bu emaili yoksayın.
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
        to: [email],
        subject: 'Rapor7/24 — Giriş Linkiniz',
        html,
      }),
    })

    const resData = await res.json()

    return new Response(JSON.stringify(resData), {
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
