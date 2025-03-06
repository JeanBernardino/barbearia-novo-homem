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

    getComissoesByFuncionarioId: (state) => {
      return (funcionarioId: string): ComissaoModel[] => {
        return state.comissoes.filter(comissao => comissao.funcionario_id === funcionarioId);
      };
    },

    getComissoesByServicoIdAndFuncionarioId: (state) => {
      return (servicoId: string, funcionarioId: string): ComissaoModel[] => {
        return state.comissoes.filter(comissao => 
          comissao.servico_id === servicoId && comissao.funcionario_id === funcionarioId
        );
      };
    }
  },

  actions: {
    async loadAllComissoes() {
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

    async saveComissao(comissao: ComissaoModel) {
      if (comissao.id === '') {
        await this.addComissao(comissao);
      } else {
        await this.updateComissao(comissao);
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
    },

    async removeComissao(comissaoId: string) {
      try {
        await comissaoService.remove(comissaoId);
    
        this.comissoes = this.comissoes.filter(item => item.id !== comissaoId);
      } catch (error) {
        console.error("Erro ao remover comissão:", error);
      }
    }
    
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useComissaoStore, import.meta.hot));
}
