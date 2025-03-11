import type { TrabalhoModel } from 'src/models/trabalhos/TrabalhoModel';
import { AbstractService } from 'src/services/AbstractService';

export const trabalhoService = new AbstractService<TrabalhoModel>('trabalhos');
