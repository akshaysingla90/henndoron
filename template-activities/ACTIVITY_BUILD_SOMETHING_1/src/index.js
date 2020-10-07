var ACTIVITY_BUILD_SOMETHING_1 = {};
ACTIVITY_BUILD_SOMETHING_1.Tag = {
    centerLayerBase: 200,
    stopButton: 201,
    startButton: 202,
    movedObject: 300,
    studentPreviewLayer: 400,
    closePreview: 401,
    leftButton: 501,
    rightButton: 502,
    carouselBaseImage: 503,
    backgroundSprite: 505,
    resultLayer: 506,
}

ACTIVITY_BUILD_SOMETHING_1.socketEventKey = {
    RESET_UI: 1,
    GAME_STATE: 2,
    MOVE_POSITION: 3,
    SCROLL_OFFSET: 4,
    USER_DATA: 5,
    SHOW_STUDENT_BUILD: 6,
    STUDENT_INTERACTION: 7,
    PLAY_ANIMATION: 8
}

ACTIVITY_BUILD_SOMETHING_1.events = {
    START: 0,
    MOVE: 1,
    STOP: 2,
    MOVE_BACK: 3,
}

ACTIVITY_BUILD_SOMETHING_1.gameState = {
    START: 0,
    STOP: 1,
    TEACHER_DEMO: 2,
    RESULT: 3,
}

