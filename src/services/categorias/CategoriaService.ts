import type { CategoriaModel } from 'src/models/categorias/CategoriaModel';
import { AbstractService } from 'src/services/AbstractService';

export const categoriaService = new AbstractService<CategoriaModel>('categorias');
