import {
  Res,
  UseInterceptors,
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateUser } from './dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import path from 'path';
import { cwd } from 'process';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  async createUser(@Body() body: CreateUser) {
    return this.appService.createUser(body);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          console.log(file);
          cb(null, file.originalname);
        },
      }),
    }),
  )
  async uploadFile() {
    return 'success';
  }

  //to serve file
  @Get('getfile/:filename')
  getFile(@Res() res: Response, @Param('filename') file: string) {
    res.sendFile(`${process.cwd()}/uploads/${file}`);
  }

  @Post('transcode')
  async transcode() {
    return this.appService.transcode();
  }
}
