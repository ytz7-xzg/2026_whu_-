package redlib.backend.controller; //

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

@RestController //把方法的返回值全部以json格式返回前端
@RequestMapping("/api/category")
@RequiredArgsConstructor
@BackendModule({"page:页面"}) // 合法页面
@Tag(name = "分类管理接口")
public class CategoryController {

    private final CategoryService categoryService; //配合@RequiredArgsConstructor，自动把 categoryService 实例化塞进来

    private <T> ResponseData<T> success(T data) {
        //success方法:把传入形参data传到data属性里面，类似{
        //  "code": 200,
        //  "success": true,
        //  "data":前端传入的data
        //}
        ResponseData<T> response = new ResponseData<>();
        response.setCode(200);
        response.setSuccess(true);
        response.setData(data);
        return response;
    }

    @GetMapping("/list")
    @Privilege // ✨ 核心修复：加上登录权限校验（不写具体权限，就是只验证是否登录）
    @Operation(summary = "获取当前用户的分类列表")
    public ResponseData<List<Category>> getCategoryList() {
        Long currentUserId = ThreadContextHolder.getToken().getUserId().longValue();//获取user_id，相当于给下一步获取权限
        List<Category> list = categoryService.getCategoryList(currentUserId);//用user_id查询分类
        return success(list);
    }

    @PostMapping("/add")
    @Privilege // ✨
    @Operation(summary = "添加新分类")
    public ResponseData<String> addCategory(@RequestBody Category category) {
        category.setUserId(ThreadContextHolder.getToken().getUserId().longValue());
        categoryService.addCategory(category);//添加分类
        return success("添加成功");
    }

    @PostMapping("/delete")
    @Privilege // ✨
    @Operation(summary = "删除分类")
    public ResponseData<String> deleteCategory(@RequestParam Long id) {
        Long currentUserId = ThreadContextHolder.getToken().getUserId().longValue();
        categoryService.deleteCategory(id, currentUserId);//删除分类
        return success("删除成功");
    }

    @GetMapping("/statistics")
    @Privilege // ✨
    @Operation(summary = "按分类统计笔记数量")
    public ResponseData<List<CategoryStatVO>> getCategoryStatistics() {
        Long currentUserId = ThreadContextHolder.getToken().getUserId().longValue();
        List<CategoryStatVO> statList = categoryService.getCategoryStatistics(currentUserId);//获取统计数量
        return success(statList);
    }

    @PostMapping("/update")
    @Privilege // ✨
    @Operation(summary = "修改分类名称")
    public ResponseData<String> updateCategory(@RequestBody Category category) {
        category.setUserId(ThreadContextHolder.getToken().getUserId().longValue());
        categoryService.updateCategory(category);//修改分类
        return success("修改成功");
    }
}