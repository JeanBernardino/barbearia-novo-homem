import type { AbstractModel } from "../AbstractModel"

export interface ComissaoModel extends AbstractModel {
    funcionario_id: string;
    servico_id: string;
    valor: number;
}