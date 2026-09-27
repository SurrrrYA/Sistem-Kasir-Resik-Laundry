import { useEffect, useState } from 'react'

import {
  createService,
  getServices,
  updateService,
  deleteService,
} from '../services/api'

type Service = {
  id: number
  name: string
  unit: string
  price: string
  is_active: boolean
}

type User = {
  id: number
  name: string
  email: string
  role: 'owner' | 'kasir'
}

function formatRupiah(value: string) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-[#1F9C8B]/10 text-[#177567]">
      Aktif
    </span>
  ) : (
    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-[#E4E9EC] text-[#5E6E7C]">
      Tidak Aktif
    </span>
  )
}

function Layanan() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState('')
  const [unit, setUnit] = useState('kg')
  const [price, setPrice] = useState('')
  const [isActive, setIsActive] = useState(true)

  const [saving, setSaving] = useState(false)

  const [editingService, setEditingService] = useState<Service | null>(
    null,
  )

  const storedUser = localStorage.getItem('user')

  let user: User | null = null

  if (storedUser) {
    try {
      user = JSON.parse(storedUser)
    } catch {
      user = null
    }
  }

  const isOwner = user?.role === 'owner'

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true)
        setError('')

        const result = await getServices()

        setServices(result.data ?? [])
      } catch {
        setError('Gagal mengambil data layanan.')
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  function handleAdd() {
    setEditingService(null)

    setName('')
    setUnit('kg')
    setPrice('')
    setIsActive(true)

    setError('')
    setShowForm(true)
  }

  function handleEdit(service: Service) {
    setEditingService(service)

    setName(service.name)
    setUnit(service.unit)
    setPrice(service.price)
    setIsActive(service.is_active)

    setError('')
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingService(null)

    setName('')
    setUnit('kg')
    setPrice('')
    setIsActive(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isOwner) {
      setError('Anda tidak memiliki akses.')
      return
    }

    try {
      setSaving(true)
      setError('')

      const serviceData = {
        name,
        unit,
        price: Number(price),
        is_active: isActive,
      }

      if (editingService) {
        const result = await updateService(
          editingService.id,
          serviceData,
        )

        setServices((currentServices) =>
          currentServices.map((service) =>
            service.id === editingService.id ? result.data : service,
          ),
        )
      } else {
        const result = await createService(serviceData)

        setServices((currentServices) => [result.data, ...currentServices])
      }

      handleCancel()
    } catch {
      setError(
        editingService
          ? 'Gagal memperbarui layanan.'
          : 'Gagal menambahkan layanan.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(service: Service) {
    if (!isOwner) {
      setError('Anda tidak memiliki akses.')
      return
    }

    const confirmed = window.confirm(
      `Yakin ingin menghapus layanan "${service.name}"?`,
    )

    if (!confirmed) {
      return
    }

    try {
      setError('')

      await deleteService(service.id)

      setServices((currentServices) =>
        currentServices.filter((item) => item.id !== service.id),
      )
    } catch {
      setError('Gagal menghapus layanan.')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-semibold text-[#10263B] tracking-tight">
            Layanan
          </h2>

          <p className="text-[#5E6E7C] mt-1">
            Kelola layanan dan harga laundry.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={handleAdd}
            className="bg-[#10263B] text-white px-5 py-3 rounded-xl hover:bg-[#0B1D2C] transition w-full sm:w-auto"
          >
            + Tambah Layanan
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-[#FBEAEA] text-[#B3413F] px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && isOwner && (
        <div className="bg-white rounded-2xl border border-[#E4E9EC] p-5 sm:p-6 mb-6">
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h3 className="text-xl font-semibold text-[#10263B]">
                {editingService ? 'Edit Layanan' : 'Tambah Layanan'}
              </h3>

              <p className="text-sm text-[#5E6E7C] mt-1">
                {editingService
                  ? 'Perbarui data layanan.'
                  : 'Masukkan data layanan baru.'}
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
                  Nama Layanan
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  placeholder="Contoh: Cuci Kering"
                  className="w-full border border-[#D8DEE2] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F9C8B] focus:border-[#1F9C8B]"
                />
              </div>

              {/* Satuan */}
              <div>
                <label className="block text-sm font-medium text-[#10263B] mb-2">
                  Satuan
                </label>

                <select
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                  className="w-full border border-[#D8DEE2] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F9C8B] focus:border-[#1F9C8B]"
                >
                  <option value="kg">Kg</option>
                  <option value="pcs">Pcs</option>
                  <option value="meter">Meter</option>
                  <option value="item">Item</option>
                </select>
              </div>

              {/* Harga */}
              <div>
                <label className="block text-sm font-medium text-[#10263B] mb-2">
                  Harga
                </label>

                <input
                  type="number"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  required
                  min="0"
                  placeholder="7000"
                  className="w-full border border-[#D8DEE2] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F9C8B] focus:border-[#1F9C8B]"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-[#10263B] mb-2">
                  Status
                </label>

                <select
                  value={isActive ? 'active' : 'inactive'}
                  onChange={(event) =>
                    setIsActive(event.target.value === 'active')
                  }
                  className="w-full border border-[#D8DEE2] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F9C8B] focus:border-[#1F9C8B]"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
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
                  : editingService
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
      {!loading && services.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E4E9EC] p-8 text-center text-[#5E6E7C]">
          Belum ada layanan.
        </div>
      )}

      {/* Mobile: card list (below md) */}
      {!loading && services.length > 0 && (
        <div className="grid gap-4 md:hidden">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-[#E4E9EC] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#10263B]">
                    {service.name}
                  </p>

                  <p className="text-sm text-[#5E6E7C] mt-0.5">
                    Satuan: {service.unit}
                  </p>
                </div>

                <StatusBadge isActive={service.is_active} />
              </div>

              <p className="font-semibold text-[#10263B] mt-3">
                {formatRupiah(service.price)}
              </p>

              {isOwner && (
                <div className="flex gap-4 mt-4 pt-4 border-t border-[#E4E9EC]">
                  <button
                    onClick={() => handleEdit(service)}
                    className="text-sm text-[#1F9C8B] font-medium"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(service)}
                    className="text-sm text-[#B3413F] font-medium"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Desktop / tablet: table (md and up) */}
      {!loading && services.length > 0 && (
        <div className="hidden md:block bg-white rounded-2xl border border-[#E4E9EC] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5F7F8]">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#5E6E7C]">
                    Layanan
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#5E6E7C]">
                    Satuan
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#5E6E7C]">
                    Harga
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#5E6E7C]">
                    Status
                  </th>

                  {isOwner && (
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#5E6E7C]">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-t border-[#E4E9EC]">
                    <td className="px-6 py-4 font-medium text-[#10263B]">
                      {service.name}
                    </td>

                    <td className="px-6 py-4 text-[#5E6E7C]">
                      {service.unit}
                    </td>

                    <td className="px-6 py-4 text-[#5E6E7C]">
                      {formatRupiah(service.price)}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge isActive={service.is_active} />
                    </td>

                    {isOwner && (
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-[#1F9C8B] hover:underline mr-4"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(service)}
                          className="text-[#B3413F] hover:underline"
                        >
                          Hapus
                        </button>
                      </td>
                    )}
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

export default Layanan