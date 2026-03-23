# web-backend 代码结构解析与注释指南

## 1. 项目概览

`web-backend` 是一个基于以下技术栈的后端项目：

- `Spring Boot 3`
- `MyBatis`
- `Spring AOP`
- `OpenAPI / Swagger`
- `MySQL`
- `Apache POI`

从结构上看，这个项目可以分成两部分：

1. **当前 MyNote 前端真正使用的业务**
   - 用户注册 / 登录
   - 分类管理
   - 笔记管理
2. **模板自带的后台管理功能**
   - 管理员管理
   - 部门管理
   - 登录日志
   - 在线用户

所以阅读时，建议你优先读“笔记系统主链路”，再读后台模板模块。

---

## 2. 根目录结构

### 2.1 顶层文件

- `build.gradle`
  - Gradle 构建配置
  - 声明 Spring Boot、MyBatis、AOP、MySQL、POI、OpenAPI 等依赖
- `settings.gradle`
  - Gradle 项目基础配置
- `README.md`
  - 项目说明，但目前内容比较少，而且有乱码，不建议作为主要参考
- `data/demo.sql`
  - 数据库建表和演示数据
  - 想理解项目数据结构时，这个文件非常重要

### 2.2 目录

- `src/main/java/redlib/backend`
  - Java 主代码目录
- `src/main/resources`
  - 配置文件、MyBatis XML Mapper、生成器配置
- `lib`
  - MyBatis Generator 相关 jar
- `build`
  - 构建输出目录

---

## 3. Java 主代码目录结构

`src/main/java/redlib/backend` 下的核心结构如下：

- `annotation`
- `config`
- `controller`
- `dao`
- `dto`
- `filter`
- `model`
- `service`
- `utils`
- `vo`

这些目录基本对应一个经典的 Spring Boot 分层架构。

---

## 4. 各目录职责说明

### 4.1 `annotation`

放自定义注解。

#### 文件说明

- `Privilege.java`
  - 标记某个方法需要权限
  - 如果不带参数，表示“只要登录即可访问”
- `NeedNoPrivilege.java`
  - 标记某个方法无需鉴权
  - 比如登录、注册接口
- `BackendModule.java`
  - 标记某个 Controller 属于哪个权限模块
  - 主要服务于后台管理员权限系统

#### 逻辑作用

这些注解本身不执行业务，它们配合 `TokenCheckAspect` 一起完成权限控制。

---

### 4.2 `config`

放项目级配置、切面、统一返回处理。

#### 文件说明

- `WebConfig.java`
  - 配置跨域访问（CORS）
  - 当前允许前端从 `http://localhost:5173` 和 `http://localhost:8080` 访问
  - 允许携带 Cookie

- `TokenCheckAspect.java`
  - 核心鉴权切面
  - 拦截所有 `controller` 下的方法
  - 判断：
    - 是否免鉴权
    - 是否只需要登录
    - 是否需要具体权限

- `MyControllerAdvice.java`
  - 统一异常处理
  - 统一把返回值包装为 `ResponseData`
  - 这样 Controller 可以直接返回对象，最终仍会变成统一 JSON

- `OpenApiConfig.java`
  - 对 Swagger/OpenAPI 的 tag 做细节修饰

#### 这里最关键的文件

最关键的是：

- `TokenCheckAspect.java`
- `MyControllerAdvice.java`

这两个文件决定了：

1. 接口是否能访问
2. 接口最终返回什么格式

---

### 4.3 `filter`

放 Servlet 过滤器和请求包装器。

#### 文件说明

- `TokenFilter.java`
  - 在请求进入 Controller 之前执行
  - 从请求中拿出 `accessToken`
  - 调用 `TokenService` 查 token
  - 把 token 放到 `ThreadContextHolder`

- `RequestWrapper.java`
  - 对原始请求做包装
  - 当前主要作用是从 Cookie 中提取 `accessToken`

#### 主逻辑

过滤器层解决的是：

> “当前请求对应的是谁？”

它不做权限判断，只负责把登录态装进当前线程上下文。

---

### 4.4 `controller`

放接口层代码，直接对外暴露 HTTP API。

#### 文件说明

- `AuthenticationController.java`
  - 普通用户注册
  - 普通用户登录
  - 获取当前登录用户
  - 退出登录

- `CategoryController.java`
  - 分类列表
  - 新增分类
  - 删除分类
  - 分类统计
  - 更新分类

