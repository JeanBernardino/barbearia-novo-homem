<template>
  <q-page padding>
    <q-form>
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

      <div class="row q-col-gutter-x-md q-mb-md">
        <q-input class="col-8 " v-model="hornDate" type="text" mask="##/##/####" label="Data Nascimento" outlined>
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date
                  v-model="hornDate"
                  landscape
                  minimal
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input> 

        <q-select class="col-4" v-model="gender" :options="['Masculino', 'Feminino', 'Outro']" label="Gênero" outlined/>
      </div>

      <div class="column">
        <div class="q-mb-md">
          <q-input v-model="user" type="text" label="Usuário" outlined/>
        </div>

        <PasswordInput v-model="password" @change-visibility="onChangeVisility" class="q-mb-md"/>

        <q-btn color="primary" icon="check" label="Salvar" @click="onSave" />
      </div>

    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { Notify } from 'quasar';
import { ref } from 'vue';

const name = ref<string>("")
const email = ref<string>("")
const hornDate = ref<string>("")
const gender = ref<string>("")
const user = ref<string>("")
const password = ref<string>("")

function onSave() {
  console.log("novo usuario")
}

function onChangeVisility(value:boolean) {
  Notify.create({
    message: 'Mudou a visiblidade do campo senha!',
    type: value ? 'alert' : "warning",
  })
}
</script>
