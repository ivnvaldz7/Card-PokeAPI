import { useEffect, useState } from "react";

type Size = {
  width: number;
  height: number;
};

export const useElementSize = <T extends HTMLElement>() => {
  const [element, setElement] = useState<T | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return { ref: setElement, size };
};
