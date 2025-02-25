import { defineStore, acceptHMRUpdate } from 'pinia';
import { servicoService } from 'src/services/servicos/ServicoService';
import type { ServicoModel } from 'src/models/servicos/ServicoModel';
import { Notify } from 'quasar';

interface ServicoStoreState {
  servicos: ServicoModel[];
}

export const useServicoStore = defineStore('servico', {
  state: (): ServicoStoreState => ({
    servicos: [],
  }),

  getters: {
    getAllServicos: (state) => state.servicos,
  },

  actions: {
    async loadAllServicos() {
      try {
        this.servicos = await servicoService.getAll();
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
      }
    },

    async getServicoById(id: string): Promise<ServicoModel | null> {
      try {
        const servico = await servicoService.getById(id);
        if (servico) {
          const exists = this.servicos.some(s => s.id === id);
          if (!exists) this.servicos.push(servico);
        }
        return servico;
      } catch (error) {
        console.error("Erro ao buscar serviço:", error);
        return null;
      }
    },

    async addServico(servico: ServicoModel) {
      try {
        const newServico = await servicoService.save(servico);
        this.servicos.push(newServico);
      } catch (error) {
        console.error("Erro ao adicionar serviço:", error);
      }
    },

    async updateServico(servico: ServicoModel) {
      try {
        await servicoService.update(servico.id, { nome: servico.nome, valor: servico.valor, flagCombo: servico.flagCombo });
        const index = this.servicos.findIndex(item => item.id === servico.id);
        if (index !== -1) this.servicos[index] = { ...servico };
      } catch (error) {
        console.error("Erro ao editar serviço:", error);
      }
    },

    async removeServico(id: string) {
      try {
        await servicoService.remove(id);
        this.servicos = this.servicos.filter(servico => servico.id !== id);
        Notify.create({
          message: "Serviço excluído com sucesso!",
          type: "positive"
        })
      } catch (error) {
        console.error("Erro ao remover serviço:", error);
        Notify.create({
          message: "Não foi possível remover o servico!",
          type: "negative"
        })
      }
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useServicoStore, import.meta.hot));
}
