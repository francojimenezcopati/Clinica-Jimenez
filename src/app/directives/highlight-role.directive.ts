import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
    selector: '[appHighlightRole]',
    standalone: true,
})
export class HighlightRoleDirective {
    @Input('appHighlightRole') role:
        | 'patient'
        | 'specialist'
        | 'admin'
        | undefined;

    constructor(private el: ElementRef) {}

    ngOnChanges(): void {
        const colors = {
            patient: 'lightblue',
            specialist: 'lightgreen',
            admin: 'gold',
        };

        this.el.nativeElement.style.backgroundColor = this.role
            ? colors[this.role]
            : 'transparent';
    }
}
