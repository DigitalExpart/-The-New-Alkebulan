import { Progress } from "@/components/ui/progress"
import type { UserVerification } from "@/types/verification"
import { Shield, CheckCircle, AlertCircle } from "lucide-react"

interface VerificationStatsProps {
  verification: UserVerification
}

export function VerificationStats({ verification }: VerificationStatsProps) {
  const verifiedCount = verification.methods.filter((method) => method.status === "verified").length
  const pendingCount = verification.methods.filter((method) => method.status === "pending").length
  const totalMethods = verification.methods.length

  return (
    <div className="bg-white dark:bg-gray-950 border rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2">
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-medium">Security Score</h3>
            <div className="flex items-center gap-2">
              <Progress value={verification.securityScore} className="h-2 w-24" />
              <span className="text-sm font-medium">{verification.securityScore}%</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">
              {verifiedCount} of {totalMethods} verified
            </span>
          </div>

          {pendingCount > 0 && (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-sm">
                {pendingCount} pending action{pendingCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
