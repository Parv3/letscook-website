/**
 * Calculates time remaining until 6:00 PM today IST.
 */

export const getTargetLaunchTime = () => {
  const target = new Date();
  target.setHours(18, 0, 0, 0); // 6:00 PM today
  
  // If already past 6:00 PM, target 6:00 PM tomorrow
  if (target.getTime() <= Date.now()) {
    target.setDate(target.getDate() + 1);
  }
  return target;
};

// Aliases for backwards compatibility
export const getNextTuesdayNoon = getTargetLaunchTime;
export const getNextMondayNoon = getTargetLaunchTime;

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
