const BASE_URL = "http://localhost:8000/leaderboard";

export const getLeaderboard = (limit = 10, offset = 0) =>
  fetch(`${BASE_URL}/get-leaderboard?limit=${limit}&offset=${offset}`)
    .then(r => r.json());