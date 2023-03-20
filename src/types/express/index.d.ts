import { Document, Model } from 'mongoose';
import {
  IAccount,
  IGroup,
  IGroupFootprint,
  IPortfolio,
  IPrice,
  ITag,
  IToken,
} from '@/interfaces';

import {
  ITransaction
} from '@1foxglobal/onchain-data-model/lib/interfaces'

declare global {
  namespace Models {
    export type AccountModel = Model<IAccount & Document>;
    export type GroupFootprintModel = Model<IGroupFootprint & Document>;
    export type GroupModel = Model<IGroup & Document>;
    export type PortfolioModel = Model<IPortfolio & Document>;
    export type PriceModel = Model<IPrice & Document>;
    export type TagModel = Model<ITag & Document>;
    export type TokenModel = Model<IToken & Document>;
    export type TransactionModel = Model<ITransaction & Document>;
  }
}

