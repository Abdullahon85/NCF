<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>🔐 Вход в админку</h1>
        <p>Введите данные для входа</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Логин</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="Введите логин"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <div class="password-input">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Введите пароль"
              required
              :disabled="loading"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? "👁️" : "👁️‍🗨️" }}
            </button>
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="loading">Вход...</span>
          <span v-else>Войти</span>
        </button>
      </form>

      <div class="login-footer">
        <router-link to="/" class="back-link">← Вернуться на сайт</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  username: "",
  password: "",
});

const showPassword = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);

async function handleLogin() {
  loading.value = true;
  error.value = null;

  const result = await authStore.login(form.username, form.password);

  loading.value = false;

  if (result.success) {
    router.push("/admin");
  } else {
    error.value = result.error || "Ошибка входа";
  }
}
</script>

<!-- Styles in main.css -->
