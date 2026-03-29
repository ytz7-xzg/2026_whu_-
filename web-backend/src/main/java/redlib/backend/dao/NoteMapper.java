package redlib.backend.dao;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import redlib.backend.model.Note;

import java.util.List;

/**
 * 笔记数据访问接口。
 *
 * <p>负责笔记的新增、修改、删除与按用户查询。</p>
 */
@Mapper
public interface NoteMapper {

    /**
     * 新增笔记，并回填生成后的笔记主键。
     *
     * @param note 笔记实体
     * @return 受影响行数
     */
    @Insert("INSERT INTO note(title, content, user_id) VALUES(#{title}, #{content}, #{userId})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Note note);

    /**
     * 更新指定用户的一篇笔记内容。
     *
     * @param note 笔记实体
     * @return 受影响行数
     */
    @Update("UPDATE note SET title = #{title}, content = #{content} WHERE id = #{id} AND user_id = #{userId}")
    int update(Note note);

    /**
     * 删除指定用户的一篇笔记。
     *
     * @param id 笔记 ID
     * @param userId 用户 ID
     * @return 受影响行数
     */
    @Delete("DELETE FROM note WHERE id = #{id} AND user_id = #{userId}")
    int deleteByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    /**
     * 查询指定用户的全部笔记。
     *
     * @param userId 用户 ID
     * @return 笔记列表
     */
    @Select("SELECT id, title, content, " +
            "user_id AS userId, " +
            "create_time AS createTime, " +
            "update_time AS updateTime " +
            "FROM note WHERE user_id = #{userId}")
    List<Note> selectByUserId(Long userId);
}
