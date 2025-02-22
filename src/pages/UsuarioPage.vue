<template>
  <q-page padding>
    <q-form>
      <div class="column">
        <div class="q-mb-md">
          <q-input v-model="name" type="text" label="Nome" outlined/>
        </div>

        <div class="q-mb-md">
          <q-input v-model="email" type="email" label="E-mail" outlined :rules="[
              val => !!val || 'Necessário informar um usuário.',
              'email'
            ]"
          />
        </div>

        <PasswordInput v-model="password" class="q-mb-md"/>

        <q-btn color="primary" icon="check" label="Salvar" @click="onSave" />
      </div>

    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const name = ref<string>("")
const email = ref<string>("")
const password = ref<string>("")

function onSave() {
  console.log("novo usuario")
}
</script>
