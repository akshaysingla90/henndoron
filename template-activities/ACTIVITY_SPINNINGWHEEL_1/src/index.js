/**
 * This file contain logic for Spinning Wheel module
 **/
var ACTIVITY_SPINNINGWHEEL_1 =  {};
ACTIVITY_SPINNINGWHEEL_1.Tag  =  {
    targetBase : 100,
    targetImage: 101,
    spinningWheelBase: 102,
    goButton:103,
    stopButton: 104,
    animationSprite:105,
    targetIndexLabel: 106
}

ACTIVITY_SPINNINGWHEEL_1.socketEvents = {
    SPIN_WHEEL: 1,
    ADD_CARD_TO_QUEUE: 2,
    REMOVE_CARD_FROM_QUEUE: 3,
    STOP_WHEEL: 4,
    WHEEL_STOPPED_ACKNOWLEDGEMENT: 5
}

ACTIVITY_SPINNINGWHEEL_1.socketEventKey = {
    singleEvent         : "SingleEvent"
}

ACTIVITY_SPINNINGWHEEL_1.ref= null;

ACTIVITY_SPINNINGWHEEL_1.SpinningWheelLayer = HDBaseLayer.extend({
    self : null,
    baseLayer:null,
    revealedObjects: [],
    isStudentInteractionEnable : false,
    storedData : null,
    carouselHeight : 120,
    winSize: null,
    currentStopIndex: -1,
    cardQueue: [],
    animationCompleted: true,
    isRotating: false,
    speed : 6,
    intervalActionId: null,
    currentTargetIndex: 0,
    tableView: null,
    handIconUI:[],
    stopWheelUsers:[],
    joinedStudentList:[],
    tempInteraction: null,

    ctor : function () {
        this._super();
    },

    onEnter : function () {
        this._super();
        let ref = this;
        ACTIVITY_SPINNINGWHEEL_1.ref = this;
        ACTIVITY_SPINNINGWHEEL_1.ref.animationCompleted = true;
        this.cardQueue.length = 0;
        cc.loader.loadJson ("res/Activity/ACTIVITY_SPINNINGWHEEL_1/config.json",function(error, config){
            ACTIVITY_SPINNINGWHEEL_1.ref.config = config;
            ACTIVITY_SPINNINGWHEEL_1.ref.resourcePath = "res/Activity/"+"ACTIVITY_SPINNINGWHEEL_1/res/"
            ACTIVITY_SPINNINGWHEEL_1.ref.soundPath =   ACTIVITY_SPINNINGWHEEL_1.ref.resourcePath + "Sound/";
            ACTIVITY_SPINNINGWHEEL_1.ref.animationBasePath = ACTIVITY_SPINNINGWHEEL_1.ref.resourcePath + "AnimationFrames/";
            ACTIVITY_SPINNINGWHEEL_1.ref.spriteBasePath = ACTIVITY_SPINNINGWHEEL_1.ref.resourcePath + "Sprite/";
            ACTIVITY_SPINNINGWHEEL_1.ref.isTeacherView =  HDAppManager.isTeacherView;
            ACTIVITY_SPINNINGWHEEL_1.ref.isCountingEnabled = ACTIVITY_SPINNINGWHEEL_1.ref.config.gameInfo.isCounting
            ACTIVITY_SPINNINGWHEEL_1.ref.isStudentInteractionEnable = ACTIVITY_SPINNINGWHEEL_1.ref.isTeacherView ? true : false;
            ref.setupUI();
            ref.loadAudio();
            ref.loadSpriteFrames();
            if(ACTIVITY_SPINNINGWHEEL_1.ref.storedData) {
                ACTIVITY_SPINNINGWHEEL_1.ref.syncData(ACTIVITY_SPINNINGWHEEL_1.ref.storedData)
            }
            ref.triggerScript(ACTIVITY_SPINNINGWHEEL_1.ref.config.teacherScripts.moduleStart);
            ref.triggerTip(ACTIVITY_SPINNINGWHEEL_1.ref.config.teacherTips.moduleStart);
        });
    },

    onExit : function () {
        this._super();
        ACTIVITY_SPINNINGWHEEL_1.ref.cardQueue.length = 0;
        // clearInterval(ACTIVITY_SPINNINGWHEEL_1.ref.intervalActionId);
        // ACTIVITY_SPINNINGWHEEL_1.ref.intervalActionId = null;
        // ACTIVITY_SPINNINGWHEEL_1.ref.getActionByTag(111).removeFromParent();
        ACTIVITY_SPINNINGWHEEL_1.ref.stopActionByTag(111);
        ACTIVITY_SPINNINGWHEEL_1.ref = null;
    },

    /**
     * setupUI : To create UI for teacher and student.
     */
    setupUI :  function () {
        this.setBackground( ACTIVITY_SPINNINGWHEEL_1.ref.spriteBasePath + ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.background.name);
        this.baseLayer = this.createColourLayer(cc.color(0,0,0,0),cc.winSize.width,cc.winSize.height,cc.p(0,0),this, 1);
        this.setupTarget();
        this.setupSpinningWheel();
        if(ACTIVITY_SPINNINGWHEEL_1.ref.isTeacherView) { //Set only for Teacher
            this.updateRoomData();
            this.setCardContent();
        }
        //AnimationBaseSprite
        var animationSprite = ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.animationWinLossSprite;
        var animationBaseLayer = this.addSprite("res/LessonResources/emptyImage.png",animationSprite.position,this.baseLayer);
        animationBaseLayer.tag = ACTIVITY_SPINNINGWHEEL_1.Tag.animationSprite;
        animationBaseLayer.setLocalZOrder(100);
    },

    /**
     * loadAudio: To load audio files.
     */
    loadAudio : function() {
        cc.loader.load(ACTIVITY_SPINNINGWHEEL_1.ref.soundPath + ACTIVITY_SPINNINGWHEEL_1.ref.config.audioAssets.tapHiddenObject.name);
    },

    /**
     * loadSpriteFrames: To load animation sprite frames.
     */
    loadSpriteFrames : function(){
        HDUtility.addSpriteFrames(  ACTIVITY_SPINNINGWHEEL_1.ref.animationBasePath+"Win/object_pulled_out_animation_", ACTIVITY_SPINNINGWHEEL_1.ref.config.animation.win.frameCount, "object_pulled_out_animation_" , ".png");
        HDUtility.addSpriteFrames(  ACTIVITY_SPINNINGWHEEL_1.ref.animationBasePath+"Loss/object_pulled_out_animation_", ACTIVITY_SPINNINGWHEEL_1.ref.config.animation.loss.frameCount, "object_pulled_out_animation_" , ".png");
    },

    /**
     * setupTarget: To setup target image base view.
     */
    setupTarget : function() {
        var targetBaseObject = ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.targetBackground;
        var targetSprite;
        if(targetBaseObject.name.length > 0) {
            var targetPosition = ACTIVITY_SPINNINGWHEEL_1.ref.isTeacherView ? targetBaseObject.position : cc.p(cc.winSize.width * 0.7, cc.winSize.height * 0.75);
            targetSprite = this.addSprite(ACTIVITY_SPINNINGWHEEL_1.ref.spriteBasePath+targetBaseObject.name,targetPosition,this);
            targetSprite.tag = ACTIVITY_SPINNINGWHEEL_1.Tag.targetBase;
            var targetPosition = ACTIVITY_SPINNINGWHEEL_1.ref.isTeacherView ? cc.p(cc.winSize.width * 0.55 , cc.winSize.height * 0.85 - targetSprite.getContentSize().height * targetBaseObject.scale) : cc.p(cc.winSize.width * 0.6 , cc.winSize.height * 0.75 - targetSprite.getContentSize().height * targetBaseObject.scale);
            targetSprite.setPosition(targetPosition);
            targetSprite.setScale(targetBaseObject.scale);
            targetSprite.setAnchorPoint(0.5)
        } else {
            targetSprite = this.createColourLayer(cc.color(targetBaseObject.backgroundColor.r,targetBaseObject.backgroundColor.g,targetBaseObject.backgroundColor.b,targetBaseObject.backgroundColor.a),targetBaseObject.size.width,targetBaseObject.size.height,targetBaseObject.position,this,1);
            targetSprite.tag = ACTIVITY_SPINNINGWHEEL_1.Tag.targetBase;
        }

        var targetImage = this.addSprite("res/LessonResources/emptyImage.png",cc.p(targetSprite.getContentSize().width * 0.5, targetSprite.getContentSize().height * 0.5),targetSprite);
        targetImage.tag = ACTIVITY_SPINNINGWHEEL_1.Tag.targetImage;
        targetImage.setScale(2.5);
        var targetName;
        if(ACTIVITY_SPINNINGWHEEL_1.ref.config.targetAssets[0].nameImage) {
            targetName = this.createTTFLabel( ACTIVITY_SPINNINGWHEEL_1.ref.config.targetAssets[0].nameImageName, cc.p(targetSprite.getContentSize().width * 0.5, targetSprite.getContentSize().height * 0.7), targetSprite);
            targetName.setVisible(false);
        }else{
            targetName = this.createTTFLabel("", "sassoon_sans_medium", 70, cc.p(0, 0, 0, 255), cc.p(targetSprite.getContentSize().width * 0.5, targetSprite.getContentSize().height * 0.69), targetSprite);
        }
        targetName.tag = ACTIVITY_SPINNINGWHEEL_1.Tag.targetIndexLabel;

        this.setupTargetImage();
        this.setupOptionButtons();
    },

    /**
     * setupOptionButtons : This is to set option go and stop button for student only.
     */
    setupOptionButtons : function() {
        // if(!ACTIVITY_SPINNINGWHEEL_1.ref.isTeacherView) {
            var goButtonObject = ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.goButton;
            goButton = this.createButton(ACTIVITY_SPINNINGWHEEL_1.ref.spriteBasePath + goButtonObject.idleImage, ACTIVITY_SPINNINGWHEEL_1.ref.spriteBasePath + goButtonObject.pushedImage,"",32,ACTIVITY_SPINNINGWHEEL_1.Tag.goButton, goButtonObject.position, this, this,ACTIVITY_SPINNINGWHEEL_1.ref.spriteBasePath+goButtonObject.disabledImage);
            goButton.setScale(goButtonObject.scale);
            var targetBase = this.getChildByTag(ACTIVITY_SPINNINGWHEEL_1.Tag.targetBase);
            var goPosition = cc.p(targetBase.getPositionX() + goButton.getContentSize().width * 0.5 * goButton.getScale(), targetBase.getPositionY() - 20);
            goButton.setPosition(goPosition);
            goButton.setEnabled(this.isGoButtonEnabled());
            this.handIconUI.push(goButton);

            var stopButtonObject = ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.stopButton;
            var stopButton = this.createButton(ACTIVITY_SPINNINGWHEEL_1.ref.spriteBasePath + stopButtonObject.idleImage, ACTIVITY_SPINNINGWHEEL_1.ref.spriteBasePath + stopButtonObject.pushedImage, "",32, ACTIVITY_SPINNINGWHEEL_1.Tag.stopButton, stopButtonObject.position, this, this,ACTIVITY_SPINNINGWHEEL_1.ref.spriteBasePath + stopButtonObject.disabledImage);
            stopButton.setScale(stopButtonObject.scale);
            var stopPosition = goButton.getPosition();
            stopButton.setPosition(stopPosition);
            stopButton.setEnabled(false);
            stopButton.setVisible(false);
            this.handIconUI.push(stopButton);
        // }
    },

    /**
     * setupTargetImage: This will set target image which need to be matched by student.
     */
    setupTargetImage: function() {
        var targetBase = this.getChildByTag(ACTIVITY_SPINNINGWHEEL_1.Tag.targetBase);
        var targetImage = targetBase.getChildByTag(ACTIVITY_SPINNINGWHEEL_1.Tag.targetImage);
        if(!ACTIVITY_SPINNINGWHEEL_1.ref.config.targetAssets[ACTIVITY_SPINNINGWHEEL_1.ref.currentTargetIndex].name){
            return;
        }
        var sprite = new cc.Sprite(ACTIVITY_SPINNINGWHEEL_1.ref.spriteBasePath+ACTIVITY_SPINNINGWHEEL_1.ref.config.targetAssets[ACTIVITY_SPINNINGWHEEL_1.ref.currentTargetIndex].name);
        targetImage.setTexture(sprite.getTexture());
        targetImage.setScale(ACTIVITY_SPINNINGWHEEL_1.ref.config.targetAssets[ACTIVITY_SPINNINGWHEEL_1.ref.currentTargetIndex].scale * 2.5);

        if(ACTIVITY_SPINNINGWHEEL_1.ref.config.targetAssets[ACTIVITY_SPINNINGWHEEL_1.ref.currentTargetIndex].nameImage){
            let sprite = targetBase.getChildByTag(ACTIVITY_SPINNINGWHEEL_1.Tag.targetIndexLabel)
            if(sprite &&  sprite.setTexture){
                sprite.setVisible(true);
                sprite.setTexture( new cc.Sprite(ACTIVITY_SPINNINGWHEEL_1.ref.config.targetAssets[ACTIVITY_SPINNINGWHEEL_1.ref.currentTargetIndex].nameImageName).getTexture());
            }
        }else{

            var tempLabel = targetBase.getChildByTag(ACTIVITY_SPINNINGWHEEL_1.Tag.targetIndexLabel);
            tempLabel.setVisible(false);
            tempLabel.setString(ACTIVITY_SPINNINGWHEEL_1.ref.config.targetAssets[ACTIVITY_SPINNINGWHEEL_1.ref.currentTargetIndex].cardValue);
        }
    },

    /**
     * setupSpinningWheel: This will setup base spinning wheel.
     */
    setupSpinningWheel : function() {
        var spinningWheelBaseObject =  ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.spinningWheelBase;
        var spinningWheelCenterObject =  ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.spinningCenter;
        var spinningWheelTopObject =  ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.spinningWheelTop;

        var position = ACTIVITY_SPINNINGWHEEL_1.ref.isTeacherView ? spinningWheelBaseObject.position : cc.p(cc.winSize.width  * 0.3, cc.winSize.height * 0.5);

        var spinningWheelBase = this.addSprite(ACTIVITY_SPINNINGWHEEL_1.ref.spriteBasePath+spinningWheelBaseObject.name,position,this);
        // var spinningWheelBase = this.createColourLayer(cc.color(0,0,0,150),spinningWheelBaseObject.size.width,spinningWheelBaseObject.size.height,spinningWheelBaseObject.position,this,3);
        spinningWheelBase.tag = ACTIVITY_SPINNINGWHEEL_1.Tag.spinningWheelBase;
        spinningWheelBase.setScale(spinningWheelBaseObject.scale);
        // spinningWheelBase.setAnchorPoint(0.5,0.5);
        this.setWheelObject(spinningWheelBase);

        var spinningWheelCenter = this.addSprite(ACTIVITY_SPINNINGWHEEL_1.ref.spriteBasePath + spinningWheelCenterObject.name,cc.p(spinningWheelBase.getContentSize().width * 0.5,spinningWheelBase.getContentSize().height * 0.5),spinningWheelBase);
        spinningWheelCenter.setScale(spinningWheelCenterObject.scale);

        var topPosition = cc.p(spinningWheelBase.getPositionX() ,spinningWheelBase.getPositionY()+spinningWheelBase.getContentSize().height * spinningWheelBaseObject.scale * 0.5);
        var spinningWheelTop = this.addSprite(ACTIVITY_SPINNINGWHEEL_1.ref.spriteBasePath+spinningWheelTopObject.name,topPosition,this);
        spinningWheelTop.setScale(spinningWheelTopObject.scale);
        spinningWheelTop.setLocalZOrder(100);
    },
    /**
     * setWheelObject: This will setup spinning wheel objects.
     * @param baseSprite: Base spinning wheel.
     */
    setWheelObject : function(baseSprite) {
        var wheelItems = ACTIVITY_SPINNINGWHEEL_1.ref.config.carouselAssets;
        for(let index = 0; index < wheelItems.length;index++) {
            var currentWheelItem = wheelItems[index];
            var position = this.getItemPositionOnWheel(index,wheelItems.length,baseSprite);
            var wheelItemSprite = this.addSprite(ACTIVITY_SPINNINGWHEEL_1.ref.spriteBasePath+currentWheelItem.name,position,baseSprite);
            wheelItemSprite.setScale(currentWheelItem.scale * 1.5);
            console.log(" index ",index, " angle ", this.getAngle( ACTIVITY_SPINNINGWHEEL_1.ref.config.carouselAssets.length, index  ));
            wheelItemSprite.setRotation(-this.getAngle( ACTIVITY_SPINNINGWHEEL_1.ref.config.carouselAssets.length, index  ));

            // wheelItemSprite.setRotation( index * 72 + 45);
        }
    },
    /**
     * getItemPositionOnWheel: To get item position to be set on the wheel.
     * @param currentIndex
     * @param totalItems
     * @param baseSprite
     * @returns {cc.Point}
     */
    getItemPositionOnWheel : function(currentIndex, totalItems,baseSprite) {
        var arrayXFactor = [];
        var arrayYFactor = [];
        switch (totalItems) {
            case 4:
                arrayXFactor = [0.7, 0.7, 0.3, 0.3];
                arrayYFactor = [0.7, 0.3, 0.3, 0.7];
                break;
            case 5:
                arrayXFactor = [0.5, 0.75, 0.675, 0.325, 0.25];
                arrayYFactor = [0.75, 0.55, 0.275, 0.275, 0.55];
                break;
            case 6:
                arrayXFactor = [0.65, 0.78, 0.65, 0.35, 0.22, 0.35];
                arrayYFactor = [0.75, 0.5, 0.25, 0.25, 0.5, 0.75];
                break;
        }
        return cc.p(baseSprite.getContentSize().width * arrayXFactor[currentIndex],baseSprite.getContentSize().height * arrayYFactor[currentIndex]);
    },
    /**
     * isGoButtonEnabled: Returns if Go button is enabled or not.
     * @returns {boolean}
     */
    isGoButtonEnabled : function () {
        if(ACTIVITY_SPINNINGWHEEL_1.ref.isStudentInteractionEnable && ACTIVITY_SPINNINGWHEEL_1.ref.cardQueue.length > 0) {
            return  true;
        }
        return false;
    },
    /**
     * isStopButtonEnabled: Returns if Stop button is enabled or not.
     * @returns {boolean}
     */
    isStopButtonEnabled : function() {
        if(ACTIVITY_SPINNINGWHEEL_1.ref.isStudentInteractionEnable) {
            return  true;
        }
        return false;
    },

    /**
     * updateRoomData: This will be update room data which is required for game state management.
     */
    updateRoomData: function() {
        SocketManager.emitCutomEvent("SingleEvent", {'eventType':HDSocketEventType.UPDATE_ROOM_DATA,'roomId': HDAppManager.roomId ,'data':  {"roomId":HDAppManager.roomId,"roomData": {"activity":  ACTIVITY_SPINNINGWHEEL_1.ref.config.properties.namespace,"data": {"arrayData":ACTIVITY_SPINNINGWHEEL_1.ref.cardQueue,"currentObject":ACTIVITY_SPINNINGWHEEL_1.ref.currentTargetIndex}, "activityStartTime" : HDAppManager.getActivityStartTime()} }},null);
    },
    /**
     * syncData: This will update game state according to current game state of other users.
     * @param data
     */
    syncData: function(data) {
        if(data.arrayData) {
            ACTIVITY_SPINNINGWHEEL_1.ref.cardQueue.length = 0;
            ACTIVITY_SPINNINGWHEEL_1.ref.cardQueue = data.arrayData;
            if(ACTIVITY_SPINNINGWHEEL_1.ref.isTeacherView) {
                ACTIVITY_SPINNINGWHEEL_1.ref.tableView.reloadData();
            }
        }
        if(data.currentObject) {
            ACTIVITY_SPINNINGWHEEL_1.ref.currentTargetIndex = data.currentObject;
        }
    },
    /**
     * socketListener: This will receive all the emitted socket events.
     * @param res
     */
    socketListener : function(res){
        if(!ACTIVITY_SPINNINGWHEEL_1.ref) {
            return;
        }
        switch (res.eventType) {
            case HDSocketEventType.DISABLE_INTERACTION:
                ACTIVITY_SPINNINGWHEEL_1.ref.disableInteraction(res.data);
                break;
            case HDSocketEventType.STUDENT_TURN:
                ACTIVITY_SPINNINGWHEEL_1.ref.studentTurn(res.data);
                break;
            case HDSocketEventType.GAME_MESSAGE:
                ACTIVITY_SPINNINGWHEEL_1.ref.gameEvents(res.data);
                break;
            case HDSocketEventType.STUDENT_STATUS:
                ACTIVITY_SPINNINGWHEEL_1.ref.studentStatus(res.data);
                break;
        }
    },
    /**
     * gameEvents: This will handle events specific to this game.
     * @param res
     */
    gameEvents: function (res) {
        switch ( res.eventType) {
            case ACTIVITY_SPINNINGWHEEL_1.socketEvents.SPIN_WHEEL:
                ACTIVITY_SPINNINGWHEEL_1.ref.rotateWheel();
                break;
            case ACTIVITY_SPINNINGWHEEL_1.socketEvents.ADD_CARD_TO_QUEUE:
                ACTIVITY_SPINNINGWHEEL_1.ref.addCardToQueue(res.data);
                break;
            case ACTIVITY_SPINNINGWHEEL_1.socketEvents.REMOVE_CARD_FROM_QUEUE:
                ACTIVITY_SPINNINGWHEEL_1.ref.removeCardFromQueue(res.data);
                break;
            case ACTIVITY_SPINNINGWHEEL_1.socketEvents.STOP_WHEEL:
                ACTIVITY_SPINNINGWHEEL_1.ref.stopRotation();
                break;
            case ACTIVITY_SPINNINGWHEEL_1.socketEvents.WHEEL_STOPPED_ACKNOWLEDGEMENT:
                if(ACTIVITY_SPINNINGWHEEL_1.ref.isTeacherView) {
                    if(ACTIVITY_SPINNINGWHEEL_1.ref.stopWheelUsers.indexOf(res.data) == -1) {
                        ACTIVITY_SPINNINGWHEEL_1.ref.stopWheelUsers.push(res.data);
                    }

                    if(ACTIVITY_SPINNINGWHEEL_1.ref.checkIfGoButtonEnabled()) {
                        ACTIVITY_SPINNINGWHEEL_1.ref.isRotating = false;
                        if( ACTIVITY_SPINNINGWHEEL_1.ref.parent)
                            ACTIVITY_SPINNINGWHEEL_1.ref.parent.setStudentPanelActive(!ACTIVITY_SPINNINGWHEEL_1.ref.isRotating);
                        ACTIVITY_SPINNINGWHEEL_1.ref.enableGoButton(ACTIVITY_SPINNINGWHEEL_1.ref.isGoButtonEnabled());
                    }
                }
                break;
        }
    },

    /**
     * checkIfGoButtonEnabled: This will check if all students wheel has stopped.
     * @returns {boolean}
     */
    checkIfGoButtonEnabled: function() {
        if(ACTIVITY_SPINNINGWHEEL_1.ref.joinedStudentList.users && ACTIVITY_SPINNINGWHEEL_1.ref.stopWheelUsers && ((ACTIVITY_SPINNINGWHEEL_1.ref.joinedStudentList.users.length) == ACTIVITY_SPINNINGWHEEL_1.ref.stopWheelUsers.length)) {
            var tempList = ACTIVITY_SPINNINGWHEEL_1.ref.joinedStudentList.users;
            for(let index = 0; index < ACTIVITY_SPINNINGWHEEL_1.ref.joinedStudentList.users.length; index++) {
                let user = ACTIVITY_SPINNINGWHEEL_1.ref.joinedStudentList.users[index];
                for(let currentIndex = 0; currentIndex< ACTIVITY_SPINNINGWHEEL_1.ref.stopWheelUsers.length; currentIndex++) {
                    if(user.userName  == ACTIVITY_SPINNINGWHEEL_1.ref.stopWheelUsers[currentIndex]) {
                        tempList.splice(index,1);
                    }
                }
            }
            if(tempList.length < 2) {
                ACTIVITY_SPINNINGWHEEL_1.ref.stopWheelUsers.length = 0;
                return true;
            }
            return false;
        }
        return false;
    },
    /**
     * studentStatus = This will store list of current users.
     * @param data
     */
    studentStatus: function (data) {
        if(data.users.length == 1 || ACTIVITY_SPINNINGWHEEL_1.ref.isTeacherLeft(data)) {
            ACTIVITY_SPINNINGWHEEL_1.ref.stopRotation();
            ACTIVITY_SPINNINGWHEEL_1.ref.isStudentInteractionEnable = false;
        } else {
            if( ACTIVITY_SPINNINGWHEEL_1.ref.isTeacherView) {
                this.joinedStudentList = [];
                this.joinedStudentList = data;
            }
        }
    },

    isTeacherLeft : function(data){
        let teacherId = data.teacherId;
        let usersArr = data.users.map(user => user.userId);
        console.log("userArr ", usersArr, "userNameArray ", teacherId);
        return (usersArr.indexOf(teacherId) == -1 ? true : false);

    },

    /**
     * updateStudentTurn: This will emit event to change student turn.
     * @param userName
     */
    updateStudentTurn : function(userName) {
        if(ACTIVITY_SPINNINGWHEEL_1.ref.isRotating) {
            return;
        }
        if(ACTIVITY_SPINNINGWHEEL_1.ref.isTeacherView) {
            if(!userName) {
                this.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_TEACHER,{"roomId":HDAppManager.roomId, "users":[]});
            } else {
                this.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_TEACHER,{"roomId":HDAppManager.roomId, "users":[{userName: userName}]});
                ACTIVITY_SPINNINGWHEEL_1.ref.triggerScript(ACTIVITY_SPINNINGWHEEL_1.ref.config.teacherScripts.onMouseEnable);
            }
        }
    },
    /**
     * studentTurn: This method will update user  turn.
     * @param res
     */
    studentTurn: function (res) {
        // let users = res.users;
        // if(!ACTIVITY_SPINNINGWHEEL_1.ref.isTeacherView) {
        //     for (let index = 0; index < users.length; index++) {
        //         let obj = users[index];
        //         if (obj.userName == HDAppManager.username) {
        //             if (ACTIVITY_SPINNINGWHEEL_1.ref.isRotating) {
        //                 ACTIVITY_SPINNINGWHEEL_1.ref.tempInteraction = true;
        //             } else {
        //                 ACTIVITY_SPINNINGWHEEL_1.ref.isStudentInteractionEnable = true;
        //             }
        //             break;
        //         } else {
        //             if (ACTIVITY_SPINNINGWHEEL_1.ref.isRotating) {
        //                 ACTIVITY_SPINNINGWHEEL_1.ref.tempInteraction = false;
        //             } else {
        //                 ACTIVITY_SPINNINGWHEEL_1.ref.isStudentInteractionEnable = false;
        //             }
        //         }
        //     }
        //     this.enableGoButton(ACTIVITY_SPINNINGWHEEL_1.ref.isGoButtonEnabled());
        //     this.enableStopButton(ACTIVITY_SPINNINGWHEEL_1.ref.isStopButtonEnabled());
        // }
        let users = res.users;
        if(ACTIVITY_SPINNINGWHEEL_1.ref.isTeacherView) {
            // if(users.length == 0) {
            //     ACTIVITY_SPINNINGWHEEL_1.ref.stopRotation();
            // }
        } else {
            if(users.length == 0) {
                ACTIVITY_SPINNINGWHEEL_1.ref.stopRotation();
                ACTIVITY_SPINNINGWHEEL_1.ref.isStudentInteractionEnable = false;
            } else {
                for(let index = 0; index < users.length; index++) {
                    let obj = users[index];
                    if(obj.userName == HDAppManager.username) {
                        if(ACTIVITY_SPINNINGWHEEL_1.ref.isRotating) {
                            ACTIVITY_SPINNINGWHEEL_1.ref.tempInteraction = true;
                        } else {
                            ACTIVITY_SPINNINGWHEEL_1.ref.isStudentInteractionEnable = true;
                        }
                        break;
                    } else {
                        if(ACTIVITY_SPINNINGWHEEL_1.ref.isRotating) {
                            ACTIVITY_SPINNINGWHEEL_1.ref.tempInteraction = false;
                        } else {
                            ACTIVITY_SPINNINGWHEEL_1.ref.isStudentInteractionEnable = false;
                        }
                    }
                }
            }

        }
        if(!ACTIVITY_SPINNINGWHEEL_1.ref.isTeacherView) {
            this.enableGoButton(ACTIVITY_SPINNINGWHEEL_1.ref.isGoButtonEnabled());
            this.enableStopButton(ACTIVITY_SPINNINGWHEEL_1.ref.isStopButtonEnabled());
        }
    },
    /**
     * enableGoButton: This will set value for go button.
     * @param value
     */
    enableGoButton : function(value) {
        var goButton = ACTIVITY_SPINNINGWHEEL_1.ref.getChildByTag(ACTIVITY_SPINNINGWHEEL_1.Tag.goButton);
        if(goButton){
            goButton.setEnabled(value);
        }
    },
    /**
     * enableStopButton: This will set value for stop button.
     * @param value
     */
    enableStopButton: function(value) {
        var stopButton = ACTIVITY_SPINNINGWHEEL_1.ref.getChildByTag(ACTIVITY_SPINNINGWHEEL_1.Tag.stopButton);
        if(stopButton){
            stopButton.setEnabled(value);
        }
    },

    /**studentTurn
     * updateGoButton: This will update texture and tag of the button.
     * @param isGoButton
     */
    updateGoButton: function(isGoButton) {
        var goButton = this.getChildByTag(ACTIVITY_SPINNINGWHEEL_1.Tag.goButton);
        var stopButton = this.getChildByTag(ACTIVITY_SPINNINGWHEEL_1.Tag.stopButton);
        if(goButton && stopButton) {
            if(isGoButton) {
                goButton.setVisible(true);
                stopButton.setVisible(false);
            } else {
                goButton.setVisible(false);
                stopButton.setVisible(true);
            }
        }
    },
    /**
     * disableInteraction: This  will update student interaction and go button state.
     * @param enable
     */
    disableInteraction : function (enable) {
        if(ACTIVITY_SPINNINGWHEEL_1.ref.isRotating) {
            ACTIVITY_SPINNINGWHEEL_1.ref.tempInteraction = enable;
        } else {
            ACTIVITY_SPINNINGWHEEL_1.ref.isStudentInteractionEnable = enable;
        }
        this.enableGoButton(ACTIVITY_SPINNINGWHEEL_1.ref.isGoButtonEnabled());
    },

    /**
     * emitSocketEvent : This will emit event to server.
     * @param type - Event Type
     * @param data - Data to sent
     */
    emitSocketEvent : function(type, data){
        SocketManager.emitCutomEvent(ACTIVITY_SPINNINGWHEEL_1.socketEventKey.singleEvent, {'eventType': type, 'roomId':HDAppManager.roomId, 'data':data},null);
    },

    /**
     * buttonCallback: This method handles button callback.
     * @param sender
     * @param type
     */
    buttonCallback : function (sender, type) {
        let button      = sender;
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                switch(sender.tag) {
                    case ACTIVITY_SPINNINGWHEEL_1.Tag.goButton:
                        if(this.isStudentInteractionEnable && this.cardQueue.length > 0) {
                            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {'eventType': ACTIVITY_SPINNINGWHEEL_1.socketEvents.SPIN_WHEEL, 'data': null});
                        }
                        break;
                    case ACTIVITY_SPINNINGWHEEL_1.Tag.stopButton:
                        if(this.isStudentInteractionEnable) {
                            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {'eventType': ACTIVITY_SPINNINGWHEEL_1.socketEvents.STOP_WHEEL, 'data': null});
                        }
                        break;
                }
                break;
        }
    },

    /**
     * rotateWheel: This method starts rotating the wheel.
     */
    rotateWheel: function() {
        this.updateGoButton(false);
        //Remove the any stop action if running
        ACTIVITY_SPINNINGWHEEL_1.ref.stopActionByTag(111);
        //
        this.enableGoButton(false);
        this.enableStopButton(ACTIVITY_SPINNINGWHEEL_1.ref.isStopButtonEnabled());

        ACTIVITY_SPINNINGWHEEL_1.ref.triggerScript(ACTIVITY_SPINNINGWHEEL_1.ref.config.teacherScripts.onGoButton);
        ACTIVITY_SPINNINGWHEEL_1.ref.isRotating = true;
        if( ACTIVITY_SPINNINGWHEEL_1.ref.parent)
        ACTIVITY_SPINNINGWHEEL_1.ref.parent.setStudentPanelActive(!ACTIVITY_SPINNINGWHEEL_1.ref.isRotating);
        ACTIVITY_SPINNINGWHEEL_1.ref.speed = 6;
        ACTIVITY_SPINNINGWHEEL_1.ref.scheduleUpdate();

        if (ACTIVITY_SPINNINGWHEEL_1.ref.tableView)
            ACTIVITY_SPINNINGWHEEL_1.ref.tableView.setTouchEnabled(false);

    },

    /**
     * stopRotation: This method stops rotating the wheel.
     */
    stopRotation : function() {
        this.updateGoButton(true);
        if (!ACTIVITY_SPINNINGWHEEL_1.ref.isRotating) //If wheel is not rotating then there is not need to stop the wheel
            return;

        this.enableStopButton(false);
        var action = cc.repeatForever(cc.sequence(cc.delayTime(0.5), cc.callFunc(this.updateWheelRotation, this)));
        action.setTag(111);
        ACTIVITY_SPINNINGWHEEL_1.ref.runAction(action);
    },

    /**
     * updateWheelRotation: This method is used to manage speed of wheel.
     * @returns {number}
     */
    updateWheelRotation: function () {
        if(!ACTIVITY_SPINNINGWHEEL_1.ref) {
            return 0;
        }
        var angle = ACTIVITY_SPINNINGWHEEL_1.ref.speed - 1;
        if(angle == 0) {
            angle = 1;
            ACTIVITY_SPINNINGWHEEL_1.ref.speed = 1;
        }
        if(!ACTIVITY_SPINNINGWHEEL_1.ref.isRotating) {
            angle = 0;
        }
        return ACTIVITY_SPINNINGWHEEL_1.ref.speed = angle;
    },

    /**
     * getAngle: Return angle of the current index data.
     * @param data
     * @param index
     * @returns {number}
     */
    getAngle: function(data,index) {
        var initialAngle = this.getInitialAngle(data,index);
        var selectedItemAngle = initialAngle - index * (this.getPieAngle(data));
        return selectedItemAngle;
    },

    /**
     * update: This will update the speed of the wheel.
     * @param delta
     */
    update : function(delta) {
        if (ACTIVITY_SPINNINGWHEEL_1.ref.isRotating) {
            var speed = this.calculateSpeed();
            var wheel = this.getChildByTag(ACTIVITY_SPINNINGWHEEL_1.Tag.spinningWheelBase);
            var rotation = wheel.getRotation();
            var neoRotation = (rotation+speed) % 360;
            wheel.setRotation(neoRotation);
            if(ACTIVITY_SPINNINGWHEEL_1.ref.speed < 3) {
                var selectedItemAngle = ACTIVITY_SPINNINGWHEEL_1.ref.getAngle(ACTIVITY_SPINNINGWHEEL_1.ref.config.carouselAssets.length, ACTIVITY_SPINNINGWHEEL_1.ref.cardQueue[0]);
                if(wheel.getRotationX() < selectedItemAngle + 5 && wheel.getRotationX() > selectedItemAngle  - 5) {
                    ACTIVITY_SPINNINGWHEEL_1.ref.stopActionByTag(111);
                    ACTIVITY_SPINNINGWHEEL_1.ref.speed = 4;

                    ACTIVITY_SPINNINGWHEEL_1.ref.unscheduleUpdate();
                    ACTIVITY_SPINNINGWHEEL_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {'eventType': ACTIVITY_SPINNINGWHEEL_1.socketEvents.WHEEL_STOPPED_ACKNOWLEDGEMENT, 'data': HDAppManager.username});
                    if(ACTIVITY_SPINNINGWHEEL_1.ref.isTeacherView) {
                        ACTIVITY_SPINNINGWHEEL_1.ref.automaticEnable();
                    }

                    var resultMatched = false;
                    if (ACTIVITY_SPINNINGWHEEL_1.ref.cardQueue[0] === ACTIVITY_SPINNINGWHEEL_1.ref.currentTargetIndex)
                        resultMatched = true;
                    ACTIVITY_SPINNINGWHEEL_1.ref.completionAnimation(resultMatched);

                    ACTIVITY_SPINNINGWHEEL_1.ref.removeCardDataFromQueue(ACTIVITY_SPINNINGWHEEL_1.ref.cardQueue[0]);
                    if(ACTIVITY_SPINNINGWHEEL_1.ref.tableView) {
                        ACTIVITY_SPINNINGWHEEL_1.ref.tableView.reloadData();
                    }
                }
            }
        }
    },

    /**
     * completionAnimation: This method perform actions when wheel is stopped.
     * @param isCorrectAnswer
     */
    completionAnimation: function(isCorrectAnswer) {
        let completionAnimation = cc.callFunc(function(){
            //Animation Effect
            var animationSprite = new cc.Sprite(ACTIVITY_SPINNINGWHEEL_1.ref.animationBasePath+"Win/object_pulled_out_animation_0001.png");
            // var animation = null;
            if(isCorrectAnswer) {
                var animation = HDUtility.runFrameAnimation(ACTIVITY_SPINNINGWHEEL_1.ref.animationBasePath+"Win/object_pulled_out_animation_", ACTIVITY_SPINNINGWHEEL_1.ref.config.animation.win.frameCount, 0.1, ".png", 1);
                animationSprite.setPosition(cc.p(ACTIVITY_SPINNINGWHEEL_1.ref.getContentSize().width * 0.5, ACTIVITY_SPINNINGWHEEL_1.ref.getContentSize().height * 0.5));
                ACTIVITY_SPINNINGWHEEL_1.ref.addChild(animationSprite)
                animationSprite.runAction(animation);
            } else {
                // animation = HDUtility.runFrameAnimation(ACTIVITY_SPINNINGWHEEL_1.ref.animationBasePath+"Loss/object_pulled_out_animation_", ACTIVITY_SPINNINGWHEEL_1.ref.config.animation.loss.frameCount, 0.1, ".png", 1);
            }
            cc.audioEngine.playEffect(ACTIVITY_SPINNINGWHEEL_1.ref.soundPath + ACTIVITY_SPINNINGWHEEL_1.ref.config.audioAssets.tapHiddenObject.name);
        });

        let updateTarget = cc.callFunc(function(){
            ACTIVITY_SPINNINGWHEEL_1.ref.setupNextTarget();
            if(ACTIVITY_SPINNINGWHEEL_1.ref.isStudentInteractionEnable && !ACTIVITY_SPINNINGWHEEL_1.ref.isTeacherView) {
                ACTIVITY_SPINNINGWHEEL_1.ref.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_STUDENT,{"roomId":HDAppManager.roomId});
            }
            if(!ACTIVITY_SPINNINGWHEEL_1.ref.isTeacherView) {
                ACTIVITY_SPINNINGWHEEL_1.ref.isRotating = false;
            }
            if(ACTIVITY_SPINNINGWHEEL_1.ref.tempInteraction && !ACTIVITY_SPINNINGWHEEL_1.ref.isTeacherView) {
                ACTIVITY_SPINNINGWHEEL_1.ref.isStudentInteractionEnable = ACTIVITY_SPINNINGWHEEL_1.ref.tempInteraction;
                ACTIVITY_SPINNINGWHEEL_1.ref.tempInteraction = null;
                if(!ACTIVITY_SPINNINGWHEEL_1.ref.isTeacherView) {
                    ACTIVITY_SPINNINGWHEEL_1.ref.enableGoButton(ACTIVITY_SPINNINGWHEEL_1.ref.isGoButtonEnabled());
                    ACTIVITY_SPINNINGWHEEL_1.ref.enableStopButton(ACTIVITY_SPINNINGWHEEL_1.ref.isStopButtonEnabled());
                }
            }
        });

        var animationSprite = ACTIVITY_SPINNINGWHEEL_1.ref.baseLayer.getChildByTag(ACTIVITY_SPINNINGWHEEL_1.Tag.animationSprite);
        animationSprite.runAction(cc.sequence([completionAnimation, cc.delayTime(10), updateTarget ]));

        if (ACTIVITY_SPINNINGWHEEL_1.ref.tableView)
            ACTIVITY_SPINNINGWHEEL_1.ref.tableView.setTouchEnabled(true);
    },

    automaticEnable: function() {
        let enableButton = cc.callFunc(function(){
            ACTIVITY_SPINNINGWHEEL_1.ref.isRotating = false;
            if( ACTIVITY_SPINNINGWHEEL_1.ref.parent)
                ACTIVITY_SPINNINGWHEEL_1.ref.parent.setStudentPanelActive(!ACTIVITY_SPINNINGWHEEL_1.ref.isRotating);
            ACTIVITY_SPINNINGWHEEL_1.ref.enableGoButton(ACTIVITY_SPINNINGWHEEL_1.ref.isGoButtonEnabled());
        });
        ACTIVITY_SPINNINGWHEEL_1.ref.runAction(cc.sequence([cc.delayTime(12),enableButton]));
    },

    /**
     * setupNextTarget: This will setup next target image.
     */
    setupNextTarget: function() {
        if(ACTIVITY_SPINNINGWHEEL_1.ref.currentTargetIndex + 1 >= ACTIVITY_SPINNINGWHEEL_1.ref.config.targetAssets.length) {
            ACTIVITY_SPINNINGWHEEL_1.ref.currentTargetIndex = 0;
            ACTIVITY_SPINNINGWHEEL_1.ref.setupTargetImage();
            // this.enableGoButton(ACTIVITY_SPINNINGWHEEL_1.ref.isGoButtonEnabled());
            return;
        }
        ACTIVITY_SPINNINGWHEEL_1.ref.currentTargetIndex = ACTIVITY_SPINNINGWHEEL_1.ref.currentTargetIndex + 1;
        ACTIVITY_SPINNINGWHEEL_1.ref.setupTargetImage();
        this.enableGoButton(ACTIVITY_SPINNINGWHEEL_1.ref.isGoButtonEnabled());
    },
    /**
     * calculateSpeed: This will return speed of wheel if it is rotating.
     * @returns {number}
     */
    calculateSpeed : function(){
        if(ACTIVITY_SPINNINGWHEEL_1.ref.isRotating) {
            return ACTIVITY_SPINNINGWHEEL_1.ref.speed
        }
    },
    /**
     * getInitialAngle: This will give initial angle for final angle.
     * @param totalItems
     * @param index
     * @returns {number}
     */
    getInitialAngle: function(totalItems, index) {
        switch(totalItems) {
            case 4:
                return 315;
            case 5:
                return index == 0 ? 0 : 360;
            case 6:
                return 330;
        }
    },
    /**
     * getPieAngle : Getting each pie angle of wheel.
     * @param totalItems
     * @returns {number}
     */
    getPieAngle: function(totalItems) {
        switch(totalItems) {
            case 4:
                return 90;
            case 5:
                return 72;
            case 6:
                return 60;
        }
    },

    /**
     * setCardContent: This will setup table view for wheel items.
     */
    setCardContent: function () {
        let position = cc.p(this.getPositionForTableView(), 0);
        let width = this.getWidthOfCarousel();
        var tableMargin = 0;

        let baseColorLayer = this.createColourLayer(cc.color(ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBackground.color.r,ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBackground.color.g,ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBackground.color.b, ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBackground.color.a), width, this.carouselHeight, position,this,1);
        if(ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBackgroundImage.name != "") {
            let carouselBaseImage = this.addSprite(ACTIVITY_SPINNINGWHEEL_1.ref.spriteBasePath + ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBackgroundImage.name,cc.p(position.x-10,position.y),this);
            carouselBaseImage.setLocalZOrder(3);
            let scaleX = (baseColorLayer._contentSize.width + 20) / carouselBaseImage._contentSize.width;
            let scaleY = (baseColorLayer._contentSize.height + 40) / carouselBaseImage._contentSize.height;
            carouselBaseImage.setScaleX(scaleX);
            carouselBaseImage.setScaleY(scaleY);
            carouselBaseImage.setAnchorPoint(0,0);

            let carouselBorderImage = this.addSprite(ACTIVITY_SPINNINGWHEEL_1.ref.spriteBasePath + ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBackgroundBorderImage.name,cc.p(position.x-10,position.y),this);
            carouselBorderImage.setLocalZOrder(5);
            carouselBorderImage.setScaleX(scaleX);
            carouselBorderImage.setScaleY(scaleY);
            carouselBorderImage.setAnchorPoint(0,0);
            position = cc.p(position.x - 4, position.y + 13);
            tableMargin = 11;
        }

        this.tableView = new cc.TableView(this, cc.size(width, this.carouselHeight+tableMargin));
        this.tableView.setPosition(cc.p(position.x, position.y));
        this.tableView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this.tableView.setBounceable(false);
        this.tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        this.tableView.setTouchEnabled(true);
        this.tableView.setDataSource(this);
        this.tableView.setDelegate(this);
        this.addChild(this.tableView,4);
        this.handIconUI.push(this.tableView);
    },

    /**
     * getWidthOfCarousel: This will calculate the width of tableview width.
     * @returns {number}
     */
    getWidthOfCarousel: function() {
        let cellWidthSize = this.carouselHeight * ACTIVITY_SPINNINGWHEEL_1.ref.config.carouselAssets.length;
        let maxWidth =  this.carouselHeight * 5; //this.winSize.width * 0.6
        if(cellWidthSize > maxWidth) {
            return maxWidth - 12;
        } else {
            return cellWidthSize
        }
    },
    /**
     * getPositionForTableView: To get x position of the table view.
     * @returns {number}
     */
    getPositionForTableView: function() {
        let width = this.getWidthOfCarousel();
        let xPos = (cc.winSize.width * 0.5) - (width * 0.5);
        return xPos;
    },

    /**
     * isCellSelected: To check id cell is selected of not.
     * @param data
     * @returns {boolean}
     */
    isCellSelected: function(data) {
        for(let index in this.cardQueue) {
            if(data == this.cardQueue[index]) {
                return true;
            }
        }
        return false;
    },
    /**
     * To set TableView cell size
     * @param table
     * @param idx
     * @returns {cc.Size}
     */
    tableCellSizeForIndex: function (table, idx) {
        return cc.size(this.carouselHeight, table.getViewSize().height);
    },

    /**
     * To create tableview cell
     * @param table
     * @param idx
     * @returns {TableViewCell}
     */
    tableCellAtIndex: function (table, idx) {
        let cardCell   =   table.dequeueCell();
        let cellSize    =   this.tableCellSizeForIndex(table, idx);
        if(cardCell == null) {
            cardCell   =   new ACTIVITY_SPINNINGWHEEL_1.HDCardCell(cellSize);
        }
        cardCell.tag = idx;
        cardCell.createUI(idx,ACTIVITY_SPINNINGWHEEL_1.ref.config.carouselAssets[idx],cardCell, this.isCellSelected(idx));
        return cardCell;
    },

    /**
     * numberOfCellsInTableView: Return number of cell in table view.
     * @param table
     * @returns {*}
     */
    numberOfCellsInTableView: function (table) {
        return ACTIVITY_SPINNINGWHEEL_1.ref.config.carouselAssets.length;
    },

    /**
     * tableCellTouched: To perform action when cell is touched.
     * @param table
     * @param cell
     */
    tableCellTouched: function (table, cell) {
        if(ACTIVITY_SPINNINGWHEEL_1.ref.isRotating) {
            return;
        }
        cell.stopAllActions();
        let completedAnimation = cc.callFunc(function(){
            if(ACTIVITY_SPINNINGWHEEL_1.ref.isCellSelected(cell.tag)) {
                cell.highlightLayer.setVisible(false);
                ACTIVITY_SPINNINGWHEEL_1.ref.removeCardDataFromQueue(cell.tag);
                ACTIVITY_SPINNINGWHEEL_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {'eventType': ACTIVITY_SPINNINGWHEEL_1.socketEvents.REMOVE_CARD_FROM_QUEUE, 'data': cell.tag});
            } else {
                cell.highlightLayer.setVisible(true);
                var lastIndex = -1;
                if(ACTIVITY_SPINNINGWHEEL_1.ref.cardQueue) {
                    lastIndex = ACTIVITY_SPINNINGWHEEL_1.ref.cardQueue.length == 0 ? -1 : ACTIVITY_SPINNINGWHEEL_1.ref.cardQueue[0];
                }
                ACTIVITY_SPINNINGWHEEL_1.ref.addCardToQueue(cell.tag);
                if(lastIndex  != -1) {
                    ACTIVITY_SPINNINGWHEEL_1.ref.tableView.updateCellAtIndex(lastIndex);
                }
                ACTIVITY_SPINNINGWHEEL_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {'eventType': ACTIVITY_SPINNINGWHEEL_1.socketEvents.ADD_CARD_TO_QUEUE, 'data': cell.tag});
            }
            ACTIVITY_SPINNINGWHEEL_1.ref.updateRoomData();
        });

        cell.runAction( cc.sequence(completedAnimation, cc.scaleTo(0.1, 1.02, 1.02), cc.scaleTo(0.2,1, 1)));
    },

    /**
     * getIndexOfCurrentElement: To get index of current element.
     * @param data
     * @returns {number}
     */
    getIndexOfCurrentElement: function(data) {
        for(var index = 0; index < ACTIVITY_SPINNINGWHEEL_1.ref.config.carouselAssets.length; index++) {
            if(data.name == ACTIVITY_SPINNINGWHEEL_1.ref.config.carouselAssets[index].name) {
                return index;
            }
        }
        return -1;
    },

    /**
     * addCardToQueue: To add item to cards queue.
     * @param index
     */
    addCardToQueue : function(index) {
        let obj = index;
        if(ACTIVITY_SPINNINGWHEEL_1.ref.cardQueue == null) {
            ACTIVITY_SPINNINGWHEEL_1.ref.cardQueue = [];
        }
        ACTIVITY_SPINNINGWHEEL_1.ref.cardQueue.length = 0;
        ACTIVITY_SPINNINGWHEEL_1.ref.cardQueue.push(obj);

        this.enableGoButton(ACTIVITY_SPINNINGWHEEL_1.ref.isGoButtonEnabled());
    },

    /**
     * removeCardFromQueue: To remove card from queue
     * @param data
     */
    removeCardFromQueue: function(data) {
        if(data != null) {
            ACTIVITY_SPINNINGWHEEL_1.ref.cardQueue.length = 0;
        }
        this.enableGoButton(ACTIVITY_SPINNINGWHEEL_1.ref.isGoButtonEnabled());
    },
    /**
     * removeCardDataFromQueue: To remove card from queue
     * @param data
     */
    removeCardDataFromQueue: function(data) {
        for(let i = 0; i<this.cardQueue.length; i++) {
            if(this.cardQueue[i]== data) {
                this.cardQueue.splice(i,1);
                break;
            }
        }
    },
    /**
     * mouseControlEnable: To check if mouse is enabled or not
     * @param location
     * @returns {boolean}
     */
    mouseControlEnable: function(location) {
        if(ACTIVITY_SPINNINGWHEEL_1.ref.tableView && cc.rectContainsPoint(ACTIVITY_SPINNINGWHEEL_1.ref.tableView.getBoundingBox(), location)){
            return true;
        }
        for(let obj of this.handIconUI){
            if(cc.rectContainsPoint(obj.getBoundingBox(), obj.getParent().convertToNodeSpace(location)) && this.isStudentInteractionEnable && obj.isEnabled() && this.cardQueue.length > 0) {
                return true;
            }
        }
        return false;
    },

    /**
     * triggerScript: To trigger the script
     * @param message
     */
    triggerScript: function(message) {
        if(this.parent) {
            this.parent.showScriptMessage(message.ops);
        }
    },
    triggerTip: function(message) {
        if(this.parent) {
            this.parent.showTipMessage(message.ops);
        }
    },
    /**
     * isTurnSwitchingBlocked: This will block turn  change in game.
     */
    isTurnSwitchingBlocked : function() {
        return ACTIVITY_SPINNINGWHEEL_1.ref.isRotating;
    }
});

