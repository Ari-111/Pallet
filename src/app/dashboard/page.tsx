"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  Phone,
  Calendar,
  TrendingUp,
  Clock,
  PlayCircle,
  Plus,
  MessageSquare,
  ArrowUpRight,
  Mic
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { mockAppointments, mockCallLogs, mockMetrics, mockWeeklyStats } from "@/lib/mock-data"
import { formatTime, formatDuration } from "@/lib/utils"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

const statsCards = [
  {
    title: "Calls Today",
    value: mockMetrics.callsToday,
    change: "+12%",
    icon: Phone,
    color: "violet"
  },
  {
    title: "Bookings Today",
    value: mockMetrics.bookingsToday,
    change: "+8%",
    icon: Calendar,
    color: "emerald"
  },
  {
    title: "Conversion Rate",
    value: `${mockMetrics.conversionRate}%`,
    change: "+5%",
    icon: TrendingUp,
    color: "blue"
  },
  {
    title: "Avg Call Duration",
    value: formatDuration(mockMetrics.avgCallDuration),
    change: "-10s",
    icon: Clock,
    color: "amber"
  }
]

const quickActions = [
  { label: "Add Appointment", icon: Plus, href: "/dashboard/calendar" },
  { label: "Test Voice Agent", icon: Mic, href: "/try-agent" },
  { label: "Connect Telegram", icon: MessageSquare, href: "/dashboard/settings" }
]

export default function DashboardPage() {
  const todayAppointments = mockAppointments.slice(0, 3)
  const recentCalls = mockCallLogs.slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, Raj! 👋</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your business today.</p>
        </div>
        <Link href="/try-agent">
          <Button variant="gradient" className="gap-2">
            <Mic className="w-4 h-4" />
            Try Voice Agent
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      {stat.change} from yesterday
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Button variant="outline" className="gap-2">
              <action.icon className="w-4 h-4" />
              {action.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Today&apos;s Appointments</CardTitle>
                <CardDescription>You have {todayAppointments.length} appointments today</CardDescription>
              </div>
              <Link href="/dashboard/calendar">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAppointments.map((apt, index) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {apt.customerName.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{apt.customerName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{apt.service}</span>
                          <span>•</span>
                          <span>{apt.duration} min</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatTime(apt.appointmentTime)}</p>
                      <Badge variant="success">{apt.status}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Stats Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Overview</CardTitle>
            <CardDescription>Calls vs Bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockWeeklyStats}>
                  <defs>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="calls"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCalls)"
                  />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorBookings)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-500" />
                <span className="text-sm text-muted-foreground">Calls</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-muted-foreground">Bookings</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Calls */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Calls</CardTitle>
            <CardDescription>Your latest customer conversations</CardDescription>
          </div>
          <Link href="/dashboard/calls">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Caller</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Duration</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Outcome</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentCalls.map((call, index) => (
                  <motion.tr
                    key={call.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {call.callerName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{call.callerName}</p>
                          <p className="text-xs text-muted-foreground">{call.callerPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{formatDuration(call.duration)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          call.outcome === "appointment_booked"
                            ? "success"
                            : call.outcome === "inquiry"
                            ? "info"
                            : "warning"
                        }
                      >
                        {call.outcome.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(call.createdAt).toLocaleTimeString("en-IN", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true
                        })}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <PlayCircle className="w-4 h-4" />
                        Transcript
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
