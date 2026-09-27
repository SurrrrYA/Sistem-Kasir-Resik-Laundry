import { useState } from 'react'
import { Link } from 'react-router-dom'

function IconEye({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="2.6"
        stroke="currentColor"
        strokeWidth={1.8}
      />
    </svg>
  )
}

function IconEyeOff({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 3l18 18M9.9 9.9a2.6 2.6 0 0 0 3.7 3.7M6.2 6.4C4 8 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.6 0 3-.4 4.2-1.1M17.9 17.9c1.9-1.5 3.6-4.4 3.6-4.4S17.9 6.5 12 6.5c-.6 0-1.1.05-1.7.15"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        'http://127.0.0.1:8000/api/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Email atau password salah.',
        )
      }

      localStorage.setItem(
        'token',
        data.data.token,
      )

      localStorage.setItem(
        'user',
        JSON.stringify(data.data.user),
      )

      console.log(
        'Login berhasil:',
        data.data.user,
      )

      window.location.href = '/'
    } catch (error) {
      console.error(error)

      setError(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat login.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7F8] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-[#E4E9EC] shadow-[0_20px_60px_-20px_rgba(16,38,59,0.18)] p-8">

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-2xl font-semibold text-[#10263B] tracking-tight">
              Resik Laundry
            </h1>

            <p className="text-[#5E6E7C] mt-1.5 text-sm">
              Silakan masuk ke akun Anda
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-[#FBEAEA] border border-[#F0C9C9] text-[#B3413F] rounded-xl p-3 mb-5 text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#10263B] mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Masukkan email"
                required
                className="w-full border border-[#D8DEE2] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F9C8B] focus:border-[#1F9C8B] transition"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[#10263B]">
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm text-[#1F9C8B] hover:text-[#177567] transition"
                >
                  Lupa password?
                </Link>
              </div>

              <div className="relative">
                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Masukkan password"
                  required
                  className="w-full border border-[#D8DEE2] rounded-xl px-4 py-3 pr-11 outline-none focus:ring-2 focus:ring-[#1F9C8B] focus:border-[#1F9C8B] transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value,
                    )
                  }
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-[#5E6E7C] hover:text-[#10263B]"
                  aria-label={
                    showPassword
                      ? 'Sembunyikan password'
                      : 'Tampilkan password'
                  }
                >
                  {showPassword ? (
                    <IconEyeOff className="w-5 h-5" />
                  ) : (
                    <IconEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1F9C8B] text-white rounded-xl px-4 py-3 font-medium hover:bg-[#177567] transition disabled:opacity-50"
            >
              {loading
                ? 'Memproses...'
                : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login