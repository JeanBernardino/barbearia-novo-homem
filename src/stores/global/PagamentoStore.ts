import { defineStore, acceptHMRUpdate } from 'pinia';

export const usePagamentoStore = defineStore('pagamento', {
  state: () => ({}),
  getters: {},
  actions: {}
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePagamentoStore, import.meta.hot));
}
