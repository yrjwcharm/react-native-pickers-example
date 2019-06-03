/**
 * Created by Administrator on 2018\11\22 0022.
 */
import React, {Component} from 'react'
import {View, Text, StyleSheet, Modal, Dimensions, TouchableOpacity, Image} from 'react-native'
import Progress from './CusProgressBar'
import CodePush from "react-native-code-push"
import Icon from "react-native-vector-icons/FontAwesome";
import Config from './../Common/Config'
import Toast from 'teaset'

const CODE_PUSH_KEY = Config.appkeyAndroid
let codePushOptions = {
    // checkFrequency: CodePush.CheckFrequency.ON_APP_START
    checkFrequency: CodePush.CheckFrequency.MANUAL
}
const {width, height} = Dimensions.get('window');
class ProgressBar extends Component {
    constructor(props) {
        super(props);
        this.currProgress = 0.0;
        this.syncMessage = "";
        this.state = {
            modalVisible: false,
            isMandatory: false,
            immediateUpdate: false,
            updateInfo: {}
        };
    }

    codePushStatusDidChange(syncStatus) {
        console.log(
            `执行了codePushStatusDidChange ---${syncStatus}-->${JSON.stringify(
                CodePush.SyncStatus
            )}`
        );
        if (this.state.immediateUpdate) {
            switch (syncStatus) {
                case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
                    this.syncMessage = "Checking for update";
                    break;
                case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
                    this.syncMessage = "Downloading package";
                    break;
                case CodePush.SyncStatus.AWAITING_USER_ACTION:
                    this.syncMessage = "Awaiting user action";
                    break;
                case CodePush.SyncStatus.INSTALLING_UPDATE:
                    this.syncMessage = "Installing update";
                    break;
                case CodePush.SyncStatus.UP_TO_DATE:
                    this.syncMessage = "App up to date.";
                    break;
                case CodePush.SyncStatus.UPDATE_IGNORED:
                    this.syncMessage = "Update cancelled by user";
                    break;
                case CodePush.SyncStatus.UPDATE_INSTALLED:
                    this.syncMessage = "Update installed and will be applied on restart.";
                    break;
                case CodePush.SyncStatus.UNKNOWN_ERROR:
                    this.syncMessage = "An unknown error occurred";
                    Toast.fail("更新出错，请重启应用！");
                    this.setState({ modalVisible: false });
                    break;
            }
        }
    }

    codePushDownloadDidProgress(progress) {
        if (this.state.immediateUpdate) {
            console.log(this.currProgress);
            this.currProgress = parseFloat(
                progress.receivedBytes / progress.totalBytes
            ).toFixed(2);
            if (this.currProgress >= 1) {
                console.log("更新完成");
                this.setState({ modalVisible: false });
            } else {
                console.log(this.refs.progressBar.progress);
                this.refs.progressBar.progress = this.currProgress;
            }
        }
    }

    syncImmediate() {
        CodePush.checkForUpdate().then(update => {
            console.log(update);
            if (!update) {
                // Toast.success("已是最新版本！");
            } else {
                this.setState({
                    modalVisible: true, //弹出更新窗口
                    updateInfo: update, //更新信息
                    isMandatory: update.isMandatory //是否强制更新
                });
            }
        });
    }

    componentWillMount() {
        //由于安装了CodePush更新，暂时不允许任何程序重启。
        CodePush.disallowRestart();
        // 异步检查是否有更新包
        if (this.props.update) {
            this.syncImmediate();
        }
    }

    componentDidMount() {
        //在加载完了，允许重启
        CodePush.allowRestart();
    }

    _immediateUpdate() {
        console.log("执行了_immediateUpdate()方法");
        this.setState({ immediateUpdate: true }, () => {
            CodePush.sync(
                { installMode: CodePush.InstallMode.IMMEDIATE },
                // codepush状态的变化的钩子函数
                this.codePushStatusDidChange.bind(this),
                // codepush下载更新包的进度钩子函数
                this.codePushDownloadDidProgress.bind(this)
            );
        });
    }

