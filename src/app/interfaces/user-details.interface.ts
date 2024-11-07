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
    horariosDisponibles?: Horarios;
    refToHorariosDisponibles?: string;
}

export type Horarios = {
    lunes: string[];
    martes: string[];
    miercoles: string[];
    jueves: string[];
    viernes: string[];
    sabado: string[];
};

export interface TurnoFirestore {
    patientId: string;
    specialistId: string;
    especialidad: string;
    fecha: string;
    hora: string;
}

export interface TurnoApp {
    patient: Paciente;
    specialist: Especialista;
    especialidad: string;
    fecha: string;
    hora: string;
}

export type DefinedSpecialties =
    | 'psicología'
    | 'fisioterapia'
    | 'urología'
    | 'traumatología'
    | 'pediatría'
    | 'cardiología';
