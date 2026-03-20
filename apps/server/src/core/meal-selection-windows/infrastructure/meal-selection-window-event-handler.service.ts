import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MealSelectionWindowUpdatedEvent } from '../domain/events/meal-selection-window-updated.event';
import { MEAL_WINDOW_QUEUE } from 'src/shared/infrastructure/notifications/queue-names';

@Injectable()
export class MealSelectionWindowEventHandler {
  constructor(
    @InjectQueue(MEAL_WINDOW_QUEUE)
    private readonly _mealWindowQueue: Queue,
  ) {}

  @OnEvent(MealSelectionWindowUpdatedEvent.EVENT_NAME)
  async handleWindowUpdated(event: MealSelectionWindowUpdatedEvent): Promise<void> {
    if (!event.payload.isLocked) {
      await this._mealWindowQueue.add('notify', event.payload);
    }
  }
}
