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
import redlib.backend.model.Note;
import redlib.backend.model.ResponseData;
import redlib.backend.service.NoteService;
import redlib.backend.utils.ThreadContextHolder;

import java.util.List;

@RestController
@RequestMapping("/api/note")
@BackendModule({"page:页面"})
@Tag(name = "笔记接口")
public class NoteController {

    // 注入笔记服务，负责具体的笔记业务处理。
    @Autowired
    private NoteService noteService;

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
        // 标记本次请求成功。
        response.setSuccess(true);
        // 写入要返回的数据。
        response.setData(data);
        // 返回响应对象。
        return response;
    }

    /**
     * 获取当前用户的笔记列表。
     *
     * @return 笔记列表
     */
    @GetMapping("/list")
    @Privilege
    @Operation(summary = "获取笔记列表")
    public ResponseData<List<Note>> getNoteList() {
        // 从当前令牌中获取用户 ID。
        Long currentUserId = ThreadContextHolder.getToken().getUserId().longValue();
        // 查询该用户的笔记列表。
        List<Note> list = noteService.getNoteList(currentUserId);
        // 返回查询结果。
        return success(list);
    }

    /**
     * 新增笔记。
     *
     * @param note 笔记信息
     * @return 新增结果
     */
    @PostMapping("/add")
    @Privilege
    @Operation(summary = "新增笔记")
    public ResponseData<String> addNote(@RequestBody Note note) {
        // 将笔记归属到当前登录用户。
        note.setUserId(ThreadContextHolder.getToken().getUserId().longValue());
        // 调用服务层完成笔记新增。
        noteService.addNote(note);
        // 返回新增成功提示。
        return success("新增笔记成功");
    }

    /**
     * 修改笔记。
     *
     * @param note 笔记信息
     * @return 修改结果
     */
    @PostMapping("/update")
    @Privilege
    @Operation(summary = "修改笔记")
    public ResponseData<String> updateNote(@RequestBody Note note) {
        // 补充当前登录用户 ID，避免修改到他人数据。
        note.setUserId(ThreadContextHolder.getToken().getUserId().longValue());
        // 调用服务层执行笔记更新。
        noteService.updateNote(note);
        // 返回修改成功提示。
        return success("修改笔记成功");
    }

    /**
     * 删除笔记。
     *
     * @param id 笔记 ID
     * @return 删除结果
     */
    @PostMapping("/delete")
    @Privilege
    @Operation(summary = "删除笔记")
    public ResponseData<String> deleteNote(@RequestParam Long id) {
        // 获取当前登录用户 ID，用于删除时做归属校验。
        Long currentUserId = ThreadContextHolder.getToken().getUserId().longValue();
        // 只删除当前用户自己的笔记。
        noteService.deleteNote(id, currentUserId);
        // 返回删除成功提示。
        return success("删除笔记成功");
    }
}