ACTIVITY_BUILD_SOMETHING_1.ref = null;
ACTIVITY_BUILD_SOMETHING_1.BuildSomething = HDBaseLayer.extend({
    self: null,
    playGround: null,
    isTeacherView: false,
    isStudentInteractionEnable: false,
    joinedStudentList: [],
    carouselWidth: 100,
    leftTableView: null,
    rightTableView: null,
    mousePressedDown: false,
    clickedItem: null,
    initialPosition: null,
    currentItemToAssembledIndex: 0,
    handIconUI: [],
    finalOrderList: [],
    storedData: null,
    carouselHeight: 120,
    cardQueue: [],
    currentIsolatedNode: 0,
    assembledList: [],
    gameState: ACTIVITY_BUILD_SOMETHING_1.gameState.TEACHER_DEMO,
    currentOffset: null,
    userDataForSync: [],
    allUserData: [],
    mousePos: cc.p(0, 0),
    draggableObject: [],
    animatingCharacters: [],
    dismantledObject: [],
    scrollEvent: null,
    isResultViewOn: false,
    resultScreenDataForSync: [],
    configData: null,
    config: null,
    originalDismantalObj : [],

    ctor: function () {
        this._super();
    },

    onEnter: function () {
        this._super();
        ACTIVITY_BUILD_SOMETHING_1.ref = this;
        let activityName = 'ACTIVITY_BUILD_SOMETHING_1';
        cc.loader.loadJson("res/Activity/" + activityName + "/config.json", function (error, config) {
            ACTIVITY_BUILD_SOMETHING_1.configData = config
            ACTIVITY_BUILD_SOMETHING_1.config = JSON.parse(JSON.stringify(config));
            ACTIVITY_BUILD_SOMETHING_1.resourcePath = "res/Activity/" + "" + activityName + "/res/"
            ACTIVITY_BUILD_SOMETHING_1.soundPath = ACTIVITY_BUILD_SOMETHING_1.resourcePath + "Sound/";
            ACTIVITY_BUILD_SOMETHING_1.animationBasePath = ACTIVITY_BUILD_SOMETHING_1.resourcePath + "AnimationFrames/";
            ACTIVITY_BUILD_SOMETHING_1.spriteBasePath = ACTIVITY_BUILD_SOMETHING_1.resourcePath + "Sprite/";
            ACTIVITY_BUILD_SOMETHING_1.ref.isTeacherView = HDAppManager.isTeacherView;
            ACTIVITY_BUILD_SOMETHING_1.ref.isStudentInteractionEnable = ACTIVITY_BUILD_SOMETHING_1.ref.isTeacherView;

            for(let character of ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.dismantledObject.data){
                ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject.push( ...character.parts);
            }
            ACTIVITY_BUILD_SOMETHING_1.ref.originalDismantalObj = [...ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject];

            // ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject = [...ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.dismantledObject.data];
            // ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject = [...ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.dismantledObject.data];
            ACTIVITY_BUILD_SOMETHING_1.ref.setupUI();

            if (ACTIVITY_BUILD_SOMETHING_1.ref.storedData) {
                ACTIVITY_BUILD_SOMETHING_1.ref.syncData(ACTIVITY_BUILD_SOMETHING_1.ref.storedData)
            }
            ACTIVITY_BUILD_SOMETHING_1.ref.triggerScript(ACTIVITY_BUILD_SOMETHING_1.config.teacherScripts.data[0].moduleStart.content);

        });





    },

    onExit: function () {
        this._super();
        ACTIVITY_BUILD_SOMETHING_1.ref.resetScreen();
        ACTIVITY_BUILD_SOMETHING_1.ref.draggableObject.forEach(ele => ele.removeFromParent(true));
        ACTIVITY_BUILD_SOMETHING_1.ref.removeAllChildrenWithCleanup(true);
        if (ACTIVITY_BUILD_SOMETHING_1.ref.interval) {
            clearInterval(ACTIVITY_BUILD_SOMETHING_1.ref.interval);
            ACTIVITY_BUILD_SOMETHING_1.ref.interval = null;
        }
        ACTIVITY_BUILD_SOMETHING_1.ref = null;
    },

    /**
     * triggerScript: To trigger the script
     * @param message
     */
    triggerScript: function (message) {
        if (this.parent) {
            this.parent.showScriptMessage(message.ops);
        }
    },
    triggerTip: function (message) {
        if (this.parent) {
            this.parent.showTipMessage(message.ops);
        }
    },
    /**
     * setupUI: This method will setup UI for teacher and student.
     */
    setupUI: function () {
        this.background();
        this.setupCenterTable();
        this.setupOptionButtons();
        this.setCardContent();
        if (ACTIVITY_BUILD_SOMETHING_1.ref.isTeacherView && !ACTIVITY_BUILD_SOMETHING_1.ref.storedData) {
            ACTIVITY_BUILD_SOMETHING_1.ref.updateRoomData();
        }
    },

    /**
     * background: This will set background.
     */
    background: function () {
        let bg = this.addSprite(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + "background.png", cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5), this);
        bg.setTag(ACTIVITY_BUILD_SOMETHING_1.Tag.backgroundSprite);
        bg.setVisible(true);
    },

    winScreen: function () {
        let bg = this.getChildByTag(ACTIVITY_BUILD_SOMETHING_1.Tag.backgroundSprite);
        bg.setTexture(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + 'winScreen.png');
    },

    looseScreen: function () {
        let bg = this.getChildByTag(ACTIVITY_BUILD_SOMETHING_1.Tag.backgroundSprite);
        bg.setTexture(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + 'looseScreen.png');
    },

    /**
     * setupObjects: This method will create separate objects that need to be assembled.
     */
    setupObjects: function () {
        var dismantledObjects = ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject;
        for (var index = 0; index < dismantledObjects.length; index++) {
            var currentObject = dismantledObjects[index];
            var sprite = this.addSprite(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + currentObject.imageName, currentObject.initialPosition, this);
            sprite.setName(currentObject.name);
            sprite.setLocalZOrder(2);
            this.dismantledObjectsList.push(sprite);
        }
    },

    /**
     * setupCenterTable: This method will create center table.
     */
    setupCenterTable: function () {
        var centerLayer = this.createColourLayer(cc.color(100, 0, 0, 0), 960, 640, cc.p(cc.winSize.width * 0, cc.winSize.height * 0), this, 1);
        centerLayer.tag = ACTIVITY_BUILD_SOMETHING_1.Tag.centerLayerBase;
    },

    /**
     * setupOptionButtons: This will create option button for teacher.
     */
    setupOptionButtons: function () {
        if (ACTIVITY_BUILD_SOMETHING_1.ref.isTeacherView) {
            let startButtonObject = ACTIVITY_BUILD_SOMETHING_1.config.buttons.data.startButton;
            let startButton = this.createButton(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + startButtonObject.enableState, ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + startButtonObject.pushedState, "", 32, ACTIVITY_BUILD_SOMETHING_1.Tag.startButton, cc.p(this.getContentSize().width * 0.09,
                this.getContentSize().height * 0.2), this, this, ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + startButtonObject.disableState);
           console.log('butto position ',startButton.getPosition());
            startButton.setScale(startButtonObject.scale);
            startButton.setEnabled(true);
            startButton.setLocalZOrder(10);
            this.handIconUI.push(startButton);
            let stopButtonObject = ACTIVITY_BUILD_SOMETHING_1.config.buttons.data.stopButton;
            let stopButton = this.createButton(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + stopButtonObject.enableState, ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + stopButtonObject.pushedState, "", 32, ACTIVITY_BUILD_SOMETHING_1.Tag.stopButton, startButton.getPosition(), this, this, ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + stopButtonObject.disableState);
            stopButton.setScale(stopButtonObject.scale);
            stopButton.setEnabled(false);
            stopButton.setLocalZOrder(10);
            stopButton.setVisible(false);
            this.handIconUI.push(stopButton);
        }
    },

    /**
     * updateRoomData : This method will update room data for syncing
     */
    updateRoomData: function () {
        if (!ACTIVITY_BUILD_SOMETHING_1.ref.isTeacherView) {
            return;
        }

        let data = ACTIVITY_BUILD_SOMETHING_1.ref.gameState == ACTIVITY_BUILD_SOMETHING_1.gameState.TEACHER_DEMO ? this.userDataForSync : this.allUserData;
        data = ACTIVITY_BUILD_SOMETHING_1.ref.gameState == ACTIVITY_BUILD_SOMETHING_1.gameState.RESULT ? this.resultScreenDataForSync : data;
        SocketManager.emitCutomEvent("SingleEvent", {
            'eventType': HDSocketEventType.UPDATE_ROOM_DATA,
            'roomId': HDAppManager.roomId,
            'data': {
                "roomId": HDAppManager.roomId,
                "roomData": {
                    "activity": ACTIVITY_BUILD_SOMETHING_1.config.properties.namespace,
                    "data": {"gameState": ACTIVITY_BUILD_SOMETHING_1.ref.gameState, "usersData": data},
                    "activityStartTime": HDAppManager.getActivityStartTime()
                },
            }
        }, null);
    },

    /**
     * mouseEventListener: This will add mouse listener to the the activity.
     */

    mouseEventListener: function (event) {
        switch (event._eventType) {
            case cc.EventMouse.DOWN:
                ACTIVITY_BUILD_SOMETHING_1.ref.onMouseDown(event);
                break;
            case cc.EventMouse.MOVE:
                ACTIVITY_BUILD_SOMETHING_1.ref.onMouseMove(event);
                break;
            case cc.EventMouse.UP:
                ACTIVITY_BUILD_SOMETHING_1.ref.onMouseUp(event);
                break;
        }
    },

    touchEventListener: function (touch, event) {
        switch (event.getEventCode()) {
            case cc.EventTouch.EventCode.BEGAN:
                ACTIVITY_BUILD_SOMETHING_1.ref.onMouseDown(touch);
                break;
            case cc.EventTouch.EventCode.MOVED:
                ACTIVITY_BUILD_SOMETHING_1.ref.onMouseMove(touch);
                break;
            case cc.EventTouch.EventCode.ENDED:
                ACTIVITY_BUILD_SOMETHING_1.ref.onMouseUp(touch);
                break;
        }
    },


    onMouseDown: function (event) {
        var status = this.checkifScrollButton(event.getLocation());

        if (status) {
            ACTIVITY_BUILD_SOMETHING_1.ref.scrollEvent = cc.EventMouse.DOWN;
            this.updateScrollOffset(status === 1);
            return;
        }
        ACTIVITY_BUILD_SOMETHING_1.ref.mousePressedDown = true;
        ACTIVITY_BUILD_SOMETHING_1.ref.tableView._dragging = false;
        ACTIVITY_BUILD_SOMETHING_1.ref.moveObjectWithMouse(event.getLocation());
        ACTIVITY_BUILD_SOMETHING_1.ref.mousePos = ACTIVITY_BUILD_SOMETHING_1.ref.convertToNodeSpace(event.getLocation());
    },

    onMouseMove: function (event) {
        var status = this.checkifScrollButton(event.getLocation());
        if (status) {
            this.updateScrollOffset(status === 1);
            return;
        } else {
            ACTIVITY_BUILD_SOMETHING_1.ref.scrollEvent = null
        }
        var loc = ACTIVITY_BUILD_SOMETHING_1.ref.convertToNodeSpace(event.getLocation());
        ACTIVITY_BUILD_SOMETHING_1.ref.moveObjectWithMouse(event.getLocation());
        ACTIVITY_BUILD_SOMETHING_1.ref.mousePos = ACTIVITY_BUILD_SOMETHING_1.ref.convertToNodeSpace(event.getLocation());
        if (ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem && ACTIVITY_BUILD_SOMETHING_1.ref.mousePressedDown) {
            ACTIVITY_BUILD_SOMETHING_1.ref.tableView._dragging = false;
            ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.setPosition(loc);

            ACTIVITY_BUILD_SOMETHING_1.ref.moveObject(loc, ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.tag - ACTIVITY_BUILD_SOMETHING_1.Tag.movedObject, ACTIVITY_BUILD_SOMETHING_1.events.MOVE);
        } else {
            if (ACTIVITY_BUILD_SOMETHING_1.ref.tableView)
                ACTIVITY_BUILD_SOMETHING_1.ref.tableView._dragging = this.isStudentInteractionEnable;
        }
    },

    onMouseUp: function (event) {
        ACTIVITY_BUILD_SOMETHING_1.ref.scrollEvent = null;
        var status = this.checkifScrollButton(event.getLocation());
        if (status) {
            this.updateScrollOffset(status === 1);
            return;
        }
        ACTIVITY_BUILD_SOMETHING_1.ref.mousePos = ACTIVITY_BUILD_SOMETHING_1.ref.convertToNodeSpace(event.getLocation());
        ACTIVITY_BUILD_SOMETHING_1.ref.mousePressedDown = false;
        if (ACTIVITY_BUILD_SOMETHING_1.ref.tableView) {
            ACTIVITY_BUILD_SOMETHING_1.ref.tableView._dragging = this.isStudentInteractionEnable;
            var loc = ACTIVITY_BUILD_SOMETHING_1.ref.convertToNodeSpace(event.getLocation());
            if (ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem && cc.rectIntersectsRect(ACTIVITY_BUILD_SOMETHING_1.ref.tableView.getBoundingBox(), ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getBoundingBox())) {
                ACTIVITY_BUILD_SOMETHING_1.ref.moveBackChanges();

                ACTIVITY_BUILD_SOMETHING_1.ref.moveObject(ACTIVITY_BUILD_SOMETHING_1.ref.initialPosition, "", ACTIVITY_BUILD_SOMETHING_1.events.MOVE_BACK);
                return;
            } else {
                var finalPosition = ACTIVITY_BUILD_SOMETHING_1.ref.matchPosition(loc);
                ACTIVITY_BUILD_SOMETHING_1.ref.moveObject(finalPosition ? finalPosition : loc, "", ACTIVITY_BUILD_SOMETHING_1.events.STOP);
            }
        }
        ACTIVITY_BUILD_SOMETHING_1.ref.updateRoomData();
    },

    moveObjectWithMouse: function (location) {
        if (!this.mousePressedDown)
            return;
        if (ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem || !ACTIVITY_BUILD_SOMETHING_1.ref.isStudentInteractionEnable) {
            return;
        }
        this.draggableObject.forEach((element) => {
            if (element && element.parent && element.cardElementImage.isVisible() && cc.rectContainsPoint(element.cardElementImage.getBoundingBox(), element.convertToNodeSpace(location))) {
                this.moveCellObject(element);
                ACTIVITY_BUILD_SOMETHING_1.ref.tableView._dragging = false;
                return;
            }
        });
    },

    /**
     * returns 1 for left button, 2 for right button, 0 otherwise
     */

    checkifScrollButton: function (location) {
        let status = 0;
        let baseLayer = this.getChildByTag(ACTIVITY_BUILD_SOMETHING_1.Tag.carouselBaseImage);
        if (!baseLayer) {
            return;
        }

        let leftButton = baseLayer.getChildByTag(ACTIVITY_BUILD_SOMETHING_1.Tag.leftButton);
        let rightButton = baseLayer.getChildByTag(ACTIVITY_BUILD_SOMETHING_1.Tag.rightButton);
        if (cc.rectContainsPoint(leftButton.getBoundingBox(), baseLayer.convertToNodeSpace(location))) {
            status = 1
        } else if (cc.rectContainsPoint(rightButton.getBoundingBox(), baseLayer.convertToNodeSpace(location))) {
            status = 2;
        }
        return status;
    },

    /**
     * moveObject: Move circle with mouse and emit an event for teacher
     * @param position
     */
    moveObject: function (position, index, event) {
        if (this.isTeacherView && this.gameState != ACTIVITY_BUILD_SOMETHING_1.gameState.TEACHER_DEMO)
            return;
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            'eventType': ACTIVITY_BUILD_SOMETHING_1.socketEventKey.MOVE_POSITION,
            'data': {'userName': HDAppManager.userName, 'position': position, 'index': index, 'event': event}
        });
    },

    sendUserData: function () {
        if (!ACTIVITY_BUILD_SOMETHING_1.ref.isTeacherView) {
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                'eventType': ACTIVITY_BUILD_SOMETHING_1.socketEventKey.USER_DATA,
                'data': {'userName': HDAppManager.userName, 'UIData': this.userDataForSync}
            });
        }
    },

    /**
     * matchPosition: This is release the selected object if it is not matched then returned to last position.
     */
    matchPosition: function (location) {
        let loc = this.convertToNodeSpace(location);
        if (this.clickedItem) {
            var result = this.isTouchesPreviouslyPlacedObject(location);

            if (result.isIsolatedNode) {
                //Place node at that position
                ACTIVITY_BUILD_SOMETHING_1.ref.assembledList.push(ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem);
                ACTIVITY_BUILD_SOMETHING_1.ref.moveObject(ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getPosition(), "", ACTIVITY_BUILD_SOMETHING_1.events.STOP);
                ACTIVITY_BUILD_SOMETHING_1.ref.validateData(ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.tag - ACTIVITY_BUILD_SOMETHING_1.Tag.movedObject, ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getPosition(), ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getContentSize(), true, null);
                ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem = null;
                ACTIVITY_BUILD_SOMETHING_1.ref.updateTableView();

            } else if (!result.isIsolatedNode && result.nodeContainsPoint) {
                var attachResult = ACTIVITY_BUILD_SOMETHING_1.ref.attachPoint(location, result.index);
                var connectionObject = ACTIVITY_BUILD_SOMETHING_1.ref.assembledList[result.index];
                var clickedItem = ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject[ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.tag - ACTIVITY_BUILD_SOMETHING_1.Tag.movedObject];
                if (connectionObject && clickedItem && connectionObject.userData && clickedItem && attachResult.snapIdxOfPlacedObj != -1 && attachResult.snapIdxOfDraggedObj != -1) {
                    // Placed Obj
                    // connectionObject.userData.snappingPoints.splice(attachResult.snapIdxOfPlacedObj, 1);
                    // clickedItem.snappingPoints.splice(attachResult.snapIdxOfDraggedObj, 1);
                }
                let completeMovement = cc.callFunc(function () {
                    if (ACTIVITY_BUILD_SOMETHING_1.ref.tableView) {
                        ACTIVITY_BUILD_SOMETHING_1.ref.assembledList.push(ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem);
                        ACTIVITY_BUILD_SOMETHING_1.ref.moveObject(ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getPosition(), "", ACTIVITY_BUILD_SOMETHING_1.events.STOP);
                        ACTIVITY_BUILD_SOMETHING_1.ref.validateData(ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.tag - ACTIVITY_BUILD_SOMETHING_1.Tag.movedObject, ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getPosition(), ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getContentSize(), false, result.connectionNodeName, attachResult.isAttachedToCorrectPoints);
                        ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem = null;
                        ACTIVITY_BUILD_SOMETHING_1.ref.updateTableView();
                    }
                });
                if (attachResult.attachTo) {
                    ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.runAction(cc.sequence([cc.moveTo(0.1, attachResult.attachTo), completeMovement]));
                }
                return attachResult.attachTo;
            } else {
                ACTIVITY_BUILD_SOMETHING_1.ref.moveObject(ACTIVITY_BUILD_SOMETHING_1.ref.initialPosition, "", ACTIVITY_BUILD_SOMETHING_1.events.MOVE_BACK);
                ACTIVITY_BUILD_SOMETHING_1.ref.moveBackChanges();
            }
            if (ACTIVITY_BUILD_SOMETHING_1.ref.assembledList.length > 0 && HDAppManager.isTeacherView) {
                this.parent.setResetButtonActive(true);
            }
        }
    },

    updateTableView: function () {
        var offset = ACTIVITY_BUILD_SOMETHING_1.ref.tableView.getContentOffset();
        ACTIVITY_BUILD_SOMETHING_1.ref.tableView.reloadData();
        ACTIVITY_BUILD_SOMETHING_1.ref.tableView.setContentOffset(offset, 0);
    },

    validateData: function (index, position, size, isNew, connectionNode, isAttachedToCorrectPoints) {
        var dataObject = ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject[index];
        ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject.splice(index, 1);
        var splitData = dataObject.name.split("_");
        var nodeName = splitData[0];
        if (!isNew) {
            let index = this.getNodeIndex(connectionNode);
            var isCorrectName = isAttachedToCorrectPoints;//this.checkIfAllAttachedImagesSameType(index,nodeName);
            this.updateUserDataForSync(nodeName, position, size, dataObject, isCorrectName, isNew, index);
        } else {
            this.updateUserDataForSync(nodeName, position, size, dataObject, true, isNew, -1);
        }
    },

    getNodeIndex: function (connectionNode) {
        for (let index = 0; index < this.userDataForSync.length; index++) {
            let currentNodeData = this.userDataForSync[index].data;
            for (let nodeIndex = 0; nodeIndex < currentNodeData.length; nodeIndex++) {
                if (currentNodeData[nodeIndex].nodeData.name === connectionNode) {
                    return index;
                }
            }
        }
        return -1;
    },

    checkIfAllAttachedImagesSameType: function (index, nodeName) {
        return (this.userDataForSync[index].nodeName.includes(nodeName) && this.userDataForSync[index].isCorrect)
    },

    updateUserDataForSync: function (nodeName, position, size, data, correct, isNew, index) {
        if (!isNew && index != -1) {
            var currentNode = this.userDataForSync[index];
            currentNode.isCorrect = (currentNode.isCorrect && correct);
            currentNode.data.push({
                "position": position,
                "size": size,
                "scaleX": ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getScaleX(),
                "scaleY": ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getScaleY(),
                "nodeData": data
            });
        } else {
            this.userDataForSync.push({
                "nodeName": nodeName,
                "isCorrect": correct,
                "data": [{
                    "position": position,
                    "size": size,
                    "scaleX": ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getScaleX(),
                    "scaleY": ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getScaleY(),
                    "nodeData": data
                }]
            })
        }
        this.sendUserData();
        for (let object of ACTIVITY_BUILD_SOMETHING_1.config.gameInfo.assembleObjectInfo) {
            for (let assembledObj of this.userDataForSync) {
                if (assembledObj.isCorrect && object.name == assembledObj.nodeName &&
                    object.partsCount == assembledObj.data.length && !assembledObj.isAnimationCompled) {
                    this.allPartsConnectedSuccessfully(assembledObj, object);
                    assembledObj.isAnimationCompled = true;
                    if (ACTIVITY_BUILD_SOMETHING_1.ref.isTeacherView && ACTIVITY_BUILD_SOMETHING_1.ref.gameState == ACTIVITY_BUILD_SOMETHING_1.gameState.TEACHER_DEMO) {
                        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                            'eventType': ACTIVITY_BUILD_SOMETHING_1.socketEventKey.PLAY_ANIMATION,
                            'data': {
                                'userName': HDAppManager.userName,
                                "assembledObj": assembledObj,
                                "animationInfo": object
                            }
                        });
                    }
                }
            }
        }
    },

    isTurnSwitchingBlocked: function () {
      //  console.log(!(this.gameState == ACTIVITY_BUILD_SOMETHING_1.gameState.START));
        return !(this.gameState == ACTIVITY_BUILD_SOMETHING_1.gameState.START);
    },

    moveBackChanges: function () {
        let completion = cc.callFunc(function () {
            if (ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem) {
                ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.removeFromParent();
                ACTIVITY_BUILD_SOMETHING_1.ref.cardQueue.splice(ACTIVITY_BUILD_SOMETHING_1.ref.cardQueue.length - 1, 1);
                var offset = ACTIVITY_BUILD_SOMETHING_1.ref.tableView.getContentOffset();
                ACTIVITY_BUILD_SOMETHING_1.ref.draggableObject.length = 0;
                ACTIVITY_BUILD_SOMETHING_1.ref.tableView.reloadData();
                ACTIVITY_BUILD_SOMETHING_1.ref.tableView.setContentOffset(offset, 0);
                ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem = null;
            }
        });
        if (ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem) {
            ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.runAction(cc.sequence([cc.moveTo(0.25, this.initialPosition), completion]));
        }
    },

    attachPoint: function (loc, index) {
        var connectionObject = ACTIVITY_BUILD_SOMETHING_1.ref.assembledList[index];
        var connectionObjectData = ACTIVITY_BUILD_SOMETHING_1.ref.originalDismantalObj[connectionObject.getUserData().tag];
        var clickedItemData = ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject[ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.tag - ACTIVITY_BUILD_SOMETHING_1.Tag.movedObject];
        var attachToLocation = null; //Point from already placed objects
        var attachFromLocation = null; // Point from current clicked object.
        var previousDistance = 2000;
        var originalSnappingPoint = cc.p(0, 0);
        var originalPoint = cc.p(0, 0);
        let isAttachedToCorrectPoints = false;
        var snapIdxOfPlacedObj = -1;
        var snapIdxOfDraggedObj = -1;
        let attachedItemSnapPoint = cc.p(0, 0);
        if (connectionObject && connectionObjectData && clickedItemData) {

            //connect with correct position if it is in 20 unit radius
            // for(let points of clickedItemData.snappingPoints){
            //     if(points && points.snapDetails){
            //         let name = points.snapDetails.name;
            //         let point = cc.p(points.snapDetails.point.x, points.snapDetails.point.y)
            //         let connectionObj = ACTIVITY_BUILD_SOMETHING_1.ref.originalDismantalObj.filter(item=>item.name==name)[0];
            //         let idxOfConnectionObj = ACTIVITY_BUILD_SOMETHING_1.ref.originalDismantalObj.indexOf(connectionObj);
            //         if(idxOfConnectionObj != -1){
            //             let connectionObj =  ACTIVITY_BUILD_SOMETHING_1.ref.assembledList[idxOfConnectionObj];
            //             if(connectionObj){
            //                 var connectionSnapPoint = cc.p(point.x * connectionObject.getScaleX(), point.y * connectionObject.getScaleY());
            //                 var pointInWorldSpace = cc.p(connectionObject.getPositionX() - connectionObject.getContentSize().width * connectionObject.getScaleX() * 0.5 + connectionSnapPoint.x, connectionObject.getPositionY() - connectionObject.getContentSize().height * connectionObject.getScaleY() * 0.5 + connectionSnapPoint.y);
            //
            //                 var currentSnapPoint = cc.p(clickedItemData.snappingPoints[currIndex].x * ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getScaleX(),
            //                     clickedItemData.snappingPoints[currIndex].y * ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getScaleY());
            //                 var currentPointInWorldSpace = cc.p(ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getPositionX() - ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getContentSize().width * ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getScaleX() * 0.5 + currentSnapPoint.x,
            //                     ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getPositionY() - ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getContentSize().height * ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getScaleY() * 0.5 + currentSnapPoint.y);
            //                 var distance = cc.pDistance(pointInWorldSpace, currentPointInWorldSpace);
            //
            //             }
            //         }
            //     }
            // }
            // var currentSnapPoint = cc.p(clickedItemData.snappingPoints[currIndex].x * ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getScaleX(), clickedItemData.snappingPoints[currIndex].y * ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getScaleY());
            // var currentPointInWorldSpace = cc.p(ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getPositionX() - ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getContentSize().width * ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getScaleX() * 0.5 + currentSnapPoint.x, ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getPositionY() - ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getContentSize().height * ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getScaleY() * 0.5 + currentSnapPoint.y);

            ///------------------------------------------------------




            for (let index = 0; index < connectionObjectData.snappingPoints.length; index++) {
                var connectionSnapPoint = cc.p(connectionObjectData.snappingPoints[index].x * connectionObject.getScaleX(), connectionObjectData.snappingPoints[index].y * connectionObject.getScaleY());
                var pointInWorldSpace = cc.p(connectionObject.getPositionX() - connectionObject.getContentSize().width * connectionObject.getScaleX() * 0.5 + connectionSnapPoint.x, connectionObject.getPositionY() - connectionObject.getContentSize().height * connectionObject.getScaleY() * 0.5 + connectionSnapPoint.y);
                for (let currIndex = 0; currIndex < clickedItemData.snappingPoints.length; currIndex++) {
                    var currentSnapPoint = cc.p(clickedItemData.snappingPoints[currIndex].x * ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getScaleX(), clickedItemData.snappingPoints[currIndex].y * ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getScaleY());
                    var currentPointInWorldSpace = cc.p(ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getPositionX() - ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getContentSize().width * ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getScaleX() * 0.5 + currentSnapPoint.x, ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getPositionY() - ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getContentSize().height * ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getScaleY() * 0.5 + currentSnapPoint.y);
                    var distance = cc.pDistance(pointInWorldSpace, currentPointInWorldSpace);
                    if (attachFromLocation && attachToLocation) {
                        if (previousDistance > distance) {
                            snapIdxOfPlacedObj = index;
                            snapIdxOfDraggedObj = currIndex;
                            previousDistance = distance;
                            attachFromLocation = currentPointInWorldSpace;
                            attachToLocation = pointInWorldSpace;
                            originalSnappingPoint = currentSnapPoint;
                            originalPoint = clickedItemData.snappingPoints[currIndex];
                            attachedItemSnapPoint = connectionObjectData.snappingPoints[index];
                        }
                    } else {
                        attachFromLocation = currentPointInWorldSpace;
                        attachToLocation = pointInWorldSpace;
                        originalSnappingPoint = currentSnapPoint;
                        previousDistance = distance;
                        originalPoint = clickedItemData.snappingPoints[currIndex];
                        attachedItemSnapPoint = connectionObjectData.snappingPoints[index];
                    }
                }
            }
        }
        isAttachedToCorrectPoints = this.checkIfAttachedToCorrectPoints(clickedItemData, originalPoint, attachedItemSnapPoint);
        if(attachToLocation && originalSnappingPoint) {
            var newAttachToLocation = cc.p(attachToLocation.x + ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getContentSize().width * ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getScaleX() * 0.5 - originalSnappingPoint.x,
                attachToLocation.y + ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getContentSize().height * ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getScaleY() * 0.5 - originalSnappingPoint.y);
            return {
                "attachTo": newAttachToLocation,
                "attachFrom": attachFromLocation,
                "isAttachedToCorrectPoints": isAttachedToCorrectPoints,
                "snapIdxOfPlacedObj": snapIdxOfPlacedObj,
                "snapIdxOfDraggedObj": snapIdxOfDraggedObj,
            };
        }
    },

    checkIfAttachedToCorrectPoints: function (clickedItemData, originalPoint, attachedItemSnapPoint) {
        let matched = false;
        if (!clickedItemData || !originalPoint || !attachedItemSnapPoint.snapDetails)
            return;
        if (clickedItemData.name == attachedItemSnapPoint.snapDetails.name &&
            originalPoint.x == attachedItemSnapPoint.snapDetails.point.x &&
            originalPoint.y == attachedItemSnapPoint.snapDetails.point.y) {
            matched = true;
        }
        return matched;
    },

    allPartsConnectedSuccessfully: function (allPartsInfo, animationInfo) {
        let xMin = Infinity;
        let yMin = Infinity;
        let xMax = -Infinity;
        let yMax = -Infinity;
        for (let parts of allPartsInfo.data) {
            xMin = Math.min(xMin, parts.position.x - parts.size.width * 0.5 * parts.scaleX);
            yMin = Math.min(yMin, parts.position.y - parts.size.height * 0.5 * parts.scaleY);
            xMax = Math.max(xMax, parts.position.x + parts.size.width * 0.5 * parts.scaleX);
            yMax = Math.max(yMax, parts.position.y + parts.size.height * 0.5 * parts.scaleY);
        }

        allPartsInfo.data.forEach(element => {
            if (ACTIVITY_BUILD_SOMETHING_1.ref.getChildByName(element.nodeData.name)) {
                ACTIVITY_BUILD_SOMETHING_1.ref.getChildByName(element.nodeData.name).setVisible(false);
            }
        });
        this.playCharacterAnimation(animationInfo, cc.p((xMin + xMax) / 2, (yMin + yMax) / 2));
    },
    playCharacterAnimation: function (animationInfo, position) {
        let sprite = new cc.Sprite(ACTIVITY_BUILD_SOMETHING_1.animationBasePath + animationInfo.animationPath + "0001.png");
        sprite.setScale(0.5);
        sprite.setLocalZOrder(10);
        this.addChild(sprite);
        sprite.setPosition(cc.p(position.x, position.y));
        this.animatingCharacters.push(sprite);
        sprite.setAnchorPoint(cc.p(0.5, 0.5));
        sprite.runAction(HDUtility.runFrameAnimation(ACTIVITY_BUILD_SOMETHING_1.animationBasePath + animationInfo.animationPath, 16, 0.05, ".png", true));

    },

    isTouchesPreviouslyPlacedObject: function (loc) {
        for (let index = 0; index < ACTIVITY_BUILD_SOMETHING_1.ref.assembledList.length; index++) {
            if (cc.rectIntersectsRect(ACTIVITY_BUILD_SOMETHING_1.ref.assembledList[index].getBoundingBox(), ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.getBoundingBox())) {
                return {
                    "isIsolatedNode": false,
                    "nodeContainsPoint": true,
                    "index": index,
                    "connectionNodeName": ACTIVITY_BUILD_SOMETHING_1.ref.assembledList[index].getName()
                };
            }
        }
        if (this.currentIsolatedNode < ACTIVITY_BUILD_SOMETHING_1.config.gameInfo.isolatedNodes) {
            this.currentIsolatedNode++;
            return {"isIsolatedNode": true};
        }
        return {"isIsolatedNode": false, "nodeContainsPoint": false}
    },
    updateStudentInteraction: function (username, status) {
        if (this.isTeacherView) {
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                "eventType": ACTIVITY_BUILD_SOMETHING_1.socketEventKey.STUDENT_INTERACTION,
                "data": {"userName": username, "status": status}
            });
        }
    },


    /**
     * socketListener: This will receive all the emitted socket events.
     * @param res
     */
    socketListener: function (res) {
        if (!ACTIVITY_BUILD_SOMETHING_1.ref)
            return;
        switch (res.eventType) {
            case HDSocketEventType.DISABLE_INTERACTION:
                ACTIVITY_BUILD_SOMETHING_1.ref.disableInteraction(res.data);
                break;
            case HDSocketEventType.SWITCH_TURN_BY_TEACHER:
                break;
            case HDSocketEventType.SWITCH_TURN_BY_STUDENT:
                break;
            case HDSocketEventType.STUDENT_STATUS:
                ACTIVITY_BUILD_SOMETHING_1.ref.studentStatus(res.data);
                break;
            case HDSocketEventType.STUDENT_TURN:
                ACTIVITY_BUILD_SOMETHING_1.ref.studentTurn(res.data);
                break;
            case HDSocketEventType.GAME_MESSAGE:
                if (res.data.userName == HDAppManager.username)
                    return;
                ACTIVITY_BUILD_SOMETHING_1.ref.gameEvents(res.data);
                break;
        }
    },

    /**
     * disableInteraction: This  will update student interaction and go button state.
     * @param enable
     */
    disableInteraction: function (enable) {
        this.isStudentInteractionEnable = enable;
    },

    /**
     * studentTurn: This method will update user  turn.
     * @param res
     */
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
    /**
     * updateStudentTurn: This will emit event to change student turn.
     * @param userName
     */
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

    /**
     * studentStatus: To manage current student list.
     * @param data
     */
    studentStatus: function (data) {
        if (this.isTeacherView) {
            this.joinedStudentList = [];
            this.joinedStudentList = data;
        }
    },
    /**
     * gameEvents: This will handle events specific to this game.
     * @param res
     */
    gameEvents: function (res) {
        switch (res.eventType) {
            case ACTIVITY_BUILD_SOMETHING_1.socketEventKey.MOVE_POSITION:
                if (!this.isTeacherView && this.gameState != ACTIVITY_BUILD_SOMETHING_1.gameState.TEACHER_DEMO)
                    return;
                ACTIVITY_BUILD_SOMETHING_1.ref.moveClickedObject(res.data);
                break;
            case ACTIVITY_BUILD_SOMETHING_1.socketEventKey.GAME_STATE:
                ACTIVITY_BUILD_SOMETHING_1.ref.gameState = res.data.gameState;
                ACTIVITY_BUILD_SOMETHING_1.ref.updateGameState();
                break;
            case ACTIVITY_BUILD_SOMETHING_1.socketEventKey.RESET_UI:
                ACTIVITY_BUILD_SOMETHING_1.ref.resetScreen();
                break;
            case ACTIVITY_BUILD_SOMETHING_1.socketEventKey.SCROLL_OFFSET:
                //ScrollTableView
                if (!ACTIVITY_BUILD_SOMETHING_1.ref.isTeacherView && ACTIVITY_BUILD_SOMETHING_1.ref.tableView) {
                    ACTIVITY_BUILD_SOMETHING_1.ref.currentOffset = res.data.offset;
                    ACTIVITY_BUILD_SOMETHING_1.ref.tableView.setContentOffset(res.data.offset, 0);
                }
                break;
            case ACTIVITY_BUILD_SOMETHING_1.socketEventKey.USER_DATA:
                ACTIVITY_BUILD_SOMETHING_1.ref.updateAllUsersData(res);
                ACTIVITY_BUILD_SOMETHING_1.ref.updateRoomData();
                break;

            case ACTIVITY_BUILD_SOMETHING_1.socketEventKey.SHOW_STUDENT_BUILD:
                ACTIVITY_BUILD_SOMETHING_1.ref.showPreviewToAll(res.data);
                break;
            case ACTIVITY_BAP_1.socketEventKey.STUDENT_INTERACTION:
                this.onUpdateStudentInteraction(res.data);
                break;
            case ACTIVITY_BUILD_SOMETHING_1.socketEventKey.PLAY_ANIMATION:
                if (!this.isTeacherView) {
                    this.allPartsConnectedSuccessfully(res.data.assembledObj, res.data.animationInfo);
                }
        }
    },
    onUpdateStudentInteraction: function (params) {
        if (params.userName == HDAppManager.username) {
            ACTIVITY_BUILD_SOMETHING_1.ref.isStudentInteractionEnable = params.status;
        }
    },


    updateAllUsersData: function (res) {
        var isFound = false;
        var indexData = -1;
        for (let index = 0; index < ACTIVITY_BUILD_SOMETHING_1.ref.allUserData.length; index++) {
            if (res.userName == ACTIVITY_BUILD_SOMETHING_1.ref.allUserData[index].userName) {
                isFound = true;
                indexData = index;
                break;
            }
        }
        if (!isFound) {
            ACTIVITY_BUILD_SOMETHING_1.ref.allUserData.push({"userName": res.userName, "data": res.data.UIData});
        } else {
            ACTIVITY_BUILD_SOMETHING_1.ref.allUserData.splice(indexData, 1);
            ACTIVITY_BUILD_SOMETHING_1.ref.allUserData.push({"userName": res.userName, "data": res.data.UIData});
        }
    },

    /**
     * emitSocketEvent : This will emit event to server.
     * @param type - Event Type
     * @param data - Data to sent
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

    moveClickedObject: function (data) {
        if (ACTIVITY_BUILD_SOMETHING_1.ref.isTeacherView) {
            return;
        }
        switch (data.event) {
            case ACTIVITY_BUILD_SOMETHING_1.events.START:
                ACTIVITY_BUILD_SOMETHING_1.ref.moveCellObject(this.tableView.cellAtIndex(data.index), data.position);
                break;
            case ACTIVITY_BUILD_SOMETHING_1.events.MOVE:
                if (ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem) {
                    ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.setPosition(data.position);
                } else {
                    if (data.index) {
                        ACTIVITY_BUILD_SOMETHING_1.ref.moveCellObject(this.tableView.cellAtIndex(data.index), data.position);
                    }
                }
                break;
            case ACTIVITY_BUILD_SOMETHING_1.events.STOP:
                if (ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem) {
                    let removeClickedItem = cc.callFunc(function () {
                        if (ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem) {
                            if (data.position) {
                                if (ACTIVITY_BUILD_SOMETHING_1.ref.gameState == ACTIVITY_BUILD_SOMETHING_1.gameState.TEACHER_DEMO) {
                                    ACTIVITY_BUILD_SOMETHING_1.ref.assembledList.push(ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem);
                                    ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject.splice(ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.tag - ACTIVITY_BUILD_SOMETHING_1.Tag.movedObject, 1);
                                    ACTIVITY_BUILD_SOMETHING_1.ref.tableView.reloadData();
                                }
                                ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.setPosition(data.position);
                            }
                            ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem = null;
                        }
                    });
                    ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.runAction(cc.sequence([cc.moveTo(0.25, data.position), removeClickedItem]));
                }
                break;
            case ACTIVITY_BUILD_SOMETHING_1.events.MOVE_BACK:
                if (ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem) {
                    ACTIVITY_BUILD_SOMETHING_1.ref.initialPosition = data.position;
                    ACTIVITY_BUILD_SOMETHING_1.ref.moveBackChanges();
                }
                break;
        }
    },

    updateGameState: function () {
        switch (ACTIVITY_BUILD_SOMETHING_1.ref.gameState) {
            case ACTIVITY_BUILD_SOMETHING_1.gameState.START:
                ACTIVITY_BUILD_SOMETHING_1.ref.resetScreen();
                break;
            case ACTIVITY_BUILD_SOMETHING_1.gameState.STOP:
                break;
            case ACTIVITY_BUILD_SOMETHING_1.gameState.TEACHER_DEMO:
                this.gameState = ACTIVITY_BUILD_SOMETHING_1.ref.gameState;
                break;
            case ACTIVITY_BUILD_SOMETHING_1.gameState.RESULT:
                this.gameState = ACTIVITY_BUILD_SOMETHING_1.ref.gameState;
                this.isResultViewOn = true;
                break;
        }
    },

    /**
     * syncData: This will update game state according to current game state of other users.
     * @param data
     */
    syncData: function (data) {
        if (!ACTIVITY_BUILD_SOMETHING_1.config) {
            ACTIVITY_BUILD_SOMETHING_1.ref.storedData = data;
            return;
        }
        if (data) {
            ACTIVITY_BUILD_SOMETHING_1.ref.gameState = data.gameState;
            switch (data.gameState) {
                case ACTIVITY_BUILD_SOMETHING_1.gameState.TEACHER_DEMO:
                    ACTIVITY_BUILD_SOMETHING_1.ref.createUIForData("", data.usersData, this);
                    ACTIVITY_BUILD_SOMETHING_1.ref.userDataForSync = data.usersData;
                    ACTIVITY_BUILD_SOMETHING_1.ref.createCardQueue(data.usersData);
                    ACTIVITY_BUILD_SOMETHING_1.ref.currentIsolatedNode = data.usersData.length;
                    break;

                case ACTIVITY_BUILD_SOMETHING_1.gameState.START: {
                    const {usersData} = data;
                    let user = usersData.find(user => user.userName === HDAppManager.username);
                    if (user) {
                        ACTIVITY_BUILD_SOMETHING_1.ref.createUIForData(HDAppManager.username, user.data, this);
                        ACTIVITY_BUILD_SOMETHING_1.ref.userDataForSync = user.data;
                        ACTIVITY_BUILD_SOMETHING_1.ref.createCardQueue(user.data);
                        ACTIVITY_BUILD_SOMETHING_1.ref.currentIsolatedNode = user.data.length;
                    }
                    if (this.isTeacherView) {
                        this.updateButtonVisibility(ACTIVITY_BUILD_SOMETHING_1.Tag.startButton, false);
                        this.updateButtonVisibility(ACTIVITY_BUILD_SOMETHING_1.Tag.stopButton, true);
                    }
                    break;
                }
                case ACTIVITY_BUILD_SOMETHING_1.gameState.RESULT: {
                    if (this.isTeacherView) {
                        ACTIVITY_BUILD_SOMETHING_1.ref.allUserData = [...data.usersData];
                        ACTIVITY_BUILD_SOMETHING_1.ref.showResultInfo([...ACTIVITY_BUILD_SOMETHING_1.ref.allUserData]);
                        this.resetScreen();
                        this.isResultViewOn = true;
                    }
                }
            }
        }
        ACTIVITY_BUILD_SOMETHING_1.ref.storedData = null;
    },

    createCardQueue: function (data) {
        this.cardQueue.length = 0;
        for (let index = 0; index < data.length; index++) {
            let currentNode = data[index];
            for (let nodeIndex = 0; nodeIndex < currentNode.data.length; nodeIndex++) {
                this.cardQueue.push(currentNode.data[nodeIndex].nodeData.name);
            }
        }
        var index = 0;
        while (index < this.dismantledObject.length) {
            var item = this.cardQueue.filter(element => element === this.dismantledObject[index].name);
            if (item.length > 0) {
                this.dismantledObject.splice(index, 1);
            } else {
                index++;
            }
        }
        ACTIVITY_BUILD_SOMETHING_1.ref.draggableObject.length = 0;
        if (ACTIVITY_BUILD_SOMETHING_1.ref.tableView) {
            ACTIVITY_BUILD_SOMETHING_1.ref.tableView.reloadData();
        }
    },

    /**
     * resetScreen: This will reset UI for everyone.
     */
    resetScreen: function () {
        //console.log("reset screen");
        ACTIVITY_BUILD_SOMETHING_1.config = JSON.parse(JSON.stringify(ACTIVITY_BUILD_SOMETHING_1.configData));
        ACTIVITY_BUILD_SOMETHING_1.ref.finalOrderList.length = 0;
        ACTIVITY_BUILD_SOMETHING_1.ref.animatingCharacters.forEach(element => element.removeFromParent(true));
        ACTIVITY_BUILD_SOMETHING_1.ref.animatingCharacters.length = 0;
        ACTIVITY_BUILD_SOMETHING_1.ref.cardQueue.length = 0;
        ACTIVITY_BUILD_SOMETHING_1.ref.currentIsolatedNode = 0;
        for (let index = 0; index < ACTIVITY_BUILD_SOMETHING_1.ref.assembledList.length; index++) {
            ACTIVITY_BUILD_SOMETHING_1.ref.assembledList[index].removeFromParent();
        }
        ACTIVITY_BUILD_SOMETHING_1.ref.currentItemToAssembledIndex = 0;

        ACTIVITY_BUILD_SOMETHING_1.ref.allUserData.length = 0;
        ACTIVITY_BUILD_SOMETHING_1.ref.userDataForSync.length = 0;
        ACTIVITY_BUILD_SOMETHING_1.ref.assembledList.length = 0;
        ACTIVITY_BUILD_SOMETHING_1.ref.initialPosition = null;
        if (ACTIVITY_BUILD_SOMETHING_1.ref.tableView) {
            ACTIVITY_BUILD_SOMETHING_1.ref.draggableObject.length = 0;
            ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject = [...ACTIVITY_BUILD_SOMETHING_1.ref.originalDismantalObj];
            // ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject = [...ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.dismantledObject.data];
            ACTIVITY_BUILD_SOMETHING_1.ref.tableView.reloadData();
        }

        if (this.isResultViewOn) {
            if (this.getChildByTag(ACTIVITY_BUILD_SOMETHING_1.Tag.resultLayer))
                this.removeChildByTag(ACTIVITY_BUILD_SOMETHING_1.Tag.resultLayer);
            if (this.getChildByTag(ACTIVITY_BUILD_SOMETHING_1.Tag.studentPreviewLayer))
                this.removeChildByTag(ACTIVITY_BUILD_SOMETHING_1.Tag.studentPreviewLayer);
            if (this.isTeacherView) {
                ACTIVITY_BUILD_SOMETHING_1.ref.parent.updateScript(ACTIVITY_BUILD_SOMETHING_1.config.teacherScripts.data[0].moduleStart.content.ops);
            }
        }

        if (this.isTeacherView) {
            this.updateButtonVisibility(ACTIVITY_BUILD_SOMETHING_1.Tag.startButton, true);
            this.updateButtonVisibility(ACTIVITY_BUILD_SOMETHING_1.Tag.stopButton, false);
        }
        this.isResultViewOn = false;
        ACTIVITY_BUILD_SOMETHING_1.ref.getChildByTag(ACTIVITY_BUILD_SOMETHING_1.Tag.backgroundSprite).setTexture(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + "background.png");
    },

    createUIForData: function (userName, data, parent) {
        for (let index = 0; index < data.length; index++) {
            var currentNodeData = data[index].data;
            for (let indexNode = 0; indexNode < currentNodeData.length; indexNode++) {
                var position = currentNodeData[indexNode].position;
                var nodeData = currentNodeData[indexNode].nodeData;
                var scaleX = currentNodeData[indexNode].scaleX;
                var scaleY = currentNodeData[indexNode].scaleY;
                var node = this.addSprite(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + nodeData.imageName, position, parent);
                node.setScaleX(scaleX);
                node.setScaleY(scaleY);
                node.setLocalZOrder(nodeData.localZOrder);
                node.setName(nodeData.name);
                node.setUserData(nodeData);
                let objectIndex = this.getDismantledObjectIndex(nodeData.name);
                if (index != -1) {
                    node.setTag(ACTIVITY_BUILD_SOMETHING_1.Tag.movedObject + objectIndex);
                }
                //Manage Game State
                switch (ACTIVITY_BUILD_SOMETHING_1.ref.gameState) {
                    case ACTIVITY_BUILD_SOMETHING_1.gameState.TEACHER_DEMO:
                        ACTIVITY_BUILD_SOMETHING_1.ref.assembledList.push(node);
                        break;
                    case ACTIVITY_BUILD_SOMETHING_1.gameState.START:
                        ACTIVITY_BUILD_SOMETHING_1.ref.assembledList.push(node);
                        break;
                }
            }
        }
    },

    getDismantledObjectIndex: function (name) {
        let dismantledData = ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject;
        for (let index = 0; index < dismantledData.length; index++) {
            var curObject = dismantledData[index];
            if (curObject.name == name) {
                return index;
            }
        }
        return -1;
    },

    /**
     * buttonCallback: This method handles button callback.
     * @param sender
     * @param type
     */
    buttonCallback: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                switch (sender.getTag()) {
                    case ACTIVITY_BUILD_SOMETHING_1.Tag.startButton:
                        this.parent.setResetButtonActive(true);
                        this.updateButtonVisibility(ACTIVITY_BUILD_SOMETHING_1.Tag.startButton, false);
                        this.updateButtonVisibility(ACTIVITY_BUILD_SOMETHING_1.Tag.stopButton, true);
                        ACTIVITY_BUILD_SOMETHING_1.ref.gameState = ACTIVITY_BUILD_SOMETHING_1.gameState.START;
                        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                            'eventType': ACTIVITY_BUILD_SOMETHING_1.socketEventKey.GAME_STATE,
                            'data': {
                                'userName': HDAppManager.userName,
                                "gameState": ACTIVITY_BUILD_SOMETHING_1.gameState.START
                            }
                        });
                        break;
                    case ACTIVITY_BUILD_SOMETHING_1.Tag.stopButton:
                        this.updateButtonVisibility(ACTIVITY_BUILD_SOMETHING_1.Tag.startButton, true);
                        this.updateButtonVisibility(ACTIVITY_BUILD_SOMETHING_1.Tag.stopButton, false);
                        ACTIVITY_BUILD_SOMETHING_1.ref.gameState = ACTIVITY_BUILD_SOMETHING_1.gameState.STOP;
                        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                            'eventType': ACTIVITY_BUILD_SOMETHING_1.socketEventKey.GAME_STATE,
                            'data': {
                                'userName': HDAppManager.userName,
                                "gameState": ACTIVITY_BUILD_SOMETHING_1.gameState.STOP
                            }
                        });

                        this.showResultInfo([...ACTIVITY_BUILD_SOMETHING_1.ref.allUserData]);
                        this.resetScreen();
                        this.isResultViewOn = true;
                        break;

                    case ACTIVITY_BUILD_SOMETHING_1.Tag.closePreview:
                        this.closePreview();
                        break;
                    case ACTIVITY_BUILD_SOMETHING_1.Tag.leftButton:
                        if (!ACTIVITY_BUILD_SOMETHING_1.ref.isStudentInteractionEnable) {
                            return
                        }
                        var offset = 60;
                        var finalOffset = cc.clampf(this.tableView.getContentOffset().x + offset, this.tableView.minContainerOffset().x, this.tableView.maxContainerOffset().x);
                        this.tableView.setContentOffset(cc.p(finalOffset, this.tableView.getContentOffset().y), 1);
                        break;
                    case ACTIVITY_BUILD_SOMETHING_1.Tag.rightButton:
                        if (!ACTIVITY_BUILD_SOMETHING_1.ref.isStudentInteractionEnable) {
                            return
                        }
                        var offset = -60;
                        var finalOffset = cc.clampf(this.tableView.getContentOffset().x + offset, this.tableView.minContainerOffset().x, this.tableView.maxContainerOffset().x);
                        this.tableView.setContentOffset(cc.p(finalOffset, this.tableView.getContentOffset().y), 1);
                        break;
                }
        }
    },

    updateScrollOffset: function (isLeft) {
        if (!ACTIVITY_BUILD_SOMETHING_1.ref) {
            return;
        }
        if (!ACTIVITY_BUILD_SOMETHING_1.ref.isStudentInteractionEnable) {
            return;
        }
        ACTIVITY_BUILD_SOMETHING_1.ref.isLeft = isLeft;
        if (this.interval) {
            return;
        }
        if (ACTIVITY_BUILD_SOMETHING_1.ref.scrollEvent == null) {
            this.interval = clearInterval();
            let offset = isLeft ? 60 : -60;
            let finalOffset = cc.clampf(this.tableView.getContentOffset().x + offset, this.tableView.minContainerOffset().x, this.tableView.maxContainerOffset().x);
            this.tableView.setContentOffset(cc.p(finalOffset, this.tableView.getContentOffset().y), 1);

        }
        this.interval = setInterval((isLeft) => {
            if (ACTIVITY_BUILD_SOMETHING_1.ref.scrollEvent && ACTIVITY_BUILD_SOMETHING_1.ref.scrollEvent == cc.EventMouse.DOWN) {
                let offset = ACTIVITY_BUILD_SOMETHING_1.ref.isLeft ? 60 : -60;

                let finalOffset = cc.clampf(this.tableView.getContentOffset().x + offset, this.tableView.minContainerOffset().x, this.tableView.maxContainerOffset().x);
                this.tableView.setContentOffset(cc.p(finalOffset, this.tableView.getContentOffset().y), 0.1);
            }
        }, 150);
    },

    updateButtonVisibility: function (tag, visible) {
        var button = this.getChildByTag(tag);
        button.setVisible(visible);
         button.setEnabled(visible);
    },

    /**
     * mouseControlEnable: To check if mouse is enabled or not
     * @param location
     * @returns {boolean}
     */
    mouseControlEnable: function (location) {
        for (let obj of this.handIconUI) {
            if (obj && obj.getParent() && cc.rectContainsPoint(obj.getBoundingBox(), obj.getParent().convertToNodeSpace(location)) && this.isStudentInteractionEnable && obj.isEnabled()) {
                return true;
            }
        }
        return false;
    },

    /**
     * setCardContent: This will setup table view for wheel items.
     */
    setCardContent: function () {
        let position = cc.p(this.getPositionForTableView(), 0);
        let width = this.getWidthOfCarousel();

        let baseColorLayer = this.createColourLayer(cc.color(ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.carouselBackground.color.r, ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.carouselBackground.color.g, ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.carouselBackground.color.b, ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.carouselBackground.color.a), width, this.carouselHeight, position, this, 5);
        baseColorLayer.setTag(ACTIVITY_BUILD_SOMETHING_1.Tag.carouselBaseImage);

        let carouselBaseImage = this.addSprite(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.carouselBackgroundImage.imageName, cc.p(position.x - 10, position.y), this);
        carouselBaseImage.setLocalZOrder(1);
        let scaleX = (baseColorLayer._contentSize.width + 20) / carouselBaseImage._contentSize.width;
        let scaleY = (baseColorLayer._contentSize.height + 40) / carouselBaseImage._contentSize.height;
        carouselBaseImage.setScaleX(scaleX);
        carouselBaseImage.setScaleY(scaleY);
        carouselBaseImage.setAnchorPoint(0, 0);

        let carouselBorderImage = this.addSprite(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.carouselBackgroundBorderImage.imageName, cc.p(position.x - 10, position.y), this);
        carouselBorderImage.setLocalZOrder(5);
        carouselBorderImage.setScaleX(scaleX);
        carouselBorderImage.setScaleY(scaleY);
        carouselBorderImage.setAnchorPoint(0, 0);


        let leftButton = this.createButton(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + ACTIVITY_BUILD_SOMETHING_1.config.buttons.data.leftMoveButton.enableState, ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + ACTIVITY_BUILD_SOMETHING_1.config.buttons.data.leftMoveButton.pushedState, "", 8, ACTIVITY_BUILD_SOMETHING_1.Tag.leftButton, cc.p(position.x, position.y), baseColorLayer, null, ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + ACTIVITY_BUILD_SOMETHING_1.config.buttons.data.leftMoveButton.enableState);
        leftButton.setLocalZOrder(2);
        leftButton.setPosition(cc.p(leftButton.getContentSize().width * 0.5, leftButton.getContentSize().height * 0.5 + 14));
        leftButton.setSwallowTouches(false);

        let rightButton = this.createButton(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + ACTIVITY_BUILD_SOMETHING_1.config.buttons.data.rightMoveButton.enableState, ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + ACTIVITY_BUILD_SOMETHING_1.config.buttons.data.rightMoveButton.pushedState, "", 8, ACTIVITY_BUILD_SOMETHING_1.Tag.rightButton, cc.p(leftButton.getPositionX() + (width - leftButton.getContentSize().width), leftButton.getContentSize().height * 0.5 + 14), baseColorLayer, null, ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + ACTIVITY_BUILD_SOMETHING_1.config.buttons.data.rightMoveButton.enableState);
        rightButton.setLocalZOrder(2);
        rightButton.setSwallowTouches(false);
        this.tableView = new cc.TableView(this, cc.size(width - (leftButton.getContentSize().width * 2), this.carouselHeight + 11));
        this.tableView.setPosition(cc.p(position.x + leftButton.getContentSize().width, position.y + 14));
        this.tableView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this.tableView.setBounceable(false);
        this.tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        this.tableView.setDataSource(this);
        this.tableView.setDelegate(this);
        this.tableView.setTouchEnabled(false);
        this.addChild(this.tableView, 2);

    },

    /**
     * getWidthOfCarousel: This will calculate the width of tableview width.
     * @returns {number}
     */
    getWidthOfCarousel: function () {
        let cellWidthSize = 0;
        let maxWidth = cc.winSize.width * 0.6;
        for (let idx = 0; idx < ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject.length; ++idx) {
            var spriteTexture = new cc.Sprite(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject[idx].imageName);
            let aspectRatio = spriteTexture.getContentSize().width / spriteTexture.getContentSize().height;
            var width = (ACTIVITY_BUILD_SOMETHING_1.ref.carouselHeight * aspectRatio) ? (ACTIVITY_BUILD_SOMETHING_1.ref.carouselHeight * aspectRatio) : ACTIVITY_BUILD_SOMETHING_1.ref.carouselHeight;
            if (cellWidthSize + width >= maxWidth) {
                return cellWidthSize;
            } else {
                cellWidthSize += width;
            }
        }
        return cellWidthSize;
    },

    /**
     * getPositionForTableView: To get x position of the table view.
     * @returns {number}
     */
    getPositionForTableView: function () {
        let width = this.getWidthOfCarousel();
        let xPos = (cc.winSize.width * 0.5) - (width * 0.5);
        return xPos;
    },

    /**
     * isCellSelected: To check id cell is selected of not.
     * @param data
     * @returns {boolean}
     */
    isCellSelected: function (studentDetails) {
        let status = false;
        this.cardQueue.forEach((studentName) => {
            if (studentName == studentDetails.name)
                status = true;
        });
        return status;
    },

    /**
     * To set TableView cell size
     * @param table
     * @param idx
     * @returns {cc.Size}
     */
    tableCellSizeForIndex: function (table, idx) {
        var spriteTexture = new cc.Sprite(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject[idx].imageName);
        let aspectRatio = spriteTexture.getContentSize().width / spriteTexture.getContentSize().height;
        var width = (table.getViewSize().height * aspectRatio) ? (table.getViewSize().height * aspectRatio) : table.getViewSize().height;

        return cc.size(width, table.getViewSize().height);
    },

    /**
     * To create tableview cell
     * @param table
     * @param idx
     * @returns {TableViewCell}
     */


    tableCellAtIndex: function (table, idx) {
        let cardCell = table.dequeueCell();
        let cellSize = this.tableCellSizeForIndex(table, idx);
        if (cardCell == null) {
            cardCell = new ACTIVITY_BUILD_SOMETHING_1.HDCardCell(cellSize);
        }
        cardCell.tag = idx;
        cardCell.createUI(idx, ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject[idx], cardCell, this.isCellSelected(ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject[idx]));
        this.draggableObject.push(cardCell);
        return cardCell;
    },

    /**
     * numberOfCellsInTableView: Return number of cell in table view.
     * @param table
     * @returns {*}
     */
    numberOfCellsInTableView: function (table) {
        return ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject.length;
    },
    /**
     * tableCellTouched: To perform action when cell is touched.
     * @param table
     * @param cell
     */
    tableCellTouched: function (table, cell) {

    },
    tableCellHighlight: function (table, cell) {
        ACTIVITY_BUILD_SOMETHING_1.ref.mousePressedDown = true;
    },

    /**
     * getIndexOfCurrentElement: It will provide index of data.
     * @param data
     * @returns {number}
     */
    getIndexOfCurrentElement: function (data) {
        for (var index = 0; index < ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject.length; index++) {
            if (data.name == ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject[index].name) {
                return index;
            }
        }
        return -1;
    },

    scrollViewDidScroll: function (view) {
        var offset = view.getContentOffset();
        if (ACTIVITY_BUILD_SOMETHING_1.ref.isTeacherView && ACTIVITY_BUILD_SOMETHING_1.ref.gameState == ACTIVITY_BUILD_SOMETHING_1.gameState.TEACHER_DEMO) {
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                'eventType': ACTIVITY_BUILD_SOMETHING_1.socketEventKey.SCROLL_OFFSET,
                'data': {'userName': HDAppManager.userName, "offset": offset}
            });
        }
    },

    moveCellObject: function (cell, position) {
        ACTIVITY_BUILD_SOMETHING_1.ref.tableView._dragging = false;
        cell.stopAllActions();
        let completedAnimation = cc.callFunc(function () {
            if (ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem)
                return;

            var lastIndex = ACTIVITY_BUILD_SOMETHING_1.ref.cardQueue.length == 0 ? -1 : ACTIVITY_BUILD_SOMETHING_1.ref.getIndexOfCurrentElement(ACTIVITY_BUILD_SOMETHING_1.ref.cardQueue[0]);
            if (lastIndex != -1) {
                ACTIVITY_BUILD_SOMETHING_1.ref.tableView.updateCellAtIndex(lastIndex);
            }
            ACTIVITY_BUILD_SOMETHING_1.ref.cardQueue.push(ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject[cell.tag].name);
            cell.cardElementImage.setVisible(false);

            var finalPosition = position ? position : ACTIVITY_BUILD_SOMETHING_1.ref.mousePos;//(cell.getParent().convertToWorldSpace(cc.p(cell.getPositionX() + cell.getContentSize().width*0.5, cell.getPositionY() + cell.getContentSize().height*0.5)));
            ACTIVITY_BUILD_SOMETHING_1.ref.initialPosition = finalPosition;
            ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem = ACTIVITY_BUILD_SOMETHING_1.ref.addSprite(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject[cell.tag].imageName, finalPosition, ACTIVITY_BUILD_SOMETHING_1.ref);
            ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.setPosition(finalPosition);
            ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.setLocalZOrder(100);
            ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.setName(ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject[cell.tag].name);
            ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.setUserData(cell.cellData);

            ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.setScaleX(0.5);
            ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.setScaleY(0.5);
            ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.setLocalZOrder(ACTIVITY_BUILD_SOMETHING_1.ref.dismantledObject[cell.tag].localZOrder);
            ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.tag = ACTIVITY_BUILD_SOMETHING_1.Tag.movedObject + cell.tag;
            if (ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem && ACTIVITY_BUILD_SOMETHING_1.ref.isTeacherView) {
                ACTIVITY_BUILD_SOMETHING_1.ref.moveObject(finalPosition, ACTIVITY_BUILD_SOMETHING_1.ref.clickedItem.tag - ACTIVITY_BUILD_SOMETHING_1.Tag.movedObject, ACTIVITY_BUILD_SOMETHING_1.events.START);
            }
        });
        this.runAction(cc.sequence(completedAnimation, cc.scaleTo(0.1, 1, 1), cc.scaleTo(0.2, 1, 1)));
    },

    showResultInfo: function (data) {
        if (data.length > 0) {
            this.parent.setResetButtonActive(true);
            this.gameState = ACTIVITY_BUILD_SOMETHING_1.gameState.RESULT;
            var scrollLayer = new ACTIVITY_BUILD_SOMETHING_1.ResultLayer(data);
            scrollLayer.setTag(ACTIVITY_BUILD_SOMETHING_1.Tag.resultLayer);
            this.addChild(scrollLayer, 20);
            this.resultScreenDataForSync = [...data];
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                'eventType': ACTIVITY_BUILD_SOMETHING_1.socketEventKey.GAME_STATE,
                'data': {
                    'userName': HDAppManager.userName,
                    "gameState": ACTIVITY_BUILD_SOMETHING_1.gameState.RESULT
                }
            });
        } else {
            this.gameState = ACTIVITY_BUILD_SOMETHING_1.gameState.TEACHER_DEMO;
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                'eventType': ACTIVITY_BUILD_SOMETHING_1.socketEventKey.GAME_STATE,
                'data': {
                    'userName': HDAppManager.userName,
                    "gameState": ACTIVITY_BUILD_SOMETHING_1.gameState.TEACHER_DEMO
                }
            });
        }
        this.updateRoomData();
    },


    showPreviewToAll: function (res) {
        let isAllCorrect = false;
        // touch prevention button
        let filteredArray = res.data.filter((item, idx) => res.data.findIndex((obj, pos) => obj.nodeName === item.nodeName) === idx);
        // console.log("filterArray", filteredArray,filteredArray.length === ACTIVITY_BUILD_SOMETHING_1.config.gameInfo.assembleObjectInfo.length, filteredArray.every(item => item.isCorrect && item.data.length === ACTIVITY_BUILD_SOMETHING_1.config.gameInfo.assembleObjectInfo.find(obj => obj.name === item.nodeName).partsCount));
        if (filteredArray.length === ACTIVITY_BUILD_SOMETHING_1.config.gameInfo.assembleObjectInfo.length && filteredArray.every(item => item.isCorrect && item.data.length === ACTIVITY_BUILD_SOMETHING_1.config.gameInfo.assembleObjectInfo.find(obj => obj.name === item.nodeName).partsCount)) {
            isAllCorrect = true;
        }
       // this.triggerScript(ACTIVITY_BUILD_SOMETHING_1.config.teacherScripts.data[isAllCorrect ? "TargetAssembledSuccessfully" : "TargetAssembledUnsuccessfully"].content);
         this.triggerScript(ACTIVITY_BUILD_SOMETHING_1.config.teacherScripts.data[1].TargetAssembledUnsuccessfully.content);
         this.triggerScript(ACTIVITY_BUILD_SOMETHING_1.config.teacherScripts.data[2].TargetAssembledSuccessfully.content);
 
       var bg = this.getChildByTag(ACTIVITY_BUILD_SOMETHING_1.Tag.studentPreviewLayer);
        if (bg) {
            this.getChildByTag(ACTIVITY_BUILD_SOMETHING_1.Tag.studentPreviewLayer).removeAllChildren();
            bg.setTexture(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + (isAllCorrect ? ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.winBG.imageName : ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.looseBG.imageName));
        } else {
            bg = this.addSprite(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + (isAllCorrect ? ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.winBG.imageName : ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.looseBG.imageName), cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5), this);
            bg.setLocalZOrder(30);
            bg.setTag(ACTIVITY_BUILD_SOMETHING_1.Tag.studentPreviewLayer);
        }
        var position = isAllCorrect ? ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.winBG.usernamePosition : ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.looseBG.usernamePosition;
        this.createUIForData(res.userName, res.data, bg);
        var touchPrevention = this.createButton(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + "close.png", null, null, null, null, cc.p(bg.width * 0.5, bg.height * 0.5), bg, this, null);
        touchPrevention.setScale(this.width / touchPrevention.width, this.height / touchPrevention.height);
        touchPrevention.setOpacity(0);

        if (ACTIVITY_BUILD_SOMETHING_1.ref.isTeacherView) {
            var cross = this.createButton(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + "close.png", null, null, null, ACTIVITY_BUILD_SOMETHING_1.Tag.closePreview, cc.p(bg.width * 0.9, bg.height * 0.85), bg, this, null);
            cross.setLocalZOrder(199);
        }
    },

    closePreview: function () {
        this.removeChildByTag(ACTIVITY_BUILD_SOMETHING_1.Tag.studentPreviewLayer);
    },

    requestForPreview: function (data) {
        this.showPreviewToAll(data);

        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            'eventType': ACTIVITY_BUILD_SOMETHING_1.socketEventKey.SHOW_STUDENT_BUILD,
            'data': data
        });

    },

    reset: function () {
        this.resetScreen();
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            'eventType': ACTIVITY_BUILD_SOMETHING_1.socketEventKey.RESET_UI,
            'data': {'userName': HDAppManager.userName}
        });
        this.gameState = ACTIVITY_BUILD_SOMETHING_1.gameState.TEACHER_DEMO;
        ACTIVITY_BUILD_SOMETHING_1.ref.updateRoomData();

        this.parent.setResetButtonActive(false);


    },
});

