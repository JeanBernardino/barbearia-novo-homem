import { defineStore, acceptHMRUpdate } from 'pinia';
import { comissaoService } from 'src/services/comissoes/ComissaoService';
import type { ComissaoModel } from 'src/models/comissoes/ComissaoModel';

interface ComissaoStoreState {
  comissoes: ComissaoModel[];
}

export const useComissaoStore = defineStore('comissao', {
  state: (): ComissaoStoreState => ({
    comissoes: [],
  }),

  getters: {
    getAllComissoes: (state) => state.comissoes,
  },

  actions: {
    async loadAllFuncionarios() {
      try {
        this.comissoes = await comissaoService.getAll();
      } catch (error) {
        console.error("Erro ao carregar comissões:", error);
      }
    },

    async getComissaoById(id: string): Promise<ComissaoModel | null> {
      try {
        const comissao = await comissaoService.getById(id);
        if (comissao) {
          const exists = this.comissoes.some(s => s.id === id);
          if (!exists) this.comissoes.push(comissao);
        }
        return comissao;
      } catch (error) {
        console.error("Erro ao buscar comissão:", error);
        return null;
      }
    },

    async getComissaoByFuncionarioId(id: string): Promise<ComissaoModel[]> {
      try {
        const comissoes = await comissaoService.getComissoesByFuncionarioId(id);

        comissoes.forEach(comissao => {
          const exists = this.comissoes.some(s => s.id === comissao.id);
          if (!exists) this.comissoes.push(comissao);
        });

        return comissoes;
      } catch (error) {
        console.error("Erro ao buscar comissões do funcionário:", error);
        return [];
      }
    },

    async getComissaoByServicoId(id: string): Promise<ComissaoModel[]> {
      try {
        const comissoes = await comissaoService.getComissoesByServicoId(id);

        comissoes.forEach(comissao => {
          const exists = this.comissoes.some(s => s.id === comissao.id);
          if (!exists) this.comissoes.push(comissao);
        });

        return comissoes;
      } catch (error) {
        console.error("Erro ao buscar comissões do serviço:", error);
        return [];
      }
    },

    async addComissao(comissao: ComissaoModel) {
      try {
        const newComissao = await comissaoService.save(comissao);
        this.comissoes.push(newComissao);
      } catch (error) {
        console.error("Erro ao adicionar comissão:", error);
      }
    },

    async updateComissao(comissao: ComissaoModel) {
      try {
        await comissaoService.update(comissao.id, { funcionario_id: comissao.funcionario_id, servico_id: comissao.servico_id });
        const index = this.comissoes.findIndex(item => item.id === comissao.id);
        if (index !== -1) this.comissoes[index] = { ...comissao };
      } catch (error) {
        console.error("Erro ao editar comissão:", error);
      }
    }

  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useComissaoStore, import.meta.hot));
}
