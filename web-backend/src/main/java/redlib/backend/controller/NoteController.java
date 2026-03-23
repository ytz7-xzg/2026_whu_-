package redlib.backend.controller; //

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import redlib.backend.annotation.BackendModule; // ✨
import redlib.backend.annotation.Privilege;     // ✨
import redlib.backend.model.Note;
import redlib.backend.model.ResponseData;
import redlib.backend.service.NoteService;
import redlib.backend.utils.ThreadContextHolder;

import java.util.List;

@RestController
@RequestMapping("/api/note")
@RequiredArgsConstructor
@BackendModule({"page:页面"})
@Tag(name = "笔记管理接口")
public class NoteController {

    private final NoteService noteService;

    private <T> ResponseData<T> success(T data) {
        ResponseData<T> response = new ResponseData<>();
        response.setCode(200);
        response.setSuccess(true);
        response.setData(data);
        return response;
    }

    @GetMapping("/list")
    @Privilege
    @Operation(summary = "获取当前用户的笔记列表")
    public ResponseData<List<Note>> getNoteList() {
        Long currentUserId = ThreadContextHolder.getToken().getUserId().longValue();
        List<Note> list = noteService.getNoteList(currentUserId);//获取笔记列表
        return success(list);
    }

    @PostMapping("/add")
    @Privilege
    @Operation(summary = "创建新笔记")
    public ResponseData<String> addNote(@RequestBody Note note) {
        note.setUserId(ThreadContextHolder.getToken().getUserId().longValue());
        noteService.addNote(note);//添加笔记
        return success("笔记创建成功");
    }

    @PostMapping("/update")
    @Privilege
    @Operation(summary = "编辑修改笔记")
    public ResponseData<String> updateNote(@RequestBody Note note) {
        note.setUserId(ThreadContextHolder.getToken().getUserId().longValue());
        noteService.updateNote(note);//更新（修改）笔记
        return success("笔记更新成功");
    }

    @PostMapping("/delete")
    @Privilege
    @Operation(summary = "删除笔记")
    public ResponseData<String> deleteNote(@RequestParam Long id) {
        Long currentUserId = ThreadContextHolder.getToken().getUserId().longValue();
        noteService.deleteNote(id, currentUserId);//删除笔记
        return success("笔记删除成功");
    }
}