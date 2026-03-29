package redlib.backend.dao;

import org.apache.ibatis.annotations.Param;
import redlib.backend.dto.query.LoginLogQueryDTO;
import redlib.backend.model.LoginLog;

import java.util.List;

/**
 * 登录日志数据访问接口。
 *
 * <p>用于记录与查询后台管理员登录日志。</p>
 */
public interface LoginLogMapper {
    /**
     * 按主键删除登录日志。
     *
     * @param id 日志主键
     * @return 受影响行数
     */
    int deleteByPrimaryKey(Long id);

    /**
     * 新增登录日志。
     *
     * @param record 登录日志实体
     * @return 受影响行数
     */
    int insert(LoginLog record);

    /**
     * 按主键查询登录日志。
     *
     * @param id 日志主键
     * @return 登录日志，不存在时返回 {@code null}
     */
    LoginLog selectByPrimaryKey(Long id);

    /**
     * 按主键更新登录日志。
     *
     * @param record 登录日志实体
     * @return 受影响行数
     */
    int updateByPrimaryKey(LoginLog record);

    /**
     * 按筛选条件统计登录日志数量。
     *
     * @param queryDTO 查询条件
     * @return 命中数量
     */
    Integer count(@Param("queryDTO") LoginLogQueryDTO queryDTO);

    /**
     * 按筛选条件分页查询登录日志。
     *
     * @param queryDTO 查询条件
     * @param offset 起始偏移量
     * @param limit 返回记录数
     * @return 登录日志列表
     */
    List<LoginLog> list(
            @Param("queryDTO") LoginLogQueryDTO queryDTO,
            @Param("offset") Integer offset,
            @Param("limit") Integer limit);
}
