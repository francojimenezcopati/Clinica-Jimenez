import { Component, inject, Input } from '@angular/core';
import {
    UserDetails,
    Especialista,
} from '../../interfaces/user-details.interface';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-user-card',
    standalone: true,
    imports: [InputSwitchModule, FormsModule],
    templateUrl: './user-card.component.html',
    styleUrl: './user-card.component.css',
})
export class UserCardComponent {
    private userService = inject(UserService);
    private toastr = inject(ToastrService);

    @Input() user!: UserDetails;

    protected specialistActivated = false;

    constructor() {}

    ngOnInit() {
        if (this.isSpecialist()) {
            this.specialistActivated = (
                this.user as Especialista
            ).estaHabilitado;
        }
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

    private isSpecialist(): boolean {
        return (this.user as Especialista).estaHabilitado !== undefined;
    }
}
