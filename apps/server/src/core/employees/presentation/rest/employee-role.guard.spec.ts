import { EmployeeRole, IdentityType } from '@food-up/shared';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequiredIdentityType } from 'src/core/identity/presentation/rest/identity-type.decorator';
import { IdentityTypeGuard } from 'src/core/identity/presentation/rest/identity-type.guard';
import { RequiredEmployeeRole } from './employee-role.decorator';
import { EmployeeRoleGuard } from './employee-role.guard';

@RequiredIdentityType(IdentityType.Employee)
@RequiredEmployeeRole(EmployeeRole.Manager)
class ClassGuardedController {
  inherited() {}

  @RequiredEmployeeRole(EmployeeRole.Basic, EmployeeRole.Manager)
  overridden() {}
}

class UnguardedController {
  open() {}
}

function contextFor(
  controller: new () => object,
  handler: string,
  user: object | undefined,
): ExecutionContext {
  return {
    getHandler: () => controller.prototype[handler],
    getClass: () => controller,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

const manager = { sub: 'id-1', type: IdentityType.Employee, role: EmployeeRole.Manager };
const basic = { sub: 'id-2', type: IdentityType.Employee, role: EmployeeRole.Basic };
const supplier = { sub: 'id-3', type: IdentityType.Supplier };

describe('EmployeeRoleGuard', () => {
  const guard = new EmployeeRoleGuard(new Reflector());

  it('applies class-level role requirements to handlers without their own', () => {
    expect(guard.canActivate(contextFor(ClassGuardedController, 'inherited', manager))).toBe(true);
    expect(() => guard.canActivate(contextFor(ClassGuardedController, 'inherited', basic))).toThrow(
      ForbiddenException,
    );
  });

  it('lets a method-level requirement override the class-level one', () => {
    expect(guard.canActivate(contextFor(ClassGuardedController, 'overridden', basic))).toBe(true);
  });

  it('rejects identities without an employee role', () => {
    expect(() => guard.canActivate(contextFor(ClassGuardedController, 'inherited', supplier))).toThrow(
      ForbiddenException,
    );
  });

  it('allows anything when no role is required', () => {
    expect(guard.canActivate(contextFor(UnguardedController, 'open', basic))).toBe(true);
  });
});

describe('IdentityTypeGuard', () => {
  const guard = new IdentityTypeGuard(new Reflector());

  it('applies class-level identity type requirements', () => {
    expect(guard.canActivate(contextFor(ClassGuardedController, 'inherited', manager))).toBe(true);
    expect(() => guard.canActivate(contextFor(ClassGuardedController, 'inherited', supplier))).toThrow(
      ForbiddenException,
    );
  });

  it('allows anything when no identity type is required', () => {
    expect(guard.canActivate(contextFor(UnguardedController, 'open', supplier))).toBe(true);
  });
});
