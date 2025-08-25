"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, UserPlus, X, Inbox, Send } from "lucide-react"
import { useFriendRequests } from "@/hooks/use-friend-requests"
import { useRouter } from "next/navigation"

export default function MyFriendRequestsPage() {
  const { pendingRequests, sentRequests, loading, acceptRequest, rejectRequest } = useFriendRequests()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Friend Requests</h1>
            <p className="text-muted-foreground">Manage requests you've received</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/communities/my-friends')}>
            Back to Friends
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading requests...
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No pending requests
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={req.profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {(req.profile?.first_name?.[0] || 'U').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {req.profile?.first_name} {req.profile?.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">wants to connect</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => acceptRequest(req.id)}>
                        <UserPlus className="h-4 w-4 mr-1" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => rejectRequest(req.id)}>
                        <X className="h-4 w-4 mr-1" /> Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Sent Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading requests...
              </div>
            ) : sentRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No sent requests
              </div>
            ) : (
              <div className="space-y-4">
                {sentRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={req.profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {(req.profile?.first_name?.[0] || 'U').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {req.profile?.first_name} {req.profile?.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">request pending</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


