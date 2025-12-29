"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CustomConnectButton } from '@/components/CustomConnectButton'
import { 
  BarChart3, 
  Shield,
  Package, 
  TrendingUp, 
  History, 
  Settings,
  Home,
  ShieldCheck,
  Building2
} from 'lucide-react'
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  ]

  const dashboardItems = [
    { href: "/dashboard/verify-product", label: "Verify Product", icon: Shield },
    { href: "/dashboard/register-manufacturer", label: "Register Manufacturer", icon: Building2 },
    { href: "/dashboard/register-product", label: "Register Product", icon: Package },
    { href: "/dashboard/supply-chain", label: "Supply Chain", icon: TrendingUp },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/verification-history", label: "Verification History", icon: History },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ]

  const isDashboard = pathname?.startsWith('/dashboard')

  return (
    <nav className="bg-background border-b border-emerald-500/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <span className="text-xl font-bold text-emerald-500">VerifyChain</span>
          </Link>

          <div className="flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href === '/dashboard' && pathname?.startsWith('/dashboard'))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="flex items-center space-x-4">
            <CustomConnectButton />
          </div>
        </div>

        {/* Dashboard Sub-navigation */}
        {isDashboard && (
          <div className="border-t border-emerald-500/10">
            <div className="flex items-center space-x-6 py-3">
              {dashboardItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-1 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-medium"
                        : "text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}