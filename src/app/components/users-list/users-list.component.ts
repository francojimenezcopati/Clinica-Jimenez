import { Component, Input } from '@angular/core';
import { Paciente, UserDetails } from '../../interfaces/user-details.interface';
import { UserCardComponent } from '../user-card/user-card.component';
import { CommonModule } from '@angular/common';
import { UserFABComponent } from '../user-fab/user-fab.component';

@Component({
    selector: 'app-users-list',
    standalone: true,
    imports: [UserCardComponent, CommonModule, UserFABComponent],
    templateUrl: './users-list.component.html',
    styleUrl: './users-list.component.css',
})
export class UsersListComponent {
    @Input() users: UserDetails[] = [];
	@Input() isCardStyle = true

    constructor() {}

}
