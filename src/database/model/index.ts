// src/database/model/index.ts
import Product from './Product';
import Reason from './Reason.js';
import Entry from './Entry';
import EntryChange from './EntryChange';
import Import from './Import';

export const models = [
  Product,
  Reason,
  Entry,
  EntryChange,
  Import,
];