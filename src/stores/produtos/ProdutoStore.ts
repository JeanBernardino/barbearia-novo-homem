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
        await produtoService.update(produto.id, { nome: produto.nome, valor: produto.valor, categoria_id: produto.categoria_id });
        const index = this.produtos.findIndex(item => item.id === produto.id);
        if (index !== -1) this.produtos[index] = { ...produto };
      } catch (error) {
        console.error("Erro ao editar produto:", error);
      }
    },

    async removeProduto(id: string) {
      try {
        await produtoService.remove(id);
        this.produtos = this.produtos.filter(produto => produto.id !== id);
        Notify.create({
          message: "Produto excluído com sucesso!",
          type: "positive"
        })
      } catch (error) {
        console.error("Erro ao remover produto:", error);
        Notify.create({
          message: "Não foi possível remover o produto!",
          type: "negative"
        })
      }
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProdutoStore, import.meta.hot));
}
