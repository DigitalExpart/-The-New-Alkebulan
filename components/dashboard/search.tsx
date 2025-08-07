import { Input } from "@/components/ui/input"

export function Search() {
  return (
    <div>
      <Input
        type="search"
        placeholder="Search..."
        className="md:w-[100px] lg:w-[300px] bg-[hsl(var(--input))] border-[hsl(var(--border))] text-white placeholder:text-gray-400"
      />
    </div>
  )
}
