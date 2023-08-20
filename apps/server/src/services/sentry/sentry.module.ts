import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as Sentry from '@sentry/node';

import { NgSentryInterceptor } from './sentry.interceptor';
import { NgSentryService } from './sentry.service';

export const SENTRY_OPTIONS = 'SENTRY_OPTIONS';

@Module({})
export class SentryModule {
  static forRoot(options: Sentry.NodeOptions) {
    // initialization of Sentry, this is where Sentry will create a Hub
    Sentry.init(options);

    return {
      module: SentryModule,
      global: true,
      providers: [
        {
          provide: SENTRY_OPTIONS,
          useValue: options,
        },
        NgSentryService,
        {
          provide: APP_INTERCEPTOR,
          useClass: NgSentryInterceptor,
        },
      ],
      exports: [NgSentryService],
    };
  }
}
