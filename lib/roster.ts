import { CookingAssignment, Roommate, RosterConstraint } from './types';

const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildMonthDates(baseDate = new Date()) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(year, month, index + 1, 12, 0, 0);
    return {
      dateString: formatDateString(date),
      weekday: weekdayNames[date.getDay()],
    };
  });
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function extractDays(text: string): string[] {
  const normalized = text.toLowerCase();
  const matched = weekdayNames.filter((day) => normalized.includes(day.toLowerCase()));
  if (normalized.includes('weekend') || normalized.includes('saturday or sunday')) {
    return ['Saturday', 'Sunday'];
  }
  return matched;
}

export function parseRosterConstraints(
  promptText: string,
  negativePromptText: string,
  roommates: Roommate[] = [],
): RosterConstraint[] {
  return roommates.flatMap((roommate) => {
    const name = roommate.name.toLowerCase();
    const positiveLines = promptText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.toLowerCase().includes(name));
    const negativeLines = negativePromptText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.toLowerCase().includes(name));

    const allowDays = positiveLines.flatMap(extractDays);
    const avoidDays = negativeLines.flatMap(extractDays);
    const mergedAvoid = [...avoidDays];

    for (const line of positiveLines) {
      const lower = line.toLowerCase();
      if (lower.includes('not ') || lower.includes('avoid')) {
        mergedAvoid.push(...extractDays(line));
      }
    }

    if (allowDays.length === 0 && mergedAvoid.length === 0) return [];
    return [
      {
        roommateId: roommate.id,
        allowDays: Array.from(new Set(allowDays)),
        avoidDays: Array.from(new Set(mergedAvoid)),
      },
    ];
  });
}

function scoreAssignment(
  assignments: CookingAssignment[],
  constraints: RosterConstraint[],
  monthDates: { dateString: string; weekday: string }[],
) {
  const map = new Map(constraints.map((item) => [item.roommateId, item]));
  let score = 0;

  assignments.forEach((assignment, index) => {
    const weekday = monthDates[index]?.weekday;
    const constraint = map.get(assignment.roommateId);
    if (!weekday) return;
    if (!constraint) {
      score += 2;
      return;
    }
    if (constraint.allowDays?.includes(weekday)) score += 8;
    if (constraint.allowDays && constraint.allowDays.length > 0 && !constraint.allowDays.includes(weekday)) {
      score -= 6;
    }
    if (constraint.avoidDays?.includes(weekday)) score -= 12;
  });

  return score;
}

export function generateCookingRoster(
  promptText = '',
  negativePromptText = '',
  roommates: Roommate[] = [],
  baseDate = new Date(),
): {
  assignments: CookingAssignment[];
  constraints: RosterConstraint[];
} {
  const activeRoommates = roommates.filter((roommate) => roommate.isActive !== false);
  if (activeRoommates.length === 0) {
    return { assignments: [], constraints: [] };
  }

  const monthDates = buildMonthDates(baseDate);
  const constraints = parseRosterConstraints(promptText, negativePromptText, activeRoommates);
  const constraintMap = new Map(constraints.map((item) => [item.roommateId, item]));
  const pool = activeRoommates.flatMap((roommate) => [roommate.id, roommate.id]);

  let best: CookingAssignment[] = [];
  let bestScore = -Infinity;

  for (let attempt = 0; attempt < 400; attempt += 1) {
    const available = shuffle(pool);
    const result: CookingAssignment[] = [];

    monthDates.forEach(({ dateString, weekday }, dayIndex) => {
      const previous = result[dayIndex - 1]?.roommateId;
      const candidates = available.filter((roommateId, index) => {
        if (roommateId === previous) return false;
        const constraint = constraintMap.get(roommateId);
        if (constraint?.avoidDays?.includes(weekday)) return false;
        if (constraint?.allowDays && constraint.allowDays.length > 0 && !constraint.allowDays.includes(weekday)) {
          return false;
        }
        return available.indexOf(roommateId) === index;
      });

      const fallbackCandidates = available.filter(
        (roommateId, index) => roommateId !== previous && available.indexOf(roommateId) === index,
      );

      const pickedRoommateId =
        (candidates.length > 0 ? shuffle(candidates)[0] : shuffle(fallbackCandidates)[0]) ??
        shuffle(available)[0];

      const pickedIndex = available.indexOf(pickedRoommateId);
      if (pickedIndex >= 0) available.splice(pickedIndex, 1);

      result.push({
        id: `cook-${dayIndex + 1}`,
        date: dateString,
        roommateId: pickedRoommateId,
        notified: false,
      });
    });

    const score = scoreAssignment(result, constraints, monthDates);
    if (score > bestScore) {
      best = result;
      bestScore = score;
    }
  }

  return { assignments: best, constraints };
}
