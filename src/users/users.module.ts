import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';

@Module({
  providers: [UsersService], // Internal provider
  exports: [UsersService], // If others want to use, it needs exporting
  imports: [
    TypeOrmModule.forFeature([User]) // Import orm module in order to use entity
  ]
})
export class UsersModule {}
