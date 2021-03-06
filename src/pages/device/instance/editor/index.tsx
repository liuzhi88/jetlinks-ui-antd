import React, { useEffect, useState } from 'react';
import { Badge, Descriptions, Icon, message, Popconfirm, Row, Spin, Tooltip } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva';
import { router } from 'umi';
import Info from './detail/Info';
import Status from './detail/Status';
import Log from './detail/Log';
import Debugger from './detail/Debugger';
import Functions from './detail/functions';
import styles from './index.less';
import { ConnectState, Dispatch } from '@/models/connect';
import { DeviceInstance } from '@/pages/device/instance/data';
import apis from '@/services';
import Gateway from './detail/gateway';
import Alarm from '@/pages/device/alarm';

interface Props {
  dispatch: Dispatch;
  location: Location;
}

interface State {
  data: Partial<DeviceInstance>;
  activeKey: string;
  logs: any;
  orgInfo: any;
  config: any;
  spinning:boolean;
}

const Editor: React.FC<Props> = props => {
  const {
    dispatch,
    location: { pathname },
  } = props;

  const initState: State = {
    activeKey: 'info',
    data: {},
    logs: {},
    orgInfo: {},
    config: {},
    spinning:true,
  };
  const [activeKey, setActiveKey] = useState(initState.activeKey);
  const [data, setData] = useState(initState.data);
  const [id, setId] = useState();
  const [config, setConfig] = useState(initState.config);
  const [orgInfo] = useState(initState.orgInfo);
  const [spinning, setSpinning] = useState(initState.spinning);
  const [tableList, setTableList] = useState();

  const tabList = [
    {
      key: 'info',
      tab: '实例信息',
    },
    {
      key: 'status',
      tab: '运行状态',
    },
    {
      key: 'log',
      tab: '日志管理',
    },
    {
      key: 'alarm',
      tab: '告警设置',
    },
  ];

  const getInfo = (deviceId: string | undefined) => {
    setSpinning(true);
    dispatch({
      type: 'deviceInstance/queryById',
      payload: deviceId,
      callback: (response: any) => {
        if (response.status === 200) {
          const deviceData = response.result;
          if (deviceData.orgId) {
            deviceData.orgName = orgInfo[deviceData.orgId];
          }
          if (deviceData.metadata) {
            const deriveMetadata = JSON.parse(deviceData.metadata);
            if (deriveMetadata.functions.length > 0) {
              tabList.splice(2, 0, {
                key: 'functions',
                tab: '设备功能',
              });
            }
          }

          if (deviceData.deviceType.value === "gateway"){
            tabList.push({
              key: 'gateway',
              tab: '网关设备',
            });
          }

          apis.deviceProdcut.protocolConfiguration(deviceData.protocol, deviceData.transport)
            .then(resp => {
              setConfig(resp.result);
            }).catch();
          setTableList(tabList);
          setData(deviceData);
          setSpinning(false);
        }
      },
    });
  };

  const statusMap = new Map();
  statusMap.set('在线', 'success');
  statusMap.set('离线', 'error');
  statusMap.set('未激活', 'processing');

  useEffect(() => {
    setActiveKey("info");
    apis.deviceProdcut
      .queryOrganization()
      .then(res => {
        if (res.status === 200) {
          res.result.map((e:any) => (
            orgInfo[e.id] = e.name
          ));
        }
      }).catch(() => {
      });

    if (pathname.indexOf('save') > 0) {
      const list = pathname.split('/');
      getInfo(list[list.length - 1]);
      setId(list[list.length - 1]);
    }
    setTableList(tabList);
  }, [window.location.hash]);

  const disconnectDevice = (deviceId: string | undefined) => {
    setSpinning(true);
    apis.deviceInstance.disconnectDevice(deviceId)
      .then(response => {
      if (response.status === 200){
        message.success("断开连接成功");
        data.state={value:'offline',text:'离线'};
        setData(data);
        setSpinning(false);
      } else {
        message.error("断开连接失败");
        setSpinning(false);
      }
    }).catch();
  };

  const changeDeploy = (deviceId: string | undefined) => {
    setSpinning(true);
    apis.deviceInstance
      .changeDeploy(deviceId)
      .then(response => {
        if (response.status === 200) {
          message.success('激活成功');
          data.state={value:'offline',text:'离线'};
          setData(data);
          setSpinning(false);
        } else {
          message.error("激活失败");
          setSpinning(false);
        }
      })
      .catch(() => {});
  };

  const action = (
    <Tooltip title='刷新'>
      <Icon type="sync" style={{fontSize:20}} onClick={() => { getInfo(data.id) }}/>
    </Tooltip>
  );

  const info = {
    info: <Info data={data} configuration={config} refresh={()=>{getInfo(data.id)}}/>,
    status: <Status device={data} />,
    functions: <Functions device={data} />,
    log: <Log deviceId={id}/>,
    debugger: <Debugger />,
    gateway: <Gateway deviceId={id} loading={false}/>,
    alarm: <Alarm target="device" productId={data.productId} targetId={data.id} metaData={data.metadata} name={data.name}/>,
  };

  const content = (
    <div style={{ marginTop: 30 }}>
      <Descriptions column={4}>
        <Descriptions.Item label="ID">{id}</Descriptions.Item>
        <Descriptions.Item label="型号">
          <div>
            {data.productName}
            <a style={{marginLeft:10}}
              onClick={() => {
                router.push(`/device/product/save/${data.productId}`);
              }}
            >查看</a>
          </div>
        </Descriptions.Item>
      </Descriptions>
    </div>
  );

  const titleInfo = (
      <Row>
        <div>
          <span>
            设备：{data.name}
          </span>
          <Badge style={{marginLeft:20}} status={statusMap.get(data.state?.text)} text={data.state?.text}/>
          {data.state?.value === "online"?(
            <Popconfirm title="确认让此设备断开连接？" onConfirm={() => {
                disconnectDevice(data.id)
            }}>
              <a style={{fontSize:12,marginLeft:20}}>断开连接</a>
            </Popconfirm>
          ):(data.state?.value === "notActive"?(
            <Popconfirm title="确认激活此设备？"
              onConfirm={() => {
                changeDeploy(data.id)
            }}>
              <a style={{fontSize:12,marginLeft:20}}>激活设备</a>
            </Popconfirm>
          ):(<span/>))}
        </div>
      </Row>
  );

  const extra = (
    <div className={styles.moreInfo}/>
  );

  return (
    <Spin tip="加载中..." spinning={spinning}>
      <PageHeaderWrapper
        className={styles.instancePageHeader}
        style={{ marginTop: 0 }}
        title={titleInfo}
        extra={action}
        content={content}
        extraContent={extra}
        tabList={tableList}
        tabActiveKey={activeKey}
        onTabChange={(key: string) => {
          setActiveKey(key);
        }}
      >
        {info[activeKey]}
      </PageHeaderWrapper>
    </Spin>
  );
};

export default connect(({ deviceInstance, loading }: ConnectState) => ({
  deviceInstance,
  loading,
}))(Editor);
