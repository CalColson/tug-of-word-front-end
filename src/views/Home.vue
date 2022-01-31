<template lang="pug">
#home
  #logo
    div
      img.rope.rope-left(src='../assets/images/rope_edit.png')
    #title.flexText { tug of word }
    div
      img.rope.rope-right(src='../assets/images/rope_edit.png')
  .spacer
  router-link.option.custom-button(to='/private') play with a friend
  .spacer
  router-link.option.custom-button(to='/computer') play vs computer
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
  grid-template-rows: 2fr 1fr 3fr 1fr 3fr 1fr;
}

#logo {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  align-items: center;
}

.flexText {
  text-align: center;
  font-size: 3.5em;
}
.option {
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

.rope{
  max-width: 100%;
  height: auto;
}
.rope-right {
  transform: rotate(180deg);
  transform: scaleX(-1);
}
</style>
