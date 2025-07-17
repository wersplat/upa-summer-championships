import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gold">404</h1>
        <h2 className="mt-4 text-3xl font-extrabold text-white drop-shadow">Team not found</h2>
        <p className="mt-4 text-lg text-white/80">
          Sorry, we couldn't find the team you're looking for.
        </p>
        <div className="mt-8">
          <Link
            href="/teams"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue hover:bg-blue/80"
          >
            Browse Teams
          </Link>
        </div>
      </div>
    </div>
  );
}
