"use client";

/**
 * Layered backdrop. CSS and SVG only, no library. Four layers stacked:
 * a faint perspective grid, drifting aurora glows, visible flowing paths with
 * a glow filter, and a fine grain overlay. Tuned for the dark navy palette
 * with a teal accent. Drop as the first child of a relative, overflow hidden
 * container and raise content with z-10.
 */

const VIEW_W = 1200;
const VIEW_H = 600;
const LINE_COUNT = 14;

function wavePath(baseline: number, amplitude: number, phase: number): string {
  const steps = 16;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const x = (VIEW_W / steps) * i;
    const y =
      baseline +
      Math.sin((i / steps) * Math.PI * 2 + phase) * amplitude +
      Math.sin((i / steps) * Math.PI * 4 + phase) * (amplitude * 0.35);
    pts.push([x, y]);
  }
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[i + 1];
    const mx = (cx + nx) / 2;
    const my = (cy + ny) / 2;
    d += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last[0].toFixed(1)} ${last[1].toFixed(1)}`;
  return d;
}

export function BackgroundPaths() {
  const lines = Array.from({ length: LINE_COUNT }, (_, i) => {
    const t = i / (LINE_COUNT - 1);
    return {
      d: wavePath(VIEW_H * t, 28 + t * 40, t * Math.PI * 1.6),
      duration: 16 + (i % 5) * 4,
      delay: -(i * 1.2),
      opacity: 0.18 + (i % 3) * 0.12,
    };
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(80% 60% at 50% 30%, black, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(80% 60% at 50% 30%, black, transparent 75%)",
        }}
      />

      {/* aurora glows */}
      <div className="tg-aurora tg-aurora-a" />
      <div className="tg-aurora tg-aurora-b" />
      <div className="tg-aurora tg-aurora-c" />

      {/* flowing paths */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="tg-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0" />
            <stop offset="45%" stopColor="#2DD4BF" stopOpacity="1" />
            <stop offset="70%" stopColor="#22D3EE" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
          </linearGradient>
          <filter id="tg-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {lines.map((l, i) => (
          <path
            key={i}
            d={l.d}
            pathLength={1}
            stroke="url(#tg-stroke)"
            strokeWidth={1.4}
            strokeOpacity={l.opacity}
            strokeDasharray="0.22 0.78"
            filter="url(#tg-glow)"
            style={{
              animation: `tg-flow ${l.duration}s linear ${l.delay}s infinite`,
            }}
          />
        ))}
      </svg>

      {/* grain */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.035]">
        <filter id="tg-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#tg-grain)" />
      </svg>

      <style>{`
        @keyframes tg-flow {
          from { stroke-dashoffset: 1; }
          to { stroke-dashoffset: 0; }
        }
        .tg-aurora {
          position: absolute;
          border-radius: 9999px;
          filter: blur(90px);
          opacity: 0.5;
        }
        .tg-aurora-a {
          width: 540px; height: 540px;
          top: -160px; left: 8%;
          background: radial-gradient(circle, rgba(45,212,191,0.55), transparent 65%);
          animation: tg-drift-a 22s ease-in-out infinite;
        }
        .tg-aurora-b {
          width: 460px; height: 460px;
          top: -80px; right: 4%;
          background: radial-gradient(circle, rgba(34,211,238,0.40), transparent 65%);
          animation: tg-drift-b 26s ease-in-out infinite;
        }
        .tg-aurora-c {
          width: 600px; height: 600px;
          top: 120px; left: 32%;
          background: radial-gradient(circle, rgba(79,70,229,0.28), transparent 65%);
          animation: tg-drift-c 30s ease-in-out infinite;
        }
        @keyframes tg-drift-a {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(60px, 40px); }
        }
        @keyframes tg-drift-b {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(-50px, 30px); }
        }
        @keyframes tg-drift-c {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.08); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tg-aurora, svg path { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
