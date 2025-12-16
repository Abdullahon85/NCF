// ======================================== // src/components/ProductGrid.vue //
========================================
<template>
  <div class="products-grid">
    <div
      v-for="product in products"
      :key="product.slug || product.id"
      class="product-card"
    >
      <router-link :to="`/product/${product.slug}`" class="product-link">
        <div class="product-images">
          <img
            v-if="product.main_image?.image"
            :src="getImageUrl(product.main_image.image)"
            :alt="product.name"
            loading="lazy"
          />
          <div v-else class="no-image">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
        </div>

        <div class="product-content">
          <h3 class="product-title">{{ product.name }}</h3>

          <div class="product-meta">
            <div class="price" v-if="product.price">
              {{ formatPrice(Number(product.price)) }} ₽
            </div>
            <div
              class="sku"
              v-if="product.internal_sku || product.manufacturer_sku"
            >
              {{ formatSKU(product) }}
            </div>
          </div>

          <div class="product-status" v-if="!product.is_available">
            <span class="badge out-of-stock">Нет в наличии</span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from "@/types";

interface Props {
  products: Product[];
}

defineProps<Props>();

const getImageUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${import.meta.env.VITE_API_URL}${path}`;
};
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("ru-RU").format(price);
};

const formatSKU = (product: Product): string => {
  return [product.manufacturer_sku, product.internal_sku]
    .filter(Boolean)
    .join("-");
};
</script>

<!-- Styles in main.css -->
