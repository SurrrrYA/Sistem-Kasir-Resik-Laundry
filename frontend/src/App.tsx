import { useEffect, useState } from 'react'

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from 'react-router-dom'

import {
  getCustomers,
  getOrders,
  getPayments,
} from './services/api'

import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Pelanggan from './pages/Pelanggan'
import Layanan from './pages/Layanan'
import PesananPage from './pages/Pesanan'
import PembayaranPage from './pages/Pembayaran'
import Laporan from './pages/Laporan'
import ManajemenUser from './pages/ManajemenUser'

type Order = {
  id: number
  order_number?: string
  total_amount: string
  paid_amount: string
  status: string
  created_at: string
}

type Payment = {
  id: number
  amount: string
  paid_at: string
}

type User = {
  id: number
  name: string
  email: string
  role: 'owner' | 'kasir'
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

/* ---------- Icons (inline, no extra dependency) ---------- */

type IconProps = { className?: string }

function IconHome({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 11.5 12 4l8 7.5M6 9.5V20h5v-5.5h2V20h5V9.5"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconUsers({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle
        cx="9"
        cy="8"
        r="3.2"
        stroke="currentColor"
        strokeWidth={1.8}
      />

      <path
        d="M3.5 19c.6-3.2 2.9-5 5.5-5s4.9 1.8 5.5 5M15.5 7a3 3 0 1 1 0 6M20.5 19c-.4-2.4-1.7-4-3.5-4.7"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconTag({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M11.5 4H5a1 1 0 0 0-1 1v6.5a1 1 0 0 0 .3.7l9 9a1 1 0 0 0 1.4 0l6.5-6.5a1 1 0 0 0 0-1.4l-9-9a1 1 0 0 0-.7-.3Z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />

      <circle
        cx="8.2"
        cy="7.8"
        r="1.3"
        fill="currentColor"
      />
    </svg>
  )
}

function IconBag({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 8h12l1 12.2a1 1 0 0 1-1 1.1H6a1 1 0 0 1-1-1.1L6 8Z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />

      <path
        d="M9 8V6.5a3 3 0 0 1 6 0V8"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconCard({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect
        x="3"
        y="6"
        width="18"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth={1.8}
      />

      <path
        d="M3 10.5h18"
        stroke="currentColor"
        strokeWidth={1.8}
      />

      <path
        d="M7 15h4"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconChart({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 20V10M11 20V4M18 20v-7"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />

      <path
        d="M3 20h18"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconLogout({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M9 20H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h4"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M15 16l4-4-4-4M9 12h10"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconMenu({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconClose({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconRefresh({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 4v5h5M20 20v-5h-5"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M4.6 15a8 8 0 0 0 14.2 2.2M19.4 9A8 8 0 0 0 5.2 6.8"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ---------- Dashboard ---------- */

const STATUS_META: Record<
  string,
  { label: string; color: string }
> = {
  received: {
    label: 'Diterima',
    color: '#3B7DD8',
  },

  processing: {
    label: 'Diproses',
    color: '#E8A33D',
  },

  ready: {
    label: 'Siap Diambil',
    color: '#1F9C8B',
  },

  completed: {
    label: 'Selesai',
    color: '#177567',
  },

  cancelled: {
    label: 'Dibatalkan',
    color: '#B3413F',
  },
}

function getStatusMeta(status: string) {
  return (
    STATUS_META[status] ?? {
      label: status,
      color: '#5E6E7C',
    }
  )
}

function formatDateShort(value: string) {
  return new Date(value).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StatChip({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E4E9EC] flex items-center justify-between transition hover:border-[#1F9C8B]/40">
      <p className="text-sm text-[#5E6E7C]">
        {label}
      </p>

      <p
        className="text-xl font-semibold"
        style={{ color: accent }}
      >
        {value}
      </p>
    </div>
  )
}

function Dashboard() {
  const [customerCount, setCustomerCount] = useState(0)
  const [todayOrders, setTodayOrders] = useState(0)
  const [processingOrders, setProcessingOrders] =
    useState(0)
  const [todayIncome, setTodayIncome] = useState(0)

  const [statusCounts, setStatusCounts] =
    useState<Record<string, number>>({})

  const [recentOrders, setRecentOrders] =
    useState<Order[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setLoading(true)
      setError('')

      const [
        customerResponse,
        orderResponse,
        paymentResponse,
      ] = await Promise.all([
        getCustomers(),
        getOrders(),
        getPayments(),
      ])

      const customers = customerResponse.data ?? []

      const orders: Order[] =
        orderResponse.data ?? []

      const payments: Payment[] =
        paymentResponse.data ?? []

      const today = new Date()
        .toISOString()
        .split('T')[0]

      setCustomerCount(customers.length)

      const ordersToday = orders.filter(
        (order) => {
          return (
            new Date(order.created_at)
              .toISOString()
              .split('T')[0] === today
          )
        },
      )

      setTodayOrders(ordersToday.length)

      const processing = orders.filter(
        (order) =>
          order.status === 'processing',
      )

      setProcessingOrders(processing.length)

      const incomeToday = payments.reduce(
        (total, payment) => {
          const paymentDate = new Date(
            payment.paid_at,
          )
            .toISOString()
            .split('T')[0]

          if (paymentDate !== today) {
            return total
          }

          return (
            total + Number(payment.amount)
          )
        },
        0,
      )

      setTodayIncome(incomeToday)

      const counts: Record<string, number> = {}

      orders.forEach((order) => {
        counts[order.status] =
          (counts[order.status] ?? 0) + 1
      })

      setStatusCounts(counts)

      const sorted = [...orders].sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime(),
      )

      setRecentOrders(
        sorted.slice(0, 5),
      )
    } catch (error) {
      console.error(error)
      setError(
        'Gagal mengambil data dashboard.',
      )
    } finally {
      setLoading(false)
    }
  }

  const totalOrdersForBreakdown =
    Object.values(statusCounts).reduce(
      (total, count) =>
        total + count,
      0,
    )

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-[#10263B] tracking-tight">
            Dashboard
          </h2>

          <p className="text-[#5E6E7C] mt-1">
            Selamat datang di sistem Resik Laundry
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#10263B] text-white rounded-xl hover:bg-[#0B1D2C] transition"
        >
          <IconRefresh className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-[#FBEAEA] border border-[#F0C9C9] text-[#B3413F] rounded-xl p-4 mt-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-8">
        <div className="lg:col-span-2 rounded-2xl p-7 bg-[#10263B] text-white relative overflow-hidden">
          <p className="text-sm text-white/70 relative">
            Pendapatan Hari Ini
          </p>

          <h3 className="text-4xl sm:text-5xl font-semibold mt-3 tracking-tight relative">
            {loading
              ? '...'
              : formatRupiah(todayIncome)}
          </h3>

          <p className="text-sm text-white/60 mt-3 relative">
            Dihitung dari pembayaran yang tercatat hari ini.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <StatChip
            label="Pesanan Hari Ini"
            value={
              loading ? '...' : todayOrders
            }
            accent="#1F9C8B"
          />

          <StatChip
            label="Pelanggan"
            value={
              loading ? '...' : customerCount
            }
            accent="#3B7DD8"
          />

          <StatChip
            label="Pesanan Diproses"
            value={
              loading
                ? '...'
                : processingOrders
            }
            accent="#E8A33D"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <div className="bg-white rounded-2xl border border-[#E4E9EC] p-6">
          <h3 className="font-semibold text-[#10263B]">
            Status Pesanan Aktif
          </h3>

          {!loading &&
            totalOrdersForBreakdown === 0 && (
              <p className="text-sm text-[#5E6E7C] mt-3">
                Belum ada pesanan yang tercatat.
              </p>
            )}

          {totalOrdersForBreakdown > 0 && (
            <>
              <div className="flex w-full h-2.5 rounded-full overflow-hidden mt-4 bg-[#F5F7F8]">
                {Object.entries(
                  statusCounts,
                ).map(
                  ([status, count]) => (
                    <div
                      key={status}
                      style={{
                        width: `${
                          (count /
                            totalOrdersForBreakdown) *
                          100
                        }%`,
                        backgroundColor:
                          getStatusMeta(
                            status,
                          ).color,
                      }}
                    />
                  ),
                )}
              </div>

              <ul className="mt-5 space-y-3">
                {Object.entries(
                  statusCounts,
                ).map(
                  ([status, count]) => (
                    <li
                      key={status}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="flex items-center gap-2 text-[#5E6E7C]">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              getStatusMeta(
                                status,
                              ).color,
                          }}
                        />

                        {
                          getStatusMeta(
                            status,
                          ).label
                        }
                      </span>

                      <span className="font-medium text-[#10263B]">
                        {count}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#E4E9EC] p-6">
          <h3 className="font-semibold text-[#10263B]">
            Pesanan Terbaru
          </h3>

          {!loading &&
            recentOrders.length === 0 && (
              <p className="text-sm text-[#5E6E7C] mt-3">
                Belum ada pesanan terbaru.
              </p>
            )}

          <ul className="mt-4 divide-y divide-[#E4E9EC]">
            {recentOrders.map(
              (order) => (
                <li
                  key={order.id}
                  className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#10263B] truncate">
                      {order.order_number ??
                        `#${order.id}`}
                    </p>

                    <p className="text-xs text-[#5E6E7C] mt-0.5">
                      {formatDateShort(
                        order.created_at,
                      )}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-[#10263B]">
                      {formatRupiah(
                        Number(
                          order.total_amount,
                        ),
                      )}
                    </p>

                    <span
                      className="text-xs"
                      style={{
                        color:
                          getStatusMeta(
                            order.status,
                          ).color,
                      }}
                    >
                      {
                        getStatusMeta(
                          order.status,
                        ).label
                      }
                    </span>
                  </div>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

/* ---------- Navigation ---------- */

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    icon: IconHome,
    ownerOnly: false,
  },
  {
    to: '/pelanggan',
    label: 'Pelanggan',
    icon: IconUsers,
    ownerOnly: false,
  },
  {
    to: '/manajemen-user',
    label: 'Manajemen User',
    icon: IconUsers,
    ownerOnly: true,
  },
  {
    to: '/layanan',
    label: 'Layanan',
    icon: IconTag,
    ownerOnly: true,
  },
  {
    to: '/pesanan',
    label: 'Pesanan',
    icon: IconBag,
    ownerOnly: false,
  },
  {
    to: '/pembayaran',
    label: 'Pembayaran',
    icon: IconCard,
    ownerOnly: false,
  },
  {
    to: '/laporan',
    label: 'Laporan',
    icon: IconChart,
    ownerOnly: true,
  },
]

function Sidebar({
  user,
  onLogout,
  open,
  onClose,
}: {
  user: User | null
  onLogout: () => void
  open: boolean
  onClose: () => void
}) {
  const location = useLocation()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#10263B] text-white p-6 flex flex-col transition-transform duration-200 ${
          open
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Resik Laundry
            </h1>

            {user && (
              <div className="mt-3">
                <p className="text-sm text-white/70">
                  {user.name}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="lg:hidden text-white/70 hover:text-white"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-1 flex-1">
          {NAV_ITEMS.filter(
            (item) =>
              !item.ownerOnly ||
              user?.role === 'owner',
          ).map((item) => {
            const isActive =
              location.pathname ===
              item.to

            const Icon = item.icon

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive
                    ? 'bg-[#1F9C8B] text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />

                <span className="text-sm">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="pt-6 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-[#F0A0A0] hover:bg-[#B3413F]/10 transition"
          >
            <IconLogout className="w-[18px] h-[18px]" />

            <span className="text-sm">
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}

/* ---------- App shell ---------- */

function AppShell({
  user,
  onLogout,
}: {
  user: User | null
  onLogout: () => void
}) {
  const [sidebarOpen, setSidebarOpen] =
    useState(false)

  return (
    <div className="min-h-screen bg-[#F5F7F8] flex">
      <Sidebar
        user={user}
        onLogout={onLogout}
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-3 bg-white border-b border-[#E4E9EC] px-5 py-4">
          <button
            onClick={() =>
              setSidebarOpen(true)
            }
            className="text-[#10263B]"
          >
            <IconMenu className="w-6 h-6" />
          </button>

          <span className="font-semibold text-[#10263B]">
            Resik Laundry
          </span>
        </header>

        <main className="flex-1 p-5 lg:p-8">
          <Routes>
            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/pelanggan"
              element={<Pelanggan />}
            />

            <Route
              path="/manajemen-user"
              element={<ManajemenUser />}
            />

            <Route
              path="/layanan"
              element={<Layanan />}
            />

            <Route
              path="/pesanan"
              element={<PesananPage />}
            />

            <Route
              path="/pembayaran"
              element={<PembayaranPage />}
            />

            <Route
              path="/laporan"
              element={<Laporan />}
            />

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  )
}

/* ---------- App ---------- */

function App() {
  const token =
    localStorage.getItem('token')

  const storedUser =
    localStorage.getItem('user')

  let user: User | null = null

  if (storedUser) {
    try {
      user = JSON.parse(storedUser)
    } catch (error) {
      console.error(
        'Data user di localStorage tidak valid:',
        error,
      )
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    window.location.href = '/login'
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={
            token ? (
              <Navigate
                to="/"
                replace
              />
            ) : (
              <Login />
            )
          }
        />

        <Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>

        {/* Reset Password
            Tidak membutuhkan login */}
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* Semua halaman aplikasi */}
        <Route
          path="*"
          element={
            token ? (
              <AppShell
                user={user}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App