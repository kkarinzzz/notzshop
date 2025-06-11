// Enhanced payment handler dengan admin functions

export interface PendingOrder {
  id: string
  reference: string
  provider: string
  productCode: string
  productName: string
  userData: Record<string, any>
  amount: number
  qrisAmount: number
  status: "pending" | "paid" | "processing" | "completed" | "failed" | "expired" | "rejected"
  paymentProof?: string
  createdAt: Date
  expiresAt: Date
  adminNotes?: string
  wendiggReference?: string
  processedBy?: string
  processedAt?: Date
}

export interface OrderStats {
  total: number
  pending: number
  paid: number
  completed: number
  failed: number
  todayRevenue: number
  todayOrders: number
}

// Create pending order
export async function createPendingOrder(orderData: {
  provider: string
  productCode: string
  productName: string
  userData: Record<string, any>
  amount: number
}): Promise<string> {
  const reference = `NOTZ${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`

  const pendingOrder: PendingOrder = {
    id: reference,
    reference,
    provider: orderData.provider,
    productCode: orderData.productCode,
    productName: orderData.productName,
    userData: orderData.userData,
    amount: orderData.amount,
    qrisAmount: orderData.amount,
    status: "pending",
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 menit
  }

  await savePendingOrder(pendingOrder)
  return reference
}

// Confirm payment by user
export async function confirmPayment(reference: string, paymentProof?: string): Promise<boolean> {
  const order = await getPendingOrder(reference)
  if (!order || order.status !== "pending") {
    throw new Error("Order tidak ditemukan atau sudah diproses")
  }

  order.status = "paid"
  order.paymentProof = paymentProof
  await updatePendingOrder(order)

  // Send notification to admin
  await notifyAdmin(order)
  return true
}

// Admin approve payment
export async function approvePayment(reference: string, adminUsername: string): Promise<boolean> {
  const order = await getPendingOrder(reference)
  if (!order || order.status !== "paid") {
    throw new Error("Order belum dibayar atau sudah diproses")
  }

  try {
    order.status = "processing"
    order.processedBy = adminUsername
    order.processedAt = new Date()
    await updatePendingOrder(order)

    // Simulate API call to Wendigg (replace with actual API call)
    const wendiggResponse = await simulateWendiggAPI(order)

    if (wendiggResponse.success) {
      order.status = "completed"
      order.wendiggReference = wendiggResponse.reference
      order.adminNotes = "Berhasil diproses ke Wendigg"
    } else {
      order.status = "failed"
      order.adminNotes = `Gagal proses ke Wendigg: ${wendiggResponse.message}`
    }

    await updatePendingOrder(order)
    return true
  } catch (error) {
    order.status = "failed"
    order.adminNotes = `Error: ${error.message}`
    await updatePendingOrder(order)
    return false
  }
}

// Admin reject payment
export async function rejectPayment(reference: string, adminUsername: string, reason: string): Promise<boolean> {
  const order = await getPendingOrder(reference)
  if (!order || order.status !== "paid") {
    throw new Error("Order tidak dapat direject")
  }

  order.status = "rejected"
  order.processedBy = adminUsername
  order.processedAt = new Date()
  order.adminNotes = `Ditolak: ${reason}`
  await updatePendingOrder(order)

  return true
}

// Get all orders for admin
export async function getAllOrders(): Promise<PendingOrder[]> {
  const orders = JSON.parse(localStorage.getItem("pendingOrders") || "[]")
  return orders.sort(
    (a: PendingOrder, b: PendingOrder) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

// Get orders by status
export async function getOrdersByStatus(status: string): Promise<PendingOrder[]> {
  const orders = await getAllOrders()
  return orders.filter((order) => order.status === status)
}

// Get order statistics
export async function getOrderStats(): Promise<OrderStats> {
  const orders = await getAllOrders()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayOrders = orders.filter((order) => new Date(order.createdAt) >= today)

  const completedToday = todayOrders.filter((order) => order.status === "completed")
  const todayRevenue = completedToday.reduce((sum, order) => sum + order.amount, 0)

  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    paid: orders.filter((o) => o.status === "paid").length,
    completed: orders.filter((o) => o.status === "completed").length,
    failed: orders.filter((o) => o.status === "failed").length,
    todayRevenue,
    todayOrders: todayOrders.length,
  }
}

// Simulate Wendigg API call (replace with actual implementation)
async function simulateWendiggAPI(
  order: PendingOrder,
): Promise<{ success: boolean; reference?: string; message?: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Simulate 90% success rate
  if (Math.random() > 0.1) {
    return {
      success: true,
      reference: `WDG${Date.now()}`,
      message: "Success",
    }
  } else {
    return {
      success: false,
      message: "API Error: Product not available",
    }
  }
}

// Notification function
async function notifyAdmin(order: PendingOrder) {
  const message = `
🔔 PEMBAYARAN BARU - NotzShop

📱 Reference: ${order.reference}
🎮 Game: ${order.provider}
💎 Produk: ${order.productName}
💰 Amount: Rp ${order.amount.toLocaleString("id-ID")}
👤 User ID: ${order.userData.id}
${order.userData.server ? `🌐 Server: ${order.userData.server}` : ""}
⏰ Waktu: ${order.createdAt.toLocaleString("id-ID")}
${order.paymentProof ? `📸 Bukti: ${order.paymentProof}` : ""}

Silakan cek mutasi rekening dan approve jika pembayaran sudah masuk.

Dashboard: ${window.location.origin}/admin
  `

  console.log("Admin notification:", message)

  // You can implement actual notification here:
  // - WhatsApp API
  // - Telegram Bot
  // - Email
  // - Push notification
}

// Database functions (localStorage for demo)
async function savePendingOrder(order: PendingOrder) {
  const orders = JSON.parse(localStorage.getItem("pendingOrders") || "[]")
  orders.push(order)
  localStorage.setItem("pendingOrders", JSON.stringify(orders))
}

export async function getPendingOrder(reference: string): Promise<PendingOrder | null> {
  const orders = JSON.parse(localStorage.getItem("pendingOrders") || "[]")
  return orders.find((o: PendingOrder) => o.reference === reference) || null
}

async function updatePendingOrder(order: PendingOrder) {
  const orders = JSON.parse(localStorage.getItem("pendingOrders") || "[]")
  const index = orders.findIndex((o: PendingOrder) => o.reference === order.reference)
  if (index >= 0) {
    orders[index] = order
    localStorage.setItem("pendingOrders", JSON.stringify(orders))
  }
}
