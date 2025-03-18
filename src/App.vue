<template>
  <router-view />
</template>

<script setup lang="ts">
import { useAuthStore } from 'src/stores/usuarios/AuthStore';

const authStore = useAuthStore();
authStore.init(); 
</script>
