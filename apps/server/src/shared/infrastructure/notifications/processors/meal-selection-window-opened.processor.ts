import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { Redis } from 'ioredis';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { MealSelectionWindowsService } from 'src/core/meal-selection-windows/application/meal-selection-windows.service';
import { MealSelectionWindowUpdatedPayload } from 'src/core/meal-selection-windows/domain/events/meal-selection-window-updated.event';
import { EnvironmentVariables } from 'src/env.validation';
import {
  I_CONFIG_SERVICE,
  IConfigService,
} from 'src/shared/application/config-service.interface';
import { I_MAIL_SERVICE, IMailService } from '../mail.service.interface';
import { MEAL_WINDOW_QUEUE } from '../queue-names';
import { REDIS_CLIENT } from '../redis-client.provider';

const COOLDOWN_SECONDS = 3600;

@Processor(MEAL_WINDOW_QUEUE)
@Injectable()
export class MealSelectionWindowOpenedProcessor extends WorkerHost {
  constructor(
    @Inject(REDIS_CLIENT) private readonly _redis: Redis,
    private readonly _windowsService: MealSelectionWindowsService,
    private readonly _employeesService: EmployeesService,
    @Inject(I_MAIL_SERVICE) private readonly _mailService: IMailService,
    @Inject(I_CONFIG_SERVICE)
    private readonly _configService: IConfigService<EnvironmentVariables, true>,
  ) {
    super();
  }

  async process(job: Job<MealSelectionWindowUpdatedPayload>): Promise<void> {
    const { mealSelectionWindowId } = job.data;

    const cooldownKey = `meal-window-notified:${mealSelectionWindowId}`;
    const inCooldown = await this._redis.get(cooldownKey);
    if (inCooldown) return;

    const window = await this._windowsService.findOne(mealSelectionWindowId);
    const employees = await this._employeesService.findAllByBusinessEnriched(
      window.businessId,
    );

    const webAppUrl = this._configService.get('WEB_APP_URL');

    const results = await Promise.allSettled(
      employees
        .filter((employee) => employee.email)
        .map(async (employee) => {
          const sentKey = `meal-window-notified:${mealSelectionWindowId}:${employee.id}`;
          if (await this._redis.get(sentKey)) return;
          await this._mailService.send(
            employee.email,
            'Meal selection window is now open',
            `<p>The meal selection window is now open. <a href="${webAppUrl}">Click here</a> to select your meals.</p>`,
          );
          // Mark AFTER successful send — if send throws, key stays unset and employee is retried
          await this._redis.set(sentKey, '1', 'EX', COOLDOWN_SECONDS);
        }),
    );

    const failures = results.filter((r) => r.status === 'rejected');
    if (failures.length > 0) {
      throw new Error(
        `${failures.length} of ${employees.length} notification emails failed to send`,
      );
    }

    // Set window-level cooldown only after all sends succeed
    await this._redis.set(cooldownKey, '1', 'EX', COOLDOWN_SECONDS);
  }
}
