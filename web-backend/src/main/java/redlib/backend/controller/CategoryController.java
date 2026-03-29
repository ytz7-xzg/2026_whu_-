package redlib.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import redlib.backend.annotation.BackendModule;
import redlib.backend.annotation.Privilege;
import redlib.backend.model.Category;
import redlib.backend.model.ResponseData;
import redlib.backend.service.CategoryService;
import redlib.backend.utils.ThreadContextHolder;
import redlib.backend.vo.CategoryStatVO;

import java.util.List;

/**
 * 分类管理 Controller
 *
 * 职责：处理笔记分类相关的 HTTP 请求
 * - 获取用户分类列表
 * - 新增分类
 * - 编辑分类
 * - 删除分类
 * - 分类统计（每个分类下有多少篇笔记）
 */
@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
@BackendModule({"page:页面"})
@Tag(name = "分类管理接口")
public class CategoryController {

    // 注入分类业务服务，Controller 只负责接收请求和组织返回结果。
    private final CategoryService categoryService;

    /**
     * 通用成功响应封装
     *
     * @param data 业务数据
     * @return 标准响应格式
     */
    private <T> ResponseData<T> success(T data) {
        ResponseData<T> response = new ResponseData<>(); // 创建统一的响应对象。
        response.setCode(200); // 标记本次请求处理成功。
        response.setSuccess(true); // 明确告诉前端这是成功响应。
        response.setData(data); // 把本次业务结果放进响应体。
        return response; // 返回统一格式的数据给前端。
    }

    /**
     * 获取当前登录用户的分类列表
     *
     * @return 用户所有分类
     */
    @GetMapping("/list")
    @Privilege
    @Operation(summary = "获取当前用户的分类列表")
    public ResponseData<List<Category>> getCategoryList() {
        Long currentUserId = ThreadContextHolder.getToken().getUserId().longValue(); // 从当前登录令牌中取出用户 ID，确保只查自己的数据。

        List<Category> list = categoryService.getCategoryList(currentUserId); // 调用业务层查询当前用户名下的分类列表。
        return success(list); // 把分类列表按统一响应格式返回给前端。
    }

    /**
     * 添加新分类
     *
     * @param category 分类对象（仅需提供 name 字段）
     * @return 成功提示
     */
    @PostMapping("/add")
    @Privilege
    @Operation(summary = "添加新分类")
    public ResponseData<String> addCategory(@RequestBody Category category) {
        category.setUserId(ThreadContextHolder.getToken().getUserId().longValue()); // 把分类归属到当前登录用户。
        categoryService.addCategory(category); // 调用业务层完成分类新增和相关校验。
        return success("添加成功"); // 返回新增成功提示。
    }

    /**
     * 删除指定分类
     *
     * @param id 分类 ID
     * @return 成功提示
     */
    @PostMapping("/delete")
    @Privilege
    @Operation(summary = "删除分类")
    public ResponseData<String> deleteCategory(@RequestParam Long id) {
        Long currentUserId = ThreadContextHolder.getToken().getUserId().longValue(); // 取当前用户 ID，后续删除时要校验分类归属。
        categoryService.deleteCategory(id, currentUserId); // 按“分类 ID + 当前用户 ID”删除，避免删到别人的分类。
        return success("删除成功"); // 返回删除成功提示。
    }

    /**
     * 获取分类统计数据
     *
     * 返回每个分类下的笔记总数，用于前端展示分类及其关联笔记数
     *
     * @return 分类统计 VO 列表
     */
    @GetMapping("/statistics")
    @Privilege
    @Operation(summary = "按分类统计笔记数量")
    public ResponseData<List<CategoryStatVO>> getCategoryStatistics() {
        Long currentUserId = ThreadContextHolder.getToken().getUserId().longValue(); // 先确定当前统计的是哪一个用户的数据范围。
        List<CategoryStatVO> statList = categoryService.getCategoryStatistics(currentUserId); // 查询每个分类下对应的笔记数量统计。
        return success(statList); // 把统计结果封装后返回前端。
    }

    /**
     * 编辑分类名称
     *
     * @param category 分类对象（需提供 id 和 name）
     * @return 成功提示
     */
    @PostMapping("/update")
    @Privilege
    @Operation(summary = "修改分类名称")
    public ResponseData<String> updateCategory(@RequestBody Category category) {
        category.setUserId(ThreadContextHolder.getToken().getUserId().longValue()); // 补上当前用户 ID，更新时用于校验这条分类是否属于本人。
        categoryService.updateCategory(category); // 调用业务层执行分类名称修改。
        return success("修改成功"); // 返回修改成功提示。
    }
}
