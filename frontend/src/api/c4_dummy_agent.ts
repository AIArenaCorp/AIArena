const AI_BASE_URL = "http://localhost:8000/agent/dummy";

export async function updateDummyAIWeights(weights: {
    depth: number
    create4: number
    create3: number
    create2: number
    opponent4: number
    opponent3: number
    opponent2: number
}) {
  const res = await fetch(`${AI_BASE_URL}/update-dummy-weights`, {
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

