"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gamepad2, Star, TrendingUp, Loader2, AlertCircle, MessageCircle } from "lucide-react"
import type { Provider } from "@/lib/api"

interface HomepageProps {
  providers: Provider[]
  loading: boolean
  error: string | null
  onGameSelect: (provider: Provider) => void
}

export function Homepage({ providers, loading, error, onGameSelect }: HomepageProps) {
  const handleContactAdmin = () => {
    const phoneNumber = "83848319444"
    window.open(
      `https://wa.me/62${phoneNumber}?text=Halo%20Admin%20NotzShop,%20saya%20ingin%20bertanya%20tentang%20layanan%20top-up%20game`,
      "_blank",
    )
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/50 via-purple-900/30 to-blue-900/50 p-8 md:p-12">
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=800')] bg-cover bg-center opacity-20"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              NotzShop
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-6">Top-up Game Favorit Kamu dengan Mudah & Aman</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Proses Cepat</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Harga Terbaik</span>
              </div>
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4 text-blue-500" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </section>

        {/* Loading State */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Gamepad2 className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold">Game Populer</h2>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-400">Memuat daftar game...</span>
          </div>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/50 via-purple-900/30 to-blue-900/50 p-8 md:p-12">
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=800')] bg-cover bg-center opacity-20"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              NotzShop
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-6">Top-up Game Favorit Kamu dengan Mudah & Aman</p>
          </div>
        </section>

        {/* Error State */}
        <section>
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <p className="text-yellow-400 text-lg mb-2">Sistem Dalam Pengembangan</p>
            <p className="text-gray-300 text-base mb-4">
              API sedang dalam proses aktivasi. Produk akan segera tersedia.
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Untuk informasi lebih lanjut atau pemesanan manual, silakan hubungi admin kami.
            </p>
            <div className="space-y-3">
              <Button onClick={handleContactAdmin} className="bg-green-600 hover:bg-green-700">
                <MessageCircle className="mr-2 h-4 w-4" />
                Hubungi Admin WhatsApp
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-blue-500/50 text-blue-400"
              >
                Refresh Halaman
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-6 p-3 bg-gray-800 rounded-md max-w-md mx-auto">
              <p>
                <strong>Status Sistem:</strong>
              </p>
              <p>• API Key: Dalam proses aktivasi</p>
              <p>• Database: Siap</p>
              <p>• Payment Gateway: Siap</p>
              <p>• Admin Support: Aktif 24/7</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/50 via-purple-900/30 to-blue-900/50 p-8 md:p-12">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=800')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            NotzShop
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-6">Top-up Game Favorit Kamu dengan Mudah & Aman</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Proses Cepat</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Harga Terbaik</span>
            </div>
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-blue-500" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Gamepad2 className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Game Populer</h2>
          <span className="text-sm text-gray-500">({providers.length} games)</span>
        </div>

        {providers.length === 0 ? (
          <div className="text-center py-12">
            <Gamepad2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Game tidak ditemukan</p>
            <p className="text-gray-500 text-sm">Tidak ada game yang tersedia saat ini</p>
            <Button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 hover:bg-blue-700">
              Refresh
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {providers.map((provider) => (
              <Card
                key={provider.code}
                className="bg-gray-900 border-blue-500/30 hover:border-blue-500/60 transition-all duration-300 hover:scale-105 cursor-pointer group"
                onClick={() => onGameSelect(provider)}
              >
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <div className="relative">
                      <img
                        src={provider.thumbnail || "/placeholder.svg?height=80&width=80"}
                        alt={provider.name}
                        className="h-20 w-20 mx-auto rounded-lg object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=80&width=80"
                        }}
                      />
                      {provider.category && (
                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          {provider.category}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-base group-hover:text-blue-400 transition-colors">
                        {provider.name}
                      </h3>
                      <p className="text-xs text-yellow-400 font-semibold mt-1">HARGA TERMURAH</p>
                      <p className="text-xs text-gray-500">{provider.code}</p>
                    </div>

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 group-hover:bg-blue-500 transition-colors text-sm py-2 font-bold"
                      onClick={(e) => {
                        e.stopPropagation()
                        onGameSelect(provider)
                      }}
                    >
                      BELI
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card className="bg-gray-900 border-blue-500/30 text-center p-6">
          <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="font-bold text-lg mb-2">Proses Instan</h3>
          <p className="text-gray-400 text-sm">Top-up langsung masuk ke akun game kamu dalam hitungan detik</p>
        </Card>

        <Card className="bg-gray-900 border-blue-500/30 text-center p-6">
          <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="font-bold text-lg mb-2">Harga Terjangkau</h3>
          <p className="text-gray-400 text-sm">Dapatkan harga terbaik untuk semua game favorit kamu</p>
        </Card>

        <Card className="bg-gray-900 border-blue-500/30 text-center p-6">
          <Gamepad2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="font-bold text-lg mb-2">Support 24/7</h3>
          <p className="text-gray-400 text-sm">Tim customer service siap membantu kamu kapan saja</p>
        </Card>
      </section>
    </div>
  )
}
