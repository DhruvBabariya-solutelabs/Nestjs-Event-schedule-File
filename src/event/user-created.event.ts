export class UserCreatedEvent {
  constructor(public readonly userId: string, public readonly email: string) {
    console.log('UserCreated event is execute');
  }
}
