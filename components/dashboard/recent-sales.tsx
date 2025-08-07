import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentSales() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>OM</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none text-white">Olivia Martin</p>
          <p className="text-sm text-gray-400">olivia.martin@email.com</p>
        </div>
        <div className="ml-auto font-medium text-yellow-400">+$1,999.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>JL</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none text-white">Jackson Lee</p>
          <p className="text-sm text-gray-400">jackson.lee@email.com</p>
        </div>
        <div className="ml-auto font-medium text-yellow-400">+$39.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>IN</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none text-white">Isabella Nguyen</p>
          <p className="text-sm text-gray-400">isabella.nguyen@email.com</p>
        </div>
        <div className="ml-auto font-medium text-yellow-400">+$299.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>WK</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none text-white">William Kim</p>
          <p className="text-sm text-gray-400">will@email.com</p>
        </div>
        <div className="ml-auto font-medium text-yellow-400">+$99.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>SD</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none text-white">Sofia Davis</p>
          <p className="text-sm text-gray-400">sofia.davis@email.com</p>
        </div>
        <div className="ml-auto font-medium text-yellow-400">+$39.00</div>
      </div>
    </div>
  )
}
