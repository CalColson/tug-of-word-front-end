<template lang='pug'>
  #compGame
    #titleText.flexText tug of word
    #subtitleText.flexText(v-if='!gameIsOver')
      span#myName.name(v-if='isMyTurn') you -->
      span#yourName.name(v-else) them -->
      |{{word}}
    #subtitleText.flexText(v-else)
      span#myName.name(v-if='!isMyTurn') you
      span#yourName.name(v-else) they
      | are the winner!
    TugBar(ref='tugBar' :isMyTurn='isMyTurn')
    #buttonContainer(v-if='gameIsOver')
      button#rematchButton(@click='handleRematch') rematch?
</template>

<script>
import TugBar from '../components/TugBar.vue'
import rawWordList from '../assets/my_word_list.txt'

const wordList = rawWordList.split('\n')

const START_TEXT = 'press any letter key to start...'
const NEW_WORD_TEXT = 'start a new word...'

const DEFAULT_COLOR_STR = 'white'
const FAILURE_COLOR_STR = 'red'
const SUCCESS_COLOR_STR = 'lightgreen'

// length of input pause (in ms) after player correctly submits word (reward)
const WORD_SUCCESS_PAUSE_TIME_MS = 500
// length of input pause (in ms) after player errs on a word (penalty)
const WORD_ERROR_PAUSE_TIME_MS = 500
// length of time (in ms) that AI takes to start its turn
const COMP_TURN_LENGTH_MS = 2000

