const AI_BASE_URL = "http://localhost:8000/agent";

export async function updateAiWeights(weights: {
    create4: int
    create3: int
    create2: int
    create1: int
    block3: int
    block2: int
    block1: int
}) {
  const res = await fetch(`${AI_BASE_URL}/update-weights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(weights),
  });
  return res.json();
}

export async function getDummyMove(board: number[][]) {
  const res = await fetch(`${AI_BASE_URL}/get-move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(board),
  });
  const data = await res.json();
  return data.column;
}