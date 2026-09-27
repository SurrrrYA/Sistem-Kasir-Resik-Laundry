import { useState } from 'react'
import { Link } from 'react-router-dom'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    try {
      setLoading(true)
      setMessage('')
      setError('')

      const response = await fetch(
        'http://127.0.0.1:8000/api/forgot-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            email,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Gagal mengirim link reset password.',
        )
      }

      setMessage(
        data.message ||
          'Link reset password telah dikirim ke email Anda.',
      )
    } catch (error) {
      console.error(error)

      setError(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan.',
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
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-[#10263B] tracking-tight">
              Lupa Password?
            </h1>

            <p className="text-[#5E6E7C] mt-2 text-sm leading-6">
              Masukkan email akun Anda.
              Kami akan mengirimkan link untuk
              membuat password baru.
            </p>
          </div>

          {/* Success */}
          {message && (
            <div className="bg-[#E8F7F4] border border-[#BDE4DC] text-[#177567] rounded-xl p-3 mb-5 text-sm leading-6">
              {message}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-[#FBEAEA] border border-[#F0C9C9] text-[#B3413F] rounded-xl p-3 mb-5 text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1F9C8B] text-white rounded-xl px-4 py-3 font-medium hover:bg-[#177567] transition disabled:opacity-50"
            >
              {loading
                ? 'Mengirim...'
                : 'Kirim Link Reset'}
            </button>
          </form>

          {/* Back to login */}
          <div className="text-center mt-6">
            <Link
              to="/login"
              className="text-sm text-[#1F9C8B] hover:text-[#177567] transition"
            >
              ← Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword