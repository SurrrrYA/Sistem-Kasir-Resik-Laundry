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

// ====================
// CUSTOMER
// ====================

export async function getCustomers() {
  const response = await fetch(`${API_URL}/customers`, {
    headers: getHeaders(),
  })

  if (!response.ok) {
    throw new Error('Gagal mengambil data customer')
  }

  return response.json()
}

export async function createCustomer(data: {
  name: string
  phone: string
  address: string
}) {
  const response = await fetch(`${API_URL}/customers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Gagal menambahkan customer')
  }

  return response.json()
}

export async function updateCustomer(
  id: number,
  data: {
    name: string
    phone: string
    address: string
  },
) {
  const response = await fetch(
    `${API_URL}/customers/${id}`,
    {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    },
  )

  if (!response.ok) {
    throw new Error('Gagal memperbarui customer')
  }

  return response.json()
}

export async function deleteCustomer(id: number) {
  const response = await fetch(
    `${API_URL}/customers/${id}`,
    {
      method: 'DELETE',
      headers: getHeaders(),
    },
  )

  if (!response.ok) {
    throw new Error('Gagal menghapus customer')
  }

  return response.json()
}

// ====================
// SERVICE
// ====================

export async function getServices() {
  const response = await fetch(`${API_URL}/services`, {
    headers: getHeaders(),
  })

  if (!response.ok) {
    throw new Error('Gagal mengambil data layanan')
  }

  return response.json()
}

export async function createService(data: {
  name: string
  unit: string
  price: number
  is_active: boolean
}) {
  const response = await fetch(`${API_URL}/services`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Gagal menambahkan layanan')
  }

  return response.json()
}

export async function updateService(
  id: number,
  data: {
    name: string
    unit: string
    price: number
    is_active: boolean
  },
) {
  const response = await fetch(
    `${API_URL}/services/${id}`,
    {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    },
  )

  if (!response.ok) {
    throw new Error('Gagal memperbarui layanan')
  }

  return response.json()
}

export async function deleteService(id: number) {
  const response = await fetch(
    `${API_URL}/services/${id}`,
    {
      method: 'DELETE',
      headers: getHeaders(),
    },
  )

  if (!response.ok) {
    throw new Error('Gagal menghapus layanan')
  }

  return response.json()
}

// ====================
// ORDER
// ====================

export async function getOrders() {
  const response = await fetch(`${API_URL}/orders`, {
    headers: getHeaders(),
  })

  if (!response.ok) {
    throw new Error('Gagal mengambil data pesanan')
  }

  return response.json()
}

export async function createOrder(data: {
  customer_id: number
  items: {
    service_id: number
    quantity: number
  }[]
  status: string
  notes: string
}) {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Gagal menambahkan pesanan')
  }

  return response.json()
}

export async function updateOrder(
  id: number,
  data: {
    customer_id: number
    items: {
      service_id: number
      quantity: number
    }[]
    status: string
    notes: string
  },
) {
  const response = await fetch(
    `${API_URL}/orders/${id}`,
    {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    },
  )

  if (!response.ok) {
    throw new Error('Gagal memperbarui pesanan')
  }

  return response.json()
}

export async function deleteOrder(id: number) {
  const response = await fetch(
    `${API_URL}/orders/${id}`,
    {
      method: 'DELETE',
      headers: getHeaders(),
    },
  )

  if (!response.ok) {
    throw new Error('Gagal menghapus pesanan')
  }

  return response.json()
}

// ====================
// PAYMENT
// ====================

export async function getPayments() {
  const response = await fetch(`${API_URL}/payments`, {
    headers: getHeaders(),
  })

  if (!response.ok) {
    throw new Error('Gagal mengambil data pembayaran')
  }

  return response.json()
}

export async function createPayment(data: {
  order_id: number
  amount: number
  payment_method: string
  notes: string
}) {
  const response = await fetch(`${API_URL}/payments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Gagal menambahkan pembayaran')
  }

  return response.json()
}

export async function deletePayment(id: number) {
  const response = await fetch(
    `${API_URL}/payments/${id}`,
    {
      method: 'DELETE',
      headers: getHeaders(),
    },
  )

  if (!response.ok) {
    throw new Error('Gagal menghapus pembayaran')
  }

  return response.json()
}