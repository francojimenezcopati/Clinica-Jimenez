import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Log, TurnoApp } from '../interfaces/user-details.interface';

@Injectable({
    providedIn: 'root',
})
export class ExcelService {
    constructor() {}

    exportTurnosToExcel(turnos: TurnoApp[], fileName: string): void {
        const columns = [
            'Fecha',
            'Hora',
            'Especialidad',
            'Paciente',
            'Especialista',
            'Estado',
        ];

        const orderedTurns = turnos
            .map((turno) => ({
                ...turno,
                fechaOrdenable: this.convertirFecha(turno.fecha),
            }))
            .sort((a, b) => b.fechaOrdenable - a.fechaOrdenable);

        const rows = orderedTurns.map((turno) => [
            turno.fecha,
            turno.hora,
            turno.especialidad,
            `${turno.patient.nombre} ${turno.patient.apellido}`,
            `${turno.specialist.nombre} ${turno.specialist.apellido}`,
            turno.estado,
        ]);

        const worksheetData = [columns, ...rows];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook: XLSX.WorkBook = {
            Sheets: { Turnos: worksheet },
            SheetNames: ['Turnos'],
        };

        XLSX.writeFile(workbook, `${fileName}_${Date.now()}.xlsx`);
    }

    exportLogsToExcel(logs: Log[], fileName: string) {
        const columns = [
            'Usuario',
			'Fecha',
			'Hora'
        ];

        const rows = logs.map((log) => [
			log.user,
            log.fecha,
            log.hora,
        ]);

        const worksheetData = [columns, ...rows];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook: XLSX.WorkBook = {
            Sheets: { Logs: worksheet },
            SheetNames: ['Logs'],
        };

        XLSX.writeFile(workbook, `${fileName}_${Date.now()}.xlsx`);
    }

    private convertirFecha(fecha: string): number {
        const [dia, mes] = fecha.split(' ')[0].split('-').map(Number);

        const ahora = new Date();
        return new Date(ahora.getFullYear(), mes - 1, dia).getTime();
    }
}
