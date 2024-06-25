<template>
  <div>
    <ul>
      <li v-for="streamer in streamers" :key="streamer.id">
        {{ streamer.name }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "StreamerList",
  setup() {
    const store = useStore();
    const streamers = computed(() => store.getters.streamers);

    return {
      streamers,
    };
  },
});
</script>

<style scoped>
/* Add your styles here */
</style>
