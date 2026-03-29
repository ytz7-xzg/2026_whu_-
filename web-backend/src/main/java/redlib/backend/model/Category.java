package redlib.backend.model;

import lombok.Data;
import java.util.Date;

/**
 * 分类实体类 (对应数据库 category 表)
 */
@Data
public class Category {

    /**
     * 分类主键ID
     */
    private Long id;

    /**
     * 分类名称
     */
    private String name;

    /**
     * 归属用户ID
     */
    private Long userId;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 最后更新时间
     */
    private Date updateTime;
}