import { inject, Injectable, signal } from '@angular/core';
import {
    Auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CollectionsNames } from '../utils/collections-names.enum';
import { Paciente, UserDetails } from '../interfaces/user-details.interface';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    firestore = inject(AngularFirestore);
    router = inject(Router);
    auth = inject(Auth);
    currentUserSig = signal<UserDetails | null | undefined>(undefined);

    constructor() {
        // Suscribirse a los cambios en el estado de autenticación
        this.auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                this.firestore // TARDA MAS, XQ RECUPERA DE FIRESTORE Y NO DEL AUTH DB
                    .doc<UserDetails>(
                        `${CollectionsNames.USERS}/` + authUser.uid
                    )
                    .get()
                    .subscribe((user) => {
                        this.currentUserSig.set(user.data() as UserDetails);
                    });
            } else {
                this.currentUserSig.set(null);
            }
        });
    }

    // Registro de usuarios, puede ser paciente, especialista o admin
    public async register(newUser: UserDetails) {
        const promise = createUserWithEmailAndPassword(
            this.auth,
            newUser.email,
            newUser.password
        ).then((res) => {
            const ref = this.firestore
                .collection(CollectionsNames.USERS)
                .doc(res.user.uid);

            const completeUser: UserDetails = {
                ...newUser,
                uid: res.user.uid,
            };

            ref.set(completeUser);
            this.currentUserSig.set(completeUser);
        });
        return promise;
    }

    // Inicio de sesión
    public async login(email: string, password: string) {
		this.currentUserSig.set(undefined)
        const promise = signInWithEmailAndPassword(this.auth, email, password);
        return promise;
    }

    // Cierre de sesión
    logout() {
        return signOut(this.auth);
    }
}
