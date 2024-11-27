import { inject, Injectable, signal } from '@angular/core';
import {
    Auth,
    AuthErrorCodes,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    User,
} from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CollectionsNames } from '../utils/collections-names.enum';
import {
    Especialista,
    Horarios,
    Log,
    Paciente,
    UserDetails,
} from '../interfaces/user-details.interface';
import { NgxSpinnerService } from 'ngx-spinner';
import { FirebaseError } from '@angular/fire/app';
import Swal from 'sweetalert2';
import { LogsService } from './logs.service';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private firestore = inject(AngularFirestore);
    private auth = inject(Auth);
    private spinner = inject(NgxSpinnerService);
    private logService = inject(LogsService);
    private readonly API_KEY = 'AIzaSyD1W0mOlJ6i374vTz7wfEcTDg0Fcm_Iy2Q';

    currentUserSig = signal<UserDetails | null | undefined>(undefined);

    constructor() {
        this.spinner.show();
        this.checkAuthChange();
    }

    private checkAuthChange() {
        this.auth.onAuthStateChanged((authUser) => {
            if (authUser && authUser.emailVerified) {
                this.getUserFromFirestore(authUser).subscribe((userData) => {
                    const user = userData.data();

                    this.currentUserSig.set(user as UserDetails);
                    this.spinner.hide();
                });
            } else {
                this.spinner.hide();
                this.currentUserSig.set(null);
            }
        });
    }

    private getUserFromFirestore(authUser: User) {
        return this.firestore
            .doc<UserDetails>(`${CollectionsNames.USERS}/` + authUser.uid)
            .get();
    }

    // Registro de usuarios, puede ser paciente, especialista o admin
    public async register(newUser: UserDetails) {
        const promise = createUserWithEmailAndPassword(
            this.auth,
            newUser.email,
            newUser.password
        ).then((res) => {
            // Mando el link para que verifique su email y active su cuenta
            sendEmailVerification(res.user);
            Swal.fire({
                title: '¡Ya casi!',
                text: 'Se ha enviado un link a tu correo para verificarlo',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });

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

    public async registerWithoutLogin(newUser: UserDetails) {
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.API_KEY}`;

        const res = await fetch(url, {
            method: 'POST', // Especifica que esta es una solicitud POST
            headers: {
                'Content-Type': 'application/json', // Indica que el cuerpo de la solicitud es JSON
            },
            body: JSON.stringify({
                email: newUser.email,
                password: newUser.password,
                returnSecureToken: false,
            }),
        });
        const data = await res.json();
    }

    // Inicio de sesión
    public async login(email: string, password: string) {
        this.spinner.show();
        try {
            const userCredentials = await signInWithEmailAndPassword(
                this.auth,
                email,
                password
            );

            this.currentUserSig.set(undefined);

            if (userCredentials.user.emailVerified === true) {
                await this.updateUserSignal(userCredentials.user);
            } else {
                this.logout();
                this.currentUserSig.set(null);
                this.spinner.hide();
                throw new FirebaseError(AuthErrorCodes.UNVERIFIED_EMAIL, '');
            }
        } catch (error) {
            this.spinner.hide();
            throw error;
        }
    }

    private async updateUserSignal(authUser: User) {
        const user = await this.getUserFromFirestore(authUser).toPromise();
        const userDetails = user!.data() as UserDetails;

        this.specialistFilter(userDetails);

        this.currentUserSig.set(userDetails);

        this.saveLog(userDetails);

        this.spinner.hide();
    }

    private async saveLog(user: UserDetails) {
        const date = new Date();

        const log: Log = {
            fecha: date.toLocaleDateString(),
            hora: date.toTimeString().slice(0, 5),
            user: user.nombre + ' ' + user.apellido,
			date
        };

        await this.logService.saveLog(log)
    }

    private specialistFilter(userDetails: UserDetails) {
        if (userDetails.role === 'specialist') {
            if ((userDetails as Especialista).estaHabilitado === false) {
                this.logout();
                this.currentUserSig.set(null);
                this.spinner.hide();
                throw new FirebaseError(AuthErrorCodes.USER_DISABLED, '');
            }
        }
    }

    // Cierre de sesión
    logout() {
        this.currentUserSig.set(null);
        return signOut(this.auth);
    }
}
