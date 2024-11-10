import { Component, effect, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TurnoService } from '../../services/turno.service';
import {
    EstadoTurno,
    TurnoApp,
    TurnoFirestore,
} from '../../interfaces/user-details.interface';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { TurnoCardComponent } from '../../components/turno-card/turno-card.component';
import { tap } from 'rxjs';

@Component({
    selector: 'app-mis-turnos-page',
    standalone: true,
    imports: [FormsModule, TurnoCardComponent],
    templateUrl: './mis-turnos-page.component.html',
    styleUrl: './mis-turnos-page.component.css',
})
export class MisTurnosPageComponent {
    protected authService = inject(AuthService);
    private turnoService = inject(TurnoService);
    private spinner = inject(NgxSpinnerService);

    protected turnos: TurnoApp[] = [];
    protected fileteredTurnos: TurnoApp[] = [];

    protected filterText = '';

    constructor() {
        effect(() => {
            this.spinner.show();
            const currentUser = this.authService.currentUserSig();

            if (currentUser?.uid) {
                let turnos$;
                if (currentUser.role === 'patient') {
                    turnos$ = this.turnoService.getTurnosPaciente(
                        currentUser.uid
                    );
                } else if (currentUser.role === 'specialist') {
                    turnos$ = this.turnoService.getTurnosEspecialista(
                        currentUser.uid
                    );
                } else if (currentUser.role === 'admin') {
                    turnos$ = this.turnoService.getAllWithNestedObjects();
                }

                turnos$
                    ?.pipe(tap(() => this.spinner.hide()))
                    .subscribe((turnos) => {
                        this.turnos = turnos;
                        this.fileteredTurnos = turnos;
                    });
            } else {
                this.spinner.hide();
            }
        });
    }

    onFilterChange() {
        const normalizeText = (text: string) =>
            text
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase();

        const normalizedFilerText = normalizeText(this.filterText);

        this.fileteredTurnos = this.turnos.filter((turno) => {
            let filters = '';
            filters += normalizeText(turno.especialidad);

            if (this.authService.currentUserSig()?.role === 'specialist') {
                filters += normalizeText(
                    turno.patient.nombre + ' ' + turno.patient.apellido
                );
            } else {
                filters += normalizeText(
                    turno.specialist.nombre + ' ' + turno.specialist.apellido
                );
            }

            return filters.includes(normalizedFilerText);
        });
    }
}
