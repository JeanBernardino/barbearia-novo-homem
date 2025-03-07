import type { AbstractModel } from "../AbstractModel"
import type { UsuarioTipo } from "./UsuarioTipo"

export interface UsuarioModel extends AbstractModel{
    nome: string,
    email: string,
    senha: string,
    tipo: UsuarioTipo,
}