import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import * as nodemailer from 'nodemailer';
import { IEmailService } from './email.service.interface';

const OTP_SUBJECTS: Record<string, string> = {
  login: 'Your Vrindavan login code',
  forgot_password: 'Reset your Vrindavan password',
  change_password: 'Confirm your Vrindavan password change',
};

/** Real SMTP delivery via nodemailer. Activate with EMAIL_PROVIDER=smtp + SMTP_* env vars. */
@Injectable()
export class SmtpEmailService implements IEmailService, OnModuleInit {
  private transporter!: nodemailer.Transporter;
  private fromAddress!: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(SmtpEmailService.name);
  }

  onModuleInit(): void {
    this.fromAddress = this.configService.get<string>('email.fromAddress')!;
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('email.smtpHost'),
      port: this.configService.get<number>('email.smtpPort'),
      secure: this.configService.get<boolean>('email.smtpSecure'),
      auth: this.configService.get<string>('email.smtpUser')
        ? {
            user: this.configService.get<string>('email.smtpUser'),
            pass: this.configService.get<string>('email.smtpPassword'),
          }
        : undefined,
    });
  }

  async sendOtpEmail(to: string, code: string, purpose: 'login' | 'forgot_password' | 'change_password'): Promise<void> {
    await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject: OTP_SUBJECTS[purpose] ?? 'Your Vrindavan verification code',
      text: `Your verification code is ${code}. It expires in a few minutes. If you didn't request this, you can ignore this email.`,
    });
    this.logger.info({ to, purpose }, 'OTP email sent via SMTP');
  }
}
