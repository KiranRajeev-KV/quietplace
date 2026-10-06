'use client';
import { useEffect, useState } from 'react';
import { profile } from '@/content/profile';
export function LocalTime() {
  const [time, setTime] = useState('—:—');
  useEffect(() => {
    const update = () =>
      setTime(
        new Intl.DateTimeFormat('en-GB', {
          timeZone: profile.timeZone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date()),
      );
    update();
    const timer = setInterval(update, 30_000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="local-time micro">
      <span className="status-dot" />
      {profile.location}
      <span className="clock">{time} IST</span>
    </div>
  );
}
