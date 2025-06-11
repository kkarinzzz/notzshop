"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, AlertTriangle, Loader2, MessageCircle } from "lucide-react"
import { createPendingOrder, confirmPayment } from "@/lib/payment-handler"

interface QRISPaymentProps {
  provider: string
  productName: string
  formData: Record<string, any>
  price: number
  onPaymentComplete: (reference: string) => void
  onBackToForm: () => void
}

export function QRISPayment({
  provider,
  productName,
  formData,
  price,
  onPaymentComplete,
  onBackToForm,
}: QRISPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [reference, setReference] = useState<string>("")
  const [paymentProof, setPaymentProof] = useState<string>("")
  const [step, setStep] = useState<"qris" | "confirm">("qris")

  const handleCreateOrder = async () => {
    try {
      setIsProcessing(true)

      // Log data untuk debugging
      console.log("Creating order with data:", {
        provider,
        productCode: formData.productCode,
        productName,
        userData: formData,
        amount: price,
      })

      // Create pending order
      const orderRef = await createPendingOrder({
        provider,
        productCode: formData.productCode,
        productName,
        userData: formData,
        amount: price,
      })

      setReference(orderRef)
      setStep("confirm")
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Gagal membuat pesanan: " + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentConfirmation = async () => {
    try {
      setIsProcessing(true)

      await confirmPayment(reference, paymentProof)

      // Redirect ke receipt dengan status pending
      onPaymentComplete(reference)
    } catch (error) {
      alert("Gagal konfirmasi pembayaran: " + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleContactAdmin = () => {
    const message = `Halo Admin, saya sudah melakukan pembayaran untuk order ${reference}. Mohon dicek ya. Terima kasih!`
    const phoneNumber = "83848319444"
    window.open(`https://wa.me/62${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank")
  }

  if (step === "qris") {
    return (
      <div className="max-w-md mx-auto">
        {/* Warning */}
        <Card className="bg-yellow-900/20 border-yellow-500/50 mb-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-yellow-400">PENTING - Baca Sebelum Bayar!</h3>
                <ul className="text-sm text-yellow-200 space-y-1">
                  <li>
                    • Bayar TEPAT sesuai nominal: <strong>Rp {price.toLocaleString("id-ID")}</strong>
                  </li>
                  <li>• Jangan lebih atau kurang dari nominal tersebut</li>
                  <li>• Setelah bayar, klik "Sudah Bayar" dan tunggu konfirmasi admin</li>
                  <li>• Proses verifikasi 5-15 menit (jam kerja)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-blue-500/30">
          <CardHeader className="bg-gradient-to-r from-blue-900/50 to-black">
            <CardTitle className="flex items-center">
              <QrCode className="mr-2 h-5 w-5 text-blue-500" /> QRIS Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            <div className="mb-6 space-y-4">
              <div className="bg-white p-4 rounded-lg mx-auto w-64 h-64 flex items-center justify-center">
                {/* QRIS Code - ganti dengan QR code kamu */}
                <img
                  src="/qris-notzshop.png"
                  alt="QRIS NotzShop"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=200&width=200"
                  }}
                />
              </div>
              <p className="text-sm text-gray-400">Scan QR code dengan aplikasi mobile banking atau e-wallet</p>
            </div>

            <div className="bg-gray-800 p-4 rounded-md mb-6">
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-400">Game:</span>
                  <span>{provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Produk:</span>
                  <span>{productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ID:</span>
                  <span>{formData.id}</span>
                </div>
                {formData.server && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Server:</span>
                    <span>{formData.server}</span>
                  </div>
                )}
                <div className="border-t border-gray-700 my-2"></div>
                <div className="flex justify-between font-bold">
                  <span className="text-gray-400">Total Bayar:</span>
                  <span className="text-blue-400">Rp {price.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleCreateOrder}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Membuat Pesanan...
                  </>
                ) : (
                  "Lanjut ke Pembayaran"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={onBackToForm}
                className="w-full border-gray-600 text-gray-400 hover:bg-gray-800"
                disabled={isProcessing}
              >
                Kembali ke Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-gray-900 border-blue-500/30">
        <CardHeader className="bg-gradient-to-r from-blue-900/50 to-black">
          <CardTitle className="flex items-center">
            <QrCode className="mr-2 h-5 w-5 text-blue-500" /> Konfirmasi Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="bg-gray-800 p-4 rounded-md">
              <div className="text-center mb-4">
                <h3 className="font-bold text-lg text-green-400">Order Created!</h3>
                <p className="text-sm text-gray-400">Reference: {reference}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Bayar:</span>
                  <span className="font-bold text-blue-400">Rp {price.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-yellow-400">Menunggu Pembayaran</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="proof">Bukti Pembayaran (Opsional)</Label>
                <Input
                  id="proof"
                  placeholder="Link screenshot atau keterangan"
                  className="bg-gray-800 border-gray-700 focus:border-blue-500"
                  value={paymentProof}
                  onChange={(e) => setPaymentProof(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Bisa kosong, tapi akan mempercepat verifikasi</p>
              </div>

              <Button
                onClick={handlePaymentConfirmation}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Sudah Bayar - Konfirmasi"
                )}
              </Button>

              <Button
                onClick={handleContactAdmin}
                variant="outline"
                className="w-full border-green-500/50 text-green-400"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Hubungi Admin
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              <p>Setelah konfirmasi, admin akan memverifikasi pembayaran</p>
              <p>Proses verifikasi: 5-15 menit (jam kerja 09:00-21:00)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
