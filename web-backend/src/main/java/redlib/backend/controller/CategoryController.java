package redlib.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import redlib.backend.annotation.BackendModule;
import redlib.backend.annotation.Privilege;
import redlib.backend.model.Category;
import redlib.backend.model.ResponseData;
import redlib.backend.service.CategoryService;
import redlib.backend.utils.ThreadContextHolder;
import redlib.backend.vo.CategoryStatVO;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@BackendModule({"page:页面"})
@Tag(name = "分类接口")
public class CategoryController {

    // 注入分类服务，具体分类业务由 Service 层处理。
    @Autowired
    private CategoryService categoryService;

    /**
     * 构造统一成功响应。
     *
     * @param data 业务数据
     * @return 标准响应体
     */
    private <T> ResponseData<T> success(T data) {
        // 创建统一响应对象。
        ResponseData<T> response = new ResponseData<>();
        // 设置成功状态码。
        response.setCode(200);
        // 标记请求处理成功。
        response.setSuccess(true);
        // 写入业务数据。
        response.setData(data);
        // 返回响应对象。
        return response;
    }

    /**
     * 获取当前用户的分类列表。
     *
     * @return 分类列表
     */
    @GetMapping("/list")
    @Privilege
    @Operation(summary = "获取分类列表")
    public ResponseData<List<Category>> getCategoryList() {
        // 从当前令牌中取出登录用户 ID。
        Long currentUserId = ThreadContextHolder.getToken().getUserId().longValue();
        // 查询该用户的全部分类。
        List<Category> list = categoryService.getCategoryList(currentUserId);
        // 返回分类列表。
        return success(list);
    }

    /**
     * 新增分类。
     *
     * @param category 分类信息
     * @return 新增结果
     */
    @PostMapping("/add")
    @Privilege
    @Operation(summary = "新增分类")
    public ResponseData<String> addCategory(@RequestBody Category category) {
        // 将分类归属设置为当前登录用户。
        category.setUserId(ThreadContextHolder.getToken().getUserId().longValue());
        // 调用服务层完成分类新增。
        categoryService.addCategory(category);
        // 返回新增成功提示。
        return success("新增分类成功");
    }

    /**
     * 删除分类。
     *
     * @param id 分类 ID
     * @return 删除结果
     */
    @PostMapping("/delete")
    @Privilege
    @Operation(summary = "删除分类")
    public ResponseData<String> deleteCategory(@RequestParam Long id) {
        // 获取当前登录用户 ID，用于校验分类归属。
        Long currentUserId = ThreadContextHolder.getToken().getUserId().longValue();
        // 只删除属于当前用户的分类。
        categoryService.deleteCategory(id, currentUserId);
        // 返回删除成功提示。
        return success("删除分类成功");
    }

    /**
     * 获取分类统计信息。
     *
     * @return 分类统计结果
     */
    @GetMapping("/statistics")
    @Privilege
    @Operation(summary = "分类统计")
    public ResponseData<List<CategoryStatVO>> getCategoryStatistics() {
        // 获取当前登录用户 ID。
        Long currentUserId = ThreadContextHolder.getToken().getUserId().longValue();
        // 查询该用户的分类统计数据。
        List<CategoryStatVO> statList = categoryService.getCategoryStatistics(currentUserId);
        // 返回统计结果。
        return success(statList);
    }

    /**
     * 修改分类。
     *
     * @param category 分类信息
     * @return 修改结果
     */
    @PostMapping("/update")
    @Privilege
    @Operation(summary = "修改分类")
    public ResponseData<String> updateCategory(@RequestBody Category category) {
        // 补充当前登录用户 ID，保证只能修改自己的分类。
        category.setUserId(ThreadContextHolder.getToken().getUserId().longValue());
        // 调用服务层执行分类更新。
        categoryService.updateCategory(category);
        // 返回修改成功提示。
        return success("修改分类成功");
    }
}
