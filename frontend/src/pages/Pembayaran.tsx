import { useEffect, useState } from 'react'
import {
  createPayment,
  deletePayment,
  getOrders,
  getPayments,
} from '../services/api'

type Customer = {
  id: number
  name: string
}

type Order = {
  id: number
  order_number: string
  total_amount: string
  paid_amount: string
  payment_status: string
  customer: Customer
}

type Payment = {
  id: number
  order_id: number
  amount: string
  payment_method: string
  notes: string | null
  paid_at: string
  order: {
    id: number
    order_number: string
    customer: Customer
  }
}

function Pembayaran() {
  const [orders, setOrders] = useState<Order[]>([])
  const [payments, setPayments] = useState<Payment[]>([])

  const [orderId, setOrderId] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [notes, setNotes] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadData() {
    try {
      setLoading(true)
      setError('')

      const [ordersResponse, paymentsResponse] = await Promise.all([
        getOrders(),
        getPayments(),
      ])

      setOrders(ordersResponse.data)
      setPayments(paymentsResponse.data)
    } catch (error) {
      console.error(error)
      setError('Gagal mengambil data pembayaran.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const unpaidOrders = orders.filter((order) => {
    const total = Number(order.total_amount)
    const paid = Number(order.paid_amount)

    return total > paid
  })

  const selectedOrder = orders.find(
    (order) => order.id === Number(orderId),
  )

  const totalAmount = selectedOrder
    ? Number(selectedOrder.total_amount)
    : 0

  const paidAmount = selectedOrder
    ? Number(selectedOrder.paid_amount)
    : 0

  const remainingAmount = totalAmount - paidAmount

  function formatRupiah(value: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(date))
  }

  function handleOrderChange(value: string) {
    setOrderId(value)
    setAmount('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setError('')

    if (!orderId) {
      setError('Silakan pilih pesanan.')
      return
    }

    const paymentAmount = Number(amount)

    if (!paymentAmount || paymentAmount <= 0) {
      setError('Nominal pembayaran harus lebih dari 0.')
      return
    }

    if (paymentAmount > remainingAmount) {
      setError(
        `Nominal pembayaran melebihi sisa pembayaran ${formatRupiah(
          remainingAmount,
        )}.`,
      )
      return
    }

    try {
      setSaving(true)

      await createPayment({
        order_id: Number(orderId),
        amount: paymentAmount,
        payment_method: paymentMethod,
        notes: notes,
      })

      setOrderId('')
      setAmount('')
      setPaymentMethod('cash')
      setNotes('')

      await loadData()
    } catch (error) {
      console.error(error)
      setError('Gagal menambahkan pembayaran.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      'Yakin ingin menghapus pembayaran ini?',
    )

    if (!confirmed) {
      return
    }

    try {
      setError('')

      await deletePayment(id)

      await loadData()
    } catch (error) {
      console.error(error)
      setError('Gagal menghapus pembayaran.')
    }
  }

  return (
    <div>
      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">
          Pembayaran
        </h2>

        <p className="text-slate-500 mt-1">
          Kelola pembayaran dan riwayat transaksi pelanggan.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* FORM PEMBAYARAN */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h3 className="text-xl font-semibold text-slate-900 mb-6">
          Tambah Pembayaran
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* PESANAN */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pesanan
              </label>

              <select
                value={orderId}
                onChange={(e) =>
                  handleOrderChange(e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              >
                <option value="">
                  Pilih pesanan
                </option>

                {unpaidOrders.map((order) => (
                  <option
                    key={order.id}
                    value={order.id}
                  >
                    {order.order_number} - {order.customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* NOMINAL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nominal Pembayaran
              </label>

              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                placeholder="Masukkan nominal"
                disabled={!selectedOrder}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
              />
            </div>

            {/* METODE */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Metode Pembayaran
              </label>

              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              >
                <option value="cash">
                  Cash
                </option>

                <option value="transfer">
                  Transfer
                </option>

                <option value="qris">
                  QRIS
                </option>
              </select>
            </div>

            {/* CATATAN */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Catatan
              </label>

              <input
                type="text"
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                placeholder="Catatan pembayaran"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>
          </div>

          {/* INFO PESANAN */}
          {selectedOrder && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Total Pesanan
                </p>

                <p className="text-lg font-bold text-slate-900 mt-1">
                  {formatRupiah(totalAmount)}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Sudah Dibayar
                </p>

                <p className="text-lg font-bold text-slate-900 mt-1">
                  {formatRupiah(paidAmount)}
                </p>
              </div>

              <div className="rounded-lg bg-amber-50 p-4">
                <p className="text-sm text-amber-700">
                  Sisa Pembayaran
                </p>

                <p className="text-lg font-bold text-amber-700 mt-1">
                  {formatRupiah(remainingAmount)}
                </p>
              </div>
            </div>
          )}

          {/* BUTTON */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={saving || !selectedOrder}
              className="rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving
                ? 'Menyimpan...'
                : 'Simpan Pembayaran'}
            </button>
          </div>
        </form>
      </div>

      {/* RIWAYAT PEMBAYARAN */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-xl font-semibold text-slate-900">
            Riwayat Pembayaran
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-slate-500">
            Memuat data...
          </div>
        ) : payments.length === 0 ? (
          <div className="p-6 text-slate-500">
            Belum ada pembayaran.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    No. Pesanan
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Pelanggan
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Nominal
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Metode
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Tanggal
                  </th>

                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-t border-slate-200"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">
                        {payment.order.order_number}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {payment.order.customer.name}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-900">
                      {formatRupiah(
                        Number(payment.amount),
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm capitalize text-slate-700">
                        {payment.payment_method}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(payment.paid_at)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(payment.id)
                        }
                        className="text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Pembayaran