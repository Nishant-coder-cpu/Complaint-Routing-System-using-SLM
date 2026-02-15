import { useEffect, useState } from 'react';

/**
 * Custom hook for animating number counters
 * @param {number} end - The target number to count to
 * @param {number} duration - Animation duration in milliseconds
 * @param {number} start - Starting number (default: 0)
 * @returns {number} - Current animated value
 */
export function useCountUp(end, duration = 2000, start = 0) {
    const [count, setCount] = useState(start);

    useEffect(() => {
        // If end is 0 or undefined, just set count to 0
        if (!end && end !== 0) {
            setCount(0);
            return;
        }

        // Reset to start value when end changes
        setCount(start);

        const startTime = Date.now();
        const timer = setInterval(() => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);

            // Easing function for smooth animation
            const easeOutQuad = (t) => t * (2 - t);
            const currentCount = Math.floor(start + (end - start) * easeOutQuad(progress));

            setCount(currentCount);

            if (progress === 1) {
                clearInterval(timer);
                setCount(end);
            }
        }, 16); // ~60fps

        return () => clearInterval(timer);
    }, [end, duration, start]);

    return count;
}
