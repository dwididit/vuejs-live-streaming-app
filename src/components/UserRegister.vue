<template>
  <div class="register-container">
    <div class="register-box">
      <h1>Register</h1>
      <form @submit.prevent="register">
        <div class="input-group">
          <label for="username">Username:</label>
          <input type="text" v-model="username" id="username" required />
        </div>
        <div class="input-group">
          <label for="password">Password:</label>
          <input type="password" v-model="password" id="password" required />
        </div>
        <div class="input-group">
          <label for="email">Email:</label>
          <input type="email" v-model="email" id="email" required />
        </div>
        <button type="submit" class="btn">Register</button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="extra-links">
        <router-link to="/login" class="link">Login</router-link>
        <router-link to="#" class="link">Forgot password?</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import axios, { AxiosError } from "axios";
import { useRouter } from "vue-router";

interface ApiResponse {
  code: number;
  message: string;
  data: any;
}

axios.defaults.baseURL = process.env.VUE_APP_BACKEND_URL;

export default defineComponent({
  name: "UserRegister",
  setup() {
    const username = ref("");
    const password = ref("");
    const email = ref("");
    const error = ref("");
    const router = useRouter();

    const register = async () => {
      try {
        const response = await axios.post<ApiResponse>("/register/", {
          username: username.value,
          password: password.value,
          email: email.value,
        });
        if (response.data.code === 201) {
          router.push("/login");
        } else {
          error.value = response.data.message;
        }
      } catch (err) {
        const axiosError = err as AxiosError<ApiResponse>;
        if (axiosError.response && axiosError.response.data) {
          error.value = axiosError.response.data.message;
        } else {
          error.value = "An error occurred. Please try again.";
        }
      }
    };

    return {
      username,
      password,
      email,
      error,
      register,
    };
  },
});
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f9f9f9;
}

.register-box {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.register-box h1 {
  margin-bottom: 1.5rem;
  font-size: 24px;
  color: #9146ff;
}

.input-group {
  margin-bottom: 1rem;
  text-align: left;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
}

.input-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn {
  background-color: #9146ff;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;
}

.btn:hover {
  background-color: #772ce8;
}

.error {
  color: red;
  margin-top: 1rem;
}

.extra-links {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.extra-links .link {
  color: #9146ff;
  text-decoration: none;
}

.extra-links .link:hover {
  text-decoration: underline;
}
</style>
