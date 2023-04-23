import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MatchesModule } from './services/matches/matches.module';

@Module({
  imports: [EventEmitterModule.forRoot(), MatchesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
