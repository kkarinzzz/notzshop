// Simple admin authentication
export interface AdminUser {
  username: string
  password: string
  role: "admin" | "super_admin"
  lastLogin?: Date
}

const ADMIN_USERS: AdminUser[] = [
  {
    username: "admin",
    password: "notzshop2025", // Ganti password ini!
    role: "admin",
  },
  {
    username: "superadmin",
    password: "notzshop2025super", // Ganti password ini!
    role: "super_admin",
  },
]

export function authenticateAdmin(username: string, password: string): AdminUser | null {
  const user = ADMIN_USERS.find((u) => u.username === username && u.password === password)
  if (user) {
    user.lastLogin = new Date()
    localStorage.setItem(
      "adminSession",
      JSON.stringify({
        username: user.username,
        role: user.role,
        loginTime: new Date().toISOString(),
      }),
    )
    return user
  }
  return null
}

export function getAdminSession(): AdminUser | null {
  try {
    const session = localStorage.getItem("adminSession")
    if (!session) return null

    const parsed = JSON.parse(session)
    const loginTime = new Date(parsed.loginTime)
    const now = new Date()

    // Session expires after 8 hours
    if (now.getTime() - loginTime.getTime() > 8 * 60 * 60 * 1000) {
      localStorage.removeItem("adminSession")
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function logoutAdmin() {
  localStorage.removeItem("adminSession")
}
