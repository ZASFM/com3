import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    AuthModule, 
    UserModule,
    GraphQLModule.forRootAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      driver:ApolloDriver,
      useFactory:async(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        configService:ConfigService
      )=>{
         return {
          //playground for the schemas i
          playground:true,
          //making sure that a schema is generated in the mentioned path from my types.ts in the auth dir
          autoSchemaFile:join(process.cwd(),'src/schema.gql'),
          sortSchema:true
         }
      }
    }),
    ConfigModule.forRoot({
      isGlobal:true
    }) 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
