package redlib.backend.dao;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import redlib.backend.model.Category;
import java.util.List;

@Mapper
public interface NoteCategoryRelationMapper {

    //增加笔记和分类的关联，形成元组(笔记id，分类id)
    @Insert("INSERT INTO note_category_relation(note_id, category_id) VALUES(#{noteId}, #{categoryId})")
    int insert(@Param("noteId") Long noteId, @Param("categoryId") Long categoryId);

    //对笔记进行删除分类关联
    @Delete("DELETE FROM note_category_relation WHERE note_id = #{noteId}")
    int deleteByNoteId(Long noteId);

    //查出某篇笔记的所有分类的编号
    @Select("SELECT category_id FROM note_category_relation WHERE note_id = #{noteId}")
    List<Long> selectCategoryIdsByNoteId(Long noteId);

    //通过连表查询，查询得到分类的具体名字
    @Select("SELECT c.id, c.name, " +
            "c.user_id AS userId, " +
            "c.create_time AS createTime, " +
            "c.update_time AS updateTime " +
            "FROM category c " +
            "INNER JOIN note_category_relation r ON c.id = r.category_id " +
            "WHERE r.note_id = #{noteId}")
    List<Category> selectCategoriesByNoteId(Long noteId);
}