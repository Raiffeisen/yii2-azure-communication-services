import {
    Call,
    CallAgent,
    CallClient,
    DeviceManager,
    LocalVideoStream,
    RemoteParticipant,
    RemoteVideoStream,
    StartCallOptions,
    VideoDeviceInfo,
    VideoStreamRenderer
} from '@azure/communication-calling';
import {
    ChatClient,
    ChatThreadClient,
    CreateChatThreadOptions,
    CreateChatThreadRequest, CreateChatThreadResult, SendChatMessageResult, SendMessageOptions, SendMessageRequest
} from '@azure/communication-chat';
import {AzureCommunicationTokenCredential} from '@azure/communication-common';

/**
 * Create a new teams clients
 */
class TeamsClient {
    private readonly communicationUserId: string;
    private readonly chatEndpointUrl: string;
    private readonly chatInput: HTMLInputElement | HTMLTextAreaElement;
    private readonly chatContainer: HTMLElement;
    private readonly callButton: HTMLButtonElement;
    private readonly hangUpButton: HTMLButtonElement;
    private readonly stopVideoButton: HTMLButtonElement;
    private readonly startVideoButton: HTMLButtonElement;
    private readonly remoteVideoContainer: HTMLElement;
    private readonly localVideoContainer: HTMLElement | undefined;

    private readonly token: string;
    private readonly displayName: string | undefined;

    private chatClient: ChatClient;
    private chatThreadClient: ChatThreadClient;

    private call: Call;
    private callAgent: CallAgent;
    private deviceManager: DeviceManager;
    private placeCallOptions: StartCallOptions;
    private remoteVideoStream: RemoteVideoStream;
    private localVideoStream: LocalVideoStream;
    private rendererRemote: VideoStreamRenderer;
    private rendererLocal: VideoStreamRenderer;

