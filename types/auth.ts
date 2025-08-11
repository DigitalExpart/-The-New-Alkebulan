export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export interface SignUpData {
  email: string
  password: string
  confirmPassword: string
  full_name: string
  account_type: 'buyer' | 'seller'
}

export interface SignInData {
  email: string
  password: string
}

export interface ResetPasswordData {
  email: string
}
