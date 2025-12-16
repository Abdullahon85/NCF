<!-- views/ProductDetailPage.vue -->
<template>
  <div class="product-detail-page">
    <div class="container">
      <nav class="breadcrumb">
        <router-link to="/">Главная</router-link>
        <span>/</span>
        <router-link to="/catalog">Каталог</router-link>
        <span v-if="product?.category">/</span>
        <router-link
          v-if="product?.category"
          :to="`/catalog/${(product?.category as any)?.slug}`"
        >
          {{ (product?.category as any)?.name }}
        </router-link>
        <span v-if="product?.category">/</span>
        <span>{{ product?.name || "Загрузка..." }}</span>
      </nav>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
        <div>
          <router-link to="/catalog" class="back-link">
            ← Вернуться в каталог
          </router-link>
        </div>
      </div>

      <div v-else-if="product" class="product-content">
        <div class="product-images">
          <ImageGalleryComponent :images="product.images" :alt="product.name" />
        </div>

        <div class="product-info">
          <h1>{{ product.name }}</h1>

          <div class="availability">
            <span v-if="product.is_available" class="in-stock">
              ✓ В наличии
            </span>
            <span v-else class="out-of-stock"> ✗ Нет в наличии </span>
            <div v-if="product?.brand" class="product-brand">
              <small>Бренд</small>
              <div class="brand-row">
                <router-link
                  v-if="(product?.brand as any)?.slug"
                  :to="`/brands/${(product?.brand as any).slug}`"
                  class="brand-link"
                >
                  {{ (product?.brand as any).name || (product?.brand as any) }}
                </router-link>

                <span v-else class="brand-text">
                  {{ (product?.brand as any).name || product?.brand }}
                </span>
              </div>
            </div>
          </div>
          <div
            class="sku-block"
            v-if="product.manufacturer_sku || product.internal_sku"
          >
            <div v-if="product.manufacturer_sku" class="sku-row">
              <small>Артикул производителя</small>
              <div class="sku-value">
                <strong
                  >{{ product.manufacturer_sku }}-{{
                    product.internal_sku
                  }}</strong
                >
                <button
                  @click="
                    copySku(
                      `${product.manufacturer_sku}-${product.internal_sku}`
                    )
                  "
                  class="copy-btn"
                  title="Копировать"
                >
                  Коп
                </button>
              </div>
            </div>
          </div>
          <div v-if="product.price" class="price">
            {{ formatPrice(product.price) }} ₽
          </div>

          <div class="description">
            <h2>Описание</h2>
            <div v-html="formatContent(product.description || '')"></div>
          </div>

          <div
            v-if="product.features && product.features.length"
            class="features"
          >
            <h2>Характеристики</h2>
            <table>
              <tbody>
                <tr v-for="feature in product.features" :key="feature.id">
                  <td class="feature-name">{{ feature.feature_name }}</td>
                  <td class="feature-value">
                    <router-link
                      :to="{
                        path: '/feature-products',
                        query: { value: feature.value_name },
                      }"
                    >
                      {{ feature.value_name }}
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="actions">
            <button
              v-if="product.is_available"
              class="btn-primary"
              @click="showContactModal = true"
            >
              Заказать
            </button>
            <router-link
              :to="`/catalog/${(product?.category as any)?.slug}`"
              class="btn-secondary"
            >
              Вернуться в категорию
            </router-link>
          </div>
        </div>
      </div>

      <!-- Contact Modal -->
      <div v-if="showContactModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <h2>Оформить заказ</h2>
          <p>Для заказа товара "{{ product?.name }}" свяжитесь с нами:</p>
          <div v-if="contactInfo" class="contact-info">
            <p>
              <strong>Телефон:</strong>
              <a :href="`tel:${contactInfo.phone}`">{{ contactInfo.phone }}</a>
            </p>
            <p>
              <strong>Email:</strong>
              <a :href="`mailto:${contactInfo.email}`">{{
                contactInfo.email
              }}</a>
            </p>
          </div>
          <div class="modal-actions">
            <button @click="closeModal" class="btn-close">Закрыть</button>
          </div>
        </div>
      </div>
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
    await (navigator as any).clipboard.writeText(String(sku));
    // необязательно: краткое визуальное подтверждение в консоль
    console.log("Copied SKU:", sku);
  } catch (err) {
    console.error("Copy failed", err);
  }
};
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ru-RU").format(price);
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
