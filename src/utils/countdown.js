/**
 * Calculates time remaining until the upcoming Tuesday at 12:00 PM (Noon) IST.
 */

export const getNextTuesdayNoon = () => {
  const now = new Date();
  const resultDate = new Date(now);
  
  // Calculate days until Tuesday (2 in JS Date: 0 is Sunday, 1 is Monday, 2 is Tuesday)
  const dayOfWeek = now.getDay();
  let daysUntilTuesday = (2 - dayOfWeek + 7) % 7;
  
  // If today is Tuesday and it's already past 12:00 PM, target next Tuesday
  if (daysUntilTuesday === 0 && (now.getHours() > 12 || (now.getHours() === 12 && now.getMinutes() > 0))) {
    daysUntilTuesday = 7;
  } else if (daysUntilTuesday === 0 && now.getHours() < 12) {
    daysUntilTuesday = 0;
  }

  resultDate.setDate(now.getDate() + daysUntilTuesday);
  resultDate.setHours(12, 0, 0, 0);

  return resultDate;
};

// Backwards compatibility alias
export const getNextMondayNoon = getNextTuesdayNoon;

export const calculateTimeLeft = (targetDate) => {
  const difference = +targetDate - +new Date();
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, completed: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    completed: false
  };
};
