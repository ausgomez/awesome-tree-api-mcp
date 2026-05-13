import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TreeNode } from '../tree/tree-node.entity';

@Entity('tree-nodes')
export class State {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  treeNodes: TreeNode[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
