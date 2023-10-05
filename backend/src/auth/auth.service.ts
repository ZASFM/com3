import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import {ConfigService} from '@nestjs/config';
import {Request, Response} from 'express';
import { BadRequestException, UnauthorizedException } from '@nestjs/common/exceptions';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
   constructor(
      private readonly jwtService: JwtService,
      private readonly prisma: PrismaService,
      private readonly configService: ConfigService
   ){}

   async refreshToken(req:Request, res:Response){
      const refreshToken = req.cookies['refresh_token'];
      if(refreshToken){
         throw new UnauthorizedException('Refresh token is not present');
      }

      let payload;
      
      try{
         payload = this.jwtService.verify(refreshToken,{
            secret: this.configService.get<string>('REFRESH_TOKEN-SERVICE')
         });
      }catch(err){
         throw new UnauthorizedException('Invalid or expired token');
      }

      const userExists= await this.prisma.user.findUnique({
         where:{id:payload.sub}
      });

      if(!userExists){
         throw new BadRequestException('User no longer exists');
      }

      const expiresIn=15000;
      const expirationDate=Math.floor(Date.now()/1000)+expiresIn;
      const accessToken= this.jwtService.sign(
         {...payload,exp:expirationDate},
         {
            secret:this.configService.get<string>('ACCESS_TOKEN_SERVICE')
         }
      );

      res.cookie('access_token',accessToken,{httpOnly:true});
      return accessToken;
   }

   private  async issueTokens(user:User, response:Response){
      const payload= {username: user.fullname, sub:user.id};

      const accessToken = this.jwtService.sign(
         {
            ...payload,
         },
         {
            secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
            expiresIn: '150sec'
         }
      );

      const refreshToken = this.jwtService.sign(payload,{
         secret:this.configService.get<string>('REFRESH_TOKEN_SECRET'),
         expiresIn:'7d'
      });

      response.cookie('access_token',accessToken,{httpOnly:true});
      response.cookie('refresh_token',refreshToken,{httpOnly:true});

      return user;
   }
}
