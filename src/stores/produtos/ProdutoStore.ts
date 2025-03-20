import { defineStore, acceptHMRUpdate } from 'pinia';
import { produtoService } from 'src/services/produtos/ProdutoService';
import type { ProdutoModel } from 'src/models/produtos/ProdutoModel';
import { Notify } from 'quasar';

interface ProdutoStoreState {
  produtos: ProdutoModel[];
}

export const useProdutoStore = defineStore('produto', {
  state: (): ProdutoStoreState => ({
    produtos: [],
  }),

  getters: {
    getAllProdutos: (state) => state.produtos,

    getAllProdutosAtivos: (state) => state.produtos.filter(p => p.ativo),

    findProdutoById: (state) => {
      return (produtoId: string): ProdutoModel | null => {
        const produto = state.produtos.find(produto => produto.id === produtoId);
        return produto || null;
      };
    },
  },

  actions: {
    async loadAllProdutos() {
      try {
        this.produtos = await produtoService.getAll();
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      }
    },

    async getProdutoById(id: string): Promise<ProdutoModel | null> {
      try {
        const produto = await produtoService.getById(id);
        if (produto) {
          const exists = this.produtos.some(s => s.id === id);
          if (!exists) this.produtos.push(produto);
        }
        return produto;
      } catch (error) {
        console.error("Erro ao buscar produto:", error);
        return null;
      }
    },

    async addProduto(produto: ProdutoModel) {
      try {
        const newProduto = await produtoService.save(produto);
        this.produtos.push(newProduto);
      } catch (error) {
        console.error("Erro ao adicionar produto:", error);
      }
    },

    async updateProduto(produto: ProdutoModel) {
      try {
        await produtoService.update(produto.id, { nome: produto.nome, valor: produto.valor, categoria_id: produto.categoria_id, ativo: produto.ativo });
        const index = this.produtos.findIndex(item => item.id === produto.id);
        if (index !== -1) this.produtos[index] = { ...produto };
      } catch (error) {
        console.error("Erro ao editar produto:", error);
      }
    },

    async changeStatusProduto(id: string) {
      try {
        const produto = this.produtos.find(produto => produto.id === id);
        
        console.log(produto)
        if (!produto) {
          Notify.create({
            message: "Produto não encontrado!",
            type: "negative",
          });
          return;
        }

        produto.ativo = !produto.ativo;
        await this.updateProduto(produto);

        Notify.create({
          message: produto.ativo ? "Produto ativado com sucesso!" : "Produto inativado com sucesso!",
          type: "positive",
        });
      } catch (error) {
        console.error(error);
        Notify.create({
          message: "Não foi possível alterar o status do produto!",
          type: "negative",
        });
      }
    },
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProdutoStore, import.meta.hot));
}
