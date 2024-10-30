import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-auth-form-login',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, CommonModule],
    templateUrl: './auth-form-login.component.html',
    styleUrl: './auth-form-login.component.css',
})
export class AuthFormLoginComponent {
    credentials: FormGroup;

    constructor(
        private router: Router,
        private authService: AuthService,
        private fb: FormBuilder,
        private toastr: ToastrService
    ) {
        this.credentials = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

    get email() {
        return this.credentials.get('email');
    }

    get password() {
        return this.credentials.get('password');
    }

    protected handleFormErrors(controlName: string): string | null {
        for (const [key, value] of Object.entries(this.credentials.controls)) {
            if (key === controlName && value.errors && value.touched) {
                if (value.hasError('required')) {
                    return 'Este campo es obligatorio';
                } else {
                    if (value.hasError('email')) return 'El email no es valido';
                    if (value.hasError('minlength'))
                        return 'La contraseña debe tener mínimo 6 caracteres';

                    if (value.hasError('min') || value.hasError('max'))
                        return 'El dni debe ser de 8 dígitos';
                }
            }
        }
        return null;
    }

    public async onSubmit() {
        this.login();
    }

    public login() {
        this.authService
            .login(this.email?.value, this.password?.value)
            .then(() => {
                this.toastr.success('¡Inicio de sesión exitoso!');
                this.router.navigateByUrl('/home', { replaceUrl: true });
            })
            .catch((err) => {
                this.handleAuthError(err.code);
            });
    }

    public fillInGuest(
        event: MouseEvent,
        guest: 'patient' | 'specialist' | 'admin'
    ) {
        event.preventDefault(); // Evita el envío del formulario
        if (guest === 'patient') {
            this.credentials.setValue({
                email: 'patient@pokemail.net',
                password: 'password',
            });
        } else if (guest === 'specialist') {
            this.credentials.setValue({
                email: 'specialist@pokemail.net',
                password: 'password',
            });
        } else {
            this.credentials.setValue({
                email: 'administrador@pokemail.net',
                password: 'password',
            });
        }
    }

    private handleAuthError(errorCode: string) {
        switch (errorCode) {
            case 'auth/unverified-email':
                Swal.fire({
                    title: 'Error',
                    text: 'Email no verificado, por favor revisa tu bandeja de entrada',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6',
                });
                break;
            case 'auth/user-disabled':
                Swal.fire({
                    title: 'Error',
                    text: 'La cuenta del especialista esta deshabilitada',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6',
                });
                break;

            case 'auth/email-already-in-use':
                this.toastr.error(
                    'El correo electrónico ya está en uso.',
                    'Error'
                );
                break;
            case 'auth/invalid-email':
                this.toastr.error(
                    'El correo electrónico no es válido.',
                    'Error'
                );
                break;
            case 'auth/invalid-credential':
                this.toastr.error('Email y/o contraseña incorrectos', 'Error');
                break;
            case 'auth/operation-not-allowed':
                this.toastr.error(
                    'Las cuentas de email/contraseña no están habilitadas.',
                    'Error'
                );
                break;
            case 'auth/weak-password':
                this.toastr.error('La contraseña es demasiado débil.', 'Error');
                break;
            case 'auth/user-not-found':
                this.toastr.error(
                    'No existe un usuario con este correo electrónico.',
                    'Error'
                );
                break;
            case 'auth/wrong-password':
                this.toastr.error('La contraseña es incorrecta.', 'Error');
                break;
            case 'auth/too-many-requests':
                this.toastr.error(
                    'Demasiadas solicitudes. Intenta de nuevo más tarde.',
                    'Error'
                );
                break;
            default:
                this.toastr.error('Ocurrió un error desconocido.', 'Error');
                break;
        }
    }
}
