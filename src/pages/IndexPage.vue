<template>
  <q-page>
    <q-tabs
      v-model="tab"
      dense
      active-color="primary"
      indicator-color="primary"
      class="bg-secondary"
      align="justify"
    >
      <q-tab name="trabalho" label="Trabalho" icon="work" />
      <q-tab name="produto" label="Produto" icon="inventory" />
    </q-tabs>

    <q-tab-panels v-model="tab" 
      animated
      swipeable
      infinite
    >
      <q-tab-panel name="trabalho">
        <TrabalhoTabContent />
      </q-tab-panel>

      <q-tab-panel name="produto">
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tab = ref('trabalho')

</script>