import React, { useState } from 'react';
import { Button, Card, Descriptions, message } from 'antd';
import moment from 'moment';
import { DeviceInstance } from '@/pages/device/instance/data';
import Configuration from './configuration';
import Tags from './tags/tags';
import apis from '@/services';

interface Props {
  data: Partial<DeviceInstance>;
  configuration: any;
  refresh:Function;
}
interface State {
  updateVisible:boolean;
  tagsVisible:boolean;
}
const Info: React.FC<Props> = (props) => {
  const initState: State = {
    updateVisible:false,
    tagsVisible:false,
  };
  const [updateVisible, setUpdateVisible] = useState(initState.updateVisible);
  const [tagsVisible, setTagsVisible] = useState(initState.tagsVisible);

  const updateData = (item?: any) => {
    setUpdateVisible(false);
    apis.deviceInstance
      .update(props.data.id,item)
      .then((response:any) => {
        if (response.status === 200) {
          props.refresh();
          message.success('配置信息修改成功');
        } else {
          message.error("配置信息修改失败")
        }
      })
      .catch(() => {});
  };

  const saveTags = (item?:any) =>{
    setTagsVisible(false);
    apis.deviceInstance.
    saveDeviceTags(props.data.id,item)
      .then((res:any) => {
        if (res.status === 200) {
          props.refresh();
          message.success('标签信息保存成功');
        } else {
          message.error("标签信息保存失败")
        }
    }).catch(()=>{});
  };

  return (
    <div>
      <Card style={{ marginBottom: 20 }}>
        <Descriptions style={{ marginBottom: 20 }} bordered column={3} size="small"
                      title={<span>型号信息</span>}>
          <Descriptions.Item label="设备型号" span={1}>
            {props.data.productName}
          </Descriptions.Item>
          <Descriptions.Item label="设备类型" span={1}>
            {props.data.deviceType?.text}
          </Descriptions.Item>
          <Descriptions.Item label="所属机构" span={1}>
            {props.data.orgName}
          </Descriptions.Item>
          <Descriptions.Item label="连接协议" span={1}>
            {props.data.transport}
          </Descriptions.Item>
          <Descriptions.Item label="消息协议" span={1}>
            {props.data.protocol}
          </Descriptions.Item>
          <Descriptions.Item label="IP地址" span={1}>
            {props.data.address}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间" span={1}>
            {moment(props.data.createTime).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="注册时间" span={1}>
            {props.data.state?.value !== "notActive" ? moment(props.data.registerTime).format('YYYY-MM-DD HH:mm:ss') : "/"}
          </Descriptions.Item>
          <Descriptions.Item label="最后上线时间" span={1}>
            {props.data.state?.value !== "notActive" ? moment(props.data.onlineTime).format('YYYY-MM-DD HH:mm:ss') : "/"}
          </Descriptions.Item>
          <Descriptions.Item label="说明" span={3}>
            {props.data.describe}
          </Descriptions.Item>
        </Descriptions>

        {props.configuration && props.configuration.name && (
          <Descriptions style={{ marginBottom: 20 }} bordered size="small" column={3}
            title={
              <span>
                {props.configuration.name}
                <Button icon="edit" style={{ marginLeft: 20 }} type="link"
                  onClick={() => setUpdateVisible(true)}
                >编辑</Button>
              </span>
            }>
            {props.configuration.properties &&
            props.configuration.properties.map((item: any) => (
              <Descriptions.Item label={item.property} span={1} key={item.property}>
                {props.data.configuration[item.property]}
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}
        <Descriptions style={{ marginBottom: 20 }} bordered column={3} size="small"
          title={
            <span>
            {'标签'}
              <Button icon="edit" style={{ marginLeft: 20 }} type="link"
                      onClick={() => setTagsVisible(true)}
              >编辑</Button>
            </span>
          }>
          {props.data.tags && props.data.tags?.map((item: any) => (
            <Descriptions.Item label={`${item.name}（${item.key})`} span={1} key={item.key}>
              {item.value}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>
      {updateVisible && (
        <Configuration data={props.data} configuration={props.configuration}
          close={() => {
            setUpdateVisible(false);
            props.refresh();
          }}
          save={(item: any) => {
            updateData(item);
          }}
        />
      )}

      {tagsVisible && (
        <Tags data={props.data.tags} deviceId={props.data.id}
          close={() => {
            setTagsVisible(false);
            props.refresh();
          }}
          save={(item: any) => {
            saveTags(item);
          }}
        />
      )}
    </div>
  )
};

export default Info;
