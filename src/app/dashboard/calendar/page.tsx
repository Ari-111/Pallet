"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Phone,
  User,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { mockAppointments, mockServices } from "@/lib/mock-data"
import { formatTime } from "@/lib/utils"
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth
} from "date-fns"

type ViewMode = "week" | "month"

const serviceColors: Record<string, string> = {
  "Haircut": "bg-violet-100 text-violet-700 border-violet-200",
  "Beard Trim": "bg-blue-100 text-blue-700 border-blue-200",
  "Hair Color": "bg-pink-100 text-pink-700 border-pink-200",
  "Facial": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Head Massage": "bg-amber-100 text-amber-700 border-amber-200",
  "Hair Spa": "bg-purple-100 text-purple-700 border-purple-200"
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>("week")
  const [selectedAppointment, setSelectedAppointment] = useState<typeof mockAppointments[0] | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null)

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDayOfWeek = monthStart.getDay()
  const paddingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 9
    return `${hour.toString().padStart(2, "0")}:00`
  })

  const getAppointmentsForDate = (date: Date) => {
    return mockAppointments.filter((apt) =>
      isSameDay(new Date(apt.appointmentTime), date)
    )
  }

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate(direction === "prev" ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1))
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + (direction === "prev" ? -1 : 1))
    setCurrentDate(newDate)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Manage your appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl bg-muted p-1">
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "week" ? "bg-white shadow-sm" : "text-muted-foreground"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "month" ? "bg-white shadow-sm" : "text-muted-foreground"
              }`}
            >
              Month
            </button>
          </div>
          <Button variant="gradient" className="gap-2">
            <Plus className="w-4 h-4" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => (viewMode === "week" ? navigateWeek("prev") : navigateMonth("prev"))}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold">
          {viewMode === "week"
            ? `${format(weekStart, "MMM d")} - ${format(addDays(weekStart, 6), "MMM d, yyyy")}`
            : format(currentDate, "MMMM yyyy")}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => (viewMode === "week" ? navigateWeek("next") : navigateMonth("next"))}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Week View */}
      {viewMode === "week" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Days Header */}
                <div className="grid grid-cols-8 border-b">
                  <div className="p-3 text-sm font-medium text-muted-foreground">Time</div>
                  {weekDays.map((day) => (
                    <div
                      key={day.toISOString()}
                      className={`p-3 text-center border-l ${
                        isSameDay(day, new Date()) ? "bg-violet-50" : ""
                      }`}
                    >
                      <p className="text-sm text-muted-foreground">{format(day, "EEE")}</p>
                      <p
                        className={`text-lg font-semibold ${
                          isSameDay(day, new Date()) ? "text-violet-600" : ""
                        }`}
                      >
                        {format(day, "d")}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                {timeSlots.map((time) => (
                  <div key={time} className="grid grid-cols-8 border-b last:border-0">
                    <div className="p-2 text-sm text-muted-foreground border-r">
                      {time}
                    </div>
                    {weekDays.map((day) => {
                      const dayAppointments = getAppointmentsForDate(day)
                      const slotAppointments = dayAppointments.filter((apt) => {
                        const aptTime = new Date(apt.appointmentTime)
                        return aptTime.getHours() === parseInt(time.split(":")[0])
                      })

                      return (
                        <div
                          key={`${day.toISOString()}-${time}`}
                          className={`p-1 border-l min-h-[60px] hover:bg-muted/50 cursor-pointer transition-colors ${
                            isSameDay(day, new Date()) ? "bg-violet-50/50" : ""
                          }`}
                          onClick={() => setSelectedSlot({ date: day, time })}
                        >
                          {slotAppointments.map((apt) => (
                            <motion.div
                              key={apt.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`p-2 rounded-lg border text-xs mb-1 cursor-pointer ${
                                serviceColors[apt.service] || "bg-gray-100"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedAppointment(apt)
                              }}
                            >
                              <p className="font-medium truncate">{apt.customerName}</p>
                              <p className="opacity-75">{apt.service}</p>
                            </motion.div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Month View */}
      {viewMode === "month" && (
        <Card>
          <CardContent className="p-4">
            {/* Days Header */}
            <div className="grid grid-cols-7 mb-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Padding days */}
              {Array.from({ length: paddingDays }).map((_, i) => (
                <div key={`pad-${i}`} className="p-2 min-h-[100px]" />
              ))}

              {/* Month days */}
              {monthDays.map((day) => {
                const dayAppointments = getAppointmentsForDate(day)
                const isToday = isSameDay(day, new Date())

                return (
                  <div
                    key={day.toISOString()}
                    className={`p-2 min-h-[100px] rounded-xl border transition-colors hover:bg-muted/50 cursor-pointer ${
                      isToday ? "bg-violet-50 border-violet-200" : "border-transparent"
                    }`}
                    onClick={() => setSelectedSlot({ date: day, time: "09:00" })}
                  >
                    <p
                      className={`text-sm font-medium mb-1 ${
                        isToday ? "text-violet-600" : ""
                      }`}
                    >
                      {format(day, "d")}
                    </p>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 2).map((apt) => (
                        <div
                          key={apt.id}
                          className={`p-1 rounded text-xs truncate ${
                            serviceColors[apt.service] || "bg-gray-100"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedAppointment(apt)
                          }}
                        >
                          {formatTime(apt.appointmentTime)} {apt.customerName}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{dayAppointments.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointment Details Modal */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              {selectedAppointment && format(new Date(selectedAppointment.appointmentTime), "EEEE, MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                  {selectedAppointment.customerName.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedAppointment.customerName}</p>
                  <p className="text-muted-foreground">{selectedAppointment.customerPhone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-muted">
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-medium">{selectedAppointment.service}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted">
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{formatTime(selectedAppointment.appointmentTime)}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{selectedAppointment.duration} minutes</p>
                </div>
                <div className="p-3 rounded-xl bg-muted">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="success">{selectedAppointment.status}</Badge>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="p-3 rounded-xl bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2">
                  <Phone className="w-4 h-4" />
                  Call
                </Button>
                <Button variant="destructive" className="flex-1">
                  Cancel Appointment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Service Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Service Colors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {mockServices.map((service) => (
              <div key={service.id} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    serviceColors[service.name]?.includes("violet")
                      ? "bg-violet-500"
                      : serviceColors[service.name]?.includes("blue")
                      ? "bg-blue-500"
                      : serviceColors[service.name]?.includes("pink")
                      ? "bg-pink-500"
                      : serviceColors[service.name]?.includes("emerald")
                      ? "bg-emerald-500"
                      : serviceColors[service.name]?.includes("amber")
                      ? "bg-amber-500"
                      : serviceColors[service.name]?.includes("purple")
                      ? "bg-purple-500"
                      : "bg-gray-500"
                  }`}
                />
                <span className="text-sm text-muted-foreground">{service.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
