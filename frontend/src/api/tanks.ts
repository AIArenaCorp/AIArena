const BASE_URL = "http://localhost:8000/ws/tanks";

export const resetTankSession = (sessionId: string) =>
  fetch(`${BASE_URL}/reset/${sessionId}`, { method: "POST" })
    .then(r => r.json());