    /**
     * Create a new Teams Client
     * @param {string} token The users access token
     * @param {string} communicationUserId The communication user id to contact
     * @param {string} chatEndpointUrl The endpoint url for chat functions (https://<RESOURCE>.communication.azure.com)
     * @param {HTMLInputElement|HTMLTextAreaElement} chatInput The input where the user can enter his chat message
     * @param {HTMLElement} chatContainer The element which holds the sent and received chat messages
     * @param {HTMLButtonElement} callButton An HTML button element to use as call button
     * @param {HTMLButtonElement} hangUpButton An HTML button element to use as hang up button
     * @param {HTMLButtonElement} stopVideoButton An HTML button element to use to stop the local video
     * @param {HTMLButtonElement} startVideoButton An HTML button element to use to start the local video
     * @param {HTMLElement} remoteVideoContainer An HTML element where the remote video gets rendered
     * @param {?HTMLElement} localVideoContainer An HTML element where the local video gets rendered
     * @param {?string} displayName The display name of the contact
     */
    constructor(
        token: string,
        communicationUserId: string,
        chatEndpointUrl: string,
        chatInput: HTMLInputElement | HTMLTextAreaElement,
        chatContainer: HTMLElement,
        callButton: HTMLButtonElement,
        hangUpButton: HTMLButtonElement,
        stopVideoButton: HTMLButtonElement,
        startVideoButton: HTMLButtonElement,
        remoteVideoContainer: HTMLElement,
        localVideoContainer: HTMLElement | undefined,
        displayName: string | undefined
    )
    {
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

    /**
     *
     * @param {string} topic The chat's topic
     */
    public async initChatClient(topic: string)
    {
        const tokenCredential = new AzureCommunicationTokenCredential(this.token);
        this.chatClient = new ChatClient(this.chatEndpointUrl, tokenCredential);

        const createChatThreadRequest: CreateChatThreadRequest = {
            topic: topic
        };
        const createChatThreadOptions: CreateChatThreadOptions = {
            participants: [{id: {communicationUserId: this.communicationUserId}, displayName: this.displayName}]
        };
        const createChatThreadResult: CreateChatThreadResult = await this.chatClient.createChatThread(
            createChatThreadRequest,
            createChatThreadOptions
        );
        const threadId = createChatThreadResult.chatThread.id;
        this.chatThreadClient = this.chatClient.getChatThreadClient(threadId);

        this.chatClient.startRealtimeNotifications();

        this.chatClient.on('chatMessageReceived', e => {
            const wrapper = document.createElement('div');
            const name = document.createElement('span');
            const time = document.createElement('time');
            const message = document.createElement('span');
            const datetimeAttribute = document.createAttribute('datetime');
            name.className = 'name';
            name.innerText = e.senderDisplayName;
            datetimeAttribute.value = e.createdOn.toISOString();
            time.className = 'time';
            time.attributes.setNamedItem(datetimeAttribute);
            time.innerText = e.createdOn.toLocaleTimeString();
            message.className = 'message';
            if (e.type === 'Text') {
                message.innerText = e.message;
            } else {
                message.innerHTML = e.message;
            }
            wrapper.className = 'remote';
            wrapper.appendChild(name);
            wrapper.appendChild(time);
            wrapper.appendChild(message);
            this.chatContainer.appendChild(wrapper);
        });
        this.chatInput.addEventListener('keyup', async(e: KeyboardEvent) => {
            if (e.key !== 'Enter' || e.shiftKey) {
                return;
            }

            e.preventDefault();
            const sendMessageRequest: SendMessageRequest = {
                content: this.chatInput.value
            };
            const sendMessageOptions: SendMessageOptions = {
                senderDisplayName: this.displayName,
                type: 'html'
            };

            const sendChatMessageResult: SendChatMessageResult = await this.chatThreadClient.sendMessage(sendMessageRequest, sendMessageOptions);

        });
    }

    /**
     * Initialize function
     * @public
     */
    public async initCallClient()
    {
        const callClient = new CallClient();
        const tokenCredential = new AzureCommunicationTokenCredential(this.token);
        this.callAgent = await callClient.createCallAgent(tokenCredential, {
            displayName: this.displayName
        });
        this.deviceManager = await callClient.getDeviceManager();

        this.callAgent.on('incomingCall', async e => {
            const videoDevices: VideoDeviceInfo[] = await this.deviceManager.getCameras();
            const videoDeviceInfo: VideoDeviceInfo = videoDevices[0];

            this.localVideoStream = new LocalVideoStream(videoDeviceInfo);
            this.localVideoView();

            this.stopVideoButton.disabled = false;
            this.callButton.disabled = true;
            this.hangUpButton.disabled = false;

            this.call = await e.incomingCall.accept({
                videoOptions: {localVideoStreams: [this.localVideoStream]}
            });

            this.subscribeToRemoteParticipantInCall(this.call);
        });
        this.callAgent.on('callsUpdated', e => {
            e.removed.forEach(removedCall => {
                this.rendererLocal.dispose();
                this.rendererRemote.dispose();
                this.hangUpButton.disabled = true;
                this.callButton.disabled = false;
                this.stopVideoButton.disabled = true;
            });
        });

        this.callButton.addEventListener('click', async () => {
            const videoDevices: VideoDeviceInfo[] = await this.deviceManager.getCameras();
            const videoDeviceInfo: VideoDeviceInfo = videoDevices[0];

            this.localVideoStream = new LocalVideoStream(videoDeviceInfo);
            this.placeCallOptions = {videoOptions: {localVideoStreams: [this.localVideoStream]}};
            this.localVideoView();

            this.stopVideoButton.disabled = false;
            this.startVideoButton.disabled = true;

            this.call = this.callAgent.startCall([
                {communicationUserId: this.communicationUserId}
            ], this.placeCallOptions);

            this.subscribeToRemoteParticipantInCall(this.call);

            this.hangUpButton.disabled = false;
            this.callButton.disabled = true;
        });
        this.stopVideoButton.addEventListener('click', async () => {
            await this.call.stopVideo(this.localVideoStream);
            this.rendererLocal.dispose();
            this.startVideoButton.disabled = false;
            this.stopVideoButton.disabled = true;
        });
        this.startVideoButton.addEventListener('click', async () => {
            await this.call.startVideo(this.localVideoStream);
            this.localVideoView();
            this.startVideoButton.disabled = true;
            this.stopVideoButton.disabled = false;
        });
        this.hangUpButton.addEventListener('click', async () => {
            this.rendererLocal.dispose();
            this.rendererRemote.dispose();
            await this.call.hangUp();
            this.hangUpButton.disabled = true;
            this.callButton.disabled = false;
            this.stopVideoButton.disabled = true;
        });
    }

    /**
     * Renders the local video view if local container is available
     * @private
     */
    private async localVideoView()
    {
        if (this.localVideoContainer) {
            this.rendererLocal = new VideoStreamRenderer(this.localVideoStream);
            const view = await this.rendererLocal.createView();
            this.localVideoContainer.appendChild(view.target);
        }
    }

    /**
     * Renders the remote video view
     * @private
     */
    private async remoteVideoView()
    {
        this.rendererRemote = new VideoStreamRenderer(this.remoteVideoStream);
        const view = await this.rendererRemote.createView();
        this.remoteVideoContainer.appendChild(view.target);
    }

    /**
     * Subscribe to remote participant in call
     * @param {Call} callInstance
     * @private
     */
    private subscribeToRemoteParticipantInCall(callInstance: Call)
    {
        callInstance.on('remoteParticipantsUpdated', e => {
            e.added.forEach(p => {
                this.subscribeToParticipantVideoStreams(p);
            });
        });

        callInstance.remoteParticipants.forEach(p => {
            this.subscribeToParticipantVideoStreams(p);
        });
    }

    /**
     * Subscribe to remote participants video streams in call
     * @param {RemoteParticipant} remoteParticipant
     * @private
     */
    private subscribeToParticipantVideoStreams(remoteParticipant: RemoteParticipant)
    {
        remoteParticipant.on('videoStreamsUpdated', e => {
            e.added.forEach(v => {
                this.handleVideoStream(v);
            });
        });
        remoteParticipant.videoStreams.forEach(v => {
            this.handleVideoStream(v);
        });
    }

    /**
     * Handling remote participants video strems
     * @param {RemoteVideoStream} remoteVideoStream
     * @private
     */
    private handleVideoStream(remoteVideoStream: RemoteVideoStream)
    {
        remoteVideoStream.on('isAvailableChanged', async () => {
            if (remoteVideoStream.isAvailable) {
                this.remoteVideoView();
            } else {
                this.rendererRemote.dispose();
            }
        });
        if (remoteVideoStream.isAvailable) {
            this.remoteVideoView();
        }
    }
}

export default TeamsClient;
