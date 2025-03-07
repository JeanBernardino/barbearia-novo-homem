import type { AbstractModel } from "../AbstractModel"

export interface VendaModel extends AbstractModel{
    produto_id: string,
    produto_valor: number,
    quantidade: number
}