"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ReceiptIcon,
  Download,
  Home,
  MessageCircle,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { jsPDF } from "jspdf"
import { checkOrderStatus, type OrderStatus } from "@/lib/api"

interface ReceiptProps {
  reference: string
  provider: string
  productName: string
  formData: Record<string, any>
  price: number
  onNewTransaction: () => void
}

export function Receipt({ reference, provider, productName, formData, price, onNewTransaction }: ReceiptProps) {
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const fetchOrderStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      const status = await checkOrderStatus(reference)
      setOrderStatus(status)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengecek status pesanan")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderStatus()

    // Auto refresh status every 10 seconds for pending orders
    const interval = setInterval(() => {
      if (orderStatus?.status === "processing" || orderStatus?.status === "unpaid") {
        fetchOrderStatus()
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [reference, orderStatus?.status])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "failed":
      case "expired":
        return <XCircle className="h-6 w-6 text-red-500" />
      case "processing":
        return <Clock className="h-6 w-6 text-yellow-500" />
      case "refund":
        return <AlertTriangle className="h-6 w-6 text-orange-500" />
      default:
        return <Clock className="h-6 w-6 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "success":
        return "Berhasil"
      case "failed":
        return "Gagal"
      case "processing":
        return "Diproses"
      case "unpaid":
        return "Belum Dibayar"
      case "refund":
        return "Refund"
      case "expired":
        return "Kadaluarsa"
      default:
        return "Unknown"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-400"
      case "failed":
      case "expired":
        return "text-red-400"
      case "processing":
        return "text-yellow-400"
      case "refund":
        return "text-orange-400"
      default:
        return "text-gray-400"
    }
  }

  const downloadReceipt = () => {
    if (!orderStatus) return

    setIsDownloading(true)

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5",
    })

    // Add content to PDF
    doc.setFillColor(0, 0, 0)
    doc.rect(0, 0, 148, 210, "F")

    // Add header
    doc.setTextColor(64, 156, 255)
    doc.setFontSize(24)
    doc.text("NotzShop", 74, 20, { align: "center" })

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.text("Payment Receipt", 74, 30, { align: "center" })

    // Add line
    doc.setDrawColor(64, 156, 255)
    doc.setLineWidth(0.5)
    doc.line(20, 35, 128, 35)

    // Add receipt details
    doc.setFontSize(12)
    doc.setTextColor(200, 200, 200)
    doc.text("Transaction ID:", 25, 50)
    doc.text("Date & Time:", 25, 60)
    doc.text("Game:", 25, 70)
    doc.text("Product:", 25, 80)
    doc.text("User ID:", 25, 90)
    if (formData.server) {
      doc.text("Server:", 25, 100)
      doc.text("Status:", 25, 110)
      doc.text("Total Price:", 25, 120)
    } else {
      doc.text("Status:", 25, 100)
      doc.text("Total Price:", 25, 110)
    }

    doc.setTextColor(255, 255, 255)
    doc.text(orderStatus.reference, 75, 50)
    doc.text(new Date(orderStatus.created_at).toLocaleString(), 75, 60)
    doc.text(provider, 75, 70)
    doc.text(productName, 75, 80)
    doc.text(formData.id, 75, 90)
    if (formData.server) {
      doc.text(formData.server, 75, 100)
      doc.text(getStatusText(orderStatus.status), 75, 110)
      doc.text(`Rp ${price.toLocaleString("id-ID")}`, 75, 120)
    } else {
      doc.text(getStatusText(orderStatus.status), 75, 100)
      doc.text(`Rp ${price.toLocaleString("id-ID")}`, 75, 110)
    }

    // Add footer
    doc.setLineWidth(0.5)
    doc.line(20, 140, 128, 140)
    doc.setFontSize(10)
    doc.setTextColor(150, 150, 150)
    doc.text("Thank you for your purchase!", 74, 150, { align: "center" })
    doc.text("© 2025 NotzShop. All rights reserved.", 74, 160, { align: "center" })
    doc.text("Need help? Contact us: 083848319444", 74, 170, { align: "center" })

    // Save PDF
    doc.save(`NotzShop-Receipt-${orderStatus.reference}.pdf`)

    setIsDownloading(false)
  }

  const handleWhatsAppSupport = () => {
    const phoneNumber = "83848319444"
    const message = encodeURIComponent(`Halo Admin, saya ingin bertanya tentang transaksi ${reference}`)
    window.open(`https://wa.me/62${phoneNumber}?text=${message}`, "_blank")
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="bg-gray-900 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-400">Mengecek status pesanan...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="bg-gray-900 border-blue-500/30">
          <CardContent className="p-6">
            <div className="text-center py-12">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <p className="text-red-400 text-lg mb-2">Gagal mengecek status</p>
              <p className="text-gray-500 text-sm mb-4">{error}</p>
              <Button onClick={fetchOrderStatus} variant="outline" className="border-blue-500/50 text-blue-400">
                <RefreshCw className="mr-2 h-4 w-4" />
                Coba Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!orderStatus) return null

  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-gray-900 border-blue-500/30">
        <CardHeader className="bg-gradient-to-r from-blue-900/50 to-black">
          <CardTitle className="flex items-center">
            <ReceiptIcon className="mr-2 h-5 w-5 text-blue-500" /> Digital Receipt
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-gray-800 p-6 rounded-md border border-blue-500/30 mb-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                NotzShop
              </h3>
              <div className="flex items-center justify-center gap-2 mt-2">
                {getStatusIcon(orderStatus.status)}
                <span className={`font-semibold ${getStatusColor(orderStatus.status)}`}>
                  {getStatusText(orderStatus.status)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Transaction ID</span>
                <span className="font-mono text-sm">{orderStatus.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date & Time</span>
                <span className="text-sm">{new Date(orderStatus.created_at).toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-700 my-2"></div>
              <div className="flex justify-between">
                <span className="text-gray-400">Game</span>
                <span>{provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Product</span>
                <span className="text-sm">{productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">User ID</span>
                <span>{formData.id}</span>
              </div>
              {formData.server && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Server</span>
                  <span>{formData.server}</span>
                </div>
              )}
              {orderStatus.sn && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Serial Number</span>
                  <span className="font-mono text-sm">{orderStatus.sn}</span>
                </div>
              )}
              <div className="border-t border-gray-700 my-2"></div>
              <div className="flex justify-between font-bold">
                <span className="text-gray-400">Total Dibayar</span>
                <span className="text-blue-400">Rp {price.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {orderStatus.note && (
              <div className="mt-4 p-3 bg-gray-700 rounded-md">
                <p className="text-sm text-gray-300">{orderStatus.note}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {(orderStatus.status === "processing" || orderStatus.status === "unpaid") && (
            <Button onClick={fetchOrderStatus} className="w-full bg-yellow-600 hover:bg-yellow-700">
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh Status
            </Button>
          )}

          <Button onClick={downloadReceipt} className="w-full bg-blue-600 hover:bg-blue-700" disabled={isDownloading}>
            {isDownloading ? (
              <span className="animate-pulse">Generating PDF...</span>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" /> Download Receipt
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full border-green-500/50 text-green-400"
            onClick={handleWhatsAppSupport}
          >
            <MessageCircle className="mr-2 h-4 w-4" /> Bantuan via WhatsApp
          </Button>

          <Button variant="ghost" className="w-full text-gray-400 hover:text-white" onClick={onNewTransaction}>
            <Home className="mr-2 h-4 w-4" /> New Transaction
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
