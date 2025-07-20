import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tournament Bracket | UPA Summer Championships',
  description: 'View the current tournament bracket and group stage standings',
};

export default function BracketLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
