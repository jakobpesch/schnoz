import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { Span, SpanContext } from '@sentry/types';
import { Request } from 'express';

/**
 * Because we inject REQUEST we need to set the service as request scoped
 */
@Injectable({ scope: Scope.REQUEST })
export class NgSentryService {
  /**
   * Return the current span defined in the current Hub and Scope
   */
  get span(): Span | undefined {
    return Sentry.getCurrentHub().getScope().getSpan();
  }

  /**
   * When injecting the service it will create the main transaction
   *
   * @param request
   */
  constructor(@Inject(REQUEST) private request: Request) {
    const { method, headers, url } = this.request;
    const body = this.request.body;

    // recreate transaction based from HTTP request
    const transaction = Sentry.startTransaction({
      name: `Route: ${method} ${url}`,
      op: 'transaction',
    });

    // setup context of newly created transaction
    Sentry.getCurrentHub().configureScope((scope) => {
      scope.setSpan(transaction);

      // customize your context here
      scope.setContext('http', {
        method,
        url,
        headers,
        body: body ? JSON.stringify(body, null, 2) : undefined,
      });
    });
  }

  /**
   * This will simply start a new child span in the current span
   *
   * @param spanContext
   */
  startChild(spanContext: SpanContext) {
    return this.span?.startChild(spanContext);
  }
}
