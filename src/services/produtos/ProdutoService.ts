import type { ProdutoModel } from 'src/models/produtos/ProdutoModel';
import { AbstractService } from 'src/services/AbstractService';

export const produtoService = new AbstractService<ProdutoModel>('categorias');
