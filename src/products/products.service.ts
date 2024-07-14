import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient, Product } from '@prisma/client';
import { PaginationDto } from 'src/common/dto';

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
      this.product.count(),
      this.product.findMany({
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
      throw new NotFoundException('product_not_found');
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    await this.findOne(id);

    return this.product.update({
      where: { id },
      data: updateProductDto,
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
