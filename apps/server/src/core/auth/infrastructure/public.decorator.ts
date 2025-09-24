import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = Symbol('IS_PUBLIC_KEY');

export const Public = SetMetadata(IS_PUBLIC_KEY, true);
