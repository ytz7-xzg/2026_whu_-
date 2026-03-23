import { createNote, listCategories } from '@/services/api/notebook';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  PageContainer,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, message } from 'antd';
import { useEffect, useState } from 'react';

type NoteFormValue = {
  title: string;
  content: string;
  categories: API.ID[];
};

const NotebookCreatePage: React.FC = () => {
  const [categories, setCategories] = useState<API.Category[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listCategories().then((result) => setCategories(result || []));
  }, []);

  const handleSubmit = async (values: NoteFormValue) => {
    setSubmitting(true);
    try {
      const created = await createNote({
        title: values.title,
        content: values.content,
        categories: values.categories || [],
      });
      if (!created) {
        message.error('创建失败');
        return false;
      }
      message.success('创建成功');
      history.push('/notebook/index');
      return true;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="新建笔记"
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
          searchConfig: { submitText: '创建笔记', resetText: '重置' },
          submitButtonProps: { loading: submitting },
        }}
        initialValues={{ categories: [] }}
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

export default NotebookCreatePage;
