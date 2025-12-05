"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Bell,
  Shield,
  CreditCard,
  Link2,
  MessageSquare,
  Webhook,
  Globe,
  Trash2,
  ExternalLink,
  Check,
  Copy,
  RefreshCw,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { mockBusinessData } from "@/lib/mock-data"

export default function SettingsPage() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto gap-2 bg-transparent p-0">
          {[
            { value: "business", label: "Business", icon: Building2 },
            { value: "integrations", label: "Integrations", icon: Link2 },
            { value: "notifications", label: "Notifications", icon: Bell },
            { value: "billing", label: "Billing", icon: CreditCard },
            { value: "account", label: "Account", icon: User }
          ].map((tab) => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value} 
              className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 border"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Business Profile */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Update your business details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                    {mockBusinessData.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">Change Logo</Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Recommended: 256x256px, PNG or JPG
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input id="businessName" defaultValue={mockBusinessData.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Business Category</Label>
                  <Select defaultValue="salon">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salon">Salon & Spa</SelectItem>
                      <SelectItem value="clinic">Medical Clinic</SelectItem>
                      <SelectItem value="fitness">Fitness & Gym</SelectItem>
                      <SelectItem value="services">Home Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="phone" className="pl-9" defaultValue={mockBusinessData.phone} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" className="pl-9" defaultValue={mockBusinessData.email} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input id="address" className="pl-9" defaultValue={mockBusinessData.address} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button className="ml-auto">Save Changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>Set your operating hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { day: "Monday", open: "09:00", close: "21:00", enabled: true },
                  { day: "Tuesday", open: "09:00", close: "21:00", enabled: true },
                  { day: "Wednesday", open: "09:00", close: "21:00", enabled: true },
                  { day: "Thursday", open: "09:00", close: "21:00", enabled: true },
                  { day: "Friday", open: "09:00", close: "21:00", enabled: true },
                  { day: "Saturday", open: "10:00", close: "18:00", enabled: true },
                  { day: "Sunday", open: "10:00", close: "14:00", enabled: false }
                ].map((schedule, index) => (
                  <motion.div
                    key={schedule.day}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4"
                  >
                    <Switch defaultChecked={schedule.enabled} />
                    <span className="w-24 text-sm font-medium">{schedule.day}</span>
                    <Input className="w-24" type="time" defaultValue={schedule.open} disabled={!schedule.enabled} />
                    <span className="text-muted-foreground">to</span>
                    <Input className="w-24" type="time" defaultValue={schedule.close} disabled={!schedule.enabled} />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          {/* Telegram */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Telegram</CardTitle>
                    <CardDescription>Receive call notifications and manage bookings</CardDescription>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  <Check className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50 flex items-center justify-between">
                <div>
                  <p className="font-medium">Bot Username</p>
                  <p className="text-sm text-muted-foreground">@StyleStudioBot</p>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Telegram
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Receive booking confirmations</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Receive call summaries</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Daily digest</span>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* SIP/Phone */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Phone (SIP)</CardTitle>
                    <CardDescription>Your virtual phone number for AI calls</CardDescription>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  <Check className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Virtual Number</p>
                    <p className="font-mono font-medium">+91 22 4123 4567</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => copyToClipboard("+912241234567", "phone")}
                  >
                    {copied === "phone" ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">SIP URI</p>
                    <p className="font-mono text-sm">sip:style-studio@pallet.voip</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => copyToClipboard("sip:style-studio@pallet.voip", "sip")}
                  >
                    {copied === "sip" ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <RefreshCw className="w-4 h-4" />
                Request New Number
              </Button>
            </CardContent>
          </Card>

          {/* Webhook */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Webhook className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Webhooks</CardTitle>
                  <CardDescription>Send call events to your server</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Endpoint URL</Label>
                <Input placeholder="https://your-server.com/webhook" />
              </div>
              <div className="space-y-3">
                <Label>Events</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Call started</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Call ended</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Booking created</span>
                  <Switch />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button>Save Webhook</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { title: "New bookings", description: "When a customer books an appointment", email: true, push: true, telegram: true },
                { title: "Cancelled bookings", description: "When a customer cancels", email: true, push: true, telegram: true },
                { title: "Call summaries", description: "AI-generated summary after each call", email: false, push: false, telegram: true },
                { title: "Daily digest", description: "Summary of the day's activity", email: true, push: false, telegram: false },
                { title: "Weekly reports", description: "Performance insights and analytics", email: true, push: false, telegram: false },
                { title: "Product updates", description: "New features and improvements", email: true, push: false, telegram: false }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <Switch defaultChecked={item.email} />
                      <span className="text-xs text-muted-foreground">Email</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Switch defaultChecked={item.push} />
                      <span className="text-xs text-muted-foreground">Push</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Switch defaultChecked={item.telegram} />
                      <span className="text-xs text-muted-foreground">Telegram</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>You&apos;re on the Pro plan</CardDescription>
                </div>
                <Badge className="bg-violet-100 text-violet-700 border-violet-200">Pro</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-200">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">₹2,999</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Renews on Dec 15, 2024</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Plan includes:</p>
                {[
                  "Unlimited AI calls",
                  "Up to 5 team members",
                  "Priority support",
                  "Advanced analytics",
                  "Custom agent training"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-600" />
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex gap-3">
              <Button variant="outline">Change Plan</Button>
              <Button variant="outline">Billing History</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Manage your payment details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 rounded bg-slate-800 flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/26</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-2xl">RK</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">Change Photo</Button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input defaultValue="Rahul" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input defaultValue="Kumar" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" defaultValue="rahul@stylestudio.in" />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue="+91 98765 43210" />
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button className="ml-auto">Save Changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                </div>
                <Button variant="outline">Change Password</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Active Sessions</p>
                  <p className="text-sm text-muted-foreground">2 devices currently logged in</p>
                </div>
                <Button variant="outline">Manage</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red-600/70">
                Irreversible actions that affect your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-red-700">Delete Account</p>
                  <p className="text-sm text-red-600/70">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
