export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');

export interface IEmailService {
  sendOtpEmail(to: string, code: string, purpose: 'login' | 'forgot_password' | 'change_password'): Promise<void>;
}
