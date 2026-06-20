import { useInView, useMotionValue, useSpring } from 'motion/react';
import { useCallback, useEffect, useRef } from 'react';

const CountUp = ({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  startWhen = true,
  separator = '',
  onStart,
  onEnd,
}) => {
  const ref = useRef(null);
  const motionValue = useMotionValue(direction === 'down' ? to : from);
  const damping   = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);
  const springValue = useSpring(motionValue, { damping, stiffness });
  const isInView = useInView(ref, { once: true, margin: '0px' });

  const getDecimals = n => {
    const s = n.toString();
    if (s.includes('.')) { const d = s.split('.')[1]; if (parseInt(d) !== 0) return d.length; }
    return 0;
  };
  const maxDec = Math.max(getDecimals(from), getDecimals(to));

  const fmt = useCallback(v => {
    const opts = { useGrouping: !!separator, minimumFractionDigits: maxDec, maximumFractionDigits: maxDec };
    const n = Intl.NumberFormat('en-US', opts).format(v);
    return separator ? n.replace(/,/g, separator) : n;
  }, [maxDec, separator]);

  useEffect(() => {
    if (ref.current) ref.current.textContent = fmt(direction === 'down' ? to : from);
  }, [from, to, direction, fmt]);

  useEffect(() => {
    if (!isInView || !startWhen) return;
    onStart?.();
    const t1 = setTimeout(() => motionValue.set(direction === 'down' ? from : to), delay * 1000);
    const t2 = setTimeout(() => onEnd?.(), (delay + duration) * 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isInView, startWhen, motionValue, direction, from, to, delay, duration, onStart, onEnd]);

  useEffect(() => {
    return springValue.on('change', v => { if (ref.current) ref.current.textContent = fmt(v); });
  }, [springValue, fmt]);

  return <span ref={ref} className={className} />;
};

export default CountUp;
