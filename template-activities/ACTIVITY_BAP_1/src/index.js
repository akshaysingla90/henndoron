var ACTIVITY_BAP_1 = {};
ACTIVITY_BAP_1.Tag = {
    lineInitialTag: 10000,
    boardInitialTag: 20000,
    PrevImage: 100,
    NextImage: 101,
    CountLabel: 102,
    Clear: 103,
    Draw: 104,
    Erase: 105,
    DrawMode: 106,
}

ACTIVITY_BAP_1.socketEventKey = {
    SHARED_MOUSE_STATUS: 1,
    PAINT_INFO: 2,
    ERASE_INFO: 3,
    CHANGE_SLIDE: 4,
    CLEAR: 5,
    DRAWING_PAUSE: 6,
    STUDENT_INTERACTION: 7,
    DRAW_MODE: 8,
}
ACTIVITY_BAP_1.ref = null;
ACTIVITY_BAP_1.intervals = [];
ACTIVITY_BAP_1.BackgroundAndPenLayer = HDBaseLayer.extend({
    self: null,
    curColor: cc.color(0, 0, 0, 0),
    penThickness: 5,
    eraserThickness: 20,
    playGround: null,
    isTeacherView: false,
    isDrawing: false,
    drawingStart: false,
    curPoint: null,
    lastPoint: null,
    lineData: [],
    lineObj: [],
    erasing: false,
    eraser: null,
    curImageIdx: 0,
    sharedPaint: true,
    isStudentInteractionEnable: false,
    joinedStudentList: [],
    lineSyncData: {},
    selectedColor: cc.color(0, 0, 0, 255),
    MouseTextureUrl: null,
    handIconUI: [],
    interactableObject: false,
    customTexture: false,
    selectedColorObject: null,
    lastImageIndex: 0,
    syncDataInfo: null,
    erasedDataForsync: [],
    lineDataForsync: [],
    drawPointArr: [],
    erasedPointArr: [],
    allLineInfo: {},
    sharedMode: true,
    isPreviewMode: false,
    previewingStudentName: "",

    ctor: function () {
        this._super();
    },

    onEnter: function () {
        this._super();
        let ref = this;
        ACTIVITY_BAP_1.ref = this;
        let activityName = 'ACTIVITY_BAP_1';
        cc.loader.loadJson("res/Activity/" + activityName + "/config.json", function (error, config) {
            ACTIVITY_BAP_1.config = config;
            ACTIVITY_BAP_1.resourcePath = "res/Activity/"+ "" + activityName + "/res/"
            ACTIVITY_BAP_1.soundPath = ACTIVITY_BAP_1.resourcePath + "Sound/";
            ACTIVITY_BAP_1.animationBasePath = ACTIVITY_BAP_1.resourcePath + "AnimationFrames/";
            ACTIVITY_BAP_1.spriteBasePath = ACTIVITY_BAP_1.resourcePath + "Sprite/";
            ref.isTeacherView = HDAppManager.isTeacherView;
            ref.setupUI();
            if (ref.isTeacherView) {
                ref.updateRoomData();
                ref.isStudentInteractionEnable = true;
            }
            config.teacherTips.data.moduleStart.enable && ref.triggerTip(config.teacherTips.data.moduleStart.content.ops);
          //   if(ACTIVITY_BAP_1.config.teacherTips.data.moduleStart.enable) {
          //       ref.triggerTip(ACTIVITY_BAP_1.config.teacherTips.data.moduleStart);
          //   }
        });
    },

    fetchGameData: function () {
        HDNetworkHandler.get(HDAPIKey.GameData, {"roomId": HDAppManager.roomId}, true, (err, res) => {
        });
    },

    onExit: function () {
        this._super();
        ACTIVITY_BAP_1.ref.clear();
        ACTIVITY_BAP_1.intervals.forEach(clearInterval);
        ACTIVITY_BAP_1.ref.customTexture = false;
        ACTIVITY_BAP_1.ref.interactableObject = false;
        ACTIVITY_BAP_1.ref = null;
    },

    triggerScript: function (message) {
        if (this.parent) {
            this.parent.showScriptMessage(message);
        }
    },
    triggerScriptByCurrentSlideIdx: function () {
            if ( ACTIVITY_BAP_1.config.teacherScripts.data["slide_"+ (this.curImageIdx + 1 )].enable) {
                let content = ACTIVITY_BAP_1.config.teacherScripts.data["slide_" + (this.curImageIdx + 1)].content.ops
                this.triggerScript(content);
            }

    },
    triggerTip: function (message) {
        if (this.parent) {
            this.parent.showTipMessage(message);
        }
    },

    onStudentPreviewCellClicked: function (studentName, status, containerRef) {
        this.isPreviewMode = status;
        this.previewingStudentName = (!status ? null : studentName);
        this.showPreview(studentName);
    },

    setupUI: function () {
        this.colorPanel();
        this.backgroundWithControl();
        this.createEraser();
        this.updateGameWithSyncData();
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

    updateGameWithSyncData() {
        if (this.syncDataInfo && this.syncDataInfo.dataArray) {
            let userNames = Object.keys(this.syncDataInfo.dataArray);
            for (var i = 0; i < userNames.length; ++i) {
                for (var j = 0; j < Object.keys(this.syncDataInfo.dataArray[eval("\"" + userNames[i] + "\"")]).length; ++j) {
                    if ((this.syncDataInfo.dataArray[eval("\"" + userNames[i] + "\"")][eval("\"" + j + "\"")])) {
                        for (var k = 0; k < (this.syncDataInfo.dataArray[eval("\"" + userNames[i] + "\"")][eval("\"" + j + "\"")]).length; ++k) {
                            ACTIVITY_BAP_1.ref.performPaint(JSON.parse(this.syncDataInfo.dataArray[eval("\"" + userNames[i] + "\"")][j][k].source),
                                JSON.parse(this.syncDataInfo.dataArray[eval("\"" + userNames[i] + "\"")][j][k].dest),
                                cc.color((this.syncDataInfo.dataArray[eval("\"" + userNames[i] + "\"")][j][k].color)),
                                eval("\"" + userNames[i] + "\""),
                                this.syncDataInfo.dataArray[eval("\"" + userNames[i] + "\"")][j][k].tag, j);
                        }
                    }
                }
            }
        }
        if (this.syncDataInfo && this.syncDataInfo.slideIndex) {
            this.updateImage(this.syncDataInfo.slideIndex)
        } else {
            this.updateImage(this.curImageIdx);
        }
        this.triggerScriptByCurrentSlideIdx();

        this.erasedDataForsync.length = 0;
        this.lineDataForsync.length = 0;
        let eraseInterval = setInterval(() => {
            if (ACTIVITY_BAP_1.ref) {
                ACTIVITY_BAP_1.ref.updateSyncData();
            }
        }, 3000)
        ACTIVITY_BAP_1.intervals.push(eraseInterval);
        let lineInterval = setInterval(() => {
            //if(ACTIVITY_BAP_1.ref && ACTIVITY_BAP_1.ref.sharedMode) {
            ACTIVITY_BAP_1.ref.updateLineData();
            // }
        }, 1000);
        ACTIVITY_BAP_1.intervals.push(lineInterval);
    },

    updateRoomData: function () {
        SocketManager.emitCutomEvent("SingleEvent", {
            'eventType': HDSocketEventType.UPDATE_ROOM_DATA,
            'roomId': HDAppManager.roomId,
            'data': {
                "roomId": HDAppManager.roomId,
                "roomData": {
                    "activity": ACTIVITY_BAP_1.config.properties.namespace,
                    "data": {'dataArray': this.lineSyncData, 'slideIndex': this.curImageIdx},
                    "activityStartTime": HDAppManager.getActivityStartTime()
                }
            }
        }, null);
    },

    updateSyncData: function () {
        this.updateLineDataForSync();
        this.updateEraseDataForSync();
    },

    updateStudentInteraction: function (username, status) {
        if (this.isTeacherView) {
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                "eventType": ACTIVITY_BAP_1.socketEventKey.STUDENT_INTERACTION,
                "data": {"userName": username, "status": status}
            });
        }
    },

    onUpdateStudentInteraction: function (params) {
        if (params.userName == HDAppManager.username) {
            ACTIVITY_BAP_1.ref.isStudentInteractionEnable = params.status;
        }
    },

    updateLineData: function () {
        if (this.drawPointArr.length > 0) {
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                "eventType": ACTIVITY_BAP_1.socketEventKey.PAINT_INFO,
                'data': [...this.drawPointArr]
            });
            this.drawPointArr.length = 0;
        }
        if (this.erasedPointArr.length > 0) {
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                "eventType": ACTIVITY_BAP_1.socketEventKey.ERASE_INFO,
                'data': [...this.erasedPointArr]
            });
            this.erasedPointArr.length = 0;
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

    reset: function () {
        this.clear();
        this.parent.setResetButtonActive(false);
    },

    onMouseDown: function (event) {
        if (!ACTIVITY_BAP_1.ref.isStudentInteractionEnable)
            return;
        if (ACTIVITY_BAP_1.ref.erasing) {
            ACTIVITY_BAP_1.ref.isErasing = true;
        } else {
            ACTIVITY_BAP_1.ref.drawingStart = true;
        }
    },

    onMouseUp: function (event) {
        if (!ACTIVITY_BAP_1.ref.isStudentInteractionEnable)
            return;
        if (ACTIVITY_BAP_1.ref.isDrawing) {
            ACTIVITY_BAP_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {'eventType': ACTIVITY_BAP_1.socketEventKey.DRAWING_PAUSE});
        }
        if (ACTIVITY_BAP_1.ref.erasing) {
            ACTIVITY_BAP_1.ref.isErasing = false;
        }
        // ACTIVITY_BAP_1.ref.isDrawing = false;
        ACTIVITY_BAP_1.ref.drawingStart = false;
        ACTIVITY_BAP_1.ref.lastPoint = null;
    },

    onMouseMove: function (event) {
        ACTIVITY_BAP_1.ref.updateMouseIcon(event.getLocation());
        if (!ACTIVITY_BAP_1.ref.isStudentInteractionEnable)
            return;
        let location = ACTIVITY_BAP_1.ref.convertToNodeSpace(event.getLocation());
        if (ACTIVITY_BAP_1.ref.drawingStart && !ACTIVITY_BAP_1.ref.erasing) {
            if (ACTIVITY_BAP_1.ref.drawingStart)
                ACTIVITY_BAP_1.ref.isDrawing = true;
            ACTIVITY_BAP_1.ref.drawPoint(location);
        } else if (ACTIVITY_BAP_1.ref.erasing && ACTIVITY_BAP_1.ref.isErasing) {
            ACTIVITY_BAP_1.ref.erasePoints(location);
        }
    },
    socketListener: function (res) {
        if (!ACTIVITY_BAP_1.ref)
            return;
        switch (res.eventType) {
            case HDSocketEventType.DISABLE_STUDENT_INTERACTION:
                break;
            case HDSocketEventType.DISABLE_INTERACTION:
                ACTIVITY_BAP_1.ref.disableInteraction(res.data);
                break;
            case HDSocketEventType.RECEIVE_GRADES:
                break;
            case HDSocketEventType.STUDENT_STATUS:
                ACTIVITY_BAP_1.ref.studentStatus(res.data);
                break;
            case HDSocketEventType.STUDENT_TURN:
                ACTIVITY_BAP_1.ref.studentTurn(res.data);
                break;
            case HDSocketEventType.GAME_MESSAGE:
                if (res.data.userName == HDAppManager.username || !ACTIVITY_BAP_1.ref)
                    return;
                ACTIVITY_BAP_1.ref.gameEvents(res.data);
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

    showPreview: function (userName) {
        if (userName) {
            this.previewingStudentName = userName
        }
        if (!this.previewingStudentName)
            return;
        let keys = Object.keys(this.allLineInfo);
        keys.forEach((user) => {
            if (ACTIVITY_BAP_1.ref.allLineInfo[user] && ACTIVITY_BAP_1.ref.allLineInfo[user][ACTIVITY_BAP_1.ref.curImageIdx]) {
                ACTIVITY_BAP_1.ref.allLineInfo[user][ACTIVITY_BAP_1.ref.curImageIdx].forEach((pixels) => {
                    if (ACTIVITY_BAP_1.ref.isPreviewMode && ACTIVITY_BAP_1.ref.isTeacherView) {
                        pixels.obj.setVisible(user == this.previewingStudentName);
                    } else if (!ACTIVITY_BAP_1.ref.isPreviewMode && ACTIVITY_BAP_1.ref.isTeacherView) {
                        if (this.sharedMode) {
                            pixels.obj.setVisible(true)
                        } else {
                            pixels.obj.setVisible(user == HDAppManager.username);
                        }
                    }
                });
            }
        });
    },

    studentStatus: function (data) {
        if (this.isTeacherView) {
            this.joinedStudentList = [];
            this.joinedStudentList = data;
            this.emitDrawModeEvent();
        }

    },

    gameEvents: function (res) {
        if (!ACTIVITY_BAP_1.ref)
            return;
        switch (res.eventType) {
            case ACTIVITY_BAP_1.socketEventKey.SHARED_MOUSE_STATUS:
                this.sharedPaint = res.data.status;
                break;
            case ACTIVITY_BAP_1.socketEventKey.PAINT_INFO:
                if (ACTIVITY_BAP_1.ref.sharedMode || (!ACTIVITY_BAP_1.ref.sharedMode && this.isTeacherView)) {
                    this.paintPeer(res.data);
                }
                break;
            case ACTIVITY_BAP_1.socketEventKey.ERASE_INFO:
                this.erase(res.data);
                break;
            case ACTIVITY_BAP_1.socketEventKey.CHANGE_SLIDE:
                this.updateImage(res.data.index);
                break;
            case ACTIVITY_BAP_1.socketEventKey.CLEAR:
                this.clear();
                ACTIVITY_BAP_1.ref.drawingStart = false;
                ACTIVITY_BAP_1.ref.lastPoint = null;
                break;
            case ACTIVITY_BAP_1.socketEventKey.DRAW_MODE:
                ACTIVITY_BAP_1.ref.sharedMode = res.data.status;
                break;
            case ACTIVITY_BAP_1.socketEventKey.DRAWING_PAUSE:
                if (!this.isDrawing) {
                    this.lastPoint = null;
                }
                break;
            case ACTIVITY_BAP_1.socketEventKey.STUDENT_INTERACTION:
                this.onUpdateStudentInteraction(res.data);
                break;
        }
    },

    colorPanel: function () {
        let colorPanel = this.addSprite(ACTIVITY_BAP_1.spriteBasePath + ACTIVITY_BAP_1.config.assets.sections.colorPaletteBase.imageName, cc.p(0, this.getContentSize().height * 0.48), this);
        colorPanel.setLocalZOrder(1000);
        colorPanel.setAnchorPoint(0, 0.5);
        this.handIconUI.push(colorPanel);
        let colorInfo = ACTIVITY_BAP_1.config.assets.sections.color.data;
        let positionInY = [0.79, 0.70, 0.61, 0.52, 0.43, 0.34, 0.25, 0.16, 0.2]
        for (let i = 0; i < colorInfo.length; ++i) {
            let button = this.createButton(ACTIVITY_BAP_1.spriteBasePath + colorInfo[i].imageName, ACTIVITY_BAP_1.spriteBasePath + colorInfo[i].imageName, "", 0, i, cc.p(colorPanel.getContentSize().width * 0.475, colorPanel.getContentSize().height * positionInY[i]), colorPanel, this);
            button.addTouchEventListener(this.selectedColorCallback, this);
            button.setScale(0.38);
            button.initialScale = 0.38;
            button.rgb = colorInfo[i].rgb;
            if (i == 0) {
                this.selectedColorCallback(button, ccui.Widget.TOUCH_ENDED)
            }
        }

        //Eraser
        let eraser = this.createButton(ACTIVITY_BAP_1.spriteBasePath + ACTIVITY_BAP_1.config.assets.sections.eraser.enableState, ACTIVITY_BAP_1.spriteBasePath + ACTIVITY_BAP_1.config.assets.sections.eraser.pushedState, "", 0, colorInfo.length, cc.p(colorPanel.getContentSize().width * 0.470, colorPanel.getContentSize().height * 0.064), colorPanel, this);
        eraser.addTouchEventListener(this.selectedColorCallback, this);
        eraser.setScaleX(0.52);
        eraser.setScaleY(0.46);
        eraser.initialScaleX = 0.52;
        eraser.initialScaleY = 0.46;
        eraser.rgb = null;
    },

    selectedColorCallback: function (sender, type) {
        sender.stopAllActions();
        if(sender.rgb) {
            sender.runAction(new cc.Sequence(new cc.ScaleTo(0.2, sender.initialScale - 0.05), new cc.ScaleTo(0.2, sender.initialScale + 0.05)));
        }else{
            sender.runAction(new cc.Sequence(new cc.ScaleTo(0.2, sender.initialScaleX - 0.05, sender.initialScaleY - 0.05), new cc.ScaleTo(0.2, sender.initialScaleX + 0.05, sender.initialScaleY + 0.05)));
        }
        // sender.runAction(new cc.Sequence(new cc.ScaleTo(0.2, sender.initialScale - 0.05), new cc.ScaleTo(0.2, sender.initialScale + 0.01)));

        if (this.selectedColorObject) {
            if(this.selectedColorObject.rgb) {
                this.selectedColorObject.setScale(this.selectedColorObject.initialScale);
            }else{
                this.selectedColorObject.setScale(this.selectedColorObject.initialScaleX, this.selectedColorObject.initialScaleY);
            }
        }
        this.selectedColorObject = sender;
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                if (sender.rgb) {
                    this.selectedColor = cc.color(sender.rgb.r, sender.rgb.g, sender.rgb.b, 255);
                    this.erasing = false;
                    this.MouseTextureUrl = ( ACTIVITY_BAP_1.spriteBasePath) + "cursor_pencil.png";
                } else{
                    this.erasing = true;
                    this.MouseTextureUrl = (  ACTIVITY_BAP_1.spriteBasePath) + "cursor_eraser.png";
                }
                break;
        }
    },

    createEraser: function () {
        this.eraser = this.addSprite(ACTIVITY_BAP_1.spriteBasePath + "eraser.png", cc.p(this.getContentSize().width * 0.6, this.getContentSize().height * 0.6), this);
        this.eraser.setScale(1);
        this.eraser.setOpacity(0);
        this.eraser.setAnchorPoint(0, 1);
        this.eraser.setLocalZOrder(100);
    },

    backgroundWithControl: function () {
        this.playGround = this.addSprite(ACTIVITY_BAP_1.spriteBasePath + ACTIVITY_BAP_1.config.background.sections.backgroundSlides.images[0], cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5), this);
        let slidIndexHeight = this.getContentSize().height * 0.88;
        if (this.isTeacherView) {
            if(ACTIVITY_BAP_1.config.background.sections.backgroundSlides.images.length > 1){
            let nextButton = this.createButton(ACTIVITY_BAP_1.spriteBasePath + ACTIVITY_BAP_1.config.buttons.data.btn_next.enableState,
                ACTIVITY_BAP_1.spriteBasePath + ACTIVITY_BAP_1.config.buttons.data.btn_next.enableState, "", 0, ACTIVITY_BAP_1.Tag.NextImage,
                cc.p(this.getContentSize().width * 0.57, slidIndexHeight), this);
            this.handIconUI.push(nextButton);
            //back
            nextButton.setScale(0.4);
            nextButton.setLocalZOrder(1000);
            let prevButton = this.createButton(ACTIVITY_BAP_1.spriteBasePath + ACTIVITY_BAP_1.config.buttons.data.btn_previous.enableState,
                ACTIVITY_BAP_1.spriteBasePath + ACTIVITY_BAP_1.config.buttons.data.btn_previous.enableState, "", 0, ACTIVITY_BAP_1.Tag.PrevImage,
                cc.p(this.getContentSize().width * 0.43, slidIndexHeight), this);
            prevButton.setScale(0.4);
            this.handIconUI.push(prevButton);
            prevButton.setLocalZOrder(1000);
            }
            let drawMode = this.createButton(ACTIVITY_BAP_1.spriteBasePath + ACTIVITY_BAP_1.config.buttons.data.drawMode.enableState,
                ACTIVITY_BAP_1.spriteBasePath + ACTIVITY_BAP_1.config.buttons.data.drawMode.enableState, "Individual Mode",
                16, ACTIVITY_BAP_1.Tag.DrawMode, cc.p(this.getContentSize().width * 0.915,
                    this.getContentSize().height * 0.15), this);
            drawMode.setTitleColor(cc.color(0, 0, 0, 255));
            // drawMode.setScale(0.7, 0.7);
            drawMode.setLocalZOrder(1000);
            drawMode.setAnchorPoint(cc.p(0.5, 0.5));
            this.handIconUI.push(drawMode);

            if(ACTIVITY_BAP_1.config.background.sections.backgroundSlides.images.length > 1)
            {
                let countLabel = this.createTTFLabel("Slide 1 of " + ACTIVITY_BAP_1.config.background.sections.backgroundSlides.images.length,
                HDConstants.Sassoon_Regular, 16, HDConstants.Black,
                cc.p(this.getContentSize().width * 0.5, slidIndexHeight), this);
                countLabel.setAnchorPoint(cc.p(0.5, 0.65));
                countLabel.setLocalZOrder(1000);
                countLabel.setTag(ACTIVITY_BAP_1.Tag.CountLabel);

            }
         
        }

        let drawNode = new cc.DrawNode();
        drawNode.setContentSize(this.playGround.getContentSize().width, this.playGround.getContentSize().height);
        drawNode.setTag(ACTIVITY_BAP_1.Tag.boardInitialTag + 0);
        drawNode.setLocalZOrder(10);
        this.addChild(drawNode);
    },
    drawPoint: function (point) {
        this.curPoint = point;
        if (!this.lastPoint) {
            this.lastPoint = point;
        } else {
            let lastPoint = this.lastPoint;
            let curPoint = this.curPoint;
            let pointArray = this.getPointsArray(lastPoint, curPoint);
            let color = this.selectedColor;
            this.paintSelf(pointArray);
        }
    },

    paintSelf: function (pointArray) {
        this.curPoint = pointArray[0];
        if (!this.lastPoint) {
            this.lastPoint = this.curPoint;
        }
        for (let i = 0; i < pointArray.length; ++i) {
            this.curPoint = pointArray[i];
            let tag = ACTIVITY_BAP_1.Tag.lineInitialTag;
            this.drawPointArr.push({
                "lastPoint": this.lastPoint,
                "curPoint": this.curPoint,
                "color": {
                    "r": this.selectedColor.r,
                    "g": this.selectedColor.g,
                    "b": this.selectedColor.b,
                    "a": this.selectedColor.a
                },
                "userName": HDAppManager.username,
                "tag": tag,
                "slideIndex": this.curImageIdx
            });
            this.performPaint(this.lastPoint, this.curPoint, this.selectedColor, HDAppManager.username, tag, this.curImageIdx);
            this.lastPoint = this.curPoint;
            ++ACTIVITY_BAP_1.Tag.lineInitialTag;
        }
    },

    performPaint: function (last, cur, color, userName, tag, imageIndex) {
        let centreX = Math.abs(cur.x - last.x) * 0.5;
        let centreY = Math.abs(cur.y - last.y) * 0.5;
        let midPointX = last.x < cur.x ? last.x + centreX : (cur.x + centreX);
        let midPointY = last.y < cur.y ? last.y + centreY : (cur.y + centreY);
        let node = new cc.DrawNode();
        node.setTag(tag);
        if (this.isTeacherView && this.isPreviewMode) {
            node.setVisible(userName == this.previewingStudentName);
        } else if (this.isTeacherView && !this.sharedMode) {
            node.setVisible(userName == HDAppManager.username);
        }
        node.drawQuadBezier(last, cc.p(midPointX, midPointY), cur, 2, this.penThickness, color);
        let imgIdx = imageIndex;
        if (!this.allLineInfo[userName]) {
            this.allLineInfo[userName] = [];
            this.allLineInfo[userName][imageIndex] = [];
        } else if (!this.allLineInfo[userName][imageIndex]) {
            this.allLineInfo[userName][imageIndex] = []
        }
        this.allLineInfo[userName][imageIndex].push({
            'obj': node,
            'info': {'tag': node.getTag(), "slideIndex": imageIndex, "userName": userName}
        });
        if (this.isTeacherView) {
            if (this.allLineInfo[userName][imageIndex].length == 1) {
                this.parent.setResetButtonActive(true);
            }
            let index = -1;
            for (let i = 0; i < this.lineDataForsync.length; ++i) {
                if (this.lineDataForsync[i] && this.lineDataForsync[i].userName == userName) {
                    index = i;
                }
            }
            if (index === -1) {
                this.lineDataForsync.push({
                    "userName": "",
                    "slideIndex": 0,
                    "data": [],
                })
                index = this.lineDataForsync.length - 1;
            }
            this.lineDataForsync[index].userName = userName;
            this.lineDataForsync[index].slideIndex = imageIndex;
            this.lineDataForsync[index].data.push({
                "tag": node.getTag(),
                "source": JSON.stringify(last),
                "dest": JSON.stringify(cur),
                "color": {"r": color.r, "g": color.g, "b": color.b, "a": color.a},
                "slideIndex": imageIndex,
                "userName": userName
            });
        }
        let drawingBoardNode = this.getChildByTag(ACTIVITY_BAP_1.Tag.boardInitialTag + imgIdx);
        if (!drawingBoardNode) {
            drawingBoardNode = new cc.DrawNode();
            drawingBoardNode.setContentSize(this.playGround.getContentSize().width, this.playGround.getContentSize().height);
            drawingBoardNode.setTag(ACTIVITY_BAP_1.Tag.boardInitialTag + imgIdx);
            drawingBoardNode.setLocalZOrder(10);
            this.addChild(drawingBoardNode);
        }
        drawingBoardNode.setVisible(imgIdx === this.curImageIdx);
        drawingBoardNode.addChild(node);


    },

    updateLineDataForSync: function () {
        if (this.isTeacherView && this.lineDataForsync.length > 0) {
            this.emitSocketEvent(HDSocketEventType.EDIT_ROOM_DATA, {
                "roomId": HDAppManager.roomId,
                "operation": 1,
                "slideIndex": this.curImageIdx,
                "arrayToPush": [...this.lineDataForsync],
            });
            this.lineDataForsync.length = 0;
        }
    },

    paintPeer: function (pointArr) {
        if (!this.sharedMode && !this.isTeacherView)
            return;
        let pointArray = pointArr;
        for (let i = 0; i < pointArray.length; ++i) {
            this.performPaint(pointArr[i].lastPoint, pointArr[i].curPoint, cc.color(pointArr[i].color), pointArr[i].userName, pointArr[i].tag, pointArr[i].slideIndex);

        }
    },

    getPointsArray: function (source, destination) {
        let count;
        let points = [];
        if (Math.abs(source.x - destination.x) > Math.abs(source.y - destination.y)) {
            count = (Math.abs(source.x - destination.x) / 5);
        } else {
            count = (Math.abs(source.y - destination.y) / 5);
        }
        let xInitial = source.x;
        let yInitial = source.y;
        for (let i = 0; i < count - 1; ++i) {
            xInitial += (destination.x - source.x) / count;
            yInitial += (destination.y - source.y) / count;
            points.push(cc.p(xInitial, yInitial));
        }
        points.push(destination);
        return points;
    },

    erasePoints: function (point) {
        this.eraser.setPosition(point.x, point.y);
        let ref = this;
        let userNames = Object.keys(this.allLineInfo);
        for (let i = 0; i < userNames.length; ++i) {
            for (let j = 0; this.allLineInfo[userNames[i]] && this.allLineInfo[userNames[i]][this.curImageIdx] && j < this.allLineInfo[userNames[i]][this.curImageIdx].length; ++j) {
                if (this.allLineInfo[userNames[i]][this.curImageIdx][j] && this.allLineInfo[userNames[i]][this.curImageIdx][j].obj) {
                    let element = this.allLineInfo[userNames[i]][this.curImageIdx][j].obj;
                    let firstElement = element._buffer[0].verts[0];
                    let lastElement = element._buffer[0].verts[element._buffer[0].verts.length - 1];
                    if (cc.rectContainsPoint(this.eraser.getBoundingBox(), firstElement) ||
                        cc.rectContainsPoint(this.eraser.getBoundingBox(), lastElement)) {
                        if (this.isTeacherView) {
                            this.insertEraseData(HDAppManager.username, element.getTag(), this.curImageIdx);
                        }
                        element.removeFromParent(true);
                        this.allLineInfo[userNames[i]][this.curImageIdx].splice(j, 1);
                        this.erasedPointArr.push({
                            "userName": userNames[i],
                            "slideIndex": this.curImageIdx,
                            "tag": element.getTag()
                        })
                    }
                }
            }
        }
    },


    erase: function (eraseArr) {
        for (let j = 0; j < eraseArr.length; ++j) {
            if (this.allLineInfo[eraseArr[j].userName] && this.allLineInfo[eraseArr[j].userName][eraseArr[j].slideIndex]) {
                for (let i = 0; i < this.allLineInfo[eraseArr[j].userName][eraseArr[j].slideIndex].length; ++i) {
                    if (this.allLineInfo[eraseArr[j].userName][eraseArr[j].slideIndex][i].obj.tag == eraseArr[j].tag) {
                        this.allLineInfo[eraseArr[j].userName][eraseArr[j].slideIndex][i].obj.removeFromParent(true);
                        this.allLineInfo[eraseArr[j].userName][eraseArr[j].slideIndex].splice(i, 1);
                        if (this.isTeacherView) {
                            this.insertEraseData(eraseArr[j].userName, eraseArr[j].tag, eraseArr[j].slideIndex);
                        }

                    }
                }
            }
        }
    },

    insertEraseData: function (userName, tag, slideIndex) {
        if (this.isTeacherView) {
            let index = -1;
            for (let i = 0; i < this.erasedDataForsync.length; ++i) {

                if (this.erasedDataForsync[i] && this.erasedDataForsync[i].userName == userName) {
                    index = i;
                }
            }
            if (index === -1) {
                this.erasedDataForsync.push({
                    "userName": "",
                    "slideIndex": 0,
                    "data": [],
                })
                index = this.erasedDataForsync.length - 1;
            }
            this.erasedDataForsync[index].userName = userName;
            this.erasedDataForsync[index].slideIndex = slideIndex;
            this.erasedDataForsync[index].data.push(tag);
        }
    },

    updateEraseDataForSync: function () {
        if (this.isTeacherView && this.erasedDataForsync.length > 0) {
            this.emitSocketEvent(HDSocketEventType.EDIT_ROOM_DATA, {
                "roomId": HDAppManager.roomId,
                "operation": 2,
                "slideIndex": this.curImageIdx,
                "arrayToPush": this.erasedDataForsync,
            });
            this.erasedDataForsync.length = 0;
        }
    },

    clear: function () {
        let userNames = Object.keys(this.allLineInfo);
        for (let i = 0; i < userNames.length; ++i) {
            while (this.allLineInfo[userNames[i]] && this.allLineInfo[userNames[i]][this.curImageIdx] && this.allLineInfo[userNames[i]][this.curImageIdx].length != 0) {
                this.allLineInfo[userNames[i]][this.curImageIdx].pop().obj.removeFromParent(true);
            }
        }
        if (this.isTeacherView) {
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {"eventType": ACTIVITY_BAP_1.socketEventKey.CLEAR});
            let keys = Object.keys(this.allLineInfo);
            let arrayToPush = [];
            for (let i = 0; i < keys.length; ++i) {
                arrayToPush.push({
                    "userName": keys[i],
                    "slideIndex": this.curImageIdx,
                })
            }
            this.emitSocketEvent(HDSocketEventType.EDIT_ROOM_DATA, {
                "roomId": HDAppManager.roomId,
                "operation": 3,
                "arrayToPush": [...arrayToPush],

            });
            arrayToPush.length = 0;
            // if(this.getChildByTag(ACTIVITY_BAP_1.Tag.Clear)){
            //     this.getChildByTag(ACTIVITY_BAP_1.Tag.Clear).loadTextureNormal(ACTIVITY_BAP_1.spriteBasePath + ACTIVITY_BAP_1.config.graphicalAssets.clear_disable.name);
            //     this.getChildByTag(ACTIVITY_BAP_1.Tag.Clear).setTouchEnabled(false);
            // }
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

    /**
     * Update Slide
     * @param increase
     */
    updateSlide: function (increase) {
        this.updateSyncData();
        this.updateLineData();
        if (this.playGround.getNumberOfRunningActions() > 0)
            return;
        this.curImageIdx += (increase ? 1 : -1);
        this.curImageIdx = HDUtility.clampANumber(this.curImageIdx, 0, ACTIVITY_BAP_1.config.background.sections.backgroundSlides.images.length - 1)
        this.updateImage(this.curImageIdx);
        if (this.isTeacherView) {
            this.emitSocketEvent(HDSocketEventType.EDIT_ROOM_DATA, {
                "roomId": HDAppManager.roomId,
                "operation": 4,
                "slideIndex": this.curImageIdx,
            });
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                'eventType': ACTIVITY_BAP_1.socketEventKey.CHANGE_SLIDE,
                'data': {'index': this.curImageIdx}
            });
            this.triggerScriptByCurrentSlideIdx();
        }
        this.showPreview();
    },

    /**
     * Update image of current selected slide.
     * @param index
     */
    updateImage: function (index) {
        this.curImageIdx = index;
        if (this.isTeacherView && this.getChildByTag(ACTIVITY_BAP_1.Tag.PrevImage)) {
            this.getChildByTag(ACTIVITY_BAP_1.Tag.PrevImage).setOpacity(this.curImageIdx === 0 ? 100 : 255);
            this.getChildByTag(ACTIVITY_BAP_1.Tag.PrevImage).setTouchEnabled(this.curImageIdx !== 0);
            this.getChildByTag(ACTIVITY_BAP_1.Tag.NextImage).setOpacity(this.curImageIdx === ACTIVITY_BAP_1.config.background.sections.backgroundSlides.images.length - 1 ? 100 : 255);
            this.getChildByTag(ACTIVITY_BAP_1.Tag.NextImage).setTouchEnabled(this.curImageIdx !== ACTIVITY_BAP_1.config.background.sections.backgroundSlides.images.length - 1);
            if(ACTIVITY_BAP_1.config.background.sections.backgroundSlides.images.length>1)
            {
                this.getChildByTag(ACTIVITY_BAP_1.Tag.CountLabel).setString("Slide " + (this.curImageIdx + 1) + " of " + ACTIVITY_BAP_1.config.background.sections.backgroundSlides.images.length);

            }
           
        }
        if (this.playGround && ACTIVITY_BAP_1.config.background.sections.backgroundSlides.images[ACTIVITY_BAP_1.ref.curImageIdx]) {
            this.playGround.runAction(new cc.Sequence(new cc.FadeOut(0.2), new cc.callFunc(() => {
                ACTIVITY_BAP_1.ref.playGround.setTexture(new cc.Sprite(ACTIVITY_BAP_1.spriteBasePath + ACTIVITY_BAP_1.config.background.sections.backgroundSlides.images[ACTIVITY_BAP_1.ref.curImageIdx]).getTexture());
                ACTIVITY_BAP_1.ref.playGround.runAction(new cc.FadeIn(0.1));
                if (ACTIVITY_BAP_1.ref.getChildByTag(ACTIVITY_BAP_1.Tag.boardInitialTag + ACTIVITY_BAP_1.ref.curImageIdx)) {
                    ACTIVITY_BAP_1.ref.getChildByTag(ACTIVITY_BAP_1.Tag.boardInitialTag + ACTIVITY_BAP_1.ref.curImageIdx).setVisible(true);
                } else {
                    let drawNode = new cc.DrawNode();
                    drawNode.setContentSize(ACTIVITY_BAP_1.ref.playGround.getContentSize().width, ACTIVITY_BAP_1.ref.playGround.getContentSize().height);
                    drawNode.setTag(ACTIVITY_BAP_1.Tag.boardInitialTag + ACTIVITY_BAP_1.ref.curImageIdx);
                    drawNode.setLocalZOrder(10);
                    ACTIVITY_BAP_1.ref.addChild(drawNode);
                }
            }, this)));
        }

        if (this.getChildByTag(ACTIVITY_BAP_1.Tag.boardInitialTag + this.lastImageIndex)) {
            this.getChildByTag(ACTIVITY_BAP_1.Tag.boardInitialTag + this.lastImageIndex).setVisible(false);
        }
        this.lastImageIndex = this.curImageIdx;

    },

    /**
     * sync Data if join in between game.
     * @param data
     */
    syncData: function (data) {
        ACTIVITY_BAP_1.ref.syncDataInfo = data;
    },

    /**
     * Button click callback
     * @param sender: Button
     * @param type: Click type
     */
    buttonCallback: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                switch (sender.getTag()) {
                    case ACTIVITY_BAP_1.Tag.NextImage:
                        this.updateSlide(true);
                        break;
                    case ACTIVITY_BAP_1.Tag.PrevImage:
                        this.updateSlide(false);
                        break;
                    // case  ACTIVITY_BAP_1.Tag.Clear:
                    //     this.clear();
                    //     break;
                    case ACTIVITY_BAP_1.Tag.DrawMode:
                        this.toggleDrawMode();
                        break;
                }
                break;

        }
    },
    /**
     * This will toggle draw mode
     */
    toggleDrawMode() {
        this.sharedMode = !this.sharedMode;
        this.getChildByTag(ACTIVITY_BAP_1.Tag.DrawMode).setTitleText(this.sharedMode ? "Individual Mode" : "Shared Mode");
        this.emitDrawModeEvent();
    },

    /**
     * Emit an event for current draw mode
     */
    emitDrawModeEvent: function () {
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            "eventType": ACTIVITY_BAP_1.socketEventKey.DRAW_MODE,
            "data": {"status": this.sharedMode}
        });
    },

    /**
     * Return true if UI element is clickable
     * Called by parent lesson
     * @param location
     * @returns {boolean}
     */
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
        let handICon = false
        for (let obj of this.handIconUI) {
            if (cc.rectContainsPoint(obj.getBoundingBox(), obj.getParent().convertToNodeSpace(location))) {
                handICon = true;
                break;
            }
        }
        if (handICon) {
            this.interactableObject = true;
            this.customTexture = false;
        } else if ((this.isDrawing || this.erasing)) {
            this.customTexture = true;
            this.interactableObject = true;
        } else {
            this.interactableObject = false
        }
    },
});
