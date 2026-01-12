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
        @change="onCategoryFilterChange"
        class="filter-select"
      >
        <option value="">Все категории</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
      <!-- Фильтр по характеристике для вкладки значений -->
      <select
        v-if="activeTab === 'values'"
        v-model="featureFilter"
        @change="loadItems"
        class="filter-select"
      >
        <option value="">Все характеристики</option>
        <option
          v-for="feat in filteredFeatures"
          :key="feat.id"
          :value="feat.id"
        >
          {{ feat.name }}
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
            <th>Привязанные значения</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in features" :key="item.id">
            <td data-label="ID">{{ item.id }}</td>
            <td data-label="Название" class="name-cell">{{ item.name }}</td>
            <td data-label="Категория">{{ item.category_name || "—" }}</td>
            <td data-label="Значения">
              <div class="values-preview">
                <span
                  v-if="item.values && item.values.length > 0"
                  class="values-chips"
                >
                  <span
                    v-for="(val, idx) in item.values.slice(0, 3)"
                    :key="val.id"
                    class="chip"
                    >{{ val.value }}</span
                  >
                  <span v-if="item.values.length > 3" class="chip chip-more">
                    +{{ item.values.length - 3 }}
                  </span>
                </span>
                <span v-else class="no-values">Нет значений</span>
              </div>
            </td>
            <td data-label="Действия">
              <div class="actions">
                <button
                  @click="editFeature(item)"
                  class="btn-icon"
                  title="Редактировать"
                >
                  ✏️
                </button>
                <button
                  @click="confirmDeleteFeature(item)"
                  class="btn-icon delete"
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="features.length === 0">
            <td colspan="5" class="empty">Характеристики не найдены</td>
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
            <th>Характеристика</th>
            <th>Категория</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in featureValues" :key="item.id">
            <td data-label="ID">{{ item.id }}</td>
            <td data-label="Значение" class="name-cell">{{ item.value }}</td>
            <td data-label="Характеристика">
              <span v-if="item.feature_name" class="badge badge-primary">{{
                item.feature_name
              }}</span>
              <span v-else class="badge badge-warning">Не привязано</span>
            </td>
            <td data-label="Категория">{{ item.category_name || "—" }}</td>
            <td data-label="Действия">
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
            <td colspan="5" class="empty">Значения не найдены</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Feature Modal (с выбором значений) -->
    <div
      v-if="showFeatureModal"
      class="modal-overlay"
      @click.self="showFeatureModal = false"
    >
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2>
            {{
              editingFeature
                ? "Редактировать характеристику"
                : "Новая характеристика"
            }}
          </h2>
          <button @click="showFeatureModal = false" class="close-btn">✕</button>
        </div>
        <form @submit.prevent="saveFeature" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>Название *</label>
              <input v-model="featureForm.name" type="text" required />
            </div>
            <div class="form-group">
              <label>Категория *</label>
              <select
                v-model="featureForm.category"
                @change="onFeatureCategoryChange"
                required
              >
                <option :value="null" disabled>— Выберите —</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Блок привязки значений -->
          <div class="form-group" v-if="featureForm.category">
            <label>Привязанные значения</label>

            <!-- Текущие привязанные значения -->
            <div class="selected-values">
              <div
                v-if="featureForm.selectedValues.length > 0"
                class="values-chips-edit"
              >
                <span
                  v-for="val in featureForm.selectedValues"
                  :key="val.id"
                  class="chip chip-removable"
                >
                  {{ val.value }}
                  <button
                    type="button"
                    @click="removeSelectedValue(val)"
                    class="chip-remove"
                  >
                    ✕
                  </button>
                </span>
              </div>
              <p v-else class="hint-text">Нет привязанных значений</p>
            </div>

            <!-- Выбор из доступных значений категории -->
            <div class="available-values-section">
              <label>Добавить из существующих значений категории:</label>
              <div class="available-values-list">
                <div
                  v-if="availableValuesForFeature.length > 0"
                  class="values-chips-select"
                >
                  <button
                    type="button"
                    v-for="val in availableValuesForFeature"
                    :key="val.id"
                    @click="addSelectedValue(val)"
                    class="chip chip-add"
                    :disabled="isValueSelected(val.id)"
                  >
                    {{ val.value }} +
                  </button>
                </div>
                <p v-else class="hint-text">
                  Все значения уже привязаны или нет доступных значений
                </p>
              </div>
            </div>

            <!-- Быстрое добавление новых значений -->
            <div class="quick-add-section">
              <label>Или создайте новые значения (через запятую):</label>
              <div class="quick-add-form">
                <input
                  v-model="newValuesInput"
                  type="text"
                  placeholder="Красный, Синий, Зелёный..."
                  class="quick-add-input"
                  @keydown.enter.prevent="quickAddValues"
                />
                <button
                  type="button"
                  @click="quickAddValues"
                  class="btn btn-secondary"
                  :disabled="!newValuesInput.trim()"
                >
                  Создать
                </button>
              </div>
              <div v-if="quickAddStatus" class="quick-add-status">
                {{ quickAddStatus }}
              </div>
            </div>
          </div>

          <div v-else class="hint-message">
            Сначала выберите категорию для привязки значений
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
              {{ saving ? "Сохранение..." : "Сохранить" }}
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
            <select
              v-model="valueForm.category"
              @change="onValueCategoryChange"
              required
            >
              <option :value="null" disabled>— Выберите —</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Характеристика</label>
            <select v-model="valueForm.feature" :disabled="!valueForm.category">
              <option :value="null">
                {{
                  valueForm.category
                    ? "— Без привязки —"
                    : "Сначала выберите категорию"
                }}
              </option>
              <option
                v-for="feat in featuresForValueModal"
                :key="feat.id"
                :value="feat.id"
              >
                {{ feat.name }}
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
import { ref, reactive, onMounted, watch, computed } from "vue";
import {
  featuresAdminAPI,
  featureValuesAdminAPI,
  categoriesAdminAPI,
} from "@/api/admin";

