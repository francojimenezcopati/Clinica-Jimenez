import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import {
    Especialista,
    Horarios,
    TurnoFirestore,
} from '../../interfaces/user-details.interface';
import { TurnoService } from '../../services/turno.service';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
    selector: 'app-solicitar-turno-page',
    standalone: true,
    imports: [],
    templateUrl: './solicitar-turno-page.component.html',
    styleUrl: './solicitar-turno-page.component.css',
})
export class SolicitarTurnoPageComponent {
    protected authService = inject(AuthService);
    private userService = inject(UserService);
    private turnoService = inject(TurnoService);
    private spinner = inject(NgxSpinnerService);
    private router = inject(Router);

    protected specialists: Especialista[] = [];
    protected uniqueSpecialties: string[] = [];

    protected selectedSpecialtie: string = '';
    protected specialistsOfSelectedSpecialtie: Especialista[] = [];

    protected selectedSpecialist: Especialista | null = null;
    protected availableTurns: Horarios | null = null;

    protected dias: (keyof Horarios)[] = [];
    protected horarios: string[] = [];
    private daysOrder: (keyof Horarios)[] = [
        'lunes',
        'martes',
        'miercoles',
        'jueves',
        'viernes',
        'sabado',
    ];

    constructor() {
        this.userService.getAll().subscribe((users) => {
            this.specialists = users.filter(
                (user) => user.role === 'specialist'
            ) as Especialista[];

            const allSpecialties = this.specialists.flatMap(
                (specialist) => specialist.especialidades
            );

            // Elimino duplicados usando Set
            this.uniqueSpecialties = Array.from(new Set(allSpecialties));
        });
    }

    onEspecialidadClick(especialidad: string) {
        this.selectedSpecialtie = especialidad;

        this.specialistsOfSelectedSpecialtie = this.specialists.filter((s) =>
            s.especialidades.includes(especialidad)
        );
    }

    onSpecialistClick(specialist: Especialista) {
        this.selectedSpecialist = specialist;
        this.availableTurns = specialist.horariosDisponibles ?? null;

        if (this.availableTurns) {
            this.dias = Object.keys(this.availableTurns) as (keyof Horarios)[];
            this.dias.sort(
                (a, b) => this.daysOrder.indexOf(a) - this.daysOrder.indexOf(b)
            );
        }
    }

    async onHorarioClick(dia: string, horario: string) {
        this.spinner.show();

        const turno: TurnoFirestore = {
            dia,
            hora: horario,
            especialidad: this.selectedSpecialtie,
            patientId: this.authService.currentUserSig()?.uid!,
            specialistId: this.selectedSpecialist?.uid!,
        };
        console.log(turno);

        await this.turnoService.saveTurno(turno);

        this.spinner.hide();

        await Swal.fire({
            title: 'Éxito',
            text: 'Has reservado el turno con éxito',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
        });

        this.router.navigateByUrl('/home');
    }
}
