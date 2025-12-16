<template>
  <div class="management-page">
    <div class="page-header">
      <h1>📋 Управление характеристиками</h1>
      <div class="header-actions">
        <button
          @click="activeTab = 'features'"
          :class="['tab-btn', { active: activeTab === 'features' }]"
        >
          Характеристики
        </button>
        <button
          @click="activeTab = 'values'"
          :class="['tab-btn', { active: activeTab === 'values' }]"
        >
          Значения
        </button>
        <button @click="openCreateModal" class="btn btn-primary">
          ➕ Добавить
        </button>
      </div>
    </div>

    <div class="filters-bar">
      <input
        v-model="search"
        type="text"
        placeholder="🔍 Поиск..."
        class="search-input"
        @input="debouncedSearch"
      />
      <select
        v-model="categoryFilter"
        @change="loadItems"
        class="filter-select"
      >
        <option value="">Все категории</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
    </div>

    <!-- Features Table -->
    <div v-if="activeTab === 'features'" class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Категория</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in features" :key="item.id">
            <td>{{ item.id }}</td>
            <td class="name-cell">{{ item.name }}</td>
            <td>{{ item.category_name || "—" }}</td>
            <td>
              <div class="actions">
                <button @click="editFeature(item)" class="btn-icon">✏️</button>
                <button
                  @click="confirmDeleteFeature(item)"
                  class="btn-icon delete"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="features.length === 0">
            <td colspan="4" class="empty">Характеристики не найдены</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Values Table -->
    <div v-if="activeTab === 'values'" class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Значение</th>
            <th>Категория</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in featureValues" :key="item.id">
            <td>{{ item.id }}</td>
            <td class="name-cell">{{ item.value }}</td>
            <td>{{ item.category_name || "—" }}</td>
            <td>
              <div class="actions">
                <button @click="editValue(item)" class="btn-icon">✏️</button>
                <button
                  @click="confirmDeleteValue(item)"
                  class="btn-icon delete"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="featureValues.length === 0">
            <td colspan="4" class="empty">Значения не найдены</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Feature Modal -->
    <div
      v-if="showFeatureModal"
      class="modal-overlay"
      @click.self="showFeatureModal = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h2>
            {{ editingFeature ? "Редактировать" : "Новая характеристика" }}
          </h2>
          <button @click="showFeatureModal = false" class="close-btn">✕</button>
        </div>
        <form @submit.prevent="saveFeature" class="modal-body">
          <div class="form-group">
            <label>Название *</label>
            <input v-model="featureForm.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Категория</label>
            <select v-model="featureForm.category">
              <option :value="null">— Не выбрано —</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div v-if="error" class="error-msg">{{ error }}</div>
          <div class="modal-actions">
            <button
              type="button"
              @click="showFeatureModal = false"
              class="btn btn-secondary"
            >
              Отмена
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Value Modal -->
    <div
      v-if="showValueModal"
      class="modal-overlay"
      @click.self="showValueModal = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingValue ? "Редактировать" : "Новое значение" }}</h2>
          <button @click="showValueModal = false" class="close-btn">✕</button>
        </div>
        <form @submit.prevent="saveValue" class="modal-body">
          <div class="form-group">
            <label>Значение *</label>
            <input v-model="valueForm.value" type="text" required />
          </div>
          <div class="form-group">
            <label>Категория *</label>
            <select v-model="valueForm.category" required>
              <option :value="null" disabled>— Выберите —</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div v-if="error" class="error-msg">{{ error }}</div>
          <div class="modal-actions">
            <button
              type="button"
              @click="showValueModal = false"
              class="btn btn-secondary"
            >
              Отмена
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Modal -->
    <div
      v-if="showDeleteModal"
      class="modal-overlay"
      @click.self="showDeleteModal = false"
    >
      <div class="modal modal-sm">
        <div class="modal-header"><h2>Подтверждение</h2></div>
        <div class="modal-body">
          <p>
            Удалить
            <strong>{{ deletingItem?.name || deletingItem?.value }}</strong
            >?
          </p>
        </div>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn btn-secondary">
            Отмена
          </button>
          <button
            @click="performDelete"
            class="btn btn-danger"
            :disabled="deleting"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import {
  featuresAdminAPI,
  featureValuesAdminAPI,
  categoriesAdminAPI,
} from "@/api/admin";

