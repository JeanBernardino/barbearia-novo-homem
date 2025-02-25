import type { AbstractModel } from "../AbstractModel";

export interface ProdutoModel extends AbstractModel {
    nome: string,
    valor: number,
    categoria_id: string
}