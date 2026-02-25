import { useEffect, useRef, useState } from "react";

export function useTanksSocket(sessionId: string) {
  const [gameState, setGameState] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/tanks/${sessionId}`);
    ws.onmessage = (e) => setGameState(JSON.parse(e.data));
    ws.onclose = () => console.log("disconnected");
    ws.onerror = (e) => console.error("ws error", e);
    wsRef.current = ws;
    return () => ws.close();
  }, [sessionId]);

  const send = (input: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(input));
    }
  };

  return { gameState, send };
}