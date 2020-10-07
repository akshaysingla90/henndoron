var ACTIVITY_FLASHLIGHT_1 = {};
ACTIVITY_FLASHLIGHT_1.Tag = {
    circleTag: 10000,
    tickButton: 9103,
    cancelButton: 9104,
    teacherCircle: 9200,
}

ACTIVITY_FLASHLIGHT_1.socketEventKey = {
    ADD_CIRCLE: 1,
    MOVE_CIRCLE: 2,
    FREEZE_ALL_CIRCLE: 3,
    UNFREEZE_ALL_CIRCLE: 4,
    STUDENT_INTERACTION: 5,
}

ACTIVITY_FLASHLIGHT_1.animation = {
    idle: 1,
    move_left: 2,
    move_right: 3,
    celebration: 4,
}

ACTIVITY_FLASHLIGHT_1.ref = null;
ACTIVITY_FLASHLIGHT_1.Flashlight = HDBaseLayer.extend({
    self: null,
    playGround: null,
    isTeacherView: false,
    isStudentInteractionEnable: false,
    joinedStudentList: [],
    selectedColor: cc.color(255, 0, 0, 255),
    masK: null,
    circle: null,
    circleSyncData: [],
    previousPosition: null,
    circleList: [],
    previousPositionList: [],
    storedData: null,
    animationSprite: null,
    currentPosition: null,
    isCircleFreeze: false,
    freezePosition: cc.p(0, 0),
    teacherCircle: null,
    mouseStatus: [],
    teacherPreviousPosition: null,
    circleClicked: false,

    ctor: function () {
        this._super();
    },

    onEnter: function () {
        this._super();
        ACTIVITY_FLASHLIGHT_1.ref = this;
        let activityName = 'ACTIVITY_FLASHLIGHT_1';
        cc.loader.loadJson("res/Activity/" + activityName + "/config.json", function (error, config) {
            ACTIVITY_FLASHLIGHT_1.config = config;
            ACTIVITY_FLASHLIGHT_1.resourcePath = "res/Activity/" + "" + activityName + "/res/"
            ACTIVITY_FLASHLIGHT_1.soundPath = ACTIVITY_FLASHLIGHT_1.resourcePath + "Sound/";
            ACTIVITY_FLASHLIGHT_1.animationBasePath = ACTIVITY_FLASHLIGHT_1.resourcePath + "AnimationFrames/";
            ACTIVITY_FLASHLIGHT_1.spriteBasePath = ACTIVITY_FLASHLIGHT_1.resourcePath + "Sprite/";
            ACTIVITY_FLASHLIGHT_1.ref.isTeacherView = HDAppManager.isTeacherView;
            ACTIVITY_FLASHLIGHT_1.ref.isStudentInteractionEnable = false;
            ACTIVITY_FLASHLIGHT_1.ref.setupUI();
            ACTIVITY_FLASHLIGHT_1.ref.circleList.length = 0;
            if (ACTIVITY_FLASHLIGHT_1.ref.storedData) {
                ACTIVITY_FLASHLIGHT_1.ref.syncData(ACTIVITY_FLASHLIGHT_1.ref.storedData)
            }

            if (ACTIVITY_FLASHLIGHT_1.ref.isTeacherView && !ACTIVITY_FLASHLIGHT_1.ref.storedData) {
                ACTIVITY_FLASHLIGHT_1.ref.updateRoomData({
                    "freezeInfo": {"position": "", "name": ""},
                    "circleData": this.circleSyncData
                });
            }
            ACTIVITY_FLASHLIGHT_1.ref.loadSpriteFrames();
            ACTIVITY_FLASHLIGHT_1.config.teacherScripts.data[0].enable && ACTIVITY_FLASHLIGHT_1.ref.triggerScript(ACTIVITY_FLASHLIGHT_1.config.teacherScripts.data[0].content.ops);
            if(ACTIVITY_FLASHLIGHT_1.config.teacherTips.data[0].enable) {
                ACTIVITY_FLASHLIGHT_1.ref.triggerTip(ACTIVITY_FLASHLIGHT_1.config.teacherTips.data[0].content.ops);
            }
        });
    },

    onExit: function () {
        this._super();
        ACTIVITY_FLASHLIGHT_1.ref.circleList.forEach(circle => circle.removeFromParent());
        ACTIVITY_FLASHLIGHT_1.ref.mouseStatus.length = 0;
        ACTIVITY_FLASHLIGHT_1.ref.circleList.length = 0;
        if (ACTIVITY_FLASHLIGHT_1.ref.circle) {
            ACTIVITY_FLASHLIGHT_1.ref.circle.removeFromParent();
            ACTIVITY_FLASHLIGHT_1.ref.circle = null;
        }
        if (ACTIVITY_FLASHLIGHT_1.ref.masK) {
            ACTIVITY_FLASHLIGHT_1.ref.masK.removeAllChildrenWithCleanup(true);
            ACTIVITY_FLASHLIGHT_1.ref.masK.removeFromParent();
            ACTIVITY_FLASHLIGHT_1.ref.masK = null;
        }
        if (ACTIVITY_FLASHLIGHT_1.ref.teacherCircle) {
            ACTIVITY_FLASHLIGHT_1.ref.teacherCircle.removeFromParent();
            ACTIVITY_FLASHLIGHT_1.ref.teacherCircle = null;
        }
        ACTIVITY_FLASHLIGHT_1.ref.removeButton();
        ACTIVITY_FLASHLIGHT_1.ref = null;
    },

    triggerScript: function (message) {
        if (this.parent) {
            this.parent.showScriptMessage(message);
        }
    },
    triggerTip: function (message) {
        if (this.parent) {
            this.parent.showTipMessage(message);
        }
    },

    setupUI: function () {
        this.backgroundWithControl();
        if (this.isTeacherView) {
            this.animationSprite = this.addSprite("res/LessonResources/emptyImage.png", cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5), this);
            this.animationSprite.setLocalZOrder(2);
            this.animationSprite.setScale(ACTIVITY_FLASHLIGHT_1.config.resources.animationSprite.scale);
            this.playAnimation();
            this.createTeacherCircle();
        }

        if (!this.isTeacherView) {
            this.addCircle();
        }
    },
    backgroundWithControl: function () {
        this.playGround = this.addSprite(ACTIVITY_FLASHLIGHT_1.spriteBasePath + ACTIVITY_FLASHLIGHT_1.config.background.sections.background.imageName, cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5), this);
        this.playGround.setLocalZOrder(-2);
    },


    loadSpriteFrames: function () {
        HDUtility.addSpriteFrames(ACTIVITY_FLASHLIGHT_1.animationPath + "Granny_Fix_celebrating/celebrating_", ACTIVITY_FLASHLIGHT_1.config.resources.animationFrames.animation[0].frameCount, "celebrating_", ".png");
        HDUtility.addSpriteFrames(ACTIVITY_FLASHLIGHT_1.animationPath + "Granny_Fix_idle/idle_", ACTIVITY_FLASHLIGHT_1.config.resources.animationFrames.animation[1].frameCount, "idle_", ".png");
        HDUtility.addSpriteFrames(ACTIVITY_FLASHLIGHT_1.animationPath + "Granny_Fix_run_left/run_left_", ACTIVITY_FLASHLIGHT_1.config.resources.animationFrames.animation[2].frameCount, "run_left_", ".png");
        HDUtility.addSpriteFrames(ACTIVITY_FLASHLIGHT_1.animationPath + "Granny_Fix_run_right/run_right_", ACTIVITY_FLASHLIGHT_1.config.resources.animationFrames.animation[3].frameCount, "run_right_", ".png");
    },

    updateRoomData: function (data) {
        if (ACTIVITY_FLASHLIGHT_1.config) {
            SocketManager.emitCutomEvent("SingleEvent", {
                'eventType': HDSocketEventType.UPDATE_ROOM_DATA,
                'roomId': HDAppManager.roomId,
                'data': {
                    "roomId": HDAppManager.roomId,
                    "roomData": {
                        "activity": ACTIVITY_FLASHLIGHT_1.config.properties.namespace,
                        "data": data,
                        "activityStartTime": HDAppManager.getActivityStartTime()
                    }
                }
            }, null);
        }
    },

    mouseEventListener: function (event) {
        switch (event._eventType) {
            case cc.EventMouse.DOWN:
                ACTIVITY_FLASHLIGHT_1.ref.circleClicked = true;
                break;
            case cc.EventMouse.MOVE:
                ACTIVITY_FLASHLIGHT_1.ref.circleClicked = false;
                if ((ACTIVITY_FLASHLIGHT_1.ref.isStudentInteractionEnable && (!ACTIVITY_FLASHLIGHT_1.ref.isCircleFreeze)) || (ACTIVITY_FLASHLIGHT_1.ref.teacherCircle && ACTIVITY_FLASHLIGHT_1.ref.teacherCircle.isVisible() && (!ACTIVITY_FLASHLIGHT_1.ref.isCircleFreeze))) {
                    ACTIVITY_FLASHLIGHT_1.ref.moveCircle(ACTIVITY_FLASHLIGHT_1.ref.convertToNodeSpace(event.getLocation()));
                }
                break;
            case cc.EventMouse.UP:
                if (ACTIVITY_FLASHLIGHT_1.ref.circleClicked && ACTIVITY_FLASHLIGHT_1.ref.teacherCircle && ACTIVITY_FLASHLIGHT_1.ref.teacherCircle.isVisible() &&
                    cc.rectContainsPoint(ACTIVITY_FLASHLIGHT_1.ref.teacherCircle.getBoundingBox(), ACTIVITY_FLASHLIGHT_1.ref.teacherCircle.parent.convertToNodeSpace(event.getLocation()))) {
                    ACTIVITY_FLASHLIGHT_1.ref.buttonCallback(ACTIVITY_FLASHLIGHT_1.ref.teacherCircle, ccui.Widget.TOUCH_ENDED);
                } else {
                    for (let index in ACTIVITY_FLASHLIGHT_1.ref.circleList) {
                        var circle = ACTIVITY_FLASHLIGHT_1.ref.circleList[index];
                        if (ACTIVITY_FLASHLIGHT_1.ref.circleClicked && !ACTIVITY_FLASHLIGHT_1.ref.teacherCircle.isVisible() &&
                            cc.rectContainsPoint(circle.getBoundingBox(), circle.parent.convertToNodeSpace(event.getLocation()))) {
                            ACTIVITY_FLASHLIGHT_1.ref.buttonCallback(circle, ccui.Widget.TOUCH_ENDED);
                            break;
                        }
                    }
                }
                break;
        }
    },

    touchEventListener: function (touch, event) {
        switch (event.getEventCode()) {
            case cc.EventTouch.EventCode.BEGAN:
                ACTIVITY_FLASHLIGHT_1.ref.circleClicked = true;
                break;
            case cc.EventTouch.EventCode.MOVED:
                ACTIVITY_FLASHLIGHT_1.ref.circleClicked = false;
                if ((ACTIVITY_FLASHLIGHT_1.ref.isStudentInteractionEnable && (!ACTIVITY_FLASHLIGHT_1.ref.isCircleFreeze)) || (ACTIVITY_FLASHLIGHT_1.ref.teacherCircle && ACTIVITY_FLASHLIGHT_1.ref.teacherCircle.isVisible() && (!ACTIVITY_FLASHLIGHT_1.ref.isCircleFreeze))) {
                    ACTIVITY_FLASHLIGHT_1.ref.moveCircle(ACTIVITY_FLASHLIGHT_1.ref.convertToNodeSpace(touch.getLocation()));
                }
                break;
            case cc.EventTouch.EventCode.ENDED:
                if (ACTIVITY_FLASHLIGHT_1.ref.circleClicked && ACTIVITY_FLASHLIGHT_1.ref.teacherCircle && ACTIVITY_FLASHLIGHT_1.ref.teacherCircle.isVisible() &&
                    cc.rectContainsPoint(ACTIVITY_FLASHLIGHT_1.ref.teacherCircle.getBoundingBox(), ACTIVITY_FLASHLIGHT_1.ref.teacherCircle.parent.convertToNodeSpace(touch.getLocation()))) {
                    ACTIVITY_FLASHLIGHT_1.ref.buttonCallback(ACTIVITY_FLASHLIGHT_1.ref.teacherCircle, ccui.Widget.TOUCH_ENDED);
                } else {
                    for (let index in ACTIVITY_FLASHLIGHT_1.ref.circleList) {
                        var circle = ACTIVITY_FLASHLIGHT_1.ref.circleList[index];
                        if (ACTIVITY_FLASHLIGHT_1.ref.circleClicked && !ACTIVITY_FLASHLIGHT_1.ref.teacherCircle.isVisible() &&
                            cc.rectContainsPoint(circle.getBoundingBox(), circle.parent.convertToNodeSpace(touch.getLocation()))) {
                            ACTIVITY_FLASHLIGHT_1.ref.buttonCallback(circle, ccui.Widget.TOUCH_ENDED);
                            break;
                        }
                    }
                }
                break;
        }
    },

    socketListener: function (res) {
        if (!ACTIVITY_FLASHLIGHT_1.ref)
            return;
        switch (res.eventType) {
            case HDSocketEventType.DISABLE_STUDENT_INTERACTION:
                break;
            case HDSocketEventType.DISABLE_INTERACTION:
                ACTIVITY_FLASHLIGHT_1.ref.disableInteraction(res.data);
                break;
            case HDSocketEventType.RECEIVE_GRADES:
                break;
            case HDSocketEventType.STUDENT_STATUS:
                ACTIVITY_FLASHLIGHT_1.ref.studentStatus(res.data);
                break;
            case HDSocketEventType.STUDENT_TURN:
                ACTIVITY_FLASHLIGHT_1.ref.studentTurn(res.data);
                break;
            case HDSocketEventType.GAME_MESSAGE:
                ACTIVITY_FLASHLIGHT_1.ref.gameEvents(res.data);
                break;
        }
    },

    gameEvents: function (res) {
        if (!ACTIVITY_FLASHLIGHT_1.ref)
            return;
        switch (res.eventType) {
            case ACTIVITY_FLASHLIGHT_1.socketEventKey.ADD_CIRCLE:
                if (this.isTeacherView) {
                    this.addStudentCircle(res.data);
                }
                break;
            case ACTIVITY_FLASHLIGHT_1.socketEventKey.MOVE_CIRCLE:
                this.moveCircleListener(res);
                break;
            case ACTIVITY_FLASHLIGHT_1.socketEventKey.FREEZE_ALL_CIRCLE:
                this.freezeCircle(res.data);
                break;
            case ACTIVITY_FLASHLIGHT_1.socketEventKey.UNFREEZE_ALL_CIRCLE:
                this.unFreezeCircle(res.data);
                break;
            case ACTIVITY_FLASHLIGHT_1.socketEventKey.STUDENT_INTERACTION:
                this.onUpdateStudentInteraction(res.data);
                break;
        }
    },


    disableInteraction: function (enable) {
        this.isStudentInteractionEnable = enable;
    },
    updateStudentInteraction: function (username, status) {
        if (this.isTeacherView) {
            this.updateMouseStatus(username, status);
            this.checkToShowTeacherCircle();
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                "eventType": ACTIVITY_FLASHLIGHT_1.socketEventKey.STUDENT_INTERACTION,
                "data": {"userName": username, "status": status}
            });
        }
    },

    updateMouseStatus: function (username, status) {
        if (status && ACTIVITY_FLASHLIGHT_1.ref.mouseStatus.indexOf(username) == -1) {
            ACTIVITY_FLASHLIGHT_1.ref.mouseStatus.push(username);
        } else if (!status && ACTIVITY_FLASHLIGHT_1.ref.mouseStatus.indexOf(username) != -1) {
            ACTIVITY_FLASHLIGHT_1.ref.mouseStatus.splice(ACTIVITY_FLASHLIGHT_1.ref.mouseStatus.indexOf(username), 1);
        }
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
        if (this.isTeacher) {
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

    onUpdateStudentInteraction: function (params) {
        if (params && params.userName == HDAppManager.username) {
            ACTIVITY_FLASHLIGHT_1.ref.isStudentInteractionEnable = params.status;
            if (ACTIVITY_FLASHLIGHT_1.ref.isStudentInteractionEnable && !ACTIVITY_FLASHLIGHT_1.ref.isTeacherView) {
                var position = ACTIVITY_FLASHLIGHT_1.ref.teacherPreviousPosition ? ACTIVITY_FLASHLIGHT_1.ref.teacherPreviousPosition : cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5);
                ACTIVITY_FLASHLIGHT_1.ref.circle.setPosition(position);
                ACTIVITY_FLASHLIGHT_1.ref.teacherPreviousPosition = null;
            } else {
                ACTIVITY_FLASHLIGHT_1.ref.teacherPreviousPosition = ACTIVITY_FLASHLIGHT_1.ref.circle.getPosition();
            }
        }
    },

    studentStatus: function (data) {
        if (this.isTeacherView) {
            this.joinedStudentList = [];
            this.joinedStudentList = data;
            this.updateStudentCircle();
            for (let index in data.users) {
                let user = data.users[index];
                if (user.userName === HDAppManager.username)
                    continue;
            }
        }
        if (data.users.length == 1 || ACTIVITY_FLASHLIGHT_1.ref.isTeacherLeft(data)) {
            ACTIVITY_FLASHLIGHT_1.ref.unFreezeCircle();
            ACTIVITY_FLASHLIGHT_1.ref.isCircleFreeze = false;
            ACTIVITY_FLASHLIGHT_1.ref.removeButton();
            this.circleSyncData.length = 0;
            ACTIVITY_FLASHLIGHT_1.ref.updateRoomData({
                "freezeInfo": {"position": "", "name": ""},
                "circleData": this.circleSyncData
            });
        }

    },

    removeButton: function () {
        if (this.getParent().getChildByTag(ACTIVITY_FLASHLIGHT_1.Tag.cancelButton))
            this.getParent().getChildByTag(ACTIVITY_FLASHLIGHT_1.Tag.cancelButton).removeFromParent();
        if (this.getParent().getChildByTag(ACTIVITY_FLASHLIGHT_1.Tag.tickButton))
            this.getParent().getChildByTag(ACTIVITY_FLASHLIGHT_1.Tag.tickButton).removeFromParent();
    },

    checkToShowTeacherCircle: function () {
        var show = (this.mouseStatus.length == 0);
        if (ACTIVITY_FLASHLIGHT_1.ref.teacherCircle) {
            ACTIVITY_FLASHLIGHT_1.ref.teacherCircle.setVisible(show);
            for (let index in this.circleList) {
                this.circleList[index].setVisible(!show);
            }
        }
    },

    isTeacherLeft: function (data) {
        let teacherId = data.teacherId;
        let usersArr = data.users.map(user => user.userId);
        return (usersArr.indexOf(teacherId) == -1 ? true : false);

    },

    /**
     * Move circle with mouse and emit an event for teacher
     * @param position
     */
    moveCircle: function (position) {
        var fromTeacher = false;
        if (this.isTeacherView && this.teacherCircle && this.teacherCircle.isVisible()) {
            fromTeacher = true;
            this.teacherCircle.setPosition(HDUtility.clampANumber(position.x, this.teacherCircle.getContentSize().width * 0.5, this.getContentSize().width - this.teacherCircle.getContentSize().width * 0.5), HDUtility.clampANumber(position.y, this.teacherCircle.getContentSize().height * 0.5, this.getContentSize().height - this.teacherCircle.getContentSize().height * 0.5));
        } else {
            this.circle.setPosition(HDUtility.clampANumber(position.x, this.circle.getContentSize().width * 0.5, this.getContentSize().width - this.circle.getContentSize().width * 0.5), HDUtility.clampANumber(position.y, this.circle.getContentSize().height * 0.5, this.getContentSize().height - this.circle.getContentSize().height * 0.5));
        }
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            'eventType': ACTIVITY_FLASHLIGHT_1.socketEventKey.MOVE_CIRCLE,
            'data': {'userName': HDAppManager.userName, 'position': position, "fromTeacher": fromTeacher}
        });
    },

    /**
     * FreeAllCircle emits an event for students
     * @param position: freezing position
     * @param studentName name of freezed student.
     */
    freezeAllCircle: function (position, studentName) {
        this.freezePosition = position;
        if (ACTIVITY_FLASHLIGHT_1.ref.parent)
            ACTIVITY_FLASHLIGHT_1.ref.parent.setStudentPanelActive(false);
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            'eventType': ACTIVITY_FLASHLIGHT_1.socketEventKey.FREEZE_ALL_CIRCLE,
            'data': {'userName': studentName, 'position': position}
        });
        this.updateRoomData({
            "freezeInfo": {"position": position, "studentName": studentName},
            "circleData": this.circleSyncData
        });
    },

    unFreezeAllCircle: function (position, studentName, isCorrect) {
        this.updateRoomData({"circleData": this.circleSyncData});
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            'eventType': ACTIVITY_FLASHLIGHT_1.socketEventKey.UNFREEZE_ALL_CIRCLE,
            'data': {'userName': studentName, 'position': position, "isCorrect": isCorrect}
        });
    },

    freezeCircle: function (params) {
        if (ACTIVITY_FLASHLIGHT_1.ref.isTeacherView || !ACTIVITY_FLASHLIGHT_1.ref.circle) {
            return;
        }
        this.isCircleFreeze = true;
        this.previousPosition = this.circle.getPosition();
        this.circle.runAction(cc.sequence(cc.moveTo(0.5,
            cc.p(HDUtility.clampANumber(params.position.x, this.circle.getContentSize().width * 0.75,
                this.getContentSize().width - this.circle.getContentSize().width * 0.75),
                HDUtility.clampANumber(params.position.y, this.circle.getContentSize().height * 0.74,
                    this.getContentSize().height - this.circle.getContentSize().height * 0.75))),
            cc.scaleTo(0.25, 1.5)));
    },

    unFreezeCircle: function (params) {
        if (ACTIVITY_FLASHLIGHT_1.ref.isTeacherView || !ACTIVITY_FLASHLIGHT_1.ref.circle || !ACTIVITY_FLASHLIGHT_1.ref.isCircleFreeze) {
            return;
        }
        this.currentPosition = params ? params.position : cc.p(ACTIVITY_FLASHLIGHT_1.ref.circle.getPositionY(),
            ACTIVITY_FLASHLIGHT_1.ref.circle.getPositionY());
        this.unfreezeCircle(params ? params.isCorrect : false);
    },

    updateStudentCircle: function () {
        var removeCircleList = [];

        for (let index = 0; index < this.circleList.length; index++) {
            var currentCircle = this.circleList[index];
            var isPresent = false;
            for (let indexUser = 0; indexUser < this.joinedStudentList.users.length; indexUser++) {
                var currentUser = this.joinedStudentList.users[indexUser];
                if (currentUser.userName == currentCircle.getName()) {
                    isPresent = true;
                    break;
                }
            }
            if (!isPresent) {
                removeCircleList.push(currentCircle);
            }
        }

        if (removeCircleList.length > 0) {
            for (let indexCircle = 0; indexCircle < removeCircleList.length; indexCircle++) {
                var circle = removeCircleList[indexCircle];
                circle.removeFromParent();
                this.circleList.splice(this.circleList.indexOf(circle), 1);
            }
        }
    },

    addStudentCircle: function (params) {
        if (this.checkIfAlreadyPresent(params.username)) {
            return;
        }
        let position = params.position ? params.position : cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5);
        var circle = this.createButton(ACTIVITY_FLASHLIGHT_1.spriteBasePath + 'redCircle.png', ACTIVITY_FLASHLIGHT_1.spriteBasePath + 'redCircle.png', params.username, 14, 0, position, this.getParent(), this, ACTIVITY_FLASHLIGHT_1.spriteBasePath + 'redCircle.png');
        circle.setTitleColor(cc.color(0, 0, 0, 255));
        circle.setLocalZOrder(11);
        circle.setName(params.username);
        circle.prevPos = this.circle ? this.circle.getPosition() : cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5);
        circle.tag = ACTIVITY_FLASHLIGHT_1.Tag.circleTag;
        this.circleList.push(circle);
        circle.setTitleText(params.username ? params.username : "");
        if (this.isCircleFreeze && this.isTeacherView) {
            circle.setScale(1.5);
            circle.setPosition(cc.p(HDUtility.clampANumber(this.freezePosition.x, circle.getContentSize().width * 0.75,
                this.getContentSize().width - circle.getContentSize().width * 0.75),
                HDUtility.clampANumber(this.freezePosition.y, circle.getContentSize().height * 0.70,
                    this.getContentSize().height - circle.getContentSize())));
            var name = this.circle ? this.circle.getName() : "";
            circle.setTitleText(name);
            circle.setLocalZOrder(1000);
        }
        if (!this.isTeacherView || (this.isTeacherView && !this.isCircleFreeze)) {
            this.circle = circle;
        }
        ACTIVITY_FLASHLIGHT_1.ref.checkToShowTeacherCircle();
    },

    createTeacherCircle: function () {
        if (this.isTeacherView) {
            this.teacherCircle = this.createButton(ACTIVITY_FLASHLIGHT_1.spriteBasePath + 'redCircle.png', ACTIVITY_FLASHLIGHT_1.spriteBasePath + 'redCircle.png', HDAppManager.username, 14, ACTIVITY_FLASHLIGHT_1.Tag.teacherCircle, cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5), this, this, ACTIVITY_FLASHLIGHT_1.spriteBasePath + 'redCircle.png');
            this.teacherCircle.setTitleColor(cc.color(0, 0, 0, 255));
            this.teacherCircle.setName(HDAppManager.username);
            this.teacherCircle.setLocalZOrder(5);
            this.teacherCircle.setTitleText(HDAppManager.username);
            this.checkToShowTeacherCircle();
            this.teacherCircle.setTouchEnabled(false);
        }
    },

    checkIfAlreadyPresent: function (username) {
        if (!this.joinedStudentList.users) {
            return false;
        }
        for (let index = 0; index < this.joinedStudentList.users.length; index++) {
            var currentObj = this.joinedStudentList.users[index];
            if (currentObj.userName == username && this.getChildByName(username)) {
                var circle = this.getChildByName(username);
                circle.setPosition(cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5));
                return true;
            }
        }
        return false;
    },

    moveCircleListener: function (params) {
        if (params.data.fromTeacher) {
            if (!this.isTeacherView && this.circle) {
                this.circle.setPosition(HDUtility.clampANumber(params.data.position.x, this.circle.getContentSize().width * 0.5, this.getContentSize().width - this.circle.getContentSize().width * 0.5), HDUtility.clampANumber(params.data.position.y, this.circle.getContentSize().height * 0.5, this.getContentSize().height - this.circle.getContentSize().height * 0.48));

            }
        } else {
            let circle = this.getParent().getChildByName(params.userName);
            if (circle) {
                circle.prevPos = params.data.position;
                if (!this.isCircleFreeze) {
                    circle.setPosition(HDUtility.clampANumber(params.data.position.x, this.circle.getContentSize().width * 0.5, this.getContentSize().width - this.circle.getContentSize().width * 0.5), HDUtility.clampANumber(params.data.position.y, this.circle.getContentSize().height * 0.5, this.getContentSize().height - this.circle.getContentSize().height * 0.48));
                }
            }
            this.updateCircleData();
        }
    },

    updateCircleData: function () {
        this.circleSyncData.length = 0;
        for (let index = 0; index < this.circleList.length; index++) {
            var circle = this.circleList[index];
            let data = {"username": circle.getName(), "position": circle.getPosition()};
            if (!this.alreadyPresent(data.username)) {
                this.circleSyncData.push(data);
            }
        }
        this.updateRoomData({"circleData": this.circleSyncData});
    },

    alreadyPresent: function (username) {
        for (let index = 0; index < this.circleSyncData.length; index++) {
            if (username == this.circleSyncData[index].username) {
                return true;
            }
        }
        return false;
    },

    addCircle: function (position) {
        //userName
        this.circle = this.addSprite(ACTIVITY_FLASHLIGHT_1.spriteBasePath + 'circle.png', cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5), this);
        this.circle.setName(HDAppManager.username);
        this.circle.setLocalZOrder(8);
        this.playGround.removeFromParent();
        let blackImage = new cc.Sprite(ACTIVITY_FLASHLIGHT_1.spriteBasePath + "blackImage.png");
        this.masK = new cc.ClippingNode(blackImage);
        this.masK.setAlphaThreshold(0.0);
        this.masK.addChild(this.playGround);
        this.masK.setContentSize(cc.size(this.getContentSize().width, this.getContentSize().height));
        this.masK.stencil = this.circle;
        let positionNew = position ? position : cc.p(0, 0);
        this.masK.setPosition(positionNew);
        this.animationSprite = this.addSprite("res/LessonResources/emptyImage.png", cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5), this.masK);
        this.animationSprite.setLocalZOrder(2);
        this.animationSprite.setScale(ACTIVITY_FLASHLIGHT_1.config.resources.animationSprite.scale);
        this.addChild(this.masK, 5);
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            'eventType': ACTIVITY_FLASHLIGHT_1.socketEventKey.ADD_CIRCLE,
            'data': {'username': HDAppManager.username, "position": this.circle.getPosition()}
        });
    },

    emitSocketEvent: function (eventType, data) {
        data.userName = HDAppManager.username;
        let dataObj = {
            "eventType": eventType,
            "data": data,
            "roomId": HDAppManager.roomId,
        }
        SocketManager.emitCutomEvent(HDSingleEventKey, dataObj);
    },

    syncData: function (syncData) {
        let data = syncData.circleData;
        if (!ACTIVITY_FLASHLIGHT_1.config) {
            ACTIVITY_FLASHLIGHT_1.ref.storedData = syncData;
            return;
        }
        if (data) {
            ACTIVITY_FLASHLIGHT_1.ref.circleSyncData.length = 0;
            ACTIVITY_FLASHLIGHT_1.ref.circleSyncData = data;
            if (ACTIVITY_FLASHLIGHT_1.ref.isTeacherView) {
                for (let index = 0; index < data.length; index++) {
                    ACTIVITY_FLASHLIGHT_1.ref.addStudentCircle(data[index]);
                }
            } else {
                for (let index = 0; index < data.length; index++) {
                    if (data[index].username == HDAppManager.username) {
                        if (this.masK) {
                            ACTIVITY_FLASHLIGHT_1.ref.moveCircle(data[index].position);
                        } else {
                            ACTIVITY_FLASHLIGHT_1.ref.addCircle(data[index].position)
                        }
                        break;
                    }
                }
            }
            ACTIVITY_FLASHLIGHT_1.ref.storedData = null;
        }
        if (syncData.freezeInfo) {
            ACTIVITY_FLASHLIGHT_1.ref.isCircleFreeze = syncData.freezeInfo.name == "" ? false : true;
            ACTIVITY_FLASHLIGHT_1.ref.freezePosition = syncData.freezeInfo.position;
        }
        if (!ACTIVITY_FLASHLIGHT_1.ref.isTeacherView && ACTIVITY_FLASHLIGHT_1.ref.isCircleFreeze) {
            ACTIVITY_FLASHLIGHT_1.ref.freezeCircle({"position": ACTIVITY_FLASHLIGHT_1.ref.freezePosition});
        }
    },

    buttonCallback: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                switch (sender.getTag()) {
                    case ACTIVITY_FLASHLIGHT_1.Tag.Draw:
                        this.erasing = false;
                        break;
                    case ACTIVITY_FLASHLIGHT_1.Tag.circleTag:
                        if (ACTIVITY_FLASHLIGHT_1.ref.isTeacherView && (!ACTIVITY_FLASHLIGHT_1.ref.isCircleFreeze) && (!ACTIVITY_FLASHLIGHT_1.ref.teacherCircle.isVisible())) {
                            this.isCircleFreeze = true;
                            this.freezeAllCircle(sender.getPosition(), sender.getName());
                            this.freezeAllCirclesSprite(sender.getPosition(), sender);
                            this.addOptionButton(sender);
                        }
                        break;
                    case ACTIVITY_FLASHLIGHT_1.Tag.tickButton:
                        if (ACTIVITY_FLASHLIGHT_1.ref.isTeacherView) {
                            this.currentPosition = this.teacherCircle.isVisible() ? this.teacherCircle.getPosition() : this.circleList[0].getPosition();
                            this.unFreezeAllCircle(this.currentPosition, sender.getName(), true);
                            this.removeOptionButton(sender);
                            this.unfreezeCircle(true);

                        }
                        break;
                    case ACTIVITY_FLASHLIGHT_1.Tag.cancelButton:
                        if (ACTIVITY_FLASHLIGHT_1.ref.isTeacherView) {
                            this.currentPosition = this.teacherCircle.isVisible() ? this.teacherCircle.getPosition() : this.circleList[0].getPosition();
                            this.unFreezeAllCircle(this.currentPosition, sender.getName(), false);
                            this.removeOptionButton(sender);
                            this.unfreezeCircle(false);
                        }
                        break;
                    case ACTIVITY_FLASHLIGHT_1.Tag.teacherCircle:
                        if (ACTIVITY_FLASHLIGHT_1.ref.isTeacherView && (!ACTIVITY_FLASHLIGHT_1.ref.isCircleFreeze) && (ACTIVITY_FLASHLIGHT_1.ref.teacherCircle.isVisible())) {
                            this.isCircleFreeze = true;
                            this.teacherCircle.runAction(cc.sequence(cc.moveTo(0.5,
                                cc.p(HDUtility.clampANumber(this.teacherCircle.getPosition().x, this.teacherCircle.getContentSize().width * 0.75,
                                    this.getContentSize().width - this.teacherCircle.getContentSize().width * 0.75),
                                    HDUtility.clampANumber(this.teacherCircle.getPosition().y, this.teacherCircle.getContentSize().height * 0.74,
                                        this.getContentSize().height - this.teacherCircle.getContentSize().height * 0.75))),
                                cc.scaleTo(0.25, 1.5)));
                            this.freezeAllCircle(sender.getPosition(), sender.getName());
                            this.freezeAllCirclesSprite(sender.getPosition(), sender);
                            this.addOptionButton(sender);
                        }
                        break;
                }
                break;
        }
    },

    addOptionButton: function (sender) {
        ACTIVITY_FLASHLIGHT_1.config.teacherScripts.data[1].enable && this.triggerScript(ACTIVITY_FLASHLIGHT_1.config.teacherScripts.data[1].content.ops);

        sender.setTouchEnabled(false);
        this.circle = sender;
        this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc((sender) => {
            if (!ACTIVITY_FLASHLIGHT_1.ref.circle) {
                return;
            }
            var tick = ACTIVITY_FLASHLIGHT_1.ref.createButton(ACTIVITY_FLASHLIGHT_1.spriteBasePath + ACTIVITY_FLASHLIGHT_1.config.assets.sections.tick.imageName, ACTIVITY_FLASHLIGHT_1.spriteBasePath + ACTIVITY_FLASHLIGHT_1.config.assets.sections.tick.imageName, "", 48, ACTIVITY_FLASHLIGHT_1.Tag.tickButton, cc.p(ACTIVITY_FLASHLIGHT_1.ref.circle.getPositionX() + ACTIVITY_FLASHLIGHT_1.ref.circle.getContentSize().width * 0.15, ACTIVITY_FLASHLIGHT_1.ref.circle.getPositionY() - (ACTIVITY_FLASHLIGHT_1.ref.circle.getContentSize().height * 0.5)), ACTIVITY_FLASHLIGHT_1.ref.getParent(), ACTIVITY_FLASHLIGHT_1.ref, ACTIVITY_FLASHLIGHT_1.spriteBasePath + ACTIVITY_FLASHLIGHT_1.config.assets.sections.tick.imageName);
            var cancel = ACTIVITY_FLASHLIGHT_1.ref.createButton(ACTIVITY_FLASHLIGHT_1.spriteBasePath + ACTIVITY_FLASHLIGHT_1.config.assets.sections.cross.imageName, ACTIVITY_FLASHLIGHT_1.spriteBasePath + ACTIVITY_FLASHLIGHT_1.config.assets.sections.cross.imageName, "", 48, ACTIVITY_FLASHLIGHT_1.Tag.cancelButton, cc.p(ACTIVITY_FLASHLIGHT_1.ref.circle.getPositionX() - ACTIVITY_FLASHLIGHT_1.ref.circle.getContentSize().width * 0.15, ACTIVITY_FLASHLIGHT_1.ref.circle.getPositionY() - (ACTIVITY_FLASHLIGHT_1.ref.circle.getContentSize().height * 0.5)), ACTIVITY_FLASHLIGHT_1.ref.getParent(), ACTIVITY_FLASHLIGHT_1.ref, ACTIVITY_FLASHLIGHT_1.spriteBasePath + ACTIVITY_FLASHLIGHT_1.config.assets.sections.cross.imageName);
            tick.setLocalZOrder(12);
            cancel.setLocalZOrder(12);
            tick.setScale(ACTIVITY_FLASHLIGHT_1.config.assets.sections.tick.scale);
            cancel.setScale(ACTIVITY_FLASHLIGHT_1.config.assets.sections.cross.scale);
        }, this)));
    },

    removeOptionButton: function (sender) {
        var options = sender.tag == ACTIVITY_FLASHLIGHT_1.Tag.tickButton ? this.getParent().getChildByTag(ACTIVITY_FLASHLIGHT_1.Tag.cancelButton) : this.getParent().getChildByTag(ACTIVITY_FLASHLIGHT_1.Tag.tickButton);
        sender.removeFromParent();
        options.removeFromParent();
        this.circle.setTouchEnabled(false);
    },

    unfreezeCircle: function (isCorrect) {
        if (Math.abs(this.animationSprite.getPositionX() - this.currentPosition.x) > 20 || (Math.abs(this.animationSprite.getPositionY() - this.currentPosition.y) > 20)) {
            if (this.animationSprite.getPositionX() - this.currentPosition.x < 0) {
                this.playAnimation(isCorrect ? [ACTIVITY_FLASHLIGHT_1.animation.move_right, ACTIVITY_FLASHLIGHT_1.animation.celebration] : [], this.currentPosition);
            } else {
                this.playAnimation(isCorrect ? [ACTIVITY_FLASHLIGHT_1.animation.move_left, ACTIVITY_FLASHLIGHT_1.animation.celebration] : [], this.currentPosition);
            }
        } else {
            this.playAnimation(isCorrect ? [ACTIVITY_FLASHLIGHT_1.animation.celebration] : [], this.currentPosition);
        }
    },

    freezeAllCirclesSprite: function (position, sender) {
        if (this.teacherCircle.isVisible()) {
            return;
        }
        this.circle = sender;
        for (var index = 0; index < this.circleList.length; index++) {
            var currentObject = this.circleList[index];
            currentObject.prevPos = currentObject.getPosition();
            currentObject.setTitleText("");
            currentObject.runAction(cc.sequence(cc.scaleTo(0.25, 1.5),
                cc.moveTo(0.25,
                    cc.p(HDUtility.clampANumber(position.x, currentObject.getContentSize().width * 0.75, this.getContentSize().width - currentObject.getContentSize().width * 0.75),
                        HDUtility.clampANumber(position.y, currentObject.getContentSize().height * 0.70, this.getContentSize().height - currentObject.getContentSize())))));
        }
        this.circle.setTitleText(this.circle.getName());
        this.currentPosition = this.teacherCircle.isVisible() ? this.teacherCircle.getPosition() : this.circle.position;
    },

    unfreezeAllCirclesSprite: function () {
        for (var index = 0; index < this.circleList.length; index++) {
            var currentObject = this.circleList[index];
            currentObject.setTitleText(currentObject.getName());
            let position = currentObject.prevPos ? currentObject.prevPos : cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5);
            currentObject.runAction(cc.sequence(cc.scaleTo(0.25, 1), cc.moveTo(0.25, position)));
        }
        this.runAction(cc.callFunc(() => {
            ACTIVITY_FLASHLIGHT_1.ref.circle.setTouchEnabled(false);
            ACTIVITY_FLASHLIGHT_1.ref.isCircleFreeze = false;
        }, this));
    },

    playAnimation: function (animationIndex, destinationPosition) {
        if (destinationPosition && destinationPosition.y >= this.getContentSize().height - 150) {
            destinationPosition = cc.p(destinationPosition.x, this.getContentSize().height - 150);
        }
        if (destinationPosition) {
            destinationPosition = cc.p(destinationPosition.x, HDUtility.clampANumber(destinationPosition.y - 90, 100, this.getContentSize().height - 240));
        }
        ACTIVITY_FLASHLIGHT_1.ref.animationSprite.setVisible(true);
        let idleAnim = HDUtility.runFrameAnimation(ACTIVITY_FLASHLIGHT_1.animationBasePath + "Granny_Fix_idle" + "/" + "idle_", ACTIVITY_FLASHLIGHT_1.config.resources.animationFrames.animation[1].frameCount, 0.05, ".png", 100000);
        idleAnim.setTag(142584);
        let actionSeq = [];
        let animation = null;
        if (animationIndex) {
            for (let index = 0; index < animationIndex.length; index++) {
                switch (animationIndex[index]) {
                    case ACTIVITY_FLASHLIGHT_1.animation.celebration:
                        animation = HDUtility.runFrameAnimation(ACTIVITY_FLASHLIGHT_1.animationBasePath + "Granny_Fix_celebrating" + "/" + "celebrating_", ACTIVITY_FLASHLIGHT_1.config.resources.animationFrames.animation[0].frameCount, 0.1, ".png", 1);
                        actionSeq.push(animation);
                        break;
                    case ACTIVITY_FLASHLIGHT_1.animation.move_left:
                        animation = HDUtility.runFrameAnimation(ACTIVITY_FLASHLIGHT_1.animationBasePath + "Granny_Fix_run_left" + "/" + "run_left_", ACTIVITY_FLASHLIGHT_1.config.resources.animationFrames.animation[2].frameCount, 0.1, ".png", 1);
                        var spawnAction = new cc.Spawn(cc.moveTo(0.75, cc.p(destinationPosition.x, destinationPosition.y)), animation);
                        actionSeq.push(spawnAction);
                        break;
                    case ACTIVITY_FLASHLIGHT_1.animation.move_right:
                        animation = HDUtility.runFrameAnimation(ACTIVITY_FLASHLIGHT_1.animationBasePath + "Granny_Fix_run_right" + "/" + "run_right_", ACTIVITY_FLASHLIGHT_1.config.resources.animationFrames.animation[3].frameCount, 0.1, ".png", 1);
                        var spawnAction = new cc.Spawn(cc.moveTo(0.75, cc.p(destinationPosition.x, destinationPosition.y)), animation);
                        actionSeq.push(spawnAction);
                        break;
                }
            }

            var completionfunction = cc.callFunc(function () {
                if (ACTIVITY_FLASHLIGHT_1.ref.isTeacherView) {
                    if (ACTIVITY_FLASHLIGHT_1.ref.parent)
                        ACTIVITY_FLASHLIGHT_1.ref.parent.setStudentPanelActive(true);
                    ACTIVITY_FLASHLIGHT_1.ref.unfreezeAllCirclesSprite();
                    if (ACTIVITY_FLASHLIGHT_1.ref.teacherCircle.isVisible()) {
                        ACTIVITY_FLASHLIGHT_1.ref.teacherCircle.runAction(cc.sequence(cc.scaleTo(0.25, 1),
                            cc.delayTime(0.1),
                            cc.callFunc(() => {
                                ACTIVITY_FLASHLIGHT_1.ref.isCircleFreeze = false;
                            }, this)));
                    }
                    if (ACTIVITY_FLASHLIGHT_1.ref.circle && ACTIVITY_FLASHLIGHT_1.ref.previousPosition) {
                        ACTIVITY_FLASHLIGHT_1.ref.circle.runAction(cc.sequence(cc.scaleTo(0.25, 1),
                            cc.moveTo(0.5, ACTIVITY_FLASHLIGHT_1.ref.previousPosition), cc.delayTime(0.1),
                            cc.callFunc(() => {
                                ACTIVITY_FLASHLIGHT_1.ref.isCircleFreeze = false;
                            }, this)));
                    }
                } else {
                    ACTIVITY_FLASHLIGHT_1.ref.animationSprite.setVisible(true);
                    if (ACTIVITY_FLASHLIGHT_1.ref.circle) {
                        ACTIVITY_FLASHLIGHT_1.ref.circle.runAction(cc.sequence(cc.scaleTo(0.25, 1),
                            cc.moveTo(0.5, ACTIVITY_FLASHLIGHT_1.ref.previousPosition), cc.delayTime(0.1),
                            cc.callFunc(() => {
                                ACTIVITY_FLASHLIGHT_1.ref.isCircleFreeze = false;
                            }, this)));
                    }
                }
            });
            actionSeq.push(completionfunction);

            var hideSprite = cc.callFunc(function () {
                if (!ACTIVITY_FLASHLIGHT_1.ref.isTeacherView) {
                    ACTIVITY_FLASHLIGHT_1.ref.animationSprite.setVisible(false);
                }
            });
            if (!ACTIVITY_FLASHLIGHT_1.ref.isTeacherView) {
                actionSeq.push(hideSprite);
            }
        }
        actionSeq.push(idleAnim);
        this.animationSprite.stopAllActions();
        this.animationSprite.runAction(new cc.Sequence(actionSeq));
    },
});