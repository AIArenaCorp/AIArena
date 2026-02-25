// src/hooks/useTankInput.ts
import { useEffect, useRef } from "react";

export function useTankInput(send: (input: object) => void) {
  const keys = useRef<Set<string>>(new Set());
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current.add(e.key);
      e.preventDefault(); // stop arrow keys scrolling the page
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key);

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    // Poll and send input at 60fps
    intervalRef.current = setInterval(() => {
      const k = keys.current;

      send({
        move:   k.has("ArrowUp")    ? "forward"
              : k.has("ArrowDown")  ? "backward"
              : null,
        rotate: k.has("ArrowLeft")  ? -3
              : k.has("ArrowRight") ? 3
              : 0,
        turret: k.has("q") ? -3
              : k.has("e") ?  3
              : 0,
        shoot:  k.has(" "),
      });
    }, 1000 / 60);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [send]);
}