export default {
  name: 'ComputerGame',
  components: {
    TugBar
  },
  data: () => {
    return {
      wordList: wordList,
      possibleWords: wordList,

      word: START_TEXT,
      candidateWord: null,

      isMyTurn: true,
      isInputPaused: false,
      gameIsOver: false,

      // the id for the interval that regulates the main game tick (occurs every tenth of a second)
      intervalId: null,
      // a collection of all timeout ids created during the game
      timeoutIds: [],

      // Vue components
      tugBar: null,

      // DOM elements
      SUBTITLE_ELEMENT: null,

      // event listeners
      windowEventListener: null
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
    window.removeEventListener('keydown', this.windowEventListener)
  },
  methods: {
    handleInput (key) {
      // do nothing if input is paused
      if (this.isInputPaused || !this.isMyTurn) return

      // if it is an alpha letter
      if (/^[a-zA-Z]$/.test(key)) {
        // console.log(key)

        // if the game is starting, begin processing game state changes
        if (this.word === START_TEXT) {
          this.intervalId = setInterval(() => {
            this.tugBar.reverseTugBar()
            this.processTick()
          }, 100)
        }

        // clear out starting text if necessary
        if (this.word === START_TEXT || this.word === NEW_WORD_TEXT) {
          this.candidateWord = key.toLowerCase()
        } else {
          this.candidateWord = this.word + key.toLowerCase()
        }

        // check for validity of new letter
        this.possibleWords = this.filterPossibleWords(this.candidateWord)
        if (this.possibleWords.length > 0) {
          // if valid
          this.isMyTurn = !this.isMyTurn
          this.word = this.candidateWord

          // after a timeout (corresponding to AI difficulty) process computer turn
          this.timeoutIds.push(setTimeout(() => {
            this.processCompTurn()
          }, COMP_TURN_LENGTH_MS))
        } else {
          // if invalid
          this.applyPenalty()
        }

        // attempted word submission event
      } else if (key === 'Enter') {
        // if no word has been started, do nothing
        if (this.word === START_TEXT || this.word === NEW_WORD_TEXT) return

        // if word is shorter than 4 characters, do nothing
        if (this.word.length < 4) return

        // check for validity of word
        this.submitWord(this.candidateWord)
      }
    },
    processTick () {
      const totalTime = this.tugBar.totalTime
      const myTime = this.tugBar.myTime
      const yourTime = this.tugBar.yourTime

      if (myTime <= 0 || myTime >= totalTime || yourTime <= 0 || yourTime >= totalTime) {
        // game is over

        // pause input and clear all timeouts and intervals
        this.isInputPaused = true
        clearInterval(this.intervalId)
        this.timeoutIds.forEach((id) => {
          clearTimeout(id)
        })

        this.gameIsOver = true
      }

      if (this.isMyTurn) {
        this.tugBar.syncTimes(this.tugBar.myTime - 0.1)
      } else {
        this.tugBar.syncTimes(this.tugBar.myTime + 0.1)
      }
    },
    processCompTurn () {
      const randomPossibleWord = this.possibleWords[Math.floor(Math.random() * this.possibleWords.length)]
      console.log(randomPossibleWord)

      // if the computer should begin a new word
      if (this.word === START_TEXT || this.word === NEW_WORD_TEXT) {
        this.candidateWord = randomPossibleWord[0]
        this.word = this.candidateWord
        this.isMyTurn = true
      } else if (this.possibleWords.length > 0) {
        if (randomPossibleWord.length !== this.word.length) {
          // in this case, add a letter
          this.candidateWord += randomPossibleWord[this.word.length]
          // we already know the word is valid (candidateWord is simply additionally set for parallelism and to avoid bugs in applyPenalty())
          this.word = this.candidateWord
          this.isMyTurn = true
        } else {
          // in this case submit word
          this.submitWord(this.word)
        }
      }
    },

    // filter this component's possibleWords variable by a designated word
    // i.e. return all words in the wordlist that begin with word (or are word)
    filterPossibleWords (word) {
      const regex = RegExp(`^${word}`)
      // console.log(this.possibleWords)
      return this.possibleWords.filter(word => word.match(regex))
    },
    submitWord (word) {
      if (this.possibleWords.includes(word)) {
        // if valid

        // pause input to show submission success
        this.isInputPaused = true

        // show the valid submission in green
        this.SUBTITLE_ELEMENT.style.color = SUCCESS_COLOR_STR

        this.timeoutIds.push(setTimeout(() => {
          // the turn switch comes after the timeout for GUI reasons
          this.startNewWord()
          this.isMyTurn = !this.isMyTurn

          if (!this.isMyTurn) {
            this.timeoutIds.push(setTimeout(() => {
              this.processCompTurn()
            }, COMP_TURN_LENGTH_MS))
          }
          this.isInputPaused = false
        }, WORD_SUCCESS_PAUSE_TIME_MS))
      } else {
        // if invalid
        this.applyPenalty()
      }
    },
    startNewWord () {
      this.possibleWords = this.wordList

      // ensure a return to default string color
      this.SUBTITLE_ELEMENT.style.color = DEFAULT_COLOR_STR
      this.word = NEW_WORD_TEXT
    },
    applyPenalty () {
      // pause input during the penalty
      this.isInputPaused = true

      // show the invalid word in red
      this.SUBTITLE_ELEMENT.style.color = FAILURE_COLOR_STR
      this.word = this.candidateWord

      // after a penalty timeout, apply penalty and continue game
      this.timeoutIds.push(setTimeout(() => {
        if (this.isMyTurn) {
          const newMyTime = Math.round((this.tugBar.myTime / 2) * 10) / 10
          this.tugBar.syncTimes(newMyTime)
        } else {
          const newYourTime = Math.round((this.tugBar.yourTime / 2) * 10) / 10
          this.tugBar.syncTimes(this.tugBar.totalTime - newYourTime)
        }

        this.startNewWord()
        this.isInputPaused = false

        if (!this.isMyTurn) this.processCompTurn()
      }, WORD_ERROR_PAUSE_TIME_MS))
    },
    handleRematch () {
      this.possibleWords = wordList

      this.word = START_TEXT
      this.candidateWord = null

      this.isMyTurn = true
      this.gameIsOver = false

      this.intervalId = null
      this.timeoutIds = []

      this.tugBar.reset()

      this.isInputPaused = false
    }
  }
}
</script>

<style lang='scss' scoped>
#compGame {
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
