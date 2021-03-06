import React, { useEffect, useState } from 'react';
import Form from 'antd/es/form';
import { FormComponentProps } from 'antd/lib/form';
import { Button, Card, Col, Icon, Input, Modal, Row, Tooltip } from 'antd';
import { alarm } from '../data';
import Triggers from '@/pages/device/alarm/save/triggers/index';
import ActionAssembly from '@/pages/device/alarm/save/actions/index';

interface Props extends FormComponentProps {
  close: Function;
  save: Function;
  data: Partial<alarm>;
  target: string;
  targetId: string | undefined;
  metaData: string | undefined;
  name: string | undefined;
}

interface State {
  properties: any[];
  data: Partial<alarm>;
  trigger: any[];
  action: any[];
}

const Save: React.FC<Props> = props => {

  const initState: State = {
    properties: [],
    data: props.data,
    trigger: [],
    action: [],
  };

  const [data] = useState(initState.data);
  const [properties, setProperties] = useState(initState.properties);
  const [trigger, setTrigger] = useState(initState.trigger);
  const [action, setAction] = useState(initState.action);

  const submitData = () => {
    data.name = props.name;
    data.target = props.target;
    data.targetId = props.targetId;
    if (props.name === 'device') {
      data.alarmRule = {
        name: props.name,
        deviceId: props.targetId,
        deviceName: props.name,
        productId: '',
        productName: '',
        triggers: trigger,
        actions: action,
        properties: properties,
      };
    } else {
      data.alarmRule = {
        name: props.name,
        deviceId: '',
        deviceName: '',
        productId: props.targetId,
        productName: props.name,
        triggers: trigger,
        actions: action,
        properties: properties,
      };
    }
    data.state = { text: '已停止', value: 'stopped' };
    props.save({ ...data });
  };

  useEffect(() => {
    if (props.data.alarmRule) {
      setTrigger(props.data.alarmRule.triggers.length > 0 ? [...props.data.alarmRule.triggers] : [{ _id: 0 }]);
      setAction(props.data.alarmRule.actions.length > 0 ? [...props.data.alarmRule.actions] : [{ _id: 0 }]);
      setProperties(props.data.alarmRule.properties.length > 0 ? [...props.data.alarmRule.properties] : [{ _id: 0 }]);
    } else {
      setTrigger([{ _id: 0 }]);
      setAction([{ _id: 0 }]);
      setProperties([{ _id: 0 }]);
    }
  }, []);

  const removeProperties = (val: number) => {
    properties.splice(val, 1);
    setProperties([...properties]);
  };

  return (
    <Modal
      title={`${props.data?.id ? '编辑' : '新建'}告警`}
      visible
      okText="确定"
      cancelText="取消"
      onOk={() => {
        submitData();
      }}
      style={{ marginTop: '-3%' }}
      width="70%"
      onCancel={() => props.close()}
    >
      <div style={{ maxHeight: 750, overflowY: 'auto', overflowX: 'hidden' }} key={Math.round(Math.random() * 100000)}>
        <Form wrapperCol={{ span: 24 }} key={Math.round(Math.random() * 100000)}>
          <Card style={{ marginBottom: 10 }} bordered={false} size="small"  key={Math.round(Math.random() * 100000)}>
            <p style={{ fontSize: 16 }}>触发条件
              <Tooltip title="触发器可为空，消息只要满足触发条件中任意一个即可触发">
                <Icon type="question-circle-o" style={{ paddingLeft: 10 }}/>
              </Tooltip>
            </p>
            {trigger.map((item: any, index) => (
              <Triggers save={(triggerData: any) => {
                trigger.splice(index, 1, triggerData);
                //setTrigger([...trigger]);
              }} trigger={item} metaData={props.metaData} position={index} remove={(position: number) => {
                trigger.splice(position, 1);
                setTrigger([...trigger]);
              }}/>
            ))}
            <Button icon="plus" type="link"
                    onClick={() => {
                      setTrigger([...trigger, { _id: Math.round(Math.random() * 100000) }]);
                    }}
            >
              新增触发器
            </Button>
          </Card>
          <Card style={{ marginBottom: 10 }} bordered={false} size="small" key={Math.round(Math.random() * 100000)}>
            <p style={{ fontSize: 16 }}>转换
              <Tooltip title="将内置的结果字段转换为自定义字段，例如：deviceId 转为 id">
                <Icon type="question-circle-o" style={{ paddingLeft: 10 }}/>
              </Tooltip>
            </p>
            <div style={{
              maxHeight: 200,
              overflowY: 'auto',
              overflowX: 'hidden',
              backgroundColor: '#F5F5F6',
              paddingTop: 10,
            }} key={Math.round(Math.random() * 100000)}>
              {properties.map((item: any, index) => (
                <Row key={Math.round(Math.random() * 100000)} gutter={16} style={{ paddingBottom: 10, marginLeft: 13, marginRight: 3 }}>
                  <Col span={6}>
                    <Input placeholder="请输入属性" key={Math.round(Math.random() * 100000)} value={item.property}
                           onChange={event => {
                             properties[index].property = event.target.value;
                             setProperties([...properties]);
                           }}
                    />
                  </Col>
                  <Col span={6}>
                    <Input placeholder="请输入别名" value={item.alias} key={Math.round(Math.random() * 100000)}
                           onChange={event => {
                             properties[index].alias = event.target.value;
                             setProperties([...properties]);
                           }}
                    />
                  </Col>
                  <Col span={12} style={{ textAlign: 'right', marginTop: 6, paddingRight: 15 }}>
                    {index === 0 ? (
                      <Row key={Math.round(Math.random() * 100000)}>
                        <a onClick={() => {
                          setProperties([...properties, { _id: Math.round(Math.random() * 100000) }]);
                        }}>添加</a>
                        <a style={{ paddingLeft: 10, paddingTop: 7 }}
                           onClick={() => {
                             removeProperties(index);
                           }}
                        >删除</a>
                      </Row>
                    ) : (
                      <a style={{ paddingTop: 7 }}
                         onClick={() => {
                           removeProperties(index);
                         }}
                      >删除</a>
                    )}
                  </Col>
                </Row>
              ))}
            </div>
          </Card>

          <Card bordered={false} size="small" key={Math.round(Math.random() * 100000)}>
            <p style={{ fontSize: 16 }}>执行动作</p>
            {action.map((item: any, index) => (
              <ActionAssembly save={(actionAata: any) => {
                action.splice(index, 1, actionAata);
                //setAction([...action]);
              }} action={item} position={index} remove={(position: number) => {
                action.splice(position, 1);
                setAction([...action]);
              }}/>
            ))}
            <Button icon="plus" type="link"
                    onClick={() => {
                      setAction([...action, { _id: Math.round(Math.random() * 100000) }]);
                    }}
            >
              新增触发器
            </Button>
          </Card>
        </Form>
      </div>
    </Modal>
  );
};

export default Form.create<Props>()(Save);
