---
title: 如何在 NestJS 中配置 PostgreSQL 数据库与实现用户密码加密
id: d99ff48d-169d-4ff8-9553-d45d1575d1c2
date: 2025-05-30 21:57:14
auther: root
cover: 
excerpt: 前言 最近在学习 NestJS，一个基于 Express 开发的 Node 框架，他更加前端适合编写后端需求。 对接 Postpresql 数据库 安装如下插件 pnpm install @nestjs/typeorm typeorm pg 编辑 main.ts 文件内容，增加数据库配置 impo
permalink: /archives/194c48dbceea
categories:
 - share
tags: 
 - nestjs
---

## 前言

最近在学习 NestJS，一个基于 Express 开发的 Node 框架，他更加前端适合编写后端需求。

## 对接 Postpresql 数据库

安装如下插件

```bash
pnpm install @nestjs/typeorm typeorm pg
```

编辑 `main.ts` 文件内容，增加数据库配置

```bash
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1', // 数据库地址
      port: 5432,       // 数据库端口
      username: 'davidmorgan', // 数据库用户名
      password: 'postgres', // 数据库密码
      database: 'postgres', // 数据库名
      entities: [__dirname + '/**/*.entity{.ts,.js}'],      // 这里放置你的实体类
      synchronize: true, // 如果是开发环境true方便，生产环境建议false
      // ssl:true,
    }),
  ],
  controllers: [
  ],
  providers: [],
})
export class AppModule {}
```

## 环境变量配置

安装如下插件

```bash
pnpm install cross-env @nestjs/config
 # cross-env 指定NODE_ENV
 # dotenv 本地参数读取 可以不安装
 # @nestjs/config 获取本地参数
```

新建 `.env.evelopment.local` 内容里面写入你需要的参数

```tsx
POSTGRES_USER = "xxx";
POSTGRES_HOST = "127.0.0.1";
POSTGRES_PASSWORD = "xxx";
POSTGRES_DATABASE = "xxx";
POSTGRES_PORT = "5432";
NODE_ENV = "develop";
```

配置下 `package.json` 在 `scripts` 字段下配置启动参数

```tsx
"build": "cross-env NODE_ENV=production nest build",
    "format": "cross-env NODE_ENV=development prettier --write \\\\"src/**/*.ts\\\\" \\\\"test/**/*.ts\\\\"",
    "start": "cross-env NODE_ENV=development nest start",
    "start:dev": "cross-env NODE_ENV=development nest start --watch",
    "start:debug": "cross-env NODE_ENV=development nest start --debug --watch",
    "start:prod": " cross-env NODE_ENV=production node dist/main",
```

然后配置下 `app.module.ts` 参数的获取就是依靠 `configService.get('POSTGRES_HOST')`

```tsx
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";

const NODE_ENV = process.env.NODE_ENV;
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        NODE_ENV === "development" ? ".env.development.local" : `.env`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [],
      useFactory: async (configService: ConfigService) => {
        return {
          type: "postgres",
          host: configService.get("POSTGRES_HOST"), // 数据库地址
          port: configService.get("POSTGRES_PORT"), // 数据库端口
          username: configService.get("POSTGRES_USER"), // 数据库用户名
          password: configService.get("POSTGRES_PASSWORD"), // 数据库密码
          database: configService.get("POSTGRES_DATABASE"), // 数据库名
          entities: [__dirname + "/**/*.entity{.ts,.js}"], // 这里放置你的实体类
          synchronize: true, // 如果是开发环境true方便，生产环境建议false
          // ssl:true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [
    // ViewController
  ],
  providers: [],
})
export class AppModule {}
```

## 数据库用户表的密码加密

安装插件 `bcrypt` 然后在对应的 `service`层做处理，例如我这边的代码：

```sql
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService{
  async insertUser(userDto: {name:string,password:string,email:string}):Promise<Users> {
    const saltOrRounds = 10; // 建议的盐的轮次
    const hashedPassword = await bcrypt.hash(userDto.password, saltOrRounds);
    const newUser = this.usersRepository.create({
      ...userDto,
      password: hashedPassword, // 存储哈希后的密码
    });
}
```
