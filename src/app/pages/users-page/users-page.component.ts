import { Component, inject } from '@angular/core';
import { AuthPageComponent } from '../auth-page/auth-page.component';
import { UserService } from '../../services/user.service';
import { UserDetails } from '../../interfaces/user-details.interface';
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
	private spinner = inject(NgxSpinnerService)

    protected verUsuarios = true;

    protected users: UserDetails[] = [];

    constructor() {
		this.spinner.show()

        this.userService.getAll().subscribe((users) => {
            this.users = users;
			this.spinner.hide()
        });
    }


}
