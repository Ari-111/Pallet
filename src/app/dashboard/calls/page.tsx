"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Phone,
  Search,
  Filter,
  PlayCircle,
  Download,
  Clock,
  Calendar,
  ChevronDown,
  X,
  MessageSquare,
  Bot,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockCallLogs, mockMetrics } from "@/lib/mock-data"
import { formatDuration, formatDate, formatTime } from "@/lib/utils"

const outcomeFilters = [
  { value: "all", label: "All Outcomes" },
  { value: "appointment_booked", label: "Appointment Booked" },
  { value: "inquiry", label: "Inquiry" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_answer", label: "No Answer" }
]

const outcomeColors: Record<string, string> = {
  appointment_booked: "success",
  inquiry: "info",
  cancelled: "warning",
  no_answer: "secondary"
}

export default function CallsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [outcomeFilter, setOutcomeFilter] = useState("all")
  const [selectedCall, setSelectedCall] = useState<typeof mockCallLogs[0] | null>(null)

  const filteredCalls = mockCallLogs.filter((call) => {
    const matchesSearch =
      call.callerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.callerPhone.includes(searchQuery)
    const matchesOutcome = outcomeFilter === "all" || call.outcome === outcomeFilter
    return matchesSearch && matchesOutcome
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Call Logs</h1>
          <p className="text-muted-foreground">View and analyze your AI agent conversations</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockMetrics.totalCalls}</p>
                <p className="text-sm text-muted-foreground">Total Calls</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockMetrics.totalBookings}</p>
                <p className="text-sm text-muted-foreground">Bookings Made</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatDuration(mockMetrics.avgCallDuration)}</p>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockMetrics.conversionRate}%</p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by outcome" />
          </SelectTrigger>
          <SelectContent>
            {outcomeFilters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Calls List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredCalls.length === 0 ? (
              <div className="p-12 text-center">
                <Phone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No calls found</p>
                <p className="text-muted-foreground">Try adjusting your filters</p>
              </div>
            ) : (
              filteredCalls.map((call, index) => (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedCall(call)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar>
                        <AvatarFallback>
                          {call.callerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{call.callerName}</p>
                          <Badge variant={outcomeColors[call.outcome] as any}>
                            {call.outcome.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{call.callerPhone}</p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium">{formatDuration(call.duration)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(call.createdAt)} at {formatTime(call.createdAt)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <PlayCircle className="w-4 h-4" />
                      View
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transcript Modal */}
      <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {selectedCall?.callerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p>{selectedCall?.callerName}</p>
                <p className="text-sm font-normal text-muted-foreground">
                  {selectedCall?.callerPhone}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription>
              {selectedCall && (
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDuration(selectedCall.duration)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedCall.createdAt)}
                  </span>
                  <Badge variant={outcomeColors[selectedCall.outcome] as any}>
                    {selectedCall.outcome.replace("_", " ")}
                  </Badge>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedCall && (
            <Tabs defaultValue="transcript" className="flex-1 overflow-hidden">
              <TabsList>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>

              <TabsContent value="transcript" className="flex-1 overflow-y-auto mt-4">
                <div className="space-y-4 pb-4">
                  {selectedCall.transcript.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex gap-3 ${
                        message.speaker === "agent" ? "" : "justify-end"
                      }`}
                    >
                      {message.speaker === "agent" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          message.speaker === "agent"
                            ? "bg-violet-100 text-violet-900 rounded-tl-sm"
                            : "bg-muted rounded-tr-sm"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs opacity-60 mt-1">{message.timestamp}</p>
                      </div>
                      {message.speaker === "user" && (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="summary" className="mt-4">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted">
                    <h4 className="font-medium mb-2">Call Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      Customer called to {selectedCall.outcome === "appointment_booked" 
                        ? "book an appointment" 
                        : selectedCall.outcome === "inquiry" 
                        ? "inquire about services" 
                        : "cancel their booking"}. 
                      The conversation lasted {formatDuration(selectedCall.duration)}.
                    </p>
                  </div>

                  {selectedCall.outcome === "appointment_booked" && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <h4 className="font-medium text-emerald-700 mb-2">Booking Created</h4>
                      <p className="text-sm text-emerald-600">
                        Appointment was successfully scheduled for the customer.
                      </p>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-muted">
                    <h4 className="font-medium mb-2">Key Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Appointment</Badge>
                      <Badge variant="outline">Timing</Badge>
                      <Badge variant="outline">Services</Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
