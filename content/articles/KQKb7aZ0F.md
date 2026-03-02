---
title: PVE开启xterm.js控制台：告别noVNC复制粘贴限制的完整教程
id: 98dcee2c-4175-41a6-99ae-7ac0a12d0ea1
date: 2025-09-07 17:10:07
auther: root
cover: 
excerpt: 在 Proxmox VE（PVE）里，我们平时习惯用 noVNC 作为虚拟机的控制台。 但问题来了——noVNC 不能复制粘贴！😩 如果你经常需要在虚拟机里操作命令，这简直就是“手工抄写机”。 别担心，其实 PVE 自带的 xterm.js 控制台 就能解决这个痛点，不仅支持复制粘贴，而且操作流畅
permalink: /archives/KQKb7aZ0F
categories:
 - share
tags: 
 - proxmox
---

在 Proxmox VE（PVE）里，我们平时习惯用 **noVNC** 作为虚拟机的控制台。
但问题来了——noVNC 不能复制粘贴！😩
如果你经常需要在虚拟机里操作命令，这简直就是“手工抄写机”。

别担心，其实 PVE 自带的 **xterm.js 控制台** 就能解决这个痛点，不仅支持复制粘贴，而且操作流畅。下面我们一步步来启用它。

---

## 步骤 1：先关掉虚拟机

别着急动手修改，先把目标虚拟机关掉。

---

## 步骤 2：添加串行端口

进入虚拟机的 **硬件设置**，添加一个 **串行端口**。
做完这一步，你会发现 PVE 面板里多了一个 **xterm.js 控制台** 选项。

不过，如果现在点进去，你大概率只会看到这样的提示：`starting serial terminal on interface serial0`

不管你按什么键，它都毫无反应。别慌，这是正常的。继续往下。

---

## 步骤 3：修改 grub 配置

进入虚拟机系统，编辑 grub 配置文件：

```bash
vi /etc/default/grub
```


找到这一行：

<pre class="overflow-visible!" data-start="634" data-end="660"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>GRUB_CMDLINE_LINUX</span><span>
</span></span></code></div></div></pre>

在引号里加上下面这段参数：

<pre class="overflow-visible!" data-start="679" data-end="720"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>console</span><span>=tty0 console=ttyS0,</span><span>115200</span><span>
</span></span></code></div></div></pre>

这一步的意思是告诉内核，把虚拟机的控制台输出也发到串口上。

---

## 步骤 4：更新 grub 配置

不同系统更新 grub 的命令不一样：

* **Debian/Ubuntu 系列**：
  <pre class="overflow-visible!" data-start="830" data-end="857"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>update-grub
  </span></span></code></div></div></pre>
* **RedHat/CentOS 系列**：
  <pre class="overflow-visible!" data-start="887" data-end="947"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>grub2-mkconfig --output=/boot/grub2/grub.cfg
  </span></span></code></div></div></pre>

---

## 步骤 5：重启虚拟机

执行完上面的操作后，重启一下虚拟机。
现在再打开 **xterm.js 控制台**，如果还是停在：

<pre class="overflow-visible!" data-start="1023" data-end="1076"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>starting serial terminal </span><span>on</span><span> </span><span>interface</span><span> </span><span>serial0</span><span>
</span></span></code></div></div></pre>

只需要 **按一下回车**，登录界面就会乖乖出现啦！🎉

---

## 总结

这样设置好之后，你就可以在 **xterm.js 控制台里自由复制粘贴命令**，再也不用在 noVNC 里手动敲一长串指令了。
对于日常维护和生产环境操作，效率直接翻倍。

Done！是不是很简单？
