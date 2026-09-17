/**
 * Calculates time remaining until the upcoming Monday at 12:00 PM (Noon).
 */

export const getNextMondayNoon = () => {
  const now = new Date();
  const resultDate = new Date(now);
  
  // Calculate days until Monday (1 in JS Date, 0 is Sunday, 5 is Friday, 6 is Saturday)
  const dayOfWeek = now.getDay();
  let daysUntilMonday = (1 - dayOfWeek + 7) % 7;
  
  // If today is Monday and it's already past 12:00 PM, target next Monday
  if (daysUntilMonday === 0 && (now.getHours() > 12 || (now.getHours() === 12 && now.getMinutes() > 0))) {
    daysUntilMonday = 7;
  } else if (daysUntilMonday === 0 && now.getHours() < 12) {
    daysUntilMonday = 0;
  }

  resultDate.setDate(now.getDate() + daysUntilMonday);
  resultDate.setHours(12, 0, 0, 0);

  return resultDate;
};

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
