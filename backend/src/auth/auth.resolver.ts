import { Resolver } from '@nestjs/graphql';
import {Query} from '@nestjs/graphql';

@Resolver()
export class AuthResolver {
   //mock query
   @Query(()=>String)
   async hello(){
      return 'Hello';
   }
}
