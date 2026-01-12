<template>
  <div class="home-page">
    <!-- Banner Slider -->
    <section class="hero-banner">
      <div class="banner-container">
        <BannerSlider
          :banners="banners"
          :loading="bannersLoading"
          :autoplay-interval="5000"
        />
      </div>
    </section>

    <section class="featured-categories">
      <div class="categories-container">
        <h2 class="categories-title">Каталог товаров</h2>

        <!-- Skeleton при загрузке -->
        <div v-if="loading" class="categories-grid">
          <div v-for="n in 6" :key="n" class="category-skeleton skeleton">
            <div class="skeleton-image"></div>
            <div class="skeleton-text"></div>
          </div>
        </div>

        <div v-else-if="categories.length" class="categories-grid">
          <CategoryCardComponent
            v-for="category in categories"
            :key="category.id"
            :category="category"
          />
        </div>
      </div>
    </section>

    <section class="featured-brands" v-if="!loading && brands.length">
      <div class="brands-container">
        <h2 class="brands-title">Наши партнёрские бренды</h2>

        <div class="brands-grid">
          <BrandsSlider :brands="brands" />
        </div>

        <div class="brands-footer">
          <router-link to="/brands" class="brands-link">
            Смотреть все бренды
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
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
import { categoriesAPI, brandsAPI, bannersAPI } from "@/api";
import CategoryCardComponent from "@/components/CategoryCardComponent.vue";
import BrandsSlider from "@/components/BrandsSlider.vue";
import BannerSlider from "@/components/BannerSlider.vue";
import type { Category, Brand, Banner } from "@/types";

const categories = ref<Category[]>([]);
const brands = ref<Brand[]>([]);
const banners = ref<Banner[]>([]);
const loading = ref(true);
const bannersLoading = ref(true);

// Простой кэш в sessionStorage
const cache = {
  get(key: string) {
    try {
      const item = sessionStorage.getItem(key);
      if (!item) return null;
      const { data, expiry } = JSON.parse(item);
      if (Date.now() > expiry) {
        sessionStorage.removeItem(key);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },
  set(key: string, data: any, ttl = 300) {
    try {
      sessionStorage.setItem(
        key,
        JSON.stringify({ data, expiry: Date.now() + ttl })
      );
    } catch {}
  },
};

onMounted(async () => {
  // Загружаем баннеры отдельно для быстрого отображения
  bannersAPI
    .getAll()
    .then((res) => {
      banners.value = res.data;
      bannersLoading.value = false;
    })
    .catch(() => {
      bannersLoading.value = false;
    });

  // Проверяем кэш
  const cachedCategories = cache.get("home_categories");
  const cachedBrands = cache.get("home_brands");

  if (cachedCategories && cachedBrands) {
    categories.value = cachedCategories;
    brands.value = cachedBrands;
    loading.value = false;
    return;
  }

  try {
    const [categoriesResponse, brandsResponse] = await Promise.all([
      categoriesAPI.getAll(),
      brandsAPI.getAll(),
    ]);

    categories.value = categoriesResponse.data.results;
    brands.value = brandsResponse.data.results;

    // Сохраняем в кэш на 5 минут
    cache.set("home_categories", categories.value);
    cache.set("home_brands", brands.value);
  } catch (error) {
    console.error("Failed to load home page data:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.hero-banner {
  padding: 0;
  margin-bottom: 32px;
}

.banner-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (max-width: 768px) {
  .hero-banner {
    margin-bottom: 24px;
  }

  .banner-container {
    padding: 0 12px;
  }
}

.category-skeleton {
  background: var(--gray-100);
  border-radius: 12px;
  padding: 16px;
  min-height: 200px;
}

.skeleton-image {
  width: 100%;
  height: 120px;
  background: var(--gray-200);
  border-radius: 8px;
  margin-bottom: 12px;
}

.skeleton-text {
  height: 20px;
  background: var(--gray-200);
  border-radius: 4px;
  width: 70%;
}
</style>
