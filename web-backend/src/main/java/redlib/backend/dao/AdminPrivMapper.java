package redlib.backend.dao;

import org.apache.ibatis.annotations.Param;
import redlib.backend.model.AdminPriv;

import java.util.List;

/**
 * 管理员权限数据访问接口。
 *
 * <p>用于维护管理员与模块权限之间的对应关系。</p>
 */
public interface AdminPrivMapper {
    /**
     * 按主键删除权限记录。
     *
     * @param id 权限记录主键
     * @return 受影响行数
     */
    int deleteByPrimaryKey(Integer id);

    /**
     * 新增管理员权限记录。
     *
     * @param record 权限实体
     * @return 受影响行数
     */
    int insert(AdminPriv record);

    /**
     * 按主键查询权限记录。
     *
     * @param id 权限记录主键
     * @return 权限信息，不存在时返回 {@code null}
     */
    AdminPriv selectByPrimaryKey(Integer id);

    /**
     * 按主键更新权限记录。
     *
     * @param record 权限实体
     * @return 受影响行数
     */
    int updateByPrimaryKey(AdminPriv record);

    /**
     * 查询指定管理员的全部权限记录。
     *
     * @param id 管理员 ID
     * @return 权限列表
     */
    List<AdminPriv> list(Integer id);

    /**
     * 按管理员 ID 列表批量删除权限记录。
     *
     * @param ids 管理员 ID 列表
     */
    void deleteByAdminIds(@Param("ids") List<Integer> ids);
}
