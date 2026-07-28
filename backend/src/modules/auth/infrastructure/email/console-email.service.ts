import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { IEmailService } from './email.service.interface';

/** Local-dev default: logs the OTP instead of sending real email. No SMTP credentials needed. */
@Injectable()
export class ConsoleEmailService implements IEmailService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ConsoleEmailService.name);
  }

  async sendOtpEmail(to: string, code: string, purpose: string): Promise<void> {
    this.logger.info({ to, code, purpose }, `[dev email stub] OTP for ${purpose}: ${code} (would be sent to ${to})`);
  }
}
