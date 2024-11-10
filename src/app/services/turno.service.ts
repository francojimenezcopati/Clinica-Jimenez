import { inject, Injectable, signal } from '@angular/core';
import {
    Especialista,
    Horarios,
    Paciente,
    TurnoApp,
    TurnoFirestore,
    UserDetails,
} from '../interfaces/user-details.interface';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CollectionsNames } from '../utils/collections-names.enum';
import { UserService } from './user.service';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TurnoService {
    private firestore = inject(AngularFirestore);
    private userService = inject(UserService);

    constructor() {}

    public getAll(): Observable<TurnoFirestore[]> {
        return this.firestore
            .collection<TurnoFirestore>(CollectionsNames.TURNOS)
            .valueChanges();
    }

    public getAllWithNestedObjects(): Observable<TurnoApp[]> {
        return this.getAll().pipe(
            switchMap((turnosFirestore) =>
                this.mapTurnosFirestoreToTurnosApp(turnosFirestore)
            )
        );
    }

    public getTurnosEspecialista(specialistId: string): Observable<TurnoApp[]> {
        return this.firestore
            .collection<TurnoFirestore>(CollectionsNames.TURNOS, (ref) =>
                ref.where('specialistId', '==', specialistId)
            )
            .valueChanges()
            .pipe(
                switchMap((turnosFirestore) =>
                    this.mapTurnosFirestoreToTurnosApp(turnosFirestore)
                )
            );
    }

    public getTurnosPaciente(patientId: string): Observable<TurnoApp[]> {
        return this.firestore
            .collection<TurnoFirestore>(CollectionsNames.TURNOS, (ref) =>
                ref.where('patientId', '==', patientId)
            )
            .valueChanges()
            .pipe(
                switchMap((turnosFirestore) =>
                    this.mapTurnosFirestoreToTurnosApp(turnosFirestore)
                )
            );
    }

    private mapTurnosFirestoreToTurnosApp(
        turnosFirestore: TurnoFirestore[]
    ): Observable<TurnoApp[]> {
        return combineLatest(
            turnosFirestore.map((turnoFirestore) =>
                combineLatest({
                    patient: this.userService.getOne(turnoFirestore.patientId),
                    specialist: this.userService.getOne(
                        turnoFirestore.specialistId
                    ),
                }).pipe(
                    map(({ patient, specialist }) => {
                        const { patientId, specialistId, ...turnoAppData } =
                            turnoFirestore;
                        return {
                            ...turnoAppData,
                            patient: patient?.data(),
                            specialist: specialist?.data(),
                        } as TurnoApp;
                    })
                )
            )
        );
    }

    public saveTurno(turno: TurnoFirestore) {
        const docRef = this.firestore
            .collection<TurnoFirestore>(CollectionsNames.TURNOS)
            .doc();

        const uid = docRef.ref.id;

        return docRef.set({ ...turno, uid });
    }

    public getOne(userId: string) {
        return this.firestore
            .doc<TurnoFirestore>(CollectionsNames.TURNOS + '/' + userId)
            .get();
    }

    public update(turno: TurnoFirestore) {
        return this.firestore
            .doc<TurnoFirestore>(CollectionsNames.TURNOS + '/' + turno.uid)
            .update(turno);
    }
}
