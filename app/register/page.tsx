'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsLoading(true)
    setSuccessMessage('')
    setErrorMessage('')

    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()
    const cleanPhone = phone.trim()

    if (!cleanName) {
      setErrorMessage('Введите имя')
      setIsLoading(false)
      return
    }

    if (!cleanPhone) {
      setErrorMessage('Введите телефон')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setErrorMessage('Пароль должен быть не короче 6 символов')
      setIsLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          name: cleanName,
          phone: cleanPhone,
        },
      },
    })

    if (error) {
      if (error.message.toLowerCase().includes('rate limit')) {
        setErrorMessage(
          'Supabase временно ограничил отправку писем. Подождите немного и попробуйте снова.'
        )
      } else {
        setErrorMessage(error.message)
      }

      setIsLoading(false)
      return
    }

    setSuccessMessage(
      'Аккаунт создан. Проверьте почту, чтобы подтвердить регистрацию.'
    )

    setName('')
    setEmail('')
    setPhone('')
    setPassword('')
    setIsLoading(false)

    setTimeout(() => {
      router.push('/login')
    }, 1800)
  }

  const handleSocialRegister = async (provider: 'google' | 'apple') => {
    setSocialLoading(provider)
    setErrorMessage('')
    setSuccessMessage('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      setErrorMessage(
        provider === 'google'
          ? 'Не удалось зарегистрироваться через Google.'
          : 'Не удалось зарегистрироваться через Apple.'
      )
      setSocialLoading(null)
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#090706] text-[#F7E7D4]">
      <div className="fixed left-0 top-0 z-40 w-full px-4 pt-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center rounded-full border border-[#E8B98533] bg-[#090706CC] px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-5">
          <Link
            href="/"
            aria-label="Вернуться на главную"
            className="group inline-flex cursor-pointer items-center gap-3 transition duration-300 hover:scale-[1.025]"
          >
            <span className="flex h-10 w-10 overflow-hidden rounded-[14px] border border-[#E8B98555] bg-[#E8B98514] shadow-[0_0_22px_rgba(232,185,133,0.10)] transition duration-300 group-hover:border-[#E8B985] group-hover:shadow-[0_0_30px_rgba(232,185,133,0.22)]">
              <img
                src="/images/brand/sisters-logo-icon.webp"
                alt="Sisters Photo Studio"
                className="h-full w-full object-cover"
              />
            </span>

            <span className="leading-none">
              <span className="block text-sm font-light uppercase tracking-[0.24em] text-[#E8B985] sm:text-base">
                Sisters
              </span>
              <span className="mt-1 block text-[9px] uppercase tracking-[0.34em] text-[#CDB8A6]">
                Photo Studio
              </span>
            </span>
          </Link>
        </div>
      </div>

      <section className="relative flex min-h-screen items-center px-5 pb-10 pt-28 sm:px-8 lg:px-10 lg:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(166,124,82,0.28),transparent_30%),radial-gradient(circle_at_84%_48%,rgba(231,181,134,0.20),transparent_35%)]" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 44, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mx-auto w-full max-w-md rounded-[34px] border border-[#D4A37333] bg-[#171312CC] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.52)] backdrop-blur-xl sm:p-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.75,
                delay: 0.18,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mb-7 text-center"
            >
              <p className="mb-4 text-[11px] uppercase tracking-[0.42em] text-[#C89464]">
                Sisters Photo Studio
              </p>

              <h1 className="text-4xl font-light tracking-[-0.04em] text-[#FFF2E4] sm:text-[44px]">
                Создать аккаунт
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#CDB8A6]">
                Зарегистрируйтесь, чтобы выбрать съёмку и сохранить свои данные
                для бронирования.
              </p>
            </motion.div>

            <form onSubmit={handleRegister} className="space-y-4">
              <motion.input
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.28 }}
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                placeholder="Ваше имя"
                className="h-14 w-full rounded-full border border-[#4A3425] bg-[#050403] px-6 text-[15px] text-[#FFF2E4] outline-none transition placeholder:text-[#9B8573] focus:border-[#E8B985] focus:ring-2 focus:ring-[#E8B985]/20"
              />

              <motion.input
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.36 }}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="Email"
                className="h-14 w-full rounded-full border border-[#4A3425] bg-[#050403] px-6 text-[15px] text-[#FFF2E4] outline-none transition placeholder:text-[#9B8573] focus:border-[#E8B985] focus:ring-2 focus:ring-[#E8B985]/20"
              />

              <motion.input
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.44 }}
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
                placeholder="Телефон"
                className="h-14 w-full rounded-full border border-[#4A3425] bg-[#050403] px-6 text-[15px] text-[#FFF2E4] outline-none transition placeholder:text-[#9B8573] focus:border-[#E8B985] focus:ring-2 focus:ring-[#E8B985]/20"
              />

              <motion.input
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.52 }}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                placeholder="Пароль"
                className="h-14 w-full rounded-full border border-[#4A3425] bg-[#050403] px-6 text-[15px] text-[#FFF2E4] outline-none transition placeholder:text-[#9B8573] focus:border-[#E8B985] focus:ring-2 focus:ring-[#E8B985]/20"
              />

              {successMessage && (
                <div className="rounded-2xl border border-green-300/30 bg-green-500/10 px-5 py-3 text-sm leading-6 text-green-100">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="rounded-2xl border border-red-300/30 bg-red-500/10 px-5 py-3 text-sm leading-6 text-red-100">
                  {errorMessage}
                </div>
              )}

              <motion.button
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.62 }}
                whileHover={{ scale: 1.025, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || socialLoading !== null}
                className="h-14 w-full rounded-full bg-[#E8B985] px-8 text-sm font-bold uppercase tracking-[0.28em] text-[#21140D] shadow-[0_22px_60px_rgba(232,185,133,0.26)] transition hover:bg-[#F2C99A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Создаём аккаунт...' : 'Создать аккаунт'}
              </motion.button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E8B98522]" />
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#9B8573]">
                или
              </span>
              <div className="h-px flex-1 bg-[#E8B98522]" />
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleSocialRegister('google')}
                disabled={isLoading || socialLoading !== null}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-[#E8B98544] bg-[#050403] px-5 py-3.5 text-sm font-medium text-[#FFF2E4] transition hover:border-[#E8B985] hover:bg-[#21140D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.2z" />
                  <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.5l-3.2-2.5c-.9.6-2 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.9v2.6A10 10 0 0012 22z" />
                  <path fill="#FBBC05" d="M6.2 13.7A6 6 0 016 12c0-.6.1-1.2.2-1.7V7.7H2.9A10 10 0 002 12c0 1.6.4 3 1 4.3l3.2-2.6z" />
                  <path fill="#EA4335" d="M12 6c1.6 0 3 .5 4.1 1.6l3-3A10 10 0 002.9 7.7l3.3 2.6C7 7.8 9.3 6 12 6z" />
                </svg>

                {socialLoading === 'google'
                  ? 'Открываем Google...'
                  : 'Зарегистрироваться через Google'}
              </button>

              <button
                type="button"
                onClick={() => handleSocialRegister('apple')}
                disabled={isLoading || socialLoading !== null}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-[#E8B98544] bg-[#FFF2E4] px-5 py-3.5 text-sm font-semibold text-[#21140D] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.79 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.1zM12.03 7.25C11.88 5.02 13.69 3.18 15.77 3c.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>

                {socialLoading === 'apple'
                  ? 'Открываем Apple...'
                  : 'Зарегистрироваться через Apple'}
              </button>
            </div>

            <div className="mt-5 text-center text-sm text-[#BFA996]">
              Уже есть аккаунт?{' '}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="font-medium text-[#E8B985] transition hover:text-[#F2C99A]"
              >
                Войти
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28, rotate: -4 }}
            animate={{ opacity: 1, x: 0, rotate: -2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="hidden justify-center lg:flex lg:self-start"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [-2, -2.5, -1.6, -2],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-[44px] bg-[#D4A37318] blur-2xl" />

              <div className="relative rounded-[36px] border border-[#D4A37344] bg-[#171312] p-3 shadow-[0_35px_100px_rgba(0,0,0,0.62)]">
                <img
                  src="/images/site/home/photoshoots.webp"
                  alt="Sisters Photo Studio mother and child portrait"
                  className="h-[650px] w-[488px] rounded-[28px] object-cover"
                />
              </div>

              <div className="absolute -bottom-6 left-8 rounded-full border border-[#D4A37355] bg-[#171312CC] px-6 py-3 text-xs uppercase tracking-[0.3em] text-[#D4A373] shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
                Premium Portrait
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
