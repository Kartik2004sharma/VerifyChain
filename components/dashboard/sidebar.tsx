"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  ChevronLeft, 
  BarChart2, 
  MessageSquare, 
  ArrowLeftRight, 
  Settings, 
  Home,
  ArrowLeft,
  Coins,
  Repeat,
  Shield,
  Droplets,
  History,
  CheckCircle,
  Package,
  Clock,
  TrendingUp,
  Building2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

interface DashboardSidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function DashboardSidebar({ open, setOpen }: DashboardSidebarProps) {
  const pathname = usePathname()
  useEffect(() => {
  setOpen(false)
  }, [])
  
    const verifyChainRoutes = [
    {
      label: "Overview",
      icon: Home,
      href: "/dashboard"
    },
    {
      label: "Verify Product",
      icon: CheckCircle,
      href: "/dashboard/verify-product"
    },
    {
      label: "Register Manufacturer",
      icon: Building2,
      href: "/dashboard/register-manufacturer"
    },
    {
      label: "Register Product",
      icon: Package,
      href: "/dashboard/register-product"
    },
    {
      label: "Supply Chain",
      icon: Repeat,
      href: "/dashboard/supply-chain"
    },
    {
      label: "Analytics",
      icon: BarChart2,
      href: "/dashboard/analytics"
    },
    {
      label: "Verification History",
      icon: History,
      href: "/dashboard/verification-history"
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings"
    },
  ]

  const counterfeitDetectionRoutes = [
    {
      label: "Detect Counterfeit",
      icon: CheckCircle,
      href: "/dashboard/verify-product"
    },
    {
      label: "Anti-Counterfeit",
      icon: Package,
      href: "/dashboard/register-product"
    },
    {
      label: "Detection Reports",
      icon: Clock,
      href: "/dashboard/verification-history"
    },
    {
      label: "Threat Analysis",
      icon: TrendingUp,
      href: "/dashboard/verification-analytics"
    }
  ]

  return (
    <div className={cn(
      "fixed h-full bg-background/50 border-r border-white/10 transition-all duration-300 z-20 backdrop-blur-sm shadow-lg",
      open ? "w-64" : "w-16"
    )}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className={cn("flex items-center gap-2", !open && "hidden")}>
            <span className="text-xl font-bold bg-gradient-to-b from-emerald-400 to-emerald-600 text-transparent bg-clip-text">VerifyChain</span>
            <div className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs text-emerald-300 font-medium">
              Beta
            </div>
          </div>
          <button 
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className={cn("h-5 w-5 text-white/70 transition-transform", !open && "rotate-180")} />
          </button>
        </div>
        
        <div className="flex-1 py-6 overflow-y-auto scrollbar-hide">
          <nav className="px-3 space-y-1">
            {verifyChainRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center px-3 py-3.5 text-sm rounded-lg transition-colors relative group",
                  pathname === route.href
                    ? "bg-white/10 text-white" 
                    : "text-white/60 hover:text-white hover:bg-white/5",
                  !open && "justify-center"
                )}
              >
                <route.icon className={cn(
                  "h-5 w-5",
                  pathname === route.href ? "text-white" : "text-white/60"
                )} />
                {open && <span className="ml-3">{route.label}</span>}
                {pathname === route.href && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-r-full" />
                )}
                
                {!open && (
                  <div className="absolute left-full ml-2 rounded-md px-2 py-1 bg-black/80 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {route.label}
                  </div>
                )}
              </Link>
            ))}
          </nav>

          {/* Verification Section Divider */}
          <div className="my-4 mx-3 h-px bg-white/10" />

          {/* Counterfeit Detection Section */}
          {open && (
            <div className="px-3 mb-4">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                Counterfeit Detection
              </h3>
            </div>
          )}
          
          <nav className="px-3 space-y-1">
            {counterfeitDetectionRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center px-3 py-3.5 text-sm rounded-lg transition-colors relative group",
                  pathname === route.href
                    ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                    : "text-white/60 hover:text-white hover:bg-white/5",
                  !open && "justify-center"
                )}
              >
                <route.icon className={cn(
                  "h-5 w-5",
                  pathname === route.href ? "text-red-400" : "text-white/60"
                )} />
                {open && <span className="ml-3">{route.label}</span>}
                {pathname === route.href && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-red-400 rounded-r-full" />
                )}
                
                {!open && (
                  <div className="absolute left-full ml-2 rounded-md px-2 py-1 bg-black/80 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {route.label}
                  </div>
                )}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-white/10">
          <Link href="/" className={cn(
            "flex items-center px-3 py-3 text-sm text-white/60 rounded-lg transition-all duration-200 hover:bg-white/5 cursor-pointer group relative", 
            !open && "justify-center"
          )}>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center shadow-inner">
              <ArrowLeft className="h-4 w-4 text-white/90" />
            </div>
            {open && <span className="ml-3">Back to Home</span>}
            
            {!open && (
              <div className="absolute left-full ml-2 rounded-md px-2 py-1 bg-black/80 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Back to Home
              </div>
            )}
          </Link>
        </div>
      </div>
    </div>
  )
}