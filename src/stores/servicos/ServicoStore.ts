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
        await servicoService.update(servico.id, { nome: servico.nome, valor: servico.valor, ativo: servico.ativo, flagCombo: servico.flagCombo });
        const index = this.servicos.findIndex(item => item.id === servico.id);
        if (index !== -1) this.servicos[index] = { ...servico };
      } catch (error) {
        console.error("Erro ao editar serviço:", error);
      }
    },

    async changeStatusServico(id: string) {
      try {
        const servico = this.servicos.find(servico => servico.id === id);

        if (!servico) {
          Notify.create({
            message: "Servico não encontrado!",
            type: "negative",
          });
          return;
        }

        servico.ativo = !servico.ativo;
        await this.updateServico(servico);

        Notify.create({
          message: servico.ativo ? "Serviço ativado com sucesso!" : "Servico inativado com sucesso!",
          type: "positive",
        });
      } catch (error) {
        console.error(error);
        Notify.create({
          message: "Não foi possível alterar o status do serviço!",
          type: "negative",
        });
      }
    },
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useServicoStore, import.meta.hot));
}
