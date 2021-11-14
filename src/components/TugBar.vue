<template lang="pug">
#tugBarContainer
  #timeLeft.timeIndicator {{myTime.toFixed(1)}}
  #timeRight.timeIndicator {{yourTime.toFixed(1)}}
  #progressBar
    #tugBar
</template>

<script>
// TODO: overhaul all of tugbar to match myTime and yourTime directly to tugbar animation progress... right now it is really broken :/

// const TOTAL_STARTING_TIME = 10000
const TOTAL_STARTING_TIME = 60

const SHRINKING_CLASS_NAME = 'shrinking'
// descriptive name created to avoid possible clashing, since this class is not scoped... see mounted
// hook and css comment
const GROWING_CLASS_NAME = 'tugBarGrowing'

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

      isShrinking: null,

      intervalId: null,

      // DOM elements
      // variable containing the head tag of the entire app. Used for programatic styling
      APP_HEAD_ELEMENT: null,
      PROGRESS_BAR_ELEMENT: null,
      TUG_BAR_ELEMENT: null,

      // created DOM element
      ADDED_STYLE_ELEMENT: null
    }
  },
  created: function () {
    // synonymous with isMyTurn
    this.isShrinking = this.isMyTurn
    // console.log(`isShrinking: ${this.isShrinking}`)
  },
  mounted: function () {
    this.APP_HEAD_ELEMENT = document.getElementsByTagName('head')[0]
    this.PROGRESS_BAR_ELEMENT = document.getElementById('progressBar')
    this.TUG_BAR_ELEMENT = document.getElementById('tugBar')

    // programatically create growing class
    this.ADDED_STYLE_ELEMENT = document.createElement('style')
    this.ADDED_STYLE_ELEMENT.innerHTML = `#tugBar.tugBarGrowing {width: ${this.PROGRESS_BAR_ELEMENT.clientWidth}px}`
    this.APP_HEAD_ELEMENT.appendChild(this.ADDED_STYLE_ELEMENT)
  },
  destroyed: function () {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    // remove programatically added style
    this.APP_HEAD_ELEMENT.removeChild(this.ADDED_STYLE_ELEMENT)
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
      const tugBar = this.TUG_BAR_ELEMENT

      if (tugBar) {
        if (tugBar.classList.contains(SHRINKING_CLASS_NAME)) {
          tugBar.classList.remove(SHRINKING_CLASS_NAME)

          tugBar.style.transitionDuration = `${this.yourTime}s`
          tugBar.classList.add(GROWING_CLASS_NAME)
          this.isShrinking = false
        } else if (tugBar.classList.contains(GROWING_CLASS_NAME)) {
          tugBar.classList.remove(GROWING_CLASS_NAME)

          tugBar.style.transitionDuration = `${this.myTime}s`
          tugBar.classList.add(SHRINKING_CLASS_NAME)
          this.isShrinking = true
        } else {
          // tugbar does not have a class yet, so we will give it the appropriate one

          // first flip isShrinking, as turn will immediately change after first input
          this.isShrinking = !this.isShrinking

          const newClassName = this.isShrinking ? SHRINKING_CLASS_NAME : GROWING_CLASS_NAME

          tugBar.style.transitionDuration = `${this.totalTime / 2}s`
          tugBar.classList.add(newClassName)
        }
      } else {
        throw Error('tugbar element not found!')
      }

      this.updateTimeInterval()
    },

    // halve the appropriate person's time
    // don't confuse the local parameter isMyTurn with the one on this component
    applyPenalty (isMyTurn) {
      console.log('applying penalty')

      // if it's my turn, half myTime, else half yourTime
      if (isMyTurn) {
        this.myTime = Math.round((this.myTime / 2) * 10) / 10
        this.yourTime = this.totalTime - this.myTime

        // update the bar GUI to half size
        // console.log(`original width: ${this.TUG_BAR_ELEMENT.clientWidth}`)
        this.TUG_BAR_ELEMENT.style.width = `${this.TUG_BAR_ELEMENT.clientWidth / 2}px`
        // console.log(`halved width: ${this.TUG_BAR_ELEMENT.clientWidth}`)

        // update the gui transition duration
        this.TUG_BAR_ELEMENT.style.transitionDuration = `${this.myTime}s`
      } else {
        this.yourTime = Math.round((this.yourTime / 2) * 10) / 10
        this.myTime = this.totalTime - this.yourTime

        // update the bar GUI to add half of opponent's size
        let newWidth = (this.PROGRESS_BAR_ELEMENT.clientWidth - this.TUG_BAR_ELEMENT.clientWidth) / 2
        newWidth = Math.round(newWidth)
        newWidth = this.TUG_BAR_ELEMENT.clientWidth + newWidth

        this.TUG_BAR_ELEMENT.style.width = `${newWidth}px`

        // update the gui transition duration
        this.TUG_BAR_ELEMENT.style.transitionDuration = `${this.yourTime}s`
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
  transition-property: width, transform;
  transition-timing-function: linear;
}
#tugBar.shrinking {
  transform: scaleX(0);
}
// need to define this programatically in 'mounted' callback to match calculated width of progress bar
// #tugBar.growing {
//   transform: scaleX(2);
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
