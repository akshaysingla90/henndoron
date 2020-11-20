var ACTIVITY_WHO_AM_I_1 = {};
ACTIVITY_WHO_AM_I_1.Tag = {
    helpButton              : 100,
    revealButton            : 101,
    studentPanel            : 102,
    studentPanelStartBg     : 103,
    studentPanelMidBg       : 104,
    studentPanelSEndBg      : 105,
    studentSelectionPanel   : 106,
    leftDoor                : 107,
    rightDoor               : 108,
    itemStartTag            : 110,
    selectedItemLabel       : 120,
    labelAnimationBase      : 121,
    shelvesBg               : 123,
    foregroundBG            : 124,
    leftContainerTag        : 125,
    rightContainerTag       : 126,
    waitingAnimation        : 127,


};

ACTIVITY_WHO_AM_I_1.socketEventKey = {
    HELP : "WhoAmI101",
    REVEAL : "WhoAMI102",
    RESET  : "WhoAMI103",
    DISPLAY_ITEM : "WhoAMI104",
    ANIMATION_COMPLETED :"WhoAmI105",
    CHANGE_DOOR_COLOR   : "WhoAmI106",
    STUDENT_SEEN_ITEM_ACK : "whoAmI107",
    CLEAR       : "whoAmI108",
}

ACTIVITY_WHO_AM_I_1.ref = null;
ACTIVITY_WHO_AM_I_1.WhoAmI = HDBaseLayer.extend({
    isTeacherView: false,
    isPreviewMode: false,
    interactableObject: null,
    customTexture: null,
    handIconUI: [],
    joinedStudentList: [],
    doorList : [],
    isStudentInteractionEnable: false,
    previouslySelectedStudent : "",
    studentPanelScrollViewDefaultPos : cc.p(0, 0),
    studentPreviewPanelHeight :0,
    roundNo                   : 0,
    totalVisibleItems         :8,
    itemArray                 : [],
    activePreviewStudentName  : "",
    currentSelectedItem       :-1,
    alreadyShownItems        :[],
    itemToGuess              : null,
    areDoorOpen              : false,
    userAckArray             : [],
    assignedDoor            : 0,
    syncDataInfo            : null,
    hasGuessed              : false,
    blockInput              : false,


    ctor: function () {
        this._super();
    },

    onEnter: function () {
        this._super();
        ACTIVITY_WHO_AM_I_1.ref = this;
        let activityName = 'ACTIVITY_WHO_AM_I_1';
        cc.loader.loadJson("res/Activity/" + activityName + "/config.json", function (error, config) {
            ACTIVITY_WHO_AM_I_1.config = config;
            ACTIVITY_WHO_AM_I_1.resourcePath = "res/Activity/" + "" + activityName + "/res/"
            ACTIVITY_WHO_AM_I_1.soundPath = ACTIVITY_WHO_AM_I_1.resourcePath + "Sound/";
            ACTIVITY_WHO_AM_I_1.animationBasePath = ACTIVITY_WHO_AM_I_1.resourcePath + "AnimationFrames/";
            ACTIVITY_WHO_AM_I_1.spriteBasePath = ACTIVITY_WHO_AM_I_1.resourcePath + "Sprite/";
            ACTIVITY_WHO_AM_I_1.ref.isTeacherView = HDAppManager.isTeacherView;
            ACTIVITY_WHO_AM_I_1.ref.setupUI();
            if (ACTIVITY_WHO_AM_I_1.ref.isTeacherView) {
                console.log("joined student list",ACTIVITY_WHO_AM_I_1.ref.joinedStudentList);
                ACTIVITY_WHO_AM_I_1.ref.updateRoomData();
                ACTIVITY_WHO_AM_I_1.ref.isStudentInteractionEnable = true;
            }
        });
    },

    onExit: function () {
        this._super();
        ACTIVITY_WHO_AM_I_1.ref.removeAllChildrenWithCleanup(true);
        ACTIVITY_WHO_AM_I_1.ref.customTexture = false;
        ACTIVITY_WHO_AM_I_1.ref.interactableObject = false;
        ACTIVITY_WHO_AM_I_1.ref.doorList.length =0;
        ACTIVITY_WHO_AM_I_1.ref.alreadyShownItems.length = 0;
        ACTIVITY_WHO_AM_I_1.ref.itemArray.length =0;
        ACTIVITY_WHO_AM_I_1.ref.userAckArray.length =0;
        ACTIVITY_WHO_AM_I_1.ref = null;
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
        this.setBackground(ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.background.sections.background.imageName);
        var foreground = this.addSprite(ACTIVITY_WHO_AM_I_1.animationBasePath + ACTIVITY_WHO_AM_I_1.config.assets.sections.animation.data.foregroundAnimation.frameInitial+ "0001.png", cc.p(this.width * 0.5, this.height * 0.5), this);
        foreground.setTag(ACTIVITY_WHO_AM_I_1.Tag.foregroundBG);
        foreground.setLocalZOrder(2);
        this.setItemDisplay();
        this.setShelf();
        this.setDoors();
        this.addStudentDoor();
        if(this.isTeacherView){
            this.createStudentPreview();
            this.setButtons();
        }

       SocketManager.emitCutomEvent(HDSingleEventKey, {
                eventType: HDSocketEventType.STUDENT_STATUS,
                data: {
                    roomId: HDAppManager.roomId,
                },
       });

       if(this.syncDataInfo){
           this.updateUI();
       }


    },

    setItemDisplay : function(){
        var selectedItemBG = this.addSprite(ACTIVITY_WHO_AM_I_1.animationBasePath + ACTIVITY_WHO_AM_I_1.config.assets.sections.animation.data.labelAnimation.frameInitial + "0001.png", cc.p(this.width * 0.5, this.height * 0.89), this);
        selectedItemBG.setTag(ACTIVITY_WHO_AM_I_1.Tag.labelAnimationBase);
        var label = this.createTTFLabel("", HDConstants.Sassoon_Medium,30, HDConstants.Black, cc.p(selectedItemBG.width * 0.5, selectedItemBG.height *0.2 ), selectedItemBG);
        label.setTag(ACTIVITY_WHO_AM_I_1.Tag.selectedItemLabel);
        this.itemToGuess = this.addSprite(ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.buttons.data.help.enableState, cc.p(this.width * 0.5, this.height * 0.45), this);
        this.itemToGuess.setLocalZOrder(1);
        this.itemToGuess.setVisible(false);
    },

    setShelf : function(){
        var shelf = this.addSprite(ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.assets.sections.shelvesBG.imageName, cc.p(this.width * 0.5, this.height * 0.5), this);
        shelf.setTag(ACTIVITY_WHO_AM_I_1.Tag.shelvesBg);
        this.setItems(shelf);
    },

    setButtons() {
        var leftButtonContainer = this.addSprite(ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.assets.sections.leftButtonContainer.imageName,ACTIVITY_WHO_AM_I_1.config.assets.sections.leftButtonContainer.position, this);
        var rightButtonContainer = this.addSprite(ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.assets.sections.rightButtonContainer.imageName,ACTIVITY_WHO_AM_I_1.config.assets.sections.rightButtonContainer.position, this);
        leftButtonContainer.setTag(ACTIVITY_WHO_AM_I_1.Tag.leftContainerTag);
        rightButtonContainer.setTag(ACTIVITY_WHO_AM_I_1.Tag.rightContainerTag);
        var help = this.createButton(ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.buttons.data.help.enableState, ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.buttons.data.help.pushedState, null, 0, ACTIVITY_WHO_AM_I_1.Tag.helpButton, leftButtonContainer.convertToNodeSpace(ACTIVITY_WHO_AM_I_1.config.buttons.data.help.position), leftButtonContainer, this, null);
        leftButtonContainer.setLocalZOrder(2);
        var reveal = this.createButton(ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.buttons.data.reveal.disableState, ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.buttons.data.reveal.disableState, null, 0, ACTIVITY_WHO_AM_I_1.Tag.revealButton,  rightButtonContainer.convertToNodeSpace(ACTIVITY_WHO_AM_I_1.config.buttons.data.reveal.position), rightButtonContainer, this, null);
        rightButtonContainer.setLocalZOrder(2);
        reveal.setTouchEnabled(false);
    },

    setDoors() {
        console.log("position ", ACTIVITY_WHO_AM_I_1.config.assets.sections.doors.position.left);
        let leftDoor = this.addSprite(ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.assets.sections.doors.data[this.assignedDoor].image_1, ACTIVITY_WHO_AM_I_1.config.assets.sections.doors.position.left, this);
        leftDoor.setLocalZOrder(1);
        leftDoor.setTag(ACTIVITY_WHO_AM_I_1.Tag.leftDoor);
        let rightDoor = this.addSprite(ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.assets.sections.doors.data[this.assignedDoor].image_2, ACTIVITY_WHO_AM_I_1.config.assets.sections.doors.position.right, this);
        rightDoor.setLocalZOrder(1);
        rightDoor.setTag(ACTIVITY_WHO_AM_I_1.Tag.rightDoor);
        var callBack = cc.callFunc(()=>{
            ACTIVITY_WHO_AM_I_1.ref.openDoorAnimation(true);
        });


    },

    setItems : function(parent){
        let itemsArray =  ACTIVITY_WHO_AM_I_1.config.assets.sections.items.data;
        console.log("total visivle items",  this.totalVisibleItems,this.roundNo, this.itemArray.length );
        let startIndex = this.totalVisibleItems * this.roundNo;
        console.log("startIndex", startIndex);
        for(startIndex;  this.itemArray.length < this.totalVisibleItems ; startIndex++){
            var itemBG = this.addSprite(ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.assets.sections.itemCard.imageName, itemsArray[startIndex].position, parent);
            itemBG.setScale(0.4);
            var item = this.addSprite(ACTIVITY_WHO_AM_I_1.spriteBasePath + itemsArray[startIndex].imageName, cc.p(itemBG.width * 0.55, itemBG.height * 0.55), itemBG);
            item.setScale(0.5);
            itemBG.setTag(ACTIVITY_WHO_AM_I_1.Tag.itemStartTag + startIndex);
            var label = this.createTTFLabel(itemsArray[startIndex].label, HDConstants.Sassoon_Medium, 35, HDConstants.Black, cc.p(itemBG.width * 0.5, itemBG.height * 0.2), itemBG);
            this.itemArray.push(itemBG);

        }

    },

    createStudentPreview: function () {
        console.log("createStudentPreview");
        var studentSelectionPanel = new cc.Node();
        studentSelectionPanel.setPosition(cc.p(this.width * 0.5, this.height * 0.0));
        studentSelectionPanel.setTag(ACTIVITY_WHO_AM_I_1.Tag.studentSelectionPanel);
        studentSelectionPanel.setLocalZOrder(1000);
        studentSelectionPanel.setVisible(false);

        this.addChild(studentSelectionPanel);

        var startBg = this.addSprite(ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.assets.sections.teacherCarouselStart.imageName,cc.p(0,0),studentSelectionPanel);
        startBg.setTag(ACTIVITY_WHO_AM_I_1.Tag.studentPanelStartBg);
        startBg.setAnchorPoint(cc.p(0,0));


        let endPart = this.addSprite(ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.assets.sections.teacherCarouselMid.imageName, cc.p(0,0),studentSelectionPanel);
        endPart.setAnchorPoint(cc.p(0,0));
        endPart.setTag(ACTIVITY_WHO_AM_I_1.Tag.studentPanelSEndBg);
        endPart.setVisible(true);
        //
        let midPart = this.addSprite(ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.assets.sections.teacherCarouselEnd.imageName, cc.p(startBg.getPositionX() + startBg.getContentSize().width - 5, 0), studentSelectionPanel);
        midPart.setAnchorPoint(cc.p(0,0));
        midPart.setTag(ACTIVITY_WHO_AM_I_1.Tag.studentPanelMidBg);
        midPart.setVisible(true);


        let width = startBg.width + endPart.width + midPart.width;
        var container = new cc.LayerColor(HDConstants.Black, width, startBg.height * 0.8);
        container.setOpacity(0);
        container.setAnchorPoint(0,0);
        this.studentPreviewPanelHeight = startBg.height * 0.7;
        var scrollView = new cc.ScrollView(
            container.getContentSize(),
            container,
        );
        scrollView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        scrollView.setTouchEnabled(true);
        scrollView.setBounceable(false);
        scrollView.setTag(ACTIVITY_WHO_AM_I_1.Tag.studentPanel);
        scrollView.setVisible(true);
        scrollView.setPositionY(startBg.height * 0.1);
        this.studentPanelScrollViewDefaultPos = cc.p(studentSelectionPanel.width * 0.16, startBg.height * 0.1);
        studentSelectionPanel.addChild(scrollView);
        this.reloadStudentPreviewList();
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
                    "activity": ACTIVITY_WHO_AM_I_1.config.properties.namespace,
                    "data": {
                        "roundNo"          : ACTIVITY_WHO_AM_I_1.ref.roundNo,
                        "activityStartTime": HDAppManager.getActivityStartTime(),
                        "assignedDoor": ACTIVITY_WHO_AM_I_1.ref.assignedDoor,
                        "alreadyShownItems": [...ACTIVITY_WHO_AM_I_1.ref.alreadyShownItems],
                        "selectedStudent": ACTIVITY_WHO_AM_I_1.ref.activePreviewStudentName,
                        "currentItem"    : ACTIVITY_WHO_AM_I_1.ref.currentSelectedItem,
                    }
                }
            }
        }, null);
    },

    updateStudentInteraction: function (username, status) {
        if (this.isTeacherView) {
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                "eventType": ACTIVITY_WHO_AM_I_1.socketEventKey.STUDENT_INTERACTION,
                "data": {"userName": username, "status": status}
            });
        }
    },

    onUpdateStudentInteraction: function (params) {
        if (params.userName == HDAppManager.username) {
            ACTIVITY_WHO_AM_I_1.ref.isStudentInteractionEnable = params.status;
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
        console.log(event.getLocation());
        if (!ACTIVITY_WHO_AM_I_1.ref.isStudentInteractionEnable)
            return;

    },

    onMouseUp: function (event) {
        if (!ACTIVITY_WHO_AM_I_1.ref.isStudentInteractionEnable)
            return;
    },
    onMouseMove: function (event) {
        ACTIVITY_WHO_AM_I_1.ref.updateMouseIcon(event.getLocation());
        if (!ACTIVITY_WHO_AM_I_1.ref.isStudentInteractionEnable)
            return;
    },
    socketListener: function (res) {
        if (!ACTIVITY_WHO_AM_I_1.ref)
            return;
        switch (res.eventType) {
            case HDSocketEventType.DISABLE_STUDENT_INTERACTION:
                break;
            case HDSocketEventType.DISABLE_INTERACTION:
                ACTIVITY_WHO_AM_I_1.ref.disableInteraction(res.data);
                break;
            case HDSocketEventType.RECEIVE_GRADES:
                break;
            case HDSocketEventType.STUDENT_STATUS:
                ACTIVITY_WHO_AM_I_1.ref.studentStatus(res.data);
                break;
            case HDSocketEventType.STUDENT_TURN:
                ACTIVITY_WHO_AM_I_1.ref.studentTurn(res.data);
                break;
            case HDSocketEventType.GAME_MESSAGE:
                if (res.data.userName == HDAppManager.username || !ACTIVITY_WHO_AM_I_1.ref)
                    return;
                ACTIVITY_WHO_AM_I_1.ref.gameEvents(res.data);
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
    gameEvents: function (res) {
        if (!ACTIVITY_WHO_AM_I_1.ref)
            return;
        switch (res.eventType) {
            case ACTIVITY_WHO_AM_I_1.socketEventKey.STUDENT_INTERACTION:
                this.onUpdateStudentInteraction(res.data);
                break;
                
            case ACTIVITY_WHO_AM_I_1.socketEventKey.DISPLAY_ITEM:
                this.showItemToSelectedStudent(res.data.index, res.data.doorIndex, res.data.studentName);
                break;
            case ACTIVITY_WHO_AM_I_1.socketEventKey.HELP:
                this.openDoorAnimation(false);
                break;
            case ACTIVITY_WHO_AM_I_1.socketEventKey.REVEAL:
                this.playRightGuessAnimation(res.data.index);
                break;

            case ACTIVITY_WHO_AM_I_1.socketEventKey.ANIMATION_COMPLETED:
                this.animationEndAck(res.data);
                break;
            case ACTIVITY_WHO_AM_I_1.socketEventKey.CHANGE_DOOR_COLOR:
                this.changeDoorColor(res.data.index);
                break;
            case ACTIVITY_WHO_AM_I_1.socketEventKey.STUDENT_SEEN_ITEM_ACK:
                this.studentSeenItemAck("from socket");
                break;
            case ACTIVITY_WHO_AM_I_1.socketEventKey.CLEAR:
                this.restart(res.data.roundNo);
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
        console.log("syndData", data);
        ACTIVITY_WHO_AM_I_1.ref.syncDataInfo = data;
    },
    buttonCallback: function (sender, type) {

        if(this.blockInput)
            return;
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                console.log("block inout", this.blockInput);
                this.blockInput = true;
                switch (sender.getTag()) {
                    case ACTIVITY_WHO_AM_I_1.Tag.helpButton:
                         this.openDoorAnimation(false);
                        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                            "eventType": ACTIVITY_WHO_AM_I_1.socketEventKey.HELP,
                            "data"      : {
                                "round" : ACTIVITY_WHO_AM_I_1.ref.roundNo,
                            }
                        });
                        break;

                    case ACTIVITY_WHO_AM_I_1.Tag.revealButton:
                        this.playRightGuessAnimation(ACTIVITY_WHO_AM_I_1.ref.currentSelectedItem);
                        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                            "eventType": ACTIVITY_WHO_AM_I_1.socketEventKey.REVEAL,
                            "data"      : {
                                "round" : ACTIVITY_WHO_AM_I_1.ref.roundNo,
                                "index" : ACTIVITY_WHO_AM_I_1.ref.currentSelectedItem,
                            }
                        });
                        break;

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
        let handICon = false
        for (let obj of ACTIVITY_WHO_AM_I_1.ref.handIconUI) {
            if (cc.rectContainsPoint(obj.getBoundingBox(), obj.getParent().convertToNodeSpace(location))) {
                handICon = true;
                break;
            }
        }

        // console.log("hand iucon", handICon);
        if (handICon) {
            this.interactableObject = true;
            this.customTexture = false;
        } else {
            if (location.y < this.getContentSize().height * 0.9 && this.isTeacherView) {
                this.changeMouseCursorImage();
                this.customTexture = true;
                this.interactableObject = true;
            } else {
                this.customTexture = false;
                this.interactableObject = false;
            }
        }


    },

    changeMouseCursorImage: function () {
        if (this.isStudentInteractionEnable) {
            this.MouseTextureUrl = ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.cursors.data.cursorPointer.imageName;
        } else {
            this.customTexture = false;
            this.MouseTextureUrl = "";
        }
    },



    studentStatus: function (data) {
        // console.log("student status updated");
        this.updateStudentList(data);

    },
    updateStudentList: function (data) {
        console.log("update student data", data);
        var teacherId = data.teacherId;
        var user = data.users;
        var students = [];
        for (let item of user) {
            if (item.userId != teacherId) {
                students.push(item.userName)
            }
        }
        this.joinedStudentList = [...students];
        this.updateDoors(this.joinedStudentList);
            if(this.isTeacherView) {
                this.reloadStudentPreviewList();
            }



    },

    studentPreviewCellCallback: function (sender, type) {

        if(this.blockInput){
            return;
        }
        let selectionPanel = this.getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.studentSelectionPanel);
        let scrollView = selectionPanel.getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.studentPanel);
        switch (type) {

            case ccui.Widget.TOUCH_BEGAN: {
                let prevSelectedCell = scrollView.getContainer().getChildren().find(item => item.getName() === this.activePreviewStudentName);
                this.previouslySelectedStudent = this.activePreviewStudentName;
                if(prevSelectedCell && prevSelectedCell.getName() === sender.getName()){
                    if(this.joinedStudentList.length > 1  && !this.hasGuessed){
                    // sender.getChildByTag(1).setTexture(ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.buttons.data.studentSelection.selectedAgainState);
                    sender.loadTextures(ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.buttons.data.studentSelection.pushedState, ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.buttons.data.studentSelection.pushedState);
                    }
                }
                break;
            }
            case ccui.Widget.TOUCH_ENDED: {
                this.blockInput = true;
                let prevSelectedCell = scrollView.getContainer().getChildren().find(item => item.getName() === this.activePreviewStudentName);
                if(prevSelectedCell && prevSelectedCell.getName() === sender.getName()){
                    console.log("showItemTo Teacher");
                    if(this.joinedStudentList.length > 1){
                        this.revealItem(this.currentSelectedItem, false);
                    }
                }
                else{
                    console.log("prevSelectedCell",prevSelectedCell)
                     if(prevSelectedCell  && prevSelectedCell.getName() != sender.getName() && !this.hasGuessed){
                             console.log("teacher moved to next student without letting currrent student finish");
                             this.placeBackItem();
                         }
                        this.activePreviewStudentName = sender.getName();
                        var item = ACTIVITY_WHO_AM_I_1.ref.doorList.find(item =>  item.studentName == sender.getName());
                        console.log("item", item)
                        ACTIVITY_WHO_AM_I_1.ref.currentSelectedItem = this.getRandomItem();
                        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                            "eventType": ACTIVITY_WHO_AM_I_1.socketEventKey.DISPLAY_ITEM,
                            "data"      : {
                                "index": ACTIVITY_WHO_AM_I_1.ref.currentSelectedItem,
                                "studentName": ACTIVITY_WHO_AM_I_1.ref.activePreviewStudentName,
                                "doorIndex": item ? item.assignedDoor : 0,

                            }
                        });
                        this.assignedDoor = item ? item.assignedDoor : 0
                        this.changeDoorColor(this.assignedDoor);
                        var waitingAnimation = this.runAction(cc.sequence(cc.delayTime(7), cc.callFunc(this.studentSeenItemAck, this)));
                        waitingAnimation.setTag(ACTIVITY_WHO_AM_I_1.Tag.waitingAnimation);
                    }
                this.reloadStudentPreviewList();
                if(ACTIVITY_WHO_AM_I_1.ref.currentSelectedItem != -1){
                    this.enableRevealButton();

                }

            }
        }
    },

    createStudentPreviewCell: function (studentName) {
        let studentBg = new ccui.Button(
            ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.buttons.data.studentSelection.enableState,
            ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.buttons.data.studentSelection.enableState

        );
        studentBg.addTouchEventListener(this.studentPreviewCellCallback, this);
        studentBg.setName(studentName);
        let nameLabel = this.createTTFLabel(studentName, HDConstants.Sassoon_Regular, 50, HDConstants.White, cc.p(studentBg.width * 0.5, studentBg.height * 0.1), studentBg);
        return studentBg;
    },
    reloadStudentPreviewList: function () {
        // return;
        if(!this.isTeacherView){
            return;
        }
        let selectionPanel = this.getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.studentSelectionPanel);
        let scrollView = selectionPanel.getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.studentPanel);
        let count = this.joinedStudentList.length;

        let maxCapacity = 8;
        let cellSize = 55; // this.studentPreviewPanelHeight * 0.8
        let h_padding = 7;
        let maxScrollViewWidth = (cellSize + h_padding) * maxCapacity + h_padding;
        let x_pos = this.studentPanelScrollViewDefaultPos.x + 30;
        let next_x_coord = h_padding + cellSize * 0.5;
        let innerContainerWidth = count * (cellSize + h_padding) + h_padding;
        if(count < maxCapacity){
            x_pos = (maxScrollViewWidth - innerContainerWidth) / 2 + this.studentPanelScrollViewDefaultPos.x - cellSize * 0.5;
        }
        scrollView.setViewSize(cc.size(innerContainerWidth, this.studentPreviewPanelHeight));
        scrollView.setContentSize(innerContainerWidth, this.studentPreviewPanelHeight);
        let container = scrollView.getContainer();
        container.removeAllChildrenWithCleanup();
        ACTIVITY_WHO_AM_I_1.ref.joinedStudentList.map((studentName => {
            let student = this.createStudentPreviewCell(studentName);

            student.setScale(cellSize / student.width, cellSize / student.height);
            student.setPosition(next_x_coord, this.studentPreviewPanelHeight * 0.6);
            if(student.getName() === this.activePreviewStudentName){
                student.loadTextures(ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.buttons.data.studentSelection.pushedState, ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.buttons.data.studentSelection.pushedState);
                // student.getChildByTag(1).setTexture(ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.buttons.data.studentSelection.selectState);
            }
            scrollView.addChild(student);
            next_x_coord = student.x + cellSize + h_padding;
        }));

        var startBg = selectionPanel.getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.studentPanelStartBg);
        var midBg = selectionPanel.getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.studentPanelMidBg);
        midBg.setScaleX( Math.abs((scrollView.width - (cellSize + h_padding))/ midBg.width));
        var engBg = selectionPanel.getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.studentPanelSEndBg);
        engBg.setPositionX(midBg.getPositionX() + midBg.width * midBg.getScaleX() - 10);
        scrollView.setPositionX(150);

        var totalWidth = startBg.width  + midBg.width * midBg.getScaleX() + engBg.width;
        var startPos = (this.width - totalWidth)* 0.5;
        selectionPanel.setPositionX(startPos -20);
        if(count >0){
            selectionPanel.setVisible(true);
        }

    },

    openDoorAnimation : function (isForGuessing) {
        if(this.areDoorOpen) {
            return;
        }
        if(!this.itemToGuess.isVisible()){
            this.showShelves();
        }
        this.areDoorOpen = true;
        let leftDoor = this.getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.leftDoor);
        let rightDoor =  this.getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.rightDoor);
        var lOldPox = leftDoor.getPositionX();
        var rOldPox = rightDoor.getPositionX();
        var leftMoveTo = cc.moveTo(0.5,0, leftDoor.y);
        var rightMoveTo = cc.moveTo(0.5, 960, rightDoor.y);
        var callBack = cc.callFunc(()=>{
            ACTIVITY_WHO_AM_I_1.ref.areDoorOpen = false;
            if(ACTIVITY_WHO_AM_I_1.ref.itemToGuess.isVisible()){
                ACTIVITY_WHO_AM_I_1.ref.itemToGuess.setVisible(false);
            }
            if(ACTIVITY_WHO_AM_I_1.ref.isTeacherView){
                ACTIVITY_WHO_AM_I_1.ref.blockInput = false;
            }



            if(this.isTeacherView && this.alreadyShownItems.length == this.totalVisibleItems && this.hasGuessed){
                this.parent.setResetButtonActive(true);
                this.blockInput = true;
                this.assignedDoor = 0;
                this.roundNo ++;
            }
        }, this);

        if(!isForGuessing){
            leftDoor.runAction(cc.sequence(leftMoveTo, cc.delayTime(3), cc.moveTo(0.5, lOldPox, leftDoor.y),callBack));
            rightDoor.runAction(cc.sequence(rightMoveTo, cc.delayTime(3), cc.moveTo(0.5, rOldPox, rightDoor.y)));
        }
        else{
            var callback = cc.callFunc(() =>{
                    ACTIVITY_WHO_AM_I_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                        'eventType': ACTIVITY_WHO_AM_I_1.socketEventKey.STUDENT_SEEN_ITEM_ACK,
                        'data': {name: HDAppManager.username}
                    });
            });

            leftDoor.runAction(cc.sequence(leftMoveTo,callback));
            rightDoor.runAction((rightMoveTo));
        }
    },

    closeDoorAnimation : function(){
        if(this.areDoorOpen){
            var callBack = new cc.callFunc(() =>{
                ACTIVITY_WHO_AM_I_1.ref.showShelves();
                this.areDoorOpen = false;
                ACTIVITY_WHO_AM_I_1.ref.itemToGuess.setVisible(false);
            })
            let leftDoor = this.getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.leftDoor);
            let rightDoor =  this.getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.rightDoor);
            let lPos = ACTIVITY_WHO_AM_I_1.config.assets.sections.doors.position.left;
            let rPos = ACTIVITY_WHO_AM_I_1.config.assets.sections.doors.position.right;
            leftDoor.runAction(cc.sequence(cc.moveTo(0.5,lPos.x, leftDoor.y), callBack));
            rightDoor.runAction(cc.moveTo(0.5,rPos.x, rightDoor.y));


        }

    },


    showItemToSelectedStudent : function (index, doorNo, studentName) {
        this.changeDoorColor(doorNo);
        this.previouslySelectedStudent = this.activePreviewStudentName;
        if(this.previouslySelectedStudent == HDAppManager.username){
            this.closeDoorAnimation();  // if teacher change student in between

        }
        this.activePreviewStudentName = studentName;
        if(studentName  == HDAppManager.username ){
           this.revealItem(index, true);
        }

    },

    getRandomItem : function () {
        var startIndex = 0;
        var endIndex   = this.itemArray.length;
        var randomNo =  Math.floor(Math.random() * (endIndex - startIndex) + startIndex);
        var item = this.itemArray.splice(randomNo,1);
        console.log("length after deletion", this.itemArray, item);
        this.alreadyShownItems.push( item[0].getTag());
        console.log(item[0].getTag());
        return item[0].getTag();
    },

    placeBackItem : function(){
        console.log("placeBackItem");
        var tag = this.alreadyShownItems.pop();
        var item= this.getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.shelvesBg).getChildByTag(tag);
        if(item){
            this.itemArray.push(item);
        }
    },


    hideShelves(){
        this.getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.shelvesBg).setVisible(false);
    },

    showShelves(){
        this.getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.shelvesBg).setVisible(true);
    },

    playRightGuessAnimation(index){
        console.log("index", index);
        this.hasGuessed = true;
        this.revealItem(index, false);
        var labelBG = this.getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.labelAnimationBase);
        var foreground = this.getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.foregroundBG);
        let labelAnimation = HDUtility.runFrameAnimation(ACTIVITY_WHO_AM_I_1.animationBasePath + ACTIVITY_WHO_AM_I_1.config.assets.sections.animation.data.labelAnimation.frameInitial, ACTIVITY_WHO_AM_I_1.config.assets.sections.animation.data.labelAnimation.frameCount, 0.05, ".png", 1);
        let foreGroundAnimation = HDUtility.runFrameAnimation(ACTIVITY_WHO_AM_I_1.animationBasePath + ACTIVITY_WHO_AM_I_1.config.assets.sections.animation.data.foregroundAnimation.frameInitial, ACTIVITY_WHO_AM_I_1.config.assets.sections.animation.data.foregroundAnimation.frameCount, 0.05, ".png", 1);
        labelBG.runAction(labelAnimation);
        foreground.runAction(cc.sequence(foreGroundAnimation, cc.callFunc(this.onAnimationEnd, this), cc.delayTime(2),cc.callFunc(this.allowOtherStudentSelection, this)));
        if(this.activePreviewStudentName == HDAppManager.username){
            this.runAction(cc.sequence(cc.delayTime(3.3), cc.callFunc(this.closeDoorAnimation, this)))
        }

    },

    revealItem : function(index, isForGuessing){
         var itemInfoArray = ACTIVITY_WHO_AM_I_1.config.assets.sections.items.data;
         var actualIndex = index - ACTIVITY_WHO_AM_I_1.Tag.itemStartTag;
         this.itemToGuess.setVisible(true);
         this.itemToGuess.setTexture(ACTIVITY_WHO_AM_I_1.spriteBasePath + itemInfoArray[actualIndex].imageName);
         this.getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.labelAnimationBase).getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.selectedItemLabel).setString(itemInfoArray[actualIndex].label);
         this.openDoorAnimation(isForGuessing);
         this.hideShelves();


    },

    onAnimationEnd: function () {
        this.animationEndAck(data = {"name" : HDAppManager.username})
        ACTIVITY_WHO_AM_I_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            'eventType': ACTIVITY_WHO_AM_I_1.socketEventKey.ANIMATION_COMPLETED,
            'data': {name: HDAppManager.username}
        });
    },

    animationEndAck: function (data) {
        var user = this.userAckArray.filter(item => item == data.name);
        if (user.length == 0) {
            this.userAckArray.push(user);
            if (this.userAckArray.length == this.joinedStudentList.length +1) {
                this.allowOtherStudentSelection();
            }
        }
    },

    allowOtherStudentSelection: function () {
        this.activePreviewStudentName = "";
        this.hasGuessed = false;
    },

    changeDoorColor: function(index){
        console.log("change door color", index);
        if( this.getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.leftDoor)){
            this.getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.leftDoor).setTexture(ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.assets.sections.doors.data[index].image_1)
            this.getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.rightDoor).setTexture(ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.assets.sections.doors.data[index].image_2);

        }
    },

    studentSeenItemAck : function (parent) {
        if(this.isTeacherView){
            this.blockInput = false;
            this.stopActionByTag(ACTIVITY_WHO_AM_I_1.Tag.waitingAnimation);
            this.updateRoomData();
        }
    },

    addStudentDoor : function (){
        this.doorList = [];
        for(let i = 0; i < 8; ++i)
        {
            this.doorList.push({"studentName": "", "assignedDoor": i});
        }
    },

    updateDoors: function (studList){
        for(let student of studList){
            if( this.doorList.filter( x => x.studentName == student).length == 0  ){
                for(let door of this.doorList){
                    if(door.studentName == ""){
                        door.studentName = student;
                        break;
                    }
                }
            }
        }
        for(let door of this.doorList){
            if(!studList.includes(door.studentName )){
                door.studentName = "";
            }
            if(door.studentName == HDAppManager.username){
                console.log("his.activePreviewStudentName", this.activePreviewStudentName);
                this.assignedDoor = door.assignedDoor;
                if(this.activePreviewStudentName.length <=0){
                    this.changeDoorColor(this.assignedDoor);
                }

            }

        }
    },

    reset : function () {
        console.log("reset button is clicked");
        let itemsArray =  ACTIVITY_WHO_AM_I_1.config.assets.sections.items.data;
        let totalItems = itemsArray.length;
        let nextRoundIndex = this.roundNo * this.totalVisibleItems;
        if(nextRoundIndex >= totalItems){
            // no item left
            this.roundNo =0;
        }

        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            "eventType": ACTIVITY_WHO_AM_I_1.socketEventKey.CLEAR,
            "data"      : {
                "roundNo" : this.roundNo
            }
        });
        this.restart(this.roundNo);

    },

    restart : function (roundNo){
        this.roundNo = roundNo;
        this.activePreviewStudentName = "";
        this.hasGuessed = false;
        this.blockInput = false;
        this.itemArray.length = 0;
        console.log("assigned Door", this.assignedDoor);
        if(this.isTeacherView){
            this.assignedDoor = 0;
        }
        this.alreadyShownItems.length = 0;
        this.userAckArray.length =0;
        this.removeAllChildren();
        this.setupUI();
        if(this.isTeacherView){
            this.updateRoomData();
        }
    },

    updateUI : function () {
        // active student check update krna h
        this.activePreviewStudentName = this.syncDataInfo.selectedStudent;
        this.currentSelectedItem = this.syncDataInfo.currentItem;
        this.alreadyShownItems = this.syncDataInfo.alreadyShownItems;
        this.roundNo           = this.syncDataInfo.roundNo;


        console.log("already shown item", this.alreadyShownItems);
        var itemInfoArray = ACTIVITY_WHO_AM_I_1.config.assets.sections.items.data;
        var actualIndex = this.currentSelectedItem - ACTIVITY_WHO_AM_I_1.Tag.itemStartTag;
        if(this.activePreviewStudentName.length >0){
            this.assignedDoor     = this.syncDataInfo.assignedDoor;
            this.changeDoorColor(this.assignedDoor);
        }

        if(this.activePreviewStudentName == HDAppManager.username){
            this.revealItem(this.currentSelectedItem, true );
        }
        if(this.currentSelectedItem!=-1){
            this.itemToGuess.setTexture(ACTIVITY_WHO_AM_I_1.spriteBasePath + itemInfoArray[actualIndex].imageName);

        }

        if(this.isTeacherView){
            for(let item of this.alreadyShownItems){
                var index = this.itemArray.findIndex((obj) => {
                    return obj.getTag() == item;
                });
                if(index !=-1){
                    this.itemArray.splice(index,1);
                }
            }
            if(this.currentSelectedItem!=-1){
                this.enableRevealButton();
            }
            this.reloadStudentPreviewList();
        }
    },

    enableRevealButton : function () {
        var button = this.getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.rightContainerTag).getChildByTag(ACTIVITY_WHO_AM_I_1.Tag.revealButton);
        button.setTouchEnabled(true);
        button.loadTextures(ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.buttons.data.reveal.enableState, ACTIVITY_WHO_AM_I_1.spriteBasePath + ACTIVITY_WHO_AM_I_1.config.buttons.data.reveal.pushedState);
    }















});
