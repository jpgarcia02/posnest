import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindManyOptions, Repository } from 'typeorm';
import { TransactionContents, Transaction } from './entities/transaction.entity';
import { Product } from '../products/entities/product.entity';
import { endOfDay, isValid, parseISO, startOfDay } from 'date-fns';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionContents) private readonly transactionContentsRepository: Repository<TransactionContents>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    private readonly couponService: CouponsService


  ){}



   async create(createTransactionDto: CreateTransactionDto) {
  await this.productRepository.manager.transaction(async (transactionEntityManager) => {
    const transaction = new Transaction();
    const total =createTransactionDto.contents.reduce((total,item)=>total+ (item.quantity * item.price)  ,0)
    transaction.total = total
    
    if(createTransactionDto.coupon){
      const coupon = await this.couponService.applyCoupon(createTransactionDto.coupon)
      
      const discount = (coupon.percentage/100)*total
      transaction.discount=discount
      transaction.coupon = coupon.name
      transaction.total -= discount
    }
    


    for (const contents of createTransactionDto.contents) {
      const product = await transactionEntityManager.findOneBy(Product, { id: contents.productId });
      
      const errors: string[] =[]
      if (!product) {
        errors.push(`Producto con ID ${contents.productId} no existe`)
  throw new NotFoundException(errors);
}

      if (contents.quantity > product.inventory) {
        throw new BadRequestException(`El artículo ${product.name} excede la cantidad disponible`);
      }

      product.inventory -= contents.quantity;

      // ✅ Guardar el producto actualizado
      await transactionEntityManager.save(product);

      const transactionContent = new TransactionContents();
      transactionContent.price = contents.price;
      transactionContent.product = product;
      transactionContent.quantity = contents.quantity;
      transactionContent.transaction = transaction;

      await transactionEntityManager.save(transaction);
      await transactionEntityManager.save(transactionContent);
    }
  });

  return "Venta Almacenada Correctamente";
}

  
  
  
  
  
  
  findAll(transactionDate?:string) {
    const options: FindManyOptions<Transaction> = {
      relations:{
        contents: true 
      }

    }

    if(transactionDate){
      const date = parseISO(transactionDate)
        if(!isValid(date)){
          throw new BadRequestException('Fecha no valida ')
        }

        const start = startOfDay(date)
        const end = endOfDay(date)

        options.where ={
          transactionDate : Between(start,end)
        }
      
    }
    return this.transactionRepository.find(options);
  }

  async findOne(id: number) {
    const transaction = await this.transactionRepository.findOne({
      where:{
        id
      },
      relations:{
        contents:true 
      }


    })

    if(!transaction){
      throw new NotFoundException('Transaccion no encontrada')
    }



    return transaction;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  async remove(id: number) {
  const transaction = await this.transactionRepository.findOne({
    where: { id },
    relations: ['contents', 'contents.product'], // Carga productos relacionados
  });

  if (!transaction) {
    throw new NotFoundException(`Transacción con ID ${id} no encontrada`);
  }

  // ✅ Restablecer inventario
  for (const content of transaction.contents) {
    content.product.inventory += content.quantity; // Devuelve la cantidad
    await this.productRepository.save(content.product);
  }

  // ✅ Eliminar transaction_contents primero
  await this.transactionContentsRepository.remove(transaction.contents);

  // ✅ Luego eliminar la transacción
  await this.transactionRepository.remove(transaction);

  return { message: 'Venta eliminada y stock restablecido' };
}
}