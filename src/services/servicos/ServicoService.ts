import type { ServicoModel } from 'src/models/servicos/ServicoModel';
import { AbstractService } from 'src/services/AbstractService';

export const servicoService = new AbstractService<ServicoModel>('servicos');
