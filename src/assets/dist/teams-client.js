var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { CallClient, LocalVideoStream, VideoStreamRenderer } from '@azure/communication-calling';
import { ChatClient } from '@azure/communication-chat';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
var TeamsClient = (function () {
    function TeamsClient(token, communicationUserId, chatEndpointUrl, chatInput, chatContainer, callButton, hangUpButton, stopVideoButton, startVideoButton, remoteVideoContainer, localVideoContainer, displayName) {
        this.token = token;
        this.displayName = displayName;
        this.communicationUserId = communicationUserId;
        this.chatEndpointUrl = chatEndpointUrl;
        this.chatInput = chatInput;
        this.chatContainer = chatContainer;
        this.callButton = callButton;
        this.hangUpButton = hangUpButton;
        this.stopVideoButton = stopVideoButton;
        this.startVideoButton = startVideoButton;
        this.remoteVideoContainer = remoteVideoContainer;
        this.localVideoContainer = localVideoContainer;
    }
    TeamsClient.prototype.initChatClient = function (topic) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenCredential, createChatThreadRequest, createChatThreadOptions, createChatThreadResult, threadId;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tokenCredential = new AzureCommunicationTokenCredential(this.token);
                        this.chatClient = new ChatClient(this.chatEndpointUrl, tokenCredential);
                        createChatThreadRequest = {
                            topic: topic
                        };
                        createChatThreadOptions = {
                            participants: [{ id: { communicationUserId: this.communicationUserId }, displayName: this.displayName }]
                        };
                        return [4, this.chatClient.createChatThread(createChatThreadRequest, createChatThreadOptions)];
                    case 1:
                        createChatThreadResult = _a.sent();
                        threadId = createChatThreadResult.chatThread.id;
                        this.chatThreadClient = this.chatClient.getChatThreadClient(threadId);
                        this.chatClient.startRealtimeNotifications();
                        this.chatClient.on('chatMessageReceived', function (e) {
                            var wrapper = document.createElement('div');
                            var name = document.createElement('span');
                            var time = document.createElement('time');
                            var message = document.createElement('span');
                            var datetimeAttribute = document.createAttribute('datetime');
                            name.className = 'name';
                            name.innerText = e.senderDisplayName;
                            datetimeAttribute.value = e.createdOn.toISOString();
                            time.className = 'time';
                            time.attributes.setNamedItem(datetimeAttribute);
                            time.innerText = e.createdOn.toLocaleTimeString();
                            message.className = 'message';
                            if (e.type === 'Text') {
                                message.innerText = e.message;
                            }
                            else {
                                message.innerHTML = e.message;
                            }
                            wrapper.className = 'remote';
                            wrapper.appendChild(name);
                            wrapper.appendChild(time);
                            wrapper.appendChild(message);
                            _this.chatContainer.appendChild(wrapper);
                        });
                        this.chatInput.addEventListener('keyup', function (e) { return __awaiter(_this, void 0, void 0, function () {
                            var sendMessageRequest, sendMessageOptions, sendChatMessageResult;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (e.key !== 'Enter' || e.shiftKey) {
                                            return [2];
                                        }
                                        e.preventDefault();
                                        sendMessageRequest = {
                                            content: this.chatInput.value
                                        };
                                        sendMessageOptions = {
                                            senderDisplayName: this.displayName,
                                            type: 'html'
                                        };
                                        return [4, this.chatThreadClient.sendMessage(sendMessageRequest, sendMessageOptions)];
                                    case 1:
                                        sendChatMessageResult = _a.sent();
                                        return [2];
                                }
                            });
                        }); });
                        return [2];
                }
            });
        });
    };
    TeamsClient.prototype.initCallClient = function () {
        return __awaiter(this, void 0, void 0, function () {
            var callClient, tokenCredential, _a, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        callClient = new CallClient();
                        tokenCredential = new AzureCommunicationTokenCredential(this.token);
                        _a = this;
                        return [4, callClient.createCallAgent(tokenCredential, {
                                displayName: this.displayName
                            })];
                    case 1:
                        _a.callAgent = _c.sent();
                        _b = this;
                        return [4, callClient.getDeviceManager()];
                    case 2:
                        _b.deviceManager = _c.sent();
                        this.callAgent.on('incomingCall', function (e) { return __awaiter(_this, void 0, void 0, function () {
                            var videoDevices, videoDeviceInfo, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4, this.deviceManager.getCameras()];
                                    case 1:
                                        videoDevices = _b.sent();
                                        videoDeviceInfo = videoDevices[0];
                                        this.localVideoStream = new LocalVideoStream(videoDeviceInfo);
                                        this.localVideoView();
                                        this.stopVideoButton.disabled = false;
                                        this.callButton.disabled = true;
                                        this.hangUpButton.disabled = false;
                                        _a = this;
                                        return [4, e.incomingCall.accept({
                                                videoOptions: { localVideoStreams: [this.localVideoStream] }
                                            })];
                                    case 2:
                                        _a.call = _b.sent();
                                        this.subscribeToRemoteParticipantInCall(this.call);
                                        return [2];
                                }
                            });
                        }); });
                        this.callAgent.on('callsUpdated', function (e) {
                            e.removed.forEach(function (removedCall) {
                                _this.rendererLocal.dispose();
                                _this.rendererRemote.dispose();
                                _this.hangUpButton.disabled = true;
                                _this.callButton.disabled = false;
                                _this.stopVideoButton.disabled = true;
                            });
                        });
                        this.callButton.addEventListener('click', function () { return __awaiter(_this, void 0, void 0, function () {
                            var videoDevices, videoDeviceInfo;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, this.deviceManager.getCameras()];
                                    case 1:
                                        videoDevices = _a.sent();
                                        videoDeviceInfo = videoDevices[0];
                                        this.localVideoStream = new LocalVideoStream(videoDeviceInfo);
                                        this.placeCallOptions = { videoOptions: { localVideoStreams: [this.localVideoStream] } };
                                        this.localVideoView();
                                        this.stopVideoButton.disabled = false;
                                        this.startVideoButton.disabled = true;
                                        this.call = this.callAgent.startCall([
                                            { communicationUserId: this.communicationUserId }
                                        ], this.placeCallOptions);
                                        this.subscribeToRemoteParticipantInCall(this.call);
                                        this.hangUpButton.disabled = false;
                                        this.callButton.disabled = true;
                                        return [2];
                                }
                            });
                        }); });
                        this.stopVideoButton.addEventListener('click', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, this.call.stopVideo(this.localVideoStream)];
                                    case 1:
                                        _a.sent();
                                        this.rendererLocal.dispose();
                                        this.startVideoButton.disabled = false;
                                        this.stopVideoButton.disabled = true;
                                        return [2];
                                }
                            });
                        }); });
                        this.startVideoButton.addEventListener('click', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, this.call.startVideo(this.localVideoStream)];
                                    case 1:
                                        _a.sent();
                                        this.localVideoView();
                                        this.startVideoButton.disabled = true;
                                        this.stopVideoButton.disabled = false;
                                        return [2];
                                }
                            });
                        }); });
                        this.hangUpButton.addEventListener('click', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        this.rendererLocal.dispose();
                                        this.rendererRemote.dispose();
                                        return [4, this.call.hangUp()];
                                    case 1:
                                        _a.sent();
                                        this.hangUpButton.disabled = true;
                                        this.callButton.disabled = false;
                                        this.stopVideoButton.disabled = true;
                                        return [2];
                                }
                            });
                        }); });
                        return [2];
                }
            });
        });
    };
    TeamsClient.prototype.localVideoView = function () {
        return __awaiter(this, void 0, void 0, function () {
            var view;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.localVideoContainer) return [3, 2];
                        this.rendererLocal = new VideoStreamRenderer(this.localVideoStream);
                        return [4, this.rendererLocal.createView()];
                    case 1:
                        view = _a.sent();
                        this.localVideoContainer.appendChild(view.target);
                        _a.label = 2;
                    case 2: return [2];
                }
            });
        });
    };
    TeamsClient.prototype.remoteVideoView = function () {
        return __awaiter(this, void 0, void 0, function () {
            var view;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.rendererRemote = new VideoStreamRenderer(this.remoteVideoStream);
                        return [4, this.rendererRemote.createView()];
                    case 1:
                        view = _a.sent();
                        this.remoteVideoContainer.appendChild(view.target);
                        return [2];
                }
            });
        });
    };
    TeamsClient.prototype.subscribeToRemoteParticipantInCall = function (callInstance) {
        var _this = this;
        callInstance.on('remoteParticipantsUpdated', function (e) {
            e.added.forEach(function (p) {
                _this.subscribeToParticipantVideoStreams(p);
            });
        });
        callInstance.remoteParticipants.forEach(function (p) {
            _this.subscribeToParticipantVideoStreams(p);
        });
    };
    TeamsClient.prototype.subscribeToParticipantVideoStreams = function (remoteParticipant) {
        var _this = this;
        remoteParticipant.on('videoStreamsUpdated', function (e) {
            e.added.forEach(function (v) {
                _this.handleVideoStream(v);
            });
        });
        remoteParticipant.videoStreams.forEach(function (v) {
            _this.handleVideoStream(v);
        });
    };
    TeamsClient.prototype.handleVideoStream = function (remoteVideoStream) {
        var _this = this;
        remoteVideoStream.on('isAvailableChanged', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (remoteVideoStream.isAvailable) {
                    this.remoteVideoView();
                }
                else {
                    this.rendererRemote.dispose();
                }
                return [2];
            });
        }); });
        if (remoteVideoStream.isAvailable) {
            this.remoteVideoView();
        }
    };
    return TeamsClient;
}());
export default TeamsClient;
