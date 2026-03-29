package redlib.backend.dao;

import org.apache.ibatis.annotations.Param;
import redlib.backend.dto.query.DepartmentQueryDTO;
import redlib.backend.model.Department;

import java.util.List;

/**
 * 部门数据访问接口。
 *
 * <p>负责部门信息的增删改查、分页检索以及按条件批量查询。</p>
 */
public interface DepartmentMapper {
    /**
     * 按主键查询部门。
     *
     * @param id 部门主键
     * @return 部门信息，不存在时返回 {@code null}
     */
    Department selectByPrimaryKey(Integer id);

    /**
     * 新增部门记录。
     *
     * @param record 部门实体
     * @return 受影响行数
     */
    int insert(Department record);

    /**
     * 按主键更新部门记录。
     *
     * @param record 部门实体
     * @return 受影响行数
     */
    int updateByPrimaryKey(Department record);

    /**
     * 按部门编码和租户编码查询部门详情。
     *
     * @param departmentCode 部门编码
     * @param tenantCode 租户编码
     * @return 部门信息，不存在时返回 {@code null}
     */
    Department getByCode(
            @Param("departmentCode") String departmentCode,
            @Param("tenantCode") String tenantCode);

    /**
     * 按查询条件统计部门数量。
     *
     * @param queryDTO 查询条件
     * @return 命中数量
     */
    Integer count(DepartmentQueryDTO queryDTO);

    /**
     * 按查询条件分页获取部门列表。
     *
     * @param queryDTO 查询条件
     * @param offset 起始偏移量
     * @param limit 返回记录数
     * @return 部门列表
     */
    List<Department> list(
            @Param("queryDTO") DepartmentQueryDTO queryDTO,
            @Param("offset") Integer offset,
            @Param("limit") Integer limit);

    /**
     * 按部门主键列表批量删除部门。
     *
     * @param codeList 部门 ID 列表
     */
    void deleteByCodes(@Param("codeList") List<Integer> codeList);

    /**
     * 按部门编码列表查询部门信息。
     *
     * @param codeList 部门编码列表
     * @param tenantCode 租户编码
     * @return 部门列表
     */
    List<Department> listByCodes(
            @Param("codeList") List<String> codeList,
            @Param("tenantCode") String tenantCode);

    /**
     * 按部门名称模糊查询部门列表。
     *
     * @param departmentName 部门名称，支持模糊匹配
     * @param tenantCode 租户编码
     * @return 部门列表
     */
    List<Department> listByName(
            @Param("departmentName") String departmentName,
            @Param("tenantCode") String tenantCode);
}