/**
 * Card Cell
 */
ACTIVITY_BUILD_SOMETHING_1.HDCardCell = cc.TableViewCell.extend({
    cellData: null,
    cellHorizontalPadding: 10,
    cellVerticalPadding: 30,
    cardTextHeight: 25,
    highlightLayer: null,
    cardElementImage: null,

    ctor: function (cellSize) {
        this._super();
        this.setContentSize(cellSize);
        this.cellVerticalPadding = this.getContentSize().height * 0.4;
        return true;
    },

    onEnter: function () {
        this._super();
    },

    createUI: function (idx, data, parent, isSelected) {
        this.cellData = data;
        this.tag = idx;
        this.removeAllChildren(true);

        let colourLayer = new cc.LayerColor(cc.color(ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.carouselBoxBackground.color.r, ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.carouselBoxBackground.color.g, ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.carouselBoxBackground.color.b, ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.carouselBoxBackground.color.a), this.width - this.cellHorizontalPadding, this.height - this.cellVerticalPadding);
        colourLayer.setPosition(cc.p(this.cellHorizontalPadding * 0.5, this.cellVerticalPadding * 0.5));
        parent.addChild(colourLayer, 5);

        this.cardElementImage = cc.Sprite.create(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + data.imageName);
        this.cardElementImage.setPosition(this.cellHorizontalPadding * 0.5, this.cellVerticalPadding * 0.5);
        this.cardElementImage.setAnchorPoint(0, 0);
        let aspectRatio = this.cardElementImage.getContentSize().width / this.cardElementImage.getContentSize().height;
        var scaleFactorX = (colourLayer.getContentSize().height * 0.9 * aspectRatio) / this.cardElementImage.getContentSize().width;
        var scaleFactorY = colourLayer.getContentSize().height * 0.9 / this.cardElementImage.getContentSize().height;
        this.cardElementImage.setScaleX(scaleFactorX);
        this.cardElementImage.setScaleY(scaleFactorY);
        parent.addChild(this.cardElementImage, 6);

        let textBaseLayer = new cc.LayerColor(cc.color(ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.carouselBoxCardBackground.color.r, ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.carouselBoxCardBackground.color.g, ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.carouselBoxCardBackground.color.b, ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.carouselBoxCardBackground.color.a), this._contentSize.width - this.cellHorizontalPadding, this.cardTextHeight);
        textBaseLayer.setPosition(cc.p(this.cellHorizontalPadding * 0.5, this._contentSize.height - this.cellVerticalPadding - this.cardTextHeight));
        parent.addChild(textBaseLayer, 7);

        let labelCardText = cc.LabelTTF.create(data.cardValue, ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.carouselBoxCardText.font, ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.carouselBoxCardText.fontSize, cc.size(0., 0), cc.TEXT_ALIGNMENT_CENTER);
        labelCardText.setPosition(cc.p(textBaseLayer._contentSize.width * 0.5, textBaseLayer._contentSize.height * 0.5));
        labelCardText.setColor(cc.color(ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.carouselBoxCardText.color.r, ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.carouselBoxCardText.color.g, ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.carouselBoxCardText.color.b, ACTIVITY_BUILD_SOMETHING_1.config.assets.sections.carouselBoxCardText.color.a));
        textBaseLayer.addChild(labelCardText, 8);

        if (isSelected) {
            this.cardElementImage.setVisible(false);
        } else {
            this.cardElementImage.setVisible(true);
        }
    },

});


