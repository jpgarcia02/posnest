import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionContents, Transaction } from './entities/transaction.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionContents) private readonly transactionContentsRepository: Repository<TransactionContents>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>


  ){}



   async create(createTransactionDto: CreateTransactionDto) {
  await this.productRepository.manager.transaction(async (tem) => {

    // 1. Guardar la transacción UNA VEZ al inicio
    const transaction = new Transaction();
    transaction.total = createTransactionDto.total;
    await tem.save(transaction);  // <-- mueve esto afuera del for

    // 2. Recorrer los contenidos
    for (const contents of createTransactionDto.contents) {
      const product = await tem.findOneBy(Product, { id: contents.productId });
      if (!product) {
        throw new Error(`Producto con ID ${contents.productId} no existe`);
      }
      if (contents.quantity > product.inventory) {
        throw new BadRequestException(`El articulo ${product.name} excede la cantidad disponible`);
      }

      // 3. Restar inventario y GUARDAR el producto
      product.inventory -= contents.quantity;
      await tem.save(product);  // <-- esta línea hace que baje el stock

      // 4. Crear y guardar detalle
      const transactionContents = new TransactionContents();
      transactionContents.price = contents.price;
      transactionContents.quantity = contents.quantity;
      transactionContents.product = product;
      transactionContents.transaction = transaction;

      await tem.save(transactionContents); // <-- usa la entidad, no objeto plano
    }
  });

  return 'Venta Almacenada Correctamente';
}

  
  
  
  
  
  
  findAll() {
    return `This action returns all transactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
