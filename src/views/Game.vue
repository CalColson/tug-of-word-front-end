<template lang='pug'>
  #game
    #titleText.flexText tug of word
    #subtitleText.flexText(v-if='!gameIsOver')
      span#myName.name(v-if='isMyTurn') you -->
      span#yourName.name(v-else) them -->
      |{{word}}
    #subtitleText.flexText(v-else)
      //- can replace this conditional with a variable from server signal announcing win
      span#myName.name(v-if='!isMyTurn') you
      span#yourName.name(v-else) they
      | are the winner!
    TugBar(ref='tugBar' :isMyTurn='isMyTurn')
    #buttonContainer
      button#rematchButton(v-if='gameIsOver' @click='handleRematch') rematch?
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
const TIME_UPDATE_EVENT_NAME = 'timeUpdate'

const WORD_BROADCAST_EVENT_NAME = 'wordBroadcast'
const WORD_ERROR_EVENT_NAME = 'wordError'
const WORD_SUCCESS_EVENT_NAME = 'wordSuccess'

const GAME_RESULT_EVENT_NAME = 'gameResult'
const REMATCH_EVENT_NAME = 'rematch'

// socket emission constants (emitting)
const WORD_UPDATE_EVENT_NAME = 'wordUpdate'
const WORD_SUBMISSION_EVENT_NAME = 'wordSubmission'

const GAME_LEFT_EVENT_NAME = 'gameLeft'

const REMATCH_REQUEST_EVENT_NAME = 'rematchRequest'

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

      gameIsOver: false,
      didIWin: null,

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

    if (this.room) {
      this.isMyTurn = this.room.firstToGo === this.socket.id
    }
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
    if (this.room) {
      this.socket.emit(GAME_LEFT_EVENT_NAME, this.room.code)
    }
  },
  methods: {
    setupSocket () {
      this.socket = this.$store.state.socket

      // when server sends client time sync info
      this.socket.on(TIME_UPDATE_EVENT_NAME, (myTime) => {
        this.tugBar.syncTimes(myTime)
      })

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

      // when server informs client of verified game result
      this.socket.on(GAME_RESULT_EVENT_NAME, (gameWasWon) => {
        this.isInputPaused = true

        if (gameWasWon) {
          this.tugBar.myTime = this.tugBar.totalTime
          this.tugBar.yourTime = 0
        } else {
          this.tugBar.myTime = 0
          this.tugBar.yourTime = this.tugBar.totalTime
        }

        this.didIWin = gameWasWon
        this.gameIsOver = true
      })

      // when server informs client of rematch
      this.socket.on(REMATCH_EVENT_NAME, () => {
        // reset Game Component state
        this.word = START_TEXT
        this.candidateWord = START_TEXT

        this.gameIsOver = false

        this.isMyTurn = !this.didIWin
        this.didIWin = null
        this.isInputPaused = false

        // reset tugBar (the argument specifices who should go first)
        this.tugBar.reset(this.isMyTurn)
      })
    },
    removeSocketListeners () {
      this.socket.off(TIME_UPDATE_EVENT_NAME)
      this.socket.off(WORD_BROADCAST_EVENT_NAME)
      this.socket.off(WORD_ERROR_EVENT_NAME)
      this.socket.off(WORD_SUCCESS_EVENT_NAME)
      this.socket.off(GAME_RESULT_EVENT_NAME)
      this.socket.off(REMATCH_EVENT_NAME)
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
          // if this is the input that starts the game
          // if (!this.tugBar.hasGameStarted) {
          //   this.socket.emit(GAME_STARTED_EVENT_NAME, this.room.code, this.socket.id)
          // }
        } else {
          this.candidateWord = this.word + key.toLowerCase()
        }

        // server needs to know the room code to locate the players with wordBroadcast
        this.socket.emit(WORD_UPDATE_EVENT_NAME, this.room.code, this.socket.id, this.candidateWord)

        // attempted word submission event
      } else if (key === 'Enter') {
        // if no word has been started, do nothing
        if (this.word === START_TEXT || this.word === NEW_WORD_TEXT) return

        // if word is shorter than 4 characters, do nothing
        if (this.word.length < 4) return

        // server needs to know the room code to locate the players with wordSuccess
        this.socket.emit(WORD_SUBMISSION_EVENT_NAME, this.room.code, this.socket.id, this.word)
      }
    },

    startNewWord () {
      this.SUBTITLE_ELEMENT.style.color = DEFAULT_COLOR_STR
      this.word = NEW_WORD_TEXT
      this.isInputPaused = false
    },

    applyPenalty () {
      this.startNewWord()
    },

    handleRematch () {
      // emit signal to reset gameState on server
      this.socket.emit(REMATCH_REQUEST_EVENT_NAME, this.room.code)
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

#buttonContainer {
  display: flex;
  align-items: center;
}
#rematchButton {
  height: 50%;
  width: 100%;
  font-size: xx-large;
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
