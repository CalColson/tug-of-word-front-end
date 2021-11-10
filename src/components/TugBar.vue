<template lang="pug">
#tugBarContainer
  #timeLeft.timeIndicator {{myTime.toFixed(1)}}
  #timeRight.timeIndicator {{yourTime.toFixed(1)}}
  #progressBar
    #tugBar
  //- button#reverseButton(@click="reverseTugBar") reverse

</template>

<script>

const TOTAL_STARTING_TIME = 10000

export default {
  name: 'TugBar',
  data: function () {
    return {
      totalTime: TOTAL_STARTING_TIME,
      myTime: TOTAL_STARTING_TIME / 2,
      yourTime: TOTAL_STARTING_TIME / 2,

      isShrinking: true,

      intervalId: null
    }
  },
  methods: {
    updateTimeInterval () {
      this.intervalId = setInterval(() => {
        // clear the interval in the event that the time has elapsed
        if (!this.isTimeInBounds()) {
          if (this.intervalId) clearInterval(this.intervalId)
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
      // Clear interval to replace it with new one
      if (this.intervalId) clearInterval(this.intervalId)

      const tugBar = document.getElementById('tugBar')

      if (tugBar) {
        if (tugBar.classList.contains('shrinking')) {
          tugBar.classList.remove('shrinking')

          tugBar.style.transitionDuration = `${this.yourTime}s`
          tugBar.classList.add('growing')
          this.isShrinking = false
        } else if (tugBar.classList.contains('growing')) {
          tugBar.classList.remove('growing')

          tugBar.style.transitionDuration = `${this.myTime}s`
          tugBar.classList.add('shrinking')
          this.isShrinking = true
        } else {
          tugBar.style.transitionDuration = `${this.totalTime / 2}s`
          tugBar.classList.add('shrinking')
          this.isShrinking = true
        }
      } else {
        throw Error('tugbar element not found!')
      }

      this.updateTimeInterval()
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
}

#progressBar {
  border: 4px solid white;
  background-color: red;
  // background-color: beige;
  grid-column: 1 / 3;
}

#tugBar {
  height: 100%;
  width: 50%;
  border-right: 1px solid white;
  background-color: blue;
  // background-color: orange;

  transform-origin: left;
  transition-property: transform;
  transition-timing-function: linear;
}
#tugBar.shrinking {
  transform: scaleX(0);
}
#tugBar.growing {
  transform: scaleX(2);
}

// #reverseButton {
//   grid-column: 1 / 3;
// }

.timeIndicator {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 10px;
  color: white;
  font-size: x-large;
}
</style>
