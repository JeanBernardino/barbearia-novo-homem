import { defineStore, acceptHMRUpdate } from 'pinia';
import { usuarioService } from 'src/services/usuarios/UsuarioService';
import { Notify } from 'quasar';
import type { UsuarioModel } from 'src/models/usuarios/UsuarioModel';

interface UsuarioStoreState {
  usuarios: UsuarioModel[];
}

export const useUsuarioStore = defineStore('usuario', {
  state: (): UsuarioStoreState => ({
    usuarios: [],
  }),

  getters: {
    getAllUsuarios: (state) => state.usuarios,
  },

  actions: {
    async loadAllUsuarios() {
      try {
        this.usuarios = await usuarioService.getAll();
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      }
    },

    async getUsuarioById(id: string): Promise<UsuarioModel | null> {
      try {
        const usuario = await usuarioService.getById(id);
        if (usuario) {
          const exists = this.usuarios.some(s => s.id === id);
          if (!exists) this.usuarios.push(usuario);
        }
        return usuario;
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        return null;
      }
    },

    async addUsuario(usuario: UsuarioModel) {
      try {
        let user = await usuarioService.adicionarCredenciais(usuario);
        user = await usuarioService.save(user);

        console.log(user);

        this.usuarios.push(user);
      } catch (error) {
        console.error("Erro ao adicionar usuário:", error);
      }
    },

    async updateUsuario(usuario: UsuarioModel) {
      try {
        await usuarioService.update(usuario.id, { nome: usuario.nome, tipo: usuario.tipo });
        const index = this.usuarios.findIndex(item => item.id === usuario.id);
        if (index !== -1) this.usuarios[index] = { ...usuario };
      } catch (error) {
        console.error("Erro ao editar usuário:", error);
      }
    },

    async changeStatusUsuario(id: string) {
      try {
        const usuario = this.usuarios.find(usuario => usuario.id === id);

        if (!usuario) {
          Notify.create({
            message: "Usuário não encontrado!",
            type: "negative",
          });
          return;
        }

        usuario.ativo = !usuario.ativo;
        await this.updateUsuario(usuario);

        Notify.create({
          message: usuario.ativo ? "Usuário ativado com sucesso!" : "Usuário inativado com sucesso!",
          type: "positive",
        });
      } catch (error) {
        console.error(error);
        Notify.create({
          message: "Não foi possível alterar o status do usuário!",
          type: "negative",
        });
      }
    },
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUsuarioStore, import.meta.hot));
}