- `NoteController.java`
  - 笔记列表
  - 新增笔记
  - 更新笔记
  - 删除笔记

- `AdminController.java`
  - 管理员管理

- `DepartmentController.java`
  - 部门管理
  - 包含 Excel 导入导出

- `LoginLogController.java`
  - 登录日志分页查询

- `OnlineUserController.java`
  - 在线用户列表
  - 踢人

#### Controller 层的职责

Controller 主要做四件事：

1. 接收参数
2. 拿当前用户信息
3. 调用 Service
4. 返回结果

它本身不应该写太多复杂业务逻辑。

---

### 4.5 `service`

放业务接口定义。

#### 文件说明

- `UserService.java`
- `TokenService.java`
- `NoteService.java`
- `CategoryService.java`
- `AdminService.java`
- `DepartmentService.java`
- `LoginLogService.java`

#### 作用

Service 接口层的意义是把“业务能力”抽象出来，便于：

- 解耦 Controller 和实现类
- 以后替换实现
- 组织业务边界

---

### 4.6 `service/impl`

放业务实现类，是项目真正的业务核心。

#### 文件说明

- `UserServiceImpl.java`
  - 注册时先查用户名是否重复
  - 登录时按用户名查用户，再校验密码

- `TokenServiceImpl.java`
  - 登录后生成 token
  - 把 token 存进内存 `ConcurrentHashMap`
  - 提供获取 token、退出登录、踢人等能力

- `NoteServiceImpl.java`
  - 查询笔记时补全分类信息
  - 新建笔记时写主表 + 关系表
  - 更新笔记时先更新主表，再重建关系
  - 删除笔记时先删关系表，再删主表
  - 用事务保证一致性

- `CategoryServiceImpl.java`
  - 分类增删改查与统计

- `AdminServiceImpl.java`
  - 后台管理员业务核心
  - 负责模块权限、管理员增删改查、密码更新等

- `DepartmentServiceImpl.java`
  - 部门分页、增删改、导入导出

- `LoginLogServiceImpl.java`
  - 登录日志分页查询

#### 最值得重点阅读的实现类

如果你的目标是理解当前 MyNote 的业务，优先读：

- `UserServiceImpl.java`
- `TokenServiceImpl.java`
- `CategoryServiceImpl.java`
- `NoteServiceImpl.java`

---

### 4.7 `dao`

放数据库访问接口（Mapper）。

#### 两种风格并存

这个项目的 DAO 有两种写法：

1. **注解 SQL**
   - `UserMapper.java`
   - `NoteMapper.java`
   - `CategoryMapper.java`
   - `NoteCategoryRelationMapper.java`

2. **XML SQL**
   - `AdminMapper.java` + `AdminMapper.xml`
   - `AdminPrivMapper.java` + `AdminPrivMapper.xml`
   - `DepartmentMapper.java` + `DepartmentMapper.xml`
   - `LoginLogMapper.java` + `LoginLogMapper.xml`

#### 说明

这通常意味着：

- 新增的“笔记系统”代码写得更轻量，直接用注解 SQL
- 旧模板里的后台模块保留了传统 XML Mapper 风格

---

### 4.8 `dto`

放数据传输对象，通常用于：

- 接收前端参数
- Service 层内部传递结构化输入

#### 文件说明

- `AdminDTO.java`
- `AdminModDTO.java`
- `DepartmentDTO.java`

#### `dto/query`

专门用于查询场景的 DTO：

- `PageQueryDTO.java`
  - 分页基础类
- `KeywordQueryDTO.java`
  - 关键字分页查询
- `DepartmentQueryDTO.java`
  - 部门分页查询
- `LoginLogQueryDTO.java`
  - 登录日志分页查询

---

### 4.9 `model`

放实体模型，通常和数据库表结构比较接近。

#### 文件说明

- `User.java`
- `Token.java`
- `ResponseData.java`
- `Page.java`
- `Note.java`
- `Category.java`
- `Admin.java`
- `AdminPriv.java`
- `Department.java`
- `LoginLog.java`

#### 其中几个特别关键

- `ResponseData.java`
  - 所有接口统一返回格式
- `Token.java`
  - 当前登录态信息
- `Note.java`
  - 笔记实体
  - 除了表字段，还带 `categoryIds` 和 `categoryList`

---

### 4.10 `vo`

放返回给前端的“展示对象”。

#### 文件说明

