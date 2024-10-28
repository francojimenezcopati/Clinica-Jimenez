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
