import { BadRequestException, Body, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { Repository } from 'typeorm';
import { endOfDay, isAfter } from 'date-fns';

@Injectable()
export class CouponsService {
  
  @InjectRepository(Coupon) private readonly couponRepository: Repository<Coupon>
  
  
  
  
  
  
  create(createCouponDto: CreateCouponDto) {
    return this.couponRepository.save(createCouponDto);
  }

  findAll() {
    return this.couponRepository.find();
  }

  async findOne(id: number) {
    const coupon = await this.couponRepository.findOneBy({id})
    if(!coupon){
      throw new NotFoundException(`El cupon con el ID: ${id} no fue encontrado`)
    }
    return coupon;
  }

   async update(id: number, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.couponRepository.findOneBy({ id });
    if (!coupon) {
      throw new NotFoundException(`No se encontró el cupón con ID ${id}.`);
    }
    Object.assign(coupon, updateCouponDto);
    return await this.couponRepository.save(coupon);
  }


  async remove(id: number) {
    const coupon = await this.couponRepository.findOneBy({ id });
    if (!coupon) {
      throw new NotFoundException(`No se encontró el cupón con ID ${id}.`);}
      await this.couponRepository.remove(coupon)
    return{message:'Cupon eliminado'};
  
}

  async applyCoupon(@Body()couponName : string){

    const coupon = await this.couponRepository.findOneBy({name:couponName})
    if(!coupon){
      throw new NotFoundException("El cupon no existe....  ")
    }

    const currentDate = new Date()
    const expirationDate =endOfDay(coupon.expirationDate)

    if(isAfter(currentDate,expirationDate)){
      throw new UnprocessableEntityException('Cupon ya expirado')
    }
    
    return{
      message: 'Cupon valido',
      ...coupon
    }


  }
}
