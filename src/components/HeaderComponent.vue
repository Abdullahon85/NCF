<template>
  <header class="header">
    <div class="container">
      <nav class="navbar">
        <router-link to="/" class="logo" @click="mobileMenuOpen = false">
          <span>Future Stars</span>
        </router-link>

        <!-- Search Bar -->
        <div class="search-container">
          <form
            @submit.prevent="navigateToSearchResults"
            class="search-wrapper"
          >
            <input
              type="text"
              v-model="searchQuery"
              @keyup.enter="navigateToSearchResults"
              placeholder="Поиск по названию или артикулу..."
              class="search-input"
            />
            <button
              type="submit"
              class="search-btn"
              :disabled="searchQuery.trim().length < 1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </form>
        </div>

        <!-- Favorites & Compare icons -->
        <div class="header-icons">
          <router-link
            to="/favorites"
            class="header-icon-btn"
            title="Избранное"
            @click="mobileMenuOpen = false"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              />
            </svg>
            <span v-if="favCount > 0" class="header-icon-badge">{{
              favCount
            }}</span>
          </router-link>
          <router-link
            to="/compare"
            class="header-icon-btn"
            title="Сравнение"
            @click="mobileMenuOpen = false"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span v-if="compareCount > 0" class="header-icon-badge">{{
              compareCount
            }}</span>
          </router-link>
        </div>

        <button
          class="mobile-menu-toggle"
          @click="mobileMenuOpen = !mobileMenuOpen"
          :aria-expanded="mobileMenuOpen"
          :aria-label="mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul class="nav-menu" :class="{ active: mobileMenuOpen }">
          <!-- Search inside mobile menu -->
          <li class="mobile-search-item">
            <form @submit.prevent="navigateToSearchResults" class="mobile-search-wrapper">
              <input
                type="text"
                v-model="searchQuery"
                @keyup.enter="navigateToSearchResults"
                placeholder="Поиск по названию или артикулу..."
                class="mobile-search-input"
              />
              <button type="submit" class="mobile-search-btn" :disabled="searchQuery.trim().length < 1">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </form>
          </li>

          <li>
            <router-link to="/" @click="mobileMenuOpen = false"
              >Главная</router-link
            >
          </li>

          <!-- CATALOG WITH DROPDOWN -->
          <li
            class="catalog-menu"
            @mouseenter="open = true"
            @mouseleave="open = false"
          >
            <router-link to="/catalog" @click="handleCatalogClick"
              >Каталог</router-link
            >

            <ul v-if="open" class="dropdown">
              <li v-for="cat in categories" :key="cat.id">
                <router-link
                  :to="`/catalog/${cat.slug}`"
                  @click="mobileMenuOpen = false"
                >
                  {{ cat.name }}
                </router-link>
              </li>
            </ul>
          </li>

          <li>
            <router-link to="/about" @click="mobileMenuOpen = false"
              >О нас</router-link
            >
          </li>
          <li>
            <router-link to="/contact" @click="mobileMenuOpen = false"
              >Контакты</router-link
            >
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { categoriesAPI } from "@/api";
import type { Category } from "@/types";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useCompareStore } from "@/stores/useCompareStore";

const route = useRoute();
const router = useRouter();
const mobileMenuOpen = ref(false);
const open = ref(false);
const categories = ref<Category[]>([]);

const favStore = useFavoritesStore();
const compareStore = useCompareStore();
const favCount = computed(() => favStore.items.length);
const compareCount = computed(() => compareStore.items.length);

// Search functionality
const searchQuery = ref("");

const handleCatalogClick = () => {
  if (window.innerWidth <= 768) {
    open.value = !open.value;
  } else {
    mobileMenuOpen.value = false;
  }
};

const navigateToSearchResults = () => {
  const query = searchQuery.value.trim();
  if (query.length >= 2) {
    router.push({
      path: "/catalog",
      query: { search: query },
    });
    searchQuery.value = "";
  }
};

// Закрытие меню при смене маршрута
watch(
  () => route.path,
  () => {
    mobileMenuOpen.value = false;
    open.value = false;
    searchQuery.value = "";
  },
);

// Блокировка скролла при открытом меню
watch(mobileMenuOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
});

onMounted(async () => {
  try {
    const res = await categoriesAPI.getAll(100);
    categories.value = res.data.results;
  } catch (e) {
    console.error("Ошибка загрузки категорий:", e);
  }
});
</script>

<!-- Styles in main.css -->
