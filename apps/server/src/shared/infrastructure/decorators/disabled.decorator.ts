import { SetMetadata } from '@nestjs/common';

export const IS_DISABLED_KEY = Symbol('IS_DISABLED_KEY');

export const Disabled = SetMetadata(IS_DISABLED_KEY, true);
