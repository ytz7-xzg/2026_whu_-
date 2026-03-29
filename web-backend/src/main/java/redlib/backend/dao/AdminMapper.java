package redlib.backend.dao;

import org.apache.ibatis.annotations.Param;
import redlib.backend.dto.query.KeywordQueryDTO;
import redlib.backend.model.Admin;

import java.util.List;

/**
 * 管理员数据访问接口。
 *
 * <p>负责管理员账户的基础 CRUD、登录校验以及分页检索。</p>
 */
public interface AdminMapper {
    /**
     * 按主键删除管理员。
     *
     * @param userid 管理员主键
     * @return 受影响行数
     */
    int deleteByPrimaryKey(Integer userid);

    /**
     * 新增管理员。
     *
     * @param record 管理员实体
     * @return 受影响行数
     */
    int insert(Admin record);

    /**
     * 按主键查询管理员。
     *
     * @param userid 管理员主键
     * @return 管理员信息，不存在时返回 {@code null}
     */
    Admin selectByPrimaryKey(Integer userid);

    /**
     * 按主键更新管理员信息。
     *
     * @param record 管理员实体
     * @return 受影响行数
     */
    int updateByPrimaryKey(Admin record);

    /**
     * 校验管理员登录信息。
     *
     * @param userCode 管理员账号
     * @param password 密码
     * @return 登录成功时返回管理员信息，否则返回 {@code null}
     */
    Admin login(@Param("userCode") String userCode, @Param("password") String password);

    /**
     * 按管理员 ID 列表查询管理员信息。
     *
     * @param ids 管理员 ID 列表
     * @return 管理员列表
     */
    List<Admin> listByIds(@Param("ids") List<Integer> ids);

    /**
     * 按关键字查询条件统计管理员数量。
     *
     * @param queryDTO 查询条件
     * @return 命中数量
     */
    Integer count(@Param("queryDTO") KeywordQueryDTO queryDTO);

    /**
     * 按关键字查询条件分页获取管理员列表。
     *
     * @param queryDTO 查询条件
     * @param offset 起始偏移量
     * @param limit 返回记录数
     * @return 管理员列表
     */
    List<Admin> list(
            @Param("queryDTO") KeywordQueryDTO queryDTO,
            @Param("offset") Integer offset,
            @Param("limit") Integer limit);

    /**
     * 按管理员 ID 列表批量删除管理员。
     *
     * <p>底层 SQL 会保留 {@code root} 账号，不会被删除。</p>
     *
     * @param ids 管理员 ID 列表
     * @return 受影响行数
     */
    int delete(@Param("ids") List<Integer> ids);

    /**
     * 按管理员账号查询管理员信息。
     *
     * @param userCode 管理员账号
     * @return 管理员信息，不存在时返回 {@code null}
     */
    Admin getByUserCode(String userCode);
}
