package redlib.backend.service;

import redlib.backend.model.Category;
import redlib.backend.vo.CategoryStatVO;

import java.util.List;

public interface CategoryService {
    // 获取用户的分类列表
    List<Category> getCategoryList(Long userId);

    // 添加分类
    void addCategory(Category category);

    // 删除分类
    void deleteCategory(Long id, Long userId);

    // 获取分类统计数据
    List<CategoryStatVO> getCategoryStatistics(Long userId);

    // 修改分类
    void updateCategory(Category category);
}