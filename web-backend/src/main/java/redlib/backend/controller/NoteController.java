package redlib.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import redlib.backend.annotation.BackendModule;
import redlib.backend.annotation.Privilege;
import redlib.backend.model.Note;
import redlib.backend.model.ResponseData;
import redlib.backend.service.NoteService;
import redlib.backend.utils.ThreadContextHolder;

import java.util.List;

/**
 * 笔记管理 Controller
 *
 * 职责：处理当前登录用户的笔记相关 HTTP 请求
 * - 查询笔记列表
 * - 新增笔记
 * - 修改笔记
 * - 删除笔记
 */
@RestController
@RequestMapping("/api/note")
@RequiredArgsConstructor
@BackendModule({"page:页面"})
@Tag(name = "笔记管理接口")
public class NoteController {

    // 注入笔记业务服务，具体增删改查逻辑交给 Service 层处理。
    private final NoteService noteService;

    private <T> ResponseData<T> success(T data) {
        ResponseData<T> response = new ResponseData<>(); // 创建统一响应对象。
        response.setCode(200); // 设置成功状态码。
        response.setSuccess(true); // 标记本次请求处理成功。
        response.setData(data); // 将业务数据放入响应体中。
        return response; // 返回统一格式的响应结果。
    }

    @GetMapping("/list")
    @Privilege
    @Operation(summary = "获取当前用户的笔记列表")
    public ResponseData<List<Note>> getNoteList() {
        Long currentUserId = ThreadContextHolder.getToken().getUserId().longValue(); // 从当前登录令牌中取出用户 ID，只查询自己的笔记。
        List<Note> list = noteService.getNoteList(currentUserId); // 调用业务层查询当前用户的笔记列表。
        return success(list); // 把查询结果按统一结构返回给前端。
    }


    @PostMapping("/add")
    @Privilege
    @Operation(summary = "创建新笔记")
    public ResponseData<String> addNote(@RequestBody Note note) {
        note.setUserId(ThreadContextHolder.getToken().getUserId().longValue()); // 把新笔记归属到当前登录用户
        noteService.addNote(note); // 调用业务层执行笔记新增。
        return success("笔记创建成功"); // 返回创建成功提示。
    }

    @PostMapping("/update")
    @Privilege
    @Operation(summary = "编辑修改笔记")
    public ResponseData<String> updateNote(@RequestBody Note note) {
        note.setUserId(ThreadContextHolder.getToken().getUserId().longValue()); // 补上当前用户 ID，更新时用于校验这篇笔记是否属于本人。
        noteService.updateNote(note); // 调用业务层执行笔记更新。
        return success("笔记更新成功"); // 返回更新成功提示。
    }

    @PostMapping("/delete")
    @Privilege
    @Operation(summary = "删除笔记")
    public ResponseData<String> deleteNote(@RequestParam Long id) {
        Long currentUserId = ThreadContextHolder.getToken().getUserId().longValue(); // 获取当前用户 ID，删除时要校验笔记归属。
        noteService.deleteNote(id, currentUserId); // 按“笔记 ID + 当前用户 ID”删除，避免误删他人数据。
        return success("笔记删除成功"); // 返回删除成功提示。
    }
}
