import {
    Directive,
    ElementRef,
    Renderer2,
    HostListener,
    Input,
} from '@angular/core';

@Directive({
    selector: '[appHighlight]',
    standalone: true,
})
export class HighlightDirective {
    @Input('appHighlight') highlightColor: string = '#ffeb3b'; // Color de resaltado predeterminado
    @Input() defaultColor: string = 'transparent'; // Color predeterminado al salir del hover

    constructor(private el: ElementRef, private renderer: Renderer2) {}

    @HostListener('mouseenter') onMouseEnter() {
        this.setBackgroundColor(this.highlightColor);
    }

    @HostListener('mouseleave') onMouseLeave() {
        this.setBackgroundColor(this.defaultColor);
    }

    private setBackgroundColor(color: string) {
        this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', color);
    }
}