/**
 * Card Cell
 */
ACTIVITY_SPINNINGWHEEL_1.HDCardCell = cc.TableViewCell.extend({
    cellData            :   null,
    cellHorizontalPadding : 10,
    cellVerticalPadding :10,
    cardTextHeight : 25,
    highlightLayer:null,

    ctor : function (cellSize) {
        this._super();
        this.setContentSize(cellSize);
        return true;
    },

    onEnter : function() {
        this._super();
    },

    createUI : function (idx, data, parent, isSelected) {
        this.cellData = data;
        this.tag = idx;
        this.removeAllChildren(true);

        let colourLayer = new cc.LayerColor(cc.color(ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBoxBackground.color.r,ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBoxBackground.color.g,ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBoxBackground.color.b, ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBoxBackground.color.a), this._contentSize.width - this.cellHorizontalPadding, this._contentSize.height - this.cellVerticalPadding);
        colourLayer.setPosition(cc.p(this.cellHorizontalPadding * 0.5, this.cellVerticalPadding * 0.5));
        parent.addChild(colourLayer, 2);

        var scaleFactorX = colourLayer._contentSize.width / data.size.width;
        var scaleFactorY = colourLayer._contentSize.height / data.size.height;

        let cardElementImage = new cc.Sprite(ACTIVITY_SPINNINGWHEEL_1.ref.spriteBasePath + data.name);
        cardElementImage.setContentSize(cc.size(colourLayer._contentSize.width, colourLayer._contentSize.height));
        cardElementImage.setPosition(this.cellHorizontalPadding * 0.5, this.cellVerticalPadding * 0.5);
        cardElementImage.setAnchorPoint(0, 0);
        // cardElementImage.setScaleX(scaleFactorX);
        // cardElementImage.setScaleY(scaleFactorY);
        parent.addChild(cardElementImage,3);

        let textBaseLayer = new cc.LayerColor(cc.color(ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBoxCardBackground.color.r,ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBoxCardBackground.color.g,ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBoxCardBackground.color.b, ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBoxCardBackground.color.a), this._contentSize.width - this.cellHorizontalPadding, this.cardTextHeight);
        textBaseLayer.setPosition(cc.p(this.cellHorizontalPadding * 0.5, this._contentSize.height - this.cellVerticalPadding - this.cardTextHeight));
        // parent.addChild(textBaseLayer, 4);

        let labelCardText   = cc.LabelTTF.create(data.cardValue,ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBoxCardText.font,ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBoxCardText.fontSize,cc.size(0.,0),cc.TEXT_ALIGNMENT_CENTER);
        labelCardText.setPosition(cc.p(textBaseLayer._contentSize.width * 0.5,textBaseLayer._contentSize.height * 0.5));
        labelCardText.setColor(cc.color(ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBoxCardText.color.r,ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBoxCardText.color.g,ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBoxCardText.color.b,ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBoxCardText.color.a));
        // textBaseLayer.addChild(labelCardText,5);

        this.highlightLayer = new cc.LayerColor(cc.color(ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBoxHighlight.color.r,ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBoxHighlight.color.g,ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBoxHighlight.color.b, ACTIVITY_SPINNINGWHEEL_1.ref.config.graphicalAssets.carouselBoxHighlight.color.a), this._contentSize.width, this._contentSize.height);
        this.highlightLayer.setPosition(cc.p(this.cellHorizontalPadding * 0.5, this.cellVerticalPadding * 0.5));
        parent.addChild(this.highlightLayer, 10);

        if(isSelected) {
            this.highlightLayer.setVisible(true);
        } else {
            this.highlightLayer.setVisible(false);
        }
    },
});


