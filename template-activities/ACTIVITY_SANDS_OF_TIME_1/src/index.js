var ACTIVITY_SANDS_OF_TIME_1 = {};
ACTIVITY_SANDS_OF_TIME_1.Tag = {
    LeafStartTag : 9992114,
    startButton  : 101,
    stopButton   : 102,
}
ACTIVITY_SANDS_OF_TIME_1.socketEventKey = {
    SingleEvent : "SingleEvent",
    DragRakes: 1,
    RunRakeAnimation: 2,
    StopRakeAction : 3,
    EmitLeaf: 4,
    PopulateLeaf: 5,
    RemoveLeaf : 6,
    ImageCleared : 7,
    STUDENT_INTERACTION: 8,
    WinnerScreen: 9,
    ResetGame : 10,
    PopulateHiddenObject : 11,
    AddHiddenObject : 12,
    UpdateLeafInfo: 13,
    GameState: 14
};

ACTIVITY_SANDS_OF_TIME_1.gameState = {
    NOT_STARTED : 0,
    STARTED     : 1,
    COMPLETED   : 2,
};

ACTIVITY_SANDS_OF_TIME_1.ref = null;
ACTIVITY_SANDS_OF_TIME_1.SOTLayer = HDBaseLayer.extend({
    isTeacherView: false,
    isPreviewMode : false,
    previewingStudentName:"",
    interactableObject:false,
    customTexture:null,
    hiddenObj: [],
    rake :null,
    rakeList : [],
    bagList: [],
    handIconUI: [],
    myRake: null,
    allocatedObject: [],
    bag:null,
    runningActionUsers: [],
    leafList: [],
    syncDataInfo:null,
    syncLeafInfo : [],
    syncHiddenObjInfo : [],
    isGameWin : false,
    windSprite : null,
    emitLeafIntervalId: null,
    winnerScreenBg : null,
    winnerSprite : null,
    spriteEmitRate : 3.5,
    timerLabel  : null,
    gameState   : -1,
    time        : 300,// IN seconds
    gameStartTime : 0,
    leafEmitDetails: [],
    ctor: function () {
        this._super();
    },

    onEnter: function () {
        this._super();
        ACTIVITY_SANDS_OF_TIME_1.ref = this;
        ACTIVITY_SANDS_OF_TIME_1.ref.gameState = ACTIVITY_SANDS_OF_TIME_1.gameState.NOT_STARTED;
        cc.loader.loadJson("res/Activity/ACTIVITY_SANDS_OF_TIME_1/config.json", function (error, config) {
            ACTIVITY_SANDS_OF_TIME_1.config = config;
            ACTIVITY_SANDS_OF_TIME_1.resourcePath = "res/Activity/" + "ACTIVITY_SANDS_OF_TIME_1/res/"
            ACTIVITY_SANDS_OF_TIME_1.soundPath = ACTIVITY_SANDS_OF_TIME_1.resourcePath + "Sound/";
            ACTIVITY_SANDS_OF_TIME_1.animationBasePath = ACTIVITY_SANDS_OF_TIME_1.resourcePath + "AnimationFrames/";
            ACTIVITY_SANDS_OF_TIME_1.spriteBasePath = ACTIVITY_SANDS_OF_TIME_1.resourcePath + "Sprite/";
            ACTIVITY_SANDS_OF_TIME_1.ref.isTeacherView = HDAppManager.isTeacherView;
           ACTIVITY_SANDS_OF_TIME_1.ref.setupUI();
            if (ACTIVITY_SANDS_OF_TIME_1.ref.isTeacherView) {
               ACTIVITY_SANDS_OF_TIME_1.ref.updateRoomData();
                ACTIVITY_SANDS_OF_TIME_1.ref.isStudentInteractionEnable = true;
            }
         //   ACTIVITY_SANDS_OF_TIME_1.ref.triggerTip(config.teacherTips.moduleStart);
        });
    },

    fetchGameData: function () {
        HDNetworkHandler.get(HDAPIKey.GameData, {"roomId": HDAppManager.roomId}, true, (err, res) => {
        });
    },

    onExit: function () {
        this._super();
        clearTimeout( ACTIVITY_SANDS_OF_TIME_1.ref.emitLeafIntervalId);
        ACTIVITY_SANDS_OF_TIME_1.ref.customTexture = false;
        ACTIVITY_SANDS_OF_TIME_1.ref.interactableObject = false;
        ACTIVITY_SANDS_OF_TIME_1.ref.leafList.forEach( x=> x.removeFromParent());
        ACTIVITY_SANDS_OF_TIME_1.ref.leafList.length = 0;
        ACTIVITY_SANDS_OF_TIME_1.ref.syncLeafInfo.length = 0;
        ACTIVITY_SANDS_OF_TIME_1.ref.syncDataInfo = null;
        ACTIVITY_SANDS_OF_TIME_1.ref.handIconUI.length = 0;
       ACTIVITY_SANDS_OF_TIME_1.ref.removeAllChildrenWithCleanup(true);
        ACTIVITY_SANDS_OF_TIME_1.ref.stopAllActions();
        ACTIVITY_SANDS_OF_TIME_1.ref = null;
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

    onStudentPreviewCellClicked: function (studentName, status, containerRef) {
        this.isPreviewMode = status;
        this.previewingStudentName = (!status ? null : studentName);
        this.showPreview(studentName);
    },

    isTurnSwitchingBlocked: function () {
        return !(this.gameState == ACTIVITY_SANDS_OF_TIME_1.gameState.STARTED);
    },


    setupUI: function () {
        this.setBackground( ACTIVITY_SANDS_OF_TIME_1.spriteBasePath + "game_bg.png" );
        this.addRakeAtTeacherSide();
        // this.setHiddenObjects();
        this.setBags();
        if(this.syncDataInfo){
            this.updateUIWithSyncData();
        }
        else if(this.isTeacherView){
            this.setHiddenObjects();
            let randPosX = ACTIVITY_SANDS_OF_TIME_1.ref.getContentSize().width * Math.random();
            let randPosY = (ACTIVITY_SANDS_OF_TIME_1.ref.getContentSize().height - 200) * Math.random() + 100;
            this.populateLeafAtTeacherSide();
            let leafIdx =  Math.ceil(Math.random()*3 + 1);
            // this.emitLeaf(this,{'posX': randPosX,'posY':randPosY, "leafIdx": leafIdx,  "tag": ++ACTIVITY_SANDS_OF_TIME_1.Tag.LeafStartTag});
            this.addButtons();
            this.addTimer();
            // this.generateSequenceToEmitLeaf();
        }

        //Get student list
        SocketManager.emitCutomEvent(ACTIVITY_SANDS_OF_TIME_1.socketEventKey.SingleEvent, {
            eventType: HDSocketEventType.STUDENT_STATUS,
            data: {
                roomId: HDAppManager.roomId,
            },
        });

        // this.updateUIWithSyncData();
        this.runWindAnimation();
    },

    addButtons : function(){
        var start = this.createButton(ACTIVITY_SANDS_OF_TIME_1.spriteBasePath  + ACTIVITY_SANDS_OF_TIME_1.config.buttons.data.start.enableState, ACTIVITY_SANDS_OF_TIME_1.spriteBasePath  + ACTIVITY_SANDS_OF_TIME_1.config.buttons.data.start.pushedState, null, 0, ACTIVITY_SANDS_OF_TIME_1.Tag.startButton, ACTIVITY_SANDS_OF_TIME_1.config.buttons.data.start.position, this, this, null );
        this.handIconUI.push(start);
        var stop = this.createButton(ACTIVITY_SANDS_OF_TIME_1.spriteBasePath  + ACTIVITY_SANDS_OF_TIME_1.config.buttons.data.stop.enableState, ACTIVITY_SANDS_OF_TIME_1.spriteBasePath  + ACTIVITY_SANDS_OF_TIME_1.config.buttons.data.stop.pushedState, null, 0, ACTIVITY_SANDS_OF_TIME_1.Tag.stopButton, ACTIVITY_SANDS_OF_TIME_1.config.buttons.data.stop.position, this, this, null );
        this.handIconUI.push(stop);
        stop.setLocalZOrder(10);
        start.setLocalZOrder(10);
        this.changeButtonStates();
    },

    addTimer : function(){
        this.timerLabel =   this.createTTFLabel("05:00", HDConstants.Sassoon_Medium, 30, HDConstants.White, cc.p(this.width * 0.93, this.height * 0.8), this);
        this.timerLabel.setLocalZOrder(10);
        this.timerLabel.enableStroke(cc.color(0, 0, 0, 255), 3.0);
        this.updateTimerString();

    },

    updateUIWithSyncData : function (){
        if(this.syncDataInfo && this.syncDataInfo.leafInfo && this.syncDataInfo.bagInfo ){
            // this.isGameWin = this.syncDataInfo.isGameWin;
            this.gameState = this.syncDataInfo.gameState;
            this.syncLeaf(this.syncDataInfo.leafInfo);

            for(let obj of this.rakeList){
              //  if(obj.rake.isVisible()){
                    for(let rake of this.syncDataInfo.rakeInfo){
                        //////////console.log("obj.studentName ", obj.studentName, "rake.studentName", rake.studentName,  obj.studentName == rake.studentName);
                        if(obj.studentName == rake.studentName){
                            //////////console.log("rake.pos", rake.pos);
                            obj.rake.setPosition(rake.pos);
                        }
                    }
                //}
            }

            for(let i = 0; i < this.syncDataInfo.bagInfo.length; ++i){
                let bag = this.bagList[i];
                let bagInfoObj = this.syncDataInfo.bagInfo[i];
                bag.stuName.setString(bagInfoObj.stuName);
                bag.object = bagInfoObj.object;
                bag.setVisible(bagInfoObj.stuName);
                if(bagInfoObj.object.length > 0){
                    let obj = this.addSprite(bagInfoObj.object[bagInfoObj.object.length - 1],bag.convertToNodeSpace(cc.p(bag.getPosition().x, bag.getContentSize().height * 0.9)),bag);
                    obj._setLocalZOrder(9);
                    obj.setTag(1);
                    obj.setScale(0.25);
                    bagInfoObj.object.map(itemObj => {
                        if(ACTIVITY_SANDS_OF_TIME_1.ref.hiddenObj.includes(itemObj)){
                            let hiddenItemObj = ACTIVITY_SANDS_OF_TIME_1.ref.hiddenObj.filter(item =>{
                                return item.getTexture().url == itemObj;
                            });
                            let index = ACTIVITY_SANDS_OF_TIME_1.ref.hiddenObj.indexOf(hiddenItemObj[0]);
                            this.syncDataInfo.hiddenObjInfo.splice(index, 1);
                            ACTIVITY_SANDS_OF_TIME_1.ref.hiddenObj[index].removeFromParent();
                            ACTIVITY_SANDS_OF_TIME_1.ref.hiddenObj.splice(index, 1);
                            cc.log("HiddenOBJ:::",this.syncDataInfo.hiddenObjInfo, ACTIVITY_SANDS_OF_TIME_1.ref.hiddenObj);
                        }
                    });
                }
            }

            if(  this.gameState == ACTIVITY_SANDS_OF_TIME_1.gameState.COMPLETED ) {
                let bagInfo = [];
                for (let bag of ACTIVITY_SANDS_OF_TIME_1.ref.bagList) {
                    for (let i of this.syncDataInfo.bagInfo) {
                        if (bag.stuName.getString() == i.stuName && i.stuName != "") {
                            bagInfo.push(
                                {
                                    "stuName": bag.stuName.getString(),
                                    "object": i.object,
                                    "bagImgIdx": bag.bagImgIdx,
                                    "isBagVisible": bag.isVisible()
                                }
                            )
                        }
                    }
                }

                this.winnerScreen(bagInfo);
            }
            this.leafEmitDetails = this.syncDataInfo.leafEmitDetails;
            if(  this.leafEmitDetails &&   this.leafEmitDetails.length > 0){
                this.emitLeaf();
            }

            this.syncHiddenObject(this.syncDataInfo.hiddenObjInfo);
            cc.log("HiddenOBJ:::",this.syncDataInfo.hiddenObjInfo, ACTIVITY_SANDS_OF_TIME_1.ref.hiddenObj);
            // if(this.syncDataInfo.isGameWin){
            //     let bagListInfo = ACTIVITY_SANDS_OF_TIME_1.ref.bagList.map(bag => {return {"stuName" : bag.stuName.getString(), "object" : bag.object, "bagImgIdx" : bag.bagImgIdx, "isBagVisible" : bag.isVisible()}});
            //     this.winnerScreen(bagListInfo);
            // }

            if(this.isTeacherView){
                this.gameState = this.syncDataInfo.gameState;
                console.log("game state", this.syncDataInfo.gameState);
                this.addButtons();
                this.addTimer();
                var date = new Date();
                var currentTime = date.getTime();
                var delay =(currentTime - this.syncDataInfo.gameStartTime) / 1000 ;
                this.time = 300 - delay;
                if(this.time < 0 && this.gameState == ACTIVITY_SANDS_OF_TIME_1.gameState.STARTED){
                  this.resetGame();
                }else if(this.gameState == ACTIVITY_SANDS_OF_TIME_1.gameState.STARTED){
                    this.startTimer();
                }

            }

        }


    },

    updateStudentInteraction: function (username, status) {
        if (this.isTeacherView) {
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                "eventType": ACTIVITY_SANDS_OF_TIME_1.socketEventKey.STUDENT_INTERACTION,
                "data": {"userName": username, "status": status}
            });
        }
    },

    winnerScreen: function (params){
        ACTIVITY_SANDS_OF_TIME_1.ref.gameState = ACTIVITY_SANDS_OF_TIME_1.gameState.COMPLETED;

        if(this.winnerScreenBg || params.length <= 0)
            return;
        let winnerScreen = ACTIVITY_SANDS_OF_TIME_1.config.assets.sections.winnerScreenBackground;
        this.winnerScreenBg = this.createButton(ACTIVITY_SANDS_OF_TIME_1.spriteBasePath + ACTIVITY_SANDS_OF_TIME_1.config.assets.sections.winnerScreenWhiteBg.imageName, null, null, null, 1,cc.p(this.getContentSize().width * 0.5, this.getContentSize().height* 0.5),this,null,null);
        this.winnerScreenBg.setTouchEnabled(true);
        this.winnerScreenBg.setLocalZOrder(19);
        this.winnerScreenBg.setOpacity(130);
        this.winnerSprite = this.addSprite(ACTIVITY_SANDS_OF_TIME_1.spriteBasePath + winnerScreen.imageName, cc.p(this.getContentSize().width * 0.5, this.getContentSize().height* 0.5), this);
        this.winnerSprite.setScale(0.1);
        this.winnerSprite.setLocalZOrder(20);
        this.winnerSprite.runAction(cc.scaleTo(0.1,1,1));
        let scoreLabel = new cc.LabelTTF("Score", HDConstants.Sassoon_Medium, 44, cc.size(0, 0), cc.TEXT_ALIGNMENT_CENTER);
        scoreLabel.setPosition(this.winnerSprite.getContentSize().width * 0.5, this.winnerSprite.getContentSize().height* 0.82);
        scoreLabel.setColor(cc.color(141,101,56,255));
        this.winnerSprite.addChild(scoreLabel,21);
        let initialX=this.getContentSize().width * 0.25;
        let initialY=this.getContentSize().height * 0.25;
        let bagOnWinScreenIdx = 0;
        for (let index = 0; index < params.length; index++) {
                if(params[index].isBagVisible){
                    let position = this.getItemPositionOnWheel(bagOnWinScreenIdx);
                    bagOnWinScreenIdx++;
                    let bagBack = this.addSprite(ACTIVITY_SANDS_OF_TIME_1.spriteBasePath + "student" + params[index].bagImgIdx + "_bag_back.png",
                        cc.p(position.x, position.y), this.winnerSprite);
                    bagBack.setScale(0.7);
                    bagBack.setLocalZOrder(16);

                    let hyphenLabel = new cc.LabelTTF("-", HDConstants.Sassoon_Medium, 44, cc.size(0, 0), cc.TEXT_ALIGNMENT_CENTER);
                    hyphenLabel.setPosition(position.x + (bagBack.getContentSize().width * 0.5), position.y);
                    hyphenLabel.setColor(cc.color(141,101,56,255));
                    hyphenLabel.setLocalZOrder(21);
                    this.winnerSprite.addChild(hyphenLabel,21);

                    let bagFront = this.addSprite(ACTIVITY_SANDS_OF_TIME_1.spriteBasePath + "student" + params[index].bagImgIdx + "_bag_front.png",
                        cc.p(bagBack.getContentSize().width * 0.5, bagBack.getContentSize().height * 0.5), bagBack);
                    bagFront.setScale(1);
                    bagFront.setLocalZOrder(17);
                    let bagLabel = new cc.LabelTTF(params[index].stuName, HDConstants.Sassoon_Regular, 20, cc.size(0, 0), cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
                    bagLabel.setPosition(bagFront.getContentSize().width * 0.35, bagFront.getContentSize().height * 0.06);
                    bagLabel.setColor(cc.color(ACTIVITY_SANDS_OF_TIME_1.config.assets.sections.bagText.color.r, ACTIVITY_SANDS_OF_TIME_1.config.assets.sections.bagText.color.g, ACTIVITY_SANDS_OF_TIME_1.config.assets.sections.bagText.color.b, ACTIVITY_SANDS_OF_TIME_1.config.assets.sections.bagText.color.a));
                    bagFront.addChild(bagLabel, 2);
                    bagBack.setVisible(false);
                    bagFront.setVisible(false);
                    hyphenLabel.setVisible(false);
                    setTimeout((bagBack,bagFront,hyphenLabel)=>{
                        bagBack.setVisible(true);
                        bagFront.setVisible(true);
                        hyphenLabel.setVisible(true);
                        bagBack.runAction(cc.sequence(cc.scaleTo(0.1,0.9,0.9),cc.scaleTo(0.2,0.7,0.7)));
                        bagFront.runAction(cc.sequence(cc.scaleTo(0.1,1.2,1.2),cc.scaleTo(0.2,1,1)));
                    }, (index+1) * 500,bagBack,bagFront,hyphenLabel);

                    if(params[index].object.length <= 2){
                        let intialPosX = position.x + bagBack.getContentSize().width * 1.15;
                        for(let i = 0; i < params[index].object.length; ++i){
                            setTimeout(()=>{
                                let obj = this.addSprite(params[index].object[i],cc.p(intialPosX, position.y), this.winnerSprite);
                                intialPosX += bagBack.getContentSize().width * 0.8;
                                obj.setScale(0.18);
                                obj.setLocalZOrder(17);
                                obj.runAction(cc.sequence(cc.scaleTo(0.1,0.2,0.2),cc.scaleTo(0.2,0.18,0.18)));
                            }, (index+i+1.3) * 500);
                        }
                    }
                    else{
                        let intialPosX = position.x + (bagBack.getContentSize().width * 0.57);
                        let container = new cc.Layer();
                        container.setLocalZOrder(17);
                        container.setContentSize(cc.size((bagBack.getContentSize().width* 0.81) * (params[index].object.length),bagBack.getContentSize().height))
                        let scrollView = this.createScrollView(cc.size((bagBack.getContentSize().width* 0.81) * (params[index].object.length),bagBack.getContentSize().height),container,cc.size(bagBack.getContentSize().width * 1.5,bagBack.getContentSize().height),cc.SCROLLVIEW_DIRECTION_HORIZONTAL,cc.p(intialPosX + 10  ,position.y - (container.getContentSize().height * 0.5)),this.winnerSprite);
                        scrollView.setLocalZOrder(17);
                        scrollView.setTouchEnabled(true);
                        scrollView.setBounceable(false);
                        this.handIconUI.push(scrollView);
                        let posX = 30;
                        let posY = container.getContentSize().height * 0.5;
                        for(let i = 0; i < params[index].object.length; ++i){
                            setTimeout((i)=>{
                                let obj = this.addSprite(params[index].object[i],cc.p(posX, posY), container);
                                posX += bagBack.getContentSize().width * 0.8;
                                obj.setScale(0.18);
                                obj.setLocalZOrder(18);
                                obj.runAction(cc.sequence(cc.scaleTo(0.1,0.2,0.2),cc.scaleTo(0.2,0.18,0.18)));
                            }, (index+i+1.3) * (500 - (i * 40)),i);
                        }
                    }
                }
        }
        if(ACTIVITY_SANDS_OF_TIME_1.ref.isTeacherView){
            ACTIVITY_SANDS_OF_TIME_1.ref.updateRoomData();
        }

    },

    getItemPositionOnWheel: function (currentIndex) {
        var arrayXFactor = [];
        var arrayYFactor = [];
        arrayXFactor = [120, 120, 120, 120, 370, 370, 370, 370];
        arrayYFactor = [300, 230, 160, 90, 300, 230, 160, 90];
        return cc.p(arrayXFactor[currentIndex], arrayYFactor[currentIndex]);
    },

    setHiddenObjects : function (){
        this.hiddenObj.forEach(obj => obj.removeFromParent());
        this.hiddenObj.length = 0;
        this.syncHiddenObjInfo.length = 0;
        cc.log("HiddenObj",this.hiddenObj);
        let objInfo = ACTIVITY_SANDS_OF_TIME_1.config.assets.sections.arrayOfAssets.data;
        let objPosInfo = objInfo.map(obj =>{
           return obj.position;
        });
        for(let obj of objInfo){
            let randNum = Math.floor(Math.random() * objPosInfo.length);
            let randomPos = objPosInfo.splice(randNum,1)[0];
            // let sp = this.addSprite(ACTIVITY_SANDS_OF_TIME_1.spriteBasePath + obj.image,
            //     cc.p(obj.position.x, obj.position.y), this);
            let sp = this.addSprite(ACTIVITY_SANDS_OF_TIME_1.spriteBasePath + obj.imageName,
                cc.p(randomPos.x, randomPos.y), this);
            sp.setScale(0.5);
            sp.setLocalZOrder(5);
            this.syncHiddenObjInfo.push({"image" : obj.imageName, "position" : randomPos});
            this.updateRoomData();
            this.hiddenObj.push(sp);
        }
        ACTIVITY_SANDS_OF_TIME_1.ref.emitSocketEvent( HDSocketEventType.GAME_MESSAGE, {'eventType': ACTIVITY_SANDS_OF_TIME_1.socketEventKey.PopulateHiddenObject, 'data' : ACTIVITY_SANDS_OF_TIME_1.ref.syncHiddenObjInfo} );
        cc.log("HiddenObj",this.hiddenObj);

    },

    setBags : function (){
        this.bagList = [];
        let objInfo = ACTIVITY_SANDS_OF_TIME_1.config.assets.sections.arrayOfStudentsBag.data;
        let initialX = this.getContentSize().width *  0.22;
        let initialY = this.getContentSize().height * 0.08;
        let count = 0;
        for(let obj of objInfo){
            let bagBack = this.addSprite(ACTIVITY_SANDS_OF_TIME_1.spriteBasePath + obj.image_2,
                cc.p(initialX, initialY), this  );
            bagBack.setScale(1);
            bagBack.setLocalZOrder(8);
            bagBack.setVisible(false);
            let bagFront = this.addSprite(ACTIVITY_SANDS_OF_TIME_1.spriteBasePath + obj.image_1,
                cc.p(bagBack.getContentSize().width * 0.5, bagBack.getContentSize().height * 0.5), bagBack  );
            bagFront.setScale(1);
            bagFront.setLocalZOrder(10);
            bagFront.setVisible(true);
            let bagLabel = new cc.LabelTTF("", HDConstants.Sassoon_Regular, 10, cc.size(0, 0), cc.TEXT_ALIGNMENT_CENTER);
            bagLabel.setPosition(bagFront.getContentSize().width * 0.35, bagFront.getContentSize().height * 0.06);
            bagLabel.setColor(cc.color(0,0,0,255));
            bagLabel.setLocalZOrder(11);
            bagLabel.setVisible(true);
            bagFront.addChild(bagLabel, 11);
            initialX += bagBack.getContentSize().width;
            bagBack.stuName  = bagLabel;
            bagBack.object = [];
            bagBack.bagImgIdx = ++count;
            this.bagList.push(bagBack);
        }
    },

    populateLeafAtTeacherSide : function (){
        let initialX = 0;
        let initialY = 0;
        let rotation = 0;
        this.leafList.forEach(x=>x.removeFromParent());
        this.syncLeafInfo.length = 0;
        while( initialX < this.getContentSize().width && initialY < this.getContentSize().height * 0.8){
            let idx = Math.ceil(Math.random()*3 + 1);
            let sp = this.addSprite(ACTIVITY_SANDS_OF_TIME_1.spriteBasePath + "leaf_000"+ idx+ ".png",
                cc.p(initialX, initialY), this);
            rotation = Math.random() * 360;
            sp.setRotation(rotation );
            sp.setTag(++ACTIVITY_SANDS_OF_TIME_1.Tag.LeafStartTag);
            sp.setLocalZOrder(6);
            this.leafList.push(sp);
            let x  = initialX;
            let y  = initialY;
            let r  = rotation;
            let info = {
                "posX": x,
                "posY": y,
                "rotation": r,
                "leafIndex":idx,
                "tag": ACTIVITY_SANDS_OF_TIME_1.Tag.LeafStartTag
            }
            this.syncLeafInfo.push(info);
            this.updateRoomData();
            initialX += sp.getContentSize().width * 0.5;
            if(initialX > this.getContentSize().width){
                initialX = 0;
                initialY = initialY + sp.getContentSize().height * 0.5;
            }
        }
        //////////console.log("===============emmited lead for student ================");
        ACTIVITY_SANDS_OF_TIME_1.ref.emitSocketEvent( HDSocketEventType.GAME_MESSAGE, {'eventType': ACTIVITY_SANDS_OF_TIME_1.socketEventKey.PopulateLeaf, 'data' : ACTIVITY_SANDS_OF_TIME_1.ref.syncLeafInfo} );

    },

    syncLeaf : function ( leafInfo){
        let index = 0;
        while(index < leafInfo.length){
            // cc.log("SyncLeaf called");
            let infoObj = leafInfo[index];
            let sp = this.addSprite(ACTIVITY_SANDS_OF_TIME_1.spriteBasePath + "leaf_000"+ infoObj.leafIndex+ ".png",
                cc.p(infoObj.posX, infoObj.posY), this);
            sp.setRotation(infoObj.rotation );
            sp.setTag(infoObj.tag);
            sp.setLocalZOrder(6);
            this.leafList[index] = sp;
           ++index
        }
    },

    syncHiddenObject : function(hiddenObjInfo){
        this.hiddenObj.forEach(obj => obj.removeFromParent());
        this.hiddenObj.length = 0;
        let index = 0;
        while(index < hiddenObjInfo.length){
            let infoObj = hiddenObjInfo[index];
            let sp = this.addSprite(ACTIVITY_SANDS_OF_TIME_1.spriteBasePath + infoObj.image, cc.p(infoObj.position.x, infoObj.position.y), this);
            sp.setScale(0.5);
            sp.setLocalZOrder(5);
            this.hiddenObj.push(sp);
            this.hiddenObj[index] = sp;
            ++index
        }
    },

    emitLeaf:  function (){
        if(  ACTIVITY_SANDS_OF_TIME_1.ref.gameState == ACTIVITY_SANDS_OF_TIME_1.gameState.STARTED &&
            ACTIVITY_SANDS_OF_TIME_1.ref.leafEmitDetails &&
            ACTIVITY_SANDS_OF_TIME_1.ref.leafEmitDetails.length > 0) {
            let obj = ACTIVITY_SANDS_OF_TIME_1.ref.leafEmitDetails.shift();
            if (obj) {
                ACTIVITY_SANDS_OF_TIME_1.ref.runAction(  cc.sequence( cc.delayTime(obj.delay),
                    cc.callFunc( (parent, obj)=>{
                        while (obj.leafInfo.length > 0) {

                            let params  = obj.leafInfo.shift();
                            let sp = ACTIVITY_SANDS_OF_TIME_1.ref.addSprite(ACTIVITY_SANDS_OF_TIME_1.spriteBasePath + "leaf_000" + params.i + ".png",
                                cc.p(ACTIVITY_SANDS_OF_TIME_1.ref.getContentSize().width, params.y), ACTIVITY_SANDS_OF_TIME_1.ref);
                            sp.runAction(cc.moveTo(0.5, cc.p(params.x, sp.getPositionY())));
                            sp.setLocalZOrder(7);
                            sp.setTag(params.t);
                            ACTIVITY_SANDS_OF_TIME_1.ref.leafList.push(sp);
                            if (ACTIVITY_SANDS_OF_TIME_1.ref.isTeacherView) {
                                let info = {
                                    "posX": params.x,
                                    "posY": params.y,
                                    "rotation": 0,
                                    "leafIndex":params.i,
                                    "tag": params.t
                                }
                                ACTIVITY_SANDS_OF_TIME_1.ref.syncLeafInfo.push(info);
                            }
                        }
                        if(ACTIVITY_SANDS_OF_TIME_1.ref.isTeacherView){
                            ACTIVITY_SANDS_OF_TIME_1.ref.updateRoomData();
                        }
                        ACTIVITY_SANDS_OF_TIME_1.ref.emitLeaf();
                }, ACTIVITY_SANDS_OF_TIME_1.ref, obj  ) ));

            }
        }else if(ACTIVITY_SANDS_OF_TIME_1.ref.isTeacherView && ACTIVITY_SANDS_OF_TIME_1.ref.gameState == ACTIVITY_SANDS_OF_TIME_1.gameState.STARTED){
            ACTIVITY_SANDS_OF_TIME_1.ref.generateSequenceToEmitLeaf();
        }
    },
    toggleMouse : function (){
        console.log("toggle mouse called");
        var scrollView = lesson_1.ref.getChildByTag(lesson_1.Tag.studentScrollView);
        let container = scrollView._container;
        console.log(container);
        for (let child of container.getChildren()) {
            console.log("child here", child);
            lesson_1.ref.selectedStudentCallback(child, ccui.Widget.TOUCH_ENDED);
        }
    },

    generateSequenceToEmitLeaf : function (){
     this.leafEmitDetails = [];
      let second = 0;
      let maxElement = 8;
      let minElement = 2;
      let minTime = 1;
      let maxTime = 3;
      while(second < 60){
          var elementLength = Math.floor(Math.random() * ( maxElement  - minElement)  + minElement);
          var delay = Math.floor(Math.random() * (maxTime  - minTime) + minTime);
          let leafInfo  = [];
          for(let i = 0; i < elementLength; ++i){
            var obj =   {
                  "x" : Math.random() * (ACTIVITY_SANDS_OF_TIME_1.ref.getContentSize().width - 200) + 100,
                  "y" : (ACTIVITY_SANDS_OF_TIME_1.ref.getContentSize().height - 200) * Math.random() + 100,
                  "i":  Math.floor(Math.random()*3 + 1),
                  "t": ++ACTIVITY_SANDS_OF_TIME_1.Tag.LeafStartTag
              }
              leafInfo.push(obj);
          }
          this.leafEmitDetails.push({'delay': delay, 'leafInfo': leafInfo});
          second += delay;
      }
        console.log("list", this.leafEmitDetails);
        ACTIVITY_SANDS_OF_TIME_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {'eventType': ACTIVITY_SANDS_OF_TIME_1.socketEventKey.UpdateLeafInfo, 'data':  ACTIVITY_SANDS_OF_TIME_1.ref.leafEmitDetails} );
        setTimeout(ACTIVITY_SANDS_OF_TIME_1.ref.emitLeaf, 1500);
    },

    runRakeAnimation : function (userName){
        let rake = this.getChildByName(userName);
        let index = this.rakeList.map(x=>x.studentName).indexOf(userName);
        if(rake){
            let animation = HDUtility.runFrameAnimation( ACTIVITY_SANDS_OF_TIME_1.animationBasePath + "student"+(index +1) +"_rake/student"+(index +1) +"_rake_", 9, 0.08, ".png", 1000 );
            rake.runAction(animation);
        }
        this.runningActionUsers.push(userName);
    },

    removeElement : function (userName){
        if(ACTIVITY_SANDS_OF_TIME_1.ref.runningActionUsers.includes(userName)){
            let rake = ACTIVITY_SANDS_OF_TIME_1.ref.getChildByName(userName);
            if(rake){
               for(let obj of ACTIVITY_SANDS_OF_TIME_1.ref.leafList){
                   if( cc.rectContainsPoint( obj.getBoundingBox(), cc.p(rake.getPositionX() - rake.getContentSize().width * 0.4 * rake.getScale(), rake.getPositionY() - rake.getContentSize().height * 0.5  * rake.getScale()) )){
                       let leafIndex = ACTIVITY_SANDS_OF_TIME_1.ref.leafList.indexOf(obj);
                       ACTIVITY_SANDS_OF_TIME_1.ref.removeLeaf(obj.getTag(), userName);
                       ACTIVITY_SANDS_OF_TIME_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {'eventType': ACTIVITY_SANDS_OF_TIME_1.socketEventKey.RemoveLeaf, 'data': {'tag': obj.getTag() } } );
                   }
               }
              ACTIVITY_SANDS_OF_TIME_1.ref.checkIfImageCleared(userName);
               setTimeout( ACTIVITY_SANDS_OF_TIME_1.ref.removeElement, 500, userName );
            }
        }
    },

    removeLeaf : function(tag, userName) {
        let obj = this.getChildByTag(tag);
        // let rake = this.getChildByName(userName);
        if (obj ){
            let index = ACTIVITY_SANDS_OF_TIME_1.ref.leafList.indexOf(obj);
            // obj.removeFromParent();
            // rake.addChild(obj, 5);
            // obj.setPosition(cc.p(0, 0));
            // obj.runAction( cc.sequence( cc.delayTime(2), cc.callFunc( (parents, data)=>{
            //     let position = ACTIVITY_SANDS_OF_TIME_1.ref.convertToNodeSpace(data.obj.getPosition());
            //     data.obj.removeFromParent();
            //     ACTIVITY_SANDS_OF_TIME_1.ref.addChild(data.obj, 5);
            //     data.obj.setPosition(position);
            //
            // }, ACTIVITY_SANDS_OF_TIME_1.ref, {'obj': obj} ) ) )
            // obj.runAction(cc.sequence(cc.moveTo(0.15, cc.p(obj.getPositionX() + ((Math.random() - 0.5) * 100), obj.getPositionY() + ((Math.random() - 0.5) * 100))), cc.removeSelf()));
           // obj.runAction(cc.sequence(cc.moveTo(0.15, cc.p(obj.getPositionX() + ((Math.random() - 0.5) * 100), obj.getPositionY() + ((Math.random() - 0.5) * 100))), cc.removeSelf()));
            obj.runAction(
                cc.sequence(
                    cc.moveTo(0.15,
                        cc.p(obj.getPositionX() + (Math.random() * 15) + 25, obj.getPositionY() + (Math.random() * 15) + 25))));
            // ACTIVITY_SANDS_OF_TIME_1.ref.leafList.splice(index, 1);
            // ACTIVITY_SANDS_OF_TIME_1.ref.syncLeafInfo.splice(index, 1);
            if(ACTIVITY_SANDS_OF_TIME_1.ref.isTeacherView){
                this.parent.setResetButtonActive(true);
                ACTIVITY_SANDS_OF_TIME_1.ref.updateRoomData();
            }
        }
    },

    checkIfImageCleared : function (userName){
        for(let obj of this.hiddenObj){
            let cleared = true;
            for(let leaf of this.leafList){
               if(cc.rectContainsRect(obj.getBoundingBox(), leaf.getBoundingBox()  )){
                   cleared = false;
               }
            }
            if(cleared){
                let objIndex = this.hiddenObj.indexOf(obj);
                ACTIVITY_SANDS_OF_TIME_1.ref.imageCleared(objIndex,userName);
                ACTIVITY_SANDS_OF_TIME_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {'eventType': ACTIVITY_SANDS_OF_TIME_1.socketEventKey.ImageCleared, 'data': {'objIndex': objIndex, 'userName': userName } } );
            }
        }
    },

    imageCleared : function(objIndex, userName){
        let obj = this.hiddenObj[objIndex];
        let bag = this.bagList.filter(x => x.stuName.getString() == userName)[0];
        if (bag && obj) {
            this.runSprinkleAnimation(obj.getPosition());
            bag.object.push(obj.getTexture().url);
            obj.setLocalZOrder(7);
            obj.runAction(cc.sequence(cc.scaleTo(0.25, 0.25, 0.3), cc.scaleTo(0.25, 0.5, 0.5), cc.delayTime(1),
                cc.spawn(
                    cc.moveTo(1,
                        cc.p(bag.getPosition().x, bag.getContentSize().height )), cc.scaleTo(1, 0.25, 0.25)),cc.callFunc(()=>{
                 obj.removeFromParent();
                 if(bag.childrenCount == 2){
                  bag.getChildByTag(1).setTexture(obj.getTexture().url);
                 }
                 else{
                    obj.setPosition(bag.convertToNodeSpace(cc.p(bag.getPosition().x + (10 * bag.getChildrenCount() - 2) , bag.getContentSize().height + (10 * bag.getChildrenCount() - 2))));
                    bag.addChild(obj, 9, 1);
                 }
            })));
            let index = this.hiddenObj.indexOf(obj);
            this.syncHiddenObjInfo.splice(index, 1);
            this.hiddenObj.splice(index, 1);
            setTimeout(() => {
                bag.runAction(cc.sequence(cc.scaleTo(0.25, 0.8, 0.8), cc.scaleTo(0.25, 1, 1)));
                ACTIVITY_SANDS_OF_TIME_1.ref.runBagStarAnimation(bag.getPosition());
                if(ACTIVITY_SANDS_OF_TIME_1.ref.isTeacherView){
                    if(ACTIVITY_SANDS_OF_TIME_1.ref.checkIfGameWin()){
                        ACTIVITY_SANDS_OF_TIME_1.ref.gameState = ACTIVITY_SANDS_OF_TIME_1.gameState.COMPLETED;
                        this.showWinnerScreenToAll();
                    }
                    ACTIVITY_SANDS_OF_TIME_1.ref.updateRoomData();
                }
            }, 2500, bag);
        }
        if(this.isTeacherView &&   ACTIVITY_SANDS_OF_TIME_1.ref.gameState == ACTIVITY_SANDS_OF_TIME_1.gameState.STARTED){
            this.addNewObject();
        }
    },

    addNewObject : function ( ){
        let objInfo = ACTIVITY_SANDS_OF_TIME_1.config.assets.sections.arrayOfAssets.data;
        let randObj = Math.ceil( Math.random() * (objInfo.length - 1) );
        let obj = objInfo[randObj];
        let randPos = cc.p(0, 0 );
        let count = 0;
        do {
            randPos = cc.p((this.getContentSize().width - 200) * Math.random() + 100,
                (this.getContentSize().height - 250) * Math.random() + 100 )
            let overlapped = false;
             for( let hiddenObj of this.hiddenObj){
                if(cc.rectContainsPoint(hiddenObj.getBoundingBox(), randPos)){
                    overlapped = true;
                    break;
                }
            }
             if(!overlapped) {
                 for (let obj of this.leafList) {
                     if (Math.abs(obj.getPositionX() - randPos.x) < 20) {
                         ++count;
                     }
                 }
             }
        } while (count < 10)
        ACTIVITY_SANDS_OF_TIME_1.ref.addObj({'image':obj.imageName, 'position':randPos });
        ACTIVITY_SANDS_OF_TIME_1.ref.emitSocketEvent( HDSocketEventType.GAME_MESSAGE, {'eventType': ACTIVITY_SANDS_OF_TIME_1.socketEventKey.AddHiddenObject, 'data' :{"image" : obj.imageName, "position" : randPos}} );

    },

    addObj : function (params){
        console.log("Add object called ");
        let sp  = this.addSprite(ACTIVITY_SANDS_OF_TIME_1.spriteBasePath + params.image,
            cc.p(params.position.x, params.position.y), this);
        sp.setScale(0.5);
        sp.setLocalZOrder(5);
        this.syncHiddenObjInfo.push({"image" : params.image, "position" : params.position});
        if(this.isTeacherView) {
            this.updateRoomData();
        }
        this.hiddenObj.push(sp);
    },

    checkIfGameWin : function(){
        // let isGameWin = false;
        // if(this.hiddenObj.length == 0){
        //     isGameWin = true;
        // }
        // return isGameWin;
        return   ACTIVITY_SANDS_OF_TIME_1.ref.gameState == ACTIVITY_SANDS_OF_TIME_1.gameState.COMPLETED;
    },

    reset : function (){
        this.resetGame();
        // this.isGameWin = false;
        this.parent.setResetButtonActive(false);
    },

    resetGame : function(){
        console.log("reset game");
        if(this.winnerScreenBg && this.winnerSprite){
            this.winnerScreenBg.removeFromParent();
            this.winnerSprite.removeFromParent();
            this.winnerScreenBg = null;
            this.winnerSprite = null;
        }
        ACTIVITY_SANDS_OF_TIME_1.ref.gameState = ACTIVITY_SANDS_OF_TIME_1.gameState.NOT_STARTED;
        this.bagList = this.bagList.map(bag => {
            while(bag.getChildrenCount() > 1){
                let child = bag.getChildByTag(1);
                if(child){
                    child.removeFromParent();
                }
            }
            bag.object = [];
            return bag;
        });
        this.leafList.forEach(leaf => leaf.removeFromParent());
        this.leafList.length = 0;
        this.syncLeafInfo.length = 0;
        this.hiddenObj.forEach(obj => obj.removeFromParent());
        this.hiddenObj.length = 0;
        this.syncHiddenObjInfo.length = 0;
        this.time = 300;
        this.gameState = ACTIVITY_SANDS_OF_TIME_1.gameState.NOT_STARTED;
        if(this.isTeacherView){
            this.unschedule(this.updateTimer);
            ACTIVITY_SANDS_OF_TIME_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {'eventType': ACTIVITY_SANDS_OF_TIME_1.socketEventKey.ResetGame, 'data': {} } );
            this.setHiddenObjects();
            let randPosX = ACTIVITY_SANDS_OF_TIME_1.ref.getContentSize().width * Math.random();
            let randPosY = (ACTIVITY_SANDS_OF_TIME_1.ref.getContentSize().height - 200) * Math.random() + 100;
            this.populateLeafAtTeacherSide();
            let leafIdx =  Math.ceil(Math.random()*3 + 1);
           // this.emitLeaf(this, {"posX": randPosX  , "posY": randPosY , "leafIdx": leafIdx, "tag": ++ACTIVITY_SANDS_OF_TIME_1.Tag.LeafStartTag} );
            this.hiddenObj.forEach(obj => obj.removeFromParent());
            this.hiddenObj.length = 0;
            this.setHiddenObjects();
            this.changeButtonStates();
            this.updateTimerString();
            this.generateSequenceToEmitLeaf();
            this.toggleMouse();
        }
    },

    runWindAnimation : function (){
        if(  ACTIVITY_SANDS_OF_TIME_1.ref.gameState == ACTIVITY_SANDS_OF_TIME_1.gameState.STARTED) {
            let sprite = ACTIVITY_SANDS_OF_TIME_1.ref.addSprite(ACTIVITY_SANDS_OF_TIME_1.animationBasePath + "wind_anim/wind_anim_0001.png",
                cc.p((ACTIVITY_SANDS_OF_TIME_1.ref.getContentSize().width * 0.9 * Math.random()), ACTIVITY_SANDS_OF_TIME_1.ref.getContentSize().height * 0.9 * Math.random()), ACTIVITY_SANDS_OF_TIME_1.ref);
            sprite.setLocalZOrder(15);
            sprite.runAction(cc.sequence(HDUtility.runFrameAnimation(ACTIVITY_SANDS_OF_TIME_1.animationBasePath + "wind_anim/wind_anim_", 12, 0.08, ".png", 1), cc.removeSelf()));
        }
      ACTIVITY_SANDS_OF_TIME_1.ref.runAction( cc.sequence(   cc.delayTime( Math.random() * 2 + 1) ,cc.callFunc(ACTIVITY_SANDS_OF_TIME_1.ref.runWindAnimation, ACTIVITY_SANDS_OF_TIME_1.ref) ));
    },

    runSprinkleAnimation : function (pos){
        let sprite =  this.addSprite(  ACTIVITY_SANDS_OF_TIME_1.animationBasePath  + "item_stars/item_stars_0001.png",
            pos, this);
        sprite.setLocalZOrder(15);
        sprite.runAction(  cc.sequence( HDUtility.runFrameAnimation( ACTIVITY_SANDS_OF_TIME_1.animationBasePath  + "item_stars/item_stars_", 11, 0.08, ".png", 1),   cc.removeSelf(),  ));
    },

    runBagStarAnimation : function (pos){
        let sprite =  this.addSprite(  ACTIVITY_SANDS_OF_TIME_1.animationBasePath  + "bag_stars/bag_stars_0001.png",
            pos, this);
        sprite.setLocalZOrder(15);
        sprite.runAction(  cc.sequence( HDUtility.runFrameAnimation( ACTIVITY_SANDS_OF_TIME_1.animationBasePath  + "bag_stars/bag_stars_", 11, 0.08, ".png", 1),   cc.removeSelf(),  ));
    },

    stopRakeAnimation : function (userName){
        let rake = this.getChildByName(userName);
        let index = this.rakeList.map(x=>x.studentName).indexOf(userName);
        if(rake){
            rake.stopAllActions();
        }
        this.runningActionUsers.splice( this.runningActionUsers.indexOf(userName), 1);
    },

    addRakeAtTeacherSide : function (){
        this.rakeList = [];
        for(let i = 1; i <= 8; ++i)
        {
            let rake = this.addSprite(ACTIVITY_SANDS_OF_TIME_1.animationBasePath + "student" +i+"_rake/student" + i +"_rake_0001.png",
                cc.p(this.getContentSize().width * 0.1 + 90*i, this.getContentSize().height * 0.7), this);
            rake.setLocalZOrder( 17 );
            rake.setVisible(false);
            this.rakeList.push({"studentName": "", "rake": rake});
        }
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
        let bagInfo = ACTIVITY_SANDS_OF_TIME_1.ref.bagList.map(bag => {return {"stuName" : bag.stuName.getString(), "object" : bag.object}});
        let rakeInfo = ACTIVITY_SANDS_OF_TIME_1.ref.rakeList.map(rake => {return {"studentName" : rake.studentName, "pos" : rake.rake.getPosition()}});
        ////////////console.log("rakeInfo", rakeInfo);
        SocketManager.emitCutomEvent("SingleEvent", {
            'eventType': HDSocketEventType.UPDATE_ROOM_DATA,
            'roomId': HDAppManager.roomId,
            'data': {
                "roomId": HDAppManager.roomId,
                "roomData": {
                    "activity": ACTIVITY_SANDS_OF_TIME_1.config.properties.namespace,
                    "data": {"leafInfo" : ACTIVITY_SANDS_OF_TIME_1.ref.syncLeafInfo, "bagInfo": bagInfo, "rakeInfo": rakeInfo,
                        "hiddenObjInfo": ACTIVITY_SANDS_OF_TIME_1.ref.syncHiddenObjInfo,
                        "gameState": ACTIVITY_SANDS_OF_TIME_1.ref.gameState,
                        "gameStartTime" : ACTIVITY_SANDS_OF_TIME_1.ref.gameStartTime,
                        "leafEmitDetails": ACTIVITY_SANDS_OF_TIME_1.ref.leafEmitDetails
                    },
                    "activityStartTime": HDAppManager.getActivityStartTime()
                }
            }
        }, null);
    },

    onUpdateStudentInteraction: function (params) {
        if (params.userName == HDAppManager.username) {
            ACTIVITY_SANDS_OF_TIME_1.ref.isStudentInteractionEnable = params.status;
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
        if (!ACTIVITY_SANDS_OF_TIME_1.ref.isStudentInteractionEnable || ACTIVITY_SANDS_OF_TIME_1.ref.gameState == ACTIVITY_SANDS_OF_TIME_1.gameState.NOT_STARTED ||ACTIVITY_SANDS_OF_TIME_1.ref.gameState == ACTIVITY_SANDS_OF_TIME_1.gameState.COMPLETED) {
            return;
        }
        ACTIVITY_SANDS_OF_TIME_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE,
            {'eventType': ACTIVITY_SANDS_OF_TIME_1.socketEventKey.RunRakeAnimation, 'data': {'userName': HDAppManager.username } }  );
        ACTIVITY_SANDS_OF_TIME_1.ref.runRakeAnimation( HDAppManager.username);
        if(HDAppManager.username){
            ACTIVITY_SANDS_OF_TIME_1.ref.removeElement(HDAppManager.username);
        }

    },

    onMouseUp: function (event) {
        if (!ACTIVITY_SANDS_OF_TIME_1.ref.isStudentInteractionEnable) {
            return;
        }
        ACTIVITY_SANDS_OF_TIME_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE,
            {'eventType': ACTIVITY_SANDS_OF_TIME_1.socketEventKey.StopRakeAction, 'data': {'userName': HDAppManager.username } }  );
        ACTIVITY_SANDS_OF_TIME_1.ref.stopRakeAnimation( HDAppManager.username);
    },

    onMouseMove: function (event) {
        ACTIVITY_SANDS_OF_TIME_1.ref.updateMouseIcon(event.getLocation());
        if (!ACTIVITY_SANDS_OF_TIME_1.ref.isStudentInteractionEnable ||  ACTIVITY_SANDS_OF_TIME_1.ref.gameState == ACTIVITY_SANDS_OF_TIME_1.gameState.NOT_STARTED|| ACTIVITY_SANDS_OF_TIME_1.ref.gameState == ACTIVITY_SANDS_OF_TIME_1.gameState.COMPLETED) {
            return;
        }
        ACTIVITY_SANDS_OF_TIME_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE,
            {'eventType': ACTIVITY_SANDS_OF_TIME_1.socketEventKey.DragRakes, 'data': {'pos':ACTIVITY_SANDS_OF_TIME_1.ref.convertToNodeSpace(event.getLocation() ), 'userName': HDAppManager.username } }  );
        ACTIVITY_SANDS_OF_TIME_1.ref.moveRake(ACTIVITY_SANDS_OF_TIME_1.ref.convertToNodeSpace(event.getLocation() ), HDAppManager.username);

    },

    moveRake : function (pos, userName){

      let rake = this.getChildByName(userName);
      if(rake){
          rake.setPosition(pos);
      }
    },

    socketListener: function (res) {
        if (!ACTIVITY_SANDS_OF_TIME_1.ref)
            return;
        switch (res.eventType) {
            case HDSocketEventType.DISABLE_STUDENT_INTERACTION:
                break;
            case HDSocketEventType.DISABLE_INTERACTION:
                ACTIVITY_SANDS_OF_TIME_1.ref.disableInteraction(res.data);
                break;
            case HDSocketEventType.RECEIVE_GRADES:
                break;
            case HDSocketEventType.STUDENT_STATUS:
                ACTIVITY_SANDS_OF_TIME_1.ref.studentStatus(res.data);
                break;
            case HDSocketEventType.STUDENT_TURN:
                ACTIVITY_SANDS_OF_TIME_1.ref.studentTurn(res.data);
                break;
            case HDSocketEventType.GAME_MESSAGE:
                if (res.data.userName == HDAppManager.username || !ACTIVITY_SANDS_OF_TIME_1.ref)
                    return;
                ACTIVITY_SANDS_OF_TIME_1.ref.gameEvents(res.data);
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
        this.joinedStudentList = [];
        this.joinedStudentList = data;
        let students = (data.users.filter( x => x.userId != data.teacherId )).map( x=> x.userName);
        this.updateBags([ ...students]);
        this.updateRakes([ ...students]);
    },

    updateRakes: function (studList){
        for(let student of studList){
            if( this.rakeList.filter( x => x.studentName == student).length == 0  ){
                for(let rake of this.rakeList){
                    if(rake.studentName == ""){
                        rake.studentName = student;
                        break;
                    }
                }
            }
        }
        let  i = 0;
        for(let rake of this.rakeList){
            if(!studList.includes(rake.studentName )){
                rake.studentName = "";
            }
                rake.rake.setVisible(rake.studentName != "");
                if(rake.studentName == HDAppManager.username){
                    this.myRake = rake.rake;
                }
            rake.rake.setName(rake.studentName);
            rake.rake.setPosition(cc.p(this.getContentSize().width * 0.1 + 90*i, this.getContentSize().height * 0.7));
            ++i;
        }
    },

    updateBags: function (nameList){
        //Set the name of newly joined student.
        for(let name of nameList){
            if( this.bagList.filter( x => x.stuName.getString() == name).length == 0  ){
                for(let bag of this.bagList){
                    if(bag.stuName.getString() == ""){
                        bag.stuName.setString( name );
                        break;
                    }
                }
            }
        }

        //Remove Bag of student left the game.
        let initialX = this.getContentSize().width * 0.22;
        this.nextItem_X_Position =initialX;
        let initialY = this.getContentSize().height * 0.08;
        for(let bag of this.bagList) {
            if (!nameList.includes(bag.stuName.getString())) {
                bag.stuName.setString("");
            }
            if (bag.stuName.getString() != "") {
                // bag.setPosition(cc.p(initialX, initialY));
               // initialX += bag.getContentSize().width + 10;
            }
            bag.setVisible(bag.stuName.getString() != "")
        }


        //childLength =
        if (nameList.length <= 4) {
            this.horizontalPadding = 105;
        } else {
            this.horizontalPadding = cc.lerp(105, 2, (nameList.length - 1) / (8 - 1));
        }

        this.bagList.map((child) => {
            if(child.isVisible()) {
                child.setPosition(cc.p(this.nextItem_X_Position, initialY));
                this.nextItem_X_Position =
                    child.x + child.getContentSize().width + this.horizontalPadding;
            }
        });
    },


    gameEvents: function (res) {
        if (!ACTIVITY_SANDS_OF_TIME_1.ref || !res || !res.data)
            return;
        switch (res.eventType) {
            case ACTIVITY_SANDS_OF_TIME_1.socketEventKey.STUDENT_INTERACTION:
                this.onUpdateStudentInteraction(res.data);
                break;
            case ACTIVITY_SANDS_OF_TIME_1.socketEventKey.DragRakes:
                this.moveRake(res.data.pos, res.data.userName);
                break;
            case ACTIVITY_SANDS_OF_TIME_1.socketEventKey.StopRakeAction:
                this.stopRakeAnimation( res.data.userName);
                break;
            case ACTIVITY_SANDS_OF_TIME_1.socketEventKey.RunRakeAnimation:
                this.runRakeAnimation( res.data.userName);
                break;
            case ACTIVITY_SANDS_OF_TIME_1.socketEventKey.EmitLeaf:
                this.emitLeaf( ACTIVITY_SANDS_OF_TIME_1.ref, res.data);
                break;
            case ACTIVITY_SANDS_OF_TIME_1.socketEventKey.PopulateLeaf:
                ////////////console.log("sync leaf at student side ====================== ", res.data);
                this.syncLeaf(res.data);
                break;
            case ACTIVITY_SANDS_OF_TIME_1.socketEventKey.RemoveLeaf:
                this.removeLeaf(res.data.tag);
                break;
            case ACTIVITY_SANDS_OF_TIME_1.socketEventKey.ImageCleared:
                this.imageCleared(res.data.objIndex,res.data.userName);
                break;
            case ACTIVITY_SANDS_OF_TIME_1.socketEventKey.WinnerScreen:
                console.log("game screeen");
                this.winnerScreen(res.data.bagList);
                break;
            case ACTIVITY_SANDS_OF_TIME_1.socketEventKey.ResetGame:
                this.resetGame();
                break;
            case ACTIVITY_SANDS_OF_TIME_1.socketEventKey.PopulateHiddenObject:
                this.syncHiddenObject(res.data);
                break;
            case ACTIVITY_SANDS_OF_TIME_1.socketEventKey.AddHiddenObject:
                this.addObj(res.data);
                break;
            case ACTIVITY_SANDS_OF_TIME_1.socketEventKey.UpdateLeafInfo:
                this.leafEmitDetails = res.data;
                this.emitLeaf();
                break;
            case ACTIVITY_SANDS_OF_TIME_1.socketEventKey.GameState:
                this.gameState = res.data;
                console.log("game state", this.gameState);
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
        ACTIVITY_SANDS_OF_TIME_1.ref.syncDataInfo = data;
    },

    startTimer : function(){
         this.schedule(this.updateTimer, 1, cc.repeatForever(), 0);
         this.gameStartTime = new Date().getTime();
         this.updateRoomData()
    },

    updateTimer : function(){
        this.time--;
        if(this.time < 0){
            this.time = 0;
            this.stopTimer();
            this.onGameComplete();
            this.updateTimerString();
        }
        else{
            this.updateTimerString();
        }
    },

    updateTimerString : function(){
        var min = Math.floor(this.time/ 60);
        var second = Math.trunc(this.time % 60);
        var timeString = "";
        timeString = min > 9 ?  min : "0" + min;
        timeString += ":";
        timeString += second > 9 ?second :  "0" + second;
        this.timerLabel.setString(timeString);

    },

    stopTimer : function(){
        this.unschedule(this.updateTimer);
        this.gameState = ACTIVITY_SANDS_OF_TIME_1.gameState.COMPLETED;
        this.showWinnerScreenToAll();
    },

    showWinnerScreenToAll : function(){
        let bagListInfo = ACTIVITY_SANDS_OF_TIME_1.ref.bagList.map(bag => {return {"stuName" : bag.stuName.getString(), "object" : bag.object, "bagImgIdx" : bag.bagImgIdx, "isBagVisible" : bag.isVisible()}});
        ACTIVITY_SANDS_OF_TIME_1.ref.winnerScreen(bagListInfo);
        ACTIVITY_SANDS_OF_TIME_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {'eventType': ACTIVITY_SANDS_OF_TIME_1.socketEventKey.WinnerScreen, 'data': { 'bagList' : bagListInfo} } );
    },

    buttonCallback: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                switch (sender.getTag()) {
                    case ACTIVITY_SANDS_OF_TIME_1.Tag.startButton:
                        ACTIVITY_SANDS_OF_TIME_1.ref.gameState = ACTIVITY_SANDS_OF_TIME_1.gameState.STARTED;
                        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                            "eventType": ACTIVITY_SANDS_OF_TIME_1.socketEventKey.GameState,
                            "data": ACTIVITY_SANDS_OF_TIME_1.ref.gameState
                        });
                        this.toggleMouse();
                        this.startTimer();
                        this.changeButtonStates();
                        this.generateSequenceToEmitLeaf();
                        this.updateRoomData();

                        break;

                    case ACTIVITY_SANDS_OF_TIME_1.Tag.stopButton:
                        this.toggleMouse();
                        this.onGameComplete();
                        this.stopTimer();
                        this.changeButtonStates();

                        break;
                }
                break;
        }
    },

    changeButtonStates : function(){
       var startButton =  this.getChildByTag(ACTIVITY_SANDS_OF_TIME_1.Tag.startButton);
       var stop =  this.getChildByTag(ACTIVITY_SANDS_OF_TIME_1.Tag.stopButton);
       console.log("ACTIVITY_SANDS_OF_TIME_1.ref.gameState", ACTIVITY_SANDS_OF_TIME_1.ref.gameState);
        if( ACTIVITY_SANDS_OF_TIME_1.ref.gameState == ACTIVITY_SANDS_OF_TIME_1.gameState.NOT_STARTED){
           console.log("start button");
           startButton.setVisible(true);
           stop.setVisible(false);
       }else{
           console.log("stop button");
           stop.setVisible(true);
           startButton.setVisible(false);
       }
    },

    onGameComplete: function(){
        this.parent.setResetButtonActive(true);
        ACTIVITY_SANDS_OF_TIME_1.ref.gameState = ACTIVITY_SANDS_OF_TIME_1.gameState.COMPLETED;
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            "eventType": ACTIVITY_SANDS_OF_TIME_1.socketEventKey.GameState,
            "data": ACTIVITY_SANDS_OF_TIME_1.ref.gameState
        });
        this.updateRoomData();
    },

    mouseControlEnable: function (location) {
        return (!this.isTeacherView ||  ACTIVITY_SANDS_OF_TIME_1.ref.gameState == ACTIVITY_SANDS_OF_TIME_1.gameState.COMPLETED || this.interactableObject);
    },

    /**
     *  Return a Bool if custom texture has to be show on mouse cursor.
     *  This will be called by parent app.
     * @returns {{textureUrl: (null|string), hasCustomTexture: boolean}}
     */
    mouseTexture: function () {
        var texture =  "none";

        if( ACTIVITY_SANDS_OF_TIME_1.ref.gameState == ACTIVITY_SANDS_OF_TIME_1.gameState.COMPLETED && !this.interactableObject){
            texture = "pointer";
        }
        return {'hasCustomTexture':   (ACTIVITY_SANDS_OF_TIME_1.ref.gameState !== ACTIVITY_SANDS_OF_TIME_1.gameState.COMPLETED && !this.interactableObject && !this.isTeacherView) || (ACTIVITY_SANDS_OF_TIME_1.ref.gameState == ACTIVITY_SANDS_OF_TIME_1.gameState.COMPLETED && !this.interactableObject), 'textureUrl':  texture};
    },

    /**
     * Update Mouse texture
     * @param location: Mouse location
     * It checks if A handIcon need to show or custom texture.
     * This method will be called by Parent Activity
     */
    updateMouseIcon: function (location) {
        let handICon = false;
        for (let obj of ACTIVITY_SANDS_OF_TIME_1.ref.handIconUI){
            // console.log("object", obj);
            if (cc.rectContainsPoint(obj.getBoundingBox(), obj.getParent().convertToNodeSpace(location))) {
                handICon = true;
                break;
            }
        }
        if (handICon) {
            this.interactableObject = true;
            this.customTexture = false;
        }else{
            this.interactableObject = false;
        }
    },



});
