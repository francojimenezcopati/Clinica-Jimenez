import { Component, effect, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TurnoService } from '../../services/turno.service';
import {
    TurnoApp,
    TurnoFirestore,
} from '../../interfaces/user-details.interface';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-mis-turnos-page',
    standalone: true,
    imports: [],
    templateUrl: './mis-turnos-page.component.html',
    styleUrl: './mis-turnos-page.component.css',
})
export class MisTurnosPageComponent {
    protected authService = inject(AuthService);
    private turnoService = inject(TurnoService);
    private spinner = inject(NgxSpinnerService);

    protected turnos: TurnoApp[] = [];

    constructor() {
        effect(async () => {
            this.spinner.show();
            const currentUser = this.authService.currentUserSig();
            console.log(currentUser?.uid);

            if (currentUser?.uid) {
                this.turnos = await this.turnoService.getTurnosPaciente(
                    currentUser.uid
                );
                this.spinner.hide();
            }

            console.log('ya ta');
            console.log(this.turnos);
        });
    }
}
