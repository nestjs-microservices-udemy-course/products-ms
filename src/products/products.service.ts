import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient, Product } from '@prisma/client';
import { PaginationDto } from 'src/common/dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const [totalPages, products] = await Promise.all([
      this.product.count({
        where: { deletedAt: null },
      }),
      this.product.findMany({
        where: {
          deletedAt: null,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: products,
      meta: {
        page,
        total: totalPages,
        lastPage,
      },
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.product.findUnique({
      where: { id, deletedAt: null },
    });

    if (!product) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'product_not_found',
      });
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const { id: _, ...data } = updateProductDto;
    await this.findOne(id);

    return this.product.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: number): Promise<Product> {
    await this.findOne(id);

    return this.product.update({
      data: { deletedAt: new Date() },
      where: { id },
    });
  }
}
