import type { NumberMeaning, PersonalYearMeaning, JournalingPrompt } from "@/types/numerology"

export const numberMeanings: NumberMeaning[] = [
  {
    number: 1,
    title: "The Leader",
    description:
      "You are a natural-born leader with pioneering spirit and independence. Your path is about initiating new beginnings and inspiring others through your courage and determination.",
    strengths: ["Leadership", "Independence", "Innovation", "Courage", "Determination"],
    challenges: ["Impatience", "Selfishness", "Stubbornness", "Domineering tendencies"],
    purpose: "To lead by example and pioneer new paths for others to follow",
    famousPeople: ["Steve Jobs", "Lady Gaga", "Martin Luther King Jr.", "Tom Hanks"],
    keywords: ["Pioneer", "Leader", "Independent", "Original", "Ambitious"],
    element: "Fire",
    color: "#FF6B6B",
    icon: "👑",
  },
  {
    number: 2,
    title: "The Peacemaker",
    description:
      "You are the diplomat and mediator, bringing harmony and cooperation wherever you go. Your sensitivity and intuition make you an excellent partner and team player.",
    strengths: ["Cooperation", "Diplomacy", "Sensitivity", "Patience", "Supportiveness"],
    challenges: ["Over-sensitivity", "Indecisiveness", "Dependency", "Passive-aggressiveness"],
    purpose: "To create harmony and bring people together through understanding and cooperation",
    famousPeople: ["Barack Obama", "Jennifer Aniston", "Kanye West", "Madonna"],
    keywords: ["Diplomat", "Cooperative", "Sensitive", "Peaceful", "Supportive"],
    element: "Water",
    color: "#4ECDC4",
    icon: "🕊️",
  },
  {
    number: 3,
    title: "The Creative",
    description:
      "You are the artist and communicator, blessed with creativity, optimism, and the gift of expression. Your joy and enthusiasm inspire others to see the beauty in life.",
    strengths: ["Creativity", "Communication", "Optimism", "Artistic talent", "Social skills"],
    challenges: ["Scattered energy", "Superficiality", "Mood swings", "Lack of focus"],
    purpose: "To inspire and uplift others through creative expression and joyful communication",
    famousPeople: ["Jim Carrey", "Reese Witherspoon", "Jackie Chan", "Cameron Diaz"],
    keywords: ["Creative", "Expressive", "Optimistic", "Artistic", "Social"],
    element: "Fire",
    color: "#45B7D1",
    icon: "🎨",
  },
  {
    number: 4,
    title: "The Builder",
    description:
      "You are the foundation of society, bringing stability, organization, and practical solutions. Your dedication and hard work create lasting structures and systems.",
    strengths: ["Stability", "Organization", "Practicality", "Reliability", "Hard work"],
    challenges: ["Rigidity", "Stubbornness", "Narrow-mindedness", "Workaholic tendencies"],
    purpose: "To build solid foundations and create order from chaos through practical application",
    famousPeople: ["Oprah Winfrey", "Bill Gates", "Clint Eastwood", "Arnold Schwarzenegger"],
    keywords: ["Stable", "Organized", "Practical", "Reliable", "Methodical"],
    element: "Earth",
    color: "#96CEB4",
    icon: "🏗️",
  },
  {
    number: 5,
    title: "The Explorer",
    description:
      "You are the free spirit and adventurer, seeking variety, freedom, and new experiences. Your curiosity and adaptability make you a natural explorer of life's possibilities.",
    strengths: ["Freedom", "Adaptability", "Curiosity", "Versatility", "Progressive thinking"],
    challenges: ["Restlessness", "Irresponsibility", "Impulsiveness", "Lack of commitment"],
    purpose: "To explore life's possibilities and inspire others to embrace change and freedom",
    famousPeople: ["Angelina Jolie", "Ryan Gosling", "Mick Jagger", "Abraham Lincoln"],
    keywords: ["Free", "Adventurous", "Curious", "Versatile", "Progressive"],
    element: "Air",
    color: "#FFEAA7",
    icon: "🌍",
  },
  {
    number: 6,
    title: "The Nurturer",
    description:
      "You are the caregiver and healer, devoted to family, home, and community. Your compassion and sense of responsibility make you a natural protector and guide.",
    strengths: ["Compassion", "Responsibility", "Nurturing", "Healing", "Service to others"],
    challenges: ["Over-protectiveness", "Martyrdom", "Worry", "Perfectionism"],
    purpose: "To nurture and heal others while creating harmony in home and community",
    famousPeople: ["Mother Teresa", "John Lennon", "Einstein", "Stevie Wonder"],
    keywords: ["Nurturing", "Caring", "Responsible", "Healing", "Protective"],
    element: "Earth",
    color: "#DDA0DD",
    icon: "💝",
  },
  {
    number: 7,
    title: "The Mystic",
    description:
      "You are the seeker of truth and wisdom, drawn to the mysteries of life and the spiritual realm. Your analytical mind and intuitive nature make you a natural philosopher.",
    strengths: ["Wisdom", "Intuition", "Analysis", "Spirituality", "Inner knowing"],
    challenges: ["Isolation", "Skepticism", "Perfectionism", "Difficulty trusting others"],
    purpose: "To seek truth and wisdom, sharing spiritual insights with the world",
    famousPeople: ["Marilyn Monroe", "Leonardo DiCaprio", "Julia Roberts", "Johnny Depp"],
    keywords: ["Mystical", "Wise", "Intuitive", "Analytical", "Spiritual"],
    element: "Water",
    color: "#98D8C8",
    icon: "🔮",
  },
  {
    number: 8,
    title: "The Achiever",
    description:
      "You are the powerhouse and material master, destined for success in the material world. Your ambition and business acumen make you a natural leader in commerce and industry.",
    strengths: ["Ambition", "Business acumen", "Material success", "Authority", "Efficiency"],
    challenges: ["Materialism", "Workaholism", "Ruthlessness", "Impatience with others"],
    purpose: "To achieve material success while using power and resources for the greater good",
    famousPeople: ["Pablo Picasso", "Nelson Mandela", "Sandra Bullock", "Matt Damon"],
    keywords: ["Ambitious", "Successful", "Powerful", "Efficient", "Authoritative"],
    element: "Earth",
    color: "#F7DC6F",
    icon: "💎",
  },
  {
    number: 9,
    title: "The Humanitarian",
    description:
      "You are the universal lover and humanitarian, called to serve humanity with compassion and wisdom. Your broad perspective and generous spirit make you a natural healer of the world.",
    strengths: ["Compassion", "Generosity", "Universal love", "Wisdom", "Humanitarian service"],
    challenges: ["Emotional volatility", "Impracticality", "Martyrdom", "Difficulty with boundaries"],
    purpose: "To serve humanity and heal the world through love, compassion, and universal understanding",
    famousPeople: ["Mahatma Gandhi", "Elvis Presley", "Jim Carrey", "Morgan Freeman"],
    keywords: ["Humanitarian", "Compassionate", "Universal", "Wise", "Generous"],
    element: "Fire",
    color: "#BB8FCE",
    icon: "🌟",
  },
  {
    number: 11,
    title: "The Illuminator",
    description:
      "You are the spiritual messenger and illuminator, here to inspire and enlighten others. Your heightened intuition and spiritual awareness make you a natural teacher and guide.",
    strengths: ["Intuition", "Inspiration", "Spiritual awareness", "Psychic abilities", "Visionary thinking"],
    challenges: ["Nervous energy", "Impracticality", "Emotional extremes", "Difficulty grounding"],
    purpose: "To illuminate and inspire others through spiritual wisdom and intuitive guidance",
    famousPeople: ["Barack Obama", "Bill Clinton", "Ronald Reagan", "Prince William"],
    keywords: ["Intuitive", "Inspiring", "Spiritual", "Visionary", "Illuminating"],
    element: "Air",
    color: "#85C1E9",
    icon: "✨",
  },
  {
    number: 22,
    title: "The Master Builder",
    description:
      "You are the master builder and visionary architect, capable of turning dreams into reality on a grand scale. Your practical idealism can create lasting change in the world.",
    strengths: [
      "Visionary thinking",
      "Practical application",
      "Master building",
      "Global perspective",
      "Transformational power",
    ],
    challenges: ["Overwhelming responsibility", "Perfectionism", "Nervous tension", "Difficulty with details"],
    purpose: "To build something of lasting value that benefits humanity on a large scale",
    famousPeople: ["Oprah Winfrey", "Will Smith", "Paul McCartney", "Tina Turner"],
    keywords: ["Visionary", "Builder", "Transformational", "Practical", "Masterful"],
    element: "Earth",
    color: "#F8C471",
    icon: "🏛️",
  },
  {
    number: 33,
    title: "The Master Teacher",
    description:
      "You are the master teacher and healer, here to uplift humanity through unconditional love and service. Your compassionate wisdom can heal and transform lives.",
    strengths: [
      "Unconditional love",
      "Master teaching",
      "Healing abilities",
      "Compassionate wisdom",
      "Service to humanity",
    ],
    challenges: ["Overwhelming empathy", "Martyrdom", "Emotional burden", "Difficulty saying no"],
    purpose: "To teach and heal through unconditional love, raising the consciousness of humanity",
    famousPeople: ["Albert Einstein", "John Lennon", "Francis of Assisi", "Dalai Lama"],
    keywords: ["Teacher", "Healer", "Compassionate", "Wise", "Loving"],
    element: "Fire",
    color: "#82E0AA",
    icon: "🙏",
  },
]

