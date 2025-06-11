"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Homepage } from "@/components/homepage"
import { GameTopup } from "@/components/game-topup"
import { QRISPayment } from "@/components/qris-payment"
import { Receipt } from "@/components/receipt"
import { CustomerService } from "@/components/customer-service"
import { Zap, Search, ArrowLeft, MessageCircle } from "lucide-react"
import { getProviders, createOrder, type Provider } from "@/lib/api"
// Import AdminNotice component
import { AdminNotice } from "@/components/admin-notice"

export default function Home() {
  // State management
  const [providers, setProviders] = useState<Provider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Navigation state
  const [pageState, setPageState] = useState("homepage")
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)

  // Transaction state
  const [selectedProductCode, setSelectedProductCode] = useState("")
  const [selectedProductName, setSelectedProductName] = useState("")
  const [selectedPrice, setSelectedPrice] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [orderReference, setOrderReference] = useState("")

  // UI state
  const [isCustomerServiceOpen, setIsCustomerServiceOpen] = useState(false)

  // Tambahkan state untuk menampilkan pesan admin
  const [showAdminMessage, setShowAdminMessage] = useState(false)

  // Tambahkan fungsi untuk menampilkan pesan admin
  const handleShowAdminMessage = () => {
    setShowAdminMessage(true)
    setTimeout(() => setShowAdminMessage(false), 10000) // Hilangkan pesan setelah 10 detik
  }

  // Load providers on component mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log("Fetching providers...")

        const providersData = await getProviders()
        console.log("Raw providers data:", providersData)
        console.log("First provider sample:", providersData[0])

        // Use all providers since status filtering isn't working
        const allProviders = providersData || []
        console.log("Total providers:", allProviders.length)

        // Filter out any providers that don't have required fields
        const validProviders = allProviders.filter((p) => p && p.code && p.name)
        console.log("Valid providers:", validProviders.length)

        setProviders(validProviders)
        setFilteredProviders(validProviders)

        if (validProviders.length === 0) {
          setError("Tidak ada game yang tersedia saat ini")
        }
      } catch (err) {
        console.error("Error fetching providers:", err)
        setError(err instanceof Error ? err.message : "Gagal memuat daftar game")
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [])

  // Filter providers based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProviders(providers)
    } else {
      const filtered = providers.filter(
        (provider) =>
          provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (provider.category && provider.category.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredProviders(filtered)
    }
  }, [searchQuery, providers])

  // Event handlers
  const handleGameSelect = (provider: Provider) => {
    setSelectedProvider(provider)
    setPageState("game-topup")
  }

  const handleTopupSubmit = (productCode: string, userData: Record<string, any>) => {
    setSelectedProductCode(productCode)
    setSelectedProductName(userData.productName || "Unknown Product")
    setSelectedPrice(userData.price || 0)
    setFormData(userData)
    setPageState("payment")
  }

  const handlePaymentComplete = async () => {
    if (!selectedProvider || !selectedProductCode) return

    try {
      // Create order via API
      const orderData = {
        target_product_code: selectedProductCode,
        data: formData,
      }

      const response = await createOrder(orderData)

      if (response.status === 200 && response.data) {
        setOrderReference(response.data.reference)
        setPageState("receipt")
      } else {
        // Handle error
        alert(response.message || "Gagal membuat pesanan")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Gagal membuat pesanan. Silakan coba lagi.")
    }
  }

  const handleBackToHome = () => {
    setPageState("homepage")
    setSelectedProvider(null)
    setSelectedProductCode("")
    setSelectedProductName("")
    setSelectedPrice(0)
    setFormData({})
    setOrderReference("")
  }

  const handleBackToForm = () => {
    setPageState("game-topup")
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {showAdminMessage && (
        <div className="fixed top-20 inset-x-0 z-50 flex justify-center">
          <div className="bg-blue-900/90 border border-blue-500 text-white px-4 py-3 rounded-md shadow-lg max-w-md mx-4">
            <p className="text-sm">
              <span className="font-bold">Pesan Admin:</span> API key sedang dalam proses aktivasi. Silakan hubungi
              admin di WhatsApp 083848319444 untuk informasi lebih lanjut.
            </p>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="border-b border-blue-500/30 bg-black/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {pageState !== "homepage" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToHome}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-950/30"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-blue-500" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  NotzShop
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {pageState === "homepage" && (
                <div className="relative max-w-md w-full mr-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari game..."
                    className="pl-10 bg-gray-900 border-gray-700 focus:border-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-900/20"
                onClick={() => setIsCustomerServiceOpen(true)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Bantuan</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <AdminNotice />
        {pageState === "homepage" && (
          <Homepage providers={filteredProviders} loading={loading} error={error} onGameSelect={handleGameSelect} />
        )}

        {pageState === "game-topup" && selectedProvider && (
          <GameTopup provider={selectedProvider} onSubmit={handleTopupSubmit} />
        )}

        {pageState === "payment" && selectedProvider && (
          <QRISPayment
            provider={selectedProvider.name}
            productName={selectedProductName}
            formData={formData}
            price={selectedPrice}
            onPaymentComplete={handlePaymentComplete}
            onBackToForm={handleBackToForm}
          />
        )}

        {pageState === "receipt" && selectedProvider && orderReference && (
          <Receipt
            reference={orderReference}
            provider={selectedProvider.name}
            productName={selectedProductName}
            formData={formData}
            price={selectedPrice}
            onNewTransaction={handleBackToHome}
          />
        )}
      </div>

      {/* Customer Service Modal */}
      <CustomerService isOpen={isCustomerServiceOpen} onClose={() => setIsCustomerServiceOpen(false)} />

      {/* Floating CS Button (Mobile) */}
      <div className="fixed bottom-6 right-6 md:hidden z-20">
        <Button
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
          onClick={() => setIsCustomerServiceOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-blue-500/30 py-6 bg-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">© 2025 NotzShop. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-blue-400"
                onClick={() => setIsCustomerServiceOpen(true)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Customer Service
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
