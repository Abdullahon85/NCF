<template>
  <header class="header">
    <div class="container">
      <nav class="navbar">
        <router-link to="/" class="logo" @click="mobileMenuOpen = false">
          <span>Future Stars</span>
        </router-link>

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
          <li>
            <router-link to="/admin" @click="mobileMenuOpen = false"
              >Админка</router-link
            >
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { categoriesAPI } from "@/api";
import type { Category } from "@/types";

const route = useRoute();
const mobileMenuOpen = ref(false);
const open = ref(false);
const categories = ref<Category[]>([]);

const handleCatalogClick = () => {
  if (window.innerWidth <= 768) {
    open.value = !open.value;
  } else {
    mobileMenuOpen.value = false;
  }
};

// Закрытие меню при смене маршрута
watch(
  () => route.path,
  () => {
    mobileMenuOpen.value = false;
    open.value = false;
  }
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
