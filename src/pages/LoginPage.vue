<template>
  <q-layout view="hHr LpR lFf">
    <q-page-container>
      <q-page padding class="flex justify-center items-center bg-primary">
        <q-card class="bg-white login-card">
          <q-card-section class="text-center">
            <div><h6>Login</h6></div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-form class="q-gutter-y-md">
              <q-input v-model="user" type="text" label="Usuario" outlined />
              <PasswordInput v-model="password" />
            </q-form>
          </q-card-section>
          <q-separator />
          <q-card-actions vertical align="center">
            <q-btn label="Login" color="primary" class="full-width"/>
          </q-card-actions>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const user = ref<string>("")
const password = ref<string>("")
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