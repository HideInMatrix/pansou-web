---
title: 使用 Cloudflare Tunnel 穿透 Flarum 论坛：问题解决与设置教程
id: 382d85ed-404f-45d1-bf41-896cf501cdcf
date: 2025-10-26 10:30:00
auther: root
cover: 
excerpt: Flarum 论坛是一个轻量级的开源论坛系统，因其简洁、美观和高效而受到很多开发者的青睐。如果你希望通过 Cloudflare Tunnel 让外部访问你本地部署的 Flarum 论坛，可能会遇到一个常见问题：“Something went wrong. You try to load the fu
permalink: /archives/jn25b8n2d
categories:
 - share
tags: 
 - cloudflare
 - flarum
---

**Flarum 论坛**是一个轻量级的开源论坛系统，因其简洁、美观和高效而受到很多开发者的青睐。如果你希望通过 Cloudflare Tunnel 让外部访问你本地部署的 Flarum 论坛，可能会遇到一个常见问题：“Something went wrong. You try to load the full version of this website”。别担心，今天我就带你一步步解决这个问题，让你的 Flarum 论坛顺利在网络上展示。

## 步骤一：问题的产生

在使用 **Cloudflare Tunnel** 将本地 Flarum 论坛项目暴露到互联网时，访问页面时经常会看到如下错误提示：

```
Something went wrong. You try to load the full version of this website.
```

这个错误通常是由于域名配置、SSL/TLS 设置等问题导致的。这个问题并不复杂，接下来我们将一步步解决它。

## 步骤二：修改 Flarum 配置文件

在 Cloudflare Tunnel 穿透的过程中，Flarum 需要知道它的真实访问域名。此时，Flarum 的 `config.php` 文件中的域名配置可能会导致无法正确显示网站。解决这个问题的关键就在于修改 `config.php` 文件中的 `url` 配置项。

1. 进入你的 Flarum 项目目录，找到并打开 `config.php` 文件。
2. 找到如下行：

   ```php
   'url' => 'http://your-forum-domain.com',
   ```
3. 将 `your-forum-domain.com` 修改为你在 Cloudflare Tunnel 配置的真实域名，比如 `bbs.micromatrix.org`：

   ```php
   'url' => 'https://bbs.micromatrix.org',
   ```

   请确保该 URL 使用 HTTPS 协议，以便后续的 SSL 设置生效。
4. 保存文件并退出。

### 为什么要修改 `config.php`？

Flarum 默认会根据本地服务器地址来生成 URL。如果你通过 Cloudflare Tunnel 公开了一个域名，而没有明确指定，Flarum 会发生访问错误。通过修改 `config.php` 中的 URL，我们确保 Flarum 知道正确的外部访问地址。

## 步骤三：调整 Cloudflare 的 SSL/TLS 设置

接下来，让我们进入 Cloudflare 控制面板，调整 SSL/TLS 的加密方式，以确保传输过程中的数据安全，并解决可能出现的 SSL 证书问题。

1. 登录到 [Cloudflare](https://www.cloudflare.com/) 控制面板。
2. 选择你的站点（比如 `bbs.micromatrix.org`）。
3. 在左侧菜单中，点击 **SSL/TLS** 选项。
4. 在 **加密模式**（Encryption Mode）部分，确保选择了 **完全（严格）** 模式。
   选择 **完全（严格）** 模式的原因是，它要求你服务器上有有效的 SSL 证书，并且 Cloudflare 会确保与你服务器之间的连接是加密的。这样可以有效避免 SSL 证书不匹配的问题。

### 为什么选择 “完全（严格）” 模式？

Cloudflare 提供的 “完全（严格）” 模式要求访问你站点的服务器必须有有效的 SSL 证书，这有助于确保你的网站安全，并防止中间人攻击。虽然这种模式要求你的服务器上已经配置好 SSL 证书，但一旦配置完成，你就可以放心享受更加安全的加密通信。

## 步骤四：完成设置并测试

完成以上设置后，接下来我们就可以测试一下论坛是否可以正常访问了。

1. 打开浏览器，访问你设置的域名（比如 `https://bbs.micromatrix.org`）。
2. 如果一切顺利，你应该能够看到你的 Flarum 论坛正常加载，而不会再出现之前的错误提示。

## 结语

通过修改 Flarum 的配置文件和调整 Cloudflare SSL/TLS 设置，我们成功解决了 Cloudflare Tunnel 穿透 Flarum 论坛时出现的 “Something went wrong” 错误。这个过程虽然简单，但它能够让你的网站安全、稳定地在互联网上运行。

如果你在操作过程中遇到任何问题，不妨回顾一下这些步骤，或者检查是否有遗漏的配置。Cloudflare Tunnel 和 Flarum 的结合，能够让你轻松实现本地网站的外网访问，而不用担心安全性问题。

快去试试吧！相信你也能顺利完成这项设置，开启属于你的论坛之旅。

**小贴士：** 如果你正在使用 Cloudflare Tunnel 进行其他类型的穿透配置，类似的 SSL/TLS 设置也非常适用，确保你的网站始终处于安全的加密环境中。
