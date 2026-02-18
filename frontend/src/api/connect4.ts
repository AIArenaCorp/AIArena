const BASE_URL = "http://localhost:8000/connect4";

export async function getBoard() {
  const res = await fetch(`${BASE_URL}/board`);
  return res.json();
}

export async function makeMove(column: number) {
  const res = await fetch(`${BASE_URL}/move/${column}`, {
    method: "POST",
  });
  return res.json();
}

export async function resetGame() {
  const res = await fetch(`${BASE_URL}/reset`, {
    method: "POST",
  });
  return res.json();
}
