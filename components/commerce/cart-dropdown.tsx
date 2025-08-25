"use client"

import { useCart } from "./cart-context"
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function CartDropdown() {
  const { items, totalQuantity, subtotal, removeItem, updateQuantity, clear } = useCart()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2 dark:hover:bg-gold hover:text-black">
          <ShoppingCart className="w-5 h-5 text-white" />
          {totalQuantity > 0 && (
            <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center">
              {totalQuantity > 9 ? "9+" : totalQuantity}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-3">
          <DropdownMenuLabel className="px-0">Cart</DropdownMenuLabel>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-72 overflow-auto">
          {items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Your cart is empty</div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-3 py-2 border-b last:border-b-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded bg-muted" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}><Minus className="w-3 h-3"/></Button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="w-3 h-3"/></Button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-7 w-7 text-red-600"><Trash2 className="w-4 h-4"/></Button>
              </div>
            ))
          )}
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={clear} disabled={items.length === 0}>Clear</Button>
            <Button className="flex-1" disabled={items.length === 0} onClick={() => (window.location.href = "/checkout")}>Checkout</Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


