import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'net';

@Injectable()
export class MailService {
  constructor(private readonly configService: ConfigService) {}

  async sendVerificationEmail(email: string, token: string) {
    const host = this.configService.get<string>('MAIL_HOST') || 'mailpit';
    const port = parseInt(
      this.configService.get<string>('MAIL_PORT') || '1025',
      10,
    );
    const from =
      this.configService.get<string>('MAIL_FROM') || 'no-reply@example.com';
    const backendUrl =
      this.configService.get<string>('BACKEND_URL') ||
      'http://localhost:3000/api/v1';
    const verifyUrl = `${backendUrl}/auth/verify-email?token=${token}&email=${encodeURIComponent(
      email,
    )}`;

    const socket = new Socket();

    await new Promise<void>((resolve) => {
      socket.connect(port, host, () => resolve());
    });

    const commands = [
      `HELO localhost`,
      `MAIL FROM:<${from}>`,
      `RCPT TO:<${email}>`,
      `DATA`,
      `Subject: Verify your email`,
      ``,
      `Click the link to verify your email: ${verifyUrl}`,
      `.`,
      `QUIT`,
    ];

    for (const cmd of commands) {
      socket.write(cmd + '\r\n');
      await new Promise((r) => setTimeout(r, 50));
    }

    socket.end();
  }
}
