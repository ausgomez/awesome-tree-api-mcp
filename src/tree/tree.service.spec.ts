import { Test, TestingModule } from '@nestjs/testing';
import { TreeService } from './tree.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TreeNode } from './tree-node.entity';
import { Repository } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateNodeDto } from './dto/create-node.dto';

describe('TreeService', () => {
  let service: TreeService;
  let repository: jest.Mocked<Repository<TreeNode>>;

  const mockRepositoryMethods = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TreeService,
        {
          provide: getRepositoryToken(TreeNode),
          useValue: mockRepositoryMethods,
        },
      ],
    }).compile();

    service = module.get<TreeService>(TreeService);
    repository = module.get(getRepositoryToken(TreeNode));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllTrees', () => {
    it('should return empty array when no root nodes exist', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAllTrees();

      expect(result).toEqual([]);
    });

    it('should throw InternalServerErrorException when database error occurs', async () => {
      repository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.findAllTrees()).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.findAllTrees()).rejects.toThrow(
        'Failed to retrieve trees',
      );
    });
  });

  describe('createNode', () => {
    const createNodeDto: CreateNodeDto = {
      label: 'New Node',
      parentId: 1,
    };

    it('should re-throw NotFoundException when parent validation fails', async () => {
      const notFoundError = new NotFoundException('Parent not found');
      repository.findOne.mockRejectedValue(notFoundError);

      await expect(service.createNode(createNodeDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.createNode(createNodeDto)).rejects.toThrow(
        'Parent not found',
      );
    });
  });
});
