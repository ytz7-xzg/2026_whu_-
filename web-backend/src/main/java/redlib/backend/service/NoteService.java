package redlib.backend.service;

import redlib.backend.model.Note;
import java.util.List;

public interface NoteService {
    // 获取用户的笔记列表
    List<Note> getNoteList(Long userId);

    // 添加笔记
    void addNote(Note note);

    // 更新笔记
    void updateNote(Note note);

    // 删除笔记
    void deleteNote(Long id, Long userId);
}