# UPA Summer Championships

A modern web application for tracking teams, players, and matches in the UPA Summer Championships, an NBA 2K Pro Am tournament. Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🏆 Dynamic team pages with detailed statistics
- 🎨 Dark mode support
- ⚡ Fast page loads with static generation and incremental static regeneration
- 📱 Fully responsive design
- 🔍 Optimized for SEO

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/)
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/)
- **Icons**: [Heroicons](https://heroicons.com/)
- **Date Handling**: [date-fns](https://date-fns.org/)

## Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- Supabase account

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/upa-summer-championships.git
   cd upa-summer-championships
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Update the Supabase URL and anon key with your project's credentials

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Database Setup

### Prerequisites
- Supabase project created at [https://supabase.com](https://supabase.com)
- PostgreSQL client installed (for running setup scripts)

### Setup Instructions

1. **Get your database connection string**
   - Go to your Supabase project dashboard
   - Navigate to Project Settings > Database
   - Find the "Connection string" section
   - Copy the connection string (it should look like `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`)

2. **Run the setup script**
   ```bash
   # Make the script executable if needed
   chmod +x scripts/setup-db.sh
   
   # Run the setup script with your connection string
   SUPABASE_DB_URL="your-connection-string" ./scripts/setup-db.sh
   ```
   - The script will create all necessary tables and ask if you want to seed with sample data

3. **Alternative: Manual Setup**
   If you prefer to run the SQL files manually:
   ```bash
   # Initialize the database schema
   psql "your-connection-string" -f scripts/init-db.sql
   
   # Optionally, seed with sample data
   psql "your-connection-string" -f scripts/seed-db.sql
   ```

## 🗃️ Database Schema

The application uses the following database structure:

### Teams
- `id` (uuid, primary key)
- `name` (text)
- `logo_url` (text, nullable)
- `region` (text, nullable)
- `slug` (text, unique)
- `created_at` (timestamp with time zone)

### Players
- `id` (uuid, primary key)
- `gamertag` (text)
- `position` (text, nullable)
- `created_at` (timestamp with time zone)

### Team Rosters
- `id` (uuid, primary key)
- `team_id` (uuid, foreign key to teams.id)
- `player_id` (uuid, foreign key to players.id)
- `is_captain` (boolean, default: false)
- `joined_at` (timestamp with time zone)

### Matches
- `id` (uuid, primary key)
- `home_team_id` (uuid, foreign key to teams.id)
- `away_team_id` (uuid, foreign key to teams.id)
- `home_score` (integer)
- `away_score` (integer)
- `match_date` (timestamp with time zone)
- `status` (text: 'scheduled' | 'completed' | 'postponed')
- `created_at` (timestamp with time zone)

## Deployment

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fupa-summer-championships&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Supabase%20credentials%20are%20required%20to%20connect%20to%20your%20database.&envLink=https%3A%2F%2Fsupabase.com%2Fdocs%2Fguides%2Fgetting-started%2Fquickstarts%2Fnextjs)

1. Fork this repository
2. Create a new project on Vercel
3. Import your repository
4. Add your environment variables
5. Deploy!

### Self-hosting

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes |
| `DEBUG` | Enable debug logging (true/false) | No |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/your-username/upa-summer-championships](https://github.com/your-username/upa-summer-championships)