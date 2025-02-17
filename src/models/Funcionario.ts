import type { Comissao } from "./Comissao";


export class Funcionario {

    public comissoes: Comissao[] = []; // Lista de comissões

    constructor(
        public id: number,
        public nome: string,
        public cargo: string
    ) {}

    adicionarComissao(comissao: Comissao): void {
        this.comissoes.push(comissao);
    }
}