<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>О компании</h3>
          <p>Краткое описание компании и её деятельности.</p>
        </div>

        <div class="footer-section">
          <h3>Навигация</h3>
          <ul>
            <li><router-link to="/catalog">Каталог</router-link></li>
            <li><router-link to="/news">Новости</router-link></li>
            <li><router-link to="/about">О нас</router-link></li>
            <li><router-link to="/contact">Контакты</router-link></li>
          </ul>
        </div>

        <div class="footer-section">
          <h3>Контакты</h3>
          <p v-if="contactInfo">
            {{ contactInfo.phone }}<br />
            {{ contactInfo.email }}<br />
            {{ contactInfo.address }}
          </p>
        </div>
        <div class="social__media__section">
          <h2 class="social__media">Социальные сети</h2>
          <div class="svg__media">
            <a href="https://t.me/LubidomuzCallcentre"
              ><img :src="er" alt="" class="svg__fit"
            /></a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} Company Name. Все права защищены.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { contactAPI } from "@/api";
import type { ContactInfo } from "@/types";
import er from "/public/instagram.svg";
const contactInfo = ref<ContactInfo | null>(null);
const currentYear = computed(() => new Date().getFullYear());

onMounted(async () => {
  try {
    const response = await contactAPI.getInfo();
    contactInfo.value = response.data;
  } catch (error) {
    console.error("Failed to load contact info:", error);
  }
});
</script>

<!-- Styles in main.css -->
