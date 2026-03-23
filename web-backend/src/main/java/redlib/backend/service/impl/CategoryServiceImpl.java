package redlib.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import redlib.backend.dao.CategoryMapper;
import redlib.backend.model.Category;
import redlib.backend.service.CategoryService;
import redlib.backend.vo.CategoryStatVO;

import java.util.List;

/**
 * 分类业务实现类。
 *
 * 负责：
 * 1. 查询当前用户的分类列表
 * 2. 新增分类
 * 3. 删除分类
 * 4. 查询分类统计
 * 5. 更新分类
 */
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    /**
     * 分类表 Mapper。
     */
    private final CategoryMapper categoryMapper;

    /**
     * 统一规范分类名称：去掉首尾空格。
     */
    private String normalizeName(String name) {
        return name == null ? null : name.trim();
    }

    /**
     * 查询当前用户的分类列表。
     */
    @Override
    public List<Category> getCategoryList(Long userId) {
        Assert.notNull(userId, "用户ID不能为空");
        return categoryMapper.selectByUserId(userId);
    }

    /**
     * 新增分类。
     *
     * 这里补充了基础业务校验：
     * 1. 分类对象不能为空
     * 2. 用户 ID 不能为空
     * 3. 分类名不能为空
     * 4. 同一用户下分类名不能重复
     */
    @Override
    public void addCategory(Category category) {
        Assert.notNull(category, "分类信息不能为空");
        Assert.notNull(category.getUserId(), "用户ID不能为空");

        String normalizedName = normalizeName(category.getName());
        Assert.hasText(normalizedName, "分类名称不能为空");

        Category duplicated = categoryMapper.selectByUserIdAndName(category.getUserId(), normalizedName);
        Assert.isNull(duplicated, "分类名称已存在，请使用其他名称");

        category.setName(normalizedName);
        categoryMapper.insert(category);
    }

    /**
     * 删除分类。
     *
     * 删除前会先确认分类确实存在，且归属于当前用户。
     */
    @Override
    public void deleteCategory(Long id, Long userId) {
        Assert.notNull(id, "分类ID不能为空");
        Assert.notNull(userId, "用户ID不能为空");

        Category existing = categoryMapper.selectByIdAndUserId(id, userId);
        Assert.notNull(existing, "分类不存在或无权删除");

        categoryMapper.deleteByIdAndUserId(id, userId);
    }

    /**
     * 查询分类统计数据。
     */
    @Override
    public List<CategoryStatVO> getCategoryStatistics(Long userId) {
        Assert.notNull(userId, "用户ID不能为空");
        return categoryMapper.getStatisticsByUserId(userId);
    }

    /**
     * 更新分类。
     *
     * 修改前会校验：
     * 1. 分类对象、分类ID、用户ID不能为空
     * 2. 分类名称不能为空
     * 3. 当前分类必须存在
     * 4. 修改后的名称不能和当前用户其他分类重名
     */
    @Override
    public void updateCategory(Category category) {
        Assert.notNull(category, "分类信息不能为空");
        Assert.notNull(category.getId(), "分类ID不能为空");
        Assert.notNull(category.getUserId(), "用户ID不能为空");

        String normalizedName = normalizeName(category.getName());
        Assert.hasText(normalizedName, "分类名称不能为空");

        Category existing = categoryMapper.selectByIdAndUserId(category.getId(), category.getUserId());
        Assert.notNull(existing, "分类不存在或无权修改");

        Category duplicated = categoryMapper.selectByUserIdAndNameExcludeId(
                category.getUserId(),
                normalizedName,
                category.getId()
        );
        Assert.isNull(duplicated, "分类名称已存在，请使用其他名称");

        category.setName(normalizedName);
        categoryMapper.update(category);
    }
}
