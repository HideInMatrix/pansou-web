---
title: Next.js Dockerfile 构建镜像时链接数据库
id: 38043de9-1046-4ef7-9140-7dbc51e53e95
date: 2025-07-27 16:36:24
auther: root
cover: 
excerpt: 在接触了Next.js开发之后，我想大家通常都是部署在Vercel平台上。虽然这个平台很方便，但是也会有很多人需要将它部署在自己的服务器上。如何部署，在我的 优化 Next.js Docker 镜像：减少镜像大小的有效方法 文件中有介绍。 这里遇到的问题是Next.js在打包的时候需要生成sitem
permalink: /archives/CENr6eXBRL7s
categories:
 - share
tags: 
 - nextjs
---

在接触了Next.js开发之后，我想大家通常都是部署在Vercel平台上。虽然这个平台很方便，但是也会有很多人需要将它部署在自己的服务器上。如何部署，在我的 `优化 Next.js Docker 镜像：减少镜像大小的有效方法` 文件中有介绍。

这里遇到的问题是Next.js在打包的时候需要生成sitemap.xml文件，这需要链接数据库操作，这也意味着你需要在打包成镜像的时候链接数据库。

平常我们通过.env文件来让程序读取参数，打包的时候没法读取.env文件，这个时候就需要docker 的命令了。

## 解决方法

在 `Dockerfile` 文件中加入环境参数

例如我在输出阶段的代码附近增加

```json
# 传递构建参数
ARG DATABASE_URL

# 设置环境变量
ENV DATABASE_URL=$DATABASE_URL
```

使用如下命令，将数据库地址传入

```shell
docker build -t [镜像名称:latest] --build-arg DATABASE_URL=postgresql://postgres:[数据库密码]@[数据库地址]:5432/postgres --platform linux/amd64  .
```

这样就能在打包的时候链接数据库了

`--build-arg` 就是传递参数的

`--platform` 指定镜像的平台
