"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X } from "lucide-react"

export function AdminNotice() {
  const [isVisible, setIsVisible] = useState(true)
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false)

  // Cek apakah notice sudah pernah ditutup sebelumnya
  useEffect(() => {
    const dismissed = localStorage.getItem("admin-notice-dismissed")
    if (dismissed) {
      setHasBeenDismissed(true)
      setIsVisible(false)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("admin-notice-dismissed", "true")
    setHasBeenDismissed(true)
  }

  const handleContactAdmin = () => {
    const phoneNumber = "83848319444"
    window.open(
      `https://wa.me/62${phoneNumber}?text=Halo%20Admin%20NotzShop,%20saya%20ingin%20bertanya%20tentang%20layanan%20top-up%20game`,
      "_blank",
    )
  }

  if (!isVisible) return null

  return (
    <Card className="bg-yellow-900/20 border-yellow-500/50 mb-6">
      <CardContent className="p-4 relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-6 w-6 p-0 text-yellow-500 hover:text-yellow-400 hover:bg-transparent"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Tutup</span>
        </Button>

        <div className="flex items-start gap-3 pr-6">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h3 className="font-semibold text-yellow-400">Informasi Penting</h3>
            <p className="text-sm text-yellow-200">
              Sistem sedang dalam proses aktivasi. Beberapa produk mungkin belum tersedia. Silakan hubungi admin untuk
              informasi lebih lanjut.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-900/30"
              onClick={handleContactAdmin}
            >
              Hubungi Admin
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
