import { inject, Injectable, signal } from '@angular/core';
import {
    Auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CollectionsNames } from '../utils/collections-names.enum';
import { Paciente, UserDetails } from '../interfaces/user-details.interface';
import { AuthService } from './auth.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
    providedIn: 'root',
})
export class ImageService {
    // private authService = inject(AuthService);
    private storage = inject(AngularFireStorage);

    constructor() {}

	// uploads an image to fireStorage and return the url created. Or return de default user image url.
    async uploadImage(imgData: string): Promise<string | null> {
        try {
            if (imgData !== 'auth/DefaultUser.png') {
                const fileName = `${new Date().getTime()}_img.jpg`;
                const filePath = `users-images/${fileName}`;
                const fileRef = this.storage.ref(filePath);

                // Convert base64 to blob
                const response = await fetch(imgData);
                const blob = await response.blob();

                // Upload the image to Firebase Storage
                await this.storage.upload(filePath, blob);

                // Get the download URL
                const url: string = await fileRef.getDownloadURL().toPromise();

                return url;
            } else {
                // si no puso ninguna img, devuelvo default
                return 'https://firebasestorage.googleapis.com/v0/b/apps-ionic-pps.appspot.com/o/users-photos%2F1729279893772_undefined.jpg?alt=media&token=21740d6d-c2d6-4bd6-a3cf-e3d724548bf8';
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}
