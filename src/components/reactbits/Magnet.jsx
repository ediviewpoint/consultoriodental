import { useState, useEffect, useRef } from 'react';

const Magnet = ({
  children,
  padding = 80,
  disabled = false,
  magnetStrength = 2.5,
  activeTransition   = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.5s ease-in-out',
  wrapperClassName = '',
  innerClassName   = '',
  wrapperStyle = {},
  ...props
}) => {
  const [active, setActive]     = useState(false);
  const [pos, setPos]           = useState({ x: 0, y: 0 });
  const ref                     = useRef(null);

  useEffect(() => {
    if (disabled) { setPos({ x: 0, y: 0 }); return; }
    const onMove = e => {
      if (!ref.current) return;
      const { left, top, width, height } = ref.current.getBoundingClientRect();
      const cx = left + width / 2, cy = top + height / 2;
      const dx = Math.abs(cx - e.clientX), dy = Math.abs(cy - e.clientY);
      if (dx < width / 2 + padding && dy < height / 2 + padding) {
        setActive(true);
        setPos({ x: (e.clientX - cx) / magnetStrength, y: (e.clientY - cy) / magnetStrength });
      } else {
        setActive(false);
        setPos({ x: 0, y: 0 });
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [padding, disabled, magnetStrength]);

  return (
    <div
      ref={ref}
      className={wrapperClassName}
      style={{ display: 'inline-block', ...wrapperStyle }}
      {...props}
    >
      <div
        className={innerClassName}
        style={{
          transform: `translate3d(${pos.x}px,${pos.y}px,0)`,
          transition: active ? activeTransition : inactiveTransition,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Magnet;
