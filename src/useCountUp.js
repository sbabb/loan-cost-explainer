import { useEffect, useState } from 'react'

// Counts a number up from zero when the answer appears - the one bit of
// theatre, on the one number that matters. Anyone whose device asks for
// reduced motion gets the final number straight away.
//
// Screen readers never hear the counting: the heading carries the real
// sentence in visually hidden text, and the animated number is hidden.
export function useCountUp(target, duration = 900) {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const [value, setValue] = useState(reduce ? target : 0)

  useEffect(() => {
    if (reduce) {
      setValue(target)
      return
    }
    let frame
    const start = performance.now()
    function tick(now) {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - progress) ** 3 // fast, then settling
      setValue(Math.round(target * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, reduce])

  return value
}
