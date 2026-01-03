// src/stores/auth.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authAPI, tokenStorage } from "@/api/admin";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined?: string;
  last_login?: string;
}

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  // Getters
  const isAuthenticated = computed(
    () => authAPI.checkSession() && !!user.value
  );
  const isAdmin = computed(
    () => user.value?.is_staff || user.value?.is_superuser
  );
  const fullName = computed(() => {
    if (!user.value) return "";
    const parts = [user.value.first_name, user.value.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : user.value.username;
  });

  // Actions
  async function init() {
    if (initialized.value) return;

    try {
      loading.value = true;

      // Проверка наличия и валидности токена
      if (!authAPI.checkSession()) {
        user.value = null;
        initialized.value = true;
        return;
      }

      const response = await authAPI.getMe();
      user.value = response.data;
    } catch (e) {
      user.value = null;
      tokenStorage.clearTokens();
    } finally {
      loading.value = false;
      initialized.value = true;
    }
  }

  async function login(username: string, password: string) {
    try {
      loading.value = true;
      error.value = null;

      await authAPI.login(username, password);

      // После успешного логина получаем данные пользователя
      const meResponse = await authAPI.getMe();
      user.value = meResponse.data;

      return { success: true };
    } catch (e: any) {
      const message =
        e.response?.data?.detail ||
        e.response?.data?.error ||
        e.message ||
        "Ошибка входа";
      error.value = message;
      tokenStorage.clearTokens();
      return { success: false, error: message };
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await authAPI.logout();
    } catch (e) {
      // Ignore errors
    } finally {
      user.value = null;
      tokenStorage.clearTokens();
    }
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    try {
      loading.value = true;
      error.value = null;

      console.log("🔐 Attempting to change password...");
      console.log("Token exists:", !!tokenStorage.getToken());

      await authAPI.changePassword(oldPassword, newPassword);

      console.log("✅ Password changed successfully");
      return { success: true };
    } catch (e: any) {
      console.error("❌ Password change error:", e);
      console.error("Error response:", e.response?.data);
      console.error("Error status:", e.response?.status);

      const message =
        e.response?.data?.error ||
        e.response?.data?.new_password?.[0] ||
        e.response?.data?.detail ||
        e.message ||
        "Ошибка смены пароля";
      error.value = message;
      return { success: false, error: message };
    } finally {
      loading.value = false;
    }
  }

  async function updateProfile(data: {
    email?: string;
    first_name?: string;
    last_name?: string;
  }) {
    try {
      loading.value = true;
      error.value = null;

      const response = await authAPI.updateProfile(data);
      user.value = response.data;

      return { success: true };
    } catch (e: any) {
      const message = e.response?.data?.error || "Ошибка обновления профиля";
      error.value = message;
      return { success: false, error: message };
    } finally {
      loading.value = false;
    }
  }

  async function refreshUser() {
    try {
      if (!authAPI.checkSession()) {
        user.value = null;
        return;
      }

      const response = await authAPI.getMe();
      user.value = response.data;
    } catch (e) {
      user.value = null;
      tokenStorage.clearTokens();
    }
  }

  return {
    // State
    user,
    loading,
    error,
    initialized,
    // Getters
    isAuthenticated,
    isAdmin,
    fullName,
    // Actions
    init,
    login,
    logout,
    changePassword,
    updateProfile,
    refreshUser,
  };
});
