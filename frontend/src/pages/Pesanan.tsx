import { useEffect, useState } from 'react'
import {
  createOrder,
  deleteOrder,
  getCustomers,
  getOrders,
  getServices,
  updateOrder,
} from '../services/api'

type Customer = {
  id: number
  name: string
}

type Service = {
  id: number
  name: string
  unit: string
  price: string
  is_active: boolean
}

type OrderItem = {
  id: number
  quantity: string
  price: string
  subtotal: string
  service: Service
}

type Order = {
  id: number
  order_number: string
  total_amount: string
  paid_amount: string
  payment_status: string
  status: string
  notes: string | null
  customer: Customer
  items: OrderItem[]
}

function formatRupiah(value: string | number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function getPaymentStatusLabel(status: string) {
  if (status === 'paid') {
    return 'Lunas'
  }

  if (status === 'partial') {
    return 'Sebagian'
  }

  return 'Belum Bayar'
}

function getOrderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    received: 'Diterima',
    processing: 'Diproses',
    ready: 'Siap Diambil',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  }

  return labels[status] ?? status
}

function PaymentBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-[#1F9C8B]/10 text-[#177567]',
    partial: 'bg-[#E8A33D]/15 text-[#9A6A1C]',
  }

  const style = styles[status] ?? 'bg-[#F0C9C9]/60 text-[#B3413F]'

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${style}`}
    >
      {getPaymentStatusLabel(status)}
    </span>
  )
}

function Pesanan() {
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [services, setServices] = useState<Service[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  const [customerId, setCustomerId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [status, setStatus] = useState('received')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const [ordersResult, customersResult, servicesResult] =
          await Promise.all([
            getOrders(),
            getCustomers(),
            getServices(),
          ])

        setOrders(ordersResult.data)
        setCustomers(customersResult.data)

        setServices(
          servicesResult.data.filter(
            (service: Service) => service.is_active,
          ),
        )
      } catch {
        setError('Gagal mengambil data pesanan.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  function handleAdd() {
    setEditingOrder(null)

    setCustomerId('')
    setServiceId('')
    setQuantity('')
    setStatus('received')
    setNotes('')

    setError('')
    setShowForm(true)
  }

  function handleEdit(order: Order) {
    if (order.payment_status === 'paid') {
      setError('Pesanan yang sudah lunas tidak dapat diedit.')
      return
    }

    if (!order.items.length) {
      setError('Pesanan tidak memiliki item layanan.')
      return
    }

    const item = order.items[0]

    setEditingOrder(order)

    setCustomerId(String(order.customer.id))
    setServiceId(String(item.service.id))
    setQuantity(String(item.quantity))
    setStatus(order.status)
    setNotes(order.notes ?? '')

    setError('')
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingOrder(null)

    setCustomerId('')
    setServiceId('')
    setQuantity('')
    setStatus('received')
    setNotes('')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!customerId || !serviceId || !quantity) {
      setError('Customer, layanan, dan jumlah wajib diisi.')
      return
    }

    if (editingOrder && editingOrder.payment_status === 'paid') {
      setError('Pesanan yang sudah lunas tidak dapat diedit.')
      return
    }

    try {
      setSaving(true)
      setError('')

      const data = {
        customer_id: Number(customerId),

        items: [
          {
            service_id: Number(serviceId),
            quantity: Number(quantity),
          },
        ],

        status,

        notes,
      }

      if (editingOrder) {
        const result = await updateOrder(editingOrder.id, data)

        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.id === editingOrder.id ? result.data : order,
          ),
        )
      } else {
        const result = await createOrder(data)

        setOrders((currentOrders) => [result.data, ...currentOrders])
      }

      handleCancel()
    } catch {
      setError(
        editingOrder
          ? 'Gagal memperbarui pesanan.'
          : 'Gagal menambahkan pesanan.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(order: Order) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus pesanan "${order.order_number}"?`,
    )

    if (!confirmed) {
      return
    }

    try {
      setError('')

      await deleteOrder(order.id)

      setOrders((currentOrders) =>
        currentOrders.filter((item) => item.id !== order.id),
      )
    } catch {
      setError('Gagal menghapus pesanan.')
    }
  }

  function getCurrentTotal() {
    const selectedService = services.find(
      (service) => String(service.id) === serviceId,
    )

    if (!selectedService || !quantity) {
      return 0
    }

    const price = Number(selectedService.price)
    const qty = Number(quantity)

    if (Number.isNaN(price) || Number.isNaN(qty)) {
      return 0
    }

    return price * qty
  }

  function getCurrentPaidAmount() {
    if (!editingOrder) {
      return 0
    }

    return Number(editingOrder.paid_amount)
  }

  function getCurrentRemainingAmount() {
    const total = getCurrentTotal()
    const paid = getCurrentPaidAmount()

    return Math.max(0, total - paid)
  }

  function getCurrentPaymentStatus() {
    const total = getCurrentTotal()
    const paid = getCurrentPaidAmount()

    if (paid <= 0) {
      return 'unpaid'
    }

    if (paid < total) {
      return 'partial'
    }

    if (paid === total) {
      return 'paid'
    }

    return 'overpaid'
  }

  const totalLessThanPaid =
    !!editingOrder && getCurrentTotal() < getCurrentPaidAmount()

  return (
    <div>
      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-semibold text-[#10263B] tracking-tight">
            Pesanan
          </h2>

          <p className="text-[#5E6E7C] mt-1">
            Kelola pesanan laundry pelanggan.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="bg-[#10263B] text-white px-5 py-3 rounded-xl hover:bg-[#0B1D2C] transition w-full sm:w-auto"
        >
          + Tambah Pesanan
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
                {editingOrder ? 'Edit Pesanan' : 'Tambah Pesanan'}
              </h3>

              <p className="text-sm text-[#5E6E7C] mt-1">
                {editingOrder
                  ? 'Perbarui data pesanan.'
                  : 'Masukkan data pesanan pelanggan.'}
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
              {/* Customer */}

              <div>
                <label className="block text-sm font-medium text-[#10263B] mb-2">
                  Pelanggan
                </label>

                <select
                  value={customerId}
                  onChange={(event) => setCustomerId(event.target.value)}
                  required
                  className="w-full border border-[#D8DEE2] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F9C8B] focus:border-[#1F9C8B]"
                >
                  <option value="">Pilih pelanggan</option>

                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service */}

              <div>
                <label className="block text-sm font-medium text-[#10263B] mb-2">
                  Layanan
                </label>

                <select
                  value={serviceId}
                  onChange={(event) => setServiceId(event.target.value)}
                  required
                  className="w-full border border-[#D8DEE2] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F9C8B] focus:border-[#1F9C8B]"
                >
                  <option value="">Pilih layanan</option>

                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {formatRupiah(service.price)}/
                      {service.unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}

              <div>
                <label className="block text-sm font-medium text-[#10263B] mb-2">
                  Jumlah / Kg
                </label>

                <input
                  type="number"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="Contoh: 3"
                  className="w-full border border-[#D8DEE2] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F9C8B] focus:border-[#1F9C8B]"
                />
              </div>

              {/* Status */}

              <div>
                <label className="block text-sm font-medium text-[#10263B] mb-2">
                  Status Pesanan
                </label>

                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="w-full border border-[#D8DEE2] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F9C8B] focus:border-[#1F9C8B]"
                >
                  <option value="received">Diterima</option>
                  <option value="processing">Diproses</option>
                  <option value="ready">Siap Diambil</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>

              {/* Notes */}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#10263B] mb-2">
                  Catatan
                </label>

                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  placeholder="Catatan pesanan..."
                  className="w-full border border-[#D8DEE2] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F9C8B] focus:border-[#1F9C8B]"
                />
              </div>
            </div>

            {/* Info pembayaran */}

            {editingOrder && (
              <div className="mt-5 bg-[#F5F7F8] rounded-xl p-4">
                <p className="text-sm text-[#5E6E7C]">
                  Pembayaran pesanan ini dikelola melalui menu
                  <span className="font-semibold text-[#10263B]">
                    {' '}
                    Pembayaran
                  </span>
                  .
                </p>

                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-8 mt-3">
                  <div>
                    <p className="text-xs text-[#5E6E7C]">
                      Total Pesanan
                    </p>

                    <p className="font-semibold text-[#10263B]">
                      {formatRupiah(getCurrentTotal())}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#5E6E7C]">
                      Sudah Dibayar
                    </p>

                    <p className="font-semibold text-[#10263B]">
                      {formatRupiah(getCurrentPaidAmount())}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#5E6E7C]">
                      Sisa Pembayaran
                    </p>

                    <p className="font-semibold text-[#10263B]">
                      {formatRupiah(getCurrentRemainingAmount())}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#5E6E7C]">
                      Status Pembayaran
                    </p>

                    <p
                      className={`font-semibold ${
                        getCurrentPaymentStatus() === 'paid'
                          ? 'text-[#177567]'
                          : getCurrentPaymentStatus() === 'partial'
                            ? 'text-[#9A6A1C]'
                            : getCurrentPaymentStatus() === 'overpaid'
                              ? 'text-[#B3413F]'
                              : 'text-[#10263B]'
                      }`}
                    >
                      {getCurrentPaymentStatus() === 'paid'
                        ? 'Lunas'
                        : getCurrentPaymentStatus() === 'partial'
                          ? 'Sebagian'
                          : getCurrentPaymentStatus() === 'overpaid'
                            ? 'Pembayaran Melebihi Total'
                            : 'Belum Bayar'}
                    </p>
                  </div>
                </div>

                {totalLessThanPaid && (
                  <div className="mt-4 bg-[#FBEAEA] text-[#B3413F] px-4 py-3 rounded-xl text-sm">
                    Total pesanan baru tidak boleh lebih kecil dari
                    jumlah yang sudah dibayar. Silakan sesuaikan jumlah
                    atau gunakan proses refund terlebih dahulu.
                  </div>
                )}
              </div>
            )}

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
                disabled={saving || totalLessThanPaid}
                className="px-5 py-3 rounded-xl bg-[#1F9C8B] text-white hover:bg-[#177567] disabled:opacity-50 order-1 sm:order-2"
              >
                {saving
                  ? 'Menyimpan...'
                  : editingOrder
                    ? 'Simpan Perubahan'
                    : 'Simpan Pesanan'}
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

      {!loading && orders.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E4E9EC] p-8 text-center text-[#5E6E7C]">
          Belum ada pesanan.
        </div>
      )}

      {/* Mobile: card list (below md) */}

      {!loading && orders.length > 0 && (
        <div className="grid gap-4 md:hidden">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-[#E4E9EC] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#10263B]">
                    {order.order_number}
                  </p>

                  <p className="text-sm text-[#5E6E7C] mt-0.5">
                    {order.customer.name}
                  </p>
                </div>

                <PaymentBadge status={order.payment_status} />
              </div>

              <p className="text-sm text-[#5E6E7C] mt-3">
                {order.items
                  .map(
                    (item) =>
                      `${item.service.name} (${item.quantity} ${item.service.unit})`,
                  )
                  .join(', ')}
              </p>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <p className="text-xs text-[#5E6E7C]">Total</p>
                  <p className="font-semibold text-[#10263B]">
                    {formatRupiah(order.total_amount)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-[#5E6E7C]">Status</p>
                  <p className="text-sm text-[#10263B]">
                    {getOrderStatusLabel(order.status)}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-4 pt-4 border-t border-[#E4E9EC]">
                {order.payment_status !== 'paid' && (
                  <button
                    onClick={() => handleEdit(order)}
                    className="text-sm text-[#1F9C8B] font-medium"
                  >
                    Edit
                  </button>
                )}

                <button
                  onClick={() => handleDelete(order)}
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

      {!loading && orders.length > 0 && (
        <div className="hidden md:block bg-white rounded-2xl border border-[#E4E9EC] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-[#F5F7F8]">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#5E6E7C]">
                    No. Pesanan
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#5E6E7C]">
                    Pelanggan
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#5E6E7C]">
                    Layanan
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#5E6E7C]">
                    Total
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#5E6E7C]">
                    Pembayaran
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#5E6E7C]">
                    Status
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#5E6E7C]">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-[#E4E9EC]">
                    <td className="px-6 py-4 font-medium text-[#10263B]">
                      {order.order_number}
                    </td>

                    <td className="px-6 py-4 text-[#5E6E7C]">
                      {order.customer.name}
                    </td>

                    <td className="px-6 py-4 text-[#5E6E7C]">
                      {order.items
                        .map(
                          (item) =>
                            `${item.service.name} (${item.quantity} ${item.service.unit})`,
                        )
                        .join(', ')}
                    </td>

                    <td className="px-6 py-4 font-medium text-[#10263B]">
                      {formatRupiah(order.total_amount)}
                    </td>

                    <td className="px-6 py-4">
                      <PaymentBadge status={order.payment_status} />
                    </td>

                    <td className="px-6 py-4 text-[#5E6E7C]">
                      {getOrderStatusLabel(order.status)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.payment_status !== 'paid' && (
                        <button
                          onClick={() => handleEdit(order)}
                          className="text-[#1F9C8B] hover:underline mr-4"
                        >
                          Edit
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(order)}
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

export default Pesanan