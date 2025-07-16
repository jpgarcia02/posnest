import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";



@Entity()
export class Transaction {

    @PrimaryGeneratedColumn()
    id: number

    @Column('decimal')
    total: number

    @Column({type:'timestamp',default: ()=> "CURRENT_TIMESTAMP(6)"})
    transactionDate: Date
}
