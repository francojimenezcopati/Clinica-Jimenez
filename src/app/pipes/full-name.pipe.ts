import { Pipe, PipeTransform } from '@angular/core';
import { UserDetails } from '../interfaces/user-details.interface';

@Pipe({
    name: 'fullName',
    standalone: true,
})
export class FullNamePipe implements PipeTransform {
    transform(user: UserDetails): string {
        return `${user.nombre} ${user.apellido}`;
    }
}
