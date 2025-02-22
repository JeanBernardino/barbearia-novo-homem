import { defineStore, acceptHMRUpdate } from 'pinia';

export const useFuncionarioStore = defineStore('funcionario', {
  state: () => ({}),
  getters: {},
  actions: {}
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFuncionarioStore, import.meta.hot));
}
