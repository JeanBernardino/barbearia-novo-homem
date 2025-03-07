import { defineStore, acceptHMRUpdate } from 'pinia';
import { auth, db } from 'src/boot/firebase';
import { collection, query, where, getDocs } from "firebase/firestore";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

interface UsuarioModel {
  email: string;
  nome: string;
  tipo: 'normal' | 'admin';
  ativo: boolean;
  // Adicione outros campos conforme necessário
}

interface AuthStoreState {
  user: UsuarioModel | null;
  sessionTimeout: number;
  lastActivity: number;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthStoreState => ({
    user: null,
    sessionTimeout: 60 * 60 * 1000,
    lastActivity: localStorage.getItem('lastActivity') ? parseInt(localStorage.getItem('lastActivity')!) : Date.now(),
  }),

  getters: {},

  actions: {
    isLogged() {
      return this.user !== null;
    },

    init() {
      // Verifica se já existe um usuário logado armazenado no localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        this.user = JSON.parse(savedUser);
      }
    
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onAuthStateChanged(auth, async (user) => {
        if (user && user.email !== null) {
          try {
            // Aguardar o usuário do Firestore
            const usuario = await this.getUserFromFirestore(user.email);
            
            if (usuario) {
              this.user = usuario;
              this.updateLastActivity();
              // Envolvendo localStorage.setItem em try-catch para capturar exceções
              try {
                localStorage.setItem('user', JSON.stringify(usuario));
              } catch (error) {
                console.error('Erro ao salvar no localStorage:', error);
                // Trate ou lide com o erro se o armazenamento falhar (por exemplo, se o limite de quota for atingido)
              }
            } else {
              await this.logout(); // Se o usuário não for encontrado ou não estiver ativo
            }
          } catch (error) {
            console.error("Erro ao buscar usuário no Firestore:", error);
            await this.logout(); // Caso ocorra erro na obtenção dos dados do Firestore
          }
        } else {
          this.user = null;
          localStorage.removeItem('user');
        }
      });
    
      this.checkSessionExpiration();
    },

    async getUserFromFirestore(email: string): Promise<UsuarioModel | null> {
      const usersRef = collection(db, "usuarios");
      const q = query(usersRef, where("email", "==", email));

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        if (userDoc) {
          const userData = userDoc.data();
          if (userData.ativo) {
            return { ...userData, email: userData.email } as UsuarioModel;
          }
        }
      }
      return null;
    },

    checkSessionExpiration() {
      setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.lastActivity;

        if (elapsedTime >= this.sessionTimeout) {
          this.logout().catch(error => {
            console.log(error);
          });
        }
      }, 300000);
    },

    updateLastActivity() {
      this.lastActivity = Date.now();
      localStorage.setItem('lastActivity', this.lastActivity.toString());
    },

    async login(email: string, password: string) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.email !== null) {
        const usuario = await this.getUserFromFirestore(user.email);
        if (usuario) {
          this.user = usuario;
          this.updateLastActivity();
          localStorage.setItem('user', JSON.stringify(usuario));
        } else {
          throw new Error("Usuário ou senha inválidos!");
        }
      }
    },

    async logout() {
      await signOut(auth);
      localStorage.removeItem('user');
      this.user = null;
      localStorage.removeItem('lastActivity');
    },
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
