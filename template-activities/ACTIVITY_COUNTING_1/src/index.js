/**
 * This file contain logic for Counting game module
 **/
var ACTIVITY_COUNTING_1 = {};
ACTIVITY_COUNTING_1.Tag = {
    baseHiddenObject: 100,
    baseCountText: 200,
    resetButton: 201
}

ACTIVITY_COUNTING_1.socketEvents = {
    SHOW_CARD: 1,
    RESET: 2
}
ACTIVITY_COUNTING_1.socketEventKey = {
    singleEvent: "SingleEvent"
}
ACTIVITY_COUNTING_1.ref = null;

ACTIVITY_COUNTING_1.CountingLayer = HDBaseLayer.extend({
    self: null,
    baseLayer: null,
    revealedObjects: [],
    isStudentInteractionEnable: false,
    storedData: null,

    ctor: function () {
        this._super();
    },

    onEnter: function () {
        this._super();
        let ref = this;
        ACTIVITY_COUNTING_1.ref = this;
        cc.loader.loadJson("res/Activity/ACTIVITY_COUNTING_1/config.json", function (error, config) {
            ACTIVITY_COUNTING_1.ref.config = config;
            ACTIVITY_COUNTING_1.ref.resourcePath = "res/Activity/" + "ACTIVITY_COUNTING_1/res/"
            ACTIVITY_COUNTING_1.ref.soundPath = ACTIVITY_COUNTING_1.ref.resourcePath + "Sound/";
            ACTIVITY_COUNTING_1.ref.animationBasePath = ACTIVITY_COUNTING_1.ref.resourcePath + "AnimationFrames/";
            ACTIVITY_COUNTING_1.ref.spriteBasePath = ACTIVITY_COUNTING_1.ref.resourcePath + "Sprite/";
            ACTIVITY_COUNTING_1.ref.isTeacherView = HDAppManager.isTeacherView;
            ACTIVITY_COUNTING_1.ref.isCountingEnabled = ACTIVITY_COUNTING_1.ref.config.gameInfo.isCounting;

            ACTIVITY_COUNTING_1.ref.isStudentInteractionEnable = ACTIVITY_COUNTING_1.ref.isTeacherView ? true : false;
            ref.setupUI();
            ref.loadAudio();
            if (ACTIVITY_COUNTING_1.ref.storedData) {
                ACTIVITY_COUNTING_1.ref.syncData(ACTIVITY_COUNTING_1.ref.storedData)
            }
            ACTIVITY_COUNTING_1.ref.triggerScript(ACTIVITY_COUNTING_1.ref.config.teacherScripts.moduleStart.ops);
            ACTIVITY_COUNTING_1.ref.triggerTip(ACTIVITY_COUNTING_1.ref.config.teacherTips.moduleStart);
        });
    },

    onExit: function () {
        this._super();
        ACTIVITY_COUNTING_1.ref.revealedObjects.length = 0;
        ACTIVITY_COUNTING_1.ref.storedDat = null;
        ACTIVITY_COUNTING_1.ref = null;
    },
    /**
     * To create initial UI for teacher and student.
     **/
    setupUI: function () {
        this.setBackground(ACTIVITY_COUNTING_1.ref.spriteBasePath + ACTIVITY_COUNTING_1.ref.config.graphicalAssets.background.name);
        this.baseLayer = this.createColourLayer(cc.color(0, 0, 0, 0), cc.winSize.width, cc.winSize.height, cc.p(0, 0), this, 1);
        this.setupHiddenUI();
        if (ACTIVITY_COUNTING_1.ref.isTeacherView && !ACTIVITY_COUNTING_1.ref.storedData) { //Set only for Teacher
            this.updateRoomData();
        }
    },
    /**
     * To load game audio
     **/
    loadAudio: function () {
        cc.loader.load(ACTIVITY_COUNTING_1.ref.soundPath + ACTIVITY_COUNTING_1.ref.config.audioAssets.tapHiddenObject.name);
    },
    /**
     * setupHiddenUI: Set up initial UI where objects are hidden.
     */
    setupHiddenUI: function () {
        var hiddenObjects = ACTIVITY_COUNTING_1.ref.config.countingData;
        if (hiddenObjects && hiddenObjects.length > 0) {
            for (let index = 0; index < hiddenObjects.length; index++) {
                this.createHiddenObject(hiddenObjects[index], index);
            }
        }
    },
    /**
     * createHiddenObject: Setup hidden objects.
     * @param data
     * @param index
     */
    createHiddenObject: function (data, index) {
        var hiddenButton = this.createButton(ACTIVITY_COUNTING_1.ref.spriteBasePath + data.defaultImageName, ACTIVITY_COUNTING_1.ref.spriteBasePath + data.defaultImageName, "", 8, ACTIVITY_COUNTING_1.Tag.baseHiddenObject + index, data.position, this.baseLayer, this, ACTIVITY_COUNTING_1.ref.spriteBasePath + data.revealImageName);
        hiddenButton.setScale(data.scale)
        if (ACTIVITY_COUNTING_1.ref.isCountingEnabled) {
            var countText = this.createTTFLabel("", data.countFont, data.countFontSize, cc.color(data.countTextColor.r, data.countTextColor.g, data.countTextColor.b, data.countTextColor.a), data.countTextPosition, this.baseLayer);
            countText.tag = ACTIVITY_COUNTING_1.Tag.baseCountText + index;
            countText.setLocalZOrder(10);
            countText.setVisible(false);
        }
    },

    /**
     * updateRoomData: This will be update room data which is required for game state management.
     */
    updateRoomData: function () {
        SocketManager.emitCutomEvent("SingleEvent", {
            'eventType': HDSocketEventType.UPDATE_ROOM_DATA,
            'roomId': HDAppManager.roomId,
            'data': {
                "roomId": HDAppManager.roomId,
                "roomData": {
                    "activity": ACTIVITY_COUNTING_1.ref.config.properties.namespace,
                    "data": ACTIVITY_COUNTING_1.ref.revealedObjects,
                    "activityStartTime": HDAppManager.getActivityStartTime()
                }
            }
        }, null);
    },

    /**
     * syncData: This will update game state according to current game state of other users.
     * @param data
     */
    syncData: function (data) {
        if (!ACTIVITY_COUNTING_1.ref.config) {
            ACTIVITY_COUNTING_1.ref.storedData = data;
            return;
        }
        if (data && data.length != 0) {
            ACTIVITY_COUNTING_1.ref.syncAllObjects(data);
            ACTIVITY_COUNTING_1.ref.storedData = null;
        }
    },
    /**
     * socketListener: This will receive all the emitted socket events.
     * @param res
     */
    socketListener: function (res) {
        if (!ACTIVITY_COUNTING_1.ref) {
            return;
        }
        switch (res.eventType) {
            case HDSocketEventType.DISABLE_INTERACTION:
                ACTIVITY_COUNTING_1.ref.disableInteraction(res.data);
                break;
            case HDSocketEventType.STUDENT_TURN:
                ACTIVITY_COUNTING_1.ref.studentTurn(res.data);
                break;
            case HDSocketEventType.GAME_MESSAGE:
                ACTIVITY_COUNTING_1.ref.gameEvents(res.data);
                break;
        }
    },
    /**
     * gameEvents: This will handle events specific to this game.
     * @param res
     */
    gameEvents: function (res) {
        switch (res.eventType) {
            case ACTIVITY_COUNTING_1.socketEvents.SHOW_CARD:
                if (res.data.username != HDAppManager.username) {
                    ACTIVITY_COUNTING_1.ref.updateHiddenObjectList(res.data.tag);
                }
                break;
            case ACTIVITY_COUNTING_1.socketEvents.RESET:
                ACTIVITY_COUNTING_1.ref.resetUI();
                break;
        }
    },
    /**
     * updateStudentTurn: This will emit event to change student turn.
     * @param userName
     */
    updateStudentTurn: function (userName) {
        if (ACTIVITY_COUNTING_1.ref.isTeacherView) {
            if (!userName) {
                this.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_TEACHER, {
                    "roomId": HDAppManager.roomId,
                    "users": []
                });
            } else {
                this.triggerScript(ACTIVITY_COUNTING_1.ref.config.teacherScripts.onMouseEnable.ops);
                this.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_TEACHER, {
                    "roomId": HDAppManager.roomId,
                    "users": [{ userName: userName }]
                });
            }
        }
    },
    /**
     * studentTurn: This method will update user  turn.
     * @param res
     */
    studentTurn: function (res) {
        let users = res.users;
        if (ACTIVITY_COUNTING_1.ref.isTeacherView) {
            //Check for this
        } else {
            if (users.length == 0) {
                ACTIVITY_COUNTING_1.ref.isStudentInteractionEnable = false;
                return;
            }
            for (let index = 0; index < users.length; index++) {
                let obj = users[index];
                if (obj.userName == HDAppManager.username) {
                    ACTIVITY_COUNTING_1.ref.isStudentInteractionEnable = true;
                    break;
                } else {
                    ACTIVITY_COUNTING_1.ref.isStudentInteractionEnable = false;
                }
            }
        }
    },
    /**
     * disableInteraction: This  will update student interaction and go button state.
     * @param enable
     */
    disableInteraction: function (enable) {
        ACTIVITY_COUNTING_1.ref.isStudentInteractionEnable = enable;
    },
    /**
     * emitSocketEvent : This will emit event to server.
     * @param type - Event Type
     * @param data - Data to sent
     */
    emitSocketEvent: function (type, data) {
        SocketManager.emitCutomEvent(ACTIVITY_COUNTING_1.socketEventKey.singleEvent, {
            'eventType': type,
            'roomId': HDAppManager.roomId,
            'data': data
        }, null);
    },
    /**
     * buttonCallback: This method handles button callback.
     * @param sender
     * @param type
     */
    buttonCallback: function (sender, type) {
        let button = sender;
        let buttonTag = button.tag;
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                switch (buttonTag) {
                    case ACTIVITY_COUNTING_1.Tag.resetButton:

                        break;
                    default:
                        if (ACTIVITY_COUNTING_1.ref.isStudentInteractionEnable) {
                            var revealedObject = ACTIVITY_COUNTING_1.ref.config.countingData[sender.tag - ACTIVITY_COUNTING_1.Tag.baseHiddenObject];
                            ACTIVITY_COUNTING_1.ref.revealedObjects.push(revealedObject);
                            this.showHiddenObject(sender.tag);
                            ACTIVITY_COUNTING_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                                'eventType': ACTIVITY_COUNTING_1.socketEvents.SHOW_CARD,
                                'data': { "tag": sender.tag, "username": HDAppManager.username }
                            });
                            if (!ACTIVITY_COUNTING_1.ref.isTeacherView) {
                                ACTIVITY_COUNTING_1.ref.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_STUDENT, { "roomId": HDAppManager.roomId });
                            }
                            ACTIVITY_COUNTING_1.ref.updateRoomData();
                        }
                        break;
                }
        }
    },

    /**
     * showHiddenObject: This will show hidden object.
     * @param index
     */
    showHiddenObject: function (index) {
        var objectSelected = ACTIVITY_COUNTING_1.ref.baseLayer.getChildByTag(index);
        objectSelected.setEnabled(false);
        if (ACTIVITY_COUNTING_1.ref.isCountingEnabled) {
            var textTag = index - ACTIVITY_COUNTING_1.Tag.baseHiddenObject;
            var textObject = ACTIVITY_COUNTING_1.ref.baseLayer.getChildByTag(ACTIVITY_COUNTING_1.Tag.baseCountText + textTag);
            textObject.setString(ACTIVITY_COUNTING_1.ref.revealedObjects.length);
            textObject.setVisible(true);
        }
        if (ACTIVITY_COUNTING_1.ref.isTeacherView) {
            if (ACTIVITY_COUNTING_1.ref.revealedObjects.length == 1) {
                this.parent.setResetButtonActive(true);
            } else if (ACTIVITY_COUNTING_1.ref.revealedObjects.length == 0) {
                this.parent.setResetButtonActive(false);
            }
        }

    },
    /**
     * updateHiddenObjectList: This will update the hidden object.
     * @param index
     */
    updateHiddenObjectList: function (index) {
        var revealedObject = ACTIVITY_COUNTING_1.ref.config.countingData[index - ACTIVITY_COUNTING_1.Tag.baseHiddenObject];
        if (this.alreadyPresent(revealedObject)) {
            return;
        }
        ACTIVITY_COUNTING_1.ref.revealedObjects.push(revealedObject);
        ACTIVITY_COUNTING_1.ref.showHiddenObject(index);

    },

    /**
     * alreadyPresent: This will check if object is already showing.
     * @param currentObject
     * @returns {boolean}
     */
    alreadyPresent: function (currentObject) {
        var objects = ACTIVITY_COUNTING_1.ref.revealedObjects;
        for (let index = 0; index < objects.length; index++) {
            if (objects[index].name == currentObject.name) {
                return true;
            }
        }
        return false;
    },
    /**
     * syncAllObjects: This will sync the data according to game state.
     * @param revealedList
     */
    syncAllObjects: function (revealedList) {
        var hiddenObjects = ACTIVITY_COUNTING_1.ref.config.countingData;
        if (hiddenObjects && hiddenObjects.length > 0 && revealedList && revealedList.length > 0) {
            for (let indexRevealed = 0; indexRevealed < revealedList.length; indexRevealed++) {
                var currentRevealedObject = revealedList[indexRevealed];
                for (let indexHidden = 0; indexHidden < hiddenObjects.length; indexHidden++) {
                    if (currentRevealedObject.name == hiddenObjects[indexHidden].name) {
                        ACTIVITY_COUNTING_1.ref.updateHiddenObjectList(ACTIVITY_COUNTING_1.Tag.baseHiddenObject + indexHidden);
                    }
                }
            }
        }
    },
    /**
     * triggerScript: To trigger the script
     * @param message
     */
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
    /**
     * Return true if UI element is clickable
     * Called by parent lesson
     * @param location
     * @returns {boolean}
     */
    mouseControlEnable: function (location) {
        var obj = this.getChildByTag(ACTIVITY_COUNTING_1.Tag.resetButton);
        if (obj && cc.rectContainsPoint(obj.getBoundingBox(), obj.getParent().convertToNodeSpace(location)) && this.isStudentInteractionEnable && obj.isEnabled()) {
            return true;
        }
        return false;
    },


    /**
     * resetUI: This will reset the UI.
     */
    resetUI: function () {
        var hiddenObjects = ACTIVITY_COUNTING_1.ref.config.countingData;
        this.revealedObjects.length = 0;
        if (hiddenObjects && hiddenObjects.length > 0) {
            for (let index = 0; index < hiddenObjects.length; index++) {
                var obj = ACTIVITY_COUNTING_1.ref.baseLayer.getChildByTag(ACTIVITY_COUNTING_1.Tag.baseHiddenObject + index);
                obj.setEnabled(true);
                var textObject = ACTIVITY_COUNTING_1.ref.baseLayer.getChildByTag(ACTIVITY_COUNTING_1.Tag.baseCountText + index);
                textObject.setString("");
                textObject.setVisible(false);
            }
        }
        if (ACTIVITY_COUNTING_1.ref.isTeacherView) {
            ACTIVITY_COUNTING_1.ref.updateRoomData();
        }
    },

    reset: function () {
        if (this.revealedObjects.length > 0) {
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                'eventType': ACTIVITY_COUNTING_1.socketEvents.RESET,
                'data': null
            });
        }
    }
});