ACTIVITY_BUILD_SOMETHING_1.ResultLayer = HDBaseLayer.extend({
    data: [],
    totalRow: 0,
    winSize: cc.winSize,
    container: null,
    ctor: function (data) {
        this._super();
        this.data = data;
    },

    onEnter: function () {
        this._super();
        this.setUpUI();
    },

    setUpUI: function () {
        this.addSprite(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + "background.png", cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5), this);
        this.setUpScrollContainer();
        this.setUpScrollView();
    },

    setUpScrollContainer: function () {
        var verticalSpacing = this.height * 0.07;
        this.totalRow = this.data.length < 5 ? Math.ceil(this.data.length / 2) : Math.ceil(this.data.length / 4);
        var innerContentHeight = this.totalRow <= 2 ? this.height * 0.8 : this.totalRow * this.width * this.getScaleFactor() + this.totalRow * verticalSpacing;
        this.container = new cc.Layer();
        this.container.setContentSize(this.getScrollViewWidth(), innerContentHeight);
        this.populateDataInContainer();
    },

    setUpScrollView: function () {
        var scrollView = new cc.ScrollView(cc.size(this.getScrollViewWidth(), this.height * 0.8), this.container);
        var contentOffset = scrollView.getViewSize().height - this.container.height;
        scrollView.setContentOffset(cc.p(0, contentOffset));
        scrollView.setTouchEnabled(true);
        scrollView.setBounceable(false);
        scrollView.setPosition(this.getScrollPosition());
        scrollView.setDelegate(this);
        scrollView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.addChild(scrollView);
    },

    populateDataInContainer: function () {
        var horizontalSpacing = this.width * 0.02;
        var verticalSpacing = this.height * 0.07;
        var columnNo = this.data.length <= 2 ? this.data.length : this.data.length > 8 ? 4 : Math.ceil(this.data.length / 2);
        for (var index = 0; index < this.data.length; index++) {

            var frame = this.createFrame();
            var cell = this.createBanner();
            ACTIVITY_BUILD_SOMETHING_1.ref.createUIForData(ACTIVITY_BUILD_SOMETHING_1.ref.allUserData[index].userName, ACTIVITY_BUILD_SOMETHING_1.ref.allUserData[index].data, cell);
            cell.setScale(frame.width * 0.75 / cell.width);
            frame.setScale(this.getScaleFactor());
            cell.setPosition(frame.width * 0.1, frame.height * 0.1);
            frame.addChild(cell);
            frame.setTag(index);
            frame.setPosition((index % columnNo) * (horizontalSpacing + this.getFramesWidth()), this.container.height - Math.floor((index + columnNo) / columnNo) * ((frame.width * frame.getScale()) + verticalSpacing));
            this.addStudentName(ACTIVITY_BUILD_SOMETHING_1.ref.allUserData[index].userName, frame);
            this.container.addChild(frame);

        }
    },

    createBanner: function () {
        var cell = new cc.LayerColor(HDConstants.YellowColor, this.winSize.width, this.winSize.height);
        cell.setAnchorPoint(0, 0);
        cell.setOpacity(0)
        return cell;
    },

    createFrame: function () {
        var colorLayer = new cc.LayerColor(HDConstants.YellowColor, this.winSize.width, this.winSize.height);
        colorLayer.setAnchorPoint(0, 0);
        colorLayer.setOpacity(0);
        var button = new ccui.Button(ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + "reward_screen_frame.png", ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + "reward_screen_frame.png", ACTIVITY_BUILD_SOMETHING_1.spriteBasePath + "reward_screen_frame.png");
        button.addTouchEventListener(this.buttonCallback, this);
        button.setScale(this.winSize.width / button.width);
        button.setAnchorPoint(0, 0);
        colorLayer.addChild(button);
        return colorLayer;
    },

    addStudentName: function (name, parent) {
        var label = this.createTTFLabel(name, HDConstants.Sassoon_Regular, 50, HDConstants.Black, cc.p(parent.width * 0.5, parent.height * 0.1), parent);
    },

    getFramesWidth: function () {
        var columns = this.data.length <= 2 ? this.data.length : this.data.length > 8 ? 4 : Math.ceil(this.data.length / 2);
        if (columns <= 2) {
            return (this.width * 0.43 / columns);
        } else if (columns == 3) {
            return (this.width * 0.63 / columns);
        } else {
            return (this.width * 0.83 / columns);
        }
    },

    getFrameHeight: function () {
        return this.height * 0.75 / 2;
    },

    getScaleFactor() {
        return Math.min(this.getFramesWidth() / this.width, this.getFrameHeight() / this.height);
    },

    getScrollViewWidth() {
        var columns = this.data.length <= 2 ? this.data.length : this.data.length > 8 ? 4 : Math.ceil(this.data.length / 2);
        return (this.width * this.getScaleFactor() + this.width * 0.02) * columns;
    },

    getScrollPosition() {
        return cc.p((this.width - this.getScrollViewWidth()) * 0.5, this.height * 0.1);
    },

    buttonCallback: function (pSender, type) {
        if (type == ccui.Widget.TOUCH_ENDED) {
            ACTIVITY_BUILD_SOMETHING_1.ref.requestForPreview(this.data[pSender.parent.getTag()]);
        }
    }
});



