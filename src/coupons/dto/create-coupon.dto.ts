import { IsDate, IsDateString, IsInt, IsNotEmpty, Max, Min } from "class-validator"

export class CreateCouponDto {


        @IsNotEmpty({message: 'El nombre del cupon es obligatorio'})
        name:string
    
        @IsNotEmpty({message: 'El Descuento No Puede Ir Vacio'})
        @IsInt({message: 'El Descuento debe ser entre 1 y 100'})
        @Max(100,{message: 'El Descuento maximo es de 100'})
        @Min(1,{message: 'El Descuento minimo es de 1'})
        percentage:number
    
        @IsNotEmpty({message: 'La fecha no puede ir vacia'})
        @IsDateString({},{message: 'Fecha No Valida'})
        expirationDate: Date




}
