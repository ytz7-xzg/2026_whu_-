package redlib.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import redlib.backend.dao.UserMapper;
import redlib.backend.model.User;
import redlib.backend.service.UserService;

/**
 * 普通用户业务实现类。
 *
 * 主要负责两件事：
 * 1. 用户注册
 * 2. 用户登录时的账号密码校验
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    /**
     * user 表数据访问层。
     */
    private final UserMapper userMapper;

    /**
     * 统一规范用户名：去掉首尾空格。
     */
    private String normalizeUsername(String username) {
        return username == null ? null : username.trim();
    }

    /**
     * 用户注册。
     *
     * 逻辑：
     * 1. 校验用户对象、用户名、密码不能为空
     * 2. 用户名去首尾空格
     * 3. 按用户名查询数据库，检查是否重复
     * 4. 若不重复，则保存到数据库
     */
    @Override
    public void register(User user) {
        Assert.notNull(user, "用户信息不能为空");

        String username = normalizeUsername(user.getUsername());
        Assert.hasText(username, "用户名不能为空");
        Assert.hasText(user.getPassword(), "密码不能为空");

        User existUser = userMapper.selectByUsername(username);
        if (existUser != null) {
            throw new RuntimeException("用户名已存在，请更换后重试");
        }

        user.setUsername(username);
        userMapper.insert(user);
    }

    /**
     * 用户登录校验。
     *
     * 逻辑：
     * 1. 用户名、密码不能为空
     * 2. 按用户名查询用户
     * 3. 用户不存在则报错
     * 4. 密码不匹配则报错
     * 5. 校验通过则返回用户对象
     */
    @Override
    public User login(String username, String password) {
        String normalizedUsername = normalizeUsername(username);
        Assert.hasText(normalizedUsername, "用户名不能为空");
        Assert.hasText(password, "密码不能为空");

        User user = userMapper.selectByUsername(normalizedUsername);
        if (user == null) {
            throw new RuntimeException("登录失败：该用户不存在");
        }

        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("登录失败：密码错误");
        }

        return user;
    }
}
