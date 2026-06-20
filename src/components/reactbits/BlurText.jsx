import { motion } from 'motion/react';
import { useEffect, useRef, useState, useMemo } from 'react';

const buildKeyframes = (from, steps) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap(s => Object.keys(s))]);
  const kf = {};
  keys.forEach(k => { kf[k] = [from[k], ...steps.map(s => s[k])]; });
  return kf;
};

const BlurText = ({
  text = '',
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = t => t,
  onAnimationComplete,
  stepDuration = 0.35,
  style = {},
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold, rootMargin }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);

  const defaultFrom = useMemo(() =>
    direction === 'top'
      ? { filter: 'blur(10px)', opacity: 0, y: -40 }
      : { filter: 'blur(10px)', opacity: 0, y: 40 },
    [direction]
  );

  const defaultTo = useMemo(() => [
    { filter: 'blur(4px)',  opacity: 0.5, y: direction === 'top' ? 5 : -5 },
    { filter: 'blur(0px)',  opacity: 1,   y: 0 },
  ], [direction]);

  const from  = animationFrom ?? defaultFrom;
  const steps = animationTo   ?? defaultTo;
  const stepCount   = steps.length + 1;
  const totalDur    = stepDuration * (stepCount - 1);
  const times       = Array.from({ length: stepCount }, (_, i) => stepCount === 1 ? 0 : i / (stepCount - 1));

  return (
    <span ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap', ...style }}>
      {elements.map((seg, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', willChange: 'transform, filter, opacity' }}
          initial={from}
          animate={inView ? buildKeyframes(from, steps) : from}
          transition={{ duration: totalDur, times, delay: (i * delay) / 1000, ease: easing }}
          onAnimationComplete={i === elements.length - 1 ? onAnimationComplete : undefined}
        >
          {seg === ' ' ? ' ' : seg}
          {animateBy === 'words' && i < elements.length - 1 && ' '}
        </motion.span>
      ))}
    </span>
  );
};

export default BlurText;
