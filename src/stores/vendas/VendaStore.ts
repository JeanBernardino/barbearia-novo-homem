import { defineStore, acceptHMRUpdate } from 'pinia';
import type { VendaModel } from 'src/models/vendas/VendaModel';
import { vendaService } from 'src/services/vendas/VendaService';

interface VendaStoreState {
  vendas: VendaModel[];
}

export const useVendatore = defineStore('venda', {
  state: (): VendaStoreState => ({
    vendas: [],
  }),

  getters: {
    getAllVendas: (state) => state.vendas,
  },

  actions: {
    async loadAllVendas() {
      try {
        this.vendas = await vendaService.getAll();
      } catch (error) {
        console.error("Erro ao carregar vendas:", error);
      }
    },

    async getVendaById(id: string): Promise<VendaModel | null> {
      try {
        const venda = await vendaService.getById(id);
        if (venda) {
          const exists = this.vendas.some(s => s.id === id);
          if (!exists) this.vendas.push(venda);
        }
        return venda;
      } catch (error) {
        console.error("Erro ao buscar venda:", error);
        return null;
      }
    },

    async addVenda(venda: VendaModel) {
      try {
        const newVenda = await vendaService.save(venda);
        this.vendas.push(newVenda);
      } catch (error) {
        console.error("Erro ao adicionar venda:", error);
      }
    }

  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useVendatore, import.meta.hot));
}
