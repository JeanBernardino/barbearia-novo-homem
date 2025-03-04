import type { ComissaoModel } from 'src/models/comissoes/ComissaoModel';
import { AbstractService } from 'src/services/AbstractService';
import { db } from 'src/boot/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

class ComissaoService extends AbstractService<ComissaoModel> {

    static readonly collectionName = "comissoes";

    constructor() {
        super(ComissaoService.collectionName);
    }

    /**
     * Obtém todas as comissões de um funcionário específico.
     * @param id - ID do funcionario
     * @returns Lista de comissões do funcionário
    */
    async getComissoesByFuncionarioId(id: string): Promise<ComissaoModel[]> {
        const collectionRef = collection(db, ComissaoService.collectionName);

        const q = query(
            collectionRef,
            where('funcionario_id', '==', id),
            orderBy(AbstractService.CREATED_AT, 'asc')
        );
    
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as ComissaoModel[];
    }

    /**
     * Obtém todas as comissões de um serviço específico.
     * @param id - ID do serviço
     * @returns Lista de comissões do serviço
    */
    async getComissoesByServicoId(id: string): Promise<ComissaoModel[]> {
        const collectionRef = collection(db, ComissaoService.collectionName);

        const q = query(
            collectionRef,
            where('servico_id', '==', id),
            orderBy(AbstractService.CREATED_AT, 'asc')
        );
    
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as ComissaoModel[];
    }

}

export const comissaoService = new ComissaoService();
