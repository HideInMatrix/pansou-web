---
title: Proxmox 给虚拟机分配容量最全教程
id: 4241d06e-2982-476c-b04a-77e6e61e504c
date: 2025-12-29 13:20:34
auther: root
cover: https://pan.micromatrix.org/file/AgACAgEAAyEGAASMdUacAAEB5hFpUhG-RJ9u6YJz9vJFXdel-PYAAfkAApQLaxvxIZFGbp74yCAvhbYBAAMCAAN3AAM2BA
excerpt: 之前我的闲置电脑安装了Proxmox 9.0.7版本，用其中的虚拟机搭建了一个1Panel,安装了一些服务。当初分配的60G硬盘已经见底。这里记录一下，我曲折的扩容操作。 PVE面板分配空间 首先需要在PVE管理WEB页对虚拟机的磁盘映像进行扩容, 类似于物理机上对存储的物理磁盘进行扩容。具体步骤为
permalink: /archives/mBZEax78
categories:
 - share
tags: 
 - proxmox
---

之前我的闲置电脑安装了Proxmox 9.0.7版本，用其中的虚拟机搭建了一个1Panel,安装了一些服务。当初分配的60G硬盘已经见底。这里记录一下，我曲折的扩容操作。

## PVE面板分配空间

首先需要在PVE管理WEB页对虚拟机的磁盘映像进行扩容, 类似于物理机上对存储的物理磁盘进行扩容。具体步骤为: - 选中“虚拟机 -> 硬件 -> 磁盘” - Disk Action -> Resize - 在弹出对话框中输入要增加的大小 - 点击弹出窗“调整磁盘大小”按钮确定。记住一个准则，只可以扩充硬盘，不能缩小硬盘。

![0](https://pan.micromatrix.org/file/AgACAgEAAyEGAASMdUacAAEB5hFpUhG-RJ9u6YJz9vJFXdel-PYAAfkAApQLaxvxIZFGbp74yCAvhbYBAAMCAAN3AAM2BA)

![0](https://pan.micromatrix.org/file/AgACAgEAAyEGAASMdUacAAEB5hJpUhH-ROayJlA0O7SCcHm5NQ3DhAAClgtrG_EhkUbIYg7dGb5kFgEAAwIAA3gAAzYE)

这一步只是分配了硬盘空间给虚拟机，但是虚拟机内还没有挂载这个硬盘


## Debain虚拟机扩容

这一步就是通过命令将分配的容量完全增加到虚拟机上。


### 查看磁盘容量

使用 `lsblk` 查看是否分配了容量

```shell
NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sda      8:0    0  104G  0 disk 
├─sda1   8:1    0 60.7G  0 part /
├─sda2   8:2    0    1K  0 part 
└─sda5   8:5    0  3.3G  0 part [SWAP]
```

### 查看硬盘的地址

使用 `fdisk -l` 就会打印类似内容

```shell
Disk /dev/sda: 100 GiB, 274877906944 bytes, 536870912 sectors
Disk model: QEMU HARDDISK   
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: E34826F9-50DB-4B45-9C97-A0AED4594306

```

注意我的硬盘地址是 `/dev/sda` 并且在第一步的时候可以看到我的 `sda1` 主盘是60G，后面的 `sda2` 是扩展分区(1K，占位) , `sda5` 是交换分区。***这里涉及到一个知识，硬盘就像排队一样，1,2,3 后面增加到容量就排在3后面，并且不能插队。由于我是需要给 `sda1` 扩容，所以我需要删除 `sda2` 和 `sda5` 然后再给 `sda1` 扩容。***

***如果你需要扩展的硬盘正好在最后一个，那么就可以跳过下面的删除分区的操作***

### 安装 `parted` 和 `cloud-guest-utils`

```shell
apt update && apt install -y parted cloud-guest-utils
```

通过安装的工具关闭和删除不用等分区，然后再扩容

1. 关闭 swap（必须）

   ```shell
   swapoff -a

   确认：
   swapon --show

   无输出即可
   ```
2. 进入 parted，删除 swap 分区

   ```shell
   parted /dev/sda
   在 parted 里执行（只输入这些）：
   (parted) print
   (parted) rm 5
   (parted) rm 2
   (parted) quit
   ```
   > 说明：
   >

   * > rm 5 → 删除 sda5（swap）
     >
   * > rm 2 → 删除扩展分区占位
     >
   * > **不会影响 sda1**
     >
3. 扩展根分区到整盘

   ```shell
   growpart /dev/sda 1
   ```
4. 扩展文件系统（现在一定成功）

   ```shell
   resize2fs /dev/sda1
   ```
5. 验证结果

   ```
   lsblk
   df -h
   这时候你应该看到了你的虚拟机占用了所分配的空间
   ```
