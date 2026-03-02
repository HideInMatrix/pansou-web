---
title: 如何在 Git 中忽略特定文件的本地修改
id: c28d2db2-53d1-4e9e-b3fc-4c0d90eee8ee
date: 2025-05-30 22:25:15
auther: root
cover: 
excerpt: 日常的项目开发中，有一些文件会随着你的本地环境而改变。例如 package-lock.json 等文件会在你安装的时候，根据你版本的不同而改变。虽然package.json会指定版本的访问，但是有时候还是会出现一些 BUG，使得版本不兼容。为了不影响别人的环境，那么这种文件不想记录他的修改，该如何做
permalink: /archives/a7fe67ebda3c
categories:
 - share
tags: 
 - git
---

日常的项目开发中，有一些文件会随着你的本地环境而改变。例如 package-lock.json 等文件会在你安装的时候，根据你版本的不同而改变。虽然`package.json`会指定版本的访问，但是有时候还是会出现一些 BUG，使得版本不兼容。为了不影响别人的环境，那么这种文件不想记录他的修改，该如何做呢？

### 使用 `update-index` 将文件标记为 "assume unchanged"

如果你想忽略对某个文件的修改，但不想更改 `.gitignore` 文件，可以使用以下命令：

```bash
git update-index --assume-unchanged <file>
```

**说明**：

- 此命令会告诉 Git 假设该文件没有被修改，即使实际内容发生了变化。
- 如果之后想恢复 Git 的跟踪，可以运行以下命令：

```bash
git update-index --no-assume-unchanged <file>
```

---

### 使用 `skip-worktree` 忽略修改

如果想在更复杂的场景中忽略文件的修改（例如在分支间切换时保持文件状态），可以使用 `skip-worktree` 标志。

1. 标记文件为 `skip-worktree`：
   ```bash
   git update-index --skip-worktree <file>
   ```
2. 恢复文件的跟踪：
   ```bash
   git update-index --no-skip-worktree <file>
   ```

**区别**：

- `-assume-unchanged` 通常用于本地开发，适合临时忽略。
- `-skip-worktree` 更适合在分支切换和共享场景中使用。

---

### 使用 `.git/info/exclude`

如果不想影响其他开发者的 `.gitignore` 文件，可以将文件路径添加到 `.git/info/exclude` 中（类似于 `.gitignore`，但仅对本地有效）。这里必须之前就存在，如果已经追踪了依赖，不适合用这个方法。

操作步骤：

1. 打开 `.git/info/exclude` 文件。
2. 添加要忽略的文件路径，例如：
   ```bash
   path/to/your/file
   ```

---

### 永久忽略文件内容但保留版本

如果想让文件内容保持在版本库中，但未来的修改被忽略，可以使用以下方法：

1. 将文件移除暂存区但保留工作区的文件：
   ```bash
   git rm --cached <file>
   ```
2. 将文件路径添加到 `.gitignore` 文件中，避免后续跟踪。

**注意**：这种方法会从版本库中移除该文件，仅适用于需要“取消跟踪”的文件。

---

### 注意事项

- **上述方法并非真正“忽略”文件的修改**：例如，`-assume-unchanged` 和 `-skip-worktree` 仅影响本地行为，Git 并没有真正忽略它们的变化。
- 如果其他开发者需要完全相同的忽略规则，可以通过 `.gitignore` 或 `.git/info/exclude` 共享配置。


