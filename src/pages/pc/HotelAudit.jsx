import React, { useState, useEffect } from 'react'
import {
  Layout,
  Card,
  Table,
  Space,
  Button,
  Modal,
  Form,
  Input,
  message,
  Descriptions,
  Image
} from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  StopOutlined
} from '@ant-design/icons'
import { useAuth } from '../../hooks/useAuth'
import { getHotels as getHotelsApi, updateHotelStatus } from '../../api/hotels'
import StarRating from '../../components/StarRating'
import StatusTag from '../../components/StatusTag'
import PageHeader from '../../components/PageHeader'
import './HotelAudit.css'

const { Content } = Layout
const { TextArea } = Input

function HotelAudit() {
  const { userInfo, handleLogout } = useAuth('system_admin', '请先登录管理员账号')
  const [form] = Form.useForm()

  // 状态管理
  const [hotels, setHotels] = useState([])
  const [detailVisible, setDetailVisible] = useState(false)
  const [rejectVisible, setRejectVisible] = useState(false)
  const [currentHotel, setCurrentHotel] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  // 加载酒店数据（管理员查看全部）
  const loadHotels = async () => {
    try {
      const data = await getHotelsApi({ status: 'all', limit: 100 })
      setHotels(data.hotels)
    } catch (err) {
      message.error('加载酒店数据失败')
    }
  }

  useEffect(() => {
    if (userInfo) {
      loadHotels()
    }
  }, [userInfo])
  
  // 查看详情
  const handleViewDetail = (hotel) => {
    setCurrentHotel(hotel)
    setDetailVisible(true)
  }
  
  // 审核通过
  const handleApprove = (hotel) => {
    Modal.confirm({
      title: '确认审核通过',
      content: `确定要通过《${hotel.name}》的审核吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await updateHotelStatus(hotel.id, { status: 'approved' })
          message.success('审核通过')
          loadHotels()
        } catch (err) {
          message.error(err.message || '操作失败')
        }
      }
    })
  }
  
  // 打开拒绝弹窗
  const handleRejectModal = (hotel) => {
    setCurrentHotel(hotel)
    form.resetFields()
    setRejectVisible(true)
  }
  
  // 审核拒绝
  const handleReject = async (values) => {
    const { reason } = values

    if (!reason || reason.trim().length === 0) {
      message.error('请输入拒绝原因')
      return
    }

    try {
      await updateHotelStatus(currentHotel.id, { status: 'rejected', reject_reason: reason })
      setRejectVisible(false)
      message.success('已拒绝')
      loadHotels()
    } catch (err) {
      message.error(err.message || '操作失败')
    }
  }
  
  // 下线酒店
  const handleOffline = (hotel) => {
    Modal.confirm({
      title: '确认下线',
      content: `确定要将《${hotel.name}》下线吗？下线后用户将无法看到此酒店。`,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await updateHotelStatus(hotel.id, { status: 'offline' })
          message.success('已下线')
          loadHotels()
        } catch (err) {
          message.error(err.message || '操作失败')
        }
      }
    })
  }

  // 重新上线
  const handleOnline = (hotel) => {
    Modal.confirm({
      title: '确认上线',
      content: `确定要将《${hotel.name}》重新上线吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await updateHotelStatus(hotel.id, { status: 'approved' })
          message.success('已上线')
          loadHotels()
        } catch (err) {
          message.error(err.message || '操作失败')
        }
      }
    })
  }
  
  // 筛选数据
  const filteredHotels = filterStatus === 'all' 
    ? hotels 
    : hotels.filter(h => h.status === filterStatus)
  
  // 表格列定义
  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '星级',
      dataIndex: 'star_rating',
      key: 'star_rating',
      width: 100,
      render: (star) => <StarRating star={star} />
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      width: 250,
    },
    {
      title: '创建者',
      dataIndex: 'created_by_name',
      key: 'created_by_name',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (time) => new Date(time).toLocaleString('zh-CN')
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status, record) => (
        <div>
          <StatusTag status={status} />
          {status === 'rejected' && record.reject_reason && (
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              原因：{record.reject_reason}
            </div>
          )}
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          
          {record.status === 'pending' && (
            <>
              <Button 
                type="link" 
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record)}
              >
                通过
              </Button>
              <Button 
                type="link" 
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleRejectModal(record)}
              >
                拒绝
              </Button>
            </>
          )}
          
          {record.status === 'approved' && (
            <Button 
              type="link" 
              danger
              size="small"
              icon={<StopOutlined />}
              onClick={() => handleOffline(record)}
            >
              下线
            </Button>
          )}
          
          {record.status === 'offline' && (
            <Button 
              type="link" 
              size="small"
              onClick={() => handleOnline(record)}
            >
              上线
            </Button>
          )}
        </Space>
      )
    }
  ]
  
  // 统计数据
  const stats = {
    total: hotels.length,
    pending: hotels.filter(h => h.status === 'pending').length,
    approved: hotels.filter(h => h.status === 'approved').length,
    rejected: hotels.filter(h => h.status === 'rejected').length,
    offline: hotels.filter(h => h.status === 'offline').length
  }

  return (
    <Layout className="hotel-audit-page">
      <PageHeader
        title="✅ 酒店信息审核"
        roleLabel="管理员"
        username={userInfo?.username}
        onLogout={handleLogout}
        className="audit-header"
      />
      
      <Content className="audit-content">
        {/* 统计卡片 */}
        <div className="stats-cards">
          <Card 
            className={`stat-card ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">全部酒店</div>
          </Card>
          <Card 
            className={`stat-card ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            <div className="stat-value" style={{ color: '#fa8c16' }}>{stats.pending}</div>
            <div className="stat-label">待审核</div>
          </Card>
          <Card 
            className={`stat-card ${filterStatus === 'approved' ? 'active' : ''}`}
            onClick={() => setFilterStatus('approved')}
          >
            <div className="stat-value" style={{ color: '#52c41a' }}>{stats.approved}</div>
            <div className="stat-label">已上线</div>
          </Card>
          <Card 
            className={`stat-card ${filterStatus === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilterStatus('rejected')}
          >
            <div className="stat-value" style={{ color: '#ff4d4f' }}>{stats.rejected}</div>
            <div className="stat-label">已拒绝</div>
          </Card>
          <Card 
            className={`stat-card ${filterStatus === 'offline' ? 'active' : ''}`}
            onClick={() => setFilterStatus('offline')}
          >
            <div className="stat-value" style={{ color: '#999' }}>{stats.offline}</div>
            <div className="stat-label">已下线</div>
          </Card>
        </div>
        
        {/* 酒店列表 */}
        <Card>
          <Table 
            columns={columns}
            dataSource={filteredHotels}
            rowKey="id"
            scroll={{ x: 1400 }}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </Content>
      
      {/* 详情弹窗 */}
      <Modal
        title="酒店详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={900}
        footer={null}
      >
        {currentHotel && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="酒店中文名">{currentHotel.name}</Descriptions.Item>
              <Descriptions.Item label="酒店英文名">{currentHotel.name_en}</Descriptions.Item>
              <Descriptions.Item label="星级"><StarRating star={currentHotel.star_rating} /></Descriptions.Item>
              <Descriptions.Item label="联系电话">{currentHotel.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="详细地址" span={2}>{currentHotel.address}</Descriptions.Item>
              <Descriptions.Item label="城市">{currentHotel.city || '-'}</Descriptions.Item>
              <Descriptions.Item label="省份">{currentHotel.province || '-'}</Descriptions.Item>
              <Descriptions.Item label="创建者">{currentHotel.created_by_name}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{currentHotel.created_at ? new Date(currentHotel.created_at).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
              <Descriptions.Item label="酒店设施" span={2}>
                {Array.isArray(currentHotel.facilities) ? currentHotel.facilities.join('、') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="酒店描述" span={2}>
                {currentHotel.description || '-'}
              </Descriptions.Item>
            </Descriptions>
            
            <h4 style={{ marginTop: '24px', marginBottom: '12px' }}>房型信息</h4>
            <Table 
              dataSource={currentHotel.rooms || []}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: '房型', dataIndex: 'name', key: 'name' },
                { title: '面积', dataIndex: 'area_sqm', key: 'area_sqm', render: (v) => v ? `${v}㎡` : '-' },
                { title: '床型', dataIndex: 'bed_type', key: 'bed_type' },
                { title: '价格', dataIndex: 'default_price', key: 'default_price', render: (p) => `¥${p}` },
                { title: '最多入住', dataIndex: 'max_guests', key: 'max_guests' },
              ]}
            />
            
            {currentHotel.images && currentHotel.images.length > 0 && (
              <>
                <h4 style={{ marginTop: '24px', marginBottom: '12px' }}>酒店图片</h4>
                <Image.PreviewGroup>
                  <Space>
                    {currentHotel.images.map((img, index) => (
                      <Image
                        key={index}
                        width={150}
                        src={typeof img === 'string' ? img : img.url}
                      />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              </>
            )}
          </div>
        )}
      </Modal>
      
      {/* 拒绝原因弹窗 */}
      <Modal
        title="审核拒绝"
        open={rejectVisible}
        onCancel={() => setRejectVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleReject}
        >
          <Form.Item
            label="拒绝原因"
            name="reason"
            rules={[{ required: true, message: '请输入拒绝原因' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="请详细说明拒绝原因，以便商户修改..." 
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" danger htmlType="submit">
                确认拒绝
              </Button>
              <Button onClick={() => setRejectVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}

export default HotelAudit