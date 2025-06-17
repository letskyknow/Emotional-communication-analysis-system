import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../modules/auth/user.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seed() {
    console.log('Starting database seed...');

    // Create default admin user
    await this.createDefaultUsers();

    console.log('Database seed completed!');
  }

  private async createDefaultUsers() {
    const users = [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        roles: ['admin', 'user'],
      },
      {
        username: 'demo',
        email: 'demo@example.com',
        password: 'demo123',
        firstName: 'Demo',
        lastName: 'User',
        roles: ['user'],
      },
    ];

    for (const userData of users) {
      const existingUser = await this.userRepository.findOne({
        where: [
          { username: userData.username },
          { email: userData.email },
        ],
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = this.userRepository.create({
          ...userData,
          password: hashedPassword,
          preferences: {
            theme: 'light',
            notifications: true,
          },
        });

        await this.userRepository.save(user);
        console.log(`Created user: ${userData.username}`);
      } else {
        console.log(`User ${userData.username} already exists`);
      }
    }
  }
}