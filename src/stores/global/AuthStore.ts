import { defineStore, acceptHMRUpdate } from 'pinia';
import { auth } from 'src/boot/firebase';
import type { User } from 'firebase/auth';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

interface AuthStoreState {
  user: User | null;
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
      
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.user = user;
          this.updateLastActivity();
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          this.user = null;
          localStorage.removeItem('user');
        }
      });
      this.checkSessionExpiration();
    },

    checkSessionExpiration() {
      setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.lastActivity;

        if (elapsedTime >= this.sessionTimeout) {
          this.logout().catch(error => {
            console.log(error)
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
      this.user = userCredential.user;
      this.updateLastActivity();
      localStorage.setItem('user', JSON.stringify(userCredential.user));
    },

    async logout() {
      await signOut(auth)
      localStorage.removeItem('user');
      this.user = null;
      localStorage.removeItem('lastActivity');
    },
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
