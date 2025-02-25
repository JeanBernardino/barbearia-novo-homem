import type { PagamentoModel } from 'src/models/pagamentos/PagamentoModel';
import { AbstractService } from 'src/services/AbstractService';

export const pagamentoService = new AbstractService<PagamentoModel>('pagamentos');
