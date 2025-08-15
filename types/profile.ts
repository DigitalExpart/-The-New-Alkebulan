export interface Profile {
  id?: string
  user_id: string
  email?: string
  full_name?: string
  username?: string
  bio?: string
  location?: string
  website?: string
  phone?: string
  occupation?: string
  education?: string
  avatar_url?: string
  is_public?: boolean
  account_type?: 'buyer' | 'business'
  created_at?: string
  updated_at?: string
  
  // New fields
  language_preference?: string
  region?: string
  gender?: string
  place_of_birth?: string
  date_of_birth?: string
  relationship_status?: string
  family_members?: FamilyMember[]
  interests?: string[]
  work_experience?: WorkExperience[]
  core_competencies?: string[]
}

export interface FamilyMember {
  id?: string
  name: string
  relationship: string
  age?: number
  occupation?: string
}

export interface WorkExperience {
  id?: string
  company: string
  position: string
  start_date: string
  end_date?: string
  description?: string
  achievements?: string[]
}

export interface InterestSuggestion {
  id: string
  name: string
  category: string
  description?: string
}

export interface CompetencySuggestion {
  id: string
  name: string
  category: string
  description?: string
}

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'nl', label: 'Dutch' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'es', label: 'Spanish' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'sw', label: 'Swahili' },
  { value: 'yo', label: 'Yoruba' },
  { value: 'ig', label: 'Igbo' },
  { value: 'ha', label: 'Hausa' },
  { value: 'zu', label: 'Zulu' },
  { value: 'xh', label: 'Xhosa' },
  { value: 'other', label: 'Other' }
]

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
]

export const RELATIONSHIP_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'in-relationship', label: 'In a relationship' },
  { value: 'engaged', label: 'Engaged' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'complicated', label: 'It\'s complicated' }
]

export const INTEREST_SUGGESTIONS: InterestSuggestion[] = [
  // Culture & Heritage
  { id: '1', name: 'African History', category: 'Culture & Heritage' },
  { id: '2', name: 'Traditional Music', category: 'Culture & Heritage' },
  { id: '3', name: 'African Art', category: 'Culture & Heritage' },
  { id: '4', name: 'Traditional Dance', category: 'Culture & Heritage' },
  { id: '5', name: 'African Literature', category: 'Culture & Heritage' },
  
  // Technology
  { id: '6', name: 'Web Development', category: 'Technology' },
  { id: '7', name: 'Mobile Apps', category: 'Technology' },
  { id: '8', name: 'AI & Machine Learning', category: 'Technology' },
  { id: '9', name: 'Blockchain', category: 'Technology' },
  { id: '10', name: 'Cybersecurity', category: 'Technology' },
  
  // Business & Finance
  { id: '11', name: 'Entrepreneurship', category: 'Business & Finance' },
  { id: '12', name: 'Investment', category: 'Business & Finance' },
  { id: '13', name: 'Digital Marketing', category: 'Business & Finance' },
  { id: '14', name: 'E-commerce', category: 'Business & Finance' },
  { id: '15', name: 'Consulting', category: 'Business & Finance' },
  
  // Health & Wellness
  { id: '16', name: 'Mental Health', category: 'Health & Wellness' },
  { id: '17', name: 'Physical Fitness', category: 'Health & Wellness' },
  { id: '18', name: 'Nutrition', category: 'Health & Wellness' },
  { id: '19', name: 'Yoga', category: 'Health & Wellness' },
  { id: '20', name: 'Meditation', category: 'Health & Wellness' },
  
  // Education & Learning
  { id: '21', name: 'Online Learning', category: 'Education & Learning' },
  { id: '22', name: 'Language Learning', category: 'Education & Learning' },
  { id: '23', name: 'Public Speaking', category: 'Education & Learning' },
  { id: '24', name: 'Writing', category: 'Education & Learning' },
  { id: '25', name: 'Research', category: 'Education & Learning' }
]

export const COMPETENCY_SUGGESTIONS: CompetencySuggestion[] = [
  // Technical Skills
  { id: '1', name: 'JavaScript/TypeScript', category: 'Technical Skills' },
  { id: '2', name: 'React/Next.js', category: 'Technical Skills' },
  { id: '3', name: 'Python', category: 'Technical Skills' },
  { id: '4', name: 'Data Analysis', category: 'Technical Skills' },
  { id: '5', name: 'UI/UX Design', category: 'Technical Skills' },
  
  // Soft Skills
  { id: '6', name: 'Leadership', category: 'Soft Skills' },
  { id: '7', name: 'Communication', category: 'Soft Skills' },
  { id: '8', name: 'Problem Solving', category: 'Soft Skills' },
  { id: '9', name: 'Team Collaboration', category: 'Soft Skills' },
  { id: '10', name: 'Time Management', category: 'Soft Skills' },
  
  // Business Skills
  { id: '11', name: 'Project Management', category: 'Business Skills' },
  { id: '12', name: 'Strategic Planning', category: 'Business Skills' },
  { id: '13', name: 'Financial Analysis', category: 'Business Skills' },
  { id: '14', name: 'Market Research', category: 'Business Skills' },
  { id: '15', name: 'Negotiation', category: 'Business Skills' }
]
