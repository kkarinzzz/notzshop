"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard, Loader2, AlertCircle, RefreshCw, MessageCircle, Star } from "lucide-react"
import { fetchProducts, type Provider, type Product } from "@/lib/api"
import { getCustomPrice, CUSTOM_PRICING } from "@/lib/pricing-config"

interface GameTopupProps {
  provider: Provider
  onSubmit: (productCode: string, formData: Record<string, any>) => void
}

export function GameTopup({ provider, onSubmit }: GameTopupProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [selectedProduct, setSelectedProduct] = useState("")

  const fetchProductsData = async () => {
    try {
      setLoading(true)
      setError(null)
      const productsData = await fetchProducts(provider.code)
      console.log("Fetched products raw:", productsData)

      // Handle different API response formats
      let productArray = []

      if (Array.isArray(productsData)) {
        productArray = productsData
      } else if (productsData && Array.isArray(productsData.data)) {
        productArray = productsData.data
      } else if (productsData && typeof productsData === "object") {
        productArray = Object.values(productsData).find((val) => Array.isArray(val)) || []
      }

      console.log("Product array:", productArray)

      // Map the products to our expected format with custom pricing
      const mappedProducts = productArray.map((item: any, index: number) => {
        const originalPrice =
          Number.parseInt(item.price) || Number.parseInt(item.sell_price) || Number.parseInt(item.amount) || 0

        const productCode = item.code || item.id || item.product_code || `product-${index}`

        // Gunakan custom pricing
        const finalPrice = getCustomPrice(provider.code, productCode, originalPrice)

        return {
          code: productCode,
          name: item.name || item.product_name || item.title || `Product ${index + 1}`,
          price: finalPrice,
          originalPrice: originalPrice, // Simpan harga asli untuk referensi
          status: item.status || "active",
        }
      })

      console.log("Mapped products with custom pricing:", mappedProducts)
      setProducts(mappedProducts)

      if (mappedProducts.length === 0) {
        setError(`Produk untuk ${provider.name} sedang tidak tersedia atau dalam maintenance`)
      }
    } catch (err) {
      console.error("Error fetching products:", err)
      setError(err instanceof Error ? err.message : "Gagal memuat produk")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const fetchedProducts = await fetchProducts(provider.code)
        console.log("Raw API response:", fetchedProducts)

        // Handle different API response formats safely
        let productArray = []

        if (Array.isArray(fetchedProducts)) {
          productArray = fetchedProducts
        } else if (fetchedProducts && Array.isArray(fetchedProducts.data)) {
          productArray = fetchedProducts.data
        } else if (fetchedProducts && typeof fetchedProducts === "object") {
          const values = Object.values(fetchedProducts)
          productArray = values.find((val) => Array.isArray(val)) || []
        }

        console.log("Extracted product array:", productArray)

        // Map the products to our expected format with custom pricing
        const mappedProducts = productArray.map((item: any, index: number) => {
          const originalPrice =
            Number.parseInt(item.price) || Number.parseInt(item.sell_price) || Number.parseInt(item.amount) || 0

          const productCode = item.code || item.id || item.product_code || `product-${index}`

          // Gunakan custom pricing
          const finalPrice = getCustomPrice(provider.code, productCode, originalPrice)

          return {
            code: productCode,
            name: item.name || item.product_name || item.title || `Product ${index + 1}`,
            price: finalPrice,
            originalPrice: originalPrice, // Simpan harga asli untuk referensi
            status: item.status || "active",
          }
        })

        console.log("Final mapped products with custom pricing:", mappedProducts)
        setProducts(mappedProducts)
        setError(null)
      } catch (error: any) {
        console.error("Failed to load products:", error)
        setProducts([])
        setError(`Failed to load products: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    if (provider.code) {
      loadProducts()
    }
  }, [provider.code])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct || Object.keys(formData).length === 0) return

    // Find the selected product to get its details
    const selectedProductData = products.find((p) => p.code === selectedProduct)
    if (!selectedProductData) return

    // Pass product code and form data to parent
    onSubmit(selectedProduct, {
      ...formData,
      productCode: selectedProduct, // Pastikan productCode disimpan dengan benar
      productName: selectedProductData.name,
      price: selectedProductData.price,
    })
  }

  const getRequiredFields = () => {
    // Common fields based on game type
    const commonFields = ["id"]

    // Add server field for games that typically need it
    if (
      provider.name.toLowerCase().includes("mobile legends") ||
      provider.name.toLowerCase().includes("free fire") ||
      provider.name.toLowerCase().includes("pubg") ||
      provider.name.toLowerCase().includes("ml") ||
      provider.name.toLowerCase().includes("ff")
    ) {
      return [...commonFields, "server"]
    }

    return commonFields
  }

  const requiredFields = getRequiredFields()
  const isFormValid = requiredFields.every((field) => formData[field]?.trim()) && selectedProduct

  // Fungsi untuk menentukan apakah produk populer (harga custom)
  const isPopularProduct = (productCode: string) => {
    const providerPricing = CUSTOM_PRICING[provider.code]
    return providerPricing && providerPricing[productCode]
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gray-900 border-blue-500/30 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <img
                src={provider.thumbnail || "/placeholder.svg"}
                alt={provider.name}
                className="h-20 w-20 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold">{provider.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{provider.category}</span>
                  <span className="text-sm text-gray-500">• {provider.code}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-blue-500/30">
          <CardHeader className="bg-gradient-to-r from-blue-900/50 to-black">
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-blue-500" /> Form Top-up {provider.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-400">Memuat produk...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Update the error handling section in the render method
  if (error || products.length === 0) {
    const handleContactAdmin = () => {
      const phoneNumber = "83848319444"
      const message = encodeURIComponent(
        `Halo Admin NotzShop, saya ingin bertanya tentang produk ${provider.name}. Error: ${error || "Produk tidak ditemukan"}`,
      )
      window.open(`https://wa.me/62${phoneNumber}?text=${message}`, "_blank")
    }

    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gray-900 border-blue-500/30 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <img
                src={provider.thumbnail || "/placeholder.svg"}
                alt={provider.name}
                className="h-20 w-20 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold">{provider.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{provider.category}</span>
                  <span className="text-sm text-gray-500">• {provider.code}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-blue-500/30">
          <CardContent className="p-6">
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <p className="text-yellow-400 text-lg mb-2">Produk Belum Tersedia</p>
              <p className="text-gray-300 text-base mb-4">
                {error || `Produk untuk ${provider.name} sedang dalam proses aktivasi.`}
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Sistem sedang dalam tahap pengembangan. Silakan hubungi admin untuk informasi lebih lanjut atau coba
                game lain.
              </p>

              <div className="space-y-3">
                <Button onClick={handleContactAdmin} className="bg-green-600 hover:bg-green-700">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Hubungi Admin via WhatsApp
                </Button>

                <Button onClick={fetchProductsData} variant="outline" className="border-blue-500/50 text-blue-400">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Coba Lagi
                </Button>

                <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-800 rounded-md">
                  <p>
                    <strong>Info Teknis:</strong>
                  </p>
                  <p>Provider: {provider.code}</p>
                  <p>Status: {error ? "API Error" : "404 Not Found"}</p>
                  <p>Solusi: Hubungi admin untuk aktivasi produk</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Game Header */}
      <Card className="bg-gray-900 border-blue-500/30 mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <img
              src={provider.thumbnail || "/placeholder.svg"}
              alt={provider.name}
              className="h-20 w-20 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold">{provider.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{provider.category}</span>
                <span className="text-sm text-gray-500">• {provider.code}</span>
              </div>
              <p className="text-sm text-green-400 mt-1">✓ {products.length} produk tersedia</p>
              <p className="text-xs text-yellow-400 mt-1">🔥 Harga terbaik & proses instan</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card className="bg-gray-900 border-blue-500/30">
        <CardHeader className="bg-gradient-to-r from-blue-900/50 to-black">
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-blue-500" /> Form Top-up {provider.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Dynamic Form Fields */}
              {requiredFields.includes("id") && (
                <div className="space-y-2">
                  <Label htmlFor="id">ID Pengguna</Label>
                  <Input
                    id="id"
                    placeholder={`Masukkan ID ${provider.name} kamu`}
                    className="bg-gray-800 border-gray-700 focus:border-blue-500"
                    value={formData.id || ""}
                    onChange={(e) => handleInputChange("id", e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">Pastikan ID yang kamu masukkan sudah benar</p>
                </div>
              )}

              {requiredFields.includes("server") && (
                <div className="space-y-2">
                  <Label htmlFor="server">Server</Label>
                  <Input
                    id="server"
                    placeholder="Masukkan Server/Zone ID"
                    className="bg-gray-800 border-gray-700 focus:border-blue-500"
                    value={formData.server || ""}
                    onChange={(e) => handleInputChange("server", e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">Masukkan Server atau Zone ID kamu</p>
                </div>
              )}

              {/* Product Selection */}
              <div className="space-y-2">
                <Label>Pilih Nominal ({products.length} tersedia)</Label>
                <RadioGroup
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                  className="grid grid-cols-1 gap-3"
                >
                  {products.map((product) => (
                    <div key={product.code} className="flex items-center">
                      <RadioGroupItem value={product.code} id={`product-${product.code}`} className="peer sr-only" />
                      <Label
                        htmlFor={`product-${product.code}`}
                        className="flex justify-between w-full p-4 bg-gray-800 rounded-md cursor-pointer border border-gray-700 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-900/20 hover:bg-gray-700 transition-colors relative"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{product.name}</span>
                          {isPopularProduct(product.code) && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-yellow-500 font-semibold">POPULER</span>
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-blue-400">Rp {product.price.toLocaleString("id-ID")}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                disabled={!isFormValid}
              >
                Bayar Sekarang
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
