<template>
  <router-view />
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background-color: #fff;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

#app {
  min-height: 100vh;
}

::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>