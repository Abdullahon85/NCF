<template>
  <div class="home-page">
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="container">
        <router-link to="/catalog" class="cta-button"
          ><img :src="p" alt=""
        /></router-link>
      </div>
    </section>

    <section class="featured-categories" v-if="categories.length">
      <div class="categories-container">
        <h2 class="categories-title">Каталог товаров</h2>

        <div class="categories-grid">
          <CategoryCardComponent
            v-for="category in categories"
            :key="category.id"
            :category="category"
          />
        </div>

        <!-- <div class="categories-footer">
          <router-link to="/catalog" class="categories-link">
            Все категории →
          </router-link>
        </div> -->
      </div>
    </section>

    <section class="featured-brands" v-if="brands.length">
      <div class="brands-container">
        <h2 class="brands-title">Наши партнёрские бренды</h2>

        <div class="brands-grid">
          <BrandsSlider :brands="brands" />
        </div>

        <div class="brands-footer">
          <router-link to="/brands" class="brands-link">
            Смотреть все бренды →
          </router-link>
        </div>
      </div>
    </section>

    <!-- <section class="latest-news" v-if="news.length">
      <div class="container">
        <h2>Последние новости</h2>
        <div class="news-grid">
          <NewsCardComponent 
            v-for="item in news" 
            :key="item.id"
            :news-item="item"
          />
        </div>
        <div class="text-center">
          <router-link to="/news" class="view-all-link">
            Все новости →
          </router-link>
        </div>
      </div>
    </section> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { categoriesAPI, newsAPI, brandsAPI } from "@/api";
import CategoryCardComponent from "@/components/CategoryCardComponent.vue";
// import NewsCardComponent from '@/components/NewsCardComponent.vue';
import BrandsSlider from "@/components/BrandsSlider.vue";
import type { Category, NewsItem, Brand } from "@/types";
import p from "/public/обои.png";
const categories = ref<Category[]>([]);
const news = ref<NewsItem[]>([]);
const brands = ref<Brand[]>([]);

onMounted(async () => {
  try {
    const [categoriesResponse, newsResponse, brandsResponse] =
      await Promise.all([
        categoriesAPI.getAll(),
        newsAPI.getAll(3),
        brandsAPI.getAll(),
      ]);

    categories.value = categoriesResponse.data.results;
    news.value = newsResponse.data.results;
    brands.value = brandsResponse.data.results;
  } catch (error) {
    console.error("Failed to load home page data:", error);
  }
});
</script>
