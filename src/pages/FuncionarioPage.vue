<template>
  <q-page padding>
    <q-form>
      <div class="q-mb-md">
        <q-input v-model="name" type="text" label="Nome" outlined/>
      </div>

      <div class="row q-col-gutter-x-md q-mb-md">
        <q-input class="col-8 " v-model="hornDate" type="text" label="Data Nascimento" outlined>
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

      <PasswordInput v-model="password" @change-visibility="onChangeVisility" class="q-mb-md">
        <template v-slot:icon>
          <q-icon name="password" />
        </template>
      </PasswordInput>

      <div class="column">
        <q-checkbox v-model="term" label="Aceito os termos de uso" />

        <q-btn color="primary" icon="check" label="Salvar" @click="onSave" />
      </div>

    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { Notify } from 'quasar';
import { ref } from 'vue';
import PasswordInput from 'src/components/PasswordInput.vue';

const name = ref<string>("")
const hornDate = ref<string>("")
const gender = ref<string>("")
const password = ref<string>("")
const term = ref<boolean>(false)

function onSave() {
  Notify.create({
    message: `${name.value} salvo com sucesso com a senha ${password.value}`,
    type: 'positive',
  })
}

function onChangeVisility(value:boolean) {
  Notify.create({
    message: 'Mudou a visiblidade do campo senha!',
    type: value ? 'alert' : "warning",
  })
}
</script>
