import { db, auth } from 'src/boot/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, orderBy } from 'firebase/firestore';

/**
 * Classe genérica para operações CRUD no Firestore.
 * @template T - Modelo de dados (ex: ServicoModel, ProdutoModel)
 */
export class AbstractService<T> {
    private collectionName: string;

    // Definição de propriedades estáticas para campos usados frequentemente
    static readonly CREATED_AT = "cadastroData";

    constructor(collectionName: string) {
        this.collectionName = collectionName;
    }

    /**
    * Busca todos os documentos da coleção ordenados por 'cadastroData'.
    */
    async getAll(): Promise<(T & { id: string })[]> {
        const collectionRef = collection(db, this.collectionName);
        const q = query(collectionRef, orderBy(AbstractService.CREATED_AT, 'asc'));
    
        const snapshot = await getDocs(q);
        return snapshot.docs
          .filter(doc => doc.id) // Filtra documentos inválidos
            .map(doc => ({ id: doc.id, ...doc.data() } as T & { id: string }));
    }

    /**
    * Busca um documento pelo ID.
    */
    async getById(id: string): Promise<(T & { id: string }) | null> {
        try {
            const docRef = doc(db, this.collectionName, id);
            const snapshot = await getDoc(docRef);
            return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as T & { id: string }) : null;
        } catch (error) {
            console.error(`Erro ao buscar ${this.collectionName}:`, error);
            return null;
        }
    }

    /**
    * Adiciona um novo documento na coleção.
    */
    async save(data: T, cadastroData?: Date): Promise<T & { id: string }> {
        try {
            cadastroData = cadastroData || new Date();

            const collectionRef = collection(db, this.collectionName);
    
            // Criar uma cópia do objeto para evitar mutação
            const dataCopy = { ...data };
            delete (dataCopy as { id?: string }).id; // Remover o campo 'id' se existir

    
            const docRef = await addDoc(collectionRef, {
                ...dataCopy, // Agora garantimos que 'id' não será salvo no Firestore
                cadastroData: cadastroData,
                cadastroUsuario: auth.currentUser ? auth.currentUser.uid : null
            });
            
            // Retornando um novo objeto com o ID gerado pelo Firestore
            return { ...dataCopy, id: docRef.id } as T & { id: string };
        } catch (error) {
            console.error(`Erro ao adicionar ${this.collectionName}:`, error);
            throw new Error(`Erro ao adicionar ${this.collectionName}`);
        }
    }

    /**
    * Atualiza um documento existente pelo ID.
    */
    async update(id: string, data: Partial<T>): Promise<void> {
        try {
        const docRef = doc(db, this.collectionName, id);
        await updateDoc(docRef, {
            ...data,
            alteracaoData: new Date(),
            alteracaoUsuario: auth.currentUser ? auth.currentUser.uid : null
        });
        } catch (error) {
            console.error(`Erro ao editar ${this.collectionName}:`, error);
            throw new Error(`Erro ao editar ${this.collectionName}`);
        }
    }

    /**
    * Remove um documento pelo ID.
    */
    async remove(id: string): Promise<void> {
        try {
            const docRef = doc(db, this.collectionName, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error(`Erro ao remover ${this.collectionName}:`, error);
            throw new Error(`Erro ao remover ${this.collectionName}`);
        }
    }
}
