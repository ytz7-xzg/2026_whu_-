package redlib.backend.dao;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;
import redlib.backend.model.User;

/**
 * 普通用户数据访问接口。
 *
 * <p>当前主要用于注册与按用户名查询用户信息。</p>
 */
@Mapper
public interface UserMapper {

    /**
     * 新增普通用户，并回填生成后的用户主键。
     *
     * @param user 用户实体
     * @return 受影响行数
     */
    @Insert("INSERT INTO user(username, password) VALUES(#{username}, #{password})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(User user);

    /**
     * 按用户名查询用户信息。
     *
     * <p>常用于登录校验、注册重名校验等场景。</p>
     *
     * @param username 用户名
     * @return 用户信息，不存在时返回 {@code null}
     */
    @Select("SELECT id, username, password, create_time AS createTime, update_time AS updateTime " +
            "FROM user WHERE username = #{username}")
    User selectByUsername(String username);
}