- `AdminVO.java`
- `DepartmentVO.java`
- `LoginLogVO.java`
- `OnlineUserVO.java`
- `ModuleVO.java`
- `PrivilegeVO.java`
- `CategoryStatVO.java`
- `LuceneResultBookVO.java`

#### 说明

VO 的重点是：

> 不一定和数据库一一对应，而是更贴近前端显示需求。

比如：

- `CategoryStatVO` 用于返回分类统计
- `AdminVO` 会带 `createdByDesc`、`updatedByDesc`

其中 `LuceneResultBookVO.java` 当前没有明显使用痕迹，更像旧功能遗留。

---

### 4.11 `utils`

放通用工具类。

#### 文件说明

- `ThreadContextHolder.java`
  - 用 `ThreadLocal` 保存当前请求的 token

- `PageUtils.java`
  - 统一分页计算工具

- `FormatUtils.java`
  - 通用格式化工具类
  - 功能非常多，包括：
    - trim 字符串字段
    - 模糊查询关键字处理
    - 排序字段处理
    - 驼峰转下划线
    - 密码 SHA1 处理
    - 日期格式化

- `XlsUtils.java`
  - Excel 导入导出工具

- `FileUtils.java`
  - 文件目录处理工具

#### 阅读建议

这里最常用的是：

- `ThreadContextHolder`
- `PageUtils`
- `FormatUtils`

其中 `FormatUtils` 很大，不建议一口气全读，优先看业务实际调用到的方法。

---

### 4.12 `service/utils`

放偏业务的辅助工具。

#### 文件说明

- `AdminUtils.java`
  - 管理员 DTO 校验
  - 管理员实体转 VO
  - 通过 `Controller` 名推导模块名

- `DepartmentUtils.java`
  - 部门 DTO 校验
  - 部门实体转 VO

- `TokenUtils.java`
  - Token 转 `OnlineUserVO`

---

## 5. resources 目录结构

### 5.1 `application.properties`

项目运行配置。

主要内容：

- 数据库连接
- 端口号 `9311`
- Jackson 日期格式
- MyBatis mapper 路径
- Swagger 开关

这是项目启动时必看的配置文件。

### 5.2 `mapper`

放 MyBatis XML Mapper。

当前包括：

- `AdminMapper.xml`
- `AdminPrivMapper.xml`
- `DepartmentMapper.xml`
- `LoginLogMapper.xml`

### 5.3 `generatorConfig.xml`

MyBatis Generator 配置文件。

主要作用：

- 自动生成 XML 风格 Mapper 相关代码

---

## 6. 请求主流程（重点）

下面以普通用户的请求为例，说明整个后端调用链。

### 6.1 登录流程

1. 前端调用 `/api/authentication/login`
2. `AuthenticationController.login()` 接收用户名密码
3. 调用 `UserService.login()` 校验用户
4. 调用 `TokenService.login()` 生成 token
5. 把 token 写入 Cookie：`accessToken`
6. 返回 token 信息给前端

### 6.2 普通接口访问流程

1. 浏览器请求到达后，先经过 `TokenFilter`
2. `TokenFilter` 从 Cookie 中拿 `accessToken`
3. 调用 `TokenService.getToken()` 查找登录态
4. 把 token 放进 `ThreadContextHolder`
5. 请求进入 `TokenCheckAspect`
6. 切面检查该接口是否：
   - 免鉴权
   - 只需要登录
   - 需要具体权限
7. 校验通过后，进入 Controller
8. Controller 从 `ThreadContextHolder` 取当前用户
9. 调用 Service
10. Service 调用 DAO
11. DAO 执行 SQL
12. 返回结果经过 `MyControllerAdvice` 统一包装成 `ResponseData`

---

## 7. MyNote 当前真正相关的模块

如果你是为了当前前端适配，只需要重点理解下面这些文件。

### 7.1 用户与登录

- `controller/AuthenticationController.java`
- `service/UserService.java`
- `service/impl/UserServiceImpl.java`
- `service/TokenService.java`
- `service/impl/TokenServiceImpl.java`
- `dao/UserMapper.java`
- `model/User.java`
- `model/Token.java`

### 7.2 分类

- `controller/CategoryController.java`
- `service/CategoryService.java`
- `service/impl/CategoryServiceImpl.java`
- `dao/CategoryMapper.java`
- `model/Category.java`
- `vo/CategoryStatVO.java`

### 7.3 笔记

- `controller/NoteController.java`
- `service/NoteService.java`
- `service/impl/NoteServiceImpl.java`
- `dao/NoteMapper.java`
- `dao/NoteCategoryRelationMapper.java`
- `model/Note.java`

