import type { Metadata } from "next"

import { Overview } from "@/components/dashboard/overview"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { Search } from "@/components/dashboard/search"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HeritageSection } from "@/components/journey/heritage-section"
import { NumerologySection } from "@/components/journey/numerology-section"

export const metadata: Metadata = {
  title: "My Journey",
  description: "A personalized dashboard to track your life's journey.",
}

export default function DashboardPage() {
  return (
    <>
      <Header />
      <div className="container relative pb-10">
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <div className="px-4 lg:fixed lg:w-1/5">
              <Search />
            </div>
          </aside>
          <div className="flex-1">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>$45,231.89</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>+2350</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Sales</CardTitle>
                </CardHeader>
                <CardContent>+12,234</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Active Now</CardTitle>
                </CardHeader>
                <CardContent>+573</CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <Overview />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </div>

            {/* Numerology Section */}
            <NumerologySection />

            {/* My Heritage Section */}
            <HeritageSection />
          </div>
        </div>
      </div>
    </>
  )
}
