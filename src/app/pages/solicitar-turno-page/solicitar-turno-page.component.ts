import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import {
    DefinedSpecialties,
    Especialista,
    Horarios,
    Paciente,
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

    protected selectedSpecialist: Especialista | null = null;
    protected availableTurns: Horarios | null = null;

    protected selectedSpecialtie: string = '';
    protected specialtiesOfSelectedSpecialist: string[] = [];

    protected selectedFecha: string | null = null;
    protected selectedHora: string | null = null;

    protected fechas: string[] = [];
    protected dias: (keyof Horarios)[] = [];
    protected horarios: string[] = [];

    protected imgSpecialties: Record<DefinedSpecialties, string> = {
        psicología: 'specialties/psicologia.svg',
        fisioterapia: 'specialties/fisioterapia.svg',
        urología: 'specialties/urologia.svg',
        traumatología: 'specialties/traumatologia.svg',
        pediatría: 'specialties/pediatria.svg',
        cardiología: 'specialties/cardiologia.svg',
    };
    protected imgsOfSpecialtiesFromSpecialist: string[] = [];

    private turnosReservados: TurnoFirestore[] = [];

    protected patients: Paciente[] = [];

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

    async ngOnInit() {
        this.turnoService
            .getAll()
            .subscribe((turnos) => (this.turnosReservados = turnos));

        setTimeout(() => {
            if (this.authService.currentUserSig()?.role === 'admin') {
                this.userService
                    .getAllPatients()
                    .subscribe((patients) => (this.patients = patients));
            }
        }, 400);
    }

    onSpecialistClick(specialist: Especialista) {
        this.selectedSpecialist = specialist;
        this.availableTurns = specialist.horariosDisponibles ?? null;
        this.specialtiesOfSelectedSpecialist = specialist.especialidades;

        // seteo url a imagenes
        this.specialtiesOfSelectedSpecialist.forEach((s) => {
            if (s in this.imgSpecialties) {
                this.imgsOfSpecialtiesFromSpecialist.push(
                    this.imgSpecialties[s as DefinedSpecialties]
                );
            } else {
                this.imgsOfSpecialtiesFromSpecialist.push(
                    'specialties/default.svg'
                );
            }
        });

        if (this.availableTurns) {
            this.generateNext15DaysWithAvailableTurns();
        }
    }

    onEspecialidadClick(especialidad: string) {
        this.selectedSpecialtie = especialidad;
    }

    async onHorarioClick(fecha: string, horario: string) {
        if (this.authService.currentUserSig()?.role === 'admin') {
            this.selectedFecha = fecha;
            this.selectedHora = horario;
        } else {
            await this.saveTurn(fecha, horario);

            this.router.navigateByUrl('/home');
        }
    }

    async onPatientClick(patientId: string) {
        await this.saveTurn(this.selectedFecha!, this.selectedHora!, patientId);

        this.router.navigateByUrl('/home');
    }

    private async saveTurn(
        fecha: string = this.selectedFecha!,
        hora: string = this.selectedHora!,
        patientId?: string
    ) {
        this.spinner.show();

        const turno: TurnoFirestore = {
            fecha,
            hora,
            especialidad: this.selectedSpecialtie,
            patientId: patientId || this.authService.currentUserSig()?.uid!,
            specialistId: this.selectedSpecialist?.uid!,
            estado: 'solicitado',
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
    }

    private removeReservedsTurns(fecha: string, dia: keyof Horarios) {
        this.turnosReservados.forEach((turno) => {
            if (
                turno.fecha === fecha &&
                this.availableTurns![dia].includes(turno.hora)
            ) {
                this.availableTurns![dia] = this.availableTurns![dia].filter(
                    (horario) => horario !== turno.hora
                );
            }
        });
    }

    // Generates the next 15 days, formatted with available days from the specialist's schedule
    private generateNext15DaysWithAvailableTurns() {
        const today = new Date();
        this.fechas = [];

        for (let i = 1; i <= 15; i++) {
            const day = new Date(today);
            day.setDate(today.getDate() + i);

            const formattedDate = `${day
                .getDate()
                .toString()
                .padStart(2, '0')}-${(day.getMonth() + 1)
                .toString()
                .padStart(2, '0')} (${day.toLocaleDateString('es-ES', {
                weekday: 'long',
            })})`;

            const weekday = day
                .toLocaleDateString('es-ES', {
                    weekday: 'long',
                })
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') as keyof Horarios; // le saco los tildes

            if (
                this.availableTurns &&
                this.availableTurns[weekday]?.length > 0
            ) {
                this.dias.push(weekday);
                this.fechas.push(formattedDate);
                this.removeReservedsTurns(formattedDate, weekday);
            }
        }
    }

    onBackClicked(stage: 1 | 2 | 3) {
        if (stage === 1) {
            this.selectedSpecialist = null;
            this.availableTurns = null;
            this.specialtiesOfSelectedSpecialist = [];
            this.imgsOfSpecialtiesFromSpecialist = [];
            this.fechas = [];
        } else if (stage === 2) {
            this.selectedSpecialtie = '';
        } else {
            this.selectedFecha = null;
            this.selectedHora = null;
        }
    }
}
