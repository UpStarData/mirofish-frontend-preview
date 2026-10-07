<template>
  <router-view />
</template>

<script setup>
// 使用 Vue Router 来管理页面
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'JetBrains Mono', 'Space Grotesk', 'Noto Sans SC', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #000000;
  background-color: #ffffff;
}

/* Backend endpoint names are not useful in a browser-only walkthrough. */
.api-note { display: none !important; }

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #000000;
}

::-webkit-scrollbar-thumb:hover {
  background: #333333;
}

/* 全局按钮样式 */
button {
  font-family: inherit;
}

.demo-notice {
  position: fixed;
  z-index: 9999;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 6px 12px;
  color: #fff;
  background: #161616;
  border-top: 1px solid #ff6a33;
  text-align: center;
  font-size: 11px;
  line-height: 1.35;
}
</style>
