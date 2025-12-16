<template>
  <div
    class="product-card"
    role="link"
    tabindex="0"
    @click="goToProduct"
    @keydown.enter="goToProduct"
    @keydown.space.prevent="goToProduct"
  >
    <img
      v-if="props.product.main_image"
      :src="props.product.main_image.image"
      :alt="props.product.name"
      class="product-image"
    />
    <div class="product-info">
      <h4 class="product-name">{{ props.product.name }}</h4>
      <p v-if="props.product.price" class="product-price">
        {{ props.product.price }} сум
      </p>
      <p v-else class="product-price text-gray">Цена по запросу</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import type { PropType } from "vue";
import type { Product } from "@/types";

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
});

const router = useRouter();

const goToProduct = () => {
  const slug = props.product?.slug;
  if (!slug) return;
  router.push({ name: "ProductDetail", params: { slug } });
};
</script>

<!-- Styles in main.css -->
