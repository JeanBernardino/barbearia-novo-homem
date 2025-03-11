import { defineStore, acceptHMRUpdate } from 'pinia';
import { trabalhoService } from 'src/services/trabalhos/TrabalhoService';
import type { TrabalhoModel } from 'src/models/trabalhos/TrabalhoModel';

interface TrabalhoStoreState {
  trabalhos: TrabalhoModel[];
}

export const useTrabalhoStore = defineStore('trabalho', {
  state: (): TrabalhoStoreState => ({
    trabalhos: [],
  }),

  getters: {
    getAllTrabalhos: (state) => state.trabalhos,
  },

  actions: {
    async loadAllTrabalhos() {
      try {
        this.trabalhos = await trabalhoService.getAll();
      } catch (error) {
        console.error("Erro ao carregar trabalhos:", error);
      }
    },

    async getTrabalhoById(id: string): Promise<TrabalhoModel | null> {
      try {
        const trabalho = await trabalhoService.getById(id);
        if (trabalho) {
          const exists = this.trabalhos.some(s => s.id === id);
          if (!exists) this.trabalhos.push(trabalho);
        }
        return trabalho;
      } catch (error) {
        console.error("Erro ao buscar trabalho:", error);
        return null;
      }
    },

    async addTrabalho(trabalho: TrabalhoModel) {
      try {
        const newTrabalho = await trabalhoService.save(trabalho);
        this.trabalhos.push(newTrabalho);
      } catch (error) {
        console.error("Erro ao adicionar trabalho:", error);
      }
    }

  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTrabalhoStore, import.meta.hot));
}
