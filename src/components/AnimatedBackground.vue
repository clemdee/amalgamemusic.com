<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900" preserveAspectRatio="xMidYMid slice">
    <!-- Spotlight beam -->
    <defs>
      <linearGradient id="spotlightGradient" gradientUnits="userSpaceOnUse" x1="0" y1="900" x2="0" y2="-1000">
        <stop offset="0%" stop-color="rgba(255, 255, 255, 0.18)" />
        <stop offset="95%" stop-color="rgba(255, 255, 255, 0.1)" />
        <stop offset="100%" stop-color="rgba(255, 255, 255, 0.05)" />
      </linearGradient>
    </defs>

    <polygon
      id="beam"
      points="0,930 200,-1000 -200,-1000"
      fill="url(#spotlightGradient)"
      transform-origin="0 900"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="-20; 80; -20"
        keyTimes="0; 0.5; 1"
        dur="10s"
        repeatCount="indefinite"
      />
    </polygon>

    <polygon
      id="beam"
      points="1600,930 1400,-1000 1800,-1000"
      fill="url(#spotlightGradient)"
      transform-origin="1600 900"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="20; -80; 20"
        keyTimes="0; 0.5; 1"
        dur="10s"
        repeatCount="indefinite"
      />
    </polygon>
  </svg>
</template>

<style lang="scss" scoped>
svg {
  position: absolute;
  inset: 0rem;
  height: 100dvh;
  width: 100dvw;
  z-index: 1;
  filter: blur(2rem);
}
</style>
