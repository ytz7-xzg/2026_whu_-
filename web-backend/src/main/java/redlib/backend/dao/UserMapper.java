package redlib.backend.dao;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;
import redlib.backend.model.User;

@Mapper
public interface UserMapper {

    // 1. 注册功能：往数据库插入一个新用户
    @Insert("INSERT INTO user(username, password) VALUES(#{username}, #{password})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(User user);

    // 2. 登录/校验功能：根据用户名去数据库里把这个人的完整信息查出来
    @Select("SELECT id, username, password, create_time AS createTime, update_time AS updateTime " +
            "FROM user WHERE username = #{username}")
    User selectByUsername(String username);
}