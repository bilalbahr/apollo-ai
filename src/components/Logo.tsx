/* Apollo mark: a geometric leaf drawn from two circle arcs.
   Single color, inherits size via props; color fixed to the olive token. */
export const Logo = ({ size = 56 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Apollo"
    role="img"
  >
    <path
      d="M 30 82 A 54 54 0 0 1 70 18 A 54 54 0 0 1 30 82 Z"
      fill="var(--olive)"
    />
    <path
      d="M 34 78 L 66 22"
      stroke="var(--bg)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M 30 82 Q 24 88 22 94"
      stroke="var(--olive)"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
  </svg>
);
