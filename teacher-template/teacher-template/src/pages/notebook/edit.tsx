import { getNoteDetail, listCategories, updateNote } from '@/services/api/notebook';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  PageContainer,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import { Button, Result, Spin, message } from 'antd';
import { useEffect, useState } from 'react';

type NoteFormValue = {
  title: string;
  content: string;
  categories: API.ID[];
};

const NotebookEditPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const noteId = params.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<API.Category[]>([]);
  const [initialValues, setInitialValues] = useState<NoteFormValue | undefined>(undefined);

  useEffect(() => {
    const loadData = async () => {
      if (!noteId) {
        setLoading(false);
        return;
      }
      const [categoryResult, noteDetail] = await Promise.all([
        listCategories(),
        getNoteDetail(noteId),
      ]);
      setCategories(categoryResult || []);
      if (noteDetail) {
        setInitialValues({
          title: noteDetail.title,
          content: noteDetail.content,
          categories: noteDetail.categories || [],
        });
      }
      setLoading(false);
    };
    void loadData();
  }, [noteId]);

  const handleSubmit = async (values: NoteFormValue) => {
    if (!noteId) return false;
    setSubmitting(true);
    try {
      const updated = await updateNote({
        id: noteId,
        title: values.title,
        content: values.content,
        categories: values.categories || [],
      });
      if (!updated) {
        message.error('更新失败');
        return false;
      }
      message.success('更新成功');
      history.push('/notebook/index');
      return true;
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer title="编辑笔记">
        <Spin />
      </PageContainer>
    );
  }

  if (!initialValues) {
    return (
      <PageContainer title="编辑笔记">
        <Result
          status="404"
          title="未找到该笔记"
          subTitle="该笔记可能已删除或不存在。"
          extra={
            <Button type="primary" onClick={() => history.push('/notebook/index')}>
              返回列表
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="编辑笔记"
      extra={[
        <Button
          key="back"
          icon={<ArrowLeftOutlined />}
          onClick={() => history.push('/notebook/index')}
        >
          返回列表
        </Button>,
      ]}
    >
      <ProForm<NoteFormValue>
        layout="vertical"
        submitter={{
          searchConfig: { submitText: '保存修改', resetText: '重置' },
          submitButtonProps: { loading: submitting },
        }}
        initialValues={initialValues}
        onFinish={handleSubmit}
      >
        <ProFormText
          name="title"
          label="标题"
          placeholder="请输入笔记标题"
          rules={[{ required: true, message: '请输入标题' }]}
        />
        <ProFormSelect
          name="categories"
          label="分类"
          mode="multiple"
          placeholder="请选择分类"
          options={categories.map((item) => ({ label: item.name, value: item.id }))}
        />
        <ProFormTextArea
          name="content"
          label="内容"
          placeholder="请输入笔记内容"
          fieldProps={{ rows: 10 }}
          rules={[{ required: true, message: '请输入内容' }]}
        />
      </ProForm>
    </PageContainer>
  );
};

export default NotebookEditPage;
