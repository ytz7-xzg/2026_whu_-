package redlib.backend.dao;

import org.apache.ibatis.annotations.*;
import redlib.backend.model.Note;
import java.util.List;

@Mapper
public interface NoteMapper {

    //插入笔记，(笔记名，内容，用户id)
    @Insert("INSERT INTO note(title, content, user_id) VALUES(#{title}, #{content}, #{userId})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Note note);

    //给笔记修改内容，题目
    @Update("UPDATE note SET title = #{title}, content = #{content} WHERE id = #{id} AND user_id = #{userId}")
    int update(Note note);

    //删除笔记
    @Delete("DELETE FROM note WHERE id = #{id} AND user_id = #{userId}")
    int deleteByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    //查询笔记
    @Select("SELECT id, title, content, " +
            "user_id AS userId, " +
            "create_time AS createTime, " +
            "update_time AS updateTime " +
            "FROM note WHERE user_id = #{userId}")
    List<Note> selectByUserId(Long userId);
}