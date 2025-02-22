<template>
    <q-dialog v-model="isOpen" persistent>
        <q-card>
            <q-card-section class="row items-center">
                <span class="q-ml-sm">{{ message }}</span>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat :label="cancelText ?? 'Cancelar'" color="tertiary" @click="handleClose" />
                <q-btn flat :label="confirmarText ?? 'Confirmar'" color="primary" @click="onConfirm" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue';
import type { PropType } from 'vue';

const props = defineProps({
    message: {
        type: String,
        required: true
    },
    confirmarText: {
        type: String,
        required: false
    },
    cancelText: {
        type: String,
        required: false
    },
    rules: {
        type: Array as PropType<Array<(value: string) => boolean | string>>,
        required: false,
        default: () => []
    },
    onConfirm: {
        type: Function as PropType<() => void>,
        required: true
    },
    onClose: {
        type: Function as PropType<() => void>,
        required: false
    }
});

const isOpen = ref(true);

function handleClose() {
    if (props.onClose) {
        props.onClose();
    }
    
    isOpen.value = false;
}
</script>
