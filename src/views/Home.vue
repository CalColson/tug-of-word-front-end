<template lang="pug">
#home
  #title.flexText tug of word
  .spacer
  router-link.option(to='/private') play with a friend
  router-link.option(to='/computer') play vs computer
  .spacer
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style lang="scss" scoped>
#home {
  height: 100%;
  padding: 0 2rem;
  display: grid;
  grid-template-rows: 2fr 1fr 3fr 3fr 1fr;
}
.flexText {
  display: flex;
  justify-content: center;
  align-items: center;

  font-size: xx-large;
  color: white;
}
.option {
  background: white;
  color: black;
  border: 3px solid slategray;

  font-size: xx-large;

  margin: 0 auto;
  width: 75%;
  display: flex;
  align-items: center;
  justify-content: center;
}

a {
  text-decoration: none;
}
</style>
