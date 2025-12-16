<!-- src/views/AllBrandsPage.vue -->
<template>
  <div class="page-layout container">
    <aside class="filters-column">
      <div class="panel">
        <h3>Фильтры</h3>

        <!-- Поиск по брендам -->
        <div class="search-field">
          <input
            type="text"
            v-model="filters.search"
            @keyup.enter="applyFilters"
            placeholder="Поиск брендов..."
          />
          <button @click="applyFilters" class="btn-search">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        <!-- Фильтр по категориям -->
        <div class="filter-group" v-if="categories.length > 0">
          <label>Категории</label>
          <div class="categories-list">
            <label
              v-for="category in categories"
              :key="category.slug"
              class="category-item"
            >
              <input
                type="checkbox"
                :value="category.slug"
                v-model="filters.categories"
                @change="applyFilters"
              />
              <span>{{ category.name }}</span>
            </label>
          </div>
        </div>

        <!-- Фильтр по наличию товаров -->
        <div class="filter-group">
          <label class="toggle-label">
            <input
              type="checkbox"
              v-model="filters.hasProducts"
              @change="applyFilters"
            />
            <span>Только с товарами</span>
          </label>
        </div>

        <!-- Действия с фильтрами -->
        <div class="filter-actions">
          <button @click="resetFilters" class="btn muted">
            Сбросить фильтры
          </button>
        </div>
      </div>
    </aside>

    <main class="content-column">
      <!-- Панель управления -->
      <div class="topbar">
        <div class="sort">
          <label>Сортировать:</label>
          <select v-model="filters.ordering" @change="applyFilters">
            <option value="name">По названию (А-Я)</option>
            <option value="-name">По названию (Я-А)</option>
            <option value="-products_count">Больше товаров</option>
            <option value="products_count">Меньше товаров</option>
          </select>
        </div>
        <div class="results-info" v-if="!loading">
          Найдено брендов: {{ pagination.total }}
        </div>
      </div>

      <!-- Контент -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Загрузка брендов...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="loadBrands" class="btn primary">Повторить</button>
      </div>

      <div v-else-if="brands.length === 0" class="empty-state">
        <p>Бренды не найдены</p>
        <button @click="resetFilters" class="btn muted">
          Сбросить фильтры
        </button>
      </div>

      <div v-else class="brands-grid">
        <BrandCard v-for="brand in brands" :key="brand.slug" :brand="brand" />

        <Pagination
          v-if="pagination.totalPages > 1"
          :current-page="pagination.page"
          :total-pages="pagination.totalPages"
          @change="changePage"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { brandsAPI, categoriesAPI } from "@/api";
import type { Brand, Category } from "@/types";
import BrandCard from "@/components/BrandCard.vue";
import Pagination from "@/components/Pagination.vue";

const brands = ref<Brand[]>([]);
const categories = ref<Category[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const filters = reactive({
  search: "",
  categories: [] as string[],
  hasProducts: false,
  ordering: "name" as string,
});

const pagination = reactive({
  page: 1,
  pageSize: 12,
  totalPages: 1,
  total: 0,
});

// Построение параметров API
const buildApiParams = () => {
  const params: Record<string, any> = {
    page: pagination.page,
    page_size: pagination.pageSize,
    ordering: filters.ordering,
  };

  if (filters.search) {
    params.search = filters.search.trim();
  }

  if (filters.categories.length > 0) {
    params.category = filters.categories.join(",");
  }

  if (filters.hasProducts) {
    params.has_products = "true";
  }

  return params;
};

// Загрузка данных
const loadBrands = async () => {
  loading.value = true;
  error.value = null;

  try {
    const params = buildApiParams();
    const response = await brandsAPI.getAll(params);
    const data = response.data || {};

    brands.value = data.results || [];
    pagination.total = Number(data.count ?? 0);
    pagination.totalPages = Math.max(
      1,
      Math.ceil(pagination.total / pagination.pageSize)
    );
  } catch (err) {
    console.error("Ошибка загрузки брендов:", err);
    error.value = "Не удалось загрузить бренды. Попробуйте позже.";
    brands.value = [];
  } finally {
    loading.value = false;
  }
};

const loadCategories = async () => {
  try {
    const response = await categoriesAPI.getAll();
    categories.value = response.data.results || [];
  } catch (err) {
    console.error("Ошибка загрузки категорий:", err);
  }
};

// Обработчики событий
const applyFilters = () => {
  pagination.page = 1;
  loadBrands();
};

const resetFilters = () => {
  filters.search = "";
  filters.categories = [];
  filters.hasProducts = false;
  filters.ordering = "name";
  applyFilters();
};

const changePage = (page: number) => {
  if (page < 1 || page > pagination.totalPages) return;
  pagination.page = page;
  loadBrands();
};

// Инициализация
onMounted(async () => {
  await Promise.all([loadCategories(), loadBrands()]);
});
</script>

<!-- Styles in main.css -->
