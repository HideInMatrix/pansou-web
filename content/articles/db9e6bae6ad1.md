---
title: Proxmox 搭建K8服务
id: d1a90ea6-a60b-42b4-9e8a-958f53128119
date: 2025-05-30 20:35:46
auther: root
cover: 
excerpt: 前言 最近配了一台服务器,配置清单 cpu e2660、内存 16*2 ecc。 使用 proxmox 安装了多台虚拟机,使用其中的 3 台 4c 8g 的搭建了一个 3 节点的 k8s 集群。因为没有公网 ip 或者说进不了电信光猫改不了配置,不能直接通过公网访问到内网，所以使用 frp 内网
permalink: /archives/db9e6bae6ad1
categories:
 - thinks
tags: 
 - proxmox
---

## 前言

最近配了一台服务器,配置清单 cpu: e2660、内存: 16\*2 ecc。
使用 proxmox 安装了多台虚拟机,使用其中的 3 台 4c 8g 的搭建了一个 3 节点的 k8s 集群。因为没有公网 ip 或者说进不了电信光猫改不了配置,不能直接通过公网访问到内网，所以使用 frp 内网穿透，提供公网访问。

预期实现的功能：

- 可通过域名直接访问内网，不带端口，eg: [http://ltinyho.top](http://ltinyho.top/)
- 支持 https, eg: [https://ltinyho.top](https://ltinyho.top/)
- 支持 websocket

## 内网穿透配置

- 将域名绑定到具有公网 ip 的服务器
- 将 80 和 443 端口的流量转发到 fprs http 监听的 7080 端口。这样流量就会通过 frps -> frpc 到内网宿主机。
- 将配置的域名的流量都转到本地的 80 端口。
- 反向代理，将流量代理到 k8s 集群

## 配置

```json
map $http_upgrade $connection_upgrade {
  default upgrade;
  ''      close;
}
server {
    listen 80;
    server_name *.ltinyho.top ltinyho.top;
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/ltinyho.top/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/ltinyho.top/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
    location / {
        proxy_pass <http://localhost:7080>;
        proxy_set_header Host      $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade; #配置weboscket
        proxy_set_header Connection $connection_upgrade;#配置weboscket
    }
}
```

frps 配置

```json
bind_addr = 0.0.0.0
bind_port = 7000
bind_udp_port = 7001
kcp_bind_port = 7000
vhost_http_port = 7080
```

内网宿主机 nginx 配置

```json
upstream k8s {
    server 192.168.199.111:80;
    server 192.168.199.112:80;
    server 192.168.199.113:80;
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
listen 80;
server_name *.ltinyho.top ltinyho.top;

    location / {
    proxy_pass http://k8s;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    }
}
```

内网 frpc 配置

```json
[common]

server_addr = 47.98.137.255

server_port = 7000

[lt-http]

type = http

local_ip = 127.0.0.1

local_port = 80

custom_domains = *.ltinyho.top,ltinyho.top

remote_port = 7080
```
