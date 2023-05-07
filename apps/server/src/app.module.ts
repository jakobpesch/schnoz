import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MatchesModule } from './services/matches/matches.module';
import { AuthModule } from './services/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    MatchesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
