// Enhanced payment handler dengan format API Wendigg yang benar

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

// Create pending order dengan validasi yang lebih ketat
export async function createPendingOrder(orderData: {
  provider: string
  productCode: string
  productName: string
  userData: Record<string, any>
  amount: number
}): Promise<string> {
  console.log("Creating pending order with data:", orderData)

  // Validasi input
  if (!orderData.productCode) {
    throw new Error("Product code is required")
  }
  if (!orderData.userData.id) {
    throw new Error("User ID is required")
  }
  if (!orderData.amount || orderData.amount <= 0) {
    throw new Error("Amount must be greater than 0")
  }

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

  console.log("Saving pending order:", pendingOrder)
  await savePendingOrder(pendingOrder)

  // Verifikasi order tersimpan
  const savedOrder = await getPendingOrder(reference)
  if (!savedOrder) {
    throw new Error("Failed to save order")
  }

  console.log("Order saved successfully:", reference)
  return reference
}

// Confirm payment dengan error handling yang lebih baik
export async function confirmPayment(reference: string, paymentProof?: string): Promise<boolean> {
  console.log("Confirming payment for reference:", reference)

  const order = await getPendingOrder(reference)
  console.log("Found order:", order)

  if (!order) {
    // Coba ambil semua orders untuk debugging
    const allOrders = await getAllOrders()
    console.log(
      "All orders in storage:",
      allOrders.map((o) => ({ ref: o.reference, status: o.status })),
    )
    throw new Error(`Order dengan reference ${reference} tidak ditemukan. Mungkin order sudah expired atau terhapus.`)
  }

  if (order.status !== "pending") {
    throw new Error(
      `Order status saat ini: ${order.status}. Hanya order dengan status 'pending' yang bisa dikonfirmasi.`,
    )
  }

  // Update status
  order.status = "paid"
  order.paymentProof = paymentProof
  await updatePendingOrder(order)

  // Verifikasi update berhasil
  const updatedOrder = await getPendingOrder(reference)
  if (!updatedOrder || updatedOrder.status !== "paid") {
    throw new Error("Failed to update order status")
  }

  console.log("Payment confirmed successfully for:", reference)

  // Send notification to admin
  await notifyAdmin(order)
  return true
}

// Admin approve payment
export async function approvePayment(reference: string, adminUsername: string): Promise<boolean> {
  console.log("Admin approving payment:", reference)

  const order = await getPendingOrder(reference)
  if (!order) {
    throw new Error("Order tidak ditemukan")
  }

  if (order.status !== "paid") {
    throw new Error(`Order status: ${order.status}, expected: paid`)
  }

  try {
    order.status = "processing"
    order.processedBy = adminUsername
    order.processedAt = new Date()
    await updatePendingOrder(order)

    // Call actual Wendigg API dengan format yang benar
    const wendiggResponse = await callWendiggAPI(order)

    if (wendiggResponse.success) {
      order.status = "completed"
      order.wendiggReference = wendiggResponse.reference
      order.adminNotes = "Berhasil diproses ke Wendigg"
    } else {
      order.status = "failed"
      order.adminNotes = `Gagal proses ke Wendigg: ${wendiggResponse.message}`
    }

    await updatePendingOrder(order)
    console.log("Order processing completed:", order.status)
    return true
  } catch (error) {
    console.error("Error in approvePayment:", error)
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

// Implementasi API Wendigg yang benar sesuai dokumentasi
async function callWendiggAPI(
  order: PendingOrder,
): Promise<{ success: boolean; reference?: string; message?: string }> {
  try {
    const API_BASE_URL = "https://tokowendigg.com/api/prepaid"
    const API_KEY = "212|J0JTFZkNdM5wUQSowVABhhubqt4pTani3HHOk2Av"
    const SECRET_KEY = "YOUR_SECRET_KEY_HERE" // Ganti dengan secret key yang benar

    // Format payload sesuai dokumentasi Wendigg
    const payload = {
      target_product_code: order.productCode, // Format: MLBB-BJ-V3-ALLMLBB_ID_5
      id: order.userData.id, // Level root, bukan dalam object data
      ...(order.userData.server && { server: order.userData.server }), // Conditional server
    }

    console.log("Calling Wendigg API with payload:", payload)

    const response = await fetch(`${API_BASE_URL}/transaction/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Signature: SECRET_KEY, // Header signature sesuai dokumentasi
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()
    console.log("Wendigg API response:", result)

    if (response.ok && result.status === 200 && result.data) {
      return {
        success: true,
        reference: result.data.reference || result.data.id,
        message: "Success",
      }
    } else {
      return {
        success: false,
        message: result.message || `HTTP ${response.status}: ${response.statusText}`,
      }
    }
  } catch (error) {
    console.error("Error calling Wendigg API:", error)
    return {
      success: false,
      message: `Network error: ${error.message}`,
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
🔑 Product Code: ${order.productCode}
💰 Amount: Rp ${order.amount.toLocaleString("id-ID")}
👤 User ID: ${order.userData.id}
${order.userData.server ? `🌐 Server: ${order.userData.server}` : ""}
⏰ Waktu: ${order.createdAt.toLocaleString("id-ID")}
${order.paymentProof ? `📸 Bukti: ${order.paymentProof}` : ""}

Silakan cek mutasi rekening dan approve jika pembayaran sudah masuk.

Dashboard: ${window.location.origin}/admin
  `

  console.log("Admin notification:", message)
}

// Database functions dengan error handling yang lebih baik
async function savePendingOrder(order: PendingOrder) {
  try {
    const orders = JSON.parse(localStorage.getItem("pendingOrders") || "[]")
    orders.push(order)
    localStorage.setItem("pendingOrders", JSON.stringify(orders))
    console.log("Order saved to localStorage:", order.reference)
  } catch (error) {
    console.error("Error saving order:", error)
    throw new Error("Failed to save order to storage")
  }
}

export async function getPendingOrder(reference: string): Promise<PendingOrder | null> {
  try {
    const orders = JSON.parse(localStorage.getItem("pendingOrders") || "[]")
    const order = orders.find((o: PendingOrder) => o.reference === reference)
    console.log(`Getting order ${reference}:`, order ? "found" : "not found")
    return order || null
  } catch (error) {
    console.error("Error getting order:", error)
    return null
  }
}

async function updatePendingOrder(order: PendingOrder) {
  try {
    const orders = JSON.parse(localStorage.getItem("pendingOrders") || "[]")
    const index = orders.findIndex((o: PendingOrder) => o.reference === order.reference)
    if (index >= 0) {
      orders[index] = order
      localStorage.setItem("pendingOrders", JSON.stringify(orders))
      console.log("Order updated:", order.reference, "status:", order.status)
    } else {
      throw new Error("Order not found for update")
    }
  } catch (error) {
    console.error("Error updating order:", error)
    throw new Error("Failed to update order")
  }
}

// Utility function untuk debugging
export function debugOrders() {
  const orders = JSON.parse(localStorage.getItem("pendingOrders") || "[]")
  console.table(
    orders.map((o: PendingOrder) => ({
      reference: o.reference,
      status: o.status,
      productCode: o.productCode,
      amount: o.amount,
      createdAt: o.createdAt,
    })),
  )
}

// Utility function untuk clear orders (untuk testing)
export function clearAllOrders() {
  localStorage.removeItem("pendingOrders")
  console.log("All orders cleared")
}
