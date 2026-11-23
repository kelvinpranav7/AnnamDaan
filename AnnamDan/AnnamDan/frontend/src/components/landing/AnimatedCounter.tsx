import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

export function AnimatedCounter({
  value,
  duration = 2,
  suffix,
  prefix,
}: {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setN(v),
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {new Intl.NumberFormat("en-IN").format(Math.round(n))}
      {suffix}
    </span>
  );
}
