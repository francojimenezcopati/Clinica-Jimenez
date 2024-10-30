import { inject, Injectable, signal } from '@angular/core';
import { Paciente, UserDetails } from '../interfaces/user-details.interface';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CollectionsNames } from '../utils/collections-names.enum';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private firestore = inject(AngularFirestore);

    constructor() {}

    public getAll() {
        return this.firestore
            .collection<UserDetails>(CollectionsNames.USERS)
            .valueChanges();
    }

    public getOne(userId: string) {
        return this.firestore
            .doc<UserDetails>(CollectionsNames.USERS + '/' + userId)
            .get();
    }

    public update(user: UserDetails) {
        return this.firestore
            .doc<UserDetails>(CollectionsNames.USERS + '/' + user.uid)
            .update(user);
    }
}
