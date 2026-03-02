---
title: 如何备份cloudflare kv的数据
id: 89f415e7-3bce-48fd-87b3-74a1948cba73
date: 2025-11-27 10:32:06
auther: root
cover: 
excerpt: 前言 由于本人喜欢白嫖，而 cloudflare作为互联网的大善人，所以白嫖了他们家的kv存储桶。起初个人使用免费的额度错错有余，但是访问的人数过多的话，则余量显得捉襟见肘。本人的懒惰导致kv里存储的数据越来越多，迁移的问题就显得愈发重要。为此特意做了一下功课，找到一个可以很好备份的方法。 变量获取
permalink: /archives/1PO1RiBl
categories:
 - share
tags: 
 - javascript
 - cloudflare
---

## 前言

由于本人喜欢白嫖，而 `cloudflare`作为互联网的大善人，所以白嫖了他们家的kv存储桶。起初个人使用免费的额度错错有余，但是访问的人数过多的话，则余量显得捉襟见肘。本人的懒惰导致kv里存储的数据越来越多，迁移的问题就显得愈发重要。为此特意做了一下功课，找到一个可以很好备份的方法。

## 变量获取

这一步是为了下面备份需要的信息。

namespace 获取在 `存储和数据库` -> `Workers KV` -> `在你需要备份的kv桶的三个点处Copy bindings` 得到如下内容

```javascript
"kv_namespaces": [{
                    "binding": "KV_BINDING",
                    "id": "这里的就是你的namespace id"
                 }]
```

account 获取在主页，在你的邮箱名称的右侧三个点处点击 `复制账户id` 。

token的获取是在顶部的右侧 `个人简介` ->`配置文件` -> `API令牌` -> `创建令牌` -> `创建自定义令牌`

名称填写随意，例如 `kv备份`

项目选择 `Workers KV 存储`

权限选择 `读取`

其他保持默认，然后保存之后跳出的弹框里的内容就是你的token

## 解决方法

我在  `github` 中找到了一个大佬编写的插件，[网址放在这里](https://github.com/glynnbird/kvbackup)。我们可以用这个插件下的程序备份方法，新建一个文件，然后填写好个人的信息。注意的是，截止文章的发布，他的程序备份方法的代码是有错误的。为此我将给出正确的代码和使用方法

新建一个文件夹 `backup-kv-js` 然后在文件夹里新建一个 `backup.js` ，文件中写入如下内容

```javascript
import { backup } from 'kvbackup'
import { createWriteStream } from 'fs'  // 确保你导入了 fs 模块

const opts = {
  namespace: 'your-name-space',
  account: 'your-account-id',
  token: 'your-token',
  ws: createWriteStream('./mybackup.jsonl'),
}
await backup(opts)
```

然后打开一个终端在 `backup-kv-js` 文件夹路径下执行 `npm install kvbackup` 这里表明安装 `kvbackup` 这是一个常见的js包管理命令。安装完成之后，运行 `node backup.js` 之后就可以看到备份进度在终端中被打印。

## 注意

这里写给一无所知的小白，你的电脑中需要安装node环境。
