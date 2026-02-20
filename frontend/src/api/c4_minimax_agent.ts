const AI_BASE_URL = "http://localhost:8000/agent/minimax";

export async function updateMinimaxWeights(weights: {
    depth: number
    create4: number
    create3: number
    create2: number
    create1: number
    block4: number
    block3: number
    block2: number
    block1: number
}) {
  const res = await fetch(`${AI_BASE_URL}/update-minimax-weights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(weights),
  });
  return res.json();
}

export async function getMinimaxColScores(board: number[][]): Promise<Record<string, number>> {
  const res = await fetch(`${AI_BASE_URL}/get-scores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(board),
  });

  // 'data' is now an object mapping column indices to scores
  const data: Record<string, number> = await res.json();
  return data;
}