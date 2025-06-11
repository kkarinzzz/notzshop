"use client"

import { useState, useEffect } from "react"
import { AdminLogin } from "@/components/admin-login"
import { AdminDashboard } from "@/components/admin-dashboard"
import { getAdminSession, type AdminUser } from "@/lib/admin-auth"

export default function AdminPage() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = getAdminSession()
    setAdminUser(session)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!adminUser) {
    return <AdminLogin onLogin={setAdminUser} />
  }

  return <AdminDashboard adminUser={adminUser} onLogout={() => setAdminUser(null)} />
}
