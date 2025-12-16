<template>
  <header class="header">
    <div class="container">
      <nav class="navbar">
        <router-link to="/" class="logo">
          <span>Future Stars</span>
        </router-link>

        <button
          class="mobile-menu-toggle"
          @click="mobileMenuOpen = !mobileMenuOpen"
          :aria-expanded="mobileMenuOpen"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul class="nav-menu" :class="{ active: mobileMenuOpen }">
          <li><router-link to="/">Главная</router-link></li>

          <!-- CATALOG WITH DROPDOWN -->
          <li
            class="catalog-menu"
            @mouseenter="open = true"
            @mouseleave="open = false"
          >
            <router-link to="/catalog">Каталог</router-link>

            <ul v-if="open" class="dropdown">
              <li v-for="cat in categories" :key="cat.id">
                <router-link :to="`/catalog/${cat.slug}`">
                  {{ cat.name }}
                </router-link>
              </li>
            </ul>
          </li>

          <li><router-link to="/about">О нас</router-link></li>
          <li><router-link to="/contact">Контакты</router-link></li>
          <li><router-link to="/admin">Админка</router-link></li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { categoriesAPI } from "@/api";
import type { Category } from "@/types";

const mobileMenuOpen = ref(false);
const open = ref(false);
const categories = ref<Category[]>([]);

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
