import { useEffect, useState } from 'react'
import {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
} from '../services/api'

type Customer = {
  id: number
  name: string
  phone: string | null
  address: string | null
}

function Pelanggan() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const [saving, setSaving] = useState(false)

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(
    null,
  )

  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true)

        const result = await getCustomers()

        setCustomers(result.data)
      } catch {
        setError('Gagal mengambil data pelanggan.')
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  function handleAdd() {
    setEditingCustomer(null)

    setName('')
    setPhone('')
    setAddress('')

    setError('')
    setShowForm(true)
  }

  function handleEdit(customer: Customer) {
    setEditingCustomer(customer)

    setName(customer.name)
    setPhone(customer.phone ?? '')
    setAddress(customer.address ?? '')

    setError('')
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingCustomer(null)

    setName('')
    setPhone('')
    setAddress('')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')

      if (editingCustomer) {
        const result = await updateCustomer(editingCustomer.id, {
          name,
          phone,
          address,
        })

        setCustomers((currentCustomers) =>
          currentCustomers.map((customer) =>
            customer.id === editingCustomer.id ? result.data : customer,
          ),
        )
      } else {
        const result = await createCustomer({
          name,
          phone,
          address,
        })

        setCustomers((currentCustomers) => [
          result.data,
          ...currentCustomers,
        ])
      }

      handleCancel()
    } catch {
      setError(
        editingCustomer
          ? 'Gagal memperbarui pelanggan.'
          : 'Gagal menambahkan pelanggan.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(customer: Customer) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus pelanggan "${customer.name}"?`,
    )

    if (!confirmed) {
      return
    }

    try {
      setError('')

      await deleteCustomer(customer.id)

      setCustomers((currentCustomers) =>
        currentCustomers.filter((item) => item.id !== customer.id),
      )
    } catch {
      setError('Gagal menghapus pelanggan.')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-semibold text-[#10263B] tracking-tight">
            Pelanggan
          </h2>

          <p className="text-[#5E6E7C] mt-1">
            Kelola data pelanggan laundry.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="bg-[#10263B] text-white px-5 py-3 rounded-xl hover:bg-[#0B1D2C] transition w-full sm:w-auto"
        >
          + Tambah Pelanggan
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-[#FBEAEA] text-[#B3413F] px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#E4E9EC] p-5 sm:p-6 mb-6">
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h3 className="text-xl font-semibold text-[#10263B]">
                {editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
              </h3>

              <p className="text-sm text-[#5E6E7C] mt-1">
                {editingCustomer
                  ? 'Perbarui data pelanggan.'
                  : 'Masukkan data pelanggan baru.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="text-[#5E6E7C] hover:text-[#10263B] shrink-0"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nama */}
              <div>
                <label className="block text-sm font-medium text-[#10263B] mb-2">
                  Nama
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  placeholder="Nama pelanggan"
                  className="w-full border border-[#D8DEE2] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F9C8B] focus:border-[#1F9C8B]"
                />
              </div>

              {/* No HP */}
              <div>
                <label className="block text-sm font-medium text-[#10263B] mb-2">
                  No. HP
                </label>

                <input
                  type="text"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full border border-[#D8DEE2] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F9C8B] focus:border-[#1F9C8B]"
                />
              </div>

              {/* Alamat */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#10263B] mb-2">
                  Alamat
                </label>

                <textarea
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  rows={3}
                  placeholder="Alamat pelanggan"
                  className="w-full border border-[#D8DEE2] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F9C8B] focus:border-[#1F9C8B]"
                />
              </div>
            </div>

            {/* Button */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-3 rounded-xl border border-[#D8DEE2] text-[#10263B] hover:bg-[#F5F7F8] order-2 sm:order-1"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-3 rounded-xl bg-[#1F9C8B] text-white hover:bg-[#177567] disabled:opacity-50 order-1 sm:order-2"
              >
                {saving
                  ? 'Menyimpan...'
                  : editingCustomer
                    ? 'Simpan Perubahan'
                    : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-[#E4E9EC] p-6 text-[#5E6E7C]">
          Memuat data...
        </div>
      )}

      {/* Empty state */}
      {!loading && customers.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E4E9EC] p-8 text-center text-[#5E6E7C]">
          Belum ada pelanggan.
        </div>
      )}

      {/* Mobile: card list (below md) */}
      {!loading && customers.length > 0 && (
        <div className="grid gap-4 md:hidden">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white rounded-2xl border border-[#E4E9EC] p-5"
            >
              <p className="font-semibold text-[#10263B]">
                {customer.name}
              </p>

              <p className="text-sm text-[#5E6E7C] mt-1">
                {customer.phone ?? '-'}
              </p>

              <p className="text-sm text-[#5E6E7C] mt-1">
                {customer.address ?? '-'}
              </p>

              <div className="flex gap-4 mt-4 pt-4 border-t border-[#E4E9EC]">
                <button
                  onClick={() => handleEdit(customer)}
                  className="text-sm text-[#1F9C8B] font-medium"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(customer)}
                  className="text-sm text-[#B3413F] font-medium"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop / tablet: table (md and up) */}
      {!loading && customers.length > 0 && (
        <div className="hidden md:block bg-white rounded-2xl border border-[#E4E9EC] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5F7F8]">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#5E6E7C]">
                    Nama
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#5E6E7C]">
                    No. HP
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#5E6E7C]">
                    Alamat
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#5E6E7C]">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-t border-[#E4E9EC]">
                    <td className="px-6 py-4 font-medium text-[#10263B]">
                      {customer.name}
                    </td>

                    <td className="px-6 py-4 text-[#5E6E7C]">
                      {customer.phone ?? '-'}
                    </td>

                    <td className="px-6 py-4 text-[#5E6E7C]">
                      {customer.address ?? '-'}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-[#1F9C8B] hover:underline mr-4"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(customer)}
                        className="text-[#B3413F] hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pelanggan