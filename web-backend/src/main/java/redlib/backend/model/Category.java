package redlib.backend.model;

import lombok.Data;
import java.util.Date;

/**
 * 分类实体类 (对应数据库的 category 表)
 */
@Data // 这就是你图片里提到的神器！有了它，你就不需要手写 get/set 方法了，Lombok 会在后台自动帮你生成
public class Category {

    private Long id;           // 对应表里的 bigint
    private String name;       // 对应表里的 varchar
    private Long userId;       // 创建该分类的用户ID
    private Date createTime;   // 创建时间
    private Date updateTime;   // 更新时间

}