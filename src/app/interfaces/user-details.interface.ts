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

interface Turno {
    uid?: string;
    especialidad: string;
    fecha: string;
    hora: string;
    estado: EstadoTurno;
    comentario?: string;
    reseña?: string;
	encuesta?: string;
	calificacion?: string
}

export interface TurnoFirestore extends Turno {
    patientId: string;
    specialistId: string;
}

export interface TurnoApp extends Turno {
    patient: Paciente;
    specialist: Especialista;
}

export type EstadoTurno =
    | 'solicitado'
    | 'cancelado'
    | 'aceptado'
    | 'rechazado'
    | 'finalizado';

export type DefinedSpecialties =
    | 'psicología'
    | 'fisioterapia'
    | 'urología'
    | 'traumatología'
    | 'pediatría'
    | 'cardiología';
