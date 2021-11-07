<template lang="pug">
  #app
    router-view
</template>

<script>

export default {
  name: 'App'
}
</script>

<style lang="scss">
$bgColor: slategray;

body {
  margin: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  height: 100vh;
  background: $bgColor;
}
</style>
