import type { LeaderboardEntry } from "../types";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export function Leaderboard({ entries }: LeaderboardProps) {
  return (
    <ol className="leaderboard">
      {entries.map((entry, index) => (
        <li key={entry.id} className="leaderboard__item">
          <span className="leaderboard__rank">#{index + 1}</span>
          <span>{entry.name}</span>
          <strong>{entry.xp} XP</strong>
        </li>
      ))}
    </ol>
  );
}