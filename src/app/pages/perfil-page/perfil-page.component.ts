import { Component, effect, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import {
    Admin,
    DefinedSpecialties,
    Especialista,
    HistoriaDatos,
    Horarios,
    Paciente,
    TurnoApp,
    UserDetails,
} from '../../interfaces/user-details.interface';

import Swal from 'sweetalert2';
import { UserService } from '../../services/user.service';
import { TurnoService } from '../../services/turno.service';

import jsPDF from 'jspdf';
import { DateDisplayPipe } from '../../pipes/date-display.pipe';

@Component({
    selector: 'app-perfil-page',
    standalone: true,
    imports: [],
    templateUrl: './perfil-page.component.html',
    styleUrl: './perfil-page.component.css',
    providers: [DateDisplayPipe],
})
export class PerfilPageComponent {
    protected authService = inject(AuthService);
    private userService = inject(UserService);
    private turnoService = inject(TurnoService);
    private dateDisplayPipe = inject(DateDisplayPipe);

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

    protected historiaClinicaTurnos: TurnoApp[] = [];
    protected especialidadesTurnos: (DefinedSpecialties | string)[] = [];

    constructor() {
        effect(() => {
            this.isAdmin = false;
            this.isSpecialist = false;
            this.isPatient = false;
            if (this.authService.currentUserSig()) {
                const user = this.authService.currentUserSig() as UserDetails;
                if (user.role === 'patient') {
                    this.isPatient = true;

                    this.turnoService
                        .getHistoriaClinicaPaciente(user.uid!)
                        .subscribe((turnos) => {
                            this.historiaClinicaTurnos = turnos
                                .map((turno) => ({
                                    ...turno,
                                    fechaOrdenable: this.convertirFecha(
                                        turno.fecha
                                    ),
                                }))
                                .sort(
                                    (a, b) =>
                                        b.fechaOrdenable - a.fechaOrdenable
                                );

                            const allSpecialties =
                                this.historiaClinicaTurnos.flatMap(
                                    (turno) => turno.especialidad
                                );

                            // Elimino duplicados usando Set
                            this.especialidadesTurnos = Array.from(
                                new Set(allSpecialties)
                            );
                        });
                } else if (user.role === 'specialist') {
                    this.isSpecialist = true;
                    this.selectedHorarios =
                        this.castToEspecialista(user).horariosDisponibles!;
                } else {
                    this.isAdmin = true;
                }
            }
        });
        (window as any).angularComponent = this;
    }

    private convertirFecha(fecha: string): number {
        const [dia, mes] = fecha.split(' ')[0].split('-').map(Number);

        const ahora = new Date();
        return new Date(ahora.getFullYear(), mes - 1, dia).getTime();
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

    toggleHistoriaDetails(index: number) {
        const detailsElement = document.getElementById(
            `historia-details-${index}`
        );
        if (detailsElement) {
            detailsElement.classList.toggle('hidden');
        }
    }

    onHistoriaClinicaClick() {
        const turnosHtml =
            this.historiaClinicaTurnos.length === 0
                ? '<h1 class="font-bold text-2xl text-center">No tiene historia clínica</h1>'
                : `<div class="w-full mb-3">
					<button onclick="angularComponent.generateHistoriaClinicaPdf('general')" class="mt-2 text-black bg-cyan-500 hover:bg-cyan-700 py-2 px-4 rounded">
						Generar PDF general
					</button>
					</div>
				` +
                  this.especialidadesTurnos
                      .map((especialidad) => {
                          return `
							<button onclick="angularComponent.generateHistoriaClinicaPdf('${especialidad}')" class="mt-2 text-white bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded">
								Generar PDF ${especialidad}
							</button>
							`;
                      })
                      .join('') +
                  this.historiaClinicaTurnos
                      .map((turno, index) => {
                          const especialistaNombre = `${turno.specialist.nombre} ${turno.specialist.apellido}`;
                          const overviewHtml = `
                <div class="p-4 border-b">
                    <h3 class="font-bold text-lg mb-2">Turno ${index + 1}</h3>
                    <p><strong>Fecha:</strong> ${turno.fecha}</p>
                    <p><strong>Especialista:</strong> ${especialistaNombre}</p>
                    <p><strong>Especialidad:</strong> ${turno.especialidad}</p>
                    <button onclick="angularComponent.toggleHistoriaDetails(${index})" class="mt-2 text-blue-500 underline">
                        Ver detalles de la historia
                    </button>
                    <div id="historia-details-${index}" class="hidden mt-2 p-2 bg-gray-100 rounded">
                        <p><strong>Altura:</strong> ${
                            turno.historia?.fijos.altura ?? 'N/A'
                        }</p>
                        <p><strong>Peso:</strong> ${
                            turno.historia?.fijos.peso ?? 'N/A'
                        }</p>
                        <p><strong>Temperatura:</strong> ${
                            turno.historia?.fijos.temperatura ?? 'N/A'
                        }</p>
                        <p><strong>Presión:</strong> ${
                            turno.historia?.fijos.presion ?? 'N/A'
                        }</p>
                        ${
                            turno.historia?.dinamicos
                                ? Object.entries(turno.historia.dinamicos)
                                      .map(
                                          ([key, value]) =>
                                              `<p><strong>${key}:</strong> ${value}</p>`
                                      )
                                      .join('')
                                : ''
                        }
                    </div>
                </div>
            `;
                          return overviewHtml;
                      })
                      .join('');

        Swal.fire({
            title: '<h2 class="text-2xl font-bold">Historia Clínica</h2>',
            html: `<div>${turnosHtml}</div>`,
            showCloseButton: true,
            showConfirmButton: false,
            width: '600px',
            customClass: {
                popup: 'bg-white p-4 rounded-lg shadow-lg',
            },
        });
    }

    private generateHistoriaClinicaPdf(especialidad: string): void {
        const turnos =
            especialidad === 'general'
                ? this.historiaClinicaTurnos
                : this.historiaClinicaTurnos.filter(
                      (turno) => turno.especialidad === especialidad
                  );

        const doc = new jsPDF();

        const paciente = this.authService.currentUserSig() as Paciente;
        const patientName = `${paciente.nombre} ${paciente.apellido}`;

        const logoData = 'logo_clinica.png';
        doc.addImage(logoData, 'PNG', 67, 10, 70, 50);

        doc.setFontSize(16);
        doc.text('Historia Clinica', 83, 70);

        doc.setFontSize(12);
        doc.text(`Paciente: ${patientName}`, 10, 80);

        const currentDate = this.dateDisplayPipe.transform(new Date());
        doc.text(`Fecha: ${currentDate}`, 10, 90);

        let currentY = 110; // Posición inicial en Y

        turnos.forEach((turno) => {
            currentY = this.generatePdfTurnText(doc, turno, currentY);
        });

        doc.save(`${patientName}_${especialidad}_${currentDate}_HistoriaClinica.pdf`);
    }

    private generatePdfTurnText(
        docRef: jsPDF,
        turno: TurnoApp,
        startY: number
    ): number {
        const historia = turno.historia!;
        let y = startY;
        const lineSpacing = 10; // Espaciado entre líneas
        const pageHeight = 280; // Altura máxima de la página antes del salto
        const startX = 10;

        const writeTextWithPagination = (
            text: string,
            x: number,
            y: number
        ): number => {
            if (y > pageHeight) {
                docRef.addPage();
                y = 20; // Reiniciar posición en la nueva página
            }
            docRef.text(text, x, y);
            return y + lineSpacing;
        };

        y = writeTextWithPagination(`Turno ${turno.fecha}`, startX, y);

        y = writeTextWithPagination('Datos Fijos:', startX + 10, y);
        y = writeTextWithPagination(
            `Altura: ${historia.fijos.altura} cm`,
            startX + 20,
            y
        );
        y = writeTextWithPagination(
            `Peso: ${historia.fijos.peso} kg`,
            startX + 20,
            y
        );
        y = writeTextWithPagination(
            `Temperatura: ${historia.fijos.temperatura} °C`,
            startX + 20,
            y
        );
        y = writeTextWithPagination(
            `Presión: ${historia.fijos.presion}`,
            startX + 20,
            y
        );

        if (historia.dinamicos) {
            y = writeTextWithPagination('Datos Dinámicos:', startX + 10, y);

            Object.entries(historia.dinamicos).forEach(([key, value]) => {
                y = writeTextWithPagination(`${key}: ${value}`, startX + 20, y);
            });
        }

        return y;
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
