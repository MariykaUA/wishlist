<script setup>
const bgPresents = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  style: {
    '--x': `${(i * 7.3 + Math.random() * 6) % 100}vw`,
    '--duration': `${7 + (i % 5) * 2.1 + Math.random() * 3}s`,
    '--delay': `${(i * 1.3) % 9}s`,
    '--size': `${1.1 + (i % 4) * 0.5}rem`,
    '--drift': `${((i % 3) - 1) * 40}px`,
    '--rot': `${((i % 2) === 0 ? 1 : -1) * (10 + (i % 3) * 8)}deg`,
  },
}))
</script>

<template>
  <div class="bg-presents" aria-hidden="true">
    <span v-for="p in bgPresents" :key="p.id" class="bg-present" :style="p.style">🎁</span>
  </div>
</template>

<style scoped>
.bg-presents {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.bg-present {
  position: absolute;
  left: var(--x);
  bottom: -8vh;
  font-size: var(--size);
  opacity: 0;
  animation: present-fly var(--duration) var(--delay) infinite ease-in-out;
}

@keyframes present-fly {
  0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
  8%   { opacity: 0.55; }
  90%  { opacity: 0.55; }
  100% { transform: translateY(-115vh) translateX(var(--drift)) rotate(var(--rot)); opacity: 0; }
}
</style>
