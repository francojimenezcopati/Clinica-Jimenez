import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HighlightDirective } from '../../directives/highlight.directive';

@Component({
    selector: 'app-nav-bar',
    standalone: true,
    imports: [RouterLink, HighlightDirective],
    templateUrl: './nav-bar.component.html',
    styleUrl: './nav-bar.component.css',
})
export class NavBarComponent {
    authService = inject(AuthService);
	router = inject(Router)

    logout() {
        this.authService.logout();
		this.router.navigateByUrl("/home")
    }
}
