import { useEffect, useMemo, useState } from 'react';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const EVENT_DATE_UTC = Date.UTC(2011, 10, 26); // November 26, 2011 at 00:00 ET

const imagePaths = [
  '/images/Sad-Michigan-fans.jpg',
  '/images/michigan-girl-sad-face.gif',
  '/images/osu-banner.gif',
  '/images/pitiful-michigan-fans.jpg',
  '/images/sad-fans-in-rain.gif',
];

const title = 'How many days since Michigan has beaten Ohio State?';

function calculateDaysSince(dateUtc) {
  const now = Date.now();
  const diff = now - dateUtc;
  return Math.floor(diff / MS_PER_DAY);
}

function formatEasternTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York',
  }).format(date);
}

export default function App() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const daysSince = useMemo(() => calculateDaysSince(EVENT_DATE_UTC), [now]);
  const imagePath = useMemo(
    () => imagePaths[Math.floor(Math.random() * imagePaths.length)],
    []
  );
  const easternTime = useMemo(() => formatEasternTime(now), [now]);

  return (
    <>
      <h1>{title}</h1>
      <div id="content">
        <p id="days_since">
          <span id="days_count">{daysSince}</span> days.
        </p>
        <p id="logo">
          <img src={imagePath} alt="Sad Michigan fans" />
        </p>
        <p id="phrase">
          It's <span id="time">{easternTime}</span> in Columbus and Michigan still
          sucks.
        </p>
      </div>
      <div id="footer">
        <p>
          Built with React. Images courtesy of creative commons and long-suffering
          Michigan fans.
        </p>
      </div>
    </>
  );
}
