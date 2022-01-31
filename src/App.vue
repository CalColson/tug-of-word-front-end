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
@font-face {
  font-family: 'Mochiy Pop P One';
  src: local('Mochiy Pop P One'), url(./assets/fonts/Mochiy_Pop_P_One/MochiyPopPOne-Regular.ttf) format('truetype');
}

body {
  margin: 0;
}
#app {
  height: 100vh;

  color: $textColor;
  background: $bgColor;

  font-family: 'Mochiy Pop P One', sans-serif;
}
</style>
