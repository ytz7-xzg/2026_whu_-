package redlib.backend.dao;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import redlib.backend.model.Category;

import java.util.List;

/**
 * 笔记与分类关联关系的数据访问接口。
 *
 * <p>用于维护笔记和分类之间的多对多关系。</p>
 */
@Mapper
public interface NoteCategoryRelationMapper {

    /**
     * 新增一条笔记与分类的关联关系。
     *
     * @param noteId 笔记 ID
     * @param categoryId 分类 ID
     * @return 受影响行数
     */
    @Insert("INSERT INTO note_category_relation(note_id, category_id) VALUES(#{noteId}, #{categoryId})")
    int insert(@Param("noteId") Long noteId, @Param("categoryId") Long categoryId);

    /**
     * 删除指定笔记的全部分类关联。
     *
     * @param noteId 笔记 ID
     * @return 受影响行数
     */
    @Delete("DELETE FROM note_category_relation WHERE note_id = #{noteId}")
    int deleteByNoteId(Long noteId);

    /**
     * 查询指定笔记关联的全部分类 ID。
     *
     * @param noteId 笔记 ID
     * @return 分类 ID 列表
     */
    @Select("SELECT category_id FROM note_category_relation WHERE note_id = #{noteId}")
    List<Long> selectCategoryIdsByNoteId(Long noteId);

    /**
     * 查询指定笔记关联的全部分类详情。
     *
     * @param noteId 笔记 ID
     * @return 分类列表
     */
    @Select("SELECT c.id, c.name, " +
            "c.user_id AS userId, " +
            "c.create_time AS createTime, " +
            "c.update_time AS updateTime " +
            "FROM category c " +
            "INNER JOIN note_category_relation r ON c.id = r.category_id " +
            "WHERE r.note_id = #{noteId}")
    List<Category> selectCategoriesByNoteId(Long noteId);
}
