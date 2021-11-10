<template lang='pug'>
  #app
    router-view
</template>

<script>
import { io } from 'socket.io-client'

export default {
  name: 'App',
  created: function () {
    this.$store.commit('setSocket', io(process.env.VUE_APP_SOCKET_ENDPOINT))
  }
}
</script>

<style lang='scss'>
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
