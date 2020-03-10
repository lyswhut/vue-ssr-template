<template>
  <div>
    <h1>Header {{name}}</h1>
    <router-link to="/home">to home</router-link>
    <br>
    <router-link to="/about">to about</router-link>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  computed: {
    ...mapGetters('header', ['name']),
  },
}
</script>
