import React, { useState, useEffect } from 'react'
import {
  Layout,
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Table,
  Space,
  message,
  Modal,
  InputNumber,
  Switch
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useAuth } from '../../hooks/useAuth'
import StarRating from '../../components/StarRating'
import StatusTag from '../../components/StatusTag'
import PageHeader from '../../components/PageHeader'
import './HotelManage.css'

const { Content } = Layout

function HotelManage() {
  const { userInfo, handleLogout } = useAuth('merchant', '请先登录商户账号')
  const [form] = Form.useForm()
  const [roomForm] = Form.useForm()

  // 状态管理
  const [hotels, setHotels] = useState([])
  const [editingHotel, setEditingHotel] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [roomModalVisible, setRoomModalVisible] = useState(false)
  const [currentRooms, setCurrentRooms] = useState([])

  // 加载酒店数据
  const loadHotels = () => {
    const merchantHotels = JSON.parse(localStorage.getItem('merchantHotels') || '[]')
    setHotels(merchantHotels)
  }

  useEffect(() => {
    if (userInfo) {
      loadHotels()
    }
  }, [userInfo])
  
  // 新建酒店
  const handleCreate = () => {
    setEditingHotel(null)
    setCurrentRooms([])
    form.resetFields()
    setModalVisible(true)
  }
  
  // 编辑酒店
  const handleEdit = (hotel) => {
    setEditingHotel(hotel)
    setCurrentRooms(hotel.rooms || [])
    
    // 填充表单
    form.setFieldsValue({
      ...hotel,
      openDate: hotel.openDate ? dayjs(hotel.openDate) : null,
      facilities: hotel.facilities?.join('、') || '',
      tags: hotel.tags?.join('、') || ''
    })
    
    setModalVisible(true)
  }
  
  // 删除酒店
  const handleDelete = (hotelId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这家酒店吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        const newHotels = hotels.filter(h => h.id !== hotelId)
        localStorage.setItem('merchantHotels', JSON.stringify(newHotels))
        setHotels(newHotels)
        message.success('删除成功')
      }
    })
  }
  
  // 保存酒店信息
  const handleSave = (values) => {
    if (currentRooms.length === 0) {
      message.error('请至少添加一个房型')
      return
    }
    
    const hotelData = {
      ...values,
      id: editingHotel?.id || Date.now(),
      openDate: values.openDate ? values.openDate.format('YYYY-MM-DD') : '',
      facilities: values.facilities ? values.facilities.split('、').filter(Boolean) : [],
      tags: values.tags ? values.tags.split('、').filter(Boolean) : [],
      rooms: currentRooms,
      status: editingHotel?.status || 'pending', // pending/approved/rejected
      images: editingHotel?.images || [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'
      ],
      rating: editingHotel?.rating || 4.5,
      reviewCount: editingHotel?.reviewCount || 0,
      location: {
        district: values.district || '',
        subway: values.subway || '',
        nearbyAttractions: values.nearbyAttractions 
          ? values.nearbyAttractions.split('、').filter(Boolean) 
          : []
      },
      createdBy: userInfo.username,
      createdAt: editingHotel?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    let newHotels
    if (editingHotel) {
      // 编辑
      newHotels = hotels.map(h => h.id === editingHotel.id ? hotelData : h)
      message.success('保存成功')
    } else {
      // 新建
      newHotels = [...hotels, hotelData]
      message.success('创建成功，等待审核')
    }
    
    localStorage.setItem('merchantHotels', JSON.stringify(newHotels))
    setHotels(newHotels)
    setModalVisible(false)
    form.resetFields()
  }
  
  // 添加房型
  const handleAddRoom = () => {
    setRoomModalVisible(true)
    roomForm.resetFields()
  }
  
  // 保存房型
  const handleSaveRoom = (values) => {
    const room = {
      id: Date.now(),
      ...values
    }
    setCurrentRooms([...currentRooms, room])
    setRoomModalVisible(false)
    message.success('房型已添加')
  }
  
  // 删除房型
  const handleDeleteRoom = (roomId) => {
    setCurrentRooms(currentRooms.filter(r => r.id !== roomId))
    message.success('房型已删除')
  }
  
  // 表格列定义
  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '英文名称',
      dataIndex: 'nameEn',
      key: 'nameEn',
      width: 200,
    },
    {
      title: '星级',
      dataIndex: 'star',
      key: 'star',
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
      title: '房型数量',
      key: 'rooms',
      width: 100,
      render: (_, record) => record.rooms?.length || 0
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <StatusTag status={status} />
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ]
  
  // 房型表格列
  const roomColumns = [
    { title: '房型', dataIndex: 'type', key: 'type' },
    { title: '面积', dataIndex: 'size', key: 'size' },
    { title: '床型', dataIndex: 'bedType', key: 'bedType' },
    { title: '价格', dataIndex: 'price', key: 'price', render: (price) => `¥${price}` },
    { title: '库存', dataIndex: 'stock', key: 'stock' },
    {
      title: '早餐',
      dataIndex: 'breakfast',
      key: 'breakfast',
      render: (breakfast) => breakfast ? '✓' : '✗'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          danger 
          size="small"
          onClick={() => handleDeleteRoom(record.id)}
        >
          删除
        </Button>
      )
    }
  ]

  return (
    <Layout className="hotel-manage-page">
      <PageHeader
        title="🏨 酒店信息管理"
        roleLabel="商户"
        username={userInfo?.username}
        onLogout={handleLogout}
        className="manage-header"
      />
      
      <Content className="manage-content">
        <Card>
          <div className="content-header">
            <h3>我的酒店</h3>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              新建酒店
            </Button>
          </div>
          
          <Table 
            columns={columns}
            dataSource={hotels}
            rowKey="id"
            scroll={{ x: 1200 }}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </Content>
      
      {/* 酒店信息编辑弹窗 */}
      <Modal
        title={editingHotel ? '编辑酒店信息' : '新建酒店'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item 
            label="酒店中文名" 
            name="name"
            rules={[{ required: true, message: '请输入酒店中文名' }]}
          >
            <Input placeholder="例如：上海外滩华尔道夫酒店" />
          </Form.Item>
          
          <Form.Item 
            label="酒店英文名" 
            name="nameEn"
            rules={[{ required: true, message: '请输入酒店英文名' }]}
          >
            <Input placeholder="例如：Waldorf Astoria Shanghai" />
          </Form.Item>
          
          <Form.Item 
            label="星级" 
            name="star"
            rules={[{ required: true, message: '请选择星级' }]}
          >
            <Select>
              <Select.Option value={3}>三星 ⭐⭐⭐</Select.Option>
              <Select.Option value={4}>四星 ⭐⭐⭐⭐</Select.Option>
              <Select.Option value={5}>五星 ⭐⭐⭐⭐⭐</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item 
            label="详细地址" 
            name="address"
            rules={[{ required: true, message: '请输入详细地址' }]}
          >
            <Input placeholder="例如：上海市黄浦区中山东一路2号" />
          </Form.Item>
          
          <Form.Item label="所在区域" name="district">
            <Input placeholder="例如：黄浦区" />
          </Form.Item>
          
          <Form.Item label="地铁信息" name="subway">
            <Input placeholder="例如：地铁2号线/10号线南京东路站" />
          </Form.Item>
          
          <Form.Item label="联系电话" name="phone">
            <Input placeholder="例如：021-63229988" />
          </Form.Item>
          
          <Form.Item 
            label="开业时间" 
            name="openDate"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item label="酒店设施" name="facilities">
            <Input placeholder="用顿号分隔，例如：免费WiFi、停车场、游泳池、健身房" />
          </Form.Item>
          
          <Form.Item label="酒店标签" name="tags">
            <Input placeholder="用顿号分隔，例如：豪华、外滩、江景" />
          </Form.Item>
          
          <Form.Item label="周边景点" name="nearbyAttractions">
            <Input placeholder="用顿号分隔，例如：外滩、南京路步行街、豫园" />
          </Form.Item>
          
          <Form.Item label="房型信息">
            <div>
              <Button 
                type="dashed" 
                icon={<PlusOutlined />}
                onClick={handleAddRoom}
                block
                style={{ marginBottom: 16 }}
              >
                添加房型
              </Button>
              
              {currentRooms.length > 0 && (
                <Table 
                  columns={roomColumns}
                  dataSource={currentRooms}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              )}
            </div>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 房型编辑弹窗 */}
      <Modal
        title="添加房型"
        open={roomModalVisible}
        onCancel={() => setRoomModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={roomForm}
          layout="vertical"
          onFinish={handleSaveRoom}
        >
          <Form.Item 
            label="房型名称" 
            name="type"
            rules={[{ required: true, message: '请输入房型名称' }]}
          >
            <Input placeholder="例如：豪华大床房" />
          </Form.Item>
          
          <Form.Item 
            label="房间面积" 
            name="size"
            rules={[{ required: true, message: '请输入房间面积' }]}
          >
            <Input placeholder="例如：40㎡" />
          </Form.Item>
          
          <Form.Item 
            label="床型" 
            name="bedType"
            rules={[{ required: true, message: '请输入床型' }]}
          >
            <Input placeholder="例如：1张特大床" />
          </Form.Item>
          
          <Form.Item 
            label="最多入住人数" 
            name="maxGuests"
            rules={[{ required: true, message: '请输入最多入住人数' }]}
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item 
            label="价格（元/晚）" 
            name="price"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item label="原价（元/晚）" name="originalPrice">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item 
            label="库存" 
            name="stock"
            rules={[{ required: true, message: '请输入库存' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item 
            label="含早餐" 
            name="breakfast"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item 
            label="免费WiFi" 
            name="wifi"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
          
          <Form.Item label="取消政策" name="cancelPolicy" initialValue="免费取消">
            <Input placeholder="例如：免费取消" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                添加
              </Button>
              <Button onClick={() => setRoomModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}

export default HotelManage