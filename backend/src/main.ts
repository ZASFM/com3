import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
import {ValidationPipe, BadRequestException} from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin:'http://localhost:5173',
    credentials:true,
    allowedHeaders:[
      'Accept',
      'Authorization',
      'Content-Type',
      'X-Requested-with',
      //required to prevent CSRF and XS-Search attacks
      'apollo-required-preflight',
    ],
    methods:['GET','PUT','POST','DELETE','OPTIONS']
  })
  app.use(cookieParser());
  app.use(graphqlUploadExpress({maxFileSize:1000000000, maxFile:1}));
  app.useGlobalPipes(
    new ValidationPipe({
      //checking for unwanted data from the client
      whitelist:true,
      //convert string from client into different types
      transform:true,
      //formatting errors and returning them in a concise way
      exceptionFactory:(errors)=>{
        const formattedErrors=errors.reduce((accumulator,error)=>{
          accumulator[error.property]=Object.values(error.constraints).join(', ');
          return accumulator;
        },{})
        throw new BadRequestException(formattedErrors);
      }
    })
  )
  await app.listen(3000);
}
bootstrap();
