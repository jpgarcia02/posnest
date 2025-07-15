import { IsInt, IsNotEmpty, IsNumber, isNumber, IsSemVer, IsString } from "class-validator"

export class CreateProductDto {
    @IsNotEmpty({message:'El nombre del producto es obligatorio'} )
    @IsString({message:'Nombre no valido'})
    name:string
     
    @IsNotEmpty({message:'El precio del producto es obligatorio '} )
    @IsNumber({maxDecimalPlaces:2},{message:'precio no valido'})
    price: number

    @IsNotEmpty({message:'La cantidad no puede ir vacia '} )
    @IsNumber({maxDecimalPlaces:0},{message:'Cantidad no valida'})
    inventory: number

    @IsNotEmpty({message:'La cantidad es obligatoria '} )
    @IsInt({message:'La categoria no es valida'})
    categoryId: number






}
