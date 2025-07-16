import { IsNumberString, isNumberString, IsOptional } from 'class-validator'

export class GetProductsQueryDto{

    @IsOptional()
    @IsNumberString({},{message:'la Categoria debe de ser un numero'})
    category_id: number

    @IsOptional()
    @IsNumberString({},{message:'la Cantidad debe de ser un numero'})
    take: number

    @IsOptional()
    @IsNumberString({},{message:'la Cantidad debe de ser un numero'})
    skip: number




}