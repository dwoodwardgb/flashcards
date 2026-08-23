import { useState } from "react";

export function Counter({ initial }: { initial: number }) {
  const [n, setN] = useState(initial);
  return (
    <button
      type="button"
      onClick={() => setN((n) => n + 1)}
      className="bg-blue-100 p-8"
    >
      {n}
    </button>
  );
}
