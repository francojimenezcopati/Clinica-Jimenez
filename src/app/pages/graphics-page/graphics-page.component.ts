import { Component } from '@angular/core';
import { GraphicsComponent } from '../../components/graphics/graphics.component';

@Component({
    selector: 'app-graphics-page',
    standalone: true,
    imports: [GraphicsComponent],
    templateUrl: './graphics-page.component.html',
    styleUrl: './graphics-page.component.css',
})
export class GraphicsPageComponent {}
