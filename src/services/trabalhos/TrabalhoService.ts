import { AbstractService } from 'src/services/AbstractService';
import { db } from 'src/boot/firebase';
import { collection, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';
import type { TrabalhoModel } from 'src/models/trabalhos/TrabalhoModel';

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
async getTrabalhosByFuncionarioAndRangeDate(funcionarioId: string, dataInicio: Date, dataFim: Date): Promise<TrabalhoModel[]> {
    const collectionRef = collection(db, TrabalhoService.collectionName);

    // Ajustando a data de início para 00:00:00
    const startOfDay = new Date(dataInicio);
    startOfDay.setHours(0, 0, 0, 0); // Configura para 00:00:00

    // Ajustando a data de fim para 23:59:59
    const endOfDay = new Date(dataFim);
    endOfDay.setHours(23, 59, 59, 999); // Configura para 23:59:59

    // Converte as datas para Timestamp
    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);

    const q = query(
        collectionRef,
        where('funcionario_id', '==', funcionarioId),
        where('cadastroData', '>=', startTimestamp),
        where('cadastroData', '<=', endTimestamp),
        orderBy('cadastroData', 'asc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as TrabalhoModel[];
}

}

export const trabalhoService = new TrabalhoService();
