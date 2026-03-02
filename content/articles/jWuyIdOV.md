---
title: Postgresql数据库使用独立的用户权限管理各自数据库
id: 2f159653-6cf8-42f5-b586-4b4b7d49f6c4
date: 2025-12-10 17:03:18
auther: root
cover: 
excerpt: 本文记录我的一次维护数据库操作。我遇到的问题是，我的 postgresql 数据库中有2个库a1,a2。在原先的管理中，是使用root用户管理所有的库，但是为了数据安全和防止开发者误操作。那么需要建立2个用户分别管理他们自己的数据库。同时还需要将a2表重新命名为b1。那么下面就是我的整个操作流程。 
permalink: /archives/jWuyIdOV
categories:
 - share
tags: 
 - postgresql
---

本文记录我的一次维护数据库操作。我遇到的问题是，我的  `postgresql` 数据库中有2个库a1,a2。在原先的管理中，是使用root用户管理所有的库，但是为了数据安全和防止开发者误操作。那么需要建立2个用户分别管理他们自己的数据库。同时还需要将a2表重新命名为b1。那么下面就是我的整个操作流程。

## 建立独立用户管理数据库

首先登录你部署数据库的服务器，通过 `psql -U root -d a1` 链接到数据库。这里不需要输入密码。使用 `\c` 查看当前数据库和连接用户。你会看到

```plaintext
postgres=# \c
You are now connected to database "a1" as user "root".
```

然后确保你现在处于需要修改的数据库，如果不是，使用 `\c [数据库名]` 来进行切换。

下面跟随步骤就可以完成管理

### 步骤 1: 创建 `user_a1` 用户

首先，我们需要在 `mac_apps` 数据库中创建一个新用户 `macapp`，并为该用户设置密码：

```sql
CREATE USER user_a1 WITH PASSWORD 'your_password';
```

将 `'your_password'` 替换成你想为 `user_a1` 用户设置的密码。

### 步骤 2: 授予 `macapp` 用户对 `mac_apps` 数据库的连接权限

创建用户之后，需要授予 `user_a1` 用户对 `a1` 数据库的 **连接** 权限：

```sql
GRANT CONNECT ON DATABASE a1 TO user_a1;
```

### 步骤 3: 授予 `user_a1` 用户对 a1 数据库中所有表的权限

接下来，为了让 `user_a1` 用户能够在 `a1` 数据库中管理所有表（增、删、改、查），我们需要授予该用户对 **所有现有表** 和 **未来创建的表** 的权限。

#### 1. 授予现有表的权限

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO user_a1;
```

这条命令会授予 `user_a1` 用户在 `public` schema 中 **所有现有表** 的增、删、改、查（`SELECT`, `INSERT`, `UPDATE`, `DELETE`）权限。

#### 2. 授予未来表的权限

为了确保未来在 `a1` 数据库中创建的表也能自动授予  `user_a1` 用户权限，我们需要设置 **默认权限**：

```sql
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO user_a1;
```

这样，未来在 `public` schema 下创建的任何新表都会自动授予 `user_a1` 用户 `SELECT`, `INSERT`, `UPDATE`, 和 `DELETE` 权限。

### 步骤 4: 确认权限

完成上述步骤后，你可以通过以下命令来确认 `user_a1` 用户在 `a1` 数据库中的权限：

```sql
\dp
```

这会列出所有表的权限，确认 `user_a1` 是否被正确授予了相关权限。

### 步骤 5: 退出 PostgreSQL

在完成所有操作后，你可以退出 PostgreSQL：

```sql
\q
```

## 修改数据库名

通用使用 `\c` 查看当前用户和数据库。这里注意确保当前所在的数据库不是要修改的数据库，和上面的条件刚好相反，因为你不能重命名一个正在连接数据库。

使用

```plaintext
ALTER DATABASE a2 RENAME TO b1;
```

## 撤销用户权限

有授权必然有撤销，如果操作失误可以通过下面的方法撤销权限。同样也是要切换到将要操作的数据库上。

### 步骤 1: 撤销用户在 `public` schema 上的权限

首先，撤销 `user_a1` 用户在 `public` schema 上的权限：

```sql
REVOKE ALL PRIVILEGES ON SCHEMA public FROM user_a1;
```

### 步骤 2: 撤销用户在 `user_a1` 数据库上的权限

如果 `user_a1` 用户在 `a1` 数据库上有权限，你也需要撤销这些权限：

```sql
REVOKE ALL PRIVILEGES ON DATABASE a1 FROM user_a1;
```

### 步骤 3: 撤销默认权限

如果该用户是某些对象（如新创建的表）的默认权限持有者，你也需要撤销这些默认权限：

```sql
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM user_a1;
```

这样可以确保将来在 `public` schema 下创建的任何新表不再自动将权限授予 `user_a1` 用户。

### 步骤 4: 删除用户

当所有依赖都被撤销后，你应该可以删除 `user_a1` 用户了：

```sql
DROP USER user_a1;
```

## 查缺补漏

~~上面的操作只是赋予了当前用户对表的读写操作，如果你希望指定用户可以 在 public schema 下创建对象（比如表/enum/sequence） 那么需要在指定数据库中执行如下操作。~~

```
\c your_database
```

~~不要在 postgres 默认库下执行权限，一定要连接到你的实际数据库，否则授权不会作用。~~

```powershell
GRANT USAGE ON SCHEMA public TO your_user;
GRANT CREATE ON SCHEMA public TO your_user;
```

~~•	USAGE：允许访问 public schema 中的对象（表/类型等）
•	CREATE：允许在 public schema 下创建新对象（建表、建 enum）~~

~~在 PostgreSQL 15+ 里 一定要这两条 才能让普通用户执行 DDL。~~

~~上面的问题是我在执行 `npx prisma db push` 中遇到的权限报错问题。~~
