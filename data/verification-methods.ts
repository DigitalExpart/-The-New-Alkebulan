import type { UserVerification } from "@/types/verification"

export const userVerification: UserVerification = {
  userId: "user-123",
  securityScore: 45,
  methods: [
    {
      id: "document",
      title: "Document Verification",
      description: "Verify your identity with a government-issued ID",
      icon: "shield",
      status: "verified",
      lastUpdated: "2023-07-15T10:30:00Z",
      completedDate: "2023-07-15T10:30:00Z",
    },
    {
      id: "age",
      title: "Age Verification",
      description: "Confirm you meet the minimum age requirements",
      icon: "calendar",
      status: "pending",
      lastUpdated: "2023-07-20T14:45:00Z",
    },
    {
      id: "address",
      title: "Address Verification",
      description: "Verify your current residential address",
      icon: "map-pin",
      status: "not-started",
    },
    {
      id: "biometric",
      title: "Biometric Verification",
      description: "Secure your account with facial recognition",
      icon: "scan-face",
      status: "not-started",
    },
  ],
}
