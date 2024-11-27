import { inject, Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Log } from '../interfaces/user-details.interface';
import { CollectionsNames } from '../utils/collections-names.enum';

@Injectable({
    providedIn: 'root',
})
export class LogsService {
    private firestore = inject(AngularFirestore);

    constructor() {}

    public getAll(): Observable<Log[]> {
        return this.firestore
            .collection<Log>(CollectionsNames.LOGS)
            .valueChanges();
    }

    public saveLog(log: Log) {
        const docRef = this.firestore
            .collection<Log>(CollectionsNames.LOGS)
            .doc();

        return docRef.set({ ...log });
    }
}
