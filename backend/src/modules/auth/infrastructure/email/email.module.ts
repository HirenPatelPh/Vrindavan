import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EMAIL_SERVICE } from './email.service.interface';
import { ConsoleEmailService } from './console-email.service';
import { SmtpEmailService } from './smtp-email.service';

@Module({
  providers: [
    ConsoleEmailService,
    SmtpEmailService,
    {
      provide: EMAIL_SERVICE,
      useFactory: (configService: ConfigService, consoleImpl: ConsoleEmailService, smtpImpl: SmtpEmailService) =>
        configService.get<string>('email.provider') === 'smtp' ? smtpImpl : consoleImpl,
      inject: [ConfigService, ConsoleEmailService, SmtpEmailService],
    },
  ],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
