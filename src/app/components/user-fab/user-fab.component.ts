import { Component, inject, Input } from '@angular/core';
import {
    Paciente,
    TurnoApp,
    UserDetails,
} from '../../interfaces/user-details.interface';
import { UserService } from '../../services/user.service';

import { ToastrService } from 'ngx-toastr';
import { TurnoService } from '../../services/turno.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ExcelService } from '../../services/excel.service';
import { FullNamePipe } from '../../pipes/full-name.pipe'
import { TooltipDirective } from '../../directives/tooltip.directive';

@Component({
    selector: 'app-user-fab',
    standalone: true,
    imports: [FullNamePipe, TooltipDirective],
    templateUrl: './user-fab.component.html',
    styleUrl: './user-fab.component.css',
})
export class UserFABComponent {
    private turnoService = inject(TurnoService);
    private toastr = inject(ToastrService);
    private spinner = inject(NgxSpinnerService);
    private excelService = inject(ExcelService);

    @Input() user!: UserDetails;

    protected turnosPaciente: TurnoApp[] = [];

    protected specialistActivated = false;

    ngOnInit() {
        this.turnoService
            .getTurnosPaciente(this.user.uid!)
            .subscribe((turnos) => {
                this.turnosPaciente = turnos;
            });
    }

    onUserClick() {
        if (this.turnosPaciente.length === 0) {
            this.toastr.warning('No hay turnos disponibles para exportar');
            return;
        }

        this.spinner.show();
        try {
            this.excelService.exportTurnosToExcel(
                this.turnosPaciente,
                'TurnosPaciente'
            );
            this.toastr.success('Turnos exportados con éxito');
        } catch (error) {
            this.toastr.error('Ocurrió un error al exportar los turnos');
            console.error(error);
        } finally {
            this.spinner.hide();
        }
    }
}
