import { useState } from 'react'

function ResetPassword() {
  const params = new URLSearchParams(window.location.search)

  const token = params.get('token') || ''
  const email = params.get('email') || ''

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] =
    useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleResetPassword(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!token || !email) {
      setError(
        'Link reset password tidak valid atau sudah tidak lengkap.',
      )
      return
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }

    if (password !== passwordConfirmation) {
      setError('Konfirmasi password tidak sama.')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        'http://127.0.0.1:8000/api/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            token,
            email,
            password,
            password_confirmation: passwordConfirmation,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Gagal mengubah password.',
        )
      }

      setSuccess(
        data.message ||
          'Password berhasil diubah. Silakan login kembali.',
      )

      setPassword('')
      setPasswordConfirmation('')
    } catch (error) {
      console.error(error)

      setError(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat mengubah password.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Resik Laundry
            </h1>

            <p className="text-slate-500 mt-2">
              Buat password baru
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-5 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-5 text-sm">
              {success}
            </div>
          )}

          <form
            onSubmit={handleResetPassword}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                disabled
                className="w-full border border-slate-300 bg-slate-100 rounded-lg px-4 py-3 text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password Baru
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Masukkan password baru"
                required
                minLength={6}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Konfirmasi Password
              </label>

              <input
                type="password"
                value={passwordConfirmation}
                onChange={(event) =>
                  setPasswordConfirmation(
                    event.target.value,
                  )
                }
                placeholder="Ulangi password baru"
                required
                minLength={6}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white rounded-lg px-4 py-3 font-medium hover:bg-slate-800 transition disabled:opacity-50"
            >
              {loading
                ? 'Menyimpan...'
                : 'Ubah Password'}
            </button>
          </form>

          {success && (
            <button
              type="button"
              onClick={() => {
                window.location.href = '/login'
              }}
              className="w-full mt-4 border border-slate-300 text-slate-700 rounded-lg px-4 py-3 font-medium hover:bg-slate-50 transition"
            >
              Kembali ke Login
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword