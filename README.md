# 🌍 Diaspora Market Hub

A comprehensive platform connecting the African diaspora through community, commerce, and collaboration.

## 🚀 Features

- **Community Building**: Connect with diaspora communities worldwide
- **Marketplace**: Buy and sell products/services within the diaspora network
- **Events & Meetups**: Discover and organize cultural and business events
- **Project Collaboration**: Fund and collaborate on diaspora initiatives
- **Messaging System**: Private communication between members
- **Authentication**: Secure email/password and social login
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Vercel (recommended)
- **Package Manager**: pnpm

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd diaspora-market-hub
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Copy the SQL from `scripts/clean-database-schema.sql`
4. Run it in the Supabase SQL Editor
5. Copy the SQL from `scripts/sample-data.sql`
6. Run it to populate with sample data

### 5. Run Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🗄️ Database Schema

The application uses the following main tables:

- `profiles` - User profiles and preferences
- `communities` - Diaspora communities and groups
- `posts` - Community discussions and announcements
- `events` - Community events and meetups
- `marketplace_items` - Products and services
- `projects` - Community initiatives and funding
- `messages` - Private messaging system
- `notifications` - User notifications

## 🔐 Authentication

The app supports:
- Email/password authentication
- Social login (Google, Facebook, GitHub)
- Automatic profile creation on signup
- Row Level Security (RLS) for data protection

## 🎨 Customization

### Styling
- Uses Tailwind CSS for styling
- Shadcn UI components for consistent design
- Custom theme configuration in `tailwind.config.ts`

### Components
- Modular component structure in `/components`
- Type-safe props with TypeScript
- Reusable UI components

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

### Other Platforms

The app can be deployed to:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Type checking
pnpm type-check
```

### Project Structure

```
diaspora-market-hub/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── community/         # Community features
│   ├── marketplace/       # Marketplace features
│   └── ...
├── components/            # Reusable components
│   ├── ui/               # Shadcn UI components
│   ├── auth/             # Authentication components
│   └── ...
├── lib/                   # Utility libraries
├── types/                 # TypeScript type definitions
├── data/                  # Static data and mock data
├── scripts/               # Database scripts
└── public/                # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [documentation](docs/)
- Review the [setup guides](scripts/)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Supabase](https://supabase.com/)
- UI components from [Shadcn UI](https://ui.shadcn.com/)

---

**Made with ❤️ for the African Diaspora Community** 