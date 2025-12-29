"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Calendar,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import { SupplyChainStep } from "@/lib/blockchain-verification"

interface ProductTimelineProps {
  supplyChain: SupplyChainStep[]
  productId: string
}

export function ProductTimeline({ supplyChain, productId }: ProductTimelineProps) {
  if (!supplyChain || supplyChain.length === 0) {
    return (
      <Card className="border border-border/50 p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <Package className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">No supply chain data available</p>
        </div>
      </Card>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
      case "in-transit":
        return <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
      default:
        return <MapPin className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 border-green-500/50"
      case "in-transit":
        return "bg-blue-500/20 border-blue-500/50"
      case "failed":
        return "bg-red-500/20 border-red-500/50"
      default:
        return "bg-gray-500/20 border-gray-500/50"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/30 text-green-700 dark:text-green-400 border-green-500/50"
      case "in-transit":
        return "bg-blue-500/30 text-blue-700 dark:text-blue-400 border-blue-500/50"
      case "failed":
        return "bg-red-500/30 text-red-700 dark:text-red-400 border-red-500/50"
      default:
        return "bg-gray-500/30 text-gray-700 dark:text-gray-400 border-gray-500/50"
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Supply Chain Journey</h3>
        <span className="text-sm text-muted-foreground">
          {supplyChain.length} checkpoint{supplyChain.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Timeline Container */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-blue-500/30 to-transparent" />

        {/* Timeline items */}
        <div className="space-y-4">
          {supplyChain.map((step, index) => {
            const { date, time } = formatDate(step.timestamp)
            const isLast = index === supplyChain.length - 1
            const isFirst = index === 0

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`border ${getStatusColor(step.status)} p-4 ml-16 relative`}
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-9 top-6 w-5 h-5 bg-background border-2 border-blue-500 rounded-full flex items-center justify-center">
                    {getStatusIcon(step.status)}
                  </div>

                  {/* Step number badge */}
                  <div className="absolute -left-3 -top-3 w-6 h-6 bg-background border-2 border-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-base">{step.location}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{step.handler}</p>
                      </div>

                      <Badge
                        variant="outline"
                        className={`flex-shrink-0 capitalize ${getStatusBadgeColor(step.status)}`}
                      >
                        {step.status}
                      </Badge>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{date}</span>
                      </div>
                      <div className="text-muted-foreground">{time}</div>
                    </div>

                    {/* Description */}
                    {step.details && (
                      <p className="text-sm text-foreground bg-muted/30 p-2 rounded">
                        {step.details}
                      </p>
                    )}

                    {/* Blockchain Transaction */}
                    <div className="pt-2 border-t border-border/30">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-8 text-xs"
                        onClick={() => {
                          const blockExplorerUrl = `https://sepolia.etherscan.io/tx/${step.blockchainTx}`
                          window.open(blockExplorerUrl, "_blank")
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Transaction
                        <span className="ml-1 text-muted-foreground">
                          {step.blockchainTx.substring(0, 6)}...
                        </span>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Summary */}
      <Card className="border border-border/50 bg-muted/30 p-4 mt-6">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {supplyChain.filter((s) => s.status === "completed").length}
            </p>
            <p className="text-muted-foreground text-xs mt-1">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {supplyChain.filter((s) => s.status === "in-transit").length}
            </p>
            <p className="text-muted-foreground text-xs mt-1">In Transit</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {supplyChain.filter((s) => s.status === "failed").length}
            </p>
            <p className="text-muted-foreground text-xs mt-1">Failed</p>
          </div>
        </div>
      </Card>

      {/* Info box */}
      <Card className="border border-border/50 bg-blue-500/10 p-4">
        <p className="text-sm text-muted-foreground">
          This timeline shows the complete journey of the product from manufacturing to its current
          location. Each checkpoint is verified on the blockchain.
        </p>
      </Card>
    </div>
  )
}
