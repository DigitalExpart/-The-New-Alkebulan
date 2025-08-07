"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ShoppingCart,
  MessageSquare,
  MoreHorizontal,
  Eye,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Package,
} from "lucide-react"
import type { BusinessOrder } from "@/types/business"

interface OrdersInquiriesSectionProps {
  orders?: BusinessOrder[]
}

export function OrdersInquiriesSection({ orders = [] }: OrdersInquiriesSectionProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "canceled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "canceled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true
    return order.status === statusFilter
  })

  const orderItems = filteredOrders.filter((item) => item.type === "order")
  const inquiryItems = filteredOrders.filter((item) => item.type === "inquiry")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatAmount = (amount?: number) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const renderOrderCard = (item: BusinessOrder) => (
    <Card key={item.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={item.customerAvatar || "/placeholder.svg"} alt={item.customerName} />
              <AvatarFallback>
                {item.customerName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-medium">{item.customerName}</h4>
              <p className="text-sm text-muted-foreground">{item.productTitle}</p>
              <p className="text-xs text-muted-foreground">{formatDate(item.orderDate)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {item.amount && (
              <div className="text-right">
                <p className="font-semibold">{formatAmount(item.amount)}</p>
              </div>
            )}
            <Badge className={`${getStatusColor(item.status)} flex items-center gap-1`}>
              {getStatusIcon(item.status)}
              {item.status}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="h-4 w-4 mr-2" />
                  Message Customer
                </DropdownMenuItem>
                {item.status === "pending" && (
                  <DropdownMenuItem>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Processing
                  </DropdownMenuItem>
                )}
                {item.status === "processing" && (
                  <DropdownMenuItem>
                    <Truck className="h-4 w-4 mr-2" />
                    Mark as Shipped
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Orders & Inquiries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Orders Yet</h3>
            <p className="text-sm text-muted-foreground">
              Your orders and customer inquiries will appear here once you start receiving them.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Orders & Inquiries
            <Badge variant="secondary" className="ml-2">
              {orders.length} total
            </Badge>
          </CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders ({orderItems.length})
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Inquiries ({inquiryItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {orderItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No orders match the current filter.</p>
              </div>
            ) : (
              orderItems.map(renderOrderCard)
            )}
          </TabsContent>

          <TabsContent value="inquiries" className="space-y-4">
            {inquiryItems.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No inquiries match the current filter.</p>
              </div>
            ) : (
              inquiryItems.map(renderOrderCard)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
