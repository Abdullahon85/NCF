<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="admin-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <h2 v-if="!sidebarCollapsed">🎛️ Админ</h2>
        <button
          class="collapse-btn"
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          {{ sidebarCollapsed ? "→" : "←" }}
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span v-if="!sidebarCollapsed" class="nav-label">{{
            item.label
          }}</span>
          <span v-if="!sidebarCollapsed && item.badge" class="nav-badge">{{
            item.badge
          }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <router-link to="/" class="nav-item">
          <span class="nav-icon">🌐</span>
          <span v-if="!sidebarCollapsed" class="nav-label">На сайт</span>
        </router-link>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="admin-main" :class="{ expanded: sidebarCollapsed }">
      <!-- Header -->
      <header class="admin-header">
        <div class="header-left">
          <h1>{{ currentPageTitle }}</h1>
        </div>
        <div class="header-right">
          <div class="user-menu" @click="showUserMenu = !showUserMenu">
            <span class="user-avatar">{{ userInitials }}</span>
            <span class="user-name">{{ authStore.fullName }}</span>
            <span class="dropdown-arrow">▼</span>

            <div v-if="showUserMenu" class="user-dropdown">
              <router-link to="/admin/profile" class="dropdown-item">
                👤 Профиль
              </router-link>
              <router-link to="/admin/settings" class="dropdown-item">
                ⚙️ Настройки
              </router-link>
              <div class="dropdown-divider"></div>
              <button @click="handleLogout" class="dropdown-item logout">
                🚪 Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { statsAPI } from "@/api/admin";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const sidebarCollapsed = ref(false);
const showUserMenu = ref(false);
const unreadMessages = ref(0);

const menuItems = computed(() => [
  { path: "/admin", label: "Dashboard", icon: "📊" },
  { path: "/admin/products", label: "Товары", icon: "📦" },
  { path: "/admin/categories", label: "Категории", icon: "📁" },
  { path: "/admin/brands", label: "Бренды", icon: "🏷️" },
  { path: "/admin/tags", label: "Теги", icon: "#️⃣" },
  { path: "/admin/features", label: "Характеристики", icon: "📋" },
  { path: "/admin/news", label: "Новости", icon: "📰" },
  {
    path: "/admin/messages",
    label: "Сообщения",
    icon: "✉️",
    badge: unreadMessages.value || undefined,
  },
  { path: "/admin/settings", label: "Настройки", icon: "⚙️" },
]);

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Управление товарами",
  "/admin/categories": "Управление категориями",
  "/admin/brands": "Управление брендами",
  "/admin/tags": "Управление тегами",
  "/admin/features": "Управление характеристиками",
  "/admin/news": "Управление новостями",
  "/admin/messages": "Сообщения",
  "/admin/settings": "Настройки сайта",
  "/admin/profile": "Профиль",
};

const currentPageTitle = computed(() => {
  return pageTitles[route.path] || "Админ панель";
});

const userInitials = computed(() => {
  const user = authStore.user;
  if (!user) return "?";

  const first = user.first_name?.[0] || "";
  const last = user.last_name?.[0] || "";

  if (first && last) return (first + last).toUpperCase();
  return user.username[0].toUpperCase();
});

function isActive(path: string) {
  if (path === "/admin") return route.path === "/admin";
  return route.path.startsWith(path);
}

async function handleLogout() {
  await authStore.logout();
  router.push("/admin/login");
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest(".user-menu")) {
    showUserMenu.value = false;
  }
}

async function loadStats() {
  try {
    const response = await statsAPI.getDashboard();
    unreadMessages.value = response.data.unread_messages || 0;
  } catch (e) {
    // Ignore
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  loadStats();
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<!-- Styles in main.css -->
