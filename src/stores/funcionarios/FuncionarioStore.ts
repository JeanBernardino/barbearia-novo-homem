import { defineStore, acceptHMRUpdate } from 'pinia';
import { funcionarioService } from 'src/services/funcionarios/FuncionarioService';
import type { FuncionarioModel } from 'src/models/funcionarios/FuncionarioModel';
import { Notify } from 'quasar';

interface FuncionarioStoreState {
  funcionarios: FuncionarioModel[];
}

export const useFuncionarioStore = defineStore('funcionario', {
  state: (): FuncionarioStoreState => ({
    funcionarios: [],
  }),

  getters: {
    getAllFuncionarios: (state) => state.funcionarios,
  },

  actions: {
    async loadAllFuncionarios() {
      try {
        this.funcionarios = await funcionarioService.getAll();
      } catch (error) {
        console.error("Erro ao carregar funcionários:", error);
      }
    },

    async getFuncionarioById(id: string): Promise<FuncionarioModel | null> {
      try {
        const funcionario = await funcionarioService.getById(id);
        if (funcionario) {
          const exists = this.funcionarios.some(s => s.id === id);
          if (!exists) this.funcionarios.push(funcionario);
        }
        return funcionario;
      } catch (error) {
        console.error("Erro ao buscar funcionário:", error);
        return null;
      }
    },

    async addFuncionario(funcionario: FuncionarioModel) {
      try {
        const newFuncionario = await funcionarioService.save(funcionario);
        this.funcionarios.push(newFuncionario);
      } catch (error) {
        console.error("Erro ao adicionar funcionário:", error);
      }
    },

    async updateFuncionario(funcionario: FuncionarioModel) {
      try {
        await funcionarioService.update(funcionario.id, { nome: funcionario.nome, ativo: funcionario.ativo });
        const index = this.funcionarios.findIndex(item => item.id === funcionario.id);
        if (index !== -1) this.funcionarios[index] = { ...funcionario };
      } catch (error) {
        console.error("Erro ao editar funcionário:", error);
      }
    },

    async changeStatusFuncionario(id: string) {
      try {
        const funcionario = this.funcionarios.find(funcionario => funcionario.id === id);
        
        console.log(funcionario)
        if (!funcionario) {
          Notify.create({
            message: "Funcionário não encontrado!",
            type: "negative",
          });
          return;
        }

        funcionario.ativo = !funcionario.ativo;
        await this.updateFuncionario(funcionario);

        Notify.create({
          message: funcionario.ativo ? "Funcionário ativado com sucesso!" : "Funcionário inativado com sucesso!",
          type: "positive",
        });
      } catch (error) {
        console.error(error);
        Notify.create({
          message: "Não foi possível alterar o status do funcionário!",
          type: "negative",
        });
      }
    },
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFuncionarioStore, import.meta.hot));
}
