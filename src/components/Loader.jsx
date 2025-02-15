const Loader = () => {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
      className="loading-spinner"
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        stroke="url(#gradient)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="125"
        strokeDashoffset="0"
      >
        <animateTransform
          attributeType="XML"
          attributeName="transform"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="1s"
          repeatCount="indefinite"
          keyTimes="0; 1"
          values="0 25 25; 360 25 25"
          calcMode="linear"
        />
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-250"
          dur="1.5s"
          repeatCount="indefinite"
          keyTimes="0; 1"
          values="0; -250"
          calcMode="linear"
        />
        <animate
          attributeName="opacity"
          values="1; 0.5; 1"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4A90E2">
            <animate
              attributeName="stop-color"
              values="#4A90E2; #8A2BE2; #4A90E2"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="#8A2BE2">
            <animate
              attributeName="stop-color"
              values="#8A2BE2; #4A90E2; #8A2BE2"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Loader;
