'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [isResetLoading, setIsResetLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [resetMessage, setResetMessage] = useState('')

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage('Неверный email или пароль')
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setSocialLoading(provider)
    setErrorMessage('')
    setSuccessMessage('')

    const redirectTo = `${window.location.origin}/dashboard`

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    })

    if (error) {
      setErrorMessage(
        provider === 'google'
          ? 'Не удалось войти через Google. Проверьте настройки Google в Supabase.'
          : 'Не удалось войти через Apple. Проверьте настройки Apple в Supabase.'
      )
      setSocialLoading(null)
    }
  }

  const openResetModal = () => {
    setResetEmail(email)
    setResetMessage('')
    setIsResetOpen(true)
  }

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!resetEmail.trim()) {
      setResetMessage('Введите email, на который зарегистрирован аккаунт.')
      return
    }

    setIsResetLoading(true)
    setResetMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: resetEmail.trim(),
        }),
      })

      const data = (await response.json()) as {
        message?: string
      }

      if (!response.ok) {
        setResetMessage(
          data.message ||
            'Не удалось отправить письмо. Проверьте email и попробуйте ещё раз.'
        )
        setIsResetLoading(false)
        return
      }

      setResetMessage(
        data.message ||
          'Письмо отправлено. Проверьте входящие и папку «Спам», затем перейдите по ссылке из письма.'
      )
    } catch {
      setResetMessage(
        'Не удалось отправить письмо. Попробуйте ещё раз немного позже.'
      )
    } finally {
      setIsResetLoading(false)
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#0B0908] text-[#F7EFE6]">
      <div className="fixed left-0 top-0 z-40 w-full px-4 pt-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center rounded-full border border-[#D4A37333] bg-[#0B0908CC] px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-5">
          <Link
            href="/"
            aria-label="Вернуться на главную"
            className="group inline-flex cursor-pointer items-center gap-3 transition duration-300 hover:scale-[1.025]"
          >
            <span className="flex h-10 w-10 overflow-hidden rounded-[14px] border border-[#D4A37355] bg-[#D4A37314] shadow-[0_0_22px_rgba(232,185,133,0.10)] transition duration-300 group-hover:border-[#D4A373] group-hover:shadow-[0_0_30px_rgba(232,185,133,0.22)]">
              <img
                src="https://cdn.sistersstudio.pl/portrait/1783898830154-sisters-login-mother-child-dae63c97-202a-416c-b862-fdcceacfccec.webp"
                alt="Sisters Photo Studio"
                className="h-full w-full object-cover"
              />
            </span>

            <span className="leading-none">
              <span className="block text-sm font-light uppercase tracking-[0.24em] text-[#D4A373] sm:text-base">
                Sisters
              </span>
              <span className="mt-1 block text-[9px] uppercase tracking-[0.34em] text-[#CDBAA8]">
                Photo Studio
              </span>
            </span>
          </Link>
        </div>
      </div>

      <section className="relative flex min-h-screen items-center justify-center px-5 pb-16 pt-28 lg:px-10 lg:pt-32">
        <div className="absolute left-0 top-0 h-[420px] w-[420px] rounded-full bg-[#D4A37322] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-[#7A4A2A33] blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.section
            initial={{ opacity: 0, x: -28, rotate: -4 }}
            animate={{ opacity: 1, x: 0, rotate: -2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="hidden justify-center lg:flex"
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
                  src="https://cdn.sistersstudio.pl/portrait/1783898830154-sisters-login-mother-child-dae63c97-202a-416c-b862-fdcceacfccec.webp"
                  alt="Sister's Photo Studio мама с ребёнком"
                  className="h-[650px] w-[488px] rounded-[28px] object-cover"
                />
              </div>

              <div className="absolute -bottom-6 left-8 rounded-full border border-[#D4A37355] bg-[#171312CC] px-6 py-3 text-xs uppercase tracking-[0.3em] text-[#D4A373] shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
                Premium Portrait
              </div>
            </motion.div>
          </motion.section>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <div className="mx-auto w-full max-w-md rounded-[34px] border border-[#D4A37333] bg-[#171312CC] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.52)] backdrop-blur-xl sm:p-8">
              <div className="mb-8 text-center">
                <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[#D4A373]">
                  Sister&apos;s Photo Studio
                </p>

                <h1 className="text-3xl font-light tracking-[-0.04em] text-[#F7EFE6] sm:text-4xl">
                  Welcome back
                </h1>

                <p className="mt-3 text-sm leading-6 text-[#CDBAA8]">
                  Войдите в личный кабинет премиальной фотостудии
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-[#CDBAA8]"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                    placeholder="your@email.com"
                    className="w-full rounded-2xl border border-[#D4A37333] bg-[#0B0908] px-4 py-3 text-[#F7EFE6] outline-none transition placeholder:text-[#8B7A6B] focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A37333]"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-[#CDBAA8]"
                    >
                      Пароль
                    </label>

                    <button
                      type="button"
                      onClick={openResetModal}
                      className="text-xs font-medium text-[#D4A373] transition hover:text-[#E3B98C]"
                    >
                      Забыли пароль?
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="Введите пароль"
                      className="w-full rounded-2xl border border-[#D4A37333] bg-[#0B0908] px-4 py-3 pr-12 text-[#F7EFE6] outline-none transition placeholder:text-[#8B7A6B] focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A37333]"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#A98F78] transition hover:text-[#D4A373]"
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M3 3l18 18" />
                          <path d="M10.6 10.7a2 2 0 002.7 2.7" />
                          <path d="M9.9 4.3A10.8 10.8 0 0112 4c5.5 0 9 5 9 5a15.8 15.8 0 01-2.2 2.6" />
                          <path d="M6.2 6.2C4.1 7.6 3 9 3 9s3.5 5 9 5a10.8 10.8 0 003.1-.4" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5z" />
                          <circle cx="12" cy="12" r="2.5" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className="rounded-2xl border border-[#B85C5C66] bg-[#3A1616] px-4 py-3 text-sm text-[#FFD1D1]">
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="rounded-2xl border border-[#76996A66] bg-[#182616] px-4 py-3 text-sm text-[#DFF4D8]">
                    {successMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || socialLoading !== null}
                  className="w-full rounded-full bg-[#D4A373] px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#0B0908] shadow-[0_18px_45px_rgba(212,163,115,0.25)] transition hover:bg-[#E3B98C] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? 'Входим...' : 'Войти'}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#D4A37322]" />
                <span className="text-[11px] uppercase tracking-[0.22em] text-[#8B7A6B]">или</span>
                <div className="h-px flex-1 bg-[#D4A37322]" />
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading || socialLoading !== null}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-[#D4A37344] bg-[#0B0908] px-5 py-3.5 text-sm font-medium text-[#F7EFE6] transition hover:border-[#D4A373] hover:bg-[#201A17] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.2z" />
                    <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.5l-3.2-2.5c-.9.6-2 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.9v2.6A10 10 0 0012 22z" />
                    <path fill="#FBBC05" d="M6.2 13.7A6 6 0 016 12c0-.6.1-1.2.2-1.7V7.7H2.9A10 10 0 002 12c0 1.6.4 3 1 4.3l3.2-2.6z" />
                    <path fill="#EA4335" d="M12 6c1.6 0 3 .5 4.1 1.6l3-3A10 10 0 002.9 7.7l3.3 2.6C7 7.8 9.3 6 12 6z" />
                  </svg>
                  {socialLoading === 'google' ? 'Открываем Google...' : 'Продолжить через Google'}
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('apple')}
                  disabled={isLoading || socialLoading !== null}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-[#D4A37344] bg-[#F7EFE6] px-5 py-3.5 text-sm font-semibold text-[#0B0908] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.79 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.1zM12.03 7.25C11.88 5.02 13.69 3.18 15.77 3c.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  {socialLoading === 'apple' ? 'Открываем Apple...' : 'Продолжить через Apple'}
                </button>
              </div>

              <div className="mt-6 text-center text-sm text-[#CDBAA8]">
                Нет аккаунта?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/register')}
                  className="font-medium text-[#D4A373] transition hover:text-[#E3B98C]"
                >
                  Зарегистрироваться
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {isResetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsResetOpen(false)
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md rounded-[30px] border border-[#D4A37344] bg-[#171312] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.65)] sm:p-8"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#D4A373]">Восстановление</p>
                  <h2 className="mt-2 text-2xl font-light text-[#F7EFE6]">Забыли пароль?</h2>
                  <p className="mt-2 text-sm leading-6 text-[#CDBAA8]">
                    Отправим ссылку для создания нового пароля.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsResetOpen(false)}
                  aria-label="Закрыть"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4A37333] text-[#CDBAA8] transition hover:border-[#D4A373] hover:text-[#F7EFE6]"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="mb-2 block text-sm font-medium text-[#CDBAA8]">
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(event) => setResetEmail(event.target.value)}
                    required
                    autoComplete="email"
                    placeholder="your@email.com"
                    className="w-full rounded-2xl border border-[#D4A37333] bg-[#0B0908] px-4 py-3 text-[#F7EFE6] outline-none transition placeholder:text-[#8B7A6B] focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A37333]"
                  />
                </div>

                {resetMessage && (
                  <div className="rounded-2xl border border-[#D4A37333] bg-[#0B0908] px-4 py-3 text-sm leading-6 text-[#E8D6C6]">
                    {resetMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isResetLoading}
                  className="w-full rounded-full bg-[#D4A373] px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#0B0908] transition hover:bg-[#E3B98C] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isResetLoading ? 'Отправляем...' : 'Отправить ссылку'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