interface FeatureValue {
  id: number;
  value: string;
  feature?: number;
  category?: number;
}

const activeTab = ref<"features" | "values">("features");
const features = ref<any[]>([]);
const featureValues = ref<any[]>([]);
const categories = ref<any[]>([]);
const search = ref("");
const categoryFilter = ref("");
const featureFilter = ref("");
const saving = ref(false);
const error = ref("");

// Feature form с выбранными значениями
const showFeatureModal = ref(false);
const editingFeature = ref<any>(null);
const featureForm = reactive({
  name: "",
  category: null as number | null,
  selectedValues: [] as FeatureValue[],
  originalValueIds: [] as number[], // для отслеживания изменений
});
const newValuesInput = ref("");
const quickAddStatus = ref("");

// Доступные значения для привязки (не привязанные к текущей характеристике)
const allCategoryValues = ref<FeatureValue[]>([]);

const availableValuesForFeature = computed(() => {
  const selectedIds = featureForm.selectedValues.map((v) => v.id);
  return allCategoryValues.value.filter((v) => !selectedIds.includes(v.id));
});

// Value form
const showValueModal = ref(false);
const editingValue = ref<any>(null);
const valueForm = reactive({
  value: "",
  category: null as number | null,
  feature: null as number | null,
});
const featuresForValueModal = ref<any[]>([]);

// Delete
const showDeleteModal = ref(false);
const deletingItem = ref<any>(null);
const deleteType = ref<"feature" | "value">("feature");
const deleting = ref(false);

// Отфильтрованные характеристики для фильтра
const filteredFeatures = computed(() => {
  if (!categoryFilter.value) return features.value;
  return features.value.filter((f) => f.category == categoryFilter.value);
});

let searchTimeout: number;
function debouncedSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(loadItems, 300);
}

function onCategoryFilterChange() {
  featureFilter.value = "";
  loadItems();
}

