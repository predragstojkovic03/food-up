import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { Public } from './public.decorator';

export const API_KEY_PROTECTED_KEY = Symbol('API_KEY_PROTECTED_KEY');
export const API_KEY_HEADER = 'x-api-key';
export const API_KEY_SECURITY_NAME = 'api-key';

/**
 * Operator-only endpoint authenticated by the ADMIN_API_KEY header instead of a user JWT.
 * Disabled (404) when ADMIN_API_KEY is not configured.
 */
export const ApiKeyProtected = () =>
  applyDecorators(
    Public,
    SetMetadata(API_KEY_PROTECTED_KEY, true),
    ApiSecurity(API_KEY_SECURITY_NAME),
  );
