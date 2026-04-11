export interface GameScore {
  timePlayedMinutes: number;
  isFinished: boolean;
  calculatedScore: number;
  effectiveTimeUsed: number;
}

/**
 * Calculates the game score (0-75) based on time played and completion status.
 * Finished games get their time doubled for calculation, and only finished games
 * can reach the maximum score of 75.
 */
export function calculateGameScore(
  timePlayedMinutes: number,
  isFinished: boolean
): GameScore {
  const effectiveTime = isFinished ? timePlayedMinutes * 2 : timePlayedMinutes;

  let score: number;

  if (effectiveTime <= 30) {
    score = effectiveTime;
  } else if (effectiveTime <= 60) {
    const extraMinutes = effectiveTime - 30;
    score = 30 + (extraMinutes / 30) * 10;
  } else if (effectiveTime <= 120) {
    const extraMinutes = effectiveTime - 60;
    score = 40 + (extraMinutes / 60) * 10;
  } else if (effectiveTime <= 300) {
    const extraMinutes = effectiveTime - 120;
    score = 50 + (extraMinutes / 180) * 10;
  } else if (effectiveTime <= 600) {
    const extraMinutes = effectiveTime - 300;
    score = 60 + (extraMinutes / 300) * 10;
  } else {
    const extraMinutes = effectiveTime - 600;
    const extraPoints = Math.floor(extraMinutes / 120);
    score = 70 + extraPoints;
  }

  if (isFinished) {
    if (score > 74) {
      score = 75;
    }
  } else {
    score = Math.min(score, 74);
  }

  return {
    timePlayedMinutes,
    isFinished,
    calculatedScore: Math.round(score),
    effectiveTimeUsed: effectiveTime,
  };
}

/**
 * Parses time input in h:mm format and converts to minutes.
 * Supported formats: "1:30", ":30", "2", "1:"
 */
export function parseTimeInput(timeInput: string): number | null {
  const trimmed = timeInput.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");

    if (parts.length !== 2) {
      return null;
    }

    const [hoursPart, minutesPart] = parts;

    let hours = 0;
    if (hoursPart !== "") {
      const parsedHours = parseInt(hoursPart, 10);
      if (isNaN(parsedHours) || parsedHours < 0) {
        return null;
      }
      hours = parsedHours;
    }

    let minutes = 0;
    if (minutesPart !== "") {
      const parsedMinutes = parseInt(minutesPart, 10);
      if (isNaN(parsedMinutes) || parsedMinutes < 0 || parsedMinutes >= 60) {
        return null;
      }
      minutes = parsedMinutes;
    }

    return hours * 60 + minutes;
  } else {
    if (trimmed.includes(".")) {
      return null;
    }

    const hours = parseInt(trimmed, 10);
    if (isNaN(hours) || hours < 0) {
      return null;
    }
    return hours * 60;
  }
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} minute${mins !== 1 ? "s" : ""}`;
  } else if (mins === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  } else {
    return `${hours} hour${hours !== 1 ? "s" : ""} and ${mins} minute${mins !== 1 ? "s" : ""}`;
  }
}
