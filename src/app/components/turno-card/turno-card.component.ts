import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    EstadoTurno,
    TurnoApp,
    TurnoFirestore,
} from '../../interfaces/user-details.interface';
import { AuthService } from '../../services/auth.service';
import { TurnoService } from '../../services/turno.service';

import Swal from 'sweetalert2';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-turno-card',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './turno-card.component.html',
    styleUrl: './turno-card.component.css',
})
export class TurnoCardComponent {
    private spinner = inject(NgxSpinnerService);
    protected authService = inject(AuthService);
    private turnoService = inject(TurnoService);

    @Input() turno!: TurnoApp;

    constructor() {}

    defineButtonText() {
        if (this.authService.currentUserSig()?.role === 'specialist') {
            switch (this.turno.estado) {
                case 'solicitado':
                    return 'Aceptar turno';
                case 'cancelado':
                    return 'Ver comentario';
                case 'rechazado':
                    return 'Ver comentario';
                case 'aceptado':
                    return 'Finalizar turno';
                case 'finalizado':
                    return 'Ver reseña';
                default:
                    return 'Estado desconocido';
            }
        } else {
            if (this.authService.currentUserSig()?.role === 'patient') {
                switch (this.turno.estado) {
                    case 'solicitado':
                        return 'Cancelar turno';
                    case 'cancelado':
                        return 'Ver comentario';
                    case 'aceptado':
                        return 'Cancelar turno';
                    case 'rechazado':
                        return 'Ver comentario';
                    case 'finalizado':
                        return 'Ver reseña';
                    default:
                        return 'Estado desconocido';
                }
            } else {
                if (this.turno.estado === 'solicitado') return 'Cancelar turno';
                else return null;
            }
        }
    }

    defineSecondButtonText() {
        if (this.authService.currentUserSig()?.role === 'specialist') {
            switch (this.turno.estado) {
                case 'solicitado':
                    return 'Rechazar turno';
                case 'aceptado':
                    return 'Cancelar turno';
                default:
                    return null;
            }
        } else if (this.authService.currentUserSig()?.role === 'patient') {
            switch (this.turno.estado) {
                case 'finalizado':
                    if (!this.turno.encuesta) {
                        return 'Completar encuesta';
                    } else {
                        return null;
                    }
                default:
                    return null;
            }
        } else {
            return null;
        }
    }

    private defineButtonAction(): {
        nextState?: EstadoTurno;
        action?: Function;
    } {
        if (this.authService.currentUserSig()?.role === 'specialist') {
            switch (this.turno.estado) {
                case 'solicitado':
                    return { nextState: 'aceptado' };
                case 'cancelado':
                    return { action: this.openComentarioModal };
                case 'rechazado':
                    return { action: this.openComentarioModal };
                case 'aceptado':
                    return {
                        nextState: 'finalizado',
                        action: this.openReseñaModal,
                    };
                case 'finalizado': // tengo que poder ver la encuesta del usuario si la hay
                    return { action: this.openReseñaModal };
            }
        } else {
            if (this.authService.currentUserSig()?.role === 'patient') {
                switch (this.turno.estado) {
                    case 'solicitado':
                        return {
                            nextState: 'cancelado',
                            action: this.openComentarioModal,
                        };
                    case 'cancelado':
                        return { action: this.openComentarioModal };
                    case 'aceptado':
                        return {
                            nextState: 'cancelado',
                            action: this.openComentarioModal,
                        };
                    case 'rechazado':
                        return { action: this.openComentarioModal };
                    case 'finalizado':
                        return { action: this.openReseñaModal };
                }
            } else {
                if (this.turno.estado === 'solicitado')
                    return {
                        nextState: 'cancelado',
                        action: this.openComentarioModal,
                    };
                else return {};
            }
        }
    }

    private defineSecondButtonAction(): {
        nextState?: EstadoTurno;
        action?: Function;
    } {
        if (this.authService.currentUserSig()?.role === 'specialist') {
            switch (this.turno.estado) {
                case 'solicitado':
                    return {
                        nextState: 'rechazado',
                        action: this.openComentarioModal,
                    };
                case 'aceptado':
                    return {
                        nextState: 'cancelado',
                        action: this.openComentarioModal,
                    };
                default:
                    return {};
            }
        } else {
            if (this.authService.currentUserSig()?.role === 'patient') {
                switch (this.turno.estado) {
                    case 'finalizado':
                        if (!this.turno.encuesta) {
                            return { action: this.openEncuestaModal };
                        } else {
                            return {};
                        }
                    default:
                        return {};
                }
            } else return {};
        }
    }

