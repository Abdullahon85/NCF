<template>
  <div class="dashboard">
    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card primary">
        <div class="stat-icon">📦</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.products_count }}</div>
          <div class="stat-label">Товаров</div>
        </div>
        <router-link to="/admin/products" class="stat-link"
          >Управление →</router-link
        >
      </div>

      <div class="stat-card success">
        <div class="stat-icon">📁</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.categories_count }}</div>
          <div class="stat-label">Категорий</div>
        </div>
        <router-link to="/admin/categories" class="stat-link"
          >Управление →</router-link
        >
      </div>

      <div class="stat-card warning">
        <div class="stat-icon">🏷️</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.brands_count }}</div>
          <div class="stat-label">Брендов</div>
        </div>
        <router-link to="/admin/brands" class="stat-link"
          >Управление →</router-link
        >
      </div>

      <div class="stat-card info">
        <div class="stat-icon">📰</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.news_count }}</div>
          <div class="stat-label">Новостей</div>
        </div>
        <router-link to="/admin/news" class="stat-link"
          >Управление →</router-link
        >
      </div>

      <div class="stat-card" :class="stats.unread_messages > 0 ? 'danger' : ''">
        <div class="stat-icon">✉️</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.unread_messages }}</div>
          <div class="stat-label">Новых сообщений</div>
        </div>
        <router-link to="/admin/messages" class="stat-link"
          >Читать →</router-link
        >
      </div>

      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.available_products }}</div>
          <div class="stat-label">В наличии</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="section">
      <h2 class="section-title">Быстрые действия</h2>
      <div class="quick-actions">
        <router-link to="/admin/products" class="action-btn">
          <span class="action-icon">➕</span>
          <span>Добавить товар</span>
        </router-link>
        <router-link to="/admin/categories" class="action-btn">
          <span class="action-icon">📁</span>
          <span>Новая категория</span>
        </router-link>
        <router-link to="/admin/news" class="action-btn">
          <span class="action-icon">📝</span>
          <span>Написать новость</span>
        </router-link>
        <router-link to="/admin/settings" class="action-btn">
          <span class="action-icon">⚙️</span>
          <span>Настройки сайта</span>
        </router-link>
      </div>
    </div>

    <!-- System Info -->
    <div class="section">
      <h2 class="section-title">Информация</h2>
      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Пользователь:</span>
          <span class="info-value">{{ authStore.fullName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">{{ authStore.user?.email || "—" }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Роль:</span>
          <span class="info-value">
            {{ authStore.user?.is_superuser ? "Суперадмин" : "Администратор" }}
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Последний вход:</span>
          <span class="info-value">{{
            formatDate(authStore.user?.last_login)
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { statsAPI } from "@/api/admin";

const authStore = useAuthStore();

interface Stats {
  products_count: number;
  categories_count: number;
  brands_count: number;
  news_count: number;
  unread_messages: number;
  available_products: number;
  tags_count: number;
  features_count: number;
}

const stats = ref<Stats>({
  products_count: 0,
  categories_count: 0,
  brands_count: 0,
  news_count: 0,
  unread_messages: 0,
  available_products: 0,
  tags_count: 0,
  features_count: 0,
});

const loading = ref(false);

async function loadStats() {
  try {
    loading.value = true;
    const response = await statsAPI.getDashboard();
    stats.value = response.data;
  } catch (e) {
    console.error("Failed to load stats:", e);
  } finally {
    loading.value = false;
  }
}

function formatDate(dateString?: string): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

onMounted(() => {
  loadStats();
});
</script>

<!-- Styles in main.css -->
