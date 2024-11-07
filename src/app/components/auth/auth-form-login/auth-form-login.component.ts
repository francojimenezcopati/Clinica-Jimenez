import { Component, inject, Input, OnInit } from '@angular/core';
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

import { MenuItem } from 'primeng/api';
import { SpeedDialModule } from 'primeng/speeddial';
import Swal from 'sweetalert2';
import { UserService } from '../../../services/user.service';

@Component({
    selector: 'app-auth-form-login',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, CommonModule, SpeedDialModule],
    templateUrl: './auth-form-login.component.html',
    styleUrl: './auth-form-login.component.css',
})
export class AuthFormLoginComponent {
    private userService = inject(UserService);

    credentials: FormGroup;

    private guestCredentials = {
        patient1: {
            email: 'patient@pokemail.net',
            password: 'password',
        },
        patient2: {
            email: 'patient2@pokemail.net',
            password: 'password',
        },
        patient3: {
            email: 'patient3@pokemail.net',
            password: 'password',
        },
        specialist1: {
            email: 'specialist@pokemail.net',
            password: 'password',
        },
        specialist2: {
            email: 'specialist2@pokemail.net',
            password: 'password',
        },
        admin: {
            email: 'administrador@pokemail.net',
            password: 'password',
        },
    };

    protected imgPatient1 = '';
    protected imgPatient2 = '';
    protected imgPatient3 = '';
    protected imgSpecialist1 = '';
    protected imgSpecialist2 = '';
    protected imgAdmin = '';

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

    ngOnInit() {
        this.userService.getAll().subscribe((users) => {
            users.forEach((user) => {
                // Verifica si el email del usuario coincide con alguna de las guestCredentials
                if (user.email === this.guestCredentials.patient1.email) {
                    this.imgPatient1 = user.imagenPerfil;
                } else if (
                    user.email === this.guestCredentials.patient2.email
                ) {
                    this.imgPatient2 = user.imagenPerfil;
                } else if (
                    user.email === this.guestCredentials.patient3.email
                ) {
                    this.imgPatient3 = user.imagenPerfil;
                } else if (
                    user.email === this.guestCredentials.specialist1.email
                ) {
                    this.imgSpecialist1 = user.imagenPerfil;
                } else if (
                    user.email === this.guestCredentials.specialist2.email
                ) {
                    this.imgSpecialist2 = user.imagenPerfil;
                } else if (user.email === this.guestCredentials.admin.email) {
                    this.imgAdmin = user.imagenPerfil;
                }
            });
        });
    }

    protected toggleMenu(menuId: string) {
        const menu = document.getElementById(menuId)!;
        menu.classList.toggle('hidden');
        menu.classList.toggle('scale-0');
        menu.classList.toggle('show');
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
        // event: MouseEvent,
        guest:
            | 'patient1'
            | 'patient2'
            | 'patient3'
            | 'specialist1'
            | 'specialist2'
            | 'admin'
    ) {
        this.hideFabButtons();
        // event.preventDefault(); // Evita el envío del formulario
        const selectedGuest = this.guestCredentials[guest];
        this.credentials.setValue({
            email: selectedGuest.email,
            password: selectedGuest.password,
        });
    }

    private hideFabButtons() {
        const lista = [];
        lista.push(document.getElementById('admin-menu')!);
        lista.push(document.getElementById('specialist-menu')!);
        lista.push(document.getElementById('patient-menu')!);

        lista.forEach((menu) => {
            menu.classList.add('hidden');
            menu.classList.add('scale-0');
            menu.classList.remove('show');
        });
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
