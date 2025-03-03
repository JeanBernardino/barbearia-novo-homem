import type { FuncionarioModel } from 'src/models/funcionarios/FuncionarioModel';
import { AbstractService } from 'src/services/AbstractService';

export const funcionarioService = new AbstractService<FuncionarioModel>('funcionarios');
