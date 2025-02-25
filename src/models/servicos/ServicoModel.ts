import type { AbstractModel } from "../AbstractModel"

export interface ServicoModel extends AbstractModel{
    nome: string
    valor: number,
    flagCombo: boolean
}