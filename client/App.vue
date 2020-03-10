<template lang="pug">
  .container
    core-header
    h1 hello
    router-view
</template>

<script>
// import { mapActions } from 'vuex'

export default {
  data() {
    return {
    }
  },
  metaInfo() {
    return {
      title: 'app',
      titleTemplate: '%s - demo',
    }
  },
}
</script>

<style lang="less">

h1 {
  color: coral;
}

</style>
