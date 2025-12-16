<template>
  <div class="clients-section">
    <div class="container">
      <div class="slider-wrapper" @mouseenter="pause" @mouseleave="resume">
        <button class="nav-btn left" @click="prev">‹</button>

        <div class="clients-track" :style="trackStyle">
          <div
            v-for="(brand, index) in loopedBrands"
            :key="index"
            class="client-logo"
          >
            <router-link :to="`/brands/${brand.slug}`">
              <template v-if="brand.image">
                <img :src="getImageUrl(brand.image)" :alt="brand.name" />
              </template>
              <template v-else>
                <div class="brand-placeholder">
                  {{ brand.name ? brand.name.charAt(0).toUpperCase() : "?" }}
                </div>
              </template>
            </router-link>
          </div>
        </div>

        <button class="nav-btn right" @click="next">›</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { Brand } from "@/types";
import { getImageUrl } from "@/api";

const props = defineProps<{ brands: Brand[] }>();

// дублируем чтобы было бесконечно
const loopedBrands = computed(() => [...props.brands, ...props.brands]);

const current = ref(0);
const visible = 6; // сколько логотипов видно
const autoplaySpeed = 2000; // 2 сек
let interval: any = null;

// стиль смещения
const trackStyle = computed(() => ({
  transform: `translateX(-${current.value * (100 / visible)}%)`,
  transition: "transform 0.4s ease",
}));

function next() {
  current.value++;
  if (current.value >= props.brands.length) {
    // быстрый ресет без анимации
    current.value = 0;
  }
}

function prev() {
  current.value--;
  if (current.value < 0) {
    current.value = props.brands.length - 1;
  }
}

function startAutoplay() {
  interval = setInterval(next, autoplaySpeed);
}

function pause() {
  clearInterval(interval);
}

function resume() {
  startAutoplay();
}

// автозапуск
onMounted(() => {
  startAutoplay();
});

onUnmounted(() => clearInterval(interval));
</script>

<!-- Styles in main.css -->
