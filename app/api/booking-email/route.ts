import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  RESEND_FROM,
  STUDIO_ADDRESS,
  STUDIO_NAME,
  STUDIO_SITE_URL,
} from '@/lib/server/studio-brand'

const MAX_REQUEST_BYTES = 1024
const RATE_LIMIT_MAX_REQUESTS = 10
const RATE_LIMIT_WINDOW_SECONDS = 10 * 60

type BookingBody = Record<string, unknown>
type Language = 'uk' | 'pl'
type BookingKind = 'photoshoot' | 'rental'

type BookingEmailRequest = {
  bookingType?: unknown
  bookingId?: unknown
  orderId?: unknown
}

type SupabaseAdmin = ReturnType<typeof createClient>

function plainText(value: unknown, fallback: string): string {
  const text =
    value === null || value === undefined || String(value).trim() === ''
      ? fallback
      : String(value).trim()

  return text.replace(/[\r\n\t]+/g, ' ').slice(0, 500)
}

function escapeHtml(value: unknown, fallback: string): string {
  return plainText(value, fallback)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function getLanguage(body: BookingBody): Language {
  const value = plainText(
    body.lang ?? body.language ?? body.locale,
    'uk'
  ).toLowerCase()

  return value.startsWith('pl') ? 'pl' : 'uk'
}

function formatBookingDate(value: unknown, language: Language): string {
  const raw = plainText(
    value,
    language === 'pl' ? 'Data nie została podana' : 'Дата не вказана'
  )

  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (!match) {
    return escapeHtml(raw, raw)
  }

  const [, year, month, day] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))

  return new Intl.DateTimeFormat(language === 'pl' ? 'pl-PL' : 'uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function formatPrice(value: unknown, language: Language): string {
  if (value === null || value === undefined || String(value).trim() === '') {
    return language === 'pl' ? 'Cena nie została podana' : 'Ціна не вказана'
  }

  const text = plainText(value, '')

  if (/[A-Za-zА-Яа-яІіЇїЄє₴€$]|zł/i.test(text)) {
    return escapeHtml(text, text)
  }

  return `${escapeHtml(text, text)} zł`
}

function getDuration(body: BookingBody, language: Language): string {
  const value =
    body.duration ??
    body.bookingDuration ??
    body.rentalDuration ??
    body.durationHours

  if (value === null || value === undefined || String(value).trim() === '') {
    return language === 'pl' ? 'Nie podano' : 'Не вказано'
  }

  const text = plainText(value, '')

  if (/^\d+(?:[.,]\d+)?$/.test(text)) {
    return language === 'pl'
      ? `${escapeHtml(text, text)} godz.`
      : `${escapeHtml(text, text)} год.`
  }

  return escapeHtml(text, text)
}

