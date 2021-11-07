<template lang="pug">
  #game
    #titleText.flexText tug of words
    #subtitleText.flexText {{word}}
    TugBar(ref='tugBar')
</template>

<script>
import SocketIOService from '../services/socketio.service'
import TugBar from '../components/TugBar.vue'

const startText = 'press any letter key to start...'
const newWordText = 'start a new word...'

export default {
  name: 'Home',
  components: {
    TugBar
  },
  data: () => {
    return {
      word: startText,
      candidateWord: startText,
      isMyTurn: null
    }
  },
  methods: {
    handleInput (key) {
      // if it is an alpha letter
      if (/^[a-zA-Z]$/.test(key)) {
        // console.log(key)

        // clear out startText if necessary
        if (this.candidateWord === startText || this.candidateWord === newWordText) {
          this.candidateWord = key.toLowerCase()
        } else {
          this.candidateWord = this.word + key.toLowerCase()
        }

        this.sendWordToServer(this.candidateWord)
      }
    },

    sendWordToServer (word) {
      SocketIOService.emit('wordUpdate', word)
    },
    sendTestToServer (msg) {
      SocketIOService.emit('test', msg)
    }
  },
  created () {
    SocketIOService.setupSocketConnection()
    SocketIOService.socket.on('wordBroadcast', (word) => {
      // console.log(`valid word update: ${word}`)
      this.word = word
      const myTug = this.$refs.tugBar
      myTug.reverseTugBar()
    })
  },
  mounted () {
    window.addEventListener('keydown', (e) => {
      const key = e.key
      this.handleInput(key)
    })
  }
}
</script>

<style lang="scss" scoped>
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
