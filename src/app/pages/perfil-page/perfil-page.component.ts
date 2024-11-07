import { Component, effect, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import {
    Admin,
    Especialista,
    Horarios,
    Paciente,
    UserDetails,
} from '../../interfaces/user-details.interface';

import Swal from 'sweetalert2';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-perfil-page',
    standalone: true,
    imports: [],
    templateUrl: './perfil-page.component.html',
    styleUrl: './perfil-page.component.css',
})
export class PerfilPageComponent {
    protected authService = inject(AuthService);
    private userService = inject(UserService);

    protected isAdmin = false;
    protected isSpecialist = false;
    protected isPatient = false;

    diaSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    horariosDiaSemana = [
        '08:00',
        '08:30',
        '09:00',
        '09:30',
        '10:00',
        '10:30',
        '11:00',
        '11:30',
        '12:00',
        '12:30',
        '13:00',
        '13:30',
        '14:00',
        '14:30',
        '15:00',
        '15:30',
        '16:00',
        '16:30',
        '17:00',
        '17:30',
        '18:00',
        '18:30',
        '19:00',
    ];
    horariosSabado = [
        '08:00',
        '08:30',
        '09:00',
        '09:30',
        '10:00',
        '10:30',
        '11:00',
        '11:30',
        '12:00',
        '12:30',
        '13:00',
        '13:30',
        '14:00',
    ];

    protected selectedHorarios: Horarios | null = null;

    constructor() {
        effect(() => {
            this.isAdmin = false;
            this.isSpecialist = false;
            this.isPatient = false;
            if (this.authService.currentUserSig()) {
                const user = this.authService.currentUserSig() as UserDetails;
                console.log(user);

                if (user.role === 'patient') {
                    this.isPatient = true;
                } else if (user.role === 'specialist') {
                    this.isSpecialist = true;
                    this.selectedHorarios =
                        this.castToEspecialista(user).horariosDisponibles!;
                    console.log(this.selectedHorarios);
                    console.log(this.castToEspecialista(user));
                } else {
                    this.isAdmin = true;
                }
            }
        });
    }

    onHorarioClick() {
        Swal.fire({
            title: '<h2 class="text-xl font-bold">Seleccionar disponibilidad horaria</h2>',
            html: `
        <div class="">
            <table class="w-full border-collapse">
                <thead>
                    <tr class="bg-gray-200 text-gray-700 text-sm w-fit">
                        <th class="p-2 border-b font-bold">Día</th>
                        ${this.horariosDiaSemana
                            .map(
                                (horario) =>
                                    `<th class="p-2 border-b w-fit text-nowrap font-bold">${horario}</th>`
                            )
                            .join('')}
                    </tr>
                </thead>
                <tbody>
                    ${this.diaSemana
                        .map(
                            (dia) => `
                        <tr class="text-center">
                            <td class="p-2 border-b capitalize text-nowrap font-bold">${dia}</td>
                            ${this.horariosDiaSemana
                                .map((horario, index) => {
                                    const isWeekend = dia === 'sabado';
                                    const isAvailableWeekend =
                                        this.horariosSabado.includes(horario);

                                    // Verificar si el horario está en selectedHorarios <-- no funciona
                                    const isChecked =
                                        this.selectedHorarios &&
                                        this.selectedHorarios[
                                            dia as keyof Horarios
                                        ]?.includes(horario);

                                    return `
                                    <td class="p-2 border-b">
                                        ${
                                            !isWeekend || isAvailableWeekend
                                                ? `<input type="checkbox" class="form-checkbox" id="${dia}-${index}" data-dia="${dia}" data-horario="${horario}" ${
                                                      isChecked ? 'checked' : ''
                                                  }>`
                                                : '-'
                                        }
                                    </td>
                                `;
                                })
                                .join('')}
                        </tr>
                    `
                        )
                        .join('')}
                </tbody>
            </table>
        </div>
        `,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            width: '90%',
            customClass: {
                popup: 'bg-white p-6 rounded-lg shadow-lg',
                confirmButton:
                    'bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded',
                cancelButton:
                    'bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded',
            },
            preConfirm: () => {
                const selectedHorarios: Horarios = {
                    lunes: [],
                    martes: [],
                    miercoles: [],
                    jueves: [],
                    viernes: [],
                    sabado: [],
                };

                // Obtener todos los checkboxes seleccionados
                const checkboxes = document.querySelectorAll<HTMLInputElement>(
                    'input[type="checkbox"]:checked'
                );
                checkboxes.forEach((checkbox) => {
                    const dia = checkbox.getAttribute(
                        'data-dia'
                    ) as keyof Horarios;
                    const horario = checkbox.getAttribute('data-horario')!;
                    selectedHorarios[dia].push(horario);
                });

                return selectedHorarios;
            },
        }).then((result) => {
            if (result.isConfirmed) {
                const selectedHorarios: Horarios = result.value;
                console.log('Horarios seleccionados:', selectedHorarios);

                this.selectedHorarios = selectedHorarios;
                this.updateSpecialist();
            }
        });
    }

    private updateSpecialist() {
        const specialist = {
            ...(this.authService.currentUserSig() as Especialista),
            horariosDisponibles: this.selectedHorarios,
        } as Especialista;
        this.userService.updateSpecialist(specialist);
    }

    castToAdmin(user: UserDetails) {
        return user as Admin;
    }

    castToEspecialista(user: UserDetails) {
        return user as Especialista;
    }

    castToPaciente(user: UserDetails) {
        return user as Paciente;
    }
}
