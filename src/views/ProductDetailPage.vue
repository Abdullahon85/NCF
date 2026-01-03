<!-- ProductDetailPage.vue - Redesigned -->
<template>
  <div class="product-detail-page">
    <div class="container">
      <!-- Breadcrumb -->
      <nav class="breadcrumb" v-if="product">
        <router-link to="/" class="breadcrumb-item">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          Главная
        </router-link>
        <span class="breadcrumb-separator">›</span>
        <router-link to="/catalog" class="breadcrumb-item">Каталог</router-link>
        <span v-if="product.category" class="breadcrumb-separator">›</span>
        <router-link
          v-if="product.category"
          :to="`/catalog/${(product.category as any)?.slug}`"
          class="breadcrumb-item"
        >
          {{ (product.category as any)?.name }}
        </router-link>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">{{ product.name }}</span>
      </nav>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Загрузка товара...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3>{{ error }}</h3>
        <router-link to="/catalog" class="btn btn-primary">
          Вернуться в каталог
        </router-link>
      </div>

      <!-- Product Content -->
      <div v-else-if="product" class="product-layout">
        <!-- Image Gallery -->
        <div class="product-gallery-section">
          <ImageGalleryComponent :images="product.images" :alt="product.name" />

          <!-- Availability Badge -->
          <div
            class="availability-badge"
            :class="{ 'in-stock': product.is_available }"
          >
            <svg
              v-if="product.is_available"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <svg
              v-else
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {{ product.is_available ? "В наличии" : "Нет в наличии" }}
          </div>
        </div>

        <!-- Product Info -->
        <div class="product-info-section">
          <div class="product-header">
            <h1 class="product-title">{{ product.name }}</h1>

            <!-- Brand & SKU Row -->
            <div class="product-meta-row">
              <div v-if="product.brand" class="brand-info">
                <span class="meta-label">Бренд:</span>
                <router-link
                  v-if="(product.brand as any)?.slug"
                  :to="`/brands/${(product.brand as any).slug}`"
                  class="brand-link"
                >
                  {{ (product.brand as any).name || (product.brand as any) }}
                </router-link>
                <span v-else class="brand-text">
                  {{ (product.brand as any).name || product.brand }}
                </span>
              </div>

              <div
                v-if="product.manufacturer_sku || product.internal_sku"
                class="sku-info"
              >
                <span class="meta-label">Артикул:</span>
                <div class="sku-value">
                  <code>{{
                    product.manufacturer_sku || product.internal_sku
                  }}</code>
                  <button
                    @click="
                      copySku(product.manufacturer_sku || product.internal_sku)
                    "
                    class="copy-btn"
                    title="Копировать артикул"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path
                        d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Price -->
          <div v-if="product.price" class="price-section">
            <span class="price-label">Цена:</span>
            <div class="price-value">{{ formatPrice(product.price) }}</div>
          </div>
          <div v-else class="price-section">
            <span class="price-on-request">Цена по запросу</span>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button
              v-if="product.is_available"
              class="btn btn-primary btn-large"
              @click="showContactModal = true"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Заказать товар
            </button>
            <button v-else class="btn btn-secondary btn-large" disabled>
              Товар недоступен
            </button>

            <button class="btn btn-outline">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                />
              </svg>
              Связаться с нами
            </button>
          </div>

          <!-- Description -->
          <div v-if="product.description" class="description-section">
            <h2 class="section-title">Описание</h2>
            <div
              class="description-content"
              v-html="formatContent(product.description)"
            ></div>
          </div>

          <!-- Features -->
          <div
            v-if="product.features && product.features.length"
            class="features-section"
          >
            <h2 class="section-title">Характеристики</h2>
            <div class="features-grid">
              <div
                v-for="feature in product.features"
                :key="feature.id"
                class="feature-item"
              >
                <span class="feature-name">{{ feature.feature_name }}</span>
                <router-link
                  :to="{
                    path: '/feature-products',
                    query: { value: feature.value_name },
                  }"
                  class="feature-value"
                >
                  {{ feature.value_name }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Modal -->
      <transition name="modal">
        <div v-if="showContactModal" class="modal-overlay" @click="closeModal">
          <div class="modal-content" @click.stop>
            <button @click="closeModal" class="modal-close">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h2 class="modal-title">Оформить заказ</h2>
            <p class="modal-subtitle">
              Товар: <strong>{{ product?.name }}</strong>
            </p>

            <div v-if="contactInfo" class="contact-details">
              <div class="contact-item">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                  />
                </svg>
                <div>
                  <span class="contact-label">Телефон</span>
                  <a :href="`tel:${contactInfo.phone}`" class="contact-value">{{
                    contactInfo.phone
                  }}</a>
                </div>
              </div>

              <div class="contact-item">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                  />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <div>
                  <span class="contact-label">Email</span>
                  <a
                    :href="`mailto:${contactInfo.email}`"
                    class="contact-value"
                    >{{ contactInfo.email }}</a
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { productsAPI, contactAPI } from "@/api";
import ImageGalleryComponent from "@/components/ImageGalleryComponent.vue";
import type { Product, ContactInfo } from "@/types";

const route = useRoute();

const product = ref<Product | null>(null);
const contactInfo = ref<ContactInfo | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const showContactModal = ref(false);

const copySku = async (sku: string | number | undefined) => {
  if (!sku) return;
  try {
    await navigator.clipboard.writeText(String(sku));
    // Visual feedback could be added here
    console.log("Copied SKU:", sku);
  } catch (err) {
    console.error("Copy failed", err);
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const formatContent = (content: string) => {
  if (!content) return "";
  return content.replace(/\n/g, "<br>");
};

const closeModal = () => {
  showContactModal.value = false;
};

const loadContactInfo = async () => {
  try {
    const response = await contactAPI.getInfo();
    contactInfo.value = response.data;
  } catch (err) {
    console.error("Failed to load contact info:", err);
  }
};

const loadProduct = async () => {
  const slug = route.params.slug as string;

  if (!slug) {
    error.value = "Товар не найден";
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = null;

    const response = await productsAPI.getBySlug(slug);
    product.value = response.data;
  } catch (err: any) {
    if (err.response?.status === 404) {
      error.value = "Товар не найден";
    } else {
      error.value = "Ошибка загрузки товара";
    }
    console.error("Failed to load product:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await Promise.all([loadProduct(), loadContactInfo()]);
});
/* --- brand helpers --- */
/* product.brand может быть объектом Brand, строкой или id */
</script>
