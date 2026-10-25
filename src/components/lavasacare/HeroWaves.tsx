/**
 * HeroWaves — layered flowing ribbons behind the hero instrument.
 * A green-palette take on flowing wave art: filled bottom swells, a mid-page
 * S-ribbon pair, a top-right sweep and thin accent glint lines. Each layer
 * drifts laterally on its own slow cycle so the background feels alive but
 * stays quiet enough to keep the editorial look.
 */
export default function HeroWaves() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        style={{ transform: "rotate(-5deg) scale(1.16)" }}
      >
        {/* top-right sweep + glint line */}
        <g className="wave-a">
          <path
            d="M -80 240 C 280 140 560 320 880 240 C 1140 175 1340 90 1540 120 L 1540 210 C 1340 180 1140 265 880 330 C 560 410 280 230 -80 330 Z"
            fill="#bde0cd"
            opacity="0.34"
          />
          <path
            d="M -80 300 C 300 200 570 380 900 290 C 1160 222 1350 250 1540 215"
            stroke="#ffffff"
            strokeWidth="2"
            opacity="0.3"
          />
        </g>

        {/* mid S-ribbon + sand accent */}
        <g className="wave-b">
          <path
            d="M -80 470 C 300 560 540 380 860 470 C 1120 545 1330 470 1540 520 L 1540 585 C 1330 535 1120 610 860 535 C 540 445 300 625 -80 535 Z"
            fill="#5cab8a"
            opacity="0.16"
          />
          <path
            d="M -80 585 C 300 505 560 640 900 570 C 1160 518 1360 570 1540 540"
            stroke="#e9e4d2"
            strokeWidth="5"
            opacity="0.45"
          />
        </g>

        {/* bottom swells — deepen towards the fold */}
        <g className="wave-c">
          <path
            d="M -80 640 C 320 560 620 700 940 640 C 1180 595 1360 640 1540 610 L 1540 940 L -80 940 Z"
            fill="#bde0cd"
            opacity="0.4"
          />
          <path
            d="M -80 720 C 340 640 640 780 980 715 C 1220 670 1390 730 1540 700 L 1540 940 L -80 940 Z"
            fill="#227454"
            opacity="0.16"
          />
          <path
            d="M -80 800 C 380 730 660 850 1000 795 C 1240 755 1400 800 1540 780 L 1540 940 L -80 940 Z"
            fill="#0a261b"
            opacity="0.26"
          />
        </g>
      </svg>
    </div>
  );
}
