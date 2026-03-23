package redlib.backend.dao;

import org.apache.ibatis.annotations.*;
import redlib.backend.model.Category;
import redlib.backend.vo.CategoryStatVO;

import java.util.List;

/**
 * 鍒嗙被琛ㄧ殑鏁版嵁璁块棶鎺ュ彛銆? *
 * 涓昏璐熻矗锛? * 1. 鍒嗙被鏂板
 * 2. 鍒嗙被鍒楄〃鏌ヨ
 * 3. 鎸夋潯浠舵煡璇㈠崟涓垎绫? * 4. 鍒嗙被淇敼涓庡垹闄? * 5. 鍒嗙被缁熻鏌ヨ
 */
@Mapper
public interface CategoryMapper {

    /**
     * 鏂板鍒嗙被銆?     *
     * 鎻掑叆鏃朵細鑷姩鐢熸垚涓婚敭锛屽苟鍥炲～鍒?Category.id銆?     */
    @Insert("INSERT INTO category(name, user_id, create_time, update_time) VALUES(#{name}, #{userId}, NOW(), NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Category category);

    /**
     * 鏌ヨ鏌愪釜鐢ㄦ埛鐨勫叏閮ㄥ垎绫汇€?     */
    @Select("SELECT id, name, user_id AS userId, create_time AS createTime, update_time AS updateTime FROM category WHERE user_id = #{userId}")
    List<Category> selectByUserId(Long userId);

    /**
     * 鎸夊垎绫?ID 鍜岀敤鎴?ID 鏌ヨ鍗曚釜鍒嗙被銆?     *
     * 鐢ㄤ簬鍒犻櫎鍓嶃€佷慨鏀瑰墠纭鍒嗙被鏄惁瀛樺湪涓斿綊灞炲綋鍓嶇敤鎴枫€?     */
    @Select("SELECT id, name, user_id AS userId, create_time AS createTime, update_time AS updateTime FROM category WHERE id = #{id} AND user_id = #{userId} LIMIT 1")
    Category selectByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    /**
     * 鎸夌敤鎴?ID 鍜屽垎绫诲悕绉版煡璇㈠垎绫汇€?     *
     * 鐢ㄤ簬鏂板鍒嗙被鏃跺仛閲嶅悕鏍￠獙銆?     */
    @Select("SELECT id, name, user_id AS userId, create_time AS createTime, update_time AS updateTime FROM category WHERE user_id = #{userId} AND LOWER(TRIM(name)) = LOWER(#{name}) LIMIT 1")
    Category selectByUserIdAndName(@Param("userId") Long userId, @Param("name") String name);

    /**
     * 鎸夌敤鎴?ID 鍜屽垎绫诲悕绉版煡璇㈠垎绫伙紝浣嗘帓闄ゅ綋鍓嶅垎绫?ID銆?     *
     * 鐢ㄤ簬鏇存柊鍒嗙被鏃跺仛閲嶅悕鏍￠獙锛岄伩鍏嶆妸鑷繁璇垽鎴愰噸澶嶃€?     */
    @Select("SELECT id, name, user_id AS userId, create_time AS createTime, update_time AS updateTime FROM category WHERE user_id = #{userId} AND LOWER(TRIM(name)) = LOWER(#{name}) AND id <> #{id} LIMIT 1")
    Category selectByUserIdAndNameExcludeId(@Param("userId") Long userId, @Param("name") String name, @Param("id") Long id);

    /**
     * 鍒犻櫎鏌愪釜鐢ㄦ埛鑷繁鐨勫垎绫汇€?     */
    @Delete("DELETE FROM category WHERE id = #{id} AND user_id = #{userId}")
    int deleteByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    /**
     * 淇敼鍒嗙被鍚嶇О銆?     */
    @Update("UPDATE category SET name = #{name}, update_time = NOW() WHERE id = #{id} AND user_id = #{userId}")
    int update(Category category);

    /**
     * 缁熻鏌愪釜鐢ㄦ埛姣忎釜鍒嗙被涓嬬殑绗旇鏁伴噺銆?     */
    @Select("SELECT c.id AS categoryId, c.name AS categoryName, COUNT(r.note_id) AS noteCount " +
            "FROM category c " +
            "LEFT JOIN note_category_relation r ON c.id = r.category_id " +
            "WHERE c.user_id = #{userId} " +
            "GROUP BY c.id, c.name")
    List<CategoryStatVO> getStatisticsByUserId(Long userId);
}

