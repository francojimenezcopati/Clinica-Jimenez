import { Pipe, PipeTransform } from '@angular/core';
import { EstadoTurno } from '../interfaces/user-details.interface';

@Pipe({
    name: 'estadoTurno',
    standalone: true,
})
export class EstadoTurnoPipe implements PipeTransform {
    transform(estado: EstadoTurno): string {
        const estados = {
            solicitado: 'Solicitado ❔',
            cancelado: 'Cancelado ❌',
            aceptado: 'Aceptado ☑️',
            rechazado: 'Rechazado ❌',
            finalizado: 'Finalizado ✅',
        };
        return estados[estado] || estado;
    }
}
