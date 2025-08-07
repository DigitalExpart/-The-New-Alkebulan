import { Search, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold text-white sm:inline-block">Diaspora Market Hub</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 md:w-[200px] lg:w-[300px] bg-[hsl(var(--input))] border-[hsl(var(--border))] text-white placeholder:text-gray-400"
              />
            </div>
          </div>
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-[hsl(var(--muted))]">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            <ThemeToggle />
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" alt="User" />
              <AvatarFallback className="bg-yellow-500 text-black">U</AvatarFallback>
            </Avatar>
          </nav>
        </div>
      </div>
    </header>
  )
}
