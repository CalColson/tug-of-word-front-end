<template lang='pug'>
  //- main home page
  #home(v-if='!showHost')
    #title.flexText tug of word
    #codeEntry.flexText
      label(for='codeInput') enter code to join game:
      input#codeInput(@keyup.enter='checkCode' placeholder='enter code')
      button#joinButton(@click='checkCode') join
    .flexText or
    button#hostButton(@click='toggleHostPage') host a game
  //- host page
  #hostPage(v-else)
    font-awesome-icon#returnArrow.fa-3x(icon='chevron-left' @click='toggleHostPage')
    #code.flexText your code is:
      span {{code}}
</template>

<script>
// socket event constants (receiving)
const CODE_RESPONSE_EVENT_NAME = 'codeResponse'
const CODE_SUCCESS_EVENT_NAME = 'codeSuccess'
const CODE_FAILURE_EVENT_NAME = 'codeFailure'

// socket emission constants (emitting)
const CODE_ATTEMPT_EVENT_NAME = 'codeAttempt'
const CODE_REQUEST_EVENT_NAME = 'codeRequest'
const CODE_REMOVE_EVENT_NAME = 'codeRemove'

export default {
  name: 'Home',
  data: function () {
    return {
      socket: null,
      showHost: false,
      code: ''
    }
  },

  created: function () {
    this.setupSocket()
  },
  destroyed: function () {
    this.removeSocketListeners()
  },

  methods: {
    // called when created to get local access to socket and add listeners
    setupSocket () {
      this.socket = this.$store.state.socket

      // message from server with 6-letter code response
      this.socket.on(CODE_RESPONSE_EVENT_NAME, (code) => {
      // console.log(code)
        this.code = code
      })

      // message from server denoting successful code entry
      this.socket.on(CODE_SUCCESS_EVENT_NAME, (gameRoom) => {
        console.log(`found game: ${gameRoom.code}`)

        this.$router.push({ name: 'Game', params: { room: gameRoom } })
      })

      // message from server denoting failing code entry
      this.socket.on(CODE_FAILURE_EVENT_NAME, () => {
        console.log('no game to be found')
        alert('no game found with this code, please try a different code')
        document.getElementById('codeInput').value = ''
      })
    },

    // called at 'destroyed' to remove the listeners added in component setup
    removeSocketListeners () {
      this.socket.off(CODE_RESPONSE_EVENT_NAME)
      this.socket.off(CODE_SUCCESS_EVENT_NAME)
      this.socket.off(CODE_FAILURE_EVENT_NAME)
    },

    checkCode () {
      const code = document.getElementById('codeInput').value
      this.socket.emit(CODE_ATTEMPT_EVENT_NAME, code)
    },
    toggleHostPage () {
      if (!this.showHost) {
        this.socket.emit(CODE_REQUEST_EVENT_NAME)
      } else {
        if (this.code) {
          this.socket.emit(CODE_REMOVE_EVENT_NAME, this.code)
        } else {
          throw new Error('no code to remove')
        }
        this.code = ''
      }
      this.showHost = !this.showHost
    }
  }
}
</script>

<style lang='scss' scoped>
#home {
  height: 100%;
  padding: 0 2rem;
  display: grid;
  grid-template-rows: 2fr 3fr 1fr 3fr;
}

#codeInput {
  margin-left: 1rem;
  height: 15%;
  font-size: x-large;
}

#joinButton {
  margin-left: 0.5rem;
  height: 17.5%;
  font-size: x-large;
}

#hostButton {
  height: 50%;
  width: 75%;
  margin: auto;

  cursor: pointer;
  font-size: xx-large;
}

.flexText {
  display: flex;
  justify-content: center;
  align-items: center;

  font-size: xx-large;
  color: white;
}

#hostPage {
  height: 100%;
  padding: 0 2rem;
  display: grid;
  // I'm sure there is a better way to do this...
  grid-template-rows: 1fr 8fr;
}
#returnArrow {
  margin: auto 0;

  color: white;
  cursor: pointer;
}
#code > span {
  margin-left: 0.5em;
  font-weight: bold;
}

</style>
