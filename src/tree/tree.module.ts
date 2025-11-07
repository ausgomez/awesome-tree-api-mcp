import { Module } from '@nestjs/common';
import { TreeService } from './tree.service';
import { TreeController } from './tree.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreeNode } from './tree-node.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TreeNode])],
  controllers: [TreeController],
  providers: [TreeService],
})
export class TreeModule {}
