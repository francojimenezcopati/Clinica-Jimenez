import { Component, inject } from '@angular/core';
import { Chart, ChartTypeRegistry, registerables } from 'chart.js';
import { TurnoService } from '../../services/turno.service';
import { UserService } from '../../services/user.service';
import { Timestamp } from '@angular/fire/firestore';
import { LogsService } from '../../services/logs.service';
import {
    EstadoTurno,
    Log,
    TurnoApp,
} from '../../interfaces/user-details.interface';
import { NgxSpinnerService } from 'ngx-spinner';
import { map, Observable } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ToastrService } from 'ngx-toastr';
import { ExcelService } from '../../services/excel.service';

@Component({
    selector: 'app-graphics',
    standalone: true,
    imports: [],
    templateUrl: './graphics.component.html',
    styleUrl: './graphics.component.css',
})
export class GraphicsComponent {
    private turnoService = inject(TurnoService);
    private spinner = inject(NgxSpinnerService);
    private logsService = inject(LogsService);
    private excelService = inject(ExcelService);
    private toastr = inject(ToastrService);

    private charts: Record<string, Chart> = {};

    protected lastLogins: Log[] = [];

    constructor() {
        Chart.register(...registerables);
    }

    ngOnInit(): void {
        this.spinner.show();
        this.loadTurnosPorEspecialidad();
        this.loadTurnosPorDia();
        this.loadLogIngresos();
    }

    private loadLogIngresos() {
        this.logsService.getAll().subscribe((logs) => {
            const lastLogins: Log[] = logs;

            const sortedLastLogins = lastLogins.sort((a, b) => {
                if (a.fecha === '-') return 1;
                if (b.fecha === '-') return -1;

                const [mesA, diaA, añoA] = a.fecha.split('/').map(Number);
                const [mesB, diaB, añoB] = b.fecha.split('/').map(Number);

                const fechaA = new Date(añoA, mesA - 1, diaA);
                const fechaB = new Date(añoB, mesB - 1, diaB);

                if (fechaA.getTime() === fechaB.getTime()) {
                    const [horaA, minA] = a.hora.split(':').map(Number);
                    const [horaB, minB] = b.hora.split(':').map(Number);
                    if (horaA === horaB) {
                        return minB - minA;
                    }
                    return horaB - horaA;
                }

                return fechaB.getTime() - fechaA.getTime();
            });

            this.lastLogins = sortedLastLogins;

            this.spinner.hide();
        });
    }

    private loadTurnosPorEspecialidad() {
        this.turnoService.getAll().subscribe((turnos) => {
            const especialidades = turnos.map((t) => t.especialidad);
            const counts = this.countOccurrences(especialidades);

            this.createChart(
                'turnosPorEspecialidadChart',
                Object.keys(counts),
                Object.values(counts),
                'Turnos por Especialidad',
                'pie'
            );
        });
    }

    private loadTurnosPorDia() {
        this.turnoService.getAll().subscribe((turnos) => {
            const fechas = turnos.map((t) => t.fecha.split(' ')[0]);

            const sortedFechas = fechas.sort((a, b) => {
                const [mesA, diaA] = a.split('-').map(Number);
                const [mesB, diaB] = b.split('-').map(Number);

                const fechaA = new Date(2024, mesA - 1, diaA);
                const fechaB = new Date(2024, mesB - 1, diaB);
                return fechaB.getTime() - fechaA.getTime();
            });

            const counts = this.countOccurrences(sortedFechas);

            this.createChart(
                'turnosPorDiaChart',
                Object.keys(counts),
                Object.values(counts),
                'Turnos por Día',
                'bar'
            );
        });
    }

    private loadTurnosLapso(date: Date): Observable<TurnoApp[]> {
        return this.turnoService.getAllWithNestedObjects().pipe(
            map((turnos) => {
                return turnos.filter((t) => {
                    const dateTurno = this.parseCustomDate(t.fecha, t.hora);
                    return date < dateTurno;
                });
            })
        );
    }

    private parseCustomDate(fecha: string, hora: string): Date {
        const [dia, mesConTexto] = fecha.split('-');
        const mes = mesConTexto.split(' ')[0];

        const year = new Date().getFullYear();

        const [horas, minutos] = hora.split(':').map(Number);

        return new Date(year, Number(mes) - 1, Number(dia), horas, minutos);
    }

