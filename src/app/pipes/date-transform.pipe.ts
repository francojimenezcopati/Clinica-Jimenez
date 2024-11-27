import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'dateTransform',
    standalone: true,
})
export class DateTransformPipe implements PipeTransform {
    transform(date: Date): string {
        const optionsDate: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        };

        const formattedDate = date.toLocaleDateString('es-AR', optionsDate);

        return formattedDate;
    }
}
