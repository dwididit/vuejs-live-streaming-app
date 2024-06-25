import { createStore } from "vuex";
import axios from "axios";

export default createStore({
  state: {
    user: null,
    token: Cookies.get("access_token") || null,
    streamers: [],
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setToken(state, token) {
      state.token = token;
      Cookies.set("access_token", token);
    },
    clearToken(state) {
      state.token = null;
      Cookies.remove("access_token");
    },
    setStreamers(state, streamers) {
      state.streamers = streamers;
    },
  },
  actions: {
    async login({ commit }, user) {
      commit("setUser", user);
      commit("setToken", user.token);
    },
    async logout({ commit }) {
      try {
        const refresh_token = Cookies.get("refresh_token");
        if (refresh_token) {
          await axios.post(
            `${process.env.VUE_APP_BACKEND_URL}/logout/`,
            { refresh_token },
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("access_token")}`,
                "Content-Type": "application/json",
              },
            }
          );
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");
          commit("clearToken");
          commit("setUser", null);
        }
      } catch (error) {
        console.error("Logout failed:", error);
      }
    },
  },
  getters: {
    user: (state) => state.user,
    token: (state) => state.token,
    streamers: (state) => state.streamers,
  },
});
