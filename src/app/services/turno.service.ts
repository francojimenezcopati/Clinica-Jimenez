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
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TurnoService {
    private firestore = inject(AngularFirestore);
    private userService = inject(UserService);

    constructor() {}

    public async getAllWithNestedObjects() {
        const turnosFirestore = await firstValueFrom(
            this.firestore
                .collection<TurnoFirestore>(CollectionsNames.TURNOS)
                .valueChanges()
        );

        const turnosApp = await Promise.all(
            turnosFirestore?.map(async (turnoFirestore) => {
                const patient = await firstValueFrom(
                    this.userService.getOne(turnoFirestore.patientId)
                );
                const specialist = await firstValueFrom(
                    this.userService.getOne(turnoFirestore.specialistId)
                );

                const { patientId, specialistId, ...turnoAppData } =
                    turnoFirestore;

                return {
                    ...turnoAppData,
                    patient: patient?.data(),
                    specialist: specialist?.data(),
                } as TurnoApp;
            }) || []
        );

        return turnosApp;
    }

    public async getAll() {
        const turnosFirestore = await firstValueFrom(
            this.firestore
                .collection<TurnoFirestore>(CollectionsNames.TURNOS)
                .valueChanges()
        );

        return turnosFirestore;
    }

    public async getTurnosPaciente(patientId: string): Promise<TurnoApp[]> {
        const turnosFirestore = await firstValueFrom(
            this.firestore
                .collection<TurnoFirestore>(CollectionsNames.TURNOS, (ref) =>
                    ref.where('patientId', '==', patientId)
                )
                .valueChanges()
        );

        const turnosApp = await Promise.all(
            turnosFirestore?.map(async (turnoFirestore) => {
                const patient = await firstValueFrom(
                    this.userService.getOne(turnoFirestore.patientId)
                );
                const specialist = await firstValueFrom(
                    this.userService.getOne(turnoFirestore.specialistId)
                );

                const { patientId, specialistId, ...turnoAppData } =
                    turnoFirestore;

                return {
                    ...turnoAppData,
                    patient: patient?.data(),
                    specialist: specialist?.data(),
                } as TurnoApp;
            }) || []
        );

        return turnosApp;
    }

    public saveTurno(turno: TurnoFirestore) {
        return this.firestore
            .collection<TurnoFirestore>(CollectionsNames.TURNOS)
            .add(turno);
    }

    public getOne(userId: string) {
        return this.firestore
            .doc<TurnoFirestore>(CollectionsNames.TURNOS + '/' + userId)
            .get();
    }

    public update(turno: TurnoFirestore) {
        // return this.firestore
        //     .doc<Turno>(CollectionsNames.TURNOS + '/' + turno.uid)
        //     .update(turno);
    }

    public async updateSpecialist(specialist: Especialista) {
        await this.firestore
            .doc<Especialista>(CollectionsNames.TURNOS + '/' + specialist.uid)
            .update(specialist);
    }
}
