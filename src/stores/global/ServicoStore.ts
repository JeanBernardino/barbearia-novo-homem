import { defineStore, acceptHMRUpdate } from 'pinia';
import { db } from 'src/boot/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import type { ServicoModel } from 'src/models/ServicoModel';

interface ServicoStoreState {
  servicos: ServicoModel[];
}

export const useServicoStore = defineStore('servico', {
  state: (): ServicoStoreState => ({
    servicos: [],
  }),
  getters: {
    getAllServicos(state) {
      return state.servicos;
    }
  },
  actions: {
    async loadServicos() {
      const servicosCollection = collection(db, 'servicos');
      const servicosSnapshot = await getDocs(servicosCollection);
      this.servicos = servicosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ServicoModel);
    },

    async addServico(nome: string, valor: number) {
      try {
        const servicosCollection = collection(db, 'servicos');
        const docRef = await addDoc(servicosCollection, { nome, valor });

        // Atualiza o estado local diretamente, sem recarregar todos os serviços
        this.servicos = [...this.servicos, { id: docRef.id, nome, valor }];
      } catch (error) {
        console.error("Erro ao adicionar serviço: ", error);
        throw new Error("Erro ao adicionar serviço.");
      }
    },

    async editServico(id: string, nome: string, valor: number) {
      try {
        const servicoDoc = doc(db, 'servicos', id);
        await updateDoc(servicoDoc, { nome, valor });

        // Atualiza o estado local diretamente
        const index = this.servicos.findIndex(servico => servico.id === id);
        if (index !== -1) {
          this.servicos[index] = { id, nome, valor };
          this.servicos = [...this.servicos]; // Força a reatividade no array
        }
      } catch (error) {
        console.error("Erro ao editar serviço: ", error);
        throw new Error("Erro ao editar serviço.");
      }
    },

    async removeServico(id: string) {
      try {
        const servicoDoc = doc(db, 'servicos', id);
        await deleteDoc(servicoDoc);

        // Remove o serviço diretamente do estado local
        this.servicos = this.servicos.filter(servico => servico.id !== id);
      } catch (error) {
        console.error("Erro ao remover serviço: ", error);
        throw new Error("Erro ao remover serviço.");
      }
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useServicoStore, import.meta.hot));
}
