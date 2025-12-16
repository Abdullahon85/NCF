// src/stores/useCompareStore.ts
import { defineStore } from 'pinia';
import { useLocalStorage } from '@/composables/useLocalStorage';
import type { Product } from '@/types';

export const useCompareStore = defineStore('compare', () => {
  const items = useLocalStorage<Product[]>('compare', []);
  const add = (p: Product) => {
    if (!items.value.some(i => i.id === p.id)) {
      items.value.push(p);
    }
  };
  const remove = (id: number) => items.value = items.value.filter(i => i.id !== id);
  const clear = () => items.value = [];
  return { items, add, remove, clear };
});
