import { Component, effect, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TurnoService } from '../../services/turno.service';
import {
    Especialista,
    Paciente,
    TurnoApp,
} from '../../interfaces/user-details.interface';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { UserCardComponent } from '../../components/user-card/user-card.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-pacientes-page',
    standalone: true,
    imports: [FormsModule, UserCardComponent, CommonModule],
    templateUrl: './pacientes-page.component.html',
    styleUrl: './pacientes-page.component.css',
})
export class PacientesPageComponent {
    protected authService = inject(AuthService);
    private turnoService = inject(TurnoService);
    private spinner = inject(NgxSpinnerService);

    protected turnos: TurnoApp[] = [];
    protected fileteredTurnos: TurnoApp[] = [];

    protected filterText = '';

    protected currentUser!: Especialista;

    protected patientsWithHistory : Paciente[] = [];

    constructor() {
        effect(() => {
            this.spinner.show();
            const currentUser = this.authService.currentUserSig();

            if (currentUser?.uid) {
                this.currentUser =
                    this.authService.currentUserSig() as Especialista;

                this.getPatientsFromTurnsWithHistory();
            }
        });
    }

    private getPatientsFromTurnsWithHistory() {
        const turnos$ = this.turnoService.getTurnosWithHistoriaEspecialista(
            this.currentUser.uid!
        );

        turnos$?.pipe(tap(() => this.spinner.hide())).subscribe((turnos) => {
            this.turnos = turnos;
            this.fileteredTurnos = turnos;

            const uniquePatients = new Set<string>();
            this.patientsWithHistory = [];

            turnos.forEach((turno) => {
                const patient = turno.patient;
                if (!uniquePatients.has(patient.uid!)) {
                    // Usa una propiedad única como `uid`
                    uniquePatients.add(patient.uid!);
                    this.patientsWithHistory.push(patient);
                }
            });
        });
    }
}
