"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Mail, ArrowRight } from "lucide-react"

interface CustomerServiceProps {
  isOpen: boolean
  onClose: () => void
}

export function CustomerService({ isOpen, onClose }: CustomerServiceProps) {
  if (!isOpen) return null

  const handleWhatsAppClick = () => {
    // Format nomor untuk WhatsApp (hapus + dan spasi)
    const phoneNumber = "83848319444" // tanpa 0 di depan untuk format internasional
    window.open(`https://wa.me/62${phoneNumber}`, "_blank")
  }

  const handleEmailClick = () => {
    const subject = encodeURIComponent("Bantuan NotzShop")
    const body = encodeURIComponent("Halo Admin NotzShop, saya membutuhkan bantuan terkait...")
    window.open(`mailto:notzshop26@gmail.com?subject=${subject}&body=${body}`, "_blank")
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-blue-500/30 w-full max-w-md">
        <CardHeader className="bg-gradient-to-r from-blue-900/50 to-black">
          <CardTitle className="flex items-center">
            <MessageCircle className="mr-2 h-5 w-5 text-blue-500" /> Customer Service
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <p className="text-center text-gray-300">Butuh bantuan? Tim customer service kami siap membantu Anda 24/7</p>

          <div className="grid grid-cols-1 gap-4">
            <Button
              onClick={handleWhatsAppClick}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-between"
            >
              <div className="flex items-center">
                <MessageCircle className="mr-2 h-5 w-5" />
                <span>Chat WhatsApp</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              onClick={handleEmailClick}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-between"
            >
              <div className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                <span>Email Support</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center text-sm text-gray-400 mt-4">
            <p>Jam operasional: 09.00 - 21.00 WIB</p>
            <p>Respons cepat dalam 5-10 menit</p>
          </div>

          <Button variant="ghost" className="w-full text-gray-400" onClick={onClose}>
            Tutup
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