async function loadItems() {
  const params: any = {};
  if (search.value) params.search = search.value;
  if (categoryFilter.value) params.category = categoryFilter.value;

  try {
    const featuresRes = await featuresAdminAPI.getAll(params);
    features.value = featuresRes.data.results || featuresRes.data;

    const valueParams: any = { ...params };
    if (featureFilter.value) valueParams.feature = featureFilter.value;

    const valuesRes = await featureValuesAdminAPI.getAll(valueParams);
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

// Загрузка значений категории для формы характеристики
async function loadCategoryValues(categoryId: number) {
  try {
    const res = await featureValuesAdminAPI.getAll({ category: categoryId });
    allCategoryValues.value = res.data.results || res.data;
  } catch (e) {
    console.error(e);
    allCategoryValues.value = [];
  }
}

// Загрузка характеристик для формы значений
async function loadFeaturesForCategory(categoryId: number) {
  try {
    const res = await featuresAdminAPI.getAll({ category: categoryId });
    featuresForValueModal.value = res.data.results || res.data;
  } catch (e) {
    console.error(e);
    featuresForValueModal.value = [];
  }
}

// ==================== Feature Form ====================

function openCreateModal() {
  error.value = "";
  if (activeTab.value === "features") {
    editingFeature.value = null;
    featureForm.name = "";
    featureForm.category = null;
    featureForm.selectedValues = [];
    featureForm.originalValueIds = [];
    allCategoryValues.value = [];
    newValuesInput.value = "";
    showFeatureModal.value = true;
  } else {
    editingValue.value = null;
    valueForm.value = "";
    valueForm.category = null;
    valueForm.feature = null;
    featuresForValueModal.value = [];
    showValueModal.value = true;
  }
}

async function editFeature(item: any) {
  editingFeature.value = item;
  featureForm.name = item.name;
  featureForm.category = item.category;
  featureForm.selectedValues = item.values ? [...item.values] : [];
  featureForm.originalValueIds = item.values
    ? item.values.map((v: any) => v.id)
    : [];
  newValuesInput.value = "";
  error.value = "";

  if (item.category) {
    await loadCategoryValues(item.category);
  }

  showFeatureModal.value = true;
}

async function onFeatureCategoryChange() {
  featureForm.selectedValues = [];
  featureForm.originalValueIds = [];
  if (featureForm.category) {
    await loadCategoryValues(featureForm.category);
  } else {
    allCategoryValues.value = [];
  }
}

function isValueSelected(valueId: number): boolean {
  return featureForm.selectedValues.some((v) => v.id === valueId);
}

function addSelectedValue(val: FeatureValue) {
  if (!isValueSelected(val.id)) {
    featureForm.selectedValues.push(val);
  }
}

function removeSelectedValue(val: FeatureValue) {
  featureForm.selectedValues = featureForm.selectedValues.filter(
    (v) => v.id !== val.id
  );
}

// Быстрое создание новых значений и привязка к характеристике
async function quickAddValues() {
  if (!newValuesInput.value.trim() || !featureForm.category) return;

  const values = newValuesInput.value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v);
  if (values.length === 0) return;

  let created = 0;
  quickAddStatus.value = "";

  for (const val of values) {
    // Проверяем, существует ли уже такое значение
    const existing = allCategoryValues.value.find(
      (v) => v.value.toLowerCase() === val.toLowerCase()
    );

    if (existing) {
      // Добавляем существующее если ещё не выбрано
      if (!featureForm.selectedValues.some((v) => v.id === existing.id)) {
        featureForm.selectedValues.push(existing);
      }
    } else {
      try {
        // Создаём значение с привязкой к категории (feature будет привязан при сохранении)
        const res = await featureValuesAdminAPI.create({
          value: val,
          category: featureForm.category,
          feature: editingFeature.value?.id || null,
        });

        const newVal = res.data;
        featureForm.selectedValues.push(newVal);
        allCategoryValues.value.push(newVal);
        created++;
      } catch (e: any) {
        console.error(`Failed to create "${val}":`, e);
      }
    }
  }

  newValuesInput.value = "";

  // Show status message
  if (created > 0) {
    quickAddStatus.value = `✅ Создано значений: ${created}`;
    setTimeout(() => {
      quickAddStatus.value = "";
    }, 3000);
  }
}

async function saveFeature() {
  try {
    saving.value = true;
    error.value = "";

    let featureId: number;

    if (editingFeature.value) {
      await featuresAdminAPI.update(editingFeature.value.id, {
        name: featureForm.name,
        category: featureForm.category,
      });
      featureId = editingFeature.value.id;
    } else {
      const res = await featuresAdminAPI.create({
        name: featureForm.name,
        category: featureForm.category,
      });
      featureId = res.data.id;
    }

    // Обновляем привязки значений
    const selectedIds = featureForm.selectedValues.map((v) => v.id);
    const originalIds = featureForm.originalValueIds;

    // Значения для отвязки (были, но теперь нет)
    const toUnlink = originalIds.filter((id) => !selectedIds.includes(id));

    // Значения для привязки (новые)
    const toLink = selectedIds.filter((id) => !originalIds.includes(id));

    // Отвязываем
    for (const valueId of toUnlink) {
      try {
        await featureValuesAdminAPI.update(valueId, { feature: null });
      } catch (e) {
        console.error(`Failed to unlink value ${valueId}:`, e);
      }
    }

    // Привязываем
    for (const valueId of toLink) {
      try {
        await featureValuesAdminAPI.update(valueId, { feature: featureId });
      } catch (e) {
        console.error(`Failed to link value ${valueId}:`, e);
      }
    }

    showFeatureModal.value = false;
    loadItems();
  } catch (e: any) {
    error.value =
      e.response?.data?.detail ||
      e.response?.data?.name?.[0] ||
      "Ошибка сохранения";
  } finally {
    saving.value = false;
  }
}

// ==================== Value Form ====================

async function editValue(item: any) {
  editingValue.value = item;
  valueForm.value = item.value;
  valueForm.category = item.category;
  valueForm.feature = item.feature;
  error.value = "";

  if (item.category) {
    await loadFeaturesForCategory(item.category);
  }

  showValueModal.value = true;
}

function onValueCategoryChange() {
  valueForm.feature = null;
  if (valueForm.category) {
    loadFeaturesForCategory(valueForm.category);
  } else {
    featuresForValueModal.value = [];
  }
}

async function saveValue() {
  try {
    saving.value = true;
    error.value = "";
    if (editingValue.value) {
      await featureValuesAdminAPI.update(editingValue.value.id, valueForm);
    } else {
      await featureValuesAdminAPI.create(valueForm);
    }
    showValueModal.value = false;
    loadItems();
  } catch (e: any) {
    error.value =
      e.response?.data?.detail || e.response?.data?.value?.[0] || "Ошибка";
  } finally {
    saving.value = false;
  }
}

// ==================== Delete ====================

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
    if (deleteType.value === "feature") {
      await featuresAdminAPI.delete(deletingItem.value.id);
    } else {
      await featureValuesAdminAPI.delete(deletingItem.value.id);
    }
    showDeleteModal.value = false;
    loadItems();
  } catch (e) {
    alert("Ошибка удаления");
  } finally {
    deleting.value = false;
  }
}

