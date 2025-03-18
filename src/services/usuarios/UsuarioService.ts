import { AbstractService } from 'src/services/AbstractService';
import type { UsuarioModel } from 'src/models/usuarios/UsuarioModel';
import { auth, db } from 'src/boot/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";
// import bcrypt from "bcryptjs";


class UsuarioService extends AbstractService<UsuarioModel> {

    static readonly collectionName = "usuarios";

    constructor() {
        super(UsuarioService.collectionName);
    }

    /**
     * Obtém todas as comissões de um serviço específico.
     * @param usuario - usuario a ser adicionado
     * @returns usuario com os dados atualizados
    */
    async adicionarCredenciais(usuario: UsuarioModel) : Promise<UsuarioModel> {
        const usersRef = doc(db, "usuarios", usuario.email);

        const userSnap = await getDoc(usersRef);
        if (userSnap.exists()) {
            throw new Error("E-mail já está em uso.");
        }
        
        await createUserWithEmailAndPassword(auth, usuario.email, usuario.senha);
        return usuario;
    }

}

export const usuarioService = new UsuarioService();