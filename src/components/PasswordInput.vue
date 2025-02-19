<template>
  <q-input v-model="password" :type="isPsw ? 'password' : 'text'" label="Senha" outlined >
    <template v-slot:prepend>
      <slot name="icon"></slot>
    </template>

    <template v-slot:append>
      <q-icon :name="isPsw ? 'visibility' : 'visibility_off'" @click="onChangeVisility"/>
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

// props
const props = defineProps<{
  modelValue: string;
}>();

// Define emit (para emitir o evento de update)
const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
  (event: 'changeVisibility', value: boolean): void;
}>();

const password = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})

const isPsw = ref<boolean>(true);

function onChangeVisility() {
  isPsw.value = !isPsw.value
  emit('changeVisibility', isPsw.value)
}
</script>
