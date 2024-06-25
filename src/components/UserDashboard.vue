<template>
  <div class="dashboard">
    <header class="header">
      <h2>Dashboard</h2>
      <nav class="menu">
        <router-link to="#" class="menu-item">Home</router-link>
        <router-link to="#" class="menu-item">Profile</router-link>
        <router-link to="#" class="menu-item">Settings</router-link>
      </nav>
      <button @click="logout" class="btn-logout">Logout</button>
    </header>
    <div class="content">
      <h3>Available Streamers</h3>
      <div class="streamers-grid">
        <div
          class="streamer-card"
          v-for="stream in streams"
          :key="stream.id"
          @click="viewStream(stream.id)"
        >
          <div class="streamer-avatar"></div>
          <div class="streamer-info">
            <h4>{{ stream.title }}</h4>
            <p>{{ stream.description }}</p>
          </div>
        </div>
      </div>
      <div class="dummy-content">
        <h3>Dummy Content</h3>
        <p>
          This is a placeholder for more content. You can replace this with real
          data or components as needed.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
          vehicula, urna non fringilla feugiat, leo risus faucibus nulla, nec
          fermentum sapien lacus in ligula. Nulla facilisi. Integer ac mauris
          nec massa egestas malesuada.
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import axios from "axios";

export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();
    const streams = ref([]);

    const logout = async () => {
      await store.dispatch("logout");
      router.push("/login");
    };

    const fetchStreams = async () => {
      try {
        const response = await axios.get("/streams/all_streams/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (response.data.code === 200) {
          streams.value = response.data.data;
        } else {
          console.error(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching streams:", error);
      }
    };

    const viewStream = (id: number) => {
      router.push(`/streams/${id}`);
    };

    onMounted(() => {
      fetchStreams();
    });

    return {
      logout,
      streams,
      viewStream,
    };
  },
});
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f9f9f9;
  color: #333;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.header h2 {
  font-size: 24px;
  color: #9146ff;
  margin: 0;
}

.menu {
  display: flex;
  gap: 1rem;
}

.menu-item {
  color: #333;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.menu-item:hover {
  background-color: #f0f0f0;
}

.btn-logout {
  background-color: #9146ff;
  color: #fff;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-logout:hover {
  background-color: #772ce8;
}

.content {
  padding: 1rem;
  flex-grow: 1;
  overflow-y: auto;
}

.content h3 {
  font-size: 20px;
  margin-bottom: 1rem;
  color: #9146ff;
}

.streamers-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.streamer-card {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.streamer-card:hover {
  transform: translateY(-5px);
}

.streamer-avatar {
  width: 100%;
  height: 150px;
  background-color: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.streamer-info h4 {
  margin: 0.5rem 0;
  color: #9146ff;
}

.streamer-info p {
  margin: 0;
  color: #666;
}

.dummy-content {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.dummy-content h3 {
  color: #9146ff;
}

.dummy-content p {
  margin-bottom: 1rem;
}
</style>
