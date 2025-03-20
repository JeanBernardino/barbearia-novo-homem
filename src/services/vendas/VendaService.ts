import { AbstractService } from 'src/services/AbstractService';
import { db } from 'src/boot/firebase';
import { collection, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { DateTime } from 'luxon';
import type { VendaModel } from 'src/models/vendas/VendaModel';


class VendaService extends AbstractService<VendaModel> {

    static readonly collectionName = "vendas";

    constructor() {
        super(VendaService.collectionName);
    }

    /**
     * Obtém todas as vendas por um range de data
     * @param dataInicio - Data de início da busca
     * @param dataFim - Data de fim da busca
     * @returns Lista de vendas
     */
    async getVendasByRangeDate(dataInicio: string, dataFim: string): Promise<VendaModel[]> {
        const collectionRef = collection(db, VendaService.collectionName);

        const startOfDay = DateTime.fromISO(dataInicio, { zone: 'America/Sao_Paulo' }).startOf('day');
        const endOfDay = DateTime.fromISO(dataFim, { zone: 'America/Sao_Paulo' }).endOf('day');

        // Converte as datas para Timestamp
        const startTimestamp = Timestamp.fromMillis(startOfDay.toMillis());
        const endTimestamp = Timestamp.fromMillis(endOfDay.toMillis());

        // Criação da base da query
        const q = query(
            collectionRef,
            where('cadastroData', '>=', startTimestamp),
            where('cadastroData', '<=', endTimestamp),
            orderBy('cadastroData', 'asc')
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as VendaModel[];
    }

}

export const vendaService = new VendaService();
