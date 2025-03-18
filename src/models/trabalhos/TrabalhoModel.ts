import type { AbstractModel } from "../AbstractModel"

export interface TrabalhoModel extends AbstractModel{
    funcionario_id: string
    servico_id: string,
    pagamento_id: string,
    funcionario_comissao: number;
    servico_valor: number;
}