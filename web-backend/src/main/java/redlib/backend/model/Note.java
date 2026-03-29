package redlib.backend.model;

import lombok.Data;
import java.util.Date;
import java.util.List;

/**
 * 笔记实体类 (对应数据库 note 表)
 */
@Data
public class Note {

    private Long id;               // 笔记ID
    private String title;          // 标题
    private String content;        // 内容
    private Long userId;           // 所属用户
    private Date createTime;       // 创建时间
    private Date updateTime;       // 更新时间

    /**
     * 本笔记关联分类ID列表（新增记录用）
     */
    private List<Long> categoryIds;

    /**
     * 查询时转成的分类对象列表，包含名称信息
     */
    private List<Category> categoryList;
}