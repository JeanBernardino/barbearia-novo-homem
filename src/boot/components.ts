import { defineBoot } from '#q-app/wrappers'
import PasswordInput from 'src/components/PasswordInput.vue'

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    PasswordInput: typeof PasswordInput
  }
}

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli-vite/boot-files
export default defineBoot(({app}) => {
  app.component('PasswordInput', PasswordInput)
})
