import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'home',
        loadComponent: () =>
            import('./pages/home-page/home-page.component').then(
                (m) => m.HomePageComponent
            ),
    },
    {
        path: 'about-me',
        loadComponent: () =>
            import('./pages/about-me-page/about-me-page.component').then(
                (m) => m.AboutMePageComponent
            ),
    },
    {
        path: 'auth',
        children: [
            {
                path: 'login',
                loadComponent: () =>
                    import('./pages/auth-page/auth-page.component').then(
                        (m) => m.AuthPageComponent
                    ),
            },
            {
                path: 'register',
                loadComponent: () =>
                    import('./pages/auth-page/auth-page.component').then(
                        (m) => m.AuthPageComponent
                    ),
            },
            {
                path: 'admin',
                loadComponent: () =>
                    import('./pages/auth-page/auth-page.component').then(
                        (m) => m.AuthPageComponent
                    ),
            },
        ],
    },
    {
        path: 'admin/users',
        loadComponent: () =>
            import('./pages/users-page/users-page.component').then(
                (m) => m.UsersPageComponent
            ),
    },
    {
        path: 'perfil',
        loadComponent: () =>
            import('./pages/perfil-page/perfil-page.component').then(
                (m) => m.PerfilPageComponent
            ),
    },
    {
        path: 'solicitar-turno',
        loadComponent: () =>
            import(
                './pages/solicitar-turno-page/solicitar-turno-page.component'
            ).then((m) => m.SolicitarTurnoPageComponent),
    },
    {
        path: 'mis-turnos',
        loadComponent: () =>
            import(
                './pages/mis-turnos-page/mis-turnos-page.component'
            ).then((m) => m.MisTurnosPageComponent),
    },
    {
        path: 'pacientes',
        loadComponent: () =>
            import(
                './pages/pacientes-page/pacientes-page.component'
            ).then((m) => m.PacientesPageComponent),
    },

    //
    //
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },
    {
        path: '**',
        loadComponent: () =>
            import('./pages/error-page/error-page.component').then(
                (m) => m.ErrorPageComponent
            ),
    },
];
