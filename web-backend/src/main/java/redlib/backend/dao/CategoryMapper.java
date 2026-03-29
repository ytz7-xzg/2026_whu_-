package redlib.backend.dao;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import redlib.backend.model.Category;
import redlib.backend.vo.CategoryStatVO;

import java.util.List;

/**
 * 分类数据访问接口。
 *
 * <p>负责当前用户分类的新增、查询、修改、删除，以及分类下笔记数量统计。</p>
 */
@Mapper
public interface CategoryMapper {

    /**
     * 新增分类，并回填生成后的分类主键。
     *
     * @param category 分类实体
     * @return 受影响行数
     */
    @Insert("INSERT INTO category(name, user_id, create_time, update_time) VALUES(#{name}, #{userId}, NOW(), NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Category category);

    /**
     * 查询指定用户的全部分类。
     *
     * @param userId 用户 ID
     * @return 分类列表
     */
    @Select("SELECT id, name, user_id AS userId, create_time AS createTime, update_time AS updateTime FROM category WHERE user_id = #{userId}")
    List<Category> selectByUserId(Long userId);

    /**
     * 按分类 ID 和用户 ID 查询单个分类。
     *
     * <p>用于确保只能访问当前用户自己的分类数据。</p>
     *
     * @param id 分类 ID
     * @param userId 用户 ID
     * @return 分类信息，不存在时返回 {@code null}
     */
    @Select("SELECT id, name, user_id AS userId, create_time AS createTime, update_time AS updateTime FROM category WHERE id = #{id} AND user_id = #{userId} LIMIT 1")
    Category selectByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    /**
     * 按用户 ID 和分类名称查询分类。
     *
     * <p>名称查询会先去除首尾空格，并忽略大小写，常用于新增前重名校验。</p>
     *
     * @param userId 用户 ID
     * @param name 分类名称
     * @return 分类信息，不存在时返回 {@code null}
     */
    @Select("SELECT id, name, user_id AS userId, create_time AS createTime, update_time AS updateTime FROM category WHERE user_id = #{userId} AND LOWER(TRIM(name)) = LOWER(#{name}) LIMIT 1")
    Category selectByUserIdAndName(@Param("userId") Long userId, @Param("name") String name);

    /**
     * 按用户 ID 和分类名称查询分类，并排除指定分类 ID。
     *
     * <p>常用于编辑分类时的重名校验，避免将自己误判为重复数据。</p>
     *
     * @param userId 用户 ID
     * @param name 分类名称
     * @param id 需要排除的分类 ID
     * @return 分类信息，不存在时返回 {@code null}
     */
    @Select("SELECT id, name, user_id AS userId, create_time AS createTime, update_time AS updateTime FROM category WHERE user_id = #{userId} AND LOWER(TRIM(name)) = LOWER(#{name}) AND id <> #{id} LIMIT 1")
    Category selectByUserIdAndNameExcludeId(@Param("userId") Long userId, @Param("name") String name, @Param("id") Long id);

    /**
     * 按分类 ID 和用户 ID 删除分类。
     *
     * @param id 分类 ID
     * @param userId 用户 ID
     * @return 受影响行数
     */
    @Delete("DELETE FROM category WHERE id = #{id} AND user_id = #{userId}")
    int deleteByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    /**
     * 更新分类名称。
     *
     * @param category 分类实体
     * @return 受影响行数
     */
    @Update("UPDATE category SET name = #{name}, update_time = NOW() WHERE id = #{id} AND user_id = #{userId}")
    int update(Category category);

    /**
     * 统计指定用户各分类下关联的笔记数量。
     *
     * @param userId 用户 ID
     * @return 分类统计结果列表
     */
    @Select("SELECT c.id AS categoryId, c.name AS categoryName, COUNT(r.note_id) AS noteCount " +
            "FROM category c " +
            "LEFT JOIN note_category_relation r ON c.id = r.category_id " +
            "WHERE c.user_id = #{userId} " +
            "GROUP BY c.id, c.name")
    List<CategoryStatVO> getStatisticsByUserId(Long userId);
}
