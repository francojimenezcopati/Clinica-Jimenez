export interface UserDetails {
    uid?: string;
    nombre: string;
    apellido: string;
    edad: number;
    dni: number;
    email: string;
    password: string;
    role: 'patient' | 'specialist' | 'admin';
    imagenPerfil: string; // link al storage
}

export interface Admin extends UserDetails {}

export interface Paciente extends UserDetails {
    obraSocial: string;
    imagenPerfilAux: string; // link al storage
}

export interface Especialista extends UserDetails {
    especialidades: string[];
    estaHabilitado: boolean;
}
