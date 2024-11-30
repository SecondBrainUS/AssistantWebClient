<template>
  <div class="w-full h-full bg-gray-700 text-gray-100 flex items-center justify-center relative overflow-hidden">
    <div class="glow"></div>
    <img src="@/assets/mush-v2-logo.png" alt="Logo" class="logo" />
    <button class="workspace-button">Go To Workspace</button>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.6;
  }
}

@keyframes scale {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.glow {
  position: absolute;
  width: 80vmin;
  height: 80vmin;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.7) 3%,
    rgba(255, 255, 255, 0.5) 8%,
    rgba(255, 255, 255, 0.3) 15%,
    rgba(255, 255, 255, 0.15) 25%,
    rgba(255, 255, 255, 0.08) 40%,
    rgba(255, 255, 255, 0.03) 65%,
    rgba(255, 255, 255, 0.01) 85%,
    rgba(255, 255, 255, 0) 100%
  );
  border-radius: 50%;
  animation: pulse 6s ease-in-out infinite;
  z-index: 0;
  filter: blur(160px);
}

.logo {
  max-width: 50%;
  max-height: 50%;
  position: relative;
  z-index: 1;
  animation: scale 6s ease-in-out infinite;
  opacity: 1;
}

.workspace-button {
  position: absolute;
  bottom: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  z-index: 1;
  transition: background-color 0.3s ease;
}

.workspace-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>