function isRentalBooking(body: BookingBody): boolean {
  const rawType = [
    body.bookingType,
    body.bookingKind,
    body.serviceType,
    body.rentalResource,
    body.resourceName,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return (
    Boolean(body.rentalResource) ||
    rawType.includes('rent') ||
    rawType.includes('rental') ||
    rawType.includes('wynajem') ||
    rawType.includes('оренд') ||
    rawType.includes('аренд')
  )
}

function getBookingType(body: BookingBody, language: Language): string {
  if (isRentalBooking(body)) {
    return language === 'pl' ? 'Wynajem studia' : 'Оренда студії'
  }

  return language === 'pl' ? 'Sesja zdjęciowa' : 'Фотосесія'
}

function buildPackageName(body: BookingBody, language: Language): string {
  const values = isRentalBooking(body)
    ? [
        body.rentalResource,
        body.resourceName,
        body.packageTitle,
        body.packageName,
      ]
    : [
        body.packageTitle,
        body.packageName,
        body.selectedAddons,
        body.interiorName,
        body.photographerName,
      ]

  const uniqueValues = Array.from(
    new Set(
      values
        .filter(
          (value) =>
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ''
        )
        .map((value) => plainText(value, ''))
    )
  )

  if (uniqueValues.length === 0) {
    if (isRentalBooking(body)) {
      return language === 'pl' ? 'Wynajem studia' : 'Оренда студії'
    }

    return language === 'pl' ? 'Pakiet nie został wybrany' : 'Пакет не вибрано'
  }

  return escapeHtml(uniqueValues.join(' · '), uniqueValues.join(' · '))
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

async function sendResendEmail(
  apiKey: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  return {
    ok: response.ok,
    status: response.status,
    data,
  }
}

function getClientCopy(language: Language, clientName: string) {
  if (language === 'pl') {
    return {
      subject: `Otrzymaliśmy Twoją rezerwację · ${STUDIO_NAME}`,
      variables: {
        PREVIEW_TEXT: `Otrzymaliśmy Twoją rezerwację w ${STUDIO_NAME}`,
        STATUS_LABEL: 'Status',
        STATUS_TEXT: 'Oczekuje na potwierdzenie',
        TITLE: 'Dziękujemy za rezerwację',
        GREETING: `Dzień dobry, ${clientName}!`,
        INTRO:
          'Otrzymaliśmy Twoje zgłoszenie i sprawdzimy dostępność wybranego terminu.',
        DURATION_LABEL: 'Czas trwania',
        PACKAGE_LABEL: 'Pakiet',
        PRICE_LABEL: 'Cena',
        NEXT_TITLE: 'Co dalej?',
        NEXT_TEXT:
          'Sprawdzimy rezerwację i skontaktujemy się z Tobą. Rezerwacja zostanie potwierdzona po naszej odpowiedzi.',
        ADDRESS_LABEL: 'Adres studia',
        BUTTON_TEXT: 'Przejdź na stronę',
        FOOTER_TEXT:
          'Aby zmienić szczegóły rezerwacji, po prostu odpowiedz na tę wiadomość.',
      },
    }
  }

  return {
    subject: `Ми отримали ваше бронювання · ${STUDIO_NAME}`,
    variables: {
      PREVIEW_TEXT: `Ми отримали ваше бронювання в ${STUDIO_NAME}`,
      STATUS_LABEL: 'Статус',
      STATUS_TEXT: 'Очікує підтвердження',
      TITLE: 'Дякуємо за бронювання',
      GREETING: `Вітаємо, ${clientName}!`,
      INTRO:
        'Ми отримали вашу заявку та перевіримо доступність обраного часу.',
      DURATION_LABEL: 'Тривалість',
      PACKAGE_LABEL: 'Пакет',
      PRICE_LABEL: 'Вартість',
      NEXT_TITLE: 'Що далі?',
      NEXT_TEXT:
        'Ми перевіримо бронювання та зв’яжемося з вами. Заявка стане підтвердженою після нашої відповіді.',
      ADDRESS_LABEL: 'Адреса студії',
      BUTTON_TEXT: 'Перейти на сайт',
      FOOTER_TEXT:
        'Якщо потрібно змінити деталі бронювання, просто дайте відповідь на цей лист.',
    },
  }
}

function emailDetailRow(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 12px 8px 0;color:#8a6f5e;font-size:13px;vertical-align:top">${label}</td>
    <td style="padding:8px 0;color:#2b1a12;font-size:14px;font-weight:600;vertical-align:top">${value}</td>
  </tr>`
}

function emailShell(input: {
  language: Language
  preview: string
  title: string
  greeting: string
  intro: string
  rows: string
  nextTitle?: string
  nextText?: string
  footer: string
}) {
  const nextBlock = input.nextText
    ? `<div style="margin-top:22px;padding:18px 20px;border-radius:18px;background:#f7eee8">
        ${input.nextTitle ? `<strong>${input.nextTitle}</strong>` : ''}
        <p style="margin:8px 0 0;color:#6e5748;font-size:14px;line-height:1.6">${input.nextText}</p>
      </div>`
    : ''
  const addressBlock = STUDIO_ADDRESS
    ? `<p style="margin:20px 0 0;color:#6e5748;font-size:14px;line-height:1.6">${escapeHtml(STUDIO_ADDRESS, '')}</p>`
    : ''

  return `<!doctype html>
  <html lang="${input.language}">
    <body style="margin:0;background:#f7f1ea;color:#2b1a12;font-family:Arial,sans-serif">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0">${input.preview}</div>
      <div style="max-width:640px;margin:0 auto;padding:32px 18px">
        <div style="background:#fff;border:1px solid #e5d5c8;border-radius:28px;padding:32px">
          <p style="margin:0 0 22px;color:#a67c52;font-size:12px;letter-spacing:3px;text-transform:uppercase">${escapeHtml(STUDIO_NAME, 'OneStudio OS')}</p>
          <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:30px;font-weight:400">${input.title}</h1>
          <p style="margin:0 0 10px;font-size:17px;font-weight:700">${input.greeting}</p>
          <p style="margin:0 0 22px;color:#6e5748;font-size:15px;line-height:1.7">${input.intro}</p>
          <table style="width:100%;border-collapse:collapse;border-top:1px solid #eadfd5;border-bottom:1px solid #eadfd5">${input.rows}</table>
          ${nextBlock}
          ${addressBlock}
          <a href="${escapeHtml(STUDIO_SITE_URL, '')}" style="display:inline-block;margin-top:20px;border-radius:999px;background:#2b1a12;color:#fff7ef;padding:13px 22px;text-decoration:none;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px">${input.language === 'pl' ? 'Przejdź na stronę' : 'Перейти на сайт'}</a>
          <p style="margin:24px 0 0;color:#9a8374;font-size:12px;line-height:1.6">${input.footer}</p>
        </div>
      </div>
    </body>
  </html>`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

function isRentalOrderId(value: string): boolean {
  return isUuid(value) || /^rental-[0-9]{10,16}-[0-9a-f]{4,32}$/i.test(value)
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const firstForwardedIp = forwardedFor?.split(',')[0]?.trim()

  return (
    firstForwardedIp ||
    request.headers.get('x-real-ip')?.trim() ||
    'unknown'
  ).slice(0, 100)
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function readBookingEmailRequest(
  request: Request
): Promise<BookingEmailRequest | null> {
  const contentLength = Number(request.headers.get('content-length') || '0')

  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return null
  }

  const rawBody = await request.text()

  if (
    rawBody.length === 0 ||
    new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES
  ) {
    return null
  }

  const parsed: unknown = JSON.parse(rawBody)
  return isRecord(parsed) ? parsed : null
}

function getBookingReference(input: BookingEmailRequest):
  | { kind: BookingKind; reference: string }
  | null {
  const bookingType = plainText(input.bookingType, '').toLowerCase()

  if (bookingType === 'photoshoot') {
    const bookingId = plainText(input.bookingId, '')
    return isUuid(bookingId)
      ? { kind: 'photoshoot', reference: bookingId }
      : null
  }

  if (bookingType === 'rental') {
    const orderId = plainText(input.orderId, '')
    return isRentalOrderId(orderId)
      ? { kind: 'rental', reference: orderId }
      : null
  }

  return null
}

function toNumber(value: unknown): number {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function shortTime(value: unknown): string {
  return plainText(value, '').slice(0, 5)
}

function getAddonText(value: unknown, language: Language, currency: string) {
  if (!Array.isArray(value)) return ''

  return value
    .filter(isRecord)
    .map((addon) => {
      const title = plainText(
        addon.title ??
          (language === 'pl' ? addon.title_pl : addon.title_uk),
        ''
      )
      const price = toNumber(addon.price)

      if (!title) return ''
      return price > 0 ? `${title} (+${price} ${currency})` : title
    })
    .filter(Boolean)
    .join(', ')
}

async function loadPhotoshootBooking(
  supabaseAdmin: SupabaseAdmin,
  bookingId: string
): Promise<BookingBody | null> {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select(
      'id, package_id, interior_id, photographer_id, booking_date, booking_time, total_price, total_amount, notes, client_name, client_phone, client_email, duration_hours, end_time, selected_addons, language, currency'
    )
    .eq('id', bookingId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const booking = data as Record<string, unknown>
  const language: Language = booking.language === 'pl' ? 'pl' : 'uk'

  const [packageResult, interiorResult, photographerResult] = await Promise.all([
    booking.package_id
      ? supabaseAdmin
          .from('packages')
          .select('title')
          .eq('id', String(booking.package_id))
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    booking.interior_id
      ? supabaseAdmin
          .from('interiors')
          .select('name')
          .eq('id', String(booking.interior_id))
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    booking.photographer_id
      ? supabaseAdmin
          .from('team')
          .select('name')
          .eq('id', String(booking.photographer_id))
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ])

  if (packageResult.error) throw packageResult.error
  if (interiorResult.error) throw interiorResult.error
  if (photographerResult.error) throw photographerResult.error

  const packageData = packageResult.data as Record<string, unknown> | null
  const interiorData = interiorResult.data as Record<string, unknown> | null
  const photographerData = photographerResult.data as Record<string, unknown> | null
  const currency = plainText(booking.currency, 'PLN')

  return {
    bookingKind: 'photoshoot',
    clientName: booking.client_name,
    clientPhone: booking.client_phone,
    clientEmail: booking.client_email,
    lang: language,
    bookingDate: booking.booking_date,
    bookingTime: shortTime(booking.booking_time),
    endTime: shortTime(booking.end_time),
    durationHours: booking.duration_hours,
    packageTitle: packageData?.title,
    interiorName: interiorData?.name,
    photographerName: photographerData?.name,
    totalPrice: booking.total_amount ?? booking.total_price,
    selectedAddons: getAddonText(
      booking.selected_addons,
      language,
      currency
    ),
    notes: booking.notes,
  }
}

function getRentalResourceTitle(value: unknown, language: Language): string {
  const resource = plainText(value, '').toLowerCase()

  if (resource === 'studio') {
    return language === 'pl' ? 'Sala / Studio' : 'Зал / Studio'
  }

  if (resource === 'makeup') return 'Make-up room'
  return plainText(value, language === 'pl' ? 'Przestrzeń' : 'Простір')
}

async function loadRentalBooking(
  supabaseAdmin: SupabaseAdmin,
  orderId: string
): Promise<BookingBody | null> {
  const { data, error } = await supabaseAdmin
    .from('studio_bookings')
    .select(
      'id, rental_order_id, client_name, client_phone, client_email, language, booking_date, booking_time, end_time, duration_hours, rental_resource, total_price, notes'
    )
    .eq('rental_order_id', orderId)
    .order('booking_time', { ascending: true })

  if (error) throw error

  const rows = (data || []) as Array<Record<string, unknown>>
  if (rows.length === 0) return null

  const first = rows[0]
  const language: Language = first.language === 'pl' ? 'pl' : 'uk'
  const itemLines = rows.map((row) => {
    const resourceTitle = getRentalResourceTitle(row.rental_resource, language)
    const duration = toNumber(row.duration_hours)
    const durationLabel =
      language === 'pl' ? `${duration} godz.` : `${duration} год.`
    const total = toNumber(row.total_price)

    return `${resourceTitle}: ${shortTime(row.booking_time)}–${shortTime(
      row.end_time
    )}, ${durationLabel}, ${total} zł`
  })
  const resources = rows
    .map((row) => getRentalResourceTitle(row.rental_resource, language))
    .join(' + ')

  return {
    bookingKind: 'rental',
    clientName: first.client_name,
    clientPhone: first.client_phone,
    clientEmail: first.client_email,
    lang: language,
    bookingDate: first.booking_date,
    bookingTime: itemLines.join(' | '),
    duration: rows
      .map((row) =>
        language === 'pl'
          ? `${toNumber(row.duration_hours)} godz.`
          : `${toNumber(row.duration_hours)} год.`
      )
      .join(' + '),
    packageTitle: `${
      language === 'pl' ? 'Wynajem studia' : 'Оренда студії'
    }: ${resources}`,
    totalPrice: rows.reduce(
      (sum, row) => sum + toNumber(row.total_price),
      0
    ),
    notes: first.notes,
  }
}

async function claimRateLimit(
  supabaseAdmin: SupabaseAdmin,
  ipHash: string
): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc(
    'claim_booking_email_rate_limit',
    {
      p_ip_hash: ipHash,
      p_limit: RATE_LIMIT_MAX_REQUESTS,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
    } as never
  )

  if (error) throw error
  return data === true
}

async function claimEmailDispatch(
  supabaseAdmin: SupabaseAdmin,
  kind: BookingKind,
  reference: string
): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc(
    'claim_booking_email_dispatch',
    {
      p_booking_kind: kind,
      p_booking_reference: reference,
    } as never
  )

  if (error) throw error
  return data === true
}

export async function POST(request: Request) {
  let supabaseAdmin: SupabaseAdmin | null = null
  let dispatchKind: BookingKind | null = null
  let dispatchReference = ''

  try {
    const apiKey = process.env.RESEND_API_KEY
    const studioEmail = process.env.STUDIO_EMAIL
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!apiKey || !studioEmail || !supabaseUrl || !serviceRoleKey) {
      console.error('Booking email route is missing server configuration')

      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 }
      )
    }

    const input = await readBookingEmailRequest(request).catch(() => null)

    if (!input) {
      return NextResponse.json(
        { error: 'Invalid or oversized request body' },
        { status: 413 }
      )
    }

    const bookingReference = getBookingReference(input)

    if (!bookingReference) {
      return NextResponse.json(
        { error: 'Invalid booking reference' },
        { status: 400 }
      )
    }

    dispatchKind = bookingReference.kind
    dispatchReference = bookingReference.reference
    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const rateLimitSalt =
      process.env.BOOKING_EMAIL_RATE_LIMIT_SECRET || serviceRoleKey
    const ipHash = await sha256(`${rateLimitSalt}:${getClientIp(request)}`)
    const rateLimitAllowed = await claimRateLimit(supabaseAdmin, ipHash)

    if (!rateLimitAllowed) {
      return NextResponse.json(
        { error: 'Too many email requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(RATE_LIMIT_WINDOW_SECONDS) },
        }
      )
    }

    const body =
      dispatchKind === 'photoshoot'
        ? await loadPhotoshootBooking(supabaseAdmin, dispatchReference)
        : await loadRentalBooking(supabaseAdmin, dispatchReference)

    if (!body) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    const dispatchClaimed = await claimEmailDispatch(
      supabaseAdmin,
      dispatchKind,
      dispatchReference
    )

    if (!dispatchClaimed) {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
      })
    }

    const language = getLanguage(body)

    const clientNamePlain = plainText(
      body.clientName,
      language === 'pl' ? 'Kliencie' : 'Клієнте'
    )
    const clientName = escapeHtml(clientNamePlain, clientNamePlain)
    const clientPhone = escapeHtml(
      body.clientPhone,
      language === 'pl' ? 'Nie podano telefonu' : 'Телефон не вказано'
    )
    const clientEmailPlain = plainText(body.clientEmail, '')
    const clientEmail = escapeHtml(
      clientEmailPlain,
      language === 'pl' ? 'Nie podano adresu email' : 'Email не вказано'
    )
    const bookingDate = formatBookingDate(body.bookingDate, language)
    const bookingTime = escapeHtml(
      body.bookingTime,
      language === 'pl' ? 'Nie podano godziny' : 'Час не вказано'
    )
    const bookingType = getBookingType(body, language)
    const packageName = buildPackageName(body, language)
    const duration = getDuration(body, language)
    const price = formatPrice(body.totalPrice ?? body.price, language)
    const comment = escapeHtml(
      body.notes ?? body.comment,
      language === 'pl' ? 'Brak komentarza' : 'Коментар не залишено'
    )

    const recipients = studioEmail
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean)

    const adminResult = await sendResendEmail(apiKey, {
      from: RESEND_FROM,
      to: recipients,
      reply_to: isValidEmail(clientEmailPlain) ? clientEmailPlain : undefined,
      subject: `Нове бронювання: ${clientNamePlain}`,
      html: emailShell({
        language,
        preview: `Нове бронювання від ${clientName}`,
        title: 'Нове бронювання',
        greeting: clientName,
        intro: 'У системі створено нове бронювання.',
        rows: [
          emailDetailRow('Тип', bookingType),
          emailDetailRow('Дата', bookingDate),
          emailDetailRow('Час', bookingTime),
          emailDetailRow('Тривалість', duration),
          emailDetailRow('Пакет', packageName),
          emailDetailRow('Вартість', price),
          emailDetailRow('Телефон', clientPhone),
          emailDetailRow('Email', clientEmail),
          emailDetailRow('Коментар', comment),
        ].join(''),
        footer: 'Відкрийте адмін-панель, щоб перевірити деталі бронювання.',
      }),
    })

    if (!adminResult.ok) {
      console.error('Resend admin email error:', adminResult.data)

      await supabaseAdmin
        .from('booking_email_dispatches')
        .update({
          status: 'failed',
          locked_until: new Date(Date.now() + 30_000).toISOString(),
          last_error: `Admin email failed with status ${adminResult.status}`,
          updated_at: new Date().toISOString(),
        } as never)
        .eq('booking_kind', dispatchKind)
        .eq('booking_reference', dispatchReference)

      return NextResponse.json(
        { error: 'Admin email notification failed' },
        { status: adminResult.status }
      )
    }

    let clientResult: { ok: boolean; status: number; data: unknown } | null = null

    if (isValidEmail(clientEmailPlain)) {
      const clientCopy = getClientCopy(language, clientName)

      clientResult = await sendResendEmail(apiKey, {
        from: RESEND_FROM,
        to: [clientEmailPlain],
        subject: clientCopy.subject,
        html: emailShell({
          language,
          preview: clientCopy.variables.PREVIEW_TEXT,
          title: clientCopy.variables.TITLE,
          greeting: clientCopy.variables.GREETING,
          intro: clientCopy.variables.INTRO,
          rows: [
            emailDetailRow(language === 'pl' ? 'Rodzaj rezerwacji' : 'Тип бронювання', bookingType),
            emailDetailRow(language === 'pl' ? 'Data' : 'Дата', bookingDate),
            emailDetailRow(language === 'pl' ? 'Godzina' : 'Час', bookingTime),
            emailDetailRow(clientCopy.variables.DURATION_LABEL, duration),
            emailDetailRow(clientCopy.variables.PACKAGE_LABEL, packageName),
            emailDetailRow(clientCopy.variables.PRICE_LABEL, price),
          ].join(''),
          nextTitle: clientCopy.variables.NEXT_TITLE,
          nextText: clientCopy.variables.NEXT_TEXT,
          footer: clientCopy.variables.FOOTER_TEXT,
        }),
      })

      if (!clientResult.ok) {
        console.error('Resend client email error:', clientResult.data)
      }
    } else {
      console.warn('Client confirmation skipped: invalid or missing client email')
    }

    const completedAt = new Date().toISOString()
    const { error: dispatchUpdateError } = await supabaseAdmin
      .from('booking_email_dispatches')
      .update({
        status: 'sent',
        locked_until: null,
        admin_sent_at: completedAt,
        client_sent_at: clientResult?.ok ? completedAt : null,
        last_error:
          clientResult && !clientResult.ok
            ? `Client email failed with status ${clientResult.status}`
            : null,
        updated_at: completedAt,
      } as never)
      .eq('booking_kind', dispatchKind)
      .eq('booking_reference', dispatchReference)

    if (dispatchUpdateError) {
      console.error('Booking email dispatch update error:', dispatchUpdateError)
    }

    return NextResponse.json({
      success: true,
      adminEmailSent: true,
      clientEmailSent: clientResult?.ok ?? false,
    })
  } catch (error) {
    console.error('Booking email route error:', error)

    if (supabaseAdmin && dispatchKind && dispatchReference) {
      await supabaseAdmin
        .from('booking_email_dispatches')
        .update({
          status: 'failed',
          locked_until: new Date(Date.now() + 30_000).toISOString(),
          last_error: 'Unexpected server error',
          updated_at: new Date().toISOString(),
        } as never)
        .eq('booking_kind', dispatchKind)
        .eq('booking_reference', dispatchReference)
    }

    return NextResponse.json(
      { error: 'Email notification failed' },
      { status: 500 }
    )
  }
}
