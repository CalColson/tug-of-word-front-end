<template lang='pug'>
  #game
    #titleText.flexText tug of word
    #subtitleText.flexText
      span#myName.name(v-if='isMyTurn') you -->
      span#yourName.name(v-else) them -->
      |{{word}}
    TugBar(ref='tugBar' :isMyTurn='isMyTurn')
</template>

<script>
import TugBar from '../components/TugBar.vue'

const START_TEXT = 'press any letter key to start...'
const NEW_WORD_TEXT = 'start a new word...'

const DEFAULT_COLOR_STR = 'white'
const SUCCESS_COLOR_STR = 'lightgreen'
const FAILURE_COLOR_STR = 'red'

// length of input pause (in ms) after player correctly submits word (reward)
const WORD_SUCCESS_PAUSE_TIME_MS = 500
// length of input pause (in ms) after player errs on a word (penalty)
const WORD_ERROR_PAUSE_TIME_MS = 500

// socket event constants (receiving)
const WORD_BROADCAST_EVENT_NAME = 'wordBroadcast'
const WORD_ERROR_EVENT_NAME = 'wordError'

const WORD_SUCCESS_EVENT_NAME = 'wordSuccess'
const WORD_FAILURE_EVENT_NAME = 'wordFailure'

// socket emission constants (emitting)
const WORD_UPDATE_EVENT_NAME = 'wordUpdate'
const WORD_SUBMISSION_EVENT_NAME = 'wordSubmission'
const GAME_LEFT_EVENT_NAME = 'gameLeft'

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
      isInputPaused: false,

      // Vue components
      tugBar: null,

      // DOM elements
      SUBTITLE_ELEMENT: null,

      // event listeners
      windowEventListener: null
    }
  },
  created: function () {
    this.setupSocket()

    this.isMyTurn = this.room.firstToGo === this.socket.id
  },
  mounted: function () {
    this.tugBar = this.$refs.tugBar

    this.SUBTITLE_ELEMENT = document.getElementById('subtitleText')

    this.windowEventListener = (e) => {
      const key = e.key
      this.handleInput(key)
    }
    window.addEventListener('keydown', this.windowEventListener)
  },
  destroyed: function () {
    this.removeSocketListeners()
    window.removeEventListener('keydown', this.windowEventListener)

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

        this.isMyTurn = !this.isMyTurn
        this.tugBar.reverseTugBar()
      })

      // when server sends a FAILED word back to client
      this.socket.on(WORD_ERROR_EVENT_NAME, (word) => {
        // the pause happens during the error committer's turn making it a penalty
        this.isInputPaused = true
        this.SUBTITLE_ELEMENT.style.color = FAILURE_COLOR_STR
        this.word = word

        setTimeout(() => {
          this.applyPenalty()
        }, WORD_ERROR_PAUSE_TIME_MS)
      })

      // when client has submitted a valid entire word
      this.socket.on(WORD_SUCCESS_EVENT_NAME, (word) => {
        // the pause and reversal come before the wait, making it a reward for the successful submitter
        this.isInputPaused = true
        this.tugBar.reverseTugBar()

        this.SUBTITLE_ELEMENT.style.color = SUCCESS_COLOR_STR
        setTimeout(() => {
          // the turn switch comes after the timeout for GUI reasons
          this.isMyTurn = !this.isMyTurn
          this.startNewWord()
        }, WORD_SUCCESS_PAUSE_TIME_MS)
      })

      // TODO: when client has submitted an invalid entire word... can probably be merged with word error event
      this.socket.on(WORD_FAILURE_EVENT_NAME, (word) => {

      })
    },
    removeSocketListeners () {
      this.socket.off(WORD_BROADCAST_EVENT_NAME)
      this.socket.off(WORD_ERROR_EVENT_NAME)
      this.socket.off(WORD_SUCCESS_EVENT_NAME)
      this.socket.off(WORD_FAILURE_EVENT_NAME)
    },
    handleInput (key) {
      // do nothing if input is paused
      if (this.isInputPaused || !this.isMyTurn) return

      // if it is an alpha letter
      if (/^[a-zA-Z]$/.test(key)) {
        // console.log(key)

        // clear out starting text if necessary
        if (this.word === START_TEXT || this.word === NEW_WORD_TEXT) {
          this.candidateWord = key.toLowerCase()
        } else {
          this.candidateWord = this.word + key.toLowerCase()
        }

        // server needs to know the room code to locate the players with wordBroadcast
        this.socket.emit(WORD_UPDATE_EVENT_NAME, this.room.code, this.candidateWord)

        // attempted word submission event
      } else if (key === 'Enter') {
        // if no word has been started, do nothing
        if (this.word === START_TEXT || this.word === NEW_WORD_TEXT) return

        // server needs to know the room code to locate the players with wordSuccess
        this.socket.emit(WORD_SUBMISSION_EVENT_NAME, this.room.code, this.word)
      }
    },
    startNewWord () {
      this.SUBTITLE_ELEMENT.style.color = DEFAULT_COLOR_STR
      this.word = NEW_WORD_TEXT
      this.isInputPaused = false
    },
    applyPenalty () {
      this.tugBar.applyPenalty(this.isMyTurn)
      this.startNewWord()
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

.name {
  margin-right: .5rem;
  font-weight: bold;
}
#myName {
  color: blue;
}
#yourName {
  color: red;
}

</style>
