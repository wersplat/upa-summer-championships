import { TournamentSchedule } from '@/utils/supabase';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { Clock, MapPin, Calendar, Users, Trophy, Award, Info } from 'lucide-react';

interface ScheduleCardProps {
  schedule: TournamentSchedule;
  className?: string;
}

export function ScheduleCard({ schedule, className }: ScheduleCardProps) {
  if (!schedule) return null;

  const status = schedule.status?.toLowerCase() || 'upcoming';
  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800',
    postponed: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800',
  };

  const statusColor = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-200';

  return (
    <div className={cn("p-4 h-full flex flex-col bg-gray-100 dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700", className)}>
      {/* Match Status and Time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center text-sm">
          <Clock className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-300" />
          <span className="text-gray-700 dark:text-gray-100">
            {schedule.start_time}
            {schedule.end_time && ` - ${schedule.end_time}`}
          </span>
        </div>
        <div className={cn(
          "text-xs font-medium px-2.5 py-0.5 rounded-full",
          statusColor
        )}>
          {formatStatus(status)}
        </div>
      </div>

      {/* Teams */}
      <div className="space-y-3 mb-4">
        {/* Team A */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
              {schedule.team_a_logo ? (
                <Image
                  src={schedule.team_a_logo}
                  alt={schedule.team_a_name}
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <Users className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <span className="font-medium text-gray-900 dark:text-white">{schedule.team_a_name}</span>
          </div>
          {schedule.team_a_score !== null && (
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md font-medium">
              {schedule.team_a_score}
            </span>
          )}
        </div>

        <div className="text-center text-xs text-gray-500 dark:text-gray-300">
          VS
        </div>

        {/* Team B */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
              {schedule.team_b_logo ? (
                <Image
                  src={schedule.team_b_logo}
                  alt={schedule.team_b_name}
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <Users className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <span className="font-medium text-gray-900 dark:text-white">{schedule.team_b_name}</span>
          </div>
          {schedule.team_b_score !== null && (
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md font-medium">
              {schedule.team_b_score}
            </span>
          )}
        </div>
      </div>

      {/* Match Details */}
      <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-200">
          {schedule.venue && (
            <div className="flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
              <span>{schedule.venue}</span>
            </div>
          )}
          {schedule.group_name && (
            <div className="flex items-center">
              <Users className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
              <span>{schedule.group_name}</span>
            </div>
          )}
          {schedule.event_name && (
            <div className="flex items-center">
              <Trophy className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
              <span>{schedule.event_name}</span>
            </div>
          )}
        </div>

        {schedule.notes && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/80 rounded-md text-sm text-gray-600 dark:text-gray-200 border border-gray-100 dark:border-gray-700">
            <div className="flex">
              <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
              <span>{schedule.notes}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'upcoming': 'Upcoming',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'postponed': 'Postponed',
    'cancelled': 'Cancelled'
  };
  
  return statusMap[status.toLowerCase()] || status;
}
