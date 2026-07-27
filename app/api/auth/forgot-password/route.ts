import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { RESEND_FROM, STUDIO_NAME } from '@/lib/server/studio-brand'

export const runtime = 'nodejs'

const SUCCESS_MESSAGE =
  'Если аккаунт с таким email существует, письмо отправлено. Проверьте входящие и папку «Спам».'
const MAX_REQUEST_BYTES = 1024
const IP_RATE_LIMIT = 5
const IP_RATE_WINDOW_SECONDS = 15 * 60
const EMAIL_RATE_LIMIT = 3
const EMAIL_RATE_WINDOW_SECONDS = 30 * 60

type SupabaseAdmin = ReturnType<typeof createClient>

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function getSiteOrigin(value: string) {
  try {
    const url = new URL(value)

    if (url.protocol !== 'https:') return null
    return url.origin
  } catch {
    return null
  }
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const firstForwardedIp = forwardedFor?.split(',')[0]?.trim()

  return (
    firstForwardedIp ||
    request.headers.get('x-real-ip')?.trim() ||
    'unknown'
  ).slice(0, 100)
}

function hashRateLimitValue(secret: string, kind: string, value: string) {
  return createHash('sha256')
    .update(`${secret}:${kind}:${value}`)
    .digest('hex')
}

async function readRequestBody(request: Request) {
  const contentLength = Number(request.headers.get('content-length') || '0')

  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return null
  }

  const rawBody = await request.text()

  if (
    rawBody.length === 0 ||
    Buffer.byteLength(rawBody, 'utf8') > MAX_REQUEST_BYTES
  ) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(rawBody)

    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? (parsed as { email?: unknown })
      : null
  } catch {
    return null
  }
}

async function claimRateLimit(
  supabaseAdmin: SupabaseAdmin,
  keyHash: string,
  limit: number,
  windowSeconds: number
) {
  const { data, error } = await supabaseAdmin.rpc(
    'claim_booking_email_rate_limit',
    {
      p_ip_hash: keyHash,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    } as never
  )

  if (error) throw error
  return data === true
}

export async function POST(request: Request) {
  try {
    const body = await readRequestBody(request)

    if (!body) {
      return NextResponse.json(
        { message: 'Некорректный запрос.' },
        { status: 400 }
      )
    }

    const email =
      typeof body.email === 'string'
        ? body.email.trim().toLowerCase()
        : ''

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: 'Введите корректный email.' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseSecretKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
    const resendApiKey = process.env.RESEND_API_KEY
    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
    const siteOrigin = configuredSiteUrl
      ? getSiteOrigin(configuredSiteUrl)
      : null

    if (
      !supabaseUrl ||
      !supabaseSecretKey ||
      !resendApiKey ||
      !siteOrigin
    ) {
      console.error('Forgot password: missing environment variables', {
        hasSupabaseUrl: Boolean(supabaseUrl),
        hasSupabaseSecretKey: Boolean(supabaseSecretKey),
        hasResendApiKey: Boolean(resendApiKey),
        hasValidSiteUrl: Boolean(siteOrigin),
      })

      return NextResponse.json(
        { message: 'Сервис восстановления пароля пока не настроен.' },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseSecretKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const rateLimitSecret =
      process.env.FORGOT_PASSWORD_RATE_LIMIT_SECRET || supabaseSecretKey
    const ipHash = hashRateLimitValue(
      rateLimitSecret,
      'forgot-password-ip',
      getClientIp(request)
    )
    const emailHash = hashRateLimitValue(
      rateLimitSecret,
      'forgot-password-email',
      email
    )

    const ipAllowed = await claimRateLimit(
      supabaseAdmin as unknown as SupabaseAdmin,
      ipHash,
      IP_RATE_LIMIT,
      IP_RATE_WINDOW_SECONDS
    )

    if (!ipAllowed) {
      return NextResponse.json({ message: SUCCESS_MESSAGE })
    }

    const emailAllowed = await claimRateLimit(
      supabaseAdmin as unknown as SupabaseAdmin,
      emailHash,
      EMAIL_RATE_LIMIT,
      EMAIL_RATE_WINDOW_SECONDS
    )

    if (!emailAllowed) {
      return NextResponse.json({ message: SUCCESS_MESSAGE })
    }

    const { data, error } =
      await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: {
          redirectTo: `${siteOrigin}/reset-password`,
        },
      })

    // Не сообщаем посетителю, существует ли такой аккаунт.
    if (error || !data.properties?.action_link) {
      console.warn(
        'Forgot password: recovery link was not generated',
        error?.message
      )

      return NextResponse.json({ message: SUCCESS_MESSAGE })
    }

    const safeEmail = escapeHtml(email)
    const recoveryLink = data.properties.action_link

    const resendResponse = await fetch(
      'https://api.resend.com/emails',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: RESEND_FROM,
          to: [email],
          subject:
            `Восстановление пароля | ${STUDIO_NAME}`,
          html: `
            <!doctype html>
            <html lang="ru">
              <body style="margin:0;background:#0B0908;font-family:Arial,sans-serif;color:#F7EFE6;">
                <div style="padding:32px 16px;">
                  <div style="max-width:560px;margin:0 auto;background:#171312;border:1px solid #4A382B;border-radius:24px;padding:32px;">
                    <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#D4A373;margin-bottom:18px;">
                      ${escapeHtml(STUDIO_NAME)}
                    </div>

                    <h1 style="font-size:30px;line-height:1.2;font-weight:400;margin:0 0 16px;color:#F7EFE6;">
                      Новый пароль
                    </h1>

                    <p style="font-size:16px;line-height:1.7;color:#CDBAA8;margin:0 0 12px;">
                      Мы получили запрос на восстановление пароля для ${safeEmail}.
                    </p>

                    <p style="font-size:16px;line-height:1.7;color:#CDBAA8;margin:0 0 28px;">
                      Нажмите кнопку ниже и придумайте новый пароль.
                    </p>

                    <a
                      href="${recoveryLink}"
                      style="display:inline-block;background:#D4A373;color:#0B0908;text-decoration:none;font-weight:700;text-transform:uppercase;letter-spacing:1.8px;font-size:13px;padding:16px 24px;border-radius:999px;"
                    >
                      Сменить пароль
                    </a>

                    <p style="font-size:13px;line-height:1.6;color:#8B7A6B;margin:28px 0 0;">
                      Если вы не запрашивали восстановление, просто проигнорируйте письмо.
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `,
        }),
      }
    )

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text()

      console.error(
        'Forgot password: Resend error',
        resendResponse.status,
        resendError
      )

      return NextResponse.json(
        {
          message:
            'Не удалось отправить письмо. Попробуйте ещё раз немного позже.',
        },
        { status: 502 }
      )
    }

    return NextResponse.json({ message: SUCCESS_MESSAGE })
  } catch (error) {
    console.error(
      'Forgot password: unexpected error',
      error
    )

    return NextResponse.json(
      {
        message:
          'Не удалось отправить письмо. Попробуйте ещё раз немного позже.',
      },
      { status: 500 }
    )
  }
}
