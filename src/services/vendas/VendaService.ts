import type { VendaModel } from 'src/models/vendas/VendaModel';
import { AbstractService } from 'src/services/AbstractService';

export const vendaService = new AbstractService<VendaModel>('vendas');
