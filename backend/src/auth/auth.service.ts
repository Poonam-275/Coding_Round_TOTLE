import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService, private config: ConfigService, private users: UsersService) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.config.get<string>('FIREBASE_PROJECT_ID'),
          clientEmail: this.config.get<string>('FIREBASE_CLIENT_EMAIL'),
          privateKey: (this.config.get<string>('FIREBASE_PRIVATE_KEY') || '').replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  async exchangeFirebaseToken(idToken: string) {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      const user = await this.users.upsertFirebaseUser(decoded.uid, decoded.email, decoded.name);
      const payload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = await this.jwt.signAsync(payload);
      return { accessToken, user };
    } catch (e) {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }
}
