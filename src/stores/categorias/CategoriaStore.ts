import { defineStore, acceptHMRUpdate } from 'pinia';
import { categoriaService } from 'src/services/categorias/CategoriaService';
import type { CategoriaModel } from 'src/models/categorias/CategoriaModel';
import { Notify } from 'quasar';

interface CategoriaStoreState {
  categorias: CategoriaModel[];
}

export const useCategoriaStore = defineStore('categoria', {
  state: (): CategoriaStoreState => ({
    categorias: [],
  }),

  getters: {
    getAllCategorias: (state) => state.categorias,
  },

  actions: {
    async loadAllCategorias() {
      try {
        this.categorias = await categoriaService.getAll();
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    },

    async getCategoriaById(id: string): Promise<CategoriaModel | null> {
      try {
        const categoria = await categoriaService.getById(id);
        if (categoria) {
          const exists = this.categorias.some(s => s.id === id);
          if (!exists) this.categorias.push(categoria);
        }
        return categoria;
      } catch (error) {
        console.error("Erro ao buscar categoria:", error);
        return null;
      }
    },

    async addCategoria(categoria: CategoriaModel) {
      try {
        const newCategoria = await categoriaService.save(categoria);
        this.categorias.push(newCategoria);
      } catch (error) {
        console.error("Erro ao adicionar categoria:", error);
      }
    },

    async updateCategoria(categoria: CategoriaModel) {
      try {
        await categoriaService.update(categoria.id, { nome: categoria.nome, ativo: categoria.ativo });
        const index = this.categorias.findIndex(item => item.id === categoria.id);
        if (index !== -1) this.categorias[index] = { ...categoria };
      } catch (error) {
        console.error("Erro ao editar categoria:", error);
      }
    },

    async changeStatusCategoria(id: string) {
      try {
        const categoria = this.categorias.find(categoria => categoria.id === id);
        
        console.log(categoria)
        if (!categoria) {
          Notify.create({
            message: "Categoria não encontrada!",
            type: "negative",
          });
          return;
        }

        categoria.ativo = !categoria.ativo;
        await this.updateCategoria(categoria);

        Notify.create({
          message: categoria.ativo ? "Categoria ativada com sucesso!" : "Categoria inativada com sucesso!",
          type: "positive",
        });
      } catch (error) {
        console.error(error);
        Notify.create({
          message: "Não foi possível alterar o status da categoria!",
          type: "negative",
        });
      }
    },
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCategoriaStore, import.meta.hot));
}
