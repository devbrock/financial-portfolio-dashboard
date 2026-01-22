/**
 * Detects if a question is about portfolio-related topics.
 */
export const wantsPortfolioContext = (question: string): boolean =>
  /portfolio|holding|watchlist|position|profit|loss|p\/l|return|performance|gain|lose|move/i.test(
    question
  );

/**
 * Detects if a question is about market-related topics.
 */
export const wantsMarketContext = (question: string): boolean =>
  /market|index|indices|s&p|dow|nasdaq|russell|sector/i.test(question);

/**
 * Detects if a question is about weekly movement.
 */
export const wantsWeeklyMovement = (question: string): boolean =>
  /weekly|this week|last week|7\s*day|past 7|last 7/i.test(question);

/**
 * Detects if a question is about portfolio range performance.
 */
export const wantsRangePerformance = (question: string): boolean =>
  /portfolio|performance|return|p\/l|profit|loss|gain|move/i.test(question) &&
  /(last|past|over)\s+\d+/i.test(question);

/**
 * Extracts the number of days from a range-based question.
 * @returns Number of days, or null if not detected.
 */
export const extractRangeDays = (question: string): number | null => {
  const match = question.match(/(\d+)\s*(day|days|week|weeks|month|months|year|years)/i);
  if (match) {
    const value = Number(match[1]);
    if (Number.isNaN(value) || value <= 0) return null;
    const unit = match[2].toLowerCase();
    if (unit.startsWith('week')) return value * 7;
    if (unit.startsWith('month')) return value * 30;
    if (unit.startsWith('year')) return value * 365;
    return value;
  }

  if (/this week|weekly/i.test(question)) return 7;
  if (/this month|monthly/i.test(question)) return 30;
  if (/this quarter|quarterly/i.test(question)) return 90;
  if (/this year|yearly|ytd/i.test(question)) return 365;

  return null;
};
