import { Component, inject } from '@angular/core';
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
import { Admin } from '../../../interfaces/user-details.interface';
import { ImageService } from '../../../services/image.service';

import Swal from 'sweetalert2';

@Component({
    selector: 'app-auth-form-admin',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, CommonModule],
    templateUrl: './auth-form-admin.component.html',
    styleUrl: './auth-form-admin.component.css',
})
export class AuthFormAdminComponent {
    private imageService = inject(ImageService);

    protected credentials: FormGroup;

    protected profileImg: string;

    constructor(
        private router: Router,
        private authService: AuthService,
        private fb: FormBuilder,
        private toastr: ToastrService
    ) {
        this.credentials = this.fb.group({
            nombre: ['', [Validators.required]],
            apellido: ['', [Validators.required]],
            edad: [
                '',
                [
                    Validators.required,
                    Validators.min(1),
                    Validators.max(120),
                    Validators.pattern('^\\d+$'),
                ],
            ],
            dni: [
                '',
                [
                    Validators.required,
                    Validators.min(10000000),
                    Validators.max(99999999),
                    Validators.pattern('^\\d+$'),
                ],
            ],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });

        this.profileImg = 'auth/DefaultUser.png';
    }

    public onImageChange(target: any) {
        const file: File = target.files[0];
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = (event) => {
            this.profileImg = event.target?.result as string;
        };
    }

    public async onSubmit() {
        const urlMain = await this.imageService.uploadImage(this.profileImg);
        if (urlMain === null) {
            Swal.fire({
                title: 'Error',
                text: 'Ha ocurrido un error al subir la/s imagen/es',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        const newAdmin: Admin = {
            nombre: this.nombre?.value,
            apellido: this.apellido?.value,
            edad: this.edad?.value,
            dni: this.dni?.value,
            email: this.email?.value,
            password: this.password?.value,
            role: 'admin',
            imagenPerfil: urlMain,
        };
		this.credentials.reset()
        this.registerAdmin(newAdmin);
    }

    public registerAdmin(admin: Admin) {
        this.authService
            .register(admin)
            .then(() => {
                this.toastr.success('¡Admin registrado!');
                this.router.navigateByUrl('/home', { replaceUrl: true });
            })
            .catch((err) => {
                this.handleAuthError(err.code);
            });
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

                    if (
                        (value.hasError('min') || value.hasError('max')) &&
                        key === 'dni'
                    )
                        return 'El dni debe ser de 8 dígitos';
                    if (
                        (value.hasError('min') || value.hasError('max')) &&
                        key === 'edad'
                    )
                        return 'La edad debe estar entre 1 y 120 años';
                    if (value.hasError('pattern'))
                        return 'El numero debe ser un entero';
                }
            }
        }
        return null;
    }

    get nombre() {
        return this.credentials.get('nombre');
    }

    get apellido() {
        return this.credentials.get('apellido');
    }

    get edad() {
        return this.credentials.get('edad');
    }

    get dni() {
        return this.credentials.get('dni');
    }

    get email() {
        return this.credentials.get('email');
    }

    get password() {
        return this.credentials.get('password');
    }

    private handleAuthError(errorCode: string) {
        switch (errorCode) {
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
            case 'auth/user-disabled':
                this.toastr.error(
                    'La cuenta de usuario ha sido deshabilitada.',
                    'Error'
                );
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
