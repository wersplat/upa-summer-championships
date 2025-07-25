"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { TournamentSchedule } from '@/utils/supabase';
import { format, parseISO, isToday, isTomorrow, isThisWeek, isSameDay, addDays } from 'date-fns';
import { Clock, MapPin, Calendar, Trophy, Loader2 } from 'lucide-react';

// Type for grouped schedule
interface GroupedSchedule {
  date: Date;
  label: string;
  matches: TournamentSchedule[];
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<TournamentSchedule[]>([]);
  const [groupedSchedule, setGroupedSchedule] = useState<GroupedSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const supabase = createClientComponentClient<Database>();

  // Format time in 12-hour format with AM/PM
  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Group schedule by date
  const groupScheduleByDate = (matches: TournamentSchedule[]): GroupedSchedule[] => {
    if (!matches || matches.length === 0) return [];
    
    const grouped: { [key: string]: TournamentSchedule[] } = {};
    
    matches.forEach(match => {
      if (!match.start_time) return;
      
      const date = new Date(match.start_time);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(match);
    });
    
    return Object.entries(grouped).map(([dateStr, matches]) => {
      const date = new Date(dateStr);
      let label = format(date, 'EEEE, MMMM d, yyyy');
      
      if (isToday(date)) {
        label = 'Today';
      } else if (isTomorrow(date)) {
        label = 'Tomorrow';
      } else if (isThisWeek(date, { weekStartsOn: 0 })) {
        label = format(date, 'EEEE');
      }
      
      return {
        date,
        label,
        matches: matches.sort((a, b) => 
          (a.start_time || '') > (b.start_time || '') ? 1 : -1
        )
      };
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  // Fetch schedule data
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching schedule data...');
        
        // Test connection first
        const { data: testData, error: testError } = await supabase
          .from('teams')
          .select('*')
          .limit(1);
          
        if (testError) {
          console.error('Supabase connection test failed:', testError);
          throw new Error(`Could not connect to Supabase: ${testError.message}`);
        }
        
        console.log('Supabase connection successful, fetching schedule data...');
        
        // Fetch the schedule data
        const { data: tournament_schedule, error, status, count } = await supabase
          .from('tournament_schedule')
          .select('*', { count: 'exact' })
          .order('start_time', { ascending: true });

        console.log('Supabase query result:', {
          status,
          count,
          error,
          data: tournament_schedule ? 'Data received' : 'No data',
          tableInfo: 'tournament_schedule',
          query: 'SELECT * FROM tournament_schedule ORDER BY start_time ASC'
        });
        
        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }
        
        if (!tournament_schedule || tournament_schedule.length === 0) {
          console.warn('No schedule data found in tournament_schedule table');
          
          // Try to get table info using a direct query
          try {
            const { data: tableInfo, error: tableError } = await supabase
              .from('information_schema.tables')
              .select('*')
              .eq('table_name', 'tournament_schedule')
              .single();
              
            console.log('Table info:', tableInfo);
            console.log('Table error:', tableError);
            
            if (!tableInfo) {
              console.warn('tournament_schedule table does not exist or is not accessible');
            }
          } catch (tableErr) {
            console.error('Error checking table info:', tableErr);
          }
          
          setGroupedSchedule([]);
          setSelectedDate(null);
          return;
        }
        
        console.log(`Successfully fetched ${tournament_schedule.length} schedule items`);
        
        // Transform the data to match our expected format
        const formattedData = tournament_schedule.map(match => ({
          ...match,
          start_time: match.start_time_formatted || match.start_time,
          end_time: match.end_time_formatted || match.end_time,
          team_a_name: match.team_a_name || 'TBD',
          team_b_name: match.team_b_name || 'TBD',
          team_a_score: match.team_a_score ?? null,
          team_b_score: match.team_b_score ?? null,
          venue: match.venue || 'TBD',
          status: match.status || 'upcoming',
          event_name: match.event_name || 'Tournament',
          notes: match.notes || null
        }));
        
        console.log('Formatted schedule data:', formattedData);
        
        setSchedule(formattedData);
        const grouped = groupScheduleByDate(formattedData);
        setGroupedSchedule(grouped);
        
        // Set the selected date to today or the first available date
        const today = new Date().toISOString().split('T')[0];
        const todayGroup = grouped.find(g => 
          g.date.toISOString().split('T')[0] === today
        );
        
        setSelectedDate(todayGroup ? todayGroup.date : grouped[0]?.date || null);
        
      } catch (err) {
        console.error('Error in fetchSchedule:', err);
        setError(`Failed to load schedule: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // Get matches for the selected date
  const selectedMatches = selectedDate 
    ? groupedSchedule.find(g => 
        selectedDate && isSameDay(g.date, selectedDate)
      )?.matches || []
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-6 bg-destructive/10 rounded-lg">
          <h3 className="text-lg font-medium text-destructive">Error loading schedule</h3>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (groupedSchedule.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No matches scheduled</h3>
          <p className="text-muted-foreground mt-1">Check back later for updates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Tournament Schedule</h1>
        <p className="text-muted-foreground mt-2">
          Upcoming matches and results
        </p>
      </div>

      {/* Date Selector */}
      <div className="flex overflow-x-auto pb-2 mb-6 -mx-4 px-4">
        <div className="flex space-x-2">
          {groupedSchedule.map((group) => {
            const isSelected = selectedDate && isSameDay(group.date, selectedDate);
            return (
              <button
                key={group.date.toString()}
                onClick={() => setSelectedDate(group.date)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                <div className="text-xs font-normal">
                  {format(group.date, 'EEE')}
                </div>
                <div className="mt-0.5">
                  {format(group.date, 'MMM d')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Matches */}
      <div className="space-y-4">
        {selectedMatches.length > 0 ? (
          selectedMatches.map((match, index) => (
            <div 
              key={match.id || index}
              className="bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow"
            >
              <div className="p-4">
                {/* Match Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(match.start_time)}</span>
                    {match.end_time && (
                      <>
                        <span>-</span>
                        <span>{formatTime(match.end_time)}</span>
                      </>
                    )}
                  </div>
                  <div className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                    {match.event_name || 'Tournament'}
                  </div>
                </div>

                {/* Teams */}
                <div className="space-y-4">
                  {/* Team A */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        {match.team_a_name?.charAt(0) || 'T'}
                      </div>
                      <span className="font-medium">{match.team_a_name || 'TBD'}</span>
                    </div>
                    {match.team_a_score !== null && match.team_a_score !== undefined && (
                      <div className="px-3 py-1 bg-muted rounded-md font-medium">
                        {match.team_a_score}
                      </div>
                    )}
                  </div>

                  {/* VS */}
                  <div className="text-center text-xs text-muted-foreground">
                    VS
                  </div>

                  {/* Team B */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        {match.team_b_name?.charAt(0) || 'T'}
                      </div>
                      <span className="font-medium">{match.team_b_name || 'TBD'}</span>
                    </div>
                    {match.team_b_score !== null && match.team_b_score !== undefined && (
                      <div className="px-3 py-1 bg-muted rounded-md font-medium">
                        {match.team_b_score}
                      </div>
                    )}
                  </div>
                </div>

                {/* Match Footer */}
                {(match.venue || match.status) && (
                  <div className="mt-4 pt-3 border-t flex items-center justify-between text-sm text-muted-foreground">
                    {match.venue && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{match.venue}</span>
                      </div>
                    )}
                    {match.status && (
                      <span className="capitalize">{match.status.toLowerCase()}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <Trophy className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <h3 className="font-medium">No matches scheduled</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Check back later for updates
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
