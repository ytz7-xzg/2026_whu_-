package redlib.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;
import org.springframework.util.CollectionUtils;
import redlib.backend.dao.NoteCategoryRelationMapper;
import redlib.backend.dao.NoteMapper;
import redlib.backend.model.Category;
import redlib.backend.model.Note;
import redlib.backend.service.NoteService;

import java.util.List;

/**
 * 笔记业务实现类。
 *
 * 负责：
 * 1. 查询用户的笔记列表
 * 2. 创建笔记
 * 3. 更新笔记
 * 4. 删除笔记
 *
 * 由于笔记和分类是多对多关系，
 * 所以除了操作 note 主表，还要维护 note_category_relation 关系表。
 */
@Service
@RequiredArgsConstructor
public class NoteServiceImpl implements NoteService {

    /**
     * 笔记主表 Mapper。
     */
    private final NoteMapper noteMapper;

    /**
     * 笔记与分类关系表 Mapper。
     */
    private final NoteCategoryRelationMapper relationMapper;

    /**
     * 统一规范标题：去掉首尾空格。
     */
    private String normalizeTitle(String title) {
        return title == null ? null : title.trim();
    }

    /**
     * 笔记入参校验。
     *
     * @param note      笔记对象
     * @param requireId 是否要求必须传入笔记ID
     */
    private void validateNotePayload(Note note, boolean requireId) {
        Assert.notNull(note, "笔记信息不能为空");
        if (requireId) {
            Assert.notNull(note.getId(), "笔记ID不能为空");
        }
        Assert.notNull(note.getUserId(), "用户ID不能为空");

        String normalizedTitle = normalizeTitle(note.getTitle());
        Assert.hasText(normalizedTitle, "笔记标题不能为空");
        note.setTitle(normalizedTitle);

//        // 正文允许为空，但不允许是 null，避免后续持久化和前端展示时出问题
//        if (note.getContent() == null) {
//            note.setContent("");
//        }
    }

    /**
     * 查询当前用户的笔记列表。
     *
     * 查询步骤：
     * 1. 先查 note 主表，拿到该用户的全部笔记
     * 2. 再为每条笔记补充分类 ID 列表和分类对象列表
     */
    @Override
    public List<Note> getNoteList(Long userId) {
        Assert.notNull(userId, "用户ID不能为空");

        List<Note> noteList = noteMapper.selectByUserId(userId);
        for (Note note : noteList) {
            List<Long> categoryIds = relationMapper.selectCategoryIdsByNoteId(note.getId());
            note.setCategoryIds(categoryIds);

            List<Category> categories = relationMapper.selectCategoriesByNoteId(note.getId());
            note.setCategoryList(categories);
        }
        return noteList;
    }

    /**
     * 新增笔记。
     *
     * 为什么需要事务：
     * - 新增时不仅要写 note 主表
     * - 还可能同时写 note_category_relation 关系表
     * - 必须保证要么全部成功，要么全部回滚
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addNote(Note note) {
        validateNotePayload(note, false);

        // 先写入笔记主表
        noteMapper.insert(note);

        // 如果前端传了分类ID，则同时写入关系表
        if (!CollectionUtils.isEmpty(note.getCategoryIds())) {
            for (Long categoryId : note.getCategoryIds()) {
                relationMapper.insert(note.getId(), categoryId);
            }
        }
    }

    /**
     * 更新笔记。
     *
     * 逻辑：
     * 1. 先更新 note 主表内容
     * 2. 如果前端明确传了 categoryIds，则认为要同步更新分类关系
     * 3. 先删除旧关系，再按最新分类重新建立关系
     *
     * 特别说明：
     * - categoryIds == null：表示这次只改内容，不动分类
     * - categoryIds == []：表示明确要清空所有分类
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateNote(Note note) {
        validateNotePayload(note, true);

        // 先更新笔记主表
        noteMapper.update(note);

        // 只有前端明确传了分类列表，才重建分类关系
        if (note.getCategoryIds() != null) {
            relationMapper.deleteByNoteId(note.getId());

            if (!CollectionUtils.isEmpty(note.getCategoryIds())) {
                for (Long categoryId : note.getCategoryIds()) {
                    relationMapper.insert(note.getId(), categoryId);
                }
            }
        }
    }

    /**
     * 删除笔记。
     *
     * 删除顺序：
     * 1. 先删笔记与分类的关系
     * 2. 再删笔记主表
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteNote(Long id, Long userId) {
        Assert.notNull(id, "笔记ID不能为空");
        Assert.notNull(userId, "用户ID不能为空");

        relationMapper.deleteByNoteId(id);
        noteMapper.deleteByIdAndUserId(id, userId);
    }
}