export const personalYearMeanings: PersonalYearMeaning[] = [
  {
    number: 1,
    title: "New Beginnings",
    description:
      "This is your year of fresh starts and new opportunities. Plant seeds for your future and take initiative in all areas of life.",
    themes: ["New beginnings", "Independence", "Leadership", "Innovation"],
    focus: ["Starting new projects", "Taking initiative", "Building confidence", "Developing leadership skills"],
    opportunities: ["Career advancement", "New relationships", "Personal growth", "Creative ventures"],
    challenges: ["Impatience", "Isolation", "Overconfidence"],
    advice:
      "Trust your instincts and don't be afraid to take the lead. This is your time to shine and create the life you want.",
  },
  {
    number: 2,
    title: "Cooperation & Patience",
    description:
      "This year emphasizes partnerships, cooperation, and patience. Focus on building relationships and working with others.",
    themes: ["Cooperation", "Partnerships", "Patience", "Diplomacy"],
    focus: ["Building relationships", "Developing patience", "Collaborative projects", "Emotional growth"],
    opportunities: ["Marriage or partnership", "Team projects", "Diplomatic solutions", "Spiritual growth"],
    challenges: ["Impatience", "Dependency", "Indecision"],
    advice:
      "Practice patience and focus on cooperation. Your success this year comes through others, not solo efforts.",
  },
  {
    number: 3,
    title: "Creative Expression",
    description:
      "This is your year of creativity, self-expression, and social expansion. Let your artistic side flourish and enjoy life's pleasures.",
    themes: ["Creativity", "Self-expression", "Social life", "Joy"],
    focus: ["Creative projects", "Social networking", "Communication skills", "Artistic pursuits"],
    opportunities: ["Artistic recognition", "Public speaking", "Social connections", "Travel"],
    challenges: ["Scattered energy", "Superficiality", "Overspending"],
    advice:
      "Express yourself creatively and don't hold back. This year is about joy, creativity, and sharing your gifts with the world.",
  },
  {
    number: 4,
    title: "Building Foundations",
    description:
      "This year is about hard work, organization, and building solid foundations for your future. Focus on practical matters and long-term goals.",
    themes: ["Hard work", "Organization", "Foundations", "Stability"],
    focus: ["Career building", "Financial planning", "Health routines", "Skill development"],
    opportunities: ["Career advancement", "Property investment", "Skill mastery", "Health improvement"],
    challenges: ["Overwork", "Rigidity", "Impatience with slow progress"],
    advice:
      "Be patient and methodical. The work you do this year will pay off in the long run. Focus on quality over quantity.",
  },
  {
    number: 5,
    title: "Freedom & Adventure",
    description:
      "This year brings change, freedom, and adventure. Embrace new experiences and break free from limitations.",
    themes: ["Freedom", "Change", "Adventure", "Variety"],
    focus: ["Travel", "New experiences", "Personal freedom", "Adaptability"],
    opportunities: ["Travel opportunities", "Career changes", "New relationships", "Learning experiences"],
    challenges: ["Restlessness", "Impulsiveness", "Lack of focus"],
    advice:
      "Embrace change and seek new experiences. This year is about expanding your horizons and breaking free from routine.",
  },
  {
    number: 6,
    title: "Love & Responsibility",
    description:
      "This year focuses on family, home, and relationships. Take on responsibilities and nurture those you care about.",
    themes: ["Love", "Family", "Responsibility", "Service"],
    focus: ["Family relationships", "Home improvement", "Community service", "Healing others"],
    opportunities: ["Marriage", "Family expansion", "Home ownership", "Healing work"],
    challenges: ["Over-responsibility", "Martyrdom", "Family conflicts"],
    advice:
      "Focus on love and service to others. This year is about creating harmony in your personal relationships and home life.",
  },
  {
    number: 7,
    title: "Inner Growth & Spirituality",
    description:
      "This is a year of introspection, spiritual growth, and inner development. Take time for solitude and self-reflection.",
    themes: ["Spirituality", "Inner growth", "Solitude", "Wisdom"],
    focus: ["Meditation", "Study", "Self-reflection", "Spiritual practices"],
    opportunities: ["Spiritual awakening", "Higher education", "Research", "Inner healing"],
    challenges: ["Isolation", "Depression", "Overthinking"],
    advice:
      "Take time for inner reflection and spiritual growth. This year is about developing your inner wisdom and intuition.",
  },
  {
    number: 8,
    title: "Material Success & Achievement",
    description:
      "This year brings opportunities for material success and achievement. Focus on business, career, and financial goals.",
    themes: ["Success", "Achievement", "Material gain", "Recognition"],
    focus: ["Career advancement", "Business ventures", "Financial planning", "Leadership roles"],
    opportunities: ["Promotion", "Business success", "Financial gain", "Recognition"],
    challenges: ["Workaholism", "Materialism", "Power struggles"],
    advice:
      "Focus on your career and financial goals. This year offers great potential for material success and recognition.",
  },
  {
    number: 9,
    title: "Completion & Humanitarian Service",
    description:
      "This year is about completion, letting go, and serving humanity. Finish old projects and prepare for a new cycle.",
    themes: ["Completion", "Service", "Letting go", "Wisdom"],
    focus: ["Completing projects", "Humanitarian service", "Sharing wisdom", "Preparing for new cycle"],
    opportunities: ["Teaching", "Mentoring", "Charitable work", "Spiritual service"],
    challenges: ["Emotional volatility", "Difficulty letting go", "Martyrdom"],
    advice:
      "Focus on completion and service to others. This year is about sharing your wisdom and preparing for a new beginning.",
  },
]

