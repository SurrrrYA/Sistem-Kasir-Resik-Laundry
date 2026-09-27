import { useEffect, useMemo, useState } from 'react'
import { getOrders } from '../services/api'

type Customer = {
  id: number
  name: string
}

type Service = {
  id: number
  name: string
  unit: string
}

type OrderItem = {
  id: number
  service_id: number
  quantity: number
  price: string
  subtotal: string
  service?: Service
}

type Order = {
  id: number
  order_number: string
  total_amount: string
  paid_amount: string
  payment_status: 'unpaid' | 'partial' | 'paid'
  status: 'received' | 'processing' | 'ready' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
  customer?: Customer
  items: OrderItem[]
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getPaymentStatusLabel(status: Order['payment_status']) {
  if (status === 'paid') return 'Lunas'
  if (status === 'partial') return 'Sebagian'
  return 'Belum Dibayar'
}

function getOrderStatusLabel(status: Order['status']) {
  const labels: Record<Order['status'], string> = {
    received: 'Diterima',
    processing: 'Diproses',
    ready: 'Siap Diambil',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  }

  return labels[status]
}

function getPaymentStatusClass(status: Order['payment_status']) {
  if (status === 'paid') {
    return 'bg-emerald-100 text-emerald-700'
  }

  if (status === 'partial') {
    return 'bg-amber-100 text-amber-700'
  }

  return 'bg-red-100 text-red-700'
}

function getOrderStatusClass(status: Order['status']) {
  if (status === 'completed') {
    return 'bg-emerald-100 text-emerald-700'
  }

  if (status === 'cancelled') {
    return 'bg-red-100 text-red-700'
  }

  if (status === 'ready') {
    return 'bg-blue-100 text-blue-700'
  }

  if (status === 'processing') {
    return 'bg-purple-100 text-purple-700'
  }

  return 'bg-slate-100 text-slate-700'
}

function Laporan() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      setLoading(true)
      setError('')

      const response = await getOrders()

      setOrders(response.data ?? [])
    } catch (error) {
      console.error(error)
      setError('Gagal mengambil data laporan.')
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = new Date(order.created_at)
        .toISOString()
        .split('T')[0]

      if (startDate && orderDate < startDate) {
        return false
      }

      if (endDate && orderDate > endDate) {
        return false
      }

      return true
    })
  }, [orders, startDate, endDate])

  const summary = useMemo(() => {
    const totalTransactions = filteredOrders.length

    const totalOrders = filteredOrders.reduce(
      (total, order) => {
        if (order.status === 'cancelled') {
          return total
        }

        return total + Number(order.total_amount)
      },
      0,
    )

    const totalPaid = filteredOrders.reduce(
      (total, order) => {
        if (order.status === 'cancelled') {
          return total
        }

        return total + Number(order.paid_amount)
      },
      0,
    )

    const totalRemaining = filteredOrders.reduce(
      (total, order) => {
        if (order.status === 'cancelled') {
          return total
        }

        return (
          total +
          Math.max(
            0,
            Number(order.total_amount) -
              Number(order.paid_amount),
          )
        )
      },
      0,
    )

    return {
      totalTransactions,
      totalOrders,
      totalPaid,
      totalRemaining,
    }
  }, [filteredOrders])

  function resetFilter() {
    setStartDate('')
    setEndDate('')
  }

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Laporan
          </h2>

          <p className="text-slate-500 mt-1">
            Laporan transaksi dan pembayaran laundry.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
        >
          Refresh
        </button>
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
        <h3 className="font-semibold text-slate-900">
          Filter Laporan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Dari Tanggal
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Sampai Tanggal
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilter}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mt-6">
          {error}
        </div>
      )}

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-slate-500">
            Total Transaksi
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            {summary.totalTransactions}
          </h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-slate-500">
            Total Pesanan
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            {formatRupiah(summary.totalOrders)}
          </h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-slate-500">
            Sudah Dibayar
          </p>

          <h3 className="text-2xl font-bold text-emerald-600 mt-2">
            {formatRupiah(summary.totalPaid)}
          </h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-slate-500">
            Sisa Pembayaran
          </p>

          <h3 className="text-2xl font-bold text-amber-600 mt-2">
            {formatRupiah(summary.totalRemaining)}
          </h3>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm mt-6 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">
            Data Transaksi
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Menampilkan {filteredOrders.length} transaksi.
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500">
            Memuat data laporan...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            Tidak ada transaksi pada periode yang dipilih.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    No
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Pesanan
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Tanggal
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Pelanggan
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Total
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Dibayar
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Sisa
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Pembayaran
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order, index) => {
                  const total = Number(order.total_amount)
                  const paid = Number(order.paid_amount)

                  const remaining =
                    Math.max(0, total - paid)

                  return (
                    <tr
                      key={order.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {index + 1}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {order.order_number}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(order.created_at)}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {order.customer?.name ?? '-'}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {formatRupiah(total)}
                      </td>

                      <td className="px-6 py-4 text-sm text-emerald-600 font-medium">
                        {formatRupiah(paid)}
                      </td>

                      <td className="px-6 py-4 text-sm text-amber-600 font-medium">
                        {formatRupiah(remaining)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatusClass(
                            order.payment_status,
                          )}`}
                        >
                          {getPaymentStatusLabel(
                            order.payment_status,
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getOrderStatusClass(
                            order.status,
                          )}`}
                        >
                          {getOrderStatusLabel(order.status)}
                        </span>
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

export default Laporan