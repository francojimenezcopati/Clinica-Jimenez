import { Component, Input } from '@angular/core';
import { UserDetails } from '../../interfaces/user-details.interface';
import { UserCardComponent } from '../user-card/user-card.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-users-list',
    standalone: true,
    imports: [UserCardComponent, CommonModule],
    templateUrl: './users-list.component.html',
    styleUrl: './users-list.component.css',
})
export class UsersListComponent {
    @Input() users: UserDetails[] = [];

    constructor() {}
}
