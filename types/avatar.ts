export interface AvatarOption {
  id: string
  name: string
  skinTone: string
  hairstyle: string
  expression: string
  clothing: string
  background: string
  gender: "male" | "female" | "non-binary"
  region: string
}

export interface AvatarCustomization {
  skinTone: string
  hairstyle: string
  expression: string
  background: string
}

export const SKIN_TONES = [
  { id: "tone1", name: "Light Brown", color: "#D4A574" },
  { id: "tone2", name: "Medium Brown", color: "#B8956A" },
  { id: "tone3", name: "Dark Brown", color: "#8B6F47" },
  { id: "tone4", name: "Deep Brown", color: "#6B4423" },
  { id: "tone5", name: "Rich Ebony", color: "#4A2C17" },
  { id: "tone6", name: "Dark Ebony", color: "#2D1810" },
]

export const HAIRSTYLES = [
  { id: "afro", name: "Natural Afro", category: "natural" },
  { id: "locs", name: "Dreadlocks", category: "natural" },
  { id: "braids", name: "Box Braids", category: "protective" },
  { id: "cornrows", name: "Cornrows", category: "protective" },
  { id: "twist", name: "Twist Out", category: "natural" },
  { id: "fade", name: "Fade Cut", category: "cut" },
  { id: "waves", name: "Waves", category: "styled" },
  { id: "bantu", name: "Bantu Knots", category: "protective" },
  { id: "headwrap", name: "Head Wrap", category: "wrapped" },
  { id: "short", name: "Short Natural", category: "natural" },
]

export const EXPRESSIONS = [
  { id: "happy", name: "Happy", emoji: "😊" },
  { id: "confident", name: "Confident", emoji: "😎" },
  { id: "peaceful", name: "Peaceful", emoji: "😌" },
  { id: "determined", name: "Determined", emoji: "💪" },
  { id: "friendly", name: "Friendly", emoji: "😄" },
  { id: "wise", name: "Wise", emoji: "🤔" },
]

export const BACKGROUNDS = [
  { id: "green", name: "Forest Green", color: "#228B22" },
  { id: "gold", name: "Golden Yellow", color: "#FFD700" },
  { id: "red", name: "Warm Red", color: "#DC143C" },
  { id: "blue", name: "Ocean Blue", color: "#4169E1" },
  { id: "purple", name: "Royal Purple", color: "#8A2BE2" },
  { id: "orange", name: "Sunset Orange", color: "#FF8C00" },
  { id: "pattern1", name: "Kente Pattern", color: "linear-gradient(45deg, #FFD700, #DC143C, #228B22)" },
  { id: "pattern2", name: "Mudcloth Pattern", color: "linear-gradient(90deg, #8B4513, #DEB887)" },
]