    private async openEncuestaModal() {
        if (!this.turno.encuesta) {
            const { value: formValues } = await Swal.fire({
                title: 'Encuesta',
                html:
                    `<input id="comentario" style="width: 430px;" class="swal2-input encuesta-input" placeholder="Comenta sobre tu experiencia general">` +
                    `<input id="calificacion" style="width: 430px;" class="swal2-input encuesta-input" placeholder="¿Cómo fue la atención del especialista?">`,
                focusConfirm: false,
                width: '600px',
                customClass: {
                    input: 'encuesta-input',
                },
                showCancelButton: true,
                preConfirm: () => {
                    const comentario = (
                        document.getElementById(
                            'comentario'
                        ) as HTMLInputElement
                    ).value;
                    const calificacion = (
                        document.getElementById(
                            'calificacion'
                        ) as HTMLInputElement
                    ).value;
                    return { comentario, calificacion };
                },
            });

            if (
                formValues &&
                formValues.comentario !== '' &&
                formValues.calificacion !== ''
            ) {
                this.turno.encuesta = formValues.comentario;
                this.turno.calificacion = formValues.calificacion;
                return true;
            }
            return false;
        }
        return false;
    }

    private async openComentarioModal() {
        if (!this.turno.comentario) {
            const { value: comentario } = await Swal.fire({
                title: 'Comentario',
                input: 'text',
                inputPlaceholder: 'Deja un comentario explicando el por qué...',
                showCancelButton: true,
            });

            if (comentario) {
                this.turno.comentario = comentario;
                return true;
            }
            return false;
        } else {
            await Swal.fire({
                title: 'Comentario',
                text: `Comentario: ${this.turno.comentario}`,
                icon: 'info',
            });
            return false;
        }
    }

    private async openReseñaModal() {
        if (!this.turno.reseña) {
            const { value: reseña } = await Swal.fire({
                title: 'Reseña',
                input: 'text',
                inputPlaceholder: 'Deja una reseña...',
                showCancelButton: true,
            });

            if (reseña) {
                this.turno.reseña = reseña;
                return true;
            }
            return false;
        } else {
            if (!this.turno.encuesta) {
                await Swal.fire({
                    title: 'Reseña',
                    text: `Reseña: ${this.turno.reseña}`,
                    icon: 'info',
                });
            } else {
                await Swal.fire({
                    title: 'Reseña completa',
                    html:
                        `<p>Reseña: ${this.turno.reseña}</p>` +
                        '<br/>' +
                        `<p>Encuesta: ${this.turno.encuesta}</p>` +
                        '<br/>' +
                        `<p>Calificación: ${this.turno.calificacion}</p>`,
                    icon: 'info',
                });
            }
            return false;
        }
    }

    async onPrimaryButtonClick() {
        const { nextState, action } = this.defineButtonAction();
        let needsUpdate = false;

        if (action) {
            needsUpdate = await action.call(this);
        }
        if (nextState) {
            if (nextState === 'aceptado') {
                console.log(nextState);
                this.turno.estado = nextState;
                needsUpdate = true;
            } else {
                if (needsUpdate) {
                    console.log(nextState);
                    this.turno.estado = nextState;
                    needsUpdate = true;
                }
            }
        }

        if (needsUpdate) {
            this.updateTurno();
        }
    }

    async onSecondaryButtonClick() {
        const { nextState, action } = this.defineSecondButtonAction();
        let needsUpdate = false;

        if (action) {
            needsUpdate = await action.call(this);
        }
        if (nextState) {
            if (nextState === 'aceptado') {
                console.log(nextState);
                this.turno.estado = nextState;
                needsUpdate = true;
            } else {
                if (needsUpdate) {
                    console.log(nextState);
                    this.turno.estado = nextState;
                    needsUpdate = true;
                }
            }
        }

        if (needsUpdate) {
            this.updateTurno();
        }
    }

    private async updateTurno() {
        this.spinner.show();

        const { patient, specialist, ...newTurno } = this.turno;
        const turnoFirestore: TurnoFirestore = {
            ...newTurno,
            patientId: patient.uid!,
            specialistId: specialist.uid!,
        };

        await this.turnoService.update(turnoFirestore);

        this.spinner.hide();
    }
}
