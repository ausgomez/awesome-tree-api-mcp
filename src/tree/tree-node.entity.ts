import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tree-nodes')
export class TreeNode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column({ nullable: true })
  parentId: number;

  // Multiple TreeNodes can have the same parent TreeNode
  // Example: "teddy" and "koala" can both belong to "bear" parent TreeNode
  // On deletion, the children are also deleted
  @ManyToOne(() => TreeNode, (node) => node.children, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: TreeNode;

  // One TreeNode can have multiple children (bear -> multiple bears)
  @OneToMany(() => TreeNode, (node) => node.parent)
  children: TreeNode[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
