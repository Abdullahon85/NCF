<template>
  <div
    class="product-card"
    role="link"
    tabindex="0"
    @click="goToProduct"
    @keydown.enter="goToProduct"
    @keydown.space.prevent="goToProduct"
  >
    <div class="product-image-wrapper">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="props.product.name"
        class="product-image"
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : 'auto'"
        decoding="async"
        @error="handleImageError"
      />
      <div v-else class="product-image-placeholder">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>

      <!-- Availability badge -->
      <div v-if="!props.product.is_available" class="badge out-of-stock">
        Нет в наличии
      </div>
    </div>

    <div class="product-info">
      <h4 class="product-name">{{ props.product.name }}</h4>

      <!-- Brand -->
      <p v-if="props.product.brand" class="product-brand">
        {{
          typeof props.product.brand === "object"
            ? props.product.brand.name
            : props.product.brand
        }}
      </p>

      <!-- Price -->
      <div class="product-footer">
        <p v-if="props.product.price" class="product-price">
          {{ formatPrice(props.product.price) }}
        </p>
        <p v-else class="product-price text-muted">По запросу</p>

        <button class="btn-view" @click.stop="goToProduct">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import type { PropType } from "vue";
import type { Product } from "@/types";
import { getImageUrl } from "@/api";

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
});

const router = useRouter();
const imageError = ref(false);

const imageUrl = computed(() => {
  if (imageError.value) return null;

  const mainImage = props.product.main_image;
  if (!mainImage) return null;

  const imgPath = typeof mainImage === "object" ? mainImage.image : mainImage;
  return getImageUrl(imgPath);
});

const handleImageError = () => {
  imageError.value = true;
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const goToProduct = () => {
  const slug = props.product?.slug;
  if (!slug) return;
  router.push({ name: "ProductDetail", params: { slug } });
};
</script>

<!-- Styles in main.css -->
