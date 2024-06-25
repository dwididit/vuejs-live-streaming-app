import { createRouter, createWebHistory } from "vue-router";
import UserLogin from "@/components/UserLogin.vue";
import UserDashboard from "@/components/UserDashboard.vue";
import UserRegister from "@/components/UserRegister.vue";
import StreamDetail from "@/components/StreamDetail.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: UserLogin,
  },
  {
    path: "/register",
    name: "Register",
    component: UserRegister,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: UserDashboard,
  },
  {
    path: "/streams/:id",
    name: "StreamDetail",
    component: StreamDetail,
  },
  {
    path: "/",
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("access_token");

  if (to.path === "/login" && isAuthenticated) {
    next("/dashboard");
  } else if (to.path === "/register" && isAuthenticated) {
    next("/dashboard");
  } else if (
    to.path !== "/login" &&
    to.path !== "/register" &&
    !isAuthenticated
  ) {
    next("/login");
  } else {
    next();
  }
});

export default router;
