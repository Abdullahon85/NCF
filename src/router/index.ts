//router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import HomePage from "../views/HomePage.vue";
import CatalogPage from "../views/CatalogPage.vue";
import CategoryProductsPage from "../views/CategoryProductsPage.vue";
import ProductDetailPage from "../views/ProductDetailPage.vue";
import NewsPage from "../views/NewsPage.vue";
import NewsDetailPage from "../views/NewsDetailPage.vue";
import AboutPage from "../views/AboutPage.vue";
import ContactPage from "../views/ContactPage.vue";
import NotFound from "../views/NotFound.vue";
import Brand from "../views/Brand.vue";
import AllBrandsPage from "../views/AllBrandsPage.vue";

// Admin imports
import AdminLayout from "../components/admin/AdminLayout.vue";
import AdminLogin from "../views/AdminLogin.vue";
import AdminDashboard from "../views/AdminDashboard.vue";
import AdminProfile from "../views/AdminProfile.vue";
import ProductsManagement from "../views/ProductsManagement.vue";

// Auth store for route guards
import { useAuthStore } from "../stores/auth";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
  },

  {
    path: "/brands/:slug",
    name: "Brand",
    component: Brand,
  },
  {
    path: "/brands",
    name: "AllBrands",
    component: AllBrandsPage,
  },
  {
    path: "/catalog",
    name: "Catalog",
    component: CatalogPage,
  },
  {
    path: "/catalog/:categorySlug",
    name: "CategoryProducts",
    component: CategoryProductsPage,
  },
  {
    path: "/product/:slug",
    name: "ProductDetail",
    component: ProductDetailPage,
  },
  {
    path: "/news",
    name: "News",
    component: NewsPage,
  },
  {
    path: "/news/:slug",
    name: "NewsDetail",
    component: NewsDetailPage,
  },
  {
    path: "/about",
    name: "About",
    component: AboutPage,
  },
  {
    path: "/contact",
    name: "Contact",
    component: ContactPage,
  },

  // Admin routes
  {
    path: "/admin/login",
    name: "AdminLogin",
    component: AdminLogin,
    meta: { requiresGuest: true },
  },
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "AdminDashboard",
        component: AdminDashboard,
      },
      {
        path: "products",
        name: "ProductsManagement",
        component: ProductsManagement,
      },
      {
        path: "categories",
        name: "CategoriesManagement",
        component: () => import("../views/CategoriesManagement.vue"),
      },
      {
        path: "brands",
        name: "BrandsManagement",
        component: () => import("../views/BrandsManagement.vue"),
      },
      {
        path: "tags",
        name: "TagsManagement",
        component: () => import("../views/TagsManagement.vue"),
      },
      {
        path: "features",
        name: "FeaturesManagement",
        component: () => import("../views/FeaturesManagement.vue"),
      },
      {
        path: "news",
        name: "NewsManagement",
        component: () => import("../views/NewsManagement.vue"),
      },
      {
        path: "messages",
        name: "MessagesManagement",
        component: () => import("../views/MessagesManagement.vue"),
      },
      {
        path: "settings",
        name: "AdminSettings",
        component: () => import("../views/AdminSettings.vue"),
      },
      {
        path: "profile",
        name: "AdminProfile",
        component: AdminProfile,
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  // Initialize auth state
  if (!authStore.initialized) {
    await authStore.init();
  }

  // Check if route requires auth
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: "AdminLogin", query: { redirect: to.fullPath } });
    return;
  }

  // Check if route requires guest (login page)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: "AdminDashboard" });
    return;
  }

  next();
});

export default router;