    public loadTurnosSolicitadosMedicoLapso(
        target: any,
        estado: 'finalizado' | 'solicitado'
    ) {
        this.spinner.show();
        const date = new Date(target.value);
        if (date) {
            this.loadTurnosLapso(date).subscribe((turnos) => {
                const listaEspecialistas: string[] = [];
                turnos.forEach((t) => {
                    if (t.estado === estado) {
                        listaEspecialistas.push(
                            t.specialist.nombre + ' ' + t.specialist.apellido
                        );
                    }
                });

                const counts = this.countOccurrences(listaEspecialistas);

                this.createChart(
                    `turnos${
                        estado.charAt(0).toUpperCase() + estado.slice(1)
                    }sPorMedicoEnLapso`,
                    Object.keys(counts),
                    Object.values(counts),
                    `Turnos ${estado}s por médico`,
                    'doughnut'
                );

                this.spinner.hide();
            });
        }
    }

    private countOccurrences(array: string[]): Record<string, number> {
        return array.reduce((acc: Record<string, number>, value: string) => {
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
    }

    private createChart(
        chartId: string,
        labels: string[],
        data: number[],
        title: string,
        type: keyof ChartTypeRegistry
    ) {
        // Destruir el gráfico existente si ya existe
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
        }

        let dataOptions: any;
        let scales: any;
        if (type !== 'pie' && type !== 'doughnut') {
            dataOptions = {
                label: title,
                data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            };
            scales = {
                x: {
                    ticks: {
                        color: '#fff',
                    },
                },
                y: {
                    ticks: {
                        color: '#fff',
                    },
                },
            };
        } else {
            dataOptions = {
                label: title,
                data,
            };
            scales = {};
        }

        this.charts[chartId] = new Chart(chartId, {
            type: type,
            data: {
                labels,
                datasets: [dataOptions],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#fff',
                        },
                    },
                    title: { display: true, text: title, color: '#fff' },
                },
                color: '#fff',
                scales,
            },
        });
    }

    public exportExcel() {
        const fileName = `Logs`;
        this.excelService.exportLogsToExcel(this.lastLogins, fileName);
    }

    public downloadChartAsPDF(chartId: string) {
        const chart = this.charts[chartId];
        const fileName = `${chartId}_${Date.now()}`;

        if (chart) {
            chart.options.plugins!.legend!.labels!.color = '#000';
            chart.options.color = '#000';
            chart.options.plugins!.title!.color = '#000';
            if (chart.options.scales!['x']) {
                (chart.options.scales!['x'] as any).ticks.color = '#000';
                (chart.options.scales!['y'] as any).ticks.color = '#000';
            }

            chart.update();

            const canvas = chart.canvas as HTMLCanvasElement;

            setTimeout(() => {
                html2canvas(canvas).then((canvasElement) => {
                    const imgData = canvasElement.toDataURL('image/png');

                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const pageHeight = pdf.internal.pageSize.getHeight();

                    const canvasWidth = canvas.width;
                    const canvasHeight = canvas.height;
                    const aspectRatio = canvasHeight / canvasWidth;
                    const imgWidth = pageWidth * 0.9;
                    const imgHeight = imgWidth * aspectRatio;

                    const xOffset = (pageWidth - imgWidth) / 2;
                    const yOffset = (pageHeight - imgHeight) / 2;

                    pdf.addImage(
                        imgData,
                        'PNG',
                        xOffset,
                        yOffset,
                        imgWidth,
                        imgHeight
                    );
                    pdf.save(`${fileName}.pdf`);

                    chart.options.plugins!.legend!.labels!.color = '#fff';
                    chart.options.color = '#fff';
                    chart.options.plugins!.title!.color = '#fff';
                    if (chart.options.scales!['x']) {
                        (chart.options.scales!['x'] as any).ticks.color =
                            '#fff';
                        (chart.options.scales!['y'] as any).ticks.color =
                            '#fff';
                    }

                    chart.update();
                });
            }, 500);
        } else {
            this.toastr.error('Tienes que generar el gráfico antes...');
        }
    }
}
