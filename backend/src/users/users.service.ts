import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';
import { Inject } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(@Inject(PrismaClient) private prisma: PrismaClient) {}

  async upsertFirebaseUser(uid: string, email: string | undefined, displayName: string | undefined) {
    return this.prisma.user.upsert({
      where: { id: uid },
      update: { email: email ?? '', displayName: displayName ?? '' },
      create: { id: uid, email: email ?? '', displayName: displayName ?? '', role: Role.USER },
    });
  }

  async listUsers() {
    return this.prisma.user.findMany();
  }

  async updateRole(id: string, role: Role) {
    const user = await this.prisma.user.update({ where: { id }, data: { role } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
