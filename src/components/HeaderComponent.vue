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
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { categoriesAPI } from "@/api";
import type { Category } from "@/types";

const route = useRoute();
const router = useRouter();
const mobileMenuOpen = ref(false);
const open = ref(false);
const categories = ref<Category[]>([]);

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
