export const calculateStatus = (attended: number, missed: number, requirement: number) => {
  const total = attended + missed;
  if (total === 0) return { percentage: 0, message: 'No classes yet', color: 'text-zinc-500' };

  const percentage = (attended / total) * 100;
  const reqPercent = requirement * 100;

  let message = '';
  let color = '';

  if (percentage >= reqPercent) {
    // Calculate how many classes can be skipped
    const canSkip = Math.floor(attended / requirement - total);
    
    if (canSkip > 0) {
      message = `Can Skip Next ${canSkip}`;
      // White for dark background
      color = 'text-white';
    } else {
      message = 'On Track';
      // White for dark background
      color = 'text-white';
    }
  } else {
    // Calculate how many need to attend
    const needToAttend = Math.ceil((requirement * total - attended) / (1 - requirement));
    message = `Must Attend Next ${needToAttend}`;
    // Keep red for warning/danger state
    color = 'text-red-400';
  }

  return { percentage, message, color };
};
