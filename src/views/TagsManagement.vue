<template>
  <div class="management-page">
    <div class="page-header">
      <h1>#️⃣ Управление тегами</h1>
      <div class="header-actions">
        <button
          @click="activeTab = 'tags'"
          :class="['tab-btn', { active: activeTab === 'tags' }]"
        >
          Теги
        </button>
        <button
          @click="activeTab = 'tagNames'"
          :class="['tab-btn', { active: activeTab === 'tagNames' }]"
        >
          Группы тегов
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

    <!-- Tags Table -->
    <div v-if="activeTab === 'tags'" class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Slug</th>
            <th>Категория</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in tags" :key="item.id">
            <td>{{ item.id }}</td>
            <td class="name-cell">{{ item.name }}</td>
            <td class="slug-cell">{{ item.slug }}</td>
            <td>{{ item.category_name || "—" }}</td>
            <td>
              <div class="actions">
                <button @click="editTag(item)" class="btn-icon">✏️</button>
                <button @click="confirmDeleteTag(item)" class="btn-icon delete">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="tags.length === 0">
            <td colspan="5" class="empty">Теги не найдены</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tag Names Table -->
    <div v-if="activeTab === 'tagNames'" class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название группы</th>
            <th>Категория</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in tagNames" :key="item.id">
            <td>{{ item.id }}</td>
            <td class="name-cell">{{ item.name }}</td>
            <td>{{ item.category_name || "—" }}</td>
            <td>
              <div class="actions">
                <button @click="editTagName(item)" class="btn-icon">✏️</button>
                <button
                  @click="confirmDeleteTagName(item)"
                  class="btn-icon delete"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="tagNames.length === 0">
            <td colspan="4" class="empty">Группы тегов не найдены</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tag Modal -->
    <div
      v-if="showTagModal"
      class="modal-overlay"
      @click.self="showTagModal = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingTag ? "Редактировать тег" : "Новый тег" }}</h2>
          <button @click="showTagModal = false" class="close-btn">✕</button>
        </div>
        <form @submit.prevent="saveTag" class="modal-body">
          <div class="form-group">
            <label>Название *</label>
            <input
              v-model="tagForm.name"
              type="text"
              required
              @input="generateTagSlug"
            />
          </div>
          <div class="form-group">
            <label>Slug *</label>
            <input v-model="tagForm.slug" type="text" required />
          </div>
          <div class="form-group">
            <label>Категория</label>
            <select v-model="tagForm.category">
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
              @click="showTagModal = false"
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

    <!-- TagName Modal -->
    <div
      v-if="showTagNameModal"
      class="modal-overlay"
      @click.self="showTagNameModal = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h2>
            {{ editingTagName ? "Редактировать группу" : "Новая группа тегов" }}
          </h2>
          <button @click="showTagNameModal = false" class="close-btn">✕</button>
        </div>
        <form @submit.prevent="saveTagName" class="modal-body">
          <div class="form-group">
            <label>Название группы *</label>
            <input v-model="tagNameForm.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Категория</label>
            <select v-model="tagNameForm.category">
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
              @click="showTagNameModal = false"
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
            Удалить <strong>{{ deletingItem?.name }}</strong
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
  tagsAdminAPI,
  tagNamesAdminAPI,
  categoriesAdminAPI,
} from "@/api/admin";

const activeTab = ref<"tags" | "tagNames">("tags");
const tags = ref<any[]>([]);
const tagNames = ref<any[]>([]);
const categories = ref<any[]>([]);
const search = ref("");
const categoryFilter = ref("");
const saving = ref(false);
const error = ref("");

// Tag modal
const showTagModal = ref(false);
const editingTag = ref<any>(null);
const tagForm = reactive({
  name: "",
  slug: "",
  category: null as number | null,
});

// TagName modal
const showTagNameModal = ref(false);
const editingTagName = ref<any>(null);
const tagNameForm = reactive({ name: "", category: null as number | null });

// Delete
const showDeleteModal = ref(false);
const deletingItem = ref<any>(null);
const deleteType = ref<"tag" | "tagName">("tag");
const deleting = ref(false);

const translitMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
  " ": "-",
};

function generateTagSlug() {
  if (editingTag.value) return;
  tagForm.slug = tagForm.name
    .toLowerCase()
    .split("")
    .map((c) => translitMap[c] || c)
    .join("")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

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
    const [tagsRes, tagNamesRes] = await Promise.all([
      tagsAdminAPI.getAll(params),
      tagNamesAdminAPI.getAll(params),
    ]);
    tags.value = tagsRes.data.results || tagsRes.data;
    tagNames.value = tagNamesRes.data.results || tagNamesRes.data;
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
  if (activeTab.value === "tags") {
    editingTag.value = null;
    tagForm.name = "";
    tagForm.slug = "";
    tagForm.category = null;
    showTagModal.value = true;
  } else {
    editingTagName.value = null;
    tagNameForm.name = "";
    tagNameForm.category = null;
    showTagNameModal.value = true;
  }
}

function editTag(item: any) {
  editingTag.value = item;
  tagForm.name = item.name;
  tagForm.slug = item.slug;
  tagForm.category = item.category;
  error.value = "";
  showTagModal.value = true;
}

function editTagName(item: any) {
  editingTagName.value = item;
  tagNameForm.name = item.name;
  tagNameForm.category = item.category;
  error.value = "";
  showTagNameModal.value = true;
}

async function saveTag() {
  try {
    saving.value = true;
    error.value = "";
    if (editingTag.value) {
      await tagsAdminAPI.update(editingTag.value.id, tagForm);
    } else {
      await tagsAdminAPI.create(tagForm);
    }
    showTagModal.value = false;
    loadItems();
  } catch (e: any) {
    error.value = e.response?.data?.detail || "Ошибка";
  } finally {
    saving.value = false;
  }
}

async function saveTagName() {
  try {
    saving.value = true;
    error.value = "";
    if (editingTagName.value) {
      await tagNamesAdminAPI.update(editingTagName.value.id, tagNameForm);
    } else {
      await tagNamesAdminAPI.create(tagNameForm);
    }
    showTagNameModal.value = false;
    loadItems();
  } catch (e: any) {
    error.value = e.response?.data?.detail || "Ошибка";
  } finally {
    saving.value = false;
  }
}

function confirmDeleteTag(item: any) {
  deletingItem.value = item;
  deleteType.value = "tag";
  showDeleteModal.value = true;
}
function confirmDeleteTagName(item: any) {
  deletingItem.value = item;
  deleteType.value = "tagName";
  showDeleteModal.value = true;
}

async function performDelete() {
  try {
    deleting.value = true;
    if (deleteType.value === "tag")
      await tagsAdminAPI.delete(deletingItem.value.id);
    else await tagNamesAdminAPI.delete(deletingItem.value.id);
    showDeleteModal.value = false;
    deletingItem.value = null;
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
