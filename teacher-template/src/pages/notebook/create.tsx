import { createCategory, createNote, listCategories } from '@/services/api/notebook';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import {
  PageContainer,
  ProForm,
  type ProFormInstance,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Card, Form, Input, Modal, Space, Typography, message } from 'antd';
import { useEffect, useRef, useState } from 'react';

type NoteFormValue = {
  title: string;
  content: string;
  categories: API.ID[];
};

const NotebookCreatePage: React.FC = () => {
  const formRef = useRef<ProFormInstance<NoteFormValue>>();
  const [categoryForm] = Form.useForm<{ name: string }>();
  const [categories, setCategories] = useState<API.Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);

  const refreshCategories = async () => {
    const result = await listCategories();
    const safeResult = result || [];
    setCategories(safeResult);
    return safeResult;
  };

  useEffect(() => {
    void refreshCategories();
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

  const openCategoryModal = () => {
    categoryForm.resetFields();
    setCategoryModalOpen(true);
  };

  const handleCreateCategory = async () => {
    try {
      const values = await categoryForm.validateFields();
      const name = values.name.trim();

      setCreatingCategory(true);
      const created = await createCategory({ name });
      if (!created) {
        message.error('新建分类失败');
        return;
      }

      const nextCategories = await refreshCategories();
      const createdCategory = nextCategories.find((item) => item.name.trim() === name);
      const selectedCategories = (formRef.current?.getFieldValue('categories') as API.ID[] | undefined) || [];
      if (
        createdCategory &&
        !selectedCategories.some((item) => String(item) === String(createdCategory.id))
      ) {
        formRef.current?.setFieldValue('categories', [...selectedCategories, createdCategory.id]);
      }

      message.success('分类已创建');
      setCategoryModalOpen(false);
      categoryForm.resetFields();
    } catch {
      return;
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <PageContainer title={false}>
      <style>
        {`
          .notebook-note-editor-page {
            max-width: 1040px;
            margin: 0 auto;
            padding: 8px 0 28px;
          }
          .notebook-note-editor-header {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            align-items: flex-start;
            margin-bottom: 18px;
          }
          .notebook-note-editor-main-card {
            border-radius: 22px !important;
            border: 1px solid #edf2fb !important;
            box-shadow: 0 12px 36px rgba(15, 32, 68, 0.08);
            transition: box-shadow 0.25s ease, transform 0.25s ease;
          }
          .notebook-note-editor-main-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 16px 40px rgba(15, 32, 68, 0.1);
          }
          .notebook-note-editor-main-card .ant-card-body {
            padding: 28px;
          }
          .notebook-note-editor-main-card .ant-form-item {
            margin-bottom: 0;
          }
          .notebook-note-editor-main-card .ant-input,
          .notebook-note-editor-main-card .ant-select-selector {
            border-radius: 12px !important;
            transition: all 0.2s ease !important;
          }
          .notebook-note-editor-main-card .ant-input:hover,
          .notebook-note-editor-main-card .ant-select-selector:hover {
            border-color: #89a7f9 !important;
          }
          .notebook-note-editor-main-card .ant-input:focus,
          .notebook-note-editor-main-card .ant-input-focused,
          .notebook-note-editor-main-card .ant-select-focused .ant-select-selector {
            border-color: #6d8ef5 !important;
            box-shadow: 0 0 0 3px rgba(109, 142, 245, 0.16) !important;
          }
          .notebook-note-editor-main-card .ant-btn {
            border-radius: 12px;
          }
          .notebook-note-editor-main-card .ant-select-selection-item {
            border-radius: 999px !important;
            background: #eef3ff !important;
            border: 1px solid #d6e2ff !important;
            color: #244189 !important;
          }
          .notebook-note-editor-add-category {
            height: 40px;
            padding: 0 14px;
            border-color: #c7d6ff !important;
            color: #2f58c9 !important;
            background: #f7faff !important;
            transition: all 0.2s ease !important;
          }
          .notebook-note-editor-add-category:hover,
          .notebook-note-editor-add-category:focus {
            border-color: #89a7f9 !important;
            color: #244189 !important;
            background: #eff5ff !important;
          }
          @media (max-width: 768px) {
            .notebook-note-editor-page {
              padding-top: 0;
            }
            .notebook-note-editor-header {
              flex-direction: column;
              align-items: stretch;
            }
            .notebook-note-editor-main-card .ant-card-body {
              padding: 18px;
            }
            .notebook-note-editor-category-head {
              flex-direction: column;
              align-items: stretch !important;
            }
          }
        `}
      </style>

      <div className="notebook-note-editor-page">
        <div className="notebook-note-editor-header">
          <div>
            <Typography.Title level={2} style={{ margin: 0, marginBottom: 6 }}>
              新建笔记
            </Typography.Title>
            <Typography.Text type="secondary">
              在这里记录新内容，保存后即可在笔记列表中查看。
            </Typography.Text>
          </div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => history.push('/notebook/index')}
            style={{ borderRadius: 12 }}
          >
            返回列表
          </Button>
        </div>

        <Card className="notebook-note-editor-main-card">
          <ProForm<NoteFormValue>
            formRef={formRef}
            layout="vertical"
            submitter={{
              searchConfig: { submitText: '创建笔记', resetText: '重置' },
              submitButtonProps: {
                loading: submitting,
                size: 'large',
                style: { minWidth: 120, height: 44 },
              },
              resetButtonProps: {
                size: 'large',
                style: { minWidth: 96, height: 44 },
              },
              render: (_, dom) => (
                <div
                  style={{
                    marginTop: 28,
                    paddingTop: 24,
                    borderTop: '1px solid #eef2fb',
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Space size={12}>{dom}</Space>
                </div>
              ),
            }}
            initialValues={{ categories: [] }}
            onFinish={handleSubmit}
          >
            <section style={{ marginBottom: 24 }}>
              <Typography.Title level={5} style={{ margin: 0, marginBottom: 4, color: '#1f2b4d' }}>
                标题
              </Typography.Title>
              <Typography.Text type="secondary">给这条笔记一个清晰、好搜索的名称。</Typography.Text>
              <div style={{ marginTop: 10 }}>
                <ProFormText
                  name="title"
                  label={false}
                  placeholder="请输入笔记标题"
                  rules={[{ required: true, message: '请输入标题' }]}
                  fieldProps={{
                    size: 'large',
                    style: {
                      height: 50,
                      fontSize: 16,
                      paddingInline: 14,
                    },
                  }}
                />
              </div>
            </section>

            <section
              style={{
                marginBottom: 26,
                background: 'linear-gradient(180deg, #f8fbff 0%, #f4f8ff 100%)',
                border: '1px solid #e6eeff',
                borderRadius: 16,
                padding: 16,
              }}
            >
              <div
                className="notebook-note-editor-category-head"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div>
                  <Typography.Title level={5} style={{ margin: 0, marginBottom: 4, color: '#1f2b4d' }}>
                    分类
                  </Typography.Title>
                  <Typography.Text type="secondary">可多选，用于整理笔记主题和后续筛选。</Typography.Text>
                </div>
                <Button
                  icon={<PlusOutlined />}
                  className="notebook-note-editor-add-category"
                  onClick={openCategoryModal}
                >
                  新建分类
                </Button>
              </div>
              <ProFormSelect
                name="categories"
                label={false}
                mode="multiple"
                placeholder="请选择分类"
                options={categories.map((item) => ({ label: item.name, value: item.id }))}
                fieldProps={{
                  size: 'large',
                  style: { width: '100%' },
                }}
              />
            </section>

            <section>
              <Typography.Title level={5} style={{ margin: 0, marginBottom: 4, color: '#1f2b4d' }}>
                内容
              </Typography.Title>
              <Typography.Text type="secondary">在这里编辑正文，建议分段书写以提升可读性。</Typography.Text>
              <div style={{ marginTop: 10 }}>
                <ProFormTextArea
                  name="content"
                  label={false}
                  placeholder="请输入笔记内容"
                  fieldProps={{
                    rows: 12,
                    style: {
                      fontSize: 15,
                      lineHeight: 1.75,
                      padding: 14,
                      minHeight: 320,
                    },
                  }}
                  rules={[{ required: true, message: '请输入内容' }]}
                />
              </div>
            </section>
          </ProForm>
        </Card>
      </div>

      <Modal
        title="新建分类"
        open={categoryModalOpen}
        onOk={() => void handleCreateCategory()}
        onCancel={() => setCategoryModalOpen(false)}
        okText="创建"
        cancelText="取消"
        confirmLoading={creatingCategory}
        destroyOnClose
      >
        <Form form={categoryForm} layout="vertical">
          <Form.Item
            name="name"
            label="分类名称"
            validateTrigger={['onBlur', 'onSubmit']}
            rules={[
              { required: true, message: '请输入分类名称' },
              { max: 20, message: '分类名称不能超过20个字符' },
              {
                validator: (_, value: string) => {
                  if (!value || !value.trim()) {
                    return Promise.resolve();
                  }
                  const duplicate = categories.some(
                    (item) => item.name.trim().toLowerCase() === value.trim().toLowerCase(),
                  );
                  return duplicate ? Promise.reject(new Error('分类已存在')) : Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="例如：学习笔记" maxLength={20} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default NotebookCreatePage;
