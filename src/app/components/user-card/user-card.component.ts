import { Component, inject, Input } from '@angular/core';
import {
    UserDetails,
    Especialista,
    TurnoApp,
} from '../../interfaces/user-details.interface';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

import { ToastrService } from 'ngx-toastr';
import { TurnoService } from '../../services/turno.service';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FullNamePipe } from '../../pipes/full-name.pipe'
import { HighlightRoleDirective } from '../../directives/highlight-role.directive';

@Component({
    selector: 'app-user-card',
    standalone: true,
    imports: [InputSwitchModule, FormsModule, FullNamePipe, HighlightRoleDirective],
    templateUrl: './user-card.component.html',
    styleUrl: './user-card.component.css',
})
export class UserCardComponent {
    private userService = inject(UserService);
    private turnoService = inject(TurnoService);
    private toastr = inject(ToastrService);
    private activeRoute = inject(ActivatedRoute);
    private spinner = inject(NgxSpinnerService);

    @Input() user!: UserDetails;

    protected specialistActivated = false;
    protected historiaClinicaTurnos: TurnoApp[] = [];

    protected isPacientesPage = false;
    protected lastThreeTurnsDates: string[] = [];

    constructor() {
        (window as any).angularComponent = this;

        this.activeRoute.url.subscribe((urlSegment) => {
            this.isPacientesPage = urlSegment[0].path === 'pacientes';
        });
    }

    ngOnInit() {
        if (this.user.role === 'specialist') {
            this.specialistActivated = (
                this.user as Especialista
            ).estaHabilitado;
                    this.spinner.hide();
        } else if (this.user.role === 'patient') {
            this.spinner.show();

            this.turnoService
                .getHistoriaClinicaPaciente(this.user.uid!)
                .subscribe((turnos) => {
                    this.historiaClinicaTurnos = turnos
                        .map((turno) => ({
                            ...turno,
                            fechaOrdenable: this.convertirFecha(turno.fecha),
                        }))
                        .sort((a, b) => b.fechaOrdenable - a.fechaOrdenable);

                    this.historiaClinicaTurnos.forEach((turno, index) => {
                        if (index < 3) {
                            this.lastThreeTurnsDates.push(turno.fecha);
                        }
                    });

                    this.spinner.hide();
                });
        }
    }

    private convertirFecha(fecha: string): number {
        // Extrae el día y el mes del formato '13-11 (miércoles)'
        const [dia, mes] = fecha.split(' ')[0].split('-').map(Number);

        // Crea un objeto Date basado en el año actual, mes y día
        const ahora = new Date();
        return new Date(ahora.getFullYear(), mes - 1, dia).getTime();
    }

    protected async onSwitchChange() {
        (this.user as Especialista).estaHabilitado = this.specialistActivated;
        try {
            await this.userService.update(this.user);
            this.toastr.success('Usuario actualizado');
        } catch {
            this.toastr.error('Hubo un error al actualizar el usuario');
        }
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
                ? '<h1 class="font-semibold text-2xl text-center">No tiene historia clínica</h1>'
                : this.historiaClinicaTurnos
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
}
