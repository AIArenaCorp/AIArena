const AI_BASE_URL = "http://localhost:8000/agent/minimax";

export async function updateMinimaxWeights(weights: {
    depth: number
    create4: number
    create3: number
    create2: number
    opponent4: number
    opponent3: number
    opponent2: number
}) {
  const res = await fetch(`${AI_BASE_URL}/update-minimax-weights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(weights),
  });
  return res.json();
}

export async function getMinimaxColScores(board: number[][], piece: number): Promise<Record<string, number>> {
  const res = await fetch(`${AI_BASE_URL}/get-scores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({board: board, ai_piece: piece}),
  });
  const data: Record<string, number> = await res.json();
  return data;
}