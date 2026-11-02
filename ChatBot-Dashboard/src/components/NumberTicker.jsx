import { useState, useEffect, useRef } from "react";

export default function NumberTicker({
  value,
  prefix = "",
  suffix = "",
  duration = 1400,
  className = "",
}) {
  const [currentVal, setCurrentVal] = useState(0);
  const ref = useRef(null);
  const numericTarget = parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;

  useEffect(() => {
    let startTime = null;
    let animationFrameId = null;
    let hasAnimated = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out cubic
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const nextVal = Math.round(easeOutProgress * numericTarget);
            setCurrentVal(nextVal);

            if (progress < 1) {
              animationFrameId = requestAnimationFrame(animate);
            } else {
              setCurrentVal(numericTarget);
            }
          };
          animationFrameId = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [numericTarget, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {currentVal}
      {suffix}
    </span>
  );
}