---

## 8. 各主要文件的逻辑说明

### 8.1 `AuthenticationController`

#### 作用

负责普通用户身份相关接口。

#### 核心方法

- `register`
  - 新用户注册
- `login`
  - 登录后写 Cookie
- `getCurrentUser`
  - 获取当前登录 token 对应的用户信息
- `logout`
  - 从内存中移除 token

#### 特点

- 这里的登录不是 JWT，也不是 Redis，而是**内存 token**

---

### 8.2 `UserServiceImpl`

#### 作用

处理普通用户注册和登录校验。

#### 逻辑

- 注册时：
  - 先按用户名查数据库
  - 如果已存在就抛异常
  - 否则插入新用户

- 登录时：
  - 查用户
  - 比较密码
  - 成功后返回用户对象

#### 注意

- 当前普通用户密码是**明文比较**
- 这在真实生产环境里不安全

---

### 8.3 `TokenServiceImpl`

#### 作用

管理登录态。

#### 核心逻辑

- 使用 `ConcurrentHashMap<String, Token>` 在内存中存 token
- 登录成功后生成随机 token
- 每个 token 对应一个 `Token` 对象
- `logout` / `kick` 本质上是把 token 从内存移除

#### 注意

- 服务重启后，所有登录态都会丢失
- 没有持久化

---

### 8.4 `CategoryController + CategoryServiceImpl + CategoryMapper`

#### 作用

实现分类的增删改查和统计。

#### 主链路

- Controller 拿当前用户 ID
- Service 调 DAO
- Mapper 直接执行 SQL

#### 特点

- 逻辑比较薄
- 主要是按 `user_id` 过滤分类

---

### 8.5 `NoteController + NoteServiceImpl + NoteMapper + NoteCategoryRelationMapper`

#### 作用

实现笔记管理。

#### 主逻辑

- 查询笔记：
  - 先查笔记主表
  - 再按每条笔记补分类 ID 列表和分类对象列表

- 新增笔记：
  - 先插入 `note`
  - 再插入 `note_category_relation`

- 更新笔记：
  - 先更新 `note`
  - 删除旧关系
  - 重建新关系

- 删除笔记：
  - 先删关系表
  - 再删主表

#### 为什么要加事务

因为一个操作会动多张表，如果中间失败，需要回滚，保证数据一致。

---

## 9. 后台模板模块如何理解

如果你只是做 MyNote，这部分优先级较低。

### 9.1 管理员模块

- `AdminController`
- `AdminServiceImpl`
- `AdminMapper`
- `AdminPrivMapper`

它是一个比较完整的后台权限系统：

- 管理员信息
- 权限模块
- 权限点
- root 管理员特殊逻辑

### 9.2 部门模块

- `DepartmentController`
- `DepartmentServiceImpl`
- `DepartmentMapper`

功能包括：

- 分页查询
- 新增修改删除
- Excel 导入
- Excel 导出

### 9.3 登录日志模块

- `LoginLogController`
- `LoginLogServiceImpl`
- `LoginLogMapper`

典型分页查询模块，结构很标准。

### 9.4 在线用户模块

- `OnlineUserController`
- `TokenServiceImpl`

当前功能比较弱，因为普通用户 token 存在内存里，且 `list()` 直接返回空列表。

---

## 10. 这个项目的几个设计特点

### 10.1 优点

- 分层比较清楚
- 接口返回格式统一
- 普通业务和后台模板功能都能独立看
- 笔记和分类主链路比较简单，容易上手

### 10.2 需要注意的地方

- 注释有历史乱码，说明编码管理不统一
- 普通用户密码明文存储 / 明文校验
- token 存内存，不适合生产环境
- DAO 层风格不统一（注解 SQL + XML SQL 混用）
- 有部分旧模板遗留代码，不一定被当前业务使用

---

## 11. 推荐阅读顺序

### 第一阶段：先看整体入口

1. `WebBackendApplication.java`
2. `application.properties`
3. `demo.sql`

### 第二阶段：理解登录态

1. `RequestWrapper.java`
2. `TokenFilter.java`
3. `ThreadContextHolder.java`
4. `TokenCheckAspect.java`

### 第三阶段：看当前笔记业务

