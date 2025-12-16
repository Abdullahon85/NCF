<template>
  <div class="gallery">
    <div class="gallery-main">
      <transition name="fade">
        <img
          v-if="selectedImageUrl"
          :src="selectedImageUrl"
          :alt="alt"
          class="gallery-main__image"
          key="selected"
        />
        <div v-else class="gallery-placeholder" key="placeholder">
          <span>Нет изображения</span>
        </div>
      </transition>
    </div>

    <div v-if="images && images.length > 1" class="gallery-thumbs">
      <div
        v-for="image in sortedImages"
        :key="image.id"
        class="gallery-thumb"
        :class="{ active: selectedImageUrl === image.image }"
        @click="selectImage(image.image)"
      >
        <img
          :src="image.image"
          :alt="`${alt} - превью ${image.order || image.id}`"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import type { Image } from "@/types";

interface Props {
  images?: Image[];
  alt: string;
}

const props = defineProps<Props>();
const selectedImageUrl = ref<string>("");

const sortedImages = computed(() => {
  if (!props.images) return [];
  return [...props.images].sort((a, b) => {
    if (a.is_main && !b.is_main) return -1;
    if (!a.is_main && b.is_main) return 1;
    return (a.order || 0) - (b.order || 0);
  });
});

const selectImage = (url: string) => {
  selectedImageUrl.value = url;
};

const initializeImage = () => {
  const imgs = props.images || [];
  const main = imgs.find((img) => img.is_main);
  const first = sortedImages.value[0];
  selectedImageUrl.value = main?.image || first?.image || "";
};

onMounted(initializeImage);
watch(() => props.images, initializeImage, { deep: true });
</script>

<!-- Styles in main.css -->
