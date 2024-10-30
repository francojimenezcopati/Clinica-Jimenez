import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),

        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        provideAuth(() => getAuth()),
        provideFirestore(() => getFirestore()),
        provideStorage(() => getStorage()),
        { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig },

        provideAnimations(), // for ngx-toastr & ngx-spinner
        provideToastr({
            positionClass: 'toast-bottom-right',
            closeButton: true,
        }),

    ],
};
