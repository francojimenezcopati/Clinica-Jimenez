import { Component, inject } from '@angular/core';
import { AuthPageComponent } from '../auth-page/auth-page.component';
import { UserService } from '../../services/user.service';
import { Paciente, UserDetails } from '../../interfaces/user-details.interface';
import { UsersListComponent } from '../../components/users-list/users-list.component';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-users-page',
    standalone: true,
    imports: [AuthPageComponent, UsersListComponent],
    templateUrl: './users-page.component.html',
    styleUrl: './users-page.component.css',
})
export class UsersPageComponent {
    private userService = inject(UserService);
    private spinner = inject(NgxSpinnerService);

    protected componentSwitcher = [true, false, false];

    protected users: UserDetails[] = [];
    protected patients: Paciente[] = [];

    constructor() {
        this.spinner.show();

        this.userService.getAll().subscribe((users) => {
            this.users = users;
            this.patients = users.filter(
                (user) => user.role === 'patient'
            ) as Paciente[];

            this.spinner.hide();
        });
    }
}