const activeTab = ref<"features" | "values">("features");
const features = ref<any[]>([]);
const featureValues = ref<any[]>([]);
const categories = ref<any[]>([]);
const search = ref("");
const categoryFilter = ref("");
const saving = ref(false);
const error = ref("");

const showFeatureModal = ref(false);
const editingFeature = ref<any>(null);
const featureForm = reactive({ name: "", category: null as number | null });

const showValueModal = ref(false);
const editingValue = ref<any>(null);
const valueForm = reactive({ value: "", category: null as number | null });

const showDeleteModal = ref(false);
const deletingItem = ref<any>(null);
const deleteType = ref<"feature" | "value">("feature");
const deleting = ref(false);

let searchTimeout: number;
function debouncedSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(loadItems, 300);
}

async function loadItems() {
  const params: any = {};
  if (search.value) params.search = search.value;
  if (categoryFilter.value) params.category = categoryFilter.value;

  try {
    const [featuresRes, valuesRes] = await Promise.all([
      featuresAdminAPI.getAll(params),
      featureValuesAdminAPI.getAll(params),
    ]);
    features.value = featuresRes.data.results || featuresRes.data;
    featureValues.value = valuesRes.data.results || valuesRes.data;
  } catch (e) {
    console.error(e);
  }
}

async function loadCategories() {
  try {
    const res = await categoriesAdminAPI.getAll();
    categories.value = res.data.results || res.data;
  } catch (e) {
    console.error(e);
  }
}

function openCreateModal() {
  error.value = "";
  if (activeTab.value === "features") {
    editingFeature.value = null;
    featureForm.name = "";
    featureForm.category = null;
    showFeatureModal.value = true;
  } else {
    editingValue.value = null;
    valueForm.value = "";
    valueForm.category = null;
    showValueModal.value = true;
  }
}

function editFeature(item: any) {
  editingFeature.value = item;
  featureForm.name = item.name;
  featureForm.category = item.category;
  error.value = "";
  showFeatureModal.value = true;
}

function editValue(item: any) {
  editingValue.value = item;
  valueForm.value = item.value;
  valueForm.category = item.category;
  error.value = "";
  showValueModal.value = true;
}

async function saveFeature() {
  try {
    saving.value = true;
    error.value = "";
    if (editingFeature.value)
      await featuresAdminAPI.update(editingFeature.value.id, featureForm);
    else await featuresAdminAPI.create(featureForm);
    showFeatureModal.value = false;
    loadItems();
  } catch (e: any) {
    error.value = e.response?.data?.detail || "Ошибка";
  } finally {
    saving.value = false;
  }
}

async function saveValue() {
  try {
    saving.value = true;
    error.value = "";
    if (editingValue.value)
      await featureValuesAdminAPI.update(editingValue.value.id, valueForm);
    else await featureValuesAdminAPI.create(valueForm);
    showValueModal.value = false;
    loadItems();
  } catch (e: any) {
    error.value = e.response?.data?.detail || "Ошибка";
  } finally {
    saving.value = false;
  }
}

function confirmDeleteFeature(item: any) {
  deletingItem.value = item;
  deleteType.value = "feature";
  showDeleteModal.value = true;
}
function confirmDeleteValue(item: any) {
  deletingItem.value = item;
  deleteType.value = "value";
  showDeleteModal.value = true;
}

async function performDelete() {
  try {
    deleting.value = true;
    if (deleteType.value === "feature")
      await featuresAdminAPI.delete(deletingItem.value.id);
    else await featureValuesAdminAPI.delete(deletingItem.value.id);
    showDeleteModal.value = false;
    loadItems();
  } catch (e) {
    alert("Ошибка удаления");
  } finally {
    deleting.value = false;
  }
}

watch(activeTab, loadItems);
onMounted(() => {
  loadItems();
  loadCategories();
});
</script>

<!-- Styles in main.css -->
