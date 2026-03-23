package redlib.backend.service; // 保留你自己的包名

import redlib.backend.model.User;

public interface UserService {
    // 1. 注册新用户
    void register(User user);

    // 2. 验证登录，并返回真实的用户信息
    User login(String username, String password);
}