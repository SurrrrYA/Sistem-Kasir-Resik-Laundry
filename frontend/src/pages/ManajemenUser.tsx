import { useEffect, useState } from 'react'

type User = {
  id: number
  name: string
  email: string
  role: 'owner' | 'kasir'
  created_at?: string
}

type CurrentUser = {
  id: number
  name: string
  email: string
  role: 'owner' | 'kasir'
}

const API_URL = 'http://127.0.0.1:8000/api'

function getHeaders() {
  const token = localStorage.getItem('token')

  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  }
}

function getCurrentUser(): CurrentUser | null {
  try {
    const user = localStorage.getItem('user')

    if (!user) {
      return null
    }

    return JSON.parse(user)
  } catch {
    return null
  }
}

function ManajemenUser() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] =
    useState<User | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] =
    useState<'owner' | 'kasir'>('kasir')
  const [password, setPassword] = useState('')

  const [saving, setSaving] = useState(false)

  const currentUser = getCurrentUser()

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `${API_URL}/users`,
        {
          headers: getHeaders(),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Gagal mengambil data user.',
        )
      }

      setUsers(data.data ?? [])
    } catch (error) {
      console.error(error)

      setError(
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data user.',
      )
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setName('')
    setEmail('')
    setRole('kasir')
    setPassword('')
    setEditingUser(null)
    setShowForm(false)
  }

  function openAddForm() {
    setName('')
    setEmail('')
    setRole('kasir')
    setPassword('')
    setEditingUser(null)
    setShowForm(true)
    setError('')
  }

  function openEditForm(user: User) {
    // Pengaman tambahan di frontend
    if (currentUser?.id === user.id) {
      return
    }

    setName(user.name)
    setEmail(user.email)
    setRole(user.role)
    setPassword('')
    setEditingUser(user)
    setShowForm(true)
    setError('')
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')

      const isEditing = Boolean(editingUser)

      const body: {
        name: string
        email: string
        role: 'owner' | 'kasir'
        password?: string
      } = {
        name,
        email,
        role,
      }

      if (password) {
        body.password = password
      }

      const url = isEditing
        ? `${API_URL}/users/${editingUser!.id}`
        : `${API_URL}/users`

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          const firstError = Object.values(
            data.errors,
          )[0]

          throw new Error(
            Array.isArray(firstError)
              ? String(firstError[0])
              : 'Data tidak valid.',
          )
        }

        throw new Error(
          data.message ||
            'Gagal menyimpan user.',
        )
      }

      resetForm()
      await loadUsers()
    } catch (error) {
      console.error(error)

      setError(
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan user.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(user: User) {
    // Pengaman tambahan di frontend
    if (currentUser?.id === user.id) {
      return
    }

    const confirmed = window.confirm(
      `Hapus user "${user.name}"?`,
    )

    if (!confirmed) {
      return
    }

    try {
      setError('')

      const response = await fetch(
        `${API_URL}/users/${user.id}`,
        {
          method: 'DELETE',
          headers: getHeaders(),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Gagal menghapus user.',
        )
      }

      await loadUsers()
    } catch (error) {
      console.error(error)

      setError(
        error instanceof Error
          ? error.message
          : 'Gagal menghapus user.',
      )
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-[#10263B] tracking-tight">
            Manajemen User
          </h2>

          <p className="text-[#5E6E7C] mt-1">
            Kelola akun owner dan kasir.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="px-4 py-2.5 bg-[#1F9C8B] text-white rounded-xl hover:bg-[#188575] transition"
        >
          + Tambah User
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 bg-[#FBEAEA] border border-[#F0C9C9] text-[#B3413F] rounded-xl p-4">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#E4E9EC] p-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#10263B]">
              {editingUser
                ? 'Edit User'
                : 'Tambah User'}
            </h3>

            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-[#5E6E7C] hover:text-[#10263B]"
            >
              Batal
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-[#10263B] mb-2">
                Nama
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Nama user"
                required
                className="w-full border border-[#D9E0E4] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F9C8B]/20 focus:border-[#1F9C8B]"
              />
            </div>

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
                placeholder="email@example.com"
                required
                className="w-full border border-[#D9E0E4] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F9C8B]/20 focus:border-[#1F9C8B]"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-[#10263B] mb-2">
                Role
              </label>

              <select
                value={role}
                onChange={(event) =>
                  setRole(
                    event.target.value as
                      | 'owner'
                      | 'kasir',
                  )
                }
                className="w-full border border-[#D9E0E4] rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-[#1F9C8B]/20 focus:border-[#1F9C8B]"
              >
                <option value="kasir">
                  Kasir
                </option>

                <option value="owner">
                  Owner
                </option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#10263B] mb-2">
                Password

                {editingUser && (
                  <span className="text-xs text-[#5E6E7C] ml-2">
                    Kosongkan jika tidak diubah
                  </span>
                )}
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                placeholder={
                  editingUser
                    ? 'Password baru'
                    : 'Minimal 6 karakter'
                }
                required={!editingUser}
                minLength={6}
                className="w-full border border-[#D9E0E4] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F9C8B]/20 focus:border-[#1F9C8B]"
              />
            </div>

            {/* Button */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-3 bg-[#10263B] text-white rounded-xl hover:bg-[#0B1D2C] transition disabled:opacity-50"
              >
                {saving
                  ? 'Menyimpan...'
                  : editingUser
                    ? 'Simpan Perubahan'
                    : 'Tambah User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E4E9EC] mt-6 overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-[#5E6E7C]">
            Memuat data user...
          </div>
        ) : users.length === 0 ? (
          <div className="p-6 text-sm text-[#5E6E7C]">
            Belum ada user.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFB] border-b border-[#E4E9EC]">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-[#10263B]">
                    Nama
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-[#10263B]">
                    Email
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-[#10263B]">
                    Role
                  </th>

                  <th className="text-right px-6 py-4 font-semibold text-[#10263B]">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E4E9EC]">
                {users.map((user) => {
                  const isCurrentUser =
                    currentUser?.id === user.id

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-[#FAFCFC] transition"
                    >
                      <td className="px-6 py-4 font-medium text-[#10263B]">
                        <div className="flex items-center gap-2">
                          <span>
                            {user.name}
                          </span>

                          {isCurrentUser && (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#F1F3F5] text-[#5E6E7C]">
                              Akun Anda
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-[#5E6E7C]">
                        {user.email}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'owner'
                              ? 'bg-[#EAF4FF] text-[#3B7DD8]'
                              : 'bg-[#E8F7F4] text-[#177567]'
                          }`}
                        >
                          {user.role === 'owner'
                            ? 'Owner'
                            : 'Kasir'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {isCurrentUser ? (
                          <div className="flex justify-end">
                            <span className="text-sm text-[#9AA5AD]">
                              Tidak dapat dikelola
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                openEditForm(user)
                              }
                              className="px-3 py-2 rounded-lg text-sm text-[#3B7DD8] hover:bg-[#EAF4FF] transition"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(user)
                              }
                              className="px-3 py-2 rounded-lg text-sm text-[#B3413F] hover:bg-[#FBEAEA] transition"
                            >
                              Hapus
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManajemenUser