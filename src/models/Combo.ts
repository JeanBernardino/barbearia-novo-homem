import type { Servico } from "./Servico";


export class Funcionario {

    public servicos: Servico[] = []; // Lista de comissões

    constructor(
        public id: number,
        public nome: string,
        public valor: number,
    ) {}

    adicionarServico(servico: Servico): void {
        this.servicos.push(servico);
    }
}