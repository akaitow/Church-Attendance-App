// Returns an array of available Sundays (Current and Previous)
export function getAvailableSundays(): { date: string; label: string }[] {
  const today = new Date();
  
  // Get most recent Sunday
  const currentSunday = new Date(today);
  const currentDayOfWeek = today.getDay(); // 0 is Sunday
  
  currentSunday.setDate(today.getDate() - currentDayOfWeek);
  currentSunday.setHours(0, 0, 0, 0);

  // Get previous Sunday
  const previousSunday = new Date(currentSunday);
  previousSunday.setDate(currentSunday.getDate() - 7);

  const formatDate = (date: Date) => {
    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatLabel = (date: Date, prefix: string) => {
    return `${prefix} (${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`;
  };

  return [
    { date: formatDate(currentSunday), label: formatLabel(currentSunday, "Current Sunday") },
    { date: formatDate(previousSunday), label: formatLabel(previousSunday, "Previous Sunday") }
  ];
}
