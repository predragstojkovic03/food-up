import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BusinessesService } from './core/businesses/application/businesses.service';
import { EmployeesService } from './core/employees/application/employees.service';

function arg(flag: string, envVar: string): string | undefined {
  const match = process.argv.find((a) => a.startsWith(`--${flag}=`));
  if (match) return match.slice(flag.length + 3);
  return process.env[envVar];
}

function requireArg(flag: string, envVar: string): string {
  const value = arg(flag, envVar);
  if (!value) {
    console.error(`Missing required argument: --${flag} (or env ${envVar})`);
    process.exit(1);
  }
  return value;
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const businessesService = app.get(BusinessesService);
  const employeesService = app.get(EmployeesService);

  const businessName = arg('business-name', 'SEED_BUSINESS_NAME') ?? 'My Business';
  const contactEmail = arg('contact-email', 'SEED_CONTACT_EMAIL') ?? requireArg('manager-email', 'SEED_MANAGER_EMAIL');
  const managerName = arg('manager-name', 'SEED_MANAGER_NAME') ?? 'Admin';
  const managerEmail = requireArg('manager-email', 'SEED_MANAGER_EMAIL');
  const managerPassword = requireArg('manager-password', 'SEED_MANAGER_PASSWORD');

  const business = await businessesService.create({
    name: businessName,
    contactEmail,
  });

  console.log(`Business created: ${business.name} (${business.id})`);

  const manager = await employeesService.createManager({
    name: managerName,
    email: managerEmail,
    password: managerPassword,
    businessId: business.id,
  });

  console.log(`Manager created:  ${manager.name} (${manager.id})`);
  console.log(`  Email:    ${managerEmail}`);
  console.log(`  Password: ${managerPassword}`);
  console.log(`\nYou can now log in and generate invite links at POST /businesses/${business.id}/invites`);

  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message ?? err);
  process.exit(1);
});
