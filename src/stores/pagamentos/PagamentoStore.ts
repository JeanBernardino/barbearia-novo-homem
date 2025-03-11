import { defineStore, acceptHMRUpdate } from 'pinia';
import { pagamentoService } from 'src/services/pagamentos/PagamentoService';
import type { PagamentoModel } from 'src/models/pagamentos/PagamentoModel';
import { Notify } from 'quasar';

interface PagamentoStoreState {
  pagamentos: PagamentoModel[];
}

export const usePagamentoStore = defineStore('pagamento', {
  state: (): PagamentoStoreState => ({
    pagamentos: [],
  }),

  getters: {
    getAllPagamentos: (state) => state.pagamentos,
    getAllPagamentosAtivos: (state) => state.pagamentos.filter(p => p.ativo),
  },

  actions: {
    async loadAllPagamentos() {
      try {
        this.pagamentos = await pagamentoService.getAll();
      } catch (error) {
        console.error("Erro ao carregar pagamentos:", error);
      }
    },

    async getPagamentoById(id: string): Promise<PagamentoModel | null> {
      try {
        const pagamento = await pagamentoService.getById(id);
        if (pagamento) {
          const exists = this.pagamentos.some(s => s.id === id);
          if (!exists) this.pagamentos.push(pagamento);
        }
        return pagamento;
      } catch (error) {
        console.error("Erro ao buscar pagamento:", error);
        return null;
      }
    },

    async addPagamento(pagamento: PagamentoModel) {
      try {
        const newPagamento = await pagamentoService.save(pagamento);
        this.pagamentos.push(newPagamento);
      } catch (error) {
        console.error("Erro ao adicionar pagamento:", error);
      }
    },

    async updatePagamento(pagamento: PagamentoModel) {
      try {
        await pagamentoService.update(pagamento.id, { nome: pagamento.nome, ativo: pagamento.ativo });
        const index = this.pagamentos.findIndex(item => item.id === pagamento.id);
        if (index !== -1) this.pagamentos[index] = { ...pagamento };
      } catch (error) {
        console.error("Erro ao editar pagamento:", error);
      }
    },

    async changeStatusPagamento(id: string) {
      try {
        const pagamento = this.pagamentos.find(pagamento => pagamento.id === id);
        
        console.log(pagamento)
        if (!pagamento) {
          Notify.create({
            message: "Pagamento não encontrado!",
            type: "negative",
          });
          return;
        }

        pagamento.ativo = !pagamento.ativo;
        await this.updatePagamento(pagamento);

        Notify.create({
          message: pagamento.ativo ? "Pagamento ativado com sucesso!" : "Pagamento inativado com sucesso!",
          type: "positive",
        });
      } catch (error) {
        console.error(error);
        Notify.create({
          message: "Não foi possível alterar o status do pagamento!",
          type: "negative",
        });
      }
    },
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePagamentoStore, import.meta.hot));
}
