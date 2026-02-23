const BASE_URL = "http://localhost:8000/leaderboard";

export async function getLeaderboard() {
  const res = await fetch(`${BASE_URL}/get-leaderboard`);
  return res.json();
}