export const journalingPrompts: JournalingPrompt[] = [
  {
    id: "lp-1-leadership",
    numberType: "lifePath",
    number: 1,
    prompt: "How do you naturally take leadership in your daily life? What situations call out your pioneering spirit?",
    category: "reflection",
  },
  {
    id: "lp-2-cooperation",
    numberType: "lifePath",
    number: 2,
    prompt: "When do you feel most fulfilled in partnerships? How do you bring harmony to challenging situations?",
    category: "relationships",
  },
  {
    id: "lp-3-creativity",
    numberType: "lifePath",
    number: 3,
    prompt: "What forms of creative expression bring you the most joy? How do you share your gifts with the world?",
    category: "purpose",
  },
  {
    id: "lp-4-building",
    numberType: "lifePath",
    number: 4,
    prompt: "What foundations are you building in your life right now? How do you create stability and order?",
    category: "growth",
  },
  {
    id: "lp-5-freedom",
    numberType: "lifePath",
    number: 5,
    prompt: "What does freedom mean to you? How do you balance adventure with responsibility?",
    category: "reflection",
  },
  {
    id: "lp-6-nurturing",
    numberType: "lifePath",
    number: 6,
    prompt: "How do you naturally care for others? What brings you the most satisfaction in service?",
    category: "purpose",
  },
  {
    id: "lp-7-wisdom",
    numberType: "lifePath",
    number: 7,
    prompt: "What spiritual or philosophical questions fascinate you most? How do you connect with your inner wisdom?",
    category: "reflection",
  },
  {
    id: "lp-8-achievement",
    numberType: "lifePath",
    number: 8,
    prompt: "What does success mean to you beyond material gain? How do you use your power responsibly?",
    category: "purpose",
  },
  {
    id: "lp-9-service",
    numberType: "lifePath",
    number: 9,
    prompt: "How do you contribute to the greater good? What wisdom have you gained that could help others?",
    category: "purpose",
  },
]
