<template lang="pug">
#debug
  canvas#tugBarCanvas
  button#reverseButton(@click='isShrinking = !isShrinking') reverse
</template>

<script>
export default {
  name: 'Debug',
  data: function () {
    return {
      canvas: null,
      ctx: null,

      isShrinking: false,
      currentPercentage: 0
    }
  },
  mounted: function () {
    this.canvas = document.getElementById('tugBarCanvas')

    this.ctx = this.canvas.getContext('2d')
    this.ctx.strokeStyle = 'white'

    // console.log(`Canvas width: ${this.canvas.width}`)
    // console.log(`Canvas height: ${this.canvas.height}`)

    this.animateNextFrame()
  },
  methods: {
    draw (percentage) {
      // clear screen
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      // draw progress bar and background
      this.ctx.fillStyle = 'red'
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx.fillStyle = 'blue'
      this.ctx.fillRect(0, 0, this.canvas.width * (percentage / 100), this.canvas.height)

      // draw middle line
      this.ctx.beginPath()
      this.ctx.lineWidth = 1

      const x = this.canvas.width * (percentage / 100)
      // console.log(x)
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, this.canvas.height)
      this.ctx.stroke()

      // draw border rect
      this.ctx.beginPath()
      this.ctx.lineWidth = 2
      this.ctx.rect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx.stroke()
    },

    animateNextFrame () {
      if (this.currentPercentage >= 0 && this.currentPercentage <= 100) {
        this.draw(this.currentPercentage)
        if (this.isShrinking) {
          this.currentPercentage -= 0.5
        } else {
          this.currentPercentage += 0.5
        }
        window.requestAnimationFrame(this.animateNextFrame)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#debug {
  height: 100%;
  padding: 0 2rem;
}
#tugBarCanvas {
  display: block;
  position: relative;
  width: 100%;
  height: 30%;
  top: 35%;
}
#reverseButton {
  position: relative;
  width: 100%;
  height: 10%;
  top: 35%;

  font-size: xx-large;
}
</style>