watch(activeTab, () => {
  featureFilter.value = "";
  loadItems();
});

onMounted(() => {
  loadItems();
  loadCategories();
});
</script>

<style scoped>
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.values-preview {
  display: flex;
  align-items: center;
}

.values-chips,
.values-chips-edit,
.values-chips-select {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: var(--surface-color, #e9ecef);
  border-radius: 16px;
  font-size: 12px;
  color: var(--text-color, #333);
}

.chip-more {
  background: var(--primary-color, #007bff);
  color: white;
}

.chip-removable {
  padding-right: 6px;
  gap: 4px;
}

.chip-remove {
  background: none;
  border: none;
  color: var(--danger-color, #dc3545);
  cursor: pointer;
  padding: 0 4px;
  font-size: 12px;
  line-height: 1;
  border-radius: 50%;
}

.chip-remove:hover {
  background: rgba(220, 53, 69, 0.1);
}

.chip-add {
  cursor: pointer;
  border: 1px dashed var(--primary-color, #007bff);
  background: white;
  color: var(--primary-color, #007bff);
  transition: all 0.2s;
}

.chip-add:hover:not(:disabled) {
  background: var(--primary-color, #007bff);
  color: white;
}

.chip-add:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.no-values {
  color: var(--text-muted, #888);
  font-style: italic;
  font-size: 13px;
}

.selected-values {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--surface-color, #f8f9fa);
  border-radius: 8px;
  min-height: 50px;
}

.available-values-section {
  margin-bottom: 16px;
}

.available-values-section label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text-secondary, #666);
}

.available-values-list {
  padding: 12px;
  background: white;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 8px;
  max-height: 150px;
  overflow-y: auto;
}

.quick-add-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color, #e0e0e0);
}

.quick-add-section label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text-secondary, #666);
}

.quick-add-form {
  display: flex;
  gap: 8px;
}

.quick-add-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 6px;
  font-size: 14px;
}

.hint-text {
  color: var(--text-muted, #888);
  font-size: 13px;
  font-style: italic;
}

.hint-message {
  padding: 16px;
  background: var(--warning-bg, #fff3cd);
  border-radius: 8px;
  color: var(--warning-color, #856404);
  text-align: center;
}

.quick-add-status {
  margin-top: 8px;
  padding: 8px 12px;
  background: #d1fae5;
  color: #065f46;
  border-radius: 6px;
  font-size: 13px;
}

.badge-primary {
  background-color: var(--primary-color, #007bff);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.badge-warning {
  background-color: var(--warning-color, #ffc107);
  color: #212529;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.modal-lg {
  max-width: 700px;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
