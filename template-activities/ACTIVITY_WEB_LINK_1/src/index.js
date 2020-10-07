var ACTIVITY_WEB_LINK_1 = {};
ACTIVITY_WEB_LINK_1.Tag = {
}
ACTIVITY_WEB_LINK_1.socketEventKey = {
}
ACTIVITY_WEB_LINK_1.ref = null;
ACTIVITY_WEB_LINK_1.WebLinkLayer = HDBaseLayer.extend({
    isTeacherView: false,
    interactableObject:null,
    customTexture:null,

    ctor: function () {
        this._super();
    },

    onEnter: function () {
        this._super();
        ACTIVITY_WEB_LINK_1.ref = this;
        cc.loader.loadJson("res/Activity/ACTIVITY_WEB_LINK_1/config.json", function (error, config) {
            ACTIVITY_WEB_LINK_1.config = config;
            ACTIVITY_WEB_LINK_1.resourcePath = "res/Activity/" + "ACTIVITY_WEB_LINK_1/res/"
            ACTIVITY_WEB_LINK_1.soundPath = ACTIVITY_WEB_LINK_1.resourcePath + "Sound/";
            ACTIVITY_WEB_LINK_1.animationBasePath = ACTIVITY_WEB_LINK_1.resourcePath + "AnimationFrames/";
            ACTIVITY_WEB_LINK_1.spriteBasePath = ACTIVITY_WEB_LINK_1.resourcePath + "Sprite/";
            ACTIVITY_WEB_LINK_1.ref.isTeacherView = HDAppManager.isTeacherView;

            ACTIVITY_WEB_LINK_1.ref.setupUI();
            if (ACTIVITY_WEB_LINK_1.ref.isTeacherView) {
                ACTIVITY_WEB_LINK_1.ref.updateRoomData();
                ACTIVITY_WEB_LINK_1.ref.isStudentInteractionEnable = true;
            }
        });
    },

    fetchGameData: function () {
        HDNetworkHandler.get(HDAPIKey.GameData, {"roomId": HDAppManager.roomId}, true, (err, res) => {
        });
    },

    onExit: function () {
        this._super();
        ACTIVITY_WEB_LINK_1.ref.removeAllChildrenWithCleanup(true);
        ACTIVITY_WEB_LINK_1.ref.customTexture = false;
        ACTIVITY_WEB_LINK_1.ref.interactableObject = false;
        ACTIVITY_WEB_LINK_1.ref = null;
    },

    triggerScript: function (message) {
        if (this.parent) {
            this.parent.showScriptMessage(message);
        }
    },

    triggerTip: function (message) {
        if (this.parent) {
            this.parent.showTipMessage(message.ops);
        }
    },


    setupUI: function () {
        let ui = new ccui.WebView(ACTIVITY_WEB_LINK_1.config.properties.urlInfo.url);
        ui.setPosition(cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5));
        ui.setContentSize(cc.size(this.getContentSize().width, this.getContentSize().height * 0.8));
        ui.setLocalZOrder(0);
        this.getParent().addChild(ui);
    },
    touchEventListener: function (touch, event) {
        switch (event._eventCode) {
            case cc.EventTouch.EventCode.BEGAN:
                this.onMouseDown(touch);
                break;
            case cc.EventTouch.EventCode.MOVED:
                this.onMouseMove(touch);
                break;
            case cc.EventTouch.EventCode.ENDED:
                this.onMouseUp(touch);
                break;
        }
    },

    updateRoomData: function () {
        SocketManager.emitCutomEvent("SingleEvent", {
            'eventType': HDSocketEventType.UPDATE_ROOM_DATA,
            'roomId': HDAppManager.roomId,
            'data': {
                "roomId": HDAppManager.roomId,
                "roomData": {
                    "activity": ACTIVITY_WEB_LINK_1.config.properties.namespace,
                    "data": {'dataArray': this.lineSyncData, 'slideIndex': this.curImageIdx},
                    "activityStartTime": HDAppManager.getActivityStartTime()
                }
            }
        }, null);
    },

    updateStudentInteraction: function (username, status) {
        if (this.isTeacherView) {
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                "eventType": ACTIVITY_WEB_LINK_1.socketEventKey.STUDENT_INTERACTION,
                "data": {"userName": username, "status": status}
            });
        }
    },

    onUpdateStudentInteraction: function (params) {
        if (params.userName == HDAppManager.username) {
            ACTIVITY_WEB_LINK_1.ref.isStudentInteractionEnable = params.status;
        }
    },

    mouseEventListener: function (event) {
        switch (event._eventType) {
            case cc.EventMouse.DOWN:
                this.onMouseDown(event);
                break;
            case cc.EventMouse.MOVE:
                this.onMouseMove(event);
                break;
            case cc.EventMouse.UP:
                this.onMouseUp(event);
                break;
        }
    },

    onMouseDown: function (event) {
        if (!ACTIVITY_WEB_LINK_1.ref.isStudentInteractionEnable)
            return;

    },

    onMouseUp: function (event) {
        if (!ACTIVITY_WEB_LINK_1.ref.isStudentInteractionEnable)
            return;
    },

    onMouseMove: function (event) {
        ACTIVITY_WEB_LINK_1.ref.updateMouseIcon(event.getLocation());
        if (!ACTIVITY_WEB_LINK_1.ref.isStudentInteractionEnable)
            return;
    },
    socketListener: function (res) {
        if (!ACTIVITY_WEB_LINK_1.ref)
            return;
        switch (res.eventType) {
            case HDSocketEventType.DISABLE_STUDENT_INTERACTION:
                break;
            case HDSocketEventType.DISABLE_INTERACTION:
                ACTIVITY_WEB_LINK_1.ref.disableInteraction(res.data);
                break;
            case HDSocketEventType.RECEIVE_GRADES:
                break;
            case HDSocketEventType.STUDENT_STATUS:
                ACTIVITY_WEB_LINK_1.ref.studentStatus(res.data);
                break;
            case HDSocketEventType.STUDENT_TURN:
                ACTIVITY_WEB_LINK_1.ref.studentTurn(res.data);
                break;
            case HDSocketEventType.GAME_MESSAGE:
                if (res.data.userName == HDAppManager.username || !ACTIVITY_WEB_LINK_1.ref)
                    return;
                ACTIVITY_WEB_LINK_1.ref.gameEvents(res.data);
                break;
        }
    },

    disableInteraction: function (enable) {
        this.isStudentInteractionEnable = enable;
    },

    studentTurn: function (res) {
        let users = res.users;
        if (this.isTeacherView) {
            //Check for this
        } else {
            if (users.length == 0) {
                this.isStudentInteractionEnable = false;
                return;
            }
            for (let index = 0; index < users.length; index++) {
                let obj = users[index];
                if (obj.userName == HDAppManager.username) {
                    this.isStudentInteractionEnable = true;
                    break;
                } else {
                    this.isStudentInteractionEnable = false;
                }
            }
        }
    },
    updateStudentTurn: function (userName) {
        // cc.log(userName);
        if (this.isTeacherView) {
            if (!userName) {
                this.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_TEACHER, {
                    "roomId": HDAppManager.roomId,
                    "users": []
                });
            } else {
                this.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_TEACHER, {
                    "roomId": HDAppManager.roomId,
                    "users": [{userName: userName}]
                });
            }
        }
    },

    studentStatus: function (data) {
        if (this.isTeacherView) {
            this.joinedStudentList = [];
            this.joinedStudentList = data;
        }

    },

    gameEvents: function (res) {
        if (!ACTIVITY_WEB_LINK_1.ref)
            return;
        switch (res.eventType) {
            case ACTIVITY_WEB_LINK_1.socketEventKey.STUDENT_INTERACTION:
                this.onUpdateStudentInteraction(res.data);
                break;
        }
    },

    /**
     * Emit socket event
     * @param eventType
     * @param data
     */
    emitSocketEvent: function (eventType, data) {
        data.userName = HDAppManager.username;
        let dataObj = {
            "eventType": eventType,
            "data": data,
            "roomId": HDAppManager.roomId,
        }
        SocketManager.emitCutomEvent(HDSingleEventKey, dataObj);
    },

    syncData: function (data) {
        ACTIVITY_WEB_LINK_1.ref.syncDataInfo = data;
    },


    buttonCallback: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                switch (sender.getTag()) {

                }
                break;

        }
    },

    mouseControlEnable: function (location) {
        return this.interactableObject;
    },

    /**
     *  Return a Bool if custom texture has to be show on mouse cursor.
     *  This will be called by parent app.
     * @returns {{textureUrl: (null|string), hasCustomTexture: boolean}}
     */
    mouseTexture: function () {
        return {'hasCustomTexture': this.customTexture, 'textureUrl': this.MouseTextureUrl};
    },

    /**
     * Update Mouse texture
     * @param location: Mouse location
     * It checks if A handIcon need to show or custom texture.
     * This method will be called by Parent Activity
     */
    updateMouseIcon: function (location) {
        // let handICon = false
        // for (let obj of this.handIconUI) {
        //     if (cc.rectContainsPoint(obj.getBoundingBox(), obj.getParent().convertToNodeSpace(location))) {
        //         handICon = true;
        //         break;
        //     }
        // }
        // if (handICon) {
        //     this.interactableObject = true;
        //     this.customTexture = false;
        // }
    },
});