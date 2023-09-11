import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RewriteFrames } from '@sentry/integrations';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './services/auth/auth.module';
import { MailService } from './services/mail/mail.service';
import { MatchesModule } from './services/matches/matches.module';
import { SentryModule } from './services/sentry/sentry.module';
import { UsersModule } from './services/users/users.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MatchesModule,
    AuthModule,
    SentryModule.forRoot({
      // this does not have to be a secret
      dsn: 'https://7c1400b48db0f96dd266878722a23a7c@o4505657208012800.ingest.sentry.io/4505657213648896',
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      // version must match the version when uploading the source maps
      release: '0.0.1',
      // dist must match the dist when uploading the source maps
      dist: process.env.NODE_ENV,
      integrations: [
        new RewriteFrames({
          iteratee: (frame) => {
            if (!frame.filename) return frame;
            frame.filename = 'app://' + frame.filename;
            return frame;
          },
        }),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}

console.log('env', process.env.NODE_ENV);
