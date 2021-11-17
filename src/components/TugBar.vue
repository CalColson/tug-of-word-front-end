<template lang="pug">
#tugBarContainer
  #timeLeft.timeIndicator {{myTime.toFixed(1)}}
  #timeRight.timeIndicator {{yourTime.toFixed(1)}}
  #canvasContainer
    canvas#tugBarCanvas
</template>

<script>
// const TOTAL_STARTING_TIME = 10000
const TOTAL_STARTING_TIME = 15

export default {
  name: 'TugBar',
  props: [
    // synonymous with isShrinking
    'isMyTurn'
  ],
  data: function () {
    return {
      totalTime: TOTAL_STARTING_TIME,
      myTime: TOTAL_STARTING_TIME / 2,
      yourTime: TOTAL_STARTING_TIME / 2,

      hasGameStarted: false,
      isShrinking: null,

      intervalId: null,

      // DOM elements
      canvas: null,
      ctx: null
    }
  },
  computed: {
    tugBarPercentage: function () {
      return (this.myTime / this.totalTime) * 100
    }
  },
  created: function () {
    // synonymous with isMyTurn at creation of game
    if (this.isMyTurn) {
      this.isShrinking = this.isMyTurn
    }
    // console.log(`isShrinking: ${this.isShrinking}`)
  },
  mounted: function () {
    // setup for canvas manipulation
    this.canvas = document.getElementById('tugBarCanvas')

    this.ctx = this.canvas.getContext('2d')
    this.ctx.strokeStyle = 'white'

    // console.log(`Canvas width: ${this.canvas.width}`)
    // console.log(`Canvas height: ${this.canvas.height}`)

    // draw initial state of canvas
    this.draw(this.tugBarPercentage)
  },
  destroyed: function () {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  },
  methods: {
    updateTimeInterval () {
      // Clear interval to replace it with new one
      if (this.intervalId) {
        clearInterval(this.intervalId)
        this.intervalId = null
      }

      this.intervalId = setInterval(() => {
        // clear the interval in the event that the time has elapsed
        if (!this.isTimeInBounds()) {
          if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = null
          }
          // Time has elapsed, handle winning/losing of game
          return
        }

        if (this.isShrinking) {
          this.myTime = Math.round((this.myTime - 0.1) * 10) / 10
          this.yourTime = this.totalTime - this.myTime
        } else {
          this.myTime = Math.round((this.myTime + 0.1) * 10) / 10
          this.yourTime = this.totalTime - this.myTime
        }
      }, 100)
    },
    isTimeInBounds () {
      return (this.myTime > 0 && this.myTime < TOTAL_STARTING_TIME &&
        this.yourTime > 0 && this.yourTime < TOTAL_STARTING_TIME)
    },
    reverseTugBar () {
      // console.log('reversing tugBar')

      // ensure that animation begins on the first reverseTugBar call
      if (!this.hasGameStarted) {
        this.animateNextFrame()
        this.hasGameStarted = true
      }

      this.isShrinking = !this.isShrinking
      this.updateTimeInterval()
    },

    // halve the appropriate person's time
    // don't confuse the local parameter isMyTurn with the one on this component
    applyPenalty (isMyTurn) {
      // console.log('applying penalty')

      // if it's my turn, half myTime, else half yourTime
      if (isMyTurn) {
        this.myTime = Math.round((this.myTime / 2) * 10) / 10
        this.yourTime = this.totalTime - this.myTime
      } else {
        this.yourTime = Math.round((this.yourTime / 2) * 10) / 10
        this.myTime = this.totalTime - this.yourTime
      }

      this.updateTimeInterval()
    },
    draw (percentage) {
      // clear screen
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      // draw progress bar and background
      this.ctx.fillStyle = 'red'
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx.fillStyle = 'blue'
      this.ctx.fillRect(0, 0, this.canvas.width * (percentage / 100), this.canvas.height)

      // if the tugBarPercentage is zero, no need to draw middle line
      // (prevents thick middle line showing on ended game)
      if (this.tugBarPercentage === 0 || this.tugBarPercentage === 100) return

      // draw middle line
      this.ctx.beginPath()
      this.ctx.lineWidth = 2

      const x = this.canvas.width * (percentage / 100)
      // console.log(x)
      this.ctx.moveTo(x + 0.5, 0)
      this.ctx.lineTo(x + 0.5, this.canvas.height)
      this.ctx.stroke()
    },
    animateNextFrame () {
      // console.log('animating')

      if (this.tugBarPercentage >= 0 && this.tugBarPercentage <= 100) {
        this.draw(this.tugBarPercentage)

        // stop animation only when game is over
        if (this.tugBarPercentage !== 0 && this.tugBarPercentage !== 100) {
          window.requestAnimationFrame(this.animateNextFrame)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>

#tugBarContainer {
  // establishing inner grid
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-template-areas:
    'timeLeft timeRight '
    'canvas   canvas    ';
}

#timeLeft {
  grid-area: timeLeft;
}

#timeRight {
  grid-area: timeRight;
}

.timeIndicator {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 10px;
  color: white;
  font-size: x-large;
}

#canvasContainer {
  position: relative;
  grid-area: canvas;
  border: 4px solid white;
}

#tugBarCanvas {
  position: absolute;
  height: 100%;
  width: 100%;
}
</style>
