import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthFormLoginComponent } from '../../components/auth/auth-form-login/auth-form-login.component';
import { AuthFormPatientComponent } from '../../components/auth/auth-form-patient/auth-form-patient.component';
import { AuthFormSpecialistComponent } from '../../components/auth/auth-form-specialist/auth-form-specialist.component';
import { AuthService } from '../../services/auth.service';
import { AuthFormAdminComponent } from '../../components/auth/auth-form-admin/auth-form-admin.component';

@Component({
    selector: 'app-auth-page',
    standalone: true,
    imports: [
        AuthFormLoginComponent,
        AuthFormPatientComponent,
        AuthFormSpecialistComponent,
        AuthFormAdminComponent,
        RouterLink,
        FormsModule,
    ],
    templateUrl: './auth-page.component.html',
    styleUrl: './auth-page.component.css',
})
export class AuthPageComponent implements OnInit {
    protected authService = inject(AuthService);

    protected authType?: 'login' | 'register' | 'admin';
    protected registerType: 'patient' | 'specialist' | 'admin' = 'patient';

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        // console.log(this.route.parent?.url);
        this.route.url.subscribe((urlSegment) => {
            this.authType = urlSegment[0].path as
                | 'login'
                | 'register'
                | 'admin';
        });
    }

    onValueChange(type: 'patient' | 'specialist' | 'admin') {
        this.registerType = type;
    }
}
