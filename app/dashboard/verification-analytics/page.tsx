"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, TrendingDown, BarChart3, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CounterfeitAnalyticsData {
  totalDetections: number
  counterfeitRate: number
  avgConfidenceScore: number
  suspiciousCount: number
  topCounterfeitCategories: Array<{ category: string; count: number; amount: string }>
  commonIndicators: Array<{ indicator: string; frequency: number; severity: string }>
  highRiskRegions: Array<{ region: string; detections: number; costImpact: string }>
  detectionTrend: Array<{ date: string; authentic: number; suspicious: number; counterfeit: number }>
  riskBreakdown: { authentic: number; suspicious: number; counterfeit: number }
}

export default function CounterfeitAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d")
  const [analyticsData, setAnalyticsData] = useState<CounterfeitAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading analytics data
    const mockData: CounterfeitAnalyticsData = {
      totalDetections: 8,
      counterfeitRate: 50,
      avgConfidenceScore: 92.1,
      suspiciousCount: 1,
      topCounterfeitCategories: [
        { category: "Electronics", count: 3, amount: "$45,000" },
        { category: "Fashion", count: 2, amount: "$30,000" },
        { category: "Cosmetics", count: 1, amount: "$5,000" },
        { category: "Luxury Goods", count: 1, amount: "$25,000" },
        { category: "Watches", count: 1, amount: "$15,000" },
      ],
      commonIndicators: [
        { indicator: "Invalid Hologram", frequency: 85, severity: "Critical" },
        { indicator: "Blockchain Mismatch", frequency: 92, severity: "Critical" },
        { indicator: "QR Code Failure", frequency: 78, severity: "High" },
        { indicator: "Serial Number Fraud", frequency: 65, severity: "High" },
        { indicator: "Packaging Quality", frequency: 72, severity: "Medium" },
        { indicator: "Gray Market Diversion", frequency: 45, severity: "Medium" },
      ],
      highRiskRegions: [
        { region: "Southeast Asia", detections: 4, costImpact: "$120,000" },
        { region: "Eastern Europe", detections: 2, costImpact: "$55,000" },
        { region: "Middle East", detections: 1, costImpact: "$25,000" },
        { region: "Latin America", detections: 1, costImpact: "$20,000" },
      ],
      detectionTrend: [
        { date: "Nov 1", authentic: 2, suspicious: 0, counterfeit: 1 },
        { date: "Nov 2", authentic: 1, suspicious: 0, counterfeit: 2 },
        { date: "Nov 3", authentic: 1, suspicious: 1, counterfeit: 1 },
        { date: "Nov 4", authentic: 0, suspicious: 0, counterfeit: 0 },
        { date: "Nov 5", authentic: 0, suspicious: 0, counterfeit: 0 },
      ],
      riskBreakdown: { authentic: 4, suspicious: 1, counterfeit: 3 },
    }

    setAnalyticsData(mockData)
    setIsLoading(false)
  }, [timeRange])

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  if (!analyticsData) return null

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="mb-8" variants={itemVariants}>
        <Link href="/dashboard/verify-product">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 gap-2 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-4xl font-bold text-white mb-2">Threat Analysis</h1>
        <p className="text-slate-400">
          Global counterfeit threat intelligence and detection patterns
        </p>
      </motion.div>

      {/* Time Range Selector */}
      <motion.div className="mb-6 flex gap-2" variants={itemVariants}>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        className="grid md:grid-cols-4 gap-4 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {[
          {
            label: "Total Detections",
            value: analyticsData.totalDetections,
            color: "white",
          },
          {
            label: "Counterfeit Rate",
            value: `${analyticsData.counterfeitRate}%`,
            color: "red",
          },
          {
            label: "Avg Confidence",
            value: `${analyticsData.avgConfidenceScore}%`,
            color: "green",
          },
          {
            label: "Suspicious Items",
            value: analyticsData.suspiciousCount,
            color: "yellow",
          },
        ].map((metric, i) => (
          <motion.div
            key={i}
            className="p-4 rounded-lg border bg-white/5 border-white/10"
            variants={itemVariants}
          >
            <p className="text-sm text-slate-400 mb-1">{metric.label}</p>
            <p className="text-3xl font-bold text-white">{metric.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Top Counterfeit Categories */}
      <motion.div variants={itemVariants} className="mb-8">
        <Card className="p-6 bg-white/5 border-white/10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-red-400" />
            Top Counterfeit Categories by Economic Impact
          </h2>
          <div className="space-y-3">
            {analyticsData.topCounterfeitCategories.map((cat, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white font-medium">{cat.category}</p>
                  <p className="text-sm text-slate-400">{cat.count} items detected</p>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-bold">{cat.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Common Indicators */}
      <motion.div variants={itemVariants} className="mb-8">
        <Card className="p-6 bg-white/5 border-white/10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            Common Counterfeit Indicators
          </h2>
          <div className="space-y-3">
            {analyticsData.commonIndicators.map((ind, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white font-medium">{ind.indicator}</p>
                  <p className="text-sm text-slate-400">{ind.severity} Severity</p>
                </div>
                <div className="text-right">
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${ind.frequency}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{ind.frequency}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* High Risk Regions */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-white/5 border-white/10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-400" />
            High-Risk Regions
          </h2>
          <div className="space-y-3">
            {analyticsData.highRiskRegions.map((region, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="flex-1">
                  <p className="text-white font-medium">{region.region}</p>
                  <p className="text-sm text-slate-400">{region.detections} detections</p>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-bold">{region.costImpact}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
