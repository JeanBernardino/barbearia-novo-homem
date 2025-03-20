import { AbstractService } from 'src/services/AbstractService';
import { db } from 'src/boot/firebase';
import { collection, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';
import type { TrabalhoModel } from 'src/models/trabalhos/TrabalhoModel';
import { DateTime } from 'luxon';


class TrabalhoService extends AbstractService<TrabalhoModel> {

    static readonly collectionName = "trabalhos";

    constructor() {
        super(TrabalhoService.collectionName);
    }

    /**
     * Obtém todos os trabalhos de um funcionário por um range de data
     * @param funcionarioId - ID do funcionário
     * @param dataInicio - Data de início da busca
     * @param dataFim - Data de fim da busca
     * @returns Lista de trabalhos do funcionário
     */
    async getTrabalhosByFuncionarioAndRangeDate(funcionarioId: string, dataInicio: string, dataFim: string): Promise<TrabalhoModel[]> {
        const collectionRef = collection(db, TrabalhoService.collectionName);

        const startOfDay = DateTime.fromISO(dataInicio, { zone: 'America/Sao_Paulo' }).startOf('day');
        const endOfDay = DateTime.fromISO(dataFim, { zone: 'America/Sao_Paulo' }).endOf('day');

        // Converte as datas para Timestamp
        const startTimestamp = Timestamp.fromMillis(startOfDay.toMillis());
        const endTimestamp = Timestamp.fromMillis(endOfDay.toMillis());

        // Criação da base da query
        let q = query(
            collectionRef,
            where('cadastroData', '>=', startTimestamp),
            where('cadastroData', '<=', endTimestamp),
            orderBy('cadastroData', 'asc')
        );

        // Se o funcionarioId não for nulo ou vazio, adiciona a condição de filtro por funcionario_id
        if (funcionarioId) {
            q = query(
                collectionRef,
                where('funcionario_id', '==', funcionarioId),
                where('cadastroData', '>=', startTimestamp),
                where('cadastroData', '<=', endTimestamp),
                orderBy('cadastroData', 'asc')
            );
        }

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as TrabalhoModel[];
    }

}

export const trabalhoService = new TrabalhoService();
