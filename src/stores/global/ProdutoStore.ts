import { defineStore, acceptHMRUpdate } from 'pinia';

export const useProdutoStore = defineStore('produto', {
  state: () => ({}),
  getters: {},
  actions: {}
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProdutoStore, import.meta.hot));
}
