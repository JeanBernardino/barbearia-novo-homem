import type { Timestamp } from "firebase/firestore";

export interface AbstractModel {
    id: string;
    alteracaoData: Timestamp | null;
    alteracaoUsuario: string | null;
    cadastroData: Timestamp | null;
    cadastroUsuario: string | null;
    ativo: boolean;
}