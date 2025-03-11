<template>
  <q-layout view="hHr LpR lFf">
    <q-page-container>
      <q-page padding class="flex justify-center items-center bg-primary">
        <q-card class="bg-white login-card">
          <q-card-section class="text-center">
            <q-img 
              src="/logo.jpg" 
              alt="Logo" 
              class="logo" 
              fit="contain" 
              width="120px" 
            />
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-form class="q-gutter-y-md" ref="loginForm">
              <q-input 
                v-model="email" 
                type="email" 
                label="E-mail" 
                outlined 
                :rules="[
                  val => !!val || 'Necessário informar um usuário.',
                  'email'
                ]"
              />

              <PasswordInput 
                v-model="password" 
                :rules="[
                  val => !!val || 'Necessário informar um usuário.',
                  val => val.length >= 8 || 'A senha informada é muito curta.',
                ]"
              />
            </q-form>
          </q-card-section>
          <q-separator />
          <q-card-actions vertical align="center">
            <q-btn label="Login" color="primary" class="full-width" @click="onLogin"/>
          </q-card-actions>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { QForm, Notify } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/usuarios/AuthStore';

const email = ref<string>("")
const password = ref<string>("")
const loginForm = ref<QForm>()

const authStore = useAuthStore()
const router = useRouter()

const onLogin = async () => {
  const isValid = await loginForm.value?.validate(true);
  if (loginForm.value && !isValid) {
    return;
  }

  try {
    await authStore.login(email.value, password.value)
    Notify.create({
      message: 'Login realizado com sucesso.',
      type: 'positive'
    });
    await router.push('/');
  } catch {
    Notify.create({
      message: 'Usuário ou senha inválidos.',
      type: 'negative'
    });
  }
}

</script>

<style lang="scss" scoped>

.login-card {
  width: 30%;

  @media (max-width: 768px) { // Para tablets e celulares
    width: 80%;
  }

  @media (max-width: 480px) { // Para celulares menores
    width: 95%;
  }
}

</style>