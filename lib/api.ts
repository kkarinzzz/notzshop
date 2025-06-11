// API Configuration
const API_BASE_URL = "https://tokowendigg.com/api/prepaid"
const API_KEY = "212|J0JTFZkNdM5wUQSowVABhhubqt4pTani3HHOk2Av"

// Types
export interface Provider {
  code: string
  name: string
  category: string
  thumbnail: string
  status: string
}

export interface Product {
  code: string
  name: string
  price: number
  status: string
}

export interface CreateOrderRequest {
  target_product_code: string
  data: Record<string, any>
}

export interface CreateOrderResponse {
  status: number
  data?: {
    reference: string
    provider: string
    product: string
    status: string
    invoice_url: string
    expired_at: string
  }
  message?: string
}

export interface OrderStatus {
  reference: string
  provider: string
  product: string
  status: "unpaid" | "processing" | "success" | "failed" | "refund" | "expired"
  status_at: string
  sn?: string
  note?: string
  created_at: string
  invoice_url: string
  expired_at: string
}

// API Functions
export async function getProviders(): Promise<Provider[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/provider`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result.data || []
  } catch (error) {
    console.error("Error fetching providers:", error)
    throw error
  }
}

export async function fetchProducts(provider: string): Promise<Product[]> {
  try {
    const apiKey = "212|J0JTFZkNdM5wUQSowVABhhubqt4pTani3HHOk2Av"
    const query = new URLSearchParams({
      provider: provider,
      active: "1",
    })

    const response = await fetch(`https://tokowendigg.com/api/prepaid/product?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("API Error:", errorData)
      throw new Error(`API Error: ${response.status} - ${errorData.message || "Unknown error"}`)
    }

    const data = await response.json()

    // Log the response to help with debugging
    console.log("API Response:", data)

    // Check if data has the expected structure
    if (!data.data || !Array.isArray(data.data)) {
      console.error("Unexpected API response format:", data)
      return []
    }

    // Map the API response to our Product type
    return data.data.map((item: any) => ({
      id: item.id || item.code || String(Math.random()),
      name: item.name || "Unknown Product",
      price: item.price || 0,
      description: item.description || "",
      image: item.image || "/placeholder.svg?height=200&width=200",
      provider: provider,
    }))
  } catch (error) {
    console.error("Error fetching products:", error)
    throw error
  }
}

export async function createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/transaction/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Error creating order:", error)
    throw error
  }
}

export async function checkOrderStatus(reference: string): Promise<OrderStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/transaction/${reference}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error checking order status:", error)
    throw error
  }
}
