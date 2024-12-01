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
  width: 40vmax;
  height: 40vmax;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 0) 70%
  );
  border-radius: 50%;
  animation: pulse 6s ease-in-out infinite;
  z-index: 0;
  filter: blur(100px);
  transform: translate(-50%, -50%);

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