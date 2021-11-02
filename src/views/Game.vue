<template>
  <div id="game">
  </div>
</template>

<script>
import SocketIOService from '../services/socketio.service'

export default {
  name: 'Home',
  components: {
  },
  created () {
    SocketIOService.setupSocketConnection()
  }
}
</script>

<style lang="scss" scoped>
#game {
  height: 100%;
  }
</style>
