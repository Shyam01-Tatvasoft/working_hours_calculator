import { useState, useEffect } from 'react';

/** Returns seconds from midnight, updated every 1 second. */
function getNowSec() {
  const now = new Date();
  return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
}

export function useTimer() {
  const [nowSec, setNowSec] = useState(getNowSec);

  useEffect(() => {
    const id = setInterval(() => setNowSec(getNowSec()), 1000);
    return () => clearInterval(id);
  }, []);

  return nowSec;
}
