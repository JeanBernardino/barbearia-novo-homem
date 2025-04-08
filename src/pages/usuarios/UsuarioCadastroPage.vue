<template>
    <q-page padding>
        <q-form ref="crudForm">
            <div class="column">
                <div class="column">
                    <div class="q-mb-md">
                        <q-input 
                            v-model="usuario.nome" 
                            type="text" 
                            label="Nome" 
                            lazy-rules
                            :rules="[
                                val => !!val || 'Necessário informar um nome.',
                            ]"
                            outlined
                        />
                    </div>

                    <div class="q-mb-md">
                        <q-input 
                            v-model="usuario.email" 
                            type="text" 
                            label="E-mail" 
                            lazy-rules
                            :rules="[
                                val => !!val || 'Necessário informar um e-mail.',
                                'email'
                            ]"
                            outlined
                            class="text-lowercase"
                            @input="usuario.email = usuario.email.toLowerCase()"
                        />
                    </div>

                    <div class="q-mb-md" v-show="usuario.id === ''">
                        <PasswordInput
                            v-model="usuario.senha"
                            lazy-rules
                            :rules="[
                                val => !!val || 'Necessário informar uma senha.',
                                val => val.length >= 8 || 'A senha deve conter no mínimo 8 dígitos.',
                            ]"
                        />
                    </div>

                    <div class="q-mb-md">
                        <q-select
                            v-model="usuario.tipo"
                            :options="tiposUsuarios"
                            label="Tipo"
                            outlined
                        />
                    </div>

                    <div class="q-mb-md">
                        <q-toggle
                            v-model="usuario.ativo"
                            label="Status"
                        >
                            <q-tooltip>
                                Usada para ativar ou inativar o usuário.
                            </q-tooltip>
                        </q-toggle>
                    </div>

                    <q-btn color="primary" icon="check" label="Salvar" @click="onSave" />
                </div>
            </div>
        </q-form>
    </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { Notify, QForm } from 'quasar';
import { useUsuarioStore } from 'src/stores/usuarios/UsuarioStore';
import type { UsuarioModel } from 'src/models/usuarios/UsuarioModel';
import { UsuarioTipo } from 'src/models/usuarios/UsuarioTipo';

const route = useRoute();
const router = useRouter();
const store = useUsuarioStore();
const crudForm = ref<QForm>()

const tiposUsuarios = Object.values(UsuarioTipo);

const usuario = ref<UsuarioModel>({
    id: '',
    alteracaoData: null,
    alteracaoUsuario: '',
    cadastroData: null,
    cadastroUsuario: '',
    ativo: true,
    nome: '',
    email: '',
    senha: '',
    tipo: UsuarioTipo.NORMAL
});

onMounted(async () => {
    const id = route.params.id as string | undefined;
    if (id) {
        const model = await store.getUsuarioById(id);
        if (model) {
            usuario.value = { ...model };
        } else {
            Notify.create({
                message: 'Usuário não encontrado.',
                type: 'negative'
            })
            await router.push('/usuarios');
        }
    }

});

const onSave = async () => {
    const isValid = await crudForm.value?.validate(true);
    if (crudForm.value && !isValid) {
        return;
    }

    if (usuario.value.id) {
        await store.updateUsuario(usuario.value);
    } else {
        await store.addUsuario(usuario.value);
    }
    await router.push('/usuarios');
};

</script>