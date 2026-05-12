<template>
  <nav class="navbar">
    <div class="navbar-left">
      <span class="navbar-title">{{ $t("title") }}</span>
    </div>
    <div class="navbar-center">
      <ul class="navbar-menu">
        <li>
          <router-link to="/home">{{ $t("home") }}</router-link>
        </li>
        <li>
          <router-link to="/analyse/Platform">{{ $t("analyse") }}</router-link>
        </li>
        <li>
          <a
            href="https://bbs.single-cell-spatial.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ $t("forum") }}
          </a>
        </li>
      </ul>
    </div>
    <div class="navbar-right">
      <span class="navbar-button" @click="toggleDarkMode()">
        <Toggle :is-dark-mode="isDarkMode"></Toggle>
      </span>
    </div>
  </nav>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { ref, watchEffect } from "vue";
import { useToggle } from "@vueuse/core";
import { isDark } from "../theme/composables/dark";
import Toggle from "../components/ToggleDark.vue";

const toggleDark = useToggle(isDark);
const isDarkMode = ref(isDark.value);

const toggleDarkMode = () => {
  toggleDark();
  isDarkMode.value = !isDarkMode.value;
};

const { locale } = useI18n();

watchEffect(() => {
  if (locale.value !== "en") {
    locale.value = "en";
  }
});
</script>

<style scoped>
.navbar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--el-navbar-bg-color);
  color: var(--el-navbar-color);
  padding: 10px 20px;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  top: 0;
  position: sticky;
  gap: 18px;
}

.navbar-left {
  flex: 1 1 430px;
  min-width: 0;
}

.navbar-title {
  font-weight: bold;
  font-size: 15px;
  line-height: 1.25;
  display: block;
}

.navbar-center {
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
}
.navbar-center a {
  color: var(--el-navbar-color);
}

.navbar-menu {
  list-style: none;
  display: flex;
  gap: 20px;
}
.navbar-menu li {
  position: relative;
}

.navbar-menu li a {
  text-decoration: none;
  font-weight: 500;
  padding: 10px 0;
  position: relative;
}

.navbar-menu li .router-link-active::after {
  content: "";
  position: absolute;
  bottom: -20px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--el-navbar-after);
  transform: scaleX(1);
  transition: all 0.3s ease;
  width: 100%;
}

.navbar-right {
  flex: 1 1 120px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  min-width: 60px;
}

@media (max-width: 900px) {
  .navbar {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .navbar-left {
    flex-basis: calc(100% - 70px);
  }

  .navbar-center {
    order: 3;
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
