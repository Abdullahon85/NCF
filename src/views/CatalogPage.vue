//CatalogPage.vue
<template>
  <div class="catalog-page">
    <div class="container">
      <h1>Каталог товаров</h1>

      <!-- Если идёт поиск, показываем результаты поиска -->
      <div v-if="searchQuery" class="search-results">
        <h2>Результаты поиска: "{{ searchQuery }}"</h2>
        <p v-if="searchResults.length === 0" class="no-results">
          Товары не найдены
        </p>

        <div v-else class="products-grid">
          <ProductCard
            v-for="product in searchResults"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>

      <!-- Обычное отображение категорий -->
      <div v-else>
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
        </div>

        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-else-if="categories.length" class="categories-section">
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-block"
          >
            <div class="category-header">
              <h2>{{ category.name }}</h2>
              <router-link
                :to="`/catalog/${category.slug}`"
                class="view-category-link"
              >
                Все товары ({{ category.products_count }}) →
              </router-link>
            </div>

            <div v-if="category.children.length" class="subcategories-grid">
              <div
                v-for="subcat in category.children"
                :key="subcat.id"
                class="subcategory-card"
              >
                <router-link :to="`/catalog/${subcat.slug}`">
                  <div class="subcat-image" v-if="subcat.image">
                    <img :src="subcat.image" :alt="subcat.name" />
                  </div>
                  <div class="subcat-content">
                    <h3>{{ subcat.name }}</h3>
                    <span class="products-count"
                      >{{ subcat.products_count }} товаров</span
                    >
                  </div>
                </router-link>
              </div>
            </div>

            <div v-else class="no-subcategories">
              <router-link
                :to="`/catalog/${category.slug}`"
                class="category-main-link"
              >
                <div class="category-main-image" v-if="category.image">
                  <img :src="category.image" :alt="category.name" />
                </div>
                <div v-else class="placeholder-image">
                  <span>{{ category.name[0] }}</span>
                </div>
                <p>Перейти к товарам →</p>
              </router-link>
            </div>
          </div>
        </div>

        <div v-else class="empty-catalog">
          <p>Каталог пуст</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { categoriesAPI, productsAPI } from "@/api";
import type { Category, Product } from "@/types";
import ProductCard from "@/components/ProductCard.vue";

const route = useRoute();
const categories = ref<Category[]>([]);
const searchResults = ref<Product[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const searchQuery = computed(() => (route.query.search as string) || "");

// Загрузка категорий
const loadCategories = async () => {
  try {
    const response = await categoriesAPI.getAll();
    const payload =
      "results" in response.data ? response.data.results : response.data;
    categories.value = payload;
  } catch (err) {
    error.value = "Ошибка загрузки каталога";
    console.error(err);
  }
};

// Загрузка результатов поиска
const loadSearchResults = async (query: string) => {
  try {
    loading.value = true;
    const response = await productsAPI.search(query, { page_size: 100 });
    const payload =
      "results" in response.data ? response.data.results : response.data;
    searchResults.value = Array.isArray(payload) ? payload : [];
  } catch (err) {
    console.error("Ошибка поиска товаров:", err);
    searchResults.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    loading.value = true;
    await loadCategories();

    // Если есть поисковый запрос, загружаем результаты
    if (searchQuery.value) {
      await loadSearchResults(searchQuery.value);
    }
  } catch (err) {
    error.value = "Ошибка загрузки данных";
    console.error("Failed to load data:", err);
  } finally {
    loading.value = false;
  }
});

// Реактивное обновление при изменении поиска
watch(
  () => route.query.search,
  async (newSearch) => {
    if (newSearch) {
      await loadSearchResults(newSearch as string);
    } else {
      searchResults.value = [];
    }
    // Скролл вверх при новом поиске
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
);
</script>

<!-- Styles in main.css -->
