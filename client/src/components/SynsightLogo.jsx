import { useId } from 'react';

// Synsight Logo shared UI component.

export default function SynsightLogo({ className, width, height, ...props }) {
  const gradientId = useId();
  const paint0 = `${gradientId}-paint0`;
  const paint1 = `${gradientId}-paint1`;
  const paint2 = `${gradientId}-paint2`;
  const paint3 = `${gradientId}-paint3`;

  // Layout and appearance
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 58 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M3.422 24.6106L25.2981 47.3267C26.0234 48.0798 27.0181 48.5139 28.0634 48.5336C29.1087 48.5533 30.1191 48.157 30.8722 47.4317L53.5883 25.5556"
        stroke={`url(#${paint0})`}
        strokeWidth="6.84402"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M38.6003 28.0698V12.3013"
        stroke={`url(#${paint1})`}
        strokeWidth="6.84402"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28.7445 28.0698V4.41702"
        stroke={`url(#${paint2})`}
        strokeWidth="6.84402"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.8895 28.0698V22.1566"
        stroke={`url(#${paint3})`}
        strokeWidth="6.84402"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id={paint0} x1="3.422" y1="24.6106" x2="53.5883" y2="25.5556" gradientUnits="userSpaceOnUse">
          <stop stopColor="#155DFC" />
          <stop offset="1" stopColor="#9810FA" />
        </linearGradient>
        <linearGradient id={paint1} x1="38.6003" y1="12.3013" x2="40.5923" y2="12.4276" gradientUnits="userSpaceOnUse">
          <stop stopColor="#155DFC" />
          <stop offset="1" stopColor="#9810FA" />
        </linearGradient>
        <linearGradient id={paint2} x1="28.7445" y1="4.41702" x2="30.7409" y2="4.50143" gradientUnits="userSpaceOnUse">
          <stop stopColor="#155DFC" />
          <stop offset="1" stopColor="#9810FA" />
        </linearGradient>
        <linearGradient id={paint3} x1="18.8895" y1="22.1566" x2="20.8339" y2="22.4854" gradientUnits="userSpaceOnUse">
          <stop stopColor="#155DFC" />
          <stop offset="1" stopColor="#9810FA" />
        </linearGradient>
      </defs>
    </svg>
  );
}
