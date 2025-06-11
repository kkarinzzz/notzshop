"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  LogOut,
  DollarSign,
  ShoppingCart,
  Eye,
  MessageCircle,
  AlertTriangle,
} from "lucide-react"
import {
  getAllOrders,
  getOrderStats,
  approvePayment,
  rejectPayment,
  type PendingOrder,
  type OrderStats,
} from "@/lib/payment-handler"
import { logoutAdmin, type AdminUser } from "@/lib/admin-auth"

interface AdminDashboardProps {
  adminUser: AdminUser
  onLogout: () => void
}

export function AdminDashboard({ adminUser, onLogout }: AdminDashboardProps) {
  const [orders, setOrders] = useState<PendingOrder[]>([])
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [activeTab, setActiveTab] = useState("pending")

  const loadData = async () => {
    setLoading(true)
    try {
      const [allOrders, orderStats] = await Promise.all([getAllOrders(), getOrderStats()])
      setOrders(allOrders)
      setStats(orderStats)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Auto refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    logoutAdmin()
    onLogout()
  }

  const handleApprove = async (reference: string) => {
    try {
      setLoading(true)
      await approvePayment(reference, adminUser.username)
      await loadData()
      alert("Pembayaran berhasil diapprove!")
    } catch (error) {
      alert("Gagal approve: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedOrder || !rejectReason.trim()) return

    try {
      setLoading(true)
      await rejectPayment(selectedOrder.reference, adminUser.username, rejectReason)
      await loadData()
      setShowRejectDialog(false)
      setRejectReason("")
      setSelectedOrder(null)
      alert("Pembayaran berhasil ditolak!")
    } catch (error) {
      alert("Gagal reject: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500", text: "Menunggu Bayar", icon: Clock },
      paid: { color: "bg-blue-500", text: "Menunggu Konfirmasi", icon: AlertTriangle },
      processing: { color: "bg-purple-500", text: "Diproses", icon: RefreshCw },
      completed: { color: "bg-green-500", text: "Selesai", icon: CheckCircle },
      failed: { color: "bg-red-500", text: "Gagal", icon: XCircle },
      rejected: { color: "bg-gray-500", text: "Ditolak", icon: XCircle },
      expired: { color: "bg-gray-600", text: "Kadaluarsa", icon: Clock },
    }

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="mr-1 h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true
    if (activeTab === "pending") return order.status === "paid" // Orders waiting for admin approval
    return order.status === activeTab
  })

  const handleContactCustomer = (order: PendingOrder) => {
    const message = `Halo, terkait pesanan ${order.reference} untuk ${order.provider} senilai Rp ${order.amount.toLocaleString("id-ID")}. Ada yang bisa kami bantu?`
    // This would need the customer's phone number, which should be collected during order
    console.log("Contact customer:", message)
    alert("Fitur contact customer akan diimplementasi dengan nomor HP customer")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-blue-500/30 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                NotzShop Admin
              </h1>
              <p className="text-sm text-gray-400">Welcome back, {adminUser.username}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={loadData} variant="outline" size="sm" disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-900 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Orders</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-yellow-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Pending Approval</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.paid}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Today Revenue</p>
                    <p className="text-2xl font-bold text-purple-400">
                      Rp {stats.todayRevenue.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Orders Table */}
        <Card className="bg-gray-900 border-blue-500/30">
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="pending">Pending Approval ({stats?.paid || 0})</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="processing">Processing</TabsTrigger>
                <TabsTrigger value="failed">Failed</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All Orders</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <div className="space-y-4">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Tidak ada order untuk kategori ini</p>
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <Card key={order.reference} className="bg-gray-800 border-gray-700">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-lg">{order.reference}</h3>
                                {getStatusBadge(order.status)}
                              </div>
                              <p className="text-sm text-gray-400">
                                {new Date(order.createdAt).toLocaleString("id-ID")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-400">
                                Rp {order.amount.toLocaleString("id-ID")}
                              </p>
                              {order.processedBy && (
                                <p className="text-xs text-gray-500">Processed by: {order.processedBy}</p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-400">Game</p>
                              <p className="font-medium">{order.provider}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Product</p>
                              <p className="font-medium">{order.productName}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">User ID</p>
                              <p className="font-medium">{order.userData.id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Server</p>
                              <p className="font-medium">{order.userData.server || "-"}</p>
                            </div>
                          </div>

                          {order.paymentProof && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-400 mb-1">Bukti Pembayaran</p>
                              <p className="text-sm bg-gray-700 p-2 rounded">{order.paymentProof}</p>
                            </div>
                          )}

                          {order.adminNotes && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-400 mb-1">Admin Notes</p>
                              <p className="text-sm bg-gray-700 p-2 rounded">{order.adminNotes}</p>
                            </div>
                          )}

                          {order.wendiggReference && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-400 mb-1">Wendigg Reference</p>
                              <p className="text-sm bg-green-900/20 text-green-400 p-2 rounded font-mono">
                                {order.wendiggReference}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 flex-wrap">
                            {order.status === "paid" && (
                              <>
                                <Button
                                  onClick={() => handleApprove(order.reference)}
                                  className="bg-green-600 hover:bg-green-700"
                                  disabled={loading}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setShowRejectDialog(true)
                                  }}
                                  variant="destructive"
                                  disabled={loading}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </Button>
                              </>
                            )}

                            <Button onClick={() => setSelectedOrder(order)} variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              Detail
                            </Button>

                            <Button
                              onClick={() => handleContactCustomer(order)}
                              variant="outline"
                              size="sm"
                              className="border-green-500/50 text-green-400"
                            >
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Contact
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-gray-900 border-red-500/30">
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>Berikan alasan penolakan untuk order {selectedOrder?.reference}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Alasan Penolakan</Label>
              <Textarea
                id="reason"
                placeholder="Contoh: Pembayaran tidak sesuai nominal, bukti pembayaran tidak valid, dll."
                className="bg-gray-800 border-gray-700"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim() || loading}>
              Reject Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder && !showRejectDialog} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-gray-900 border-blue-500/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Detail</DialogTitle>
            <DialogDescription>Detail lengkap untuk order {selectedOrder?.reference}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Reference</Label>
                  <p className="font-mono text-sm bg-gray-800 p-2 rounded">{selectedOrder.reference}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <Label>Game</Label>
                  <p className="bg-gray-800 p-2 rounded">{selectedOrder.provider}</p>
                </div>
                <div>
                  <Label>Product</Label>
                  <p className="bg-gray-800 p-2 rounded">{selectedOrder.productName}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="bg-gray-800 p-2 rounded font-bold text-blue-400">
                    Rp {selectedOrder.amount.toLocaleString("id-ID")}
                  </p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="bg-gray-800 p-2 rounded">{new Date(selectedOrder.createdAt).toLocaleString("id-ID")}</p>
                </div>
              </div>

              <div>
                <Label>User Data</Label>
                <pre className="bg-gray-800 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(selectedOrder.userData, null, 2)}
                </pre>
              </div>

              {selectedOrder.paymentProof && (
                <div>
                  <Label>Payment Proof</Label>
                  <p className="bg-gray-800 p-2 rounded">{selectedOrder.paymentProof}</p>
                </div>
              )}

              {selectedOrder.adminNotes && (
                <div>
                  <Label>Admin Notes</Label>
                  <p className="bg-gray-800 p-2 rounded">{selectedOrder.adminNotes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
