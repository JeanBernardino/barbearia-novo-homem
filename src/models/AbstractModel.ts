export interface AbstractModel {
    id: string;
    alteracaoData: Date | null;
    alteracaoUsuario: string | null;
    cadastroData: Date | null;
    cadastroUsuario: string | null;
    ativo: boolean;
}