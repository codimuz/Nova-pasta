// src/database/model/index.ts
import Product from './Product';
import Reason from './Reason';
import Entry from './Entry';

export const models = [
  Product,
  Reason,
  Entry,
];

export type { Product, Reason, Entry };