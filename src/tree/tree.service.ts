import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TreeNode } from './tree-node.entity';
import { Repository, IsNull } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNodeDto } from './dto/create-node.dto';
import { TreeNodeResponseDto } from './dto/tree-response.dto';

@Injectable()
export class TreeService {
  constructor(
    @InjectRepository(TreeNode)
    private readonly treeNodeRepository: Repository<TreeNode>,
  ) {}

  /**
   * Returns all trees, which are all root nodes with their children
   * @returns Array of tree
   */
  async findAllTrees() {
    try {
      // This finds all the nodes that dont have any parentId, which are considered root nodes
      const rootNodes: TreeNode[] = await this.treeNodeRepository.find({
        where: {
          parentId: IsNull(),
        },
        relations: ['children'],
      });

      return await Promise.all(
        rootNodes.map((root) => this.buildTreeStructure(root)),
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve trees', error);
    }
  }

  /**
   * Fills the children nodes of the node passed
   * @param node
   * @private
   * @returns TreeNode
   */
  private async buildTreeStructure(
    node: TreeNode,
  ): Promise<TreeNodeResponseDto> {
    const nodeWithChildren = await this.treeNodeRepository.findOne({
      where: { id: node.id },
      relations: ['children'], // this ensures that top-level child nodes are included
    });

    if (!nodeWithChildren) {
      throw new NotFoundException(`Node with ID ${node.id} not found`);
    }

    // Re-using this same function to fill the children nodes
    const children = await Promise.all(
      (nodeWithChildren.children || []).map((child) =>
        this.buildTreeStructure(child),
      ),
    );

    return {
      id: nodeWithChildren.id,
      label: nodeWithChildren.label,
      children,
    };
  }

  /**
   * Find a node by id
   * @param id
   * @returns treeNodeResponseDto
   */
  async findNodeById(id: number): Promise<TreeNodeResponseDto> {
    try {
      const nodeFound = await this.treeNodeRepository.findOne({
        where: {
          id,
        },
        relations: ['children'],
      });

      if (!nodeFound) {
        throw new NotFoundException(`Node with ID ${id} not found`);
      }

      return nodeFound;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve node', error);
    }
  }

  async cloneNodeIntoNode(
    parentId: number,
    childId: number,
  ): Promise<TreeNodeResponseDto> {
    // find the parentId
    const parentNode = await this.treeNodeRepository.findOne({
      where: { id: parentId },
      relations: ['children'],
    });

    if (!parentNode) {
      throw new NotFoundException(`Parent node with ID ${parentId} not found`);
    }

    // find the childId
    const childNode = await this.treeNodeRepository.findOne({
      where: { id: childId },
      relations: ['children'],
    });

    if (!childNode) {
      throw new NotFoundException(`Child node with ID ${childId} not found`);
    }

    // call a function to deep clone the child node
    const childTreeStructure = await this.buildTreeStructure(childNode);
    await this.createNodesFromStructure(childTreeStructure, parentId);

    // return the parent node with the cloned child already included
    return await this.buildTreeStructure(parentNode);
  }

  /**
   * Creates new database entries from a TreeNodeResponseDto structure recursively
   * @param treeStructure The tree structure to recreate
   * @param newParentId The ID of the new parent for the root of this structure
   * @returns The created node
   */
  private async createNodesFromStructure(
    treeStructure: TreeNodeResponseDto,
    newParentId?: number,
  ): Promise<TreeNode> {
    // Create the root node of this structure
    const newNode = this.treeNodeRepository.create({
      label: treeStructure.label,
      parentId: newParentId,
    });

    const savedNode = await this.treeNodeRepository.save(newNode);

    // If there are children, recursively create them
    if (treeStructure.children && treeStructure.children.length > 0) {
      await Promise.all(
        treeStructure.children.map((child) =>
          this.createNodesFromStructure(child, savedNode.id),
        ),
      );
    }

    return savedNode;
  }

  /**
   * This creates a new node and saves it to the database
   * @param createNodeDto
   * @returns treeNodeResponseDto
   */
  async createNode(createNodeDto: CreateNodeDto): Promise<TreeNodeResponseDto> {
    const { label, parentId } = createNodeDto;

    try {
      if (parentId) {
        const doesParentExists = await this.treeNodeRepository.findOne({
          where: {
            id: parentId,
          },
        });

        if (!doesParentExists) {
          throw new NotFoundException(
            `Parent node with ID ${parentId} not found`,
          );
        }
      }

      const newNode = this.treeNodeRepository.create({
        label,
        parentId: parentId ?? undefined,
      });

      const savedNode = await this.treeNodeRepository.save(newNode);

      return {
        id: savedNode.id,
        label: savedNode.label,
        children: [],
      } as TreeNodeResponseDto;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create node', error);
    }
  }

  /**
   * Deletes a node by ID from the database
   * @param nodeId
   * @returns treeNodeResponseDto
   */
  async deleteNodeById(nodeId: number): Promise<TreeNodeResponseDto> {
    try {
      const node = await this.treeNodeRepository.findOne({
        where: {
          id: nodeId,
        },
      });

      if (!node) {
        throw new NotFoundException(`Node with ID ${nodeId} not found`);
      }
      await this.treeNodeRepository.delete(nodeId);
      return node;
    } catch (error) {
      throw new NotFoundException(
        `Failed to delete a node with ID ${nodeId}`,
        error,
      );
    }
  }


  async rollbackDatabaseTo(id: number) {
    return []
  }
}
