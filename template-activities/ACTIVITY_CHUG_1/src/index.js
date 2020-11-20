var ACTIVITY_CHUG_1 = {};
ACTIVITY_CHUG_1.Tag = {
    cupsStart           : 100,
    drinkButton         : 110,
    startButton         : 112,
    readyLabel          : 113,
    itemBGStart         : 120,
    maskStartTag        : 130,
    liquid              : 140,
    glowTag             : 150,
    animationTag        : 160,
    baseAnimationTag    : 170,
}
ACTIVITY_CHUG_1.socketEventKey = {
    SHOW_DRINK_ANIMATION : "CHUG101",
    CLEAR                : "CHUG102",
    GAME_STARTS          : "CHUG103",
    ITEM_REVEL           : "CHUG104",
}
ACTIVITY_CHUG_1.cupStatus =  {
    Empty: 0,
    Filled: 1,
}


ACTIVITY_CHUG_1.gameState ={
    Begin      : 0,
    NotStarted : -1,
    HasStarted : 1,
}
ACTIVITY_CHUG_1.ref = null;
ACTIVITY_CHUG_1.ChugLayer = HDBaseLayer.extend({
    isTeacherView: false,
    intractableObject:null,
    isStudentInteractionEnabled : false,
    joinedStudentList :[],
    cupDistribution   : [],
    assignedCups      :[],
    hiddenCups        :[],
    numberOfStudents  : 1,
    gameState         : -1,
    cupItems          : [],
    handIconUI        :[],
    userCurrentCup    : null,
    storedData        : null,
    interactableObject : false,
    ctor: function () {
        this._super();
    },

    onEnter: function () {
        this._super();
       // console.log("onEnter");
        ACTIVITY_CHUG_1.ref = this;
        this.gameState = this.storedData == null ? ACTIVITY_CHUG_1.gameState.NotStarted: this.storedData.gameState;
     //   console.log("game state Updated", this.gameState);
        let activityName = 'ACTIVITY_CHUG_1';
        cc.loader.loadJson("res/Activity/" + activityName + "/config.json", function (error, config) {
            if (!error) {
                ACTIVITY_CHUG_1.config = config;
                ACTIVITY_CHUG_1.resourcePath = "res/Activity/" + "" + activityName + "/res/"
                ACTIVITY_CHUG_1.soundPath = ACTIVITY_CHUG_1.resourcePath + "Sound/";
                ACTIVITY_CHUG_1.animationBasePath = ACTIVITY_CHUG_1.resourcePath + "AnimationFrames/";
                ACTIVITY_CHUG_1.spriteBasePath = ACTIVITY_CHUG_1.resourcePath + "Sprite/";
                ACTIVITY_CHUG_1.ref.isTeacherView = HDAppManager.isTeacherView;
                ACTIVITY_CHUG_1.ref.setupUI();
                if (ACTIVITY_CHUG_1.ref.isTeacherView && !this.storedData) {
                    ACTIVITY_CHUG_1.ref.updateRoomData();
                    ACTIVITY_CHUG_1.ref.isStudentInteractionEnabled = true;
                    ACTIVITY_CHUG_1.ref.joinedStudentList = [...lesson_1.ref.studentList];
                    ACTIVITY_CHUG_1.config.teacherScripts.data.moduleStart.enable && ACTIVITY_CHUG_1.ref.triggerScript(ACTIVITY_CHUG_1.config.teacherScripts.data.moduleStart.content);

                }
            } else {
                console.log("error", error)
            }
        });
    },


    onExit: function () {
        this._super();
      //  console.log(" onExit called ");
        ACTIVITY_CHUG_1.ref.cupItems.length =0;
        ACTIVITY_CHUG_1.ref.assignedCups.length =0;
     //   ACTIVITY_CHUG_1.ref.cupDistribution.length =0;
        ACTIVITY_CHUG_1.ref.hiddenCups.length =0;
        ACTIVITY_CHUG_1.ref.handIconUI.length =0;
        ACTIVITY_CHUG_1.ref.removeAllChildrenWithCleanup(true);
        ACTIVITY_CHUG_1.ref.interactableObject = false;
        ACTIVITY_CHUG_1.ref = null;
    },

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


    setupUI: function () {
        this.setBackground( ACTIVITY_CHUG_1.spriteBasePath + ACTIVITY_CHUG_1.config.background.sections.background.imageName);
        this.setCups();
        this.setDrinkButton();
        if(this.isTeacherView){
            this.addStartButton();
            this.addReadyLabel();
        }

        if(this.storedData){
            this.updateUI();
        }
    },

    setCups : function (){
        let cupsArray =  ACTIVITY_CHUG_1.config.assets.sections.cups.data;
        let counter   = 0;
        for(var item of cupsArray){
            var cupSprite = this.addSprite(ACTIVITY_CHUG_1.animationBasePath + item.emptyCupAnimation.frameInitial + "0001.png", cc.p(item.position), this);
            cupSprite.setScale(0.8);
            cupSprite.setAnchorPoint(0.5,0);
            cupSprite.setTag(ACTIVITY_CHUG_1.Tag.cupsStart +  counter);
            var glowPos = cupSprite.convertToNodeSpace(item.glowPosition);
            var glow =this.addSprite(ACTIVITY_CHUG_1.spriteBasePath + ACTIVITY_CHUG_1.config.assets.sections.glow.imageName, cc.p(glowPos), cupSprite);
            glow.setScale(item.glowScale);
            glow.setLocalZOrder(-3);
            glow.setTag(ACTIVITY_CHUG_1.Tag.glowTag);
            glow.setVisible(false);
            this.setItem(counter, cupSprite);
            var cliper = new cc.ClippingNode();
            cliper.setContentSize(cupSprite.getContentSize());
            var maskPos = cupSprite.convertToNodeSpaceAR(item.maskPosition);
            var mask = new cc.Sprite(ACTIVITY_CHUG_1.spriteBasePath + item.maskImage);
            mask.setPosition(maskPos.x + mask.width * 0.5, maskPos.y);
            mask.setAnchorPoint(0.5,0);
            mask.setScale(item.scale.x,item.scale.y );
            cliper.setStencil(mask);
            cliper.setTag(ACTIVITY_CHUG_1.Tag.maskStartTag);
            cupSprite.addChild(cliper, -1);
            let liquid =this.addSprite(ACTIVITY_CHUG_1.animationBasePath + item.filledCupAnimation.frameInitial + "0001.png", cc.p(maskPos.x + mask.width *0.5, maskPos.y), cliper);
            liquid.setAnchorPoint(0.5,0);
            liquid.setTag(ACTIVITY_CHUG_1.Tag.liquid);

            counter++;
            this.cupItems.push(cupSprite);

        }

    },

    setDrinkButton : function(){
        var button = this.createButton(ACTIVITY_CHUG_1.spriteBasePath  + ACTIVITY_CHUG_1.config.buttons.data.drink.enableState, ACTIVITY_CHUG_1.spriteBasePath  + ACTIVITY_CHUG_1.config.buttons.data.drink.pushedState, null, 0, ACTIVITY_CHUG_1.Tag.drinkButton,ACTIVITY_CHUG_1.config.buttons.data.drink.position, this, this, null );
        button.setScale(0.4);
        button.setTouchEnabled(false);
    },

    setItem : function(index, parent){
        // console.log(parent.getContentSize());
        var item = ACTIVITY_CHUG_1.config.assets.sections.cups.data[index].imageInside;
        var position = parent.convertToNodeSpace(item.BgPosition);
        var baseBg = this.addSprite(ACTIVITY_CHUG_1.spriteBasePath  + ACTIVITY_CHUG_1.config.assets.sections.ItemBg.imageName, position, parent);
        baseBg.setTag(ACTIVITY_CHUG_1.Tag.itemBGStart);
        baseBg.setScale(0.4);
        baseBg.setOpacity(0);
        baseBg.setLocalZOrder(-2);
        var baseAnimation = this.addSprite(ACTIVITY_CHUG_1.spriteBasePath  + ACTIVITY_CHUG_1.config.assets.sections.ItemBg.imageName, position, parent);
        baseAnimation.setTag(ACTIVITY_CHUG_1.Tag.baseAnimationTag);
        baseAnimation.setScale(0);
        baseAnimation.setLocalZOrder(-3);
        var animationBase = this.addSprite("res/LessonResources/emptyImage.png", cc.p(baseBg.width*0.5, baseBg.height*0.5), baseBg);
        animationBase.setTag(ACTIVITY_CHUG_1.Tag.animationTag);
        var sprite = this.addSprite(ACTIVITY_CHUG_1.spriteBasePath  + item.name, cc.p(baseBg.width * 0.5 , baseBg.height * 0.5), baseBg);
    },

    addStartButton : function(){
        var button = this.createButton(ACTIVITY_CHUG_1.spriteBasePath  + ACTIVITY_CHUG_1.config.buttons.data.start.enableState, ACTIVITY_CHUG_1.spriteBasePath  + ACTIVITY_CHUG_1.config.buttons.data.start.pushedState, null, 0, ACTIVITY_CHUG_1.Tag.startButton, ACTIVITY_CHUG_1.config.buttons.data.start.position, this, this, ACTIVITY_CHUG_1.spriteBasePath  + ACTIVITY_CHUG_1.config.buttons.data.start.disableState );
        this.handIconUI.push(button);
        if(this.gameState == ACTIVITY_CHUG_1.gameState.NotStarted){
            button.setTouchEnabled(true);
        }
     },

    addReadyLabel : function(){
        var readyLabel = this.createTTFLabel("3", HDConstants.Sassoon_Medium, 100, HDConstants.White, cc.p(this.width * 0.5, this.height * 0.5), this);
        readyLabel.setTag(ACTIVITY_CHUG_1.Tag.readyLabel);
        readyLabel.enableStroke(cc.color(0, 0, 0, 1), 3.0);
        readyLabel.setVisible(false);
    },

    updateRoomData: function () {
        SocketManager.emitCutomEvent("SingleEvent", {
            'eventType': HDSocketEventType.UPDATE_ROOM_DATA,
            'roomId': HDAppManager.roomId,
            'data': {
                "roomId": HDAppManager.roomId,
                "roomData": {
                    "activity": ACTIVITY_CHUG_1.config.properties.namespace,
                    "data": {
                        "assignedCups" : [...ACTIVITY_CHUG_1.ref.cupDistribution],
                        "gameState" : ACTIVITY_CHUG_1.ref.gameState,
                        "hiddenCups": ACTIVITY_CHUG_1.ref.hiddenCups,
                    },
                    "activityStartTime": HDAppManager.getActivityStartTime()
                }
            }
        }, null)
      //  console.log(" room data",ACTIVITY_CHUG_1.ref.cupDistribution );


    },


    socketListener: function (res) {
        if (!ACTIVITY_CHUG_1.ref)
            return;
        switch (res.eventType) {
            case HDSocketEventType.DISABLE_STUDENT_INTERACTION:
                break;
            case HDSocketEventType.DISABLE_INTERACTION:
                ACTIVITY_CHUG_1.ref.disableInteraction(res.data);
                break;
            case HDSocketEventType.RECEIVE_GRADES:
                break;
            case HDSocketEventType.STUDENT_STATUS:
                ACTIVITY_CHUG_1.ref.studentStatus(res.data);
                break;
            case HDSocketEventType.STUDENT_TURN:
                ACTIVITY_CHUG_1.ref.studentTurn(res.data);
                break;
            case HDSocketEventType.GAME_MESSAGE:
                // console.log(res.data.userName == HDAppManager.username , !ACTIVITY_CHUG_1.ref);
                if (res.data.userName == HDAppManager.username || !ACTIVITY_CHUG_1.ref)
                    return;
                ACTIVITY_CHUG_1.ref.gameEvents(res.data);
                break;
        }
    },

    isTurnSwitchingBlocked: function () {
        console.log(!this.gameState == ACTIVITY_CHUG_1.gameState.Begin);
        return !(this.gameState == ACTIVITY_CHUG_1.gameState.Begin);
    },

    disableInteraction: function (enable) {
        this.isStudentInteractionEnable = enable;
    },

    studentTurn: function (res) {
        let users = res.users;
        if (this.isTeacherView) {

        } else {
            if (users.length == 0) {
                this.isStudentInteractionEnabled = false;
                return;
            }
            for (let index = 0; index < users.length; index++) {
                let obj = users[index];
                if (obj.userName == HDAppManager.username) {
                    this.isStudentInteractionEnabled = true;
                    break;
                } else {
                    this.isStudentInteractionEnabled = false;
                }
            }
        }
    },

    updateStudentTurn: function (userName) {
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
        console.log("student status", data);
        if(!this.isTeacherView){
            return;
        }
        this.updateStudentList(data);

    },

    updateStudentList : function(data){
        console.log("udpate stidet list", this.gameState);
        var teacherId = data.teacherId;
        var user = data.users;
        var students = [];
        for(let item of user){
            if(item.userId != teacherId){
                students.push(item.userName)
            }
        }
        if(this.gameState == ACTIVITY_CHUG_1.gameState.HasStarted)
        {
            if(this.isTeacherView && this.joinedStudentList.length <= students.length){
                console.log("student has joined after leaving", this.joinedStudentList, students);
                this.updateStudentPanel();
            }else{
                console.log("student has left in game");
            }
            return;
        }
        if(this.isTeacherView && this.gameState == ACTIVITY_CHUG_1.gameState.NotStarted){
            this.joinedStudentList = [...students];
        }
    },

    gameEvents: function (res) {
        if (!ACTIVITY_CHUG_1.ref)
            return;
        switch (res.eventType) {
            case ACTIVITY_CHUG_1.socketEventKey.CLEAR:
                if(!this.isTeacherView){
                    this.clearGame();
                }
                break;
            case ACTIVITY_CHUG_1.socketEventKey.GAME_STARTS:
                this.onGameStarted(res.data);
                break;
            case ACTIVITY_CHUG_1.socketEventKey.SHOW_DRINK_ANIMATION:
                this.updateUserDataForSync(res);
                this.drinkReductionAnimation(res.data.cupIndex, res.data.liquidLevel, res.data.canChange);
                break;
            case ACTIVITY_CHUG_1.socketEventKey.ITEM_REVEL:
                this.updateUserDataForSync(res);

                this.showItemVisibleAnimation(res.data.cupIndex, res.data.canChange )

        }
    },

    /**
     * Emit socket event
     * @param eventType
     * @param data
     */
    emitSocketEvent: function (eventType, data) {
        console.log("data in emit socket event", data);
        data.userName = HDAppManager.username;
        let dataObj = {
            "eventType": eventType,
            "data": data,
            "roomId": HDAppManager.roomId,
        }
        SocketManager.emitCutomEvent(HDSingleEventKey, dataObj);
    },

    syncData: function (data) {
        console.log("sync data ", data);
        this.storedData = data;
        if(this.storedData){
            ACTIVITY_CHUG_1.ref.cupDistribution = data.assignedCups;
            ACTIVITY_CHUG_1.ref.hiddenCups = data.hiddenCups;
            ACTIVITY_CHUG_1.ref.gameState = data.gameState;
        }

    },

    buttonCallback: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                switch (sender.getTag()) {
                    case ACTIVITY_CHUG_1.Tag.drinkButton :
                        if(this.isStudentInteractionEnabled){
                            var cup = this.cupItems[this.userCurrentCup.index];
                            var mask = cup.getChildByTag(ACTIVITY_CHUG_1.Tag.maskStartTag).getChildByTag(ACTIVITY_CHUG_1.Tag.liquid);
                            var reduction = ACTIVITY_CHUG_1.config.gameInfo.drinkReductionLevel;
                            console.log("scale mask", mask.getScaleY());
                            var scale = parseFloat(mask.getScaleY().toFixed(2)) - reduction;
                            scale = parseFloat(scale.toFixed(2));
                            console.log("scale", scale);
                            if(scale >= 0.09){
                                this.drinkReductionAnimation(this.userCurrentCup.index, scale, true);
                                this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                                    "eventType": ACTIVITY_CHUG_1.socketEventKey.SHOW_DRINK_ANIMATION,
                                    "data"      : {
                                        "cupIndex" : ACTIVITY_CHUG_1.ref.userCurrentCup.index,
                                        "liquidLevel": scale,
                                        "canChange" : false
                                    }
                                });
                            }else{
                                this.showItemVisibleAnimation(this.userCurrentCup.index, true);
                                this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                                    "eventType": ACTIVITY_CHUG_1.socketEventKey.ITEM_REVEL,
                                    "data"      : {
                                        "cupIndex" : ACTIVITY_CHUG_1.ref.userCurrentCup.index,
                                        "liquidLevel": 0,
                                        "canChange" : false
                                    }
                                });
                            }
                        }

                        break;
                    case ACTIVITY_CHUG_1.Tag.startButton:
                        sender.setTouchEnabled(false);
                        sender.loadTextures(ACTIVITY_CHUG_1.spriteBasePath  + ACTIVITY_CHUG_1.config.buttons.data.start.disableState, ACTIVITY_CHUG_1.spriteBasePath  + ACTIVITY_CHUG_1.config.buttons.data.start.disableState);
                        this.showCountDownAnimation(null, 3);

                        break;

                }


        }
    },



    showCountDownAnimation : function (ref, count) {
        var label = this.getChildByTag(ACTIVITY_CHUG_1.Tag.readyLabel);
        label.setVisible(true);
        var number = label.getString();
        if(count == 0) {
            label.setVisible(false);
            this.enableStudentInteraction();
            this.parent.setResetButtonActive(true);
            return;
        }
        var string = number == 1?   "GO" : count;
        label.setString(string);
        label.runAction( cc.sequence(cc.delayTime(0.5), cc.callFunc(this.showCountDownAnimation, this, number-1)));

    },

    enableStudentInteraction() {
        this.distributeCups();
        this.gameState = ACTIVITY_CHUG_1.gameState.Begin;
        var scrollView = lesson_1.ref.getChildByTag(lesson_1.Tag.studentScrollView);
        let container = scrollView._container;
        console.log(container);
        for (let child of container.getChildren()) {
            console.log("child here", child);
            lesson_1.ref.selectedStudentCallback(child, ccui.Widget.TOUCH_ENDED);
        }
        var data     = {
            "gameState" : ACTIVITY_CHUG_1.gameState.HasStarted,
                "assignedCups" : ACTIVITY_CHUG_1.ref.cupDistribution,
                 "hiddenCups"  : ACTIVITY_CHUG_1.ref.hiddenCups
        }
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            "eventType": ACTIVITY_CHUG_1.socketEventKey.GAME_STARTS,
            "data"     : data,

        });
        this.onGameStarted(data);
        this.updateRoomData();
    },

    distributeCups : function () {
        let totalCups = 8;
        let bottomLine = [{index: 0, liquidLevel:1}, {index: 2, liquidLevel:1},{index: 4, liquidLevel:1},{index: 6, liquidLevel:1}];
        let topLine = [{index: 1, liquidLevel:1}, {index: 3, liquidLevel:1},{index: 5, liquidLevel:1},{index: 7, liquidLevel:1}];
        if(this.joinedStudentList.length == 5 ||  this.joinedStudentList.length ==6){
            totalCups = this.joinedStudentList.length + 1;
            topLine.splice(topLine.length  - 1,1);
            this.hiddenCups.push(7)
            if( this.joinedStudentList.length==5){
                topLine.splice(0, 1);
                this.hiddenCups.push(1);
            }
        }
        let cupsOrder =[];
        cupsOrder.push(...bottomLine);
        cupsOrder.push(...topLine);
        if( this.joinedStudentList.length !=2) {
            cupsOrder.sort((a,b) =>{
                return a.index - b.index;
            });
        }
        let studentCups = Math.floor(totalCups /  this.joinedStudentList.length);
        let teacherCups = totalCups %  this.joinedStudentList.length;
        var totalStudentCups = this.joinedStudentList.length * studentCups;
        var index = 0;
        while(totalStudentCups){
            temp = cupsOrder.splice(0, studentCups);
            var data = {
                assignedTo : this.joinedStudentList[index],
                cupsInfo   : [...temp],
            }
            index++;
            totalStudentCups -= studentCups;
            this.cupDistribution.push(data);
        }
        while(teacherCups--){
            var temp = cupsOrder.splice(0, studentCups);
            console.log("teacher cup", temp);
            var data = {
                assignedTo : HDAppManager.username,
                cupsInfo   : [...temp],
            }
            index++;
            this.cupDistribution.push(data);
        }
     },

    reset : function () {
        this.emitSocketEvent( HDSocketEventType.GAME_MESSAGE, {'eventType': ACTIVITY_CHUG_1.socketEventKey.CLEAR} );
        this.clearGame();
    },

    clearGame : function (){
        ACTIVITY_CHUG_1.ref.cupItems.length =0;
        ACTIVITY_CHUG_1.ref.assignedCups.length =0;
        ACTIVITY_CHUG_1.ref.cupDistribution.length =0;
        ACTIVITY_CHUG_1.ref.hiddenCups.length =0;
        ACTIVITY_CHUG_1.ref.handIconUI.length =0;
        ACTIVITY_CHUG_1.ref.storedData = null;
        ACTIVITY_CHUG_1.ref.gameState = ACTIVITY_CHUG_1.gameState.Begin;
        this.removeAllChildren();
        this.setupUI();
        if(this.isTeacherView){
            var scrollView = lesson_1.ref.getChildByTag(lesson_1.Tag.studentScrollView);
            let container = scrollView._container;
            for (let child of container.getChildren()) {
                child.isActive = true;
                lesson_1.ref.selectedStudentCallback(child, ccui.Widget.TOUCH_ENDED);
            }
            ACTIVITY_CHUG_1.ref.gameState = ACTIVITY_CHUG_1.gameState.NotStarted;
            this.updateRoomData();
        }
    },

    drinkReductionAnimation : function (index, scale, canChange){
        console.log("index",index);
        var cup = this.cupItems[index];
        var mask = cup.getChildByTag(ACTIVITY_CHUG_1.Tag.maskStartTag).getChildByTag(ACTIVITY_CHUG_1.Tag.liquid);
        var cupInfo = ACTIVITY_CHUG_1.config.assets.sections.cups.data;


        var animation = HDUtility.runFrameAnimation(ACTIVITY_CHUG_1.animationBasePath + cupInfo[index].emptyCupAnimation.frameInitial, cupInfo[index].emptyCupAnimation.frameCount, 0.1, ".png", 1);
        var maskAnimation = HDUtility.runFrameAnimation(ACTIVITY_CHUG_1.animationBasePath + cupInfo[index].filledCupAnimation.frameInitial, cupInfo[index].filledCupAnimation.frameCount, 0.1, ".png", 1);
        var changeToOriginalframe = cc.callFunc(function () {
           cup.setTexture(ACTIVITY_CHUG_1.animationBasePath + cupInfo[index].emptyCupAnimation.frameInitial + "0001.png");
        });
        mask.runAction(cc.sequence(cc.spawn(cc.scaleTo(0.2, 1.2, scale),maskAnimation)));
        cup.runAction(cc.sequence(animation, changeToOriginalframe));
    },

    onGameStarted : function (data) {
        ACTIVITY_CHUG_1.ref.gameState = data.gameState;
        ACTIVITY_CHUG_1.ref.assignedCups = data.assignedCups.filter(item => item.assignedTo == HDAppManager.username);
        console.log("assigned cup", ACTIVITY_CHUG_1.ref.assignedCups);
        if(ACTIVITY_CHUG_1.ref.assignedCups.length <=0)
            return;
        if( ACTIVITY_CHUG_1.ref.assignedCups.length > 0){
            this.isStudentInteractionEnabled = true;
            console.log("drink button enabled");
            ACTIVITY_CHUG_1.ref.getChildByTag(ACTIVITY_CHUG_1.Tag.drinkButton).setTouchEnabled(true);
        }
        for(let index in  ACTIVITY_CHUG_1.ref.assignedCups[0].cupsInfo){
            ACTIVITY_CHUG_1.ref.getChildByTag(ACTIVITY_CHUG_1.Tag.cupsStart +  ACTIVITY_CHUG_1.ref.assignedCups[0].cupsInfo[index].index).getChildByTag(ACTIVITY_CHUG_1.Tag.glowTag).setVisible(true);
        }

        if(data.hiddenCups){
            for(let item of data.hiddenCups){
                ACTIVITY_CHUG_1.ref.cupItems[item].setVisible(false);
                ACTIVITY_CHUG_1.ref.cupItems[item].setVisible(false);
            }
        }

        this.moveToNextAssignedCup();

    },

    moveToNextAssignedCup : function () {
        if(this.assignedCups.length > 0){
            var index =0;
            while(index < this.assignedCups[0].cupsInfo.length &&  this.assignedCups[0].cupsInfo[index].liquidLevel <= 0){
                index++
            }
            console.log("assigned cups", index);
            this.userCurrentCup = this.assignedCups[0].cupsInfo.splice(index,1)[0];
            console.log("user current cuo", this.userCurrentCup );
            if(!this.userCurrentCup){
                this.getChildByTag(ACTIVITY_CHUG_1.Tag.drinkButton).setTouchEnabled(false);
            }else{
                this.getChildByTag(ACTIVITY_CHUG_1.Tag.drinkButton).setTouchEnabled(true);
            }
        }

    },

    showItemVisibleAnimation : function (index, canChange){
        if(canChange){
            this.getChildByTag(ACTIVITY_CHUG_1.Tag.drinkButton).setTouchEnabled(false);
        }
        var liquid = this.getChildByTag(index + ACTIVITY_CHUG_1.Tag.cupsStart).getChildByTag(ACTIVITY_CHUG_1.Tag.maskStartTag).getChildByTag(ACTIVITY_CHUG_1.Tag.liquid);
        liquid.setVisible(false);

        var item = this.getChildByTag(index + ACTIVITY_CHUG_1.Tag.cupsStart).getChildByTag(ACTIVITY_CHUG_1.Tag.itemBGStart);
        var bastAnimationImage = this.getChildByTag(index + ACTIVITY_CHUG_1.Tag.cupsStart).getChildByTag(ACTIVITY_CHUG_1.Tag.baseAnimationTag)
        var animationBg = item.getChildByTag(ACTIVITY_CHUG_1.Tag.animationTag);
        var animation = HDUtility.runFrameAnimation(ACTIVITY_CHUG_1.animationBasePath + "cardTakeOut/chug_cardTakeOut_", 15, 0.1, ".png", 1);
        if(canChange){
            animationBg.runAction(cc.sequence(animation, cc.callFunc(ACTIVITY_CHUG_1.ref.moveToNextAssignedCup,this)));
            bastAnimationImage.runAction(cc.scaleTo(0.1,0.4,0.4))
        }else{
            animationBg.runAction(animation);
            bastAnimationImage.runAction(cc.scaleTo(0.1,0.4,0.4))
        }

        if(this.isTeacherView){
            this.checkAllCupsEmptied();
        }
        // check all cups are done


    },

    updateUserDataForSync : function (data) {
        for(let item of this.cupDistribution){
            if(item.assignedTo == data.userName){
                var index = item.cupsInfo.findIndex(value => value.index == data.data.cupIndex );
                if(index !=-1){
                    item.cupsInfo[index].liquidLevel = data.data.liquidLevel;
                    break;
                }
            }
        }
        this.updateRoomData();
    },

    updateUI : function () {
        for(let item of this.storedData.assignedCups){
            if(item.assignedTo == HDAppManager.username){
                this.isStudentInteractionEnabled = true
            }
             for(let data of item.cupsInfo){
                 this.cupItems[data.index].getChildByTag(ACTIVITY_CHUG_1.Tag.maskStartTag).getChildByTag(ACTIVITY_CHUG_1.Tag.liquid).setScaleY(data.liquidLevel);
                 if(data.liquidLevel < 0.1){
                     this.cupItems[data.index].getChildByTag(ACTIVITY_CHUG_1.Tag.baseAnimationTag).setScale(0.4);
                     this.cupItems[data.index].getChildByTag(ACTIVITY_CHUG_1.Tag.maskStartTag).getChildByTag(ACTIVITY_CHUG_1.Tag.liquid).setVisible(false);
                 }
             }
        }

        this.onGameStarted(this.storedData);
        if(this.isTeacherView){
            console.log("inside this update UI", this.gameState );
            if(this.gameState == ACTIVITY_CHUG_1.gameState.HasStarted || this.gameState == ACTIVITY_CHUG_1.gameState.Begin){
                var startButton = this.getChildByTag(ACTIVITY_CHUG_1.Tag.startButton);
                startButton.setTouchEnabled(false);
                startButton.loadTextures(ACTIVITY_CHUG_1.spriteBasePath  + ACTIVITY_CHUG_1.config.buttons.data.start.disableState, ACTIVITY_CHUG_1.config.buttons.data.start.disableState);
                this.parent.setResetButtonActive(true);
            }
        }


    },

    mouseTexture: function () {
        return {'hasCustomTexture': this.customTexture, 'textureUrl': this.MouseTextureUrl};
    },

    mouseControlEnable: function (location) {
        return this.interactableObject;

    },
    updateMouseIcon: function (location) {
        let handICon = false
        for (let obj of ACTIVITY_CHUG_1.ref.handIconUI) {
            if (cc.rectContainsPoint(obj.getBoundingBox(), obj.getParent().convertToNodeSpace(location))) {
                handICon = true;
                break;
            }
        }
        if (handICon) {
            this.interactableObject = true;
            this.customTexture = false;
        }else{
            if (location.y < this.getContentSize().height * 0.9 && this.isStudentInteractionEnabled && this.assignedCups.length > 0) {
                this.changeMouseCursorImage();
                this.customTexture = true;
                this.interactableObject = true;
            } else{
                this.customTexture = false;
                this.interactableObject = false;
            }
        }


    },

    changeMouseCursorImage: function () {
        if (this.isStudentInteractionEnabled) {
            var cursorPath = ACTIVITY_CHUG_1.spriteBasePath;
            this.MouseTextureUrl = cursorPath + ACTIVITY_CHUG_1.config.cursors.data.cursorPointer.imageName;
        } else {
            this.customTexture = false;
            this.MouseTextureUrl = "";
        }
    },

    mouseEventListener: function (event) {
        switch (event._eventType) {
            case cc.EventMouse.DOWN:
                this.updateMouseIcon(event.getLocation());
                break;
            case cc.EventMouse.MOVE:
                this.updateMouseIcon(event.getLocation());
                break;
            case cc.EventMouse.UP:
                this.updateMouseIcon(event.getLocation());
                break;
        }
    },


    updateStudentPanel : function () {
        var scrollView = lesson_1.ref.getChildByTag(lesson_1.Tag.studentScrollView);
        let container = scrollView._container;
        let user =[];
        this.gameState = ACTIVITY_CHUG_1.gameState.Begin;
        for(let item of this.cupDistribution) {
            user.push(item.assignedTo);
        }
        console.log("users", user,  container.getChildren());
        for (let child of container.getChildren()) {
            console.log("child", child);
            if(child.name){
                var string = child.name.getString();

                var index = user.findIndex(value => value == string);
                console.log("index", index, string);
                if(index != -1){
                    console.log("child", child);
                    lesson_1.ref.selectedStudentCallback(child, ccui.Widget.TOUCH_ENDED);
                    break;
                }
            }

        }
        this.gameState = ACTIVITY_CHUG_1.gameState.HasStarted;
    },

    checkAllCupsEmptied : function () {
        var allCupEmpty = true;
        let count =0;
        for(let item of this.cupItems){
            if(item.isVisible()) {
                if (item.getChildByTag(ACTIVITY_CHUG_1.Tag.maskStartTag).getChildByTag(ACTIVITY_CHUG_1.Tag.liquid).isVisible()) {
                    allCupEmpty = false;
                    break;
                }
                count++;
            }

        }

        console.log("count", count);
        if(allCupEmpty){
            ACTIVITY_CHUG_1.config.teacherScripts.data.AllCupsAreEmptied.enable && this.triggerScript(ACTIVITY_CHUG_1.config.teacherScripts.data.AllCupsAreEmptied.content);
        }
    }
});