    renderModal() {
        return (
            <Modal
                animationType={"none"}
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => {}}
            >
                <View style={styles.modal}>
                    <View style={styles.modalContainer}>
                        {!this.state.immediateUpdate ? (
                            <View>
                                <View
                                    style={{
                    backgroundColor: "#FFF",
                    borderRadius: 10
                  }}
                                >
                                    <View
                                        style={{
                      borderBottomWidth: 1,
                      borderColor: "#EEE",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 8,
                      flexDirection: "row"
                    }}
                                    >
                                        <Text
                                            style={{
                        fontSize: 25,
                        fontWeight: "900",
                        marginLeft: 10,
                        color: "#0e80d2"
                      }}
                                        >
                                            新版本
                                        </Text>
                                    </View>
                                    <View style={{ marginHorizontal: 15 }}>
                                        <Text
                                            style={{
                        marginVertical: 20,
                        fontSize: 15,
                        color: "#555",
                        fontWeight: "bold"
                      }}
                                        >
                                            更新内容
                                        </Text>
                                        <Text style={{ lineHeight: 20 }}>
                                            {this.state.updateInfo.description}
                                        </Text>
                                    </View>
                                    <View style={{ alignItems: "center", marginTop: 20 }}>
                                        <Text style={{ fontSize: 13, color: "#999" }}>
                                            wifi情况下更新不到30秒
                                        </Text>
                                    </View>
                                    {!this.state.isMandatory ? (
                                        <View
                                            style={{
                        flexDirection: "row",
                        height: 50,
                        alignItems: "center",
                        marginTop: 10,
                        borderTopColor: "#EEE",
                        borderTopWidth: 1
                      }}
                                        >
                                            <TouchableOpacity
                                                onPress={() => this.setState({ modalVisible: false })}
                                            >
                                                <View
                                                    style={{
                            flexDirection: "row",
                            width: (width - 60) / 2,
                            height: 50,
                            borderRightColor: "#eee",
                            borderRightWidth: 1,
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                                                >
                                                    <Icon name={"ban"} size={20} color={"#B6B6B6"} />
                                                    <Text
                                                        style={{
                              fontSize: 17,
                              fontWeight: "bold",
                              color: "#999",
                              marginLeft: 10
                            }}
                                                    >
                                                        残忍拒绝
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={{
                          flexDirection: "row",
                          width: (width - 60) / 2,
                          height: 50,
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                                                onPress={() => {
                          this._immediateUpdate();
                        }}
                                            >
                                                <View
                                                    style={{
                            backgroundColor: "#3496FA",
                            flex: 1,
                            height: 40,
                            alignItems: "center",
                            justifyContent: "center",
                            margin: 10,
                            borderRadius: 20,
                            flexDirection: "row"
                          }}
                                                >
                                                    <Icon
                                                        name={"arrow-circle-up"}
                                                        size={20}
                                                        color={"#FFF"}
                                                    />
                                                    <Text
                                                        style={{
                              fontSize: 17,
                              color: "#FFF",
                              fontWeight: "bold",
                              marginLeft: 10
                            }}
                                                    >
                                                        极速下载
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View
                                            style={{
                        flexDirection: "row",
                        height: 60,
                        alignItems: "center",
                        marginTop: 20,
                        borderTopColor: "#EEE",
                        borderTopWidth: 1,
                        width: width - 60
                      }}
                                        >
                                            <TouchableOpacity
                                                style={{
                          flexDirection: "row",
                          width:width - 60,
                          height: 50,
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                                                onPress={() => {
                          this._immediateUpdate();
                        }}
                                            >
                                                <View
                                                    style={{
                            backgroundColor: "#3496FA",
                            flex: 1,
                            height: 40,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 20,
                            marginHorizontal: 40
                          }}
                                                >
                                                    <Text
                                                        style={{
                              fontSize: 17,
                              color: "#FFF",
                              fontWeight: "bold"
                            }}
                                                    >
                                                        立即更新
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ) : (
                            <View
                                style={{
                  backgroundColor: "#FFF",
                  borderRadius: 10
                }}
                            >
                                <View
                                    style={{
                    width:width - 60,
                    borderBottomWidth: 1,
                    borderColor: "#EEE",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 8,
                    flexDirection: "row"
                  }}
                                >
                                    <Text
                                        style={{
                      fontSize: 25,
                      fontWeight: "900",
                      marginLeft: 10,
                      color: "#0e80d2"
                    }}
                                    >
                                        新版本
                                    </Text>
                                </View>
                                <View
                                    style={{
                    paddingVertical: 10,
                    margin: 10,
                    marginHorizontal: 15,
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                                >
                                    <Progress
                                        ref="progressBar"
                                        progressColor={"#89C0FF"}
                                        style={{
                      marginTop: 20,
                      height: 10,
                      width:width - 100,
                      backgroundColor: "gray",
                      borderRadius: 10
                    }}
                                    />
                                    <View style={{ alignItems: "center", marginVertical: 20 }}>
                                        <Text style={{ fontSize: 14, color: "#999" }}>
                                            版本正在努力更新中，请等待
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        );
    }

    render() {
        return <View style={styles.container}>{this.renderModal()}</View>;
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center"
    },
    modal: {
        height:height,
        width: width,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.3)"
    },
    modalContainer: {
        marginHorizontal: 60,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    }
});

export default CodePush(codePushOptions)(ProgressBar);
