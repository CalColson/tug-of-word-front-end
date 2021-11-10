<template lang='pug'>
  #game
    #titleText.flexText tug of word
    #subtitleText.flexText {{word}}
    TugBar(ref='tugBar')
</template>

<script>
import TugBar from '../components/TugBar.vue'

const START_TEXT = 'press any letter key to start...'
const NEW_WORD_TEXT = 'start a new word...'

// socket event constants (receiving)
const WORD_BROADCAST_EVENT_NAME = 'wordBroadcast'
const WORD_FAILURE_EVENT_NAME = 'wordFailure'

// socket emission constants (emitting)
const WORD_UPDATE_EVENT_NAME = 'wordUpdate'
const GAME_LEFT_EVENT_NAME = 'gameLeft'
const TEST_EVENT_NAME = 'test'

export default {
  name: 'Home',
  components: {
    TugBar
  },
  // not needed yet... maybe unnecessary
  props: ['room'],
  data: () => {
    return {
      socket: null,

      word: START_TEXT,
      candidateWord: START_TEXT,

      isMyTurn: null,

      // DOM elements
      SUBTITLE_ELEMENT: null
    }
  },
  created: function () {
    this.setupSocket()
  },
  mounted: function () {
    this.SUBTITLE_ELEMENT = document.getElementById('subtitleText')

    window.addEventListener('keydown', (e) => {
      const key = e.key
      this.handleInput(key)
    })
  },
  destroyed: function () {
    this.removeSocketListeners()

    // emit signal to cleanup game info on server
    this.socket.emit(GAME_LEFT_EVENT_NAME, this.room.code)
  },
  methods: {
    setupSocket () {
      this.socket = this.$store.state.socket

      // when server sends a new VALID word back to client
      this.socket.on(WORD_BROADCAST_EVENT_NAME, (word) => {
      // console.log(`valid word update: ${word}`)
        this.word = word
        const myTug = this.$refs.tugBar
        myTug.reverseTugBar()
      })

      // when server sends a FAILED word back to client
      this.socket.on(WORD_FAILURE_EVENT_NAME, (word) => {
        this.word = word
        this.SUBTITLE_ELEMENT.style.color = 'red'

        // TODO: handle time penalty and switching turn, this will require a socket emission to the server
      })
    },
    removeSocketListeners () {
      this.socket.off(WORD_BROADCAST_EVENT_NAME)
    },
    handleInput (key) {
      // if it is an alpha letter
      if (/^[a-zA-Z]$/.test(key)) {
        // console.log(key)

        // clear out starting text if necessary
        if (this.candidateWord === START_TEXT || this.candidateWord === NEW_WORD_TEXT) {
          this.candidateWord = key.toLowerCase()
        } else {
          this.candidateWord = this.word + key.toLowerCase()
        }

        this.sendWordToServer(this.candidateWord)
      }
    },

    sendWordToServer (word) {
      // server needs to know the room code to locate the players with wordBroadcast
      this.socket.emit(WORD_UPDATE_EVENT_NAME, this.room.code, word)
    },
    sendTestToServer (msg) {
      this.socket.emit(TEST_EVENT_NAME, msg)
    }
  }

}
</script>

<style lang='scss' scoped>
#game {
  height: 100%;
  padding: 0 2rem;
  display: grid;
  grid-template-rows: 2fr 1fr 3fr 3fr;
}

.flexText {
  display: flex;
  justify-content: center;
  align-items: center;

  font-size: xx-large;
  color: white;
}

</style>
