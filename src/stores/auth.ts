// src/stores/auth.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authAPI } from "@/api/admin";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string;
}

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  // Getters
  const isAuthenticated = computed(() => !!user.value);
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
      const response = await authAPI.getMe();
      user.value = response.data;
    } catch (e) {
      user.value = null;
    } finally {
      loading.value = false;
      initialized.value = true;
    }
  }

  async function login(username: string, password: string) {
    try {
      loading.value = true;
      error.value = null;

      const response = await authAPI.login(username, password);
      user.value = response.data.user;

      return { success: true };
    } catch (e: any) {
      const message = e.response?.data?.error || "Ошибка входа";
      error.value = message;
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
    }
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    try {
      loading.value = true;
      error.value = null;

      await authAPI.changePassword(oldPassword, newPassword);

      return { success: true };
    } catch (e: any) {
      const message =
        e.response?.data?.error ||
        e.response?.data?.new_password?.[0] ||
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
      const response = await authAPI.getMe();
      user.value = response.data;
    } catch (e) {
      user.value = null;
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
