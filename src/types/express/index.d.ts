import { Document, Model } from 'mongoose';
import {} from '@/interfaces';

declare global {
  namespace Models {
    // export type AccountModel = Model<IAccount & Document>;
  }
}
