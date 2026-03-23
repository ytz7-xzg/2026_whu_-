package redlib.backend.vo; // 保留你的包名

import lombok.Data;

/**
 * 专门用于返回分类统计数据的视图对象
 */
@Data
public class CategoryStatVO {
    private Long categoryId;     // 分类ID
    private String categoryName; // 分类名称
    private Integer noteCount;   // ⚡️ 这个分类下有多少篇笔记
}