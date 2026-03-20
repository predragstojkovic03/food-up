import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { MEAL_WINDOW_QUEUE } from 'src/shared/infrastructure/notifications/queue-names';
import { MealSelectionWindowUpdatedEvent } from '../domain/events/meal-selection-window-updated.event';

@Injectable()
export class MealSelectionWindowEventHandler {
  constructor(
    @InjectQueue(MEAL_WINDOW_QUEUE)
    private readonly _mealWindowQueue: Queue,
  ) {}

  @OnEvent(MealSelectionWindowUpdatedEvent.EVENT_NAME)
  async handleWindowUpdated(
    event: MealSelectionWindowUpdatedEvent,
  ): Promise<void> {
    if (!event.payload.isLocked) {
      await this._mealWindowQueue.add('notify', event.payload);
    }
  }
}
