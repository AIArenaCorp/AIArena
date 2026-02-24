const BASE_URL = "http://localhost:8000/connect4";

const SESSION_ID = crypto.randomUUID();

const sessionHeaders = {
  "Content-Type": "application/json",
  "x-session-id": SESSION_ID,
};

export async function getBoard() {
  const res = await fetch(`${BASE_URL}/board`, {
    headers: sessionHeaders,
  });
  return res.json();
}

export async function makeMove(column: number) {
  const res = await fetch(`${BASE_URL}/move/${column}`, {
    method: "POST",
    headers: sessionHeaders,
  });
  return res.json();
}

export async function resetGame() {
  const res = await fetch(`${BASE_URL}/reset`, {
    method: "POST",
    headers: sessionHeaders,
  });
  return res.json();
}