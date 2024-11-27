import {
    Directive,
    ElementRef,
    Input,
    Renderer2,
    HostListener,
} from '@angular/core';

@Directive({
    selector: '[appTooltip]',
    standalone: true,
})
export class TooltipDirective {
    @Input('appTooltip') tooltipText: string = '';
    private tooltipElement: HTMLElement | null = null;

    constructor(private el: ElementRef, private renderer: Renderer2) {}

    @HostListener('mouseenter') onMouseEnter() {
        if (!this.tooltipText) return;

        // Crear el elemento del tooltip
        this.tooltipElement = this.renderer.createElement('div');
        const text = this.renderer.createText(this.tooltipText);
        this.renderer.appendChild(this.tooltipElement, text);

        // Estilizar el tooltip
        this.renderer.setStyle(this.tooltipElement, 'position', 'fixed');
        this.renderer.setStyle(this.tooltipElement, 'background', '#f9f9f9');
        this.renderer.setStyle(this.tooltipElement, 'color', '#222');
        this.renderer.setStyle(this.tooltipElement, 'padding', '8px');
        this.renderer.setStyle(this.tooltipElement, 'borderRadius', '4px');
        this.renderer.setStyle(this.tooltipElement, 'fontSize', '12px');
        this.renderer.setStyle(this.tooltipElement, 'zIndex', '1000');
        this.renderer.setStyle(this.tooltipElement, 'pointerEvents', 'none');

        // Añadir el tooltip al DOM
        this.renderer.appendChild(document.body, this.tooltipElement);

        // Posicionar el tooltip
        const rect = this.el.nativeElement.getBoundingClientRect();
        const tooltipRect = this.tooltipElement!.getBoundingClientRect();

        const top = rect.top - tooltipRect.height - 10;
        const left = rect.left + (rect.width - tooltipRect.width) / 2;

        this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
        this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
    }

    @HostListener('mouseleave') onMouseLeave() {
        if (this.tooltipElement) {
            this.renderer.removeChild(document.body, this.tooltipElement);
            this.tooltipElement = null;
        }
    }
}
