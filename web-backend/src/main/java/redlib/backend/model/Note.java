package redlib.backend.model;

import lombok.Data;
import java.util.Date;
import java.util.List;

/**
 * 笔记实体类 (对应数据库的 note 表)
 */
@Data
public class Note {

    private Long id;
    private String title;
    private String content;
    private Long userId;
    private Date createTime;
    private Date updateTime;
    private List<Long> categoryIds;
    // ✨ 新增：用来装这篇笔记所属的完整分类信息（包含分类的名称）
    private List<Category> categoryList;

}