import { NavBar, List, Avatar } from 'antd-mobile'
import {
  SetOutline,
  MessageOutline,
  HeartOutline,
  InformationCircleOutline,
} from 'antd-mobile-icons'
import './ProfilePage.css'

function ProfilePage() {
  return (
    <div className="profile-page">
      <NavBar backArrow={false}>我的</NavBar>

      <div className="profile-header">
        <Avatar
          src=""
          style={{ '--size': '64px', '--border-radius': '50%' }}
        />
        <div className="profile-info">
          <div className="profile-name">未登录</div>
          <div className="profile-desc">登录后享受更多服务</div>
        </div>
      </div>

      <List className="profile-menu">
        <List.Item prefix={<HeartOutline />} onClick={() => {}}>
          我的收藏
        </List.Item>
        <List.Item prefix={<MessageOutline />} onClick={() => {}}>
          我的评价
        </List.Item>
        <List.Item prefix={<InformationCircleOutline />} onClick={() => {}}>
          帮助中心
        </List.Item>
        <List.Item prefix={<SetOutline />} onClick={() => {}}>
          设置
        </List.Item>
      </List>
    </div>
  )
}

export default ProfilePage
