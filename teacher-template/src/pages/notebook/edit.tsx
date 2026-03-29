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
import { Button, Card, Result, Space, Spin, Typography, message } from 'antd';
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
      setLoading(true);
      setInitialValues(undefined);

      if (!noteId) {
        setLoading(false);
        return;
      }

      const [categoryResult, noteDetail] = await Promise.all([listCategories(), getNoteDetail(noteId)]);
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
      history.push('/notebook/notes');
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
            <Button type="primary" onClick={() => history.push('/notebook/notes')}>
              返回列表
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer title={false}>
      <style>
        {`
          .notebook-edit-page {
            max-width: 1040px;
            margin: 0 auto;
            padding: 8px 0 28px;
          }
          .notebook-edit-header {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            align-items: flex-start;
            margin-bottom: 18px;
          }
          .notebook-edit-main-card {
            border-radius: 22px !important;
            border: 1px solid #edf2fb !important;
            box-shadow: 0 12px 36px rgba(15, 32, 68, 0.08);
            transition: box-shadow 0.25s ease, transform 0.25s ease;
          }
          .notebook-edit-main-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 16px 40px rgba(15, 32, 68, 0.1);
          }
          .notebook-edit-main-card .ant-card-body {
            padding: 28px;
          }
          .notebook-edit-main-card .ant-form-item {
            margin-bottom: 0;
          }
          .notebook-edit-main-card .ant-input,
          .notebook-edit-main-card .ant-select-selector {
            border-radius: 12px !important;
            transition: all 0.2s ease !important;
          }
          .notebook-edit-main-card .ant-input:hover,
          .notebook-edit-main-card .ant-select-selector:hover {
            border-color: #89a7f9 !important;
          }
          .notebook-edit-main-card .ant-input:focus,
          .notebook-edit-main-card .ant-input-focused,
          .notebook-edit-main-card .ant-select-focused .ant-select-selector {
            border-color: #6d8ef5 !important;
            box-shadow: 0 0 0 3px rgba(109, 142, 245, 0.16) !important;
          }
          .notebook-edit-main-card .ant-btn {
            border-radius: 12px;
          }
          .notebook-edit-main-card .ant-select-selection-item {
            border-radius: 999px !important;
            background: #eef3ff !important;
            border: 1px solid #d6e2ff !important;
            color: #244189 !important;
          }
          @media (max-width: 768px) {
            .notebook-edit-page {
              padding-top: 0;
            }
            .notebook-edit-header {
              flex-direction: column;
              align-items: stretch;
            }
            .notebook-edit-main-card .ant-card-body {
              padding: 18px;
            }
          }
        `}
      </style>

      <div className="notebook-edit-page">
        <div className="notebook-edit-header">
          <div>
            <Typography.Title level={2} style={{ margin: 0, marginBottom: 6 }}>
              编辑笔记
            </Typography.Title>
            <Typography.Text type="secondary">
              正在修改已有内容，保存后将覆盖原笔记信息。
            </Typography.Text>
          </div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => history.push('/notebook/notes')}
            style={{ borderRadius: 12 }}
          >
            返回列表
          </Button>
        </div>

        <Card className="notebook-edit-main-card">
          <ProForm<NoteFormValue>
            key={noteId}
            layout="vertical"
            submitter={{
              searchConfig: { submitText: '保存修改', resetText: '重置' },
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
            initialValues={initialValues}
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
              <Typography.Title level={5} style={{ margin: 0, marginBottom: 4, color: '#1f2b4d' }}>
                分类
              </Typography.Title>
              <Typography.Text type="secondary">可多选，用于整理笔记主题和后续筛选。</Typography.Text>
              <div style={{ marginTop: 12 }}>
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
              </div>
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
    </PageContainer>
  );
};

export default NotebookEditPage;
