import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppLoggerService extends Logger {
  constructor(name: string) {
    super(name);
  }
}
