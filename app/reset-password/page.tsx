'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const prepareRecoverySession = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          setIsError(true)
          setMessage('Ссылка недействительна или уже истекла. Запросите новое письмо.')
          return
        }

        window.history.replaceState({}, document.title, window.location.pathname)
      }

      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        setIsError(true)
        setMessage('Ссылка недействительна или уже истекла. Запросите новое письмо.')
        return
      }

      setIsReady(true)
    }

    prepareRecoverySession()
  }, [])

  const handleUpdatePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setIsError(false)

    if (password.length < 8) {
      setIsError(true)
      setMessage('Пароль должен содержать не меньше 8 символов.')
      return
    }

    if (password !== confirmPassword) {
      setIsError(true)
      setMessage('Пароли не совпадают.')
      return
    }

    setIsLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setIsError(true)
      setMessage('Не удалось изменить пароль. Запросите новую ссылку и попробуйте ещё раз.')
      setIsLoading(false)
      return
    }

    setMessage('Пароль успешно изменён. Сейчас откроется личный кабинет.')
    setIsLoading(false)

    window.setTimeout(() => {
      router.push('/dashboard')
      router.refresh()
    }, 1200)
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B0908] px-5 py-16 text-[#F7EFE6]">
      <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-[#D4A37322] blur-3xl" />
      <div className="absolute bottom-[-180px] right-[-120px] h-[520px] w-[520px] rounded-full bg-[#7A4A2A33] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-[34px] border border-[#D4A37333] bg-[#171312CC] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.52)] backdrop-blur-xl sm:p-8"
      >
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[#D4A373]">
            Sister&apos;s Photo Studio
          </p>
          <h1 className="text-3xl font-light tracking-[-0.04em] sm:text-4xl">Новый пароль</h1>
          <p className="mt-3 text-sm leading-6 text-[#CDBAA8]">
            Придумайте новый пароль для вашего аккаунта.
          </p>
        </div>

        {!isReady && !message && (
          <div className="rounded-2xl border border-[#D4A37333] bg-[#0B0908] px-4 py-4 text-center text-sm text-[#CDBAA8]">
            Проверяем ссылку...
          </div>
        )}

        {isReady && (
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div>
              <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-[#CDBAA8]">
                Новый пароль
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Не меньше 8 символов"
                  className="w-full rounded-2xl border border-[#D4A37333] bg-[#0B0908] px-4 py-3 pr-12 text-[#F7EFE6] outline-none transition placeholder:text-[#8B7A6B] focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A37333]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#A98F78] transition hover:text-[#D4A373]"
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-[#CDBAA8]">
                Повторите пароль
              </label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Повторите новый пароль"
                className="w-full rounded-2xl border border-[#D4A37333] bg-[#0B0908] px-4 py-3 text-[#F7EFE6] outline-none transition placeholder:text-[#8B7A6B] focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A37333]"
              />
            </div>

            {message && (
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                  isError
                    ? 'border border-[#B85C5C66] bg-[#3A1616] text-[#FFD1D1]'
                    : 'border border-[#76996A66] bg-[#182616] text-[#DFF4D8]'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-[#D4A373] px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#0B0908] transition hover:bg-[#E3B98C] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Сохраняем...' : 'Сохранить новый пароль'}
            </button>
          </form>
        )}

        {!isReady && message && (
          <div
            className={`rounded-2xl px-4 py-4 text-center text-sm leading-6 ${
              isError
                ? 'border border-[#B85C5C66] bg-[#3A1616] text-[#FFD1D1]'
                : 'border border-[#76996A66] bg-[#182616] text-[#DFF4D8]'
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="button"
          onClick={() => router.push('/login')}
          className="mt-6 w-full text-center text-sm font-medium text-[#D4A373] transition hover:text-[#E3B98C]"
        >
          Вернуться ко входу
        </button>
      </motion.div>
    </main>
  )
}