1. `AuthenticationController.java`
2. `UserServiceImpl.java`
3. `TokenServiceImpl.java`
4. `CategoryController.java`
5. `CategoryServiceImpl.java`
6. `CategoryMapper.java`
7. `NoteController.java`
8. `NoteServiceImpl.java`
9. `NoteMapper.java`
10. `NoteCategoryRelationMapper.java`

### 第四阶段：再看后台模板模块

1. `AdminController.java`
2. `AdminServiceImpl.java`
3. `DepartmentController.java`
4. `DepartmentServiceImpl.java`
5. `LoginLogController.java`
6. `LoginLogServiceImpl.java`

---

## 12. 如何给这个项目写注释

你提到“告诉我如何进行注释”，这里我给你一个可直接落地的策略。

### 12.1 注释目标

注释不是把代码翻译成中文，而是回答以下问题：

- 这段代码是干什么的？
- 为什么要这样写？
- 输入输出是什么？
- 哪些地方有副作用或隐藏规则？

### 12.2 Controller 层怎么注释

建议重点写：

- 接口功能
- 路径
- 权限要求
- 参数来源
- 返回内容

#### 示例模板

```java
/**
 * 功能：创建一条新笔记
 * 路径：POST /api/note/add
 * 权限：已登录用户可访问
 * 参数：请求体中的 Note 对象
 * 返回：统一包装后的成功消息
 */
```

### 12.3 Service 层怎么注释

这里最重要的是写“业务规则”和“为什么”。

#### 应该重点注释的内容

- 为什么要加事务
- 为什么要先删关系表再删主表
- 为什么要做查重
- 为什么要补充 `categoryList`

#### 示例模板

```java
/**
 * 更新笔记及其分类关系。
 * 之所以采用“先更新主表，再删除旧关系，再重建新关系”的方式，
 * 是因为一条笔记可能关联多个分类，直接全量重建实现更简单，且便于保证一致性。
 */
```

### 12.4 DAO 层怎么注释

只注释“查询意图”和“过滤条件”，不要逐句翻译 SQL。

#### 示例模板

```java
/**
 * 查询指定用户的全部笔记。
 * 这里只查主表字段，分类关系由关系表单独补充。
 */
```

### 12.5 Model / DTO / VO 怎么注释

只给“有业务含义的字段”加注释。

#### 适合写注释的字段

- `privSet`
- `categoryIds`
- `categoryList`
- `createdByDesc`
- `updatedByDesc`

#### 不必过度注释的字段

- `id`
- `name`
- `title`

除非它们含义不直观。

### 12.6 过滤器 / 切面 / 工具类怎么注释

这类代码最适合写“流程性注释”。

#### 例如

- 过滤器：
  - 负责提取 token，不做权限判定
- 切面：
  - 负责决定能不能访问接口
- `ThreadContextHolder`：
  - 负责把当前用户登录态贯穿整个请求链路

---

## 13. 注释落地建议

### 建议优先补注释的文件

如果你准备真正开始补注释，建议按这个顺序：

1. `TokenCheckAspect.java`
2. `TokenFilter.java`
3. `AuthenticationController.java`
4. `TokenServiceImpl.java`
5. `UserServiceImpl.java`
6. `NoteServiceImpl.java`
7. `CategoryServiceImpl.java`

这些文件最能帮助后来的人快速看懂系统主链路。

### 不建议优先花时间的地方

- `FormatUtils.java` 全量逐行注释
- XML Mapper 里的每一行 SQL 都翻译一遍
- 每个 getter / setter 字段都写重复注释

这类投入大，但收益不高。

---

## 14. 总结

这个项目的真实主线可以概括成一句话：

> 浏览器带着 Cookie 请求后端，过滤器提取 token，切面做鉴权，Controller 调 Service，Service 调 Mapper，最终统一包装成 `ResponseData` 返回。

如果你只关心当前 MyNote 的前后端联动，核心看这几块就够了：

- 登录注册
- token 登录态
- 分类
- 笔记

而管理员、部门、日志这些模块，更像原模板提供的后台能力，可以放到第二优先级阅读。

---

## 15. 进一步学习建议

如果你下一步还想继续深入，建议你做这两件事：

1. 画一张“请求调用链图”
   - `浏览器 -> TokenFilter -> TokenCheckAspect -> Controller -> Service -> DAO -> DB`

2. 以“笔记新增”或“登录”流程为例，手工顺一遍断点
   - 这是最快的理解方式

---

如果你愿意，我下一步可以继续帮你生成一份：

- **更适合交作业/汇报的版本**
  或者
- **带 Mermaid 架构图的版本**

