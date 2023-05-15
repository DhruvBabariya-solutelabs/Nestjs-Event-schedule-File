import { Injectable, Logger } from '@nestjs/common';
import { CreateUser } from './dto/create-user.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from './event/user-created.event';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { TRANSCODE_QUEUE } from './constant';
import { Queue } from 'bull';

@Injectable()
export class AppService {
  constructor(
    private eventEmitter: EventEmitter2,
    private schedulerRegistry: SchedulerRegistry,
    @InjectQueue(TRANSCODE_QUEUE) private readonly transcodeQueue: Queue,
  ) {}
  private readonly logger = new Logger(AppService.name);

  getHello(): string {
    return 'Hello World!';
  }

  async createUser(body: CreateUser) {
    this.logger.log('creating user.... ' + body);
    const userId = '123';
    this.eventEmitter.emit(
      'User.created',
      new UserCreatedEvent(userId, body.email),
    );
    const establishWsTimeout = setTimeout(() => {
      this.establishWsConnection(userId);
    }, 5000);
    this.schedulerRegistry.addTimeout(
      `${userId}_establish_ws`,
      establishWsTimeout,
    );
  }

  private establishWsConnection(userId: String) {
    this.logger.log('Established web socket connection with user....', userId);
  }

  @OnEvent('User.created')
  welcomeNewUser(payload: UserCreatedEvent) {
    this.logger.log('welcomming new user...', payload.email);
  }

  @OnEvent('User.created', { async: true })
  async sendwelcomeGift(payload: UserCreatedEvent) {
    this.logger.log('sending welcome gift.. ', payload.email);
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 3000));
    this.logger.log('welcome gift sent.', payload.email);
  }

  // @Cron(CronExpression.EVERY_10_SECONDS, { name: 'delete_expired_users' })
  // deleteExpiredUser() {
  //   this.logger.log('Deleting Expired Users');
  // }

  async transcode() {
    await this.transcodeQueue.add({
      fileName: './file.mp3',
    });
  }
}
