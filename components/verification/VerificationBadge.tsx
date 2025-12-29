"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertTriangle, Clock, XCircle } from "lucide-react"

type VerificationStatus = "verified" | "unverified" | "pending" | "counterfeit"
type BadgeSize = "sm" | "md" | "lg"

interface VerificationBadgeProps {
  productId: string
  status: VerificationStatus
  size?: BadgeSize
  onClick?: () => void
  verificationDate?: string
  showLabel?: boolean
}

export function VerificationBadge({
  productId,
  status,
  size = "md",
  onClick,
  verificationDate,
  showLabel = true,
}: VerificationBadgeProps) {
  const getSizeClasses = (size: BadgeSize) => {
    switch (size) {
      case "sm":
        return "h-6 gap-1 px-2 text-xs"
      case "lg":
        return "h-9 gap-2 px-3 text-sm"
      default:
        return "h-7 gap-1.5 px-2.5 text-xs"
    }
  }

  const getStatusConfig = (
    status: VerificationStatus
  ): {
    icon: React.ReactNode
    label: string
    color: string
    bgColor: string
    hoverColor: string
  } => {
    switch (status) {
      case "verified":
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          label: "Verified",
          color: "text-green-700 dark:text-green-400",
          bgColor: "bg-green-500/20 border-green-500/50 hover:bg-green-500/30",
          hoverColor: "hover:shadow-lg hover:shadow-green-500/20",
        }
      case "unverified":
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          label: "Not Verified",
          color: "text-gray-700 dark:text-gray-400",
          bgColor: "bg-gray-500/20 border-gray-500/50 hover:bg-gray-500/30",
          hoverColor: "hover:shadow-lg hover:shadow-gray-500/20",
        }
      case "pending":
        return {
          icon: <Clock className="w-4 h-4" />,
          label: "Pending",
          color: "text-yellow-700 dark:text-yellow-400",
          bgColor: "bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30",
          hoverColor: "hover:shadow-lg hover:shadow-yellow-500/20",
        }
      case "counterfeit":
        return {
          icon: <XCircle className="w-4 h-4" />,
          label: "Counterfeit Alert",
          color: "text-red-700 dark:text-red-400",
          bgColor: "bg-red-500/20 border-red-500/50 hover:bg-red-500/30",
          hoverColor: "hover:shadow-lg hover:shadow-red-500/20",
        }
    }
  }

  const config = getStatusConfig(status)

  const tooltipContent = (
    <div className="space-y-1">
      <p className="font-semibold">{config.label}</p>
      <p className="text-xs">{productId}</p>
      {verificationDate && (
        <p className="text-xs text-muted-foreground">
          Verified: {new Date(verificationDate).toLocaleDateString()}
        </p>
      )}
    </div>
  )

  const badgeContent = (
    <motion.div
      whileHover={{ scale: onClick ? 1.05 : 1 }}
      whileTap={onClick ? { scale: 0.95 } : {}}
      className={`inline-flex ${onClick ? "cursor-pointer" : ""}`}
    >
      <Badge
        variant="outline"
        className={`${getSizeClasses(size)} ${config.bgColor} ${config.hoverColor} ${config.color} border font-semibold transition-all`}
      >
        {/* Animated icon */}
        <motion.div
          animate={
            status === "verified"
              ? { rotate: [0, 360] }
              : status === "counterfeit"
                ? { scale: [1, 1.1, 1] }
                : status === "pending"
                  ? { rotate: [0, -360] }
                  : {}
          }
          transition={
            status === "verified"
              ? { delay: 0.5, duration: 2, repeat: Infinity }
              : status === "pending"
                ? { delay: 0.5, duration: 2, repeat: Infinity }
                : status === "counterfeit"
                  ? { delay: 0.5, duration: 1, repeat: Infinity }
                  : {}
          }
        >
          {config.icon}
        </motion.div>

        {/* Label */}
        {showLabel && <span>{config.label}</span>}
      </Badge>
    </motion.div>
  )

  return (
    <div
      title={`${config.label} - ${productId}${verificationDate ? ` (${new Date(verificationDate).toLocaleDateString()})` : ""}`}
      className="inline-block"
    >
      {badgeContent}
    </div>
  )
}

/**
 * Variant: Inline badge for product cards
 */
interface InlineBadgeProps extends Omit<VerificationBadgeProps, "productId"> {
  productName?: string
}

export function InlineVerificationBadge({
  status,
  productName,
  ...props
}: InlineBadgeProps) {
  const getStatusLabel = (status: VerificationStatus): string => {
    switch (status) {
      case "verified":
        return "✓ Authentic"
      case "unverified":
        return "? Unverified"
      case "pending":
        return "⏳ Pending"
      case "counterfeit":
        return "✗ Counterfeit"
    }
  }

  const getStatusColor = (
    status: VerificationStatus
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "verified":
        return "default"
      case "counterfeit":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <Badge variant={getStatusColor(status)} className="font-semibold">
      {getStatusLabel(status)}
    </Badge>
  )
}

/**
 * Variant: Status indicator dot
 */
interface StatusDotProps {
  status: VerificationStatus
  size?: "sm" | "md" | "lg"
}

export function VerificationStatusDot({ status, size = "md" }: StatusDotProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  }

  const statusColor = {
    verified: "bg-green-500",
    unverified: "bg-gray-400",
    pending: "bg-yellow-500",
    counterfeit: "bg-red-500",
  }

  return (
    <motion.div
      animate={
        status === "pending"
          ? { opacity: [1, 0.5, 1] }
          : status === "verified"
            ? { scale: [1, 1.2, 1] }
            : {}
      }
      transition={
        status === "pending"
          ? { duration: 2, repeat: Infinity }
          : status === "verified"
            ? { duration: 2, repeat: Infinity }
            : {}
      }
      className={`${sizeClasses[size]} ${statusColor[status]} rounded-full`}
    />
  )
}
