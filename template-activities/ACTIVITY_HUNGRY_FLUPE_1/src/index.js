let ACTIVITY_HUNGRY_FLUPE_1 = {};
ACTIVITY_HUNGRY_FLUPE_1.Tag = {
    PUSH_BUTTON: 100,
    stopButton: 201,
    startButton: 202,
    SCORE_BG: 203,
}
ACTIVITY_HUNGRY_FLUPE_1.socketEventKey = {
    START : 1,
    STOP: 2,
    ADD_BUBBLES: 3,
    REMOVE_BUBBLES: 4,
    JUMP: 5,
    STUDENT_INTERACTION: 6,
    SHOW_SCORE : 7,
    GAME_COMPLETION: 8,
    CONNECTED_FLUPE : 9,
    ACk_CONNECTED_FLUPE : 10,

}
ACTIVITY_HUNGRY_FLUPE_1.gameState = {
    NOT_STARTED : 0,
    STARTED     : 1,
    COMPLETED   : 2,
    STOP        : 3
};

ACTIVITY_HUNGRY_FLUPE_1.ref = null;
ACTIVITY_HUNGRY_FLUPE_1.HungryFlupeLayer = HDBaseLayer.extend({
    isTeacherView           : false,
    isPreviewMode           : false,
    gameState               : ACTIVITY_HUNGRY_FLUPE_1.gameState.NOT_STARTED,
    interactableObject      : null,
    customTexture           : true,
    bubbleBouceDetails      : [],
    catchesBubblesName      : [],
    handIconUI              : [],
    deleteObj               : [],
    impulse                 : 700,
    flupeList               : [],
    bubbleList              : [],
    joinedStudentList       : {},
    addObjectCount          : 0,
    bubbleContainer        : [],
    time                  : 0,
    timerLabel             : null,
    gamePlayTime           : 40,
    syncBubbleInfo          :[],
    syncDataInfo            :null,
    showStartScript         : true,
    showTimerEndScript      : true,
    isMultiPlayer           : false,
    isFirstTimeConnected    :  true,
    pendingAck   : false,
    intervalId: 0,
    maxBubbleInScreen: 10,


    //================================== NODE LIFECYCLE
    ctor: function () {
        this._super();
    },
    onEnter: function () {
        this._super();
        ACTIVITY_HUNGRY_FLUPE_1.ref = this;
        ACTIVITY_HUNGRY_FLUPE_1.ref.catchesBubblesName = new Set();
        ACTIVITY_HUNGRY_FLUPE_1.ref.gameState = ACTIVITY_HUNGRY_FLUPE_1.gameState.STARTED;
        let activityName = 'ACTIVITY_HUNGRY_FLUPE_1';
        cc.loader.loadJson("res/Activity/" + activityName + "/config.json",
            function (error, config) {
            ACTIVITY_HUNGRY_FLUPE_1.config = config;
            ACTIVITY_HUNGRY_FLUPE_1.ref.assets =  ACTIVITY_HUNGRY_FLUPE_1.config.assets.sections;
            ACTIVITY_HUNGRY_FLUPE_1.resourcePath = "res/Activity/" + "" + activityName + "/res/"
            ACTIVITY_HUNGRY_FLUPE_1.soundPath = ACTIVITY_HUNGRY_FLUPE_1.resourcePath + "Sound/";
            ACTIVITY_HUNGRY_FLUPE_1.animationBasePath =
                ACTIVITY_HUNGRY_FLUPE_1.resourcePath + "AnimationFrames/";
            ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath =
                ACTIVITY_HUNGRY_FLUPE_1.resourcePath + "Sprite/";
            ACTIVITY_HUNGRY_FLUPE_1.ref.isTeacherView =  HDAppManager.isTeacherView;
            ACTIVITY_HUNGRY_FLUPE_1.ref.gamePlayTime = config.properties.gamePlayTime;
            ACTIVITY_HUNGRY_FLUPE_1.ref.maxBubbleInScreen = config.properties.maxBubbleInScreen;
                ACTIVITY_HUNGRY_FLUPE_1.ref.MouseTextureUrl = ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath + config.cursors.data.cursor.imageName;
            ACTIVITY_HUNGRY_FLUPE_1.ref.setupUI();
            if (ACTIVITY_HUNGRY_FLUPE_1.ref.isTeacherView) {
                !ACTIVITY_HUNGRY_FLUPE_1.ref.syncDataInfo && ACTIVITY_HUNGRY_FLUPE_1.ref.updateRoomData();
                ACTIVITY_HUNGRY_FLUPE_1.ref.isStudentInteractionEnable = true;
            }
            ACTIVITY_HUNGRY_FLUPE_1.ref.triggerScript(config.teacherScripts.data.moduleStart.content.ops);
            ACTIVITY_HUNGRY_FLUPE_1.ref.setPushButtonActive();
        });
    },
    onEnterTransitionDidFinish: function (){
        this._super();
        this.setPushButtonActive();
    },
    /**
     * Update is response for restrict flupe postitions in x & y
     * deleting bubbles,and adding new bubbles
     * @param dt
     */
    update : function (dt){
        this.updateFlupeShadow();
        this.checkForNewBubbleAddition();
        this.checkIfLanding();
        this.checkIfFlupeAte();
    },
    onExit: function () {
        this._super();
        ACTIVITY_HUNGRY_FLUPE_1.ref.removeAllChildrenWithCleanup(true);
        ACTIVITY_HUNGRY_FLUPE_1.ref.customTexture = false;
        ACTIVITY_HUNGRY_FLUPE_1.ref.interactableObject = false;
        ACTIVITY_HUNGRY_FLUPE_1.ref = null;
    },
    //================================ UI  & Control =================
    setupUI: function () {
        this.setBackground( ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath +
            ACTIVITY_HUNGRY_FLUPE_1.config.background.sections.background.imageName);
        this.setupOptionButtons();
        this.scheduleUpdate();
        this.setupControlButton();
        this.setupBubblePanel();
        this.setupFlupes();
        this.isTeacherView &&  this.setupTimer();
        this.updateFlupes([]);
        if(this.syncDataInfo){
            this.updateUIWithSyncData();
        }
        this.fetchConnectedStudents();
    },
    updateUIWithSyncData : function (){
        if(this.syncDataInfo &&
            this.syncDataInfo.bubbleInfo &&
            this.syncDataInfo.catchBubbleInfo && this.syncDataInfo.gameState) {
            this.gameState = this.syncDataInfo.gameState;
            if(this.isTeacherView &&
            this.gameState == ACTIVITY_HUNGRY_FLUPE_1.gameState.STARTED){
                this.updateButtonVisibility(ACTIVITY_HUNGRY_FLUPE_1.Tag.startButton, false);
                this.updateButtonVisibility(ACTIVITY_HUNGRY_FLUPE_1.Tag.stopButton, true);
            }
            this.syncDataInfo.catchBubbleInfo.forEach(ACTIVITY_HUNGRY_FLUPE_1.ref.updateBubblePanel);
            this.isTeacherView &&
            this.parent.setResetButtonActive(   this.syncDataInfo.catchBubbleInfo.length > 0);
            this.syncDataInfo.bubbleInfo.forEach(ACTIVITY_HUNGRY_FLUPE_1.ref.addBubbleSprite);
            this.gameStartTime = this.syncDataInfo.gameStartTime;
            let date = new Date();
            let currentTime = date.getTime();
            let delay = (currentTime - this.syncDataInfo.gameStartTime) / 1000;
            for(let flupe of  this.syncDataInfo.connectedFlupe){
                let f =  this.flupeList.find(x=>x.imgName===flupe.imgName);
                if(f)  {
                    f.stuName = flupe.stuName;
                }
            }
            if (this.isTeacherView && this.time < 0 &&
                this.gameState === ACTIVITY_HUNGRY_FLUPE_1.gameState.STARTED) {
                this.resetGame();
            } else if (this.isTeacherView && this.gameState === ACTIVITY_HUNGRY_FLUPE_1.gameState.STARTED) {
                this.startTimer(this.gamePlayTime - delay);
            }
            if(this.syncDataInfo.gameState === ACTIVITY_HUNGRY_FLUPE_1.gameState.COMPLETED){
                this.gameCompletion();
            }

        }
    },
    updateButtonVisibility: function (tag, visible) {
        let button = this.getChildByTag(tag);
        button.setVisible(visible);
        button.setEnabled(visible);
    },
    setupOptionButtons: function () {
        if (ACTIVITY_HUNGRY_FLUPE_1.ref.isTeacherView) {
            let startButtonObject = ACTIVITY_HUNGRY_FLUPE_1.config.buttons.data.startButton;
            let startButton = this.createButton(
                ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath + startButtonObject.enableState,
                ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath + startButtonObject.pushedState,
                "", 32, ACTIVITY_HUNGRY_FLUPE_1.Tag.startButton, cc.p(this.getContentSize().width * 0.09,
                    this.getContentSize().height * 0.2), this, this,
                ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath + startButtonObject.disableState);
            startButton.setScale(startButtonObject.scale);
            startButton.setEnabled(true);
            startButton.setLocalZOrder(10);
            this.handIconUI.push(startButton);
            let stopButtonObject = ACTIVITY_HUNGRY_FLUPE_1.config.buttons.data.stopButton;
            let stopButton = this.createButton(
                ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath + stopButtonObject.enableState,
                ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath + stopButtonObject.pushedState,
                "", 32, ACTIVITY_HUNGRY_FLUPE_1.Tag.stopButton, startButton.getPosition(),
                this, this, ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath + stopButtonObject.disableState);
            stopButton.setScale(stopButtonObject.scale);
            stopButton.setEnabled(false);
            stopButton.setLocalZOrder(10);
            stopButton.setVisible(false);
            this.handIconUI.push(stopButton);
        }
    },
    buttonCallback: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                switch (sender.getTag()) {
                    case ACTIVITY_HUNGRY_FLUPE_1.Tag.PUSH_BUTTON:
                        break;
                }
                break;
            case ccui.Widget.TOUCH_ENDED:
                switch (sender.getTag()) {
                    case ACTIVITY_HUNGRY_FLUPE_1.Tag.startButton:
                        this.startTheGame();
                        break;
                    case ACTIVITY_HUNGRY_FLUPE_1.Tag.stopButton:
                        this.stopTheGame();
                        break;
                    case ACTIVITY_HUNGRY_FLUPE_1.Tag.PUSH_BUTTON:
                        if(!ACTIVITY_HUNGRY_FLUPE_1.ref.isStudentInteractionEnable)return;
                        this.flupeJump(HDAppManager.username)
                        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE,
                            {"eventType": ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.JUMP});
                        break;
                }
                break;
        }
    },
    startTheGame : function (){
        ACTIVITY_HUNGRY_FLUPE_1.ref.gameState = ACTIVITY_HUNGRY_FLUPE_1.gameState.STARTED;
        this.updateButtonVisibility(ACTIVITY_HUNGRY_FLUPE_1.Tag.startButton, false);
        this.updateButtonVisibility(ACTIVITY_HUNGRY_FLUPE_1.Tag.stopButton, true);
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE,
            {"eventType": ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.START} );
        this.getParent().setAllStudentsMouseActive(true);
        this.populateBubbles(this.maxBubbleInScreen);
        this.startTimer(this.gamePlayTime);
        this.setScoreScreenActive(false);
        this.showStartScript && ACTIVITY_HUNGRY_FLUPE_1.ref.triggerScript(
            ACTIVITY_HUNGRY_FLUPE_1.config.teacherScripts.data.startButton.content.ops
        );
        this.isStudentInteractionEnable= true;
        this.showStartScript = false;
        this.setPushButtonActive();
        this.updateRoomData();
    },
    resetGame : function (){
        //====
        this.setScoreScreenActive(false);
        ACTIVITY_HUNGRY_FLUPE_1.ref.catchesBubblesName.clear();
        ACTIVITY_HUNGRY_FLUPE_1.ref.tableView.reloadData();
        while (this.bubbleList.length > 0){
            this.removeBubbles(this.bubbleList[0]);
        }
    },
    gameCompletion : function (){
        this.gameState = ACTIVITY_HUNGRY_FLUPE_1.gameState.COMPLETED;
        this.isTeacherView &&  this.stopTimer();
        this.setScoreScreenActive(true);
        while (this.bubbleList.length > 0){
            this.removeBubbles(this.bubbleList[0]);
        }
        this.isTeacherView && this.getParent().setAllStudentsMouseActive(false);
        this.setPushButtonActive();
        if(ACTIVITY_HUNGRY_FLUPE_1.ref.joinedStudentList
            && ACTIVITY_HUNGRY_FLUPE_1.ref.joinedStudentList.users &&
            ACTIVITY_HUNGRY_FLUPE_1.ref.joinedStudentList.users[0] &&
            HDAppManager.username === ACTIVITY_HUNGRY_FLUPE_1.ref.joinedStudentList.users[0].userName) {
            ACTIVITY_HUNGRY_FLUPE_1.ref.updateRoomData();
        }
        this.isStudentInteractionEnable = false;
        this.setPushButtonActive();
    },
    setupControlButton: function (){
        let props =  ACTIVITY_HUNGRY_FLUPE_1.config.buttons.data.push;
        let button = this.createButton( ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath +
            props.enableState, ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath +
            props.pushedState, "", 0, ACTIVITY_HUNGRY_FLUPE_1.Tag.PUSH_BUTTON,
            cc.p( props.position.x, props.position.y), this);
        this.handIconUI.push(button);
    },
    setPushButtonActive(){
        let btn = this.getChildByTag(ACTIVITY_HUNGRY_FLUPE_1.Tag.PUSH_BUTTON);
        if(btn) {
            let  status =   this.isTeacherView && !this.isMultiPlayer ?
                this.gameState === ACTIVITY_HUNGRY_FLUPE_1.gameState.STARTED :
                this.isStudentInteractionEnable;
            btn.setTouchEnabled(status);
            btn.setOpacity(  status ? 255 : 100);
            this.isTeacherView && btn.setVisible(!this.isMultiPlayer);
        }

    },
    setScoreScreenActive : function (status){
        let score = this.getChildByTag(ACTIVITY_HUNGRY_FLUPE_1.Tag.SCORE_BG);
        if(score) return score.setVisible(status);
        let bgProps = this.assets.score_bg;
        let basketProps = this.assets.score_bucket;
        let bg = this.addSprite(ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath + bgProps.imageName,
            cc.p(480, 320), this);
        bg.setTag(ACTIVITY_HUNGRY_FLUPE_1.Tag.SCORE_BG);
        bg.setVisible(status);
        bg.setLocalZOrder(100);
        let bucket = this.addSprite(ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath + basketProps.imageName,
           cc.p(290,300), bg);
        bucket.setScale(basketProps.scale);
    },

   //============================= FLUPE OPERATION
    /**
     * setup Flupes
     */
    setupFlupes: function (){
        this.flupeList = [];
        let objInfo =this.assets.flupes.flupes_data.data;
        let initialX = this.getContentSize().width *  0.22;
        let initialY = 205;
        let count = 0;
        for(let obj of objInfo){
            let animations = ACTIVITY_HUNGRY_FLUPE_1.config.assets.sections.flupes.flupes_data.data;
            let animprops = animations.find(x=>x.name === obj.name).animation[`land`];
            let  props  = animprops.frameInitial + ('0000' + animprops.frameCount).slice(-4);
            let flupe = this.addSprite(ACTIVITY_HUNGRY_FLUPE_1.animationBasePath + props + ".png",
               cc.p(initialX, initialY), this);
            flupe.setScale(0.5);
            flupe.initialPos = flupe.getPosition();
            let shadow = this.addSprite(
                ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath + obj.shadow,
                cc.p(initialX, initialY - flupe.getContentSize().height*0.5 * flupe.getScaleY()), this);
            shadow.setAnchorPoint(cc.p(0.5, 0));
            shadow.setVisible(false);
            shadow.initialPos = shadow.getPosition();
            flupe.shadow = shadow;
            initialX += flupe.getContentSize().width*flupe.getScale();
            flupe.stuName  =  "";
            flupe.object = [];
            flupe.imgName  = obj.name;
            flupe.isGoingUp = false;
            flupe.imgIdx = count++;
            this.flupeList.push(flupe);
        }
    },
    /**
     *
     * @param params
     */
    updateAlreadyConnectedFlupe : function (params){

        this.emitSocketEvent( HDSocketEventType.GAME_MESSAGE, {
            "eventType": ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.ACk_CONNECTED_FLUPE
        } );
        this.isFirstTimeConnected = false;
        this.studentStatus(params.users);

    },
    /**
     * Attach glow with a flupe
     * @param sprite:  Flupe sprite
     */
    attachGlow : function (sprite){
        if(sprite.glow) return sprite.glow.setVisible(true);
        let animations = ACTIVITY_HUNGRY_FLUPE_1.config.assets.sections.flupes.flupes_data.data;
        let animationProps = animations.find(x=>x.name === "glowing_outline").animation[`land`];
        let glow = this.addSprite(ACTIVITY_HUNGRY_FLUPE_1.animationBasePath +
            animationProps.frameInitial +  ("000" + animationProps.frameCount).slice(-4) + ".png",
            cc.p(sprite.getContentSize().width * 0.5, sprite.getContentSize().height * 0.5),
            sprite
        );
        glow.setName("glow");
        sprite.glow = glow;
    },
    /**
     *
     * @param nameList
     */
    updateFlupes: function (nameList){
        console.trace();
        //Remove flupe which has left the game
        for(let child of this.flupeList) {
            if (!nameList.includes(child.stuName)) {
                child.stuName = "";
                child.removeFromParent();
                child.shadow.setVisible(false);
                if(child.glow) {
                    child.removeAllChildren();
                    child.glow = null;
                }
            }
        }
        //Assign an flupe to new joined player
        for(let name of nameList){
            if(!this.flupeList.find(x=>x.stuName==name)) {
                let flupe = this.flupeList.find(x => x.stuName=="");
                if(flupe){
                    flupe.stuName = name;
                }
            }
        }


        let initialX = this.getContentSize().width * 0.22;
        this.nextItem_X_Position =initialX;
        let initialY = 205;
        for(let child of this.flupeList){
            if( child.stuName != "" && !child.getParent()){
                this.addChild(child);
                child.shadow.setVisible(true);
            }
            if(child.stuName === HDAppManager.username){
                ACTIVITY_HUNGRY_FLUPE_1.ref.attachGlow(child);
            }
            if(child.getParent()) {
                child.setPosition(cc.p(this.nextItem_X_Position, initialY));
                child.initialPos = child.getPosition();
                this.nextItem_X_Position =
                    child.getPositionX() + child.getContentSize().width * child.getScale() //;+ this.horizontalPadding;
            }
            if(child.glow && !nameList.includes(HDAppManager.username)){
                child.removeAllChildren();
                child.glow  = null;
            }
            ////console.log("sprite ", child.stuName);
        }
    },
    /**
     *
     */
    checkIfLanding:function() {
        this.flupeList.forEach(flupe=>{
                if(!flupe.isGoingUp &&
                    (flupe.getPositionY() - flupe.initialPos.y) > 100 && (flupe.getPositionY() - flupe.initialPos.y) < 105){
                  flupe.runAction(cc.sequence( ACTIVITY_HUNGRY_FLUPE_1.ref.getFlupeAnimation(flupe.imgName, "land"),
                      cc.callFunc((flupe)=>{
                          var animations = ACTIVITY_HUNGRY_FLUPE_1.config.assets.sections.flupes.flupes_data.data;
                          let animprops = animations.find(x=>x.name === flupe.imgName).animation[`land`];
                          let  props  = animprops.frameInitial + ('0000' + animprops.frameCount).slice(-4);
                          flupe.setTexture( new cc.Sprite(ACTIVITY_HUNGRY_FLUPE_1.animationBasePath + props + ".png").getTexture());
                      }, flupe)));
                  if(flupe.glow) flupe.glow.runAction( cc.sequence(
                      ACTIVITY_HUNGRY_FLUPE_1.ref.getGlowAnimation("land"),
                      cc.callFunc((glow)=>{
                          let animations = ACTIVITY_HUNGRY_FLUPE_1.config.assets.sections.flupes.flupes_data.data;
                          let animationProps = animations.find(x=>x.name === "glowing_outline").animation[`land`];
                          glow.setTexture(new cc.Sprite(ACTIVITY_HUNGRY_FLUPE_1.animationBasePath +
                              animationProps.frameInitial +  ("000" + animationProps.frameCount).slice(-4) + ".png"
                          ).getTexture());
                      }, flupe.glow)
                  ));
                }
            });
    },
    checkIfFlupeAte : function (){
      let flupe = this.flupeList.find(x=>x.stuName == HDAppManager.username);
      if(flupe &&  flupe.isGoingUp) {
          let boundingBox = flupe.getBoundingBox();
          for (let bubble of this.bubbleList) {
              if (cc.rectContainsRect(boundingBox, bubble.getBoundingBox())) {
                  ACTIVITY_HUNGRY_FLUPE_1.ref.removeBubblesWithAnimation(bubble);
                  ACTIVITY_HUNGRY_FLUPE_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                      "eventType": ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.REMOVE_BUBBLES,
                      "data": {"id": bubble.id, "pos": bubble.getPosition()}
                  });
              }
          }
      }
    },

    getFlupeAnimation : function (name, type){
        let animations = ACTIVITY_HUNGRY_FLUPE_1.config.assets.sections.flupes.flupes_data.data;
        let flupeAnimationProps = animations.find(x=>x.name === name).animation[`${type}`];
        return cc.sequence( HDUtility.runFrameAnimation(
            ACTIVITY_HUNGRY_FLUPE_1.animationBasePath +
            flupeAnimationProps.frameInitial,
            flupeAnimationProps.frameCount, 0.1, '.png', 1));
    },
    getGlowAnimation : function (type){
        let animations = ACTIVITY_HUNGRY_FLUPE_1.config.assets.sections.flupes.flupes_data.data;
        let glowAnimationProps = animations.find(x=>x.name === "glowing_outline").animation[`${type}`];
        return cc.sequence( HDUtility.runFrameAnimation(
            ACTIVITY_HUNGRY_FLUPE_1.animationBasePath +
            glowAnimationProps.frameInitial,
            glowAnimationProps.frameCount, 0.1, '.png', 1));
    },
    flupeJump : function (name){
        let flupe =  this.flupeList.find(x=>x.stuName === name);
        if(!flupe) return;
        if(flupe.getPositionY() - flupe.initialPos.y > 50 ||  flupe.isGoingUp) return;
        flupe.isGoingUp = true;
        flupe.runAction( cc.sequence(this.getFlupeAnimation(flupe.imgName, "leap"),
            cc.callFunc((target, data)=>{
                target.setTexture(new cc.Sprite(ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath +
                    flupe.imgName + '_midair.png').getTexture());
                target.runAction( new cc.BezierTo(1, [
                    cc.p(target.getPositionX(),ACTIVITY_HUNGRY_FLUPE_1.ref.getContentSize().height * 0.7),
                    cc.p(target.getPositionX(),ACTIVITY_HUNGRY_FLUPE_1.ref.getContentSize().height * 0.8),
                    cc.p(target.getPositionX(), target.initialPos.y)]
                ) );
            }, flupe ),
            cc.delayTime(0.5),
            cc.callFunc((target, data)=>{
                target.isGoingUp = false;
            }, flupe),
            cc.delayTime(0.5),
            cc.callFunc((target, data)=>{
                let animations = ACTIVITY_HUNGRY_FLUPE_1.config.assets.sections.flupes.flupes_data.data;
                let animprops = animations.find(x=>x.name === flupe.imgName).animation[`land`];
                let  props  = animprops.frameInitial + ("0000" + animprops.frameCount).slice(-4);
                target.setTexture(new cc.Sprite(ACTIVITY_HUNGRY_FLUPE_1.animationBasePath +
                    props+".png").getTexture());
            }, flupe )

        ));
        if(flupe.glow){
            flupe.glow.runAction( cc.sequence(this.getGlowAnimation("leap"),
                cc.callFunc((target, data)=>{
                    target.setTexture(new cc.Sprite(ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath +
                        'glowing_outline_midair.png').getTexture());
                }, flupe.glow ), cc.delayTime(1),
                cc.callFunc((target, data)=>{
                    let animations = ACTIVITY_HUNGRY_FLUPE_1.config.assets.sections.flupes.flupes_data.data;
                    let animprops = animations.find(x=>x.name === "glowing_outline").animation[`land`];
                    let  props  = animprops.frameInitial +  ("000"+animprops.frameCount).slice(-4);
                    target.setTexture(new cc.Sprite(ACTIVITY_HUNGRY_FLUPE_1.animationBasePath +
                        props+".png").getTexture());
                }, flupe.glow )

            ));
        }
    },
    sendUpdatedFlupe : function (data){
        if(!ACTIVITY_HUNGRY_FLUPE_1){
             return clearInterval(ACTIVITY_HUNGRY_FLUPE_1.ref.intervalId)
        }
        if(!ACTIVITY_HUNGRY_FLUPE_1.ref.pendingAck) return clearInterval(ACTIVITY_HUNGRY_FLUPE_1.ref.intervalId);
        let connectedFlupe  = ACTIVITY_HUNGRY_FLUPE_1.ref.flupeList.filter(x=>x.stuName !== "").map((x)=>{
            return {
                "imgName" : x.imgName,
                "stuName": x.stuName
            }
        });
        ACTIVITY_HUNGRY_FLUPE_1.ref.emitSocketEvent(
            HDSocketEventType.GAME_MESSAGE,
            {
                "eventType": ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.CONNECTED_FLUPE,
                "data" : {"connectedFlupe": connectedFlupe, "users": data}
            }
        )
    },

    /**
     * * Shadow will be scaled according to flupe movement
     */
    updateFlupeShadow : function (){
        this.flupeList.forEach(flupe=>{
            let flyHeightOfFlupe = flupe.getPositionY() - flupe.initialPos.y;
            flupe.shadow.setVisible(flyHeightOfFlupe > 5);
            flupe.shadow.setScaleX(HDUtility.clampANumber((200 - flyHeightOfFlupe)/200, 0.25, 1));
        });
    },

    //=====================================================  Bubble operation
    /**
     * populateBubbles
     * @param count
     */
    populateBubbles: function (count){
        let bubblesData = this.assets.item_bubble.bubble_items_data.data;
        let initialX = [300, 600];
        let bubblesInfo = [];
        while(count--) {
            let obj = { "itemInfo":bubblesData[Math.floor(Math.random() * bubblesData.length)],
                "pos": {"x": this.getContentSize().width * Math.random(),
                    "y":  this.getContentSize().height * 0.5 + Math.random() * 20 },
                "isMoveLeft" : Math.random() < 0.5,
                "id" : Date.now()+Math.random(),

            };
            bubblesInfo.push(obj);
            this.syncBubbleInfo.push(obj);
            this.updateRoomData();
        }
        this.emitSocketEvent( HDSocketEventType.GAME_MESSAGE, {
            "eventType": ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.ADD_BUBBLES,
            "data": bubblesInfo
        } );
        bubblesInfo.forEach(ACTIVITY_HUNGRY_FLUPE_1.ref.addBubbleSprite);
        this.addObjectCount = 0;
    },

    addBubbleSprite: function({itemInfo, id, pos, isMoveLeft}) {

        let sprite = ACTIVITY_HUNGRY_FLUPE_1.ref.addSprite(ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath + itemInfo.imageName,
            cc.p(pos.x, pos.y),  ACTIVITY_HUNGRY_FLUPE_1.ref);
        sprite.id = id,
        sprite.name = itemInfo.name;
        sprite.isMoveLeft = isMoveLeft;
        sprite.jumpCount = 0;
        ACTIVITY_HUNGRY_FLUPE_1.ref.bubbleList.push(sprite);
        ACTIVITY_HUNGRY_FLUPE_1.ref.moveSprite(sprite);
        return sprite;
    },

    moveSprite : function ( sprite ){
        let heightReduction = 10;
       sprite.jumpCount  += 1;
        sprite.isMoveLeft = (Math.random() < 0.5) ;
        if(ACTIVITY_HUNGRY_FLUPE_1.ref.isOutOfScreen(sprite)) {
            sprite.jumpCount  = 0;
            sprite.setPosition(
                cc.p(sprite.isMoveLeft ? this.getContentSize().width - (Math.random() * 300) : Math.random()  * 300,
                    ACTIVITY_HUNGRY_FLUPE_1.ref.getContentSize().height * 0.35 + Math.random() * 100)
            );
        }
            if(sprite.isMoveLeft) {
                let distance = Math.random() * 100 + 100;
                let height = 300;
                sprite.runAction(
                    cc.sequence(
                        new cc.BezierTo(
                            0.75, [
                                cc.p(sprite.getPositionX() - distance/4 * Math.random(), sprite.getPositionY() + height - heightReduction),
                                cc.p(sprite.getPositionX() - distance/2  * Math.random(), sprite.getPositionY() + height - heightReduction),
                                cc.p(sprite.getPositionX() - distance, sprite.getPositionY()),
                            ]
                        ),
                        cc.callFunc(
                            ACTIVITY_HUNGRY_FLUPE_1.ref.moveSprite, ACTIVITY_HUNGRY_FLUPE_1.ref, sprite
                        )
                    )
                )
            }else {
                let distance = Math.random() * 100 + 100;
                let height = 300;
                sprite.runAction(
                    cc.sequence(
                       new cc.BezierTo(
                           0.75, [
                                cc.p(sprite.getPositionX() + distance/4, sprite.getPositionY() + height  - heightReduction),
                                cc.p(sprite.getPositionX() + distance/2, sprite.getPositionY() + height - heightReduction),
                                cc.p(sprite.getPositionX() + distance, sprite.getPositionY()),
                            ]
                        ),
                        cc.callFunc(
                            ACTIVITY_HUNGRY_FLUPE_1.ref.moveSprite, ACTIVITY_HUNGRY_FLUPE_1.ref, sprite
                        )
                    )
                )
            }
    },

    isOutOfScreen : function (sprite){
      return sprite.isMoveLeft ? sprite.getPositionX() < 0 :
          sprite.getPositionX() > this.getContentSize().width;
    },

    removeBubbles : function ({id}){
        let bubble =  ACTIVITY_HUNGRY_FLUPE_1.ref.bubbleList.find(x=>x.id==id);
        if(!bubble) return;
        let idx = ACTIVITY_HUNGRY_FLUPE_1.ref.bubbleList.indexOf(bubble);
        ACTIVITY_HUNGRY_FLUPE_1.ref.updateBubblePanel(bubble.name);
        ACTIVITY_HUNGRY_FLUPE_1.ref.bubbleList.splice( idx, 1);
        ACTIVITY_HUNGRY_FLUPE_1.ref.syncBubbleInfo.splice(idx, 1);
        bubble.removeFromParent(true);
        if(ACTIVITY_HUNGRY_FLUPE_1.ref.joinedStudentList
            && ACTIVITY_HUNGRY_FLUPE_1.ref.joinedStudentList.users &&
            ACTIVITY_HUNGRY_FLUPE_1.ref.joinedStudentList.users[0] &&
            HDAppManager.username === ACTIVITY_HUNGRY_FLUPE_1.ref.joinedStudentList.users[0].userName) {
            ACTIVITY_HUNGRY_FLUPE_1.ref.updateRoomData();
            if(ACTIVITY_HUNGRY_FLUPE_1.ref.gameState === ACTIVITY_HUNGRY_FLUPE_1.gameState.STARTED)
                ++ACTIVITY_HUNGRY_FLUPE_1.ref.addObjectCount;
        };
    },
    removeBubblesWithAnimation : function ({id, pos}){
        let bubble =  ACTIVITY_HUNGRY_FLUPE_1.ref.bubbleList.find(x=>x.id===id);
        if(!bubble) return;
        //console.log("Pos ", pos);
        if(pos)
            bubble.setPosition(pos);
         ACTIVITY_HUNGRY_FLUPE_1.ref.getStarsAnimation(bubble.getPosition());
        let  label = this.createTTFLabel(bubble.name, HDConstants.DarkBrown, 30,
            HDConstants.Brown, bubble.getPosition(), this);
        label.setLocalZOrder(100);
        label.runAction(cc.sequence(cc.fadeOut(2), cc.removeSelf()));
        this.removeBubbles({id});
    },
    setupBubblePanel: function(){
        //BG
        let imgProp = ACTIVITY_HUNGRY_FLUPE_1.config.assets.sections.bubbles_panel;
        let bg = this.addSprite(
            ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath +  imgProp.imageName,
            cc.p(480, 80),
            this);

        this.tableView = new cc.TableView(this,
            cc.size(bg.getContentSize().width * 0.85, bg.getContentSize().height * 0.8));
        this.tableView.setPosition(cc.p(bg.getContentSize().width * 0.07, bg.getContentSize().height * 0.1));
        this.tableView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this.tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_BOTTOMUP);
        this.tableView.setTouchEnabled(this.assets.item_bubble.bubble_items_data.data.length > 5);
        this.tableView.setDataSource(this);
        this.tableView.setDelegate(this);
        bg.addChild( this.tableView, 11);
        this.tableView.reloadData();
    },
    updateBubblePanel : function (name){
        if(ACTIVITY_HUNGRY_FLUPE_1.ref.gameState !== ACTIVITY_HUNGRY_FLUPE_1.gameState.STARTED) return;
        ACTIVITY_HUNGRY_FLUPE_1.ref.catchesBubblesName.add(name);
        this.isTeacherView && this.parent.setResetButtonActive( ACTIVITY_HUNGRY_FLUPE_1.ref.catchesBubblesName.size > 0);
        let cells =  ACTIVITY_HUNGRY_FLUPE_1.ref.tableView.getContainer().getChildren();
        let newCell = cells.find(x=>x.name===name);
        if(newCell) newCell.makeColoured();
    },
    getStarsAnimation : function (pos){
        let animations = ACTIVITY_HUNGRY_FLUPE_1.config.assets.sections.animation;
        let starsAnimProps = animations.data.object_pulled_out_animation;
        let sprite = this.addSprite(ACTIVITY_HUNGRY_FLUPE_1.animationBasePath +  starsAnimProps.frameInitial+'0001.png',
            pos, this);
        sprite.runAction( cc.sequence( HDUtility.runFrameAnimation(
            ACTIVITY_HUNGRY_FLUPE_1.animationBasePath +
            starsAnimProps.frameInitial,
            starsAnimProps.frameCount, 0.08, '.png', true) ,
            cc.removeSelf()));
    },

    /**
     * Check if new bubbles need to be added
     */
    checkForNewBubbleAddition : function (){
        if(ACTIVITY_HUNGRY_FLUPE_1.ref.addObjectCount > 0 &&
            ACTIVITY_HUNGRY_FLUPE_1.ref.gameState === ACTIVITY_HUNGRY_FLUPE_1.gameState.STARTED
        ) {
            ACTIVITY_HUNGRY_FLUPE_1.ref.populateBubbles(ACTIVITY_HUNGRY_FLUPE_1.ref.addObjectCount);
        }
    },

    //==========================================================  Table View Delegates
    tableCellSizeForIndex: function (table, idx) {
        return cc.size(table.getViewSize().width / 5, table.getViewSize().height);
    },
    tableCellAtIndex: function (table, idx) {
        let cardCell = table.dequeueCell();
        let cellSize = this.tableCellSizeForIndex(table, idx);
        const bubbleProps = this.assets.item_bubble.bubble_items_data.data[idx];
        if (!cardCell) {
            cardCell  = new ACTIVITY_HUNGRY_FLUPE_1.bubbleCell(cellSize);
        }
        cardCell.createUI(idx,
            {img: `${ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath}${bubbleProps.grayImageName}`, 'name': bubbleProps.name});
        return cardCell;
    },
    numberOfCellsInTableView: function (table) {
        return this.assets.item_bubble.bubble_items_data.data.length;
    },
    tableCellTouched: function (table, cell) {},

    //========================================================= Timer
    setupTimer : function(){
        this.timerLabel =   this.createTTFLabel("00:40", HDConstants.Sassoon_Medium, 30, HDConstants.White, cc.p(this.width * 0.93, this.height * 0.8), this);
        this.timerLabel.setLocalZOrder(10);
        this.timerLabel.enableStroke(cc.color(0, 0, 0, 255), 3.0);
        this.updateTimerString();
    },
    startTimer : function( time){
        if(time != undefined) this.time = time;
        this.schedule(this.updateTimer, 1, cc.repeatForever(), 0);
        this.gameStartTime = new Date().getTime();
        if(ACTIVITY_HUNGRY_FLUPE_1.ref.joinedStudentList
            && ACTIVITY_HUNGRY_FLUPE_1.ref.joinedStudentList.users &&
            ACTIVITY_HUNGRY_FLUPE_1.ref.joinedStudentList.users[0] &&
            HDAppManager.username === ACTIVITY_HUNGRY_FLUPE_1.ref.joinedStudentList.users[0].userName) {
            ACTIVITY_HUNGRY_FLUPE_1.ref.updateRoomData();
        };
    },
    updateTimer : function(){
        this.time--;
        if(this.time < 0){
            this.time = 0;
            this.gameCompletion();
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                "eventType": ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.GAME_COMPLETION
            });
            this.stopTimer();
            this.updateTimerString();
            this.isTeacherView &&  this.showTimerEndScript &&  ACTIVITY_HUNGRY_FLUPE_1.ref.triggerScript(
                ACTIVITY_HUNGRY_FLUPE_1.config.teacherScripts.data.timesEnd.content.ops
            );
            this.showTimerEndScript = false;

        }
        else {
            this.updateTimerString();
        }
    },
    updateTimerString : function(){
        let min = Math.floor(this.time/ 60);
        let second = Math.trunc(this.time % 60);
        let timeString = "";
        timeString = min > 9 ?  min : "0" + min;
        timeString += ":";
        timeString += second > 9 ?second :  "0" + second;
        this.timerLabel.setString(timeString);
    },
    stopTimer : function(){
        this.unschedule(this.updateTimer);
    },

    //========================SOCKET AND LESSONS METHODS ===========================
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
    fetchGameData: function () {
        HDNetworkHandler.get(HDAPIKey.GameData,
            {"roomId": HDAppManager.roomId},
            true, (err, res) => {
        });
    },
    reset : function (){
        this.stopTheGame();
    },
    onStudentPreviewCellClicked: function (studentName, status, containerRef) {
        this.isPreviewMode = status;
        this.previewingStudentName = (!status ? null : studentName);
    },
    updateRoomData: function () {
        //TODO gameStartTime at student side set and update
            SocketManager.emitCutomEvent("SingleEvent", {
                'eventType': HDSocketEventType.UPDATE_ROOM_DATA,
                'roomId': HDAppManager.roomId,
                'data': {
                    "roomId": HDAppManager.roomId,
                    "roomData": {
                        "activity": ACTIVITY_HUNGRY_FLUPE_1.config.properties.namespace,
                        "data": {"bubbleInfo" : ACTIVITY_HUNGRY_FLUPE_1.ref.syncBubbleInfo,
                            "catchBubbleInfo": [...ACTIVITY_HUNGRY_FLUPE_1.ref.catchesBubblesName],
                            "gameState": ACTIVITY_HUNGRY_FLUPE_1.ref.gameState,
                             "connectedFlupe" : ACTIVITY_HUNGRY_FLUPE_1.ref.flupeList.filter(x=>x.stuName !== "").map((x)=>{
                              return{
                                    "imgName" : x.imgName,
                                    "stuName": x.stuName
                                }
                            }),
                            "gameStartTime" : ACTIVITY_HUNGRY_FLUPE_1.ref.gameStartTime
                        },
                        "activityStartTime": HDAppManager.getActivityStartTime()
                    }
                }
            }, null);
    },
    updateStudentInteraction: function (username, status) {
        if (this.isTeacherView) {
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE,
                {
                "eventType": ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.STUDENT_INTERACTION,
                "data": {"userName": username, "status": status}
            });
        }
    },
    onUpdateStudentInteraction: function (params) {
        if (params.userName === HDAppManager.username) {
            ACTIVITY_HUNGRY_FLUPE_1.ref.isStudentInteractionEnable = params.status;
        }
        this.setPushButtonActive();
    },
    socketListener: function (res) {
        if (!ACTIVITY_HUNGRY_FLUPE_1.ref)
            return;
        switch (res.eventType) {
            case HDSocketEventType.DISABLE_INTERACTION:
                ACTIVITY_HUNGRY_FLUPE_1.ref.disableInteraction(res.data);
                break;
            case HDSocketEventType.STUDENT_STATUS:
                ACTIVITY_HUNGRY_FLUPE_1.ref.studentStatus(res.data);
                break;
            case HDSocketEventType.STUDENT_TURN:
                ACTIVITY_HUNGRY_FLUPE_1.ref.studentTurn(res.data);
                break;
            case HDSocketEventType.GAME_MESSAGE:
                if (res.data.userName === HDAppManager.username || !ACTIVITY_HUNGRY_FLUPE_1.ref)
                    return;
                ACTIVITY_HUNGRY_FLUPE_1.ref.gameEvents(res.data);
                break;
        }
    },
    disableInteraction: function (enable) {
        this.isStudentInteractionEnable = enable;
        this.setPushButtonActive();
    },
    studentTurn: function (res) {
        let users = res.users;
        if (!this.isTeacherView) {
            if (!users.length) {
                this.isStudentInteractionEnable = false;
                this.setPushButtonActive();
                return;
            }
            this.isStudentInteractionEnable = users.map(x => x.userName).includes(HDAppManager.username);
        }
        this.setPushButtonActive();
    },

    updateStudentTurn: function (userName) {
        if (this.isTeacherView) {
            if (!userName) {
                this.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_TEACHER,
                    {
                    "roomId": HDAppManager.roomId,
                    "users": []
                });
            } else {
                this.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_TEACHER,
                    {
                    "roomId": HDAppManager.roomId,
                    "users": [{userName: userName}]
                });
            }
        }
    },
    studentStatus: function (data) {
        console.log("student status called ", data);
        this.joinedStudentList = [];
        this.joinedStudentList = data;
        this.isMultiPlayer = data.users.length > 2;
        let users = this.isMultiPlayer  ?
            (data.users.filter( x => x.userId !== data.teacherId )).map( x=> x.userName):
            data.users.map( x=> x.userName);
        this.updateFlupes([...users]);
        this.setPushButtonActive();
        if(data.users[0].userName === HDAppManager.username){
            this.updateRoomData();
        }
    },
    /**
     * connected students, Socket event will receive in studentStatus
     */
    fetchConnectedStudents: function (){
        SocketManager.emitCutomEvent(HDSingleEventKey, {
            eventType: HDSocketEventType.STUDENT_STATUS,
            data: {
                roomId: HDAppManager.roomId,
            },
        });
    },
    gameEvents: function (res) {
        if (!ACTIVITY_HUNGRY_FLUPE_1.ref) return;
        switch (res.eventType) {
            case ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.STUDENT_INTERACTION:
                this.onUpdateStudentInteraction(res.data);
                break;
            case ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.START:
                this.gameState = ACTIVITY_HUNGRY_FLUPE_1.gameState.STARTED;
                this.gameStartTime = new Date().getTime();
                // this.isTeacherView && this.startTimer(this.gamePlayTime);
                this.setScoreScreenActive(false);
                break;
            case ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.STOP:
                ACTIVITY_HUNGRY_FLUPE_1.ref.gameState = ACTIVITY_HUNGRY_FLUPE_1.gameState.STOP;
                this.resetGame();
                break;
            case ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.GAME_COMPLETION:
                this.gameCompletion();
                break;
            case ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.ADD_BUBBLES:
                res.data.forEach(ACTIVITY_HUNGRY_FLUPE_1.ref.addBubbleSprite);
                break;
            case ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.REMOVE_BUBBLES:
                this.removeBubblesWithAnimation(res.data);
                break;
            case ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.JUMP:
                this.flupeJump(res.userName);
                break;
            case ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.CONNECTED_FLUPE:
                this.isFirstTimeConnected && this.updateAlreadyConnectedFlupe(res.data);
                break;
            case ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.ACk_CONNECTED_FLUPE:
                this.pendingAck = false;
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
        ACTIVITY_HUNGRY_FLUPE_1.ref.syncDataInfo = data;
    },
    stopTheGame : function (){
        ACTIVITY_HUNGRY_FLUPE_1.ref.gameState = ACTIVITY_HUNGRY_FLUPE_1.gameState.STOP;
        this.updateButtonVisibility(ACTIVITY_HUNGRY_FLUPE_1.Tag.startButton, true);
        this.updateButtonVisibility(ACTIVITY_HUNGRY_FLUPE_1.Tag.stopButton, false);
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE,
            {"eventType": ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.STOP} );
        this.getParent().setAllStudentsMouseActive(false);
        this.parent.setResetButtonActive(false);
        this.stopTimer();
        this.resetGame();
        this.setPushButtonActive();
    },
    mouseControlEnable: function (location) {
        return this.isStudentInteractionEnable;
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
        let handICon = false;
        for (let obj of this.handIconUI) {
            if (cc.rectContainsPoint(obj.getBoundingBox(), obj.getParent().convertToNodeSpace(location))) {
                handICon = true;
                break;
            }
        }
        this.interactableObject = this.isStudentInteractionEnable;
        this.customTexture = true;
    },
});
ACTIVITY_HUNGRY_FLUPE_1.bubbleCell = cc.TableViewCell.extend({
    cellProps: null,
    ctor: function (cellSize) {
        this._super();
        this.setContentSize(cellSize);
        return true;
    },
    onEnter: function () {
        this._super();
    },
    createUI: function (idx, cellProps) {
        this.cellProps  =   cellProps;
        this.idx  = idx;
        this.name = cellProps.name;
        this.removeAllChildren(true);
        let bubble = new cc.Sprite(this.cellProps.img);
        bubble.setPosition(cc.p(this.getContentSize().width * 0.5,
            this.getContentSize().height * 0.5));
        bubble.setName("bubble");
        this.addChild(bubble, 5);
    },
    makeColoured : function (){
        let bubble = this.getChildByName("bubble");
       let props =  ACTIVITY_HUNGRY_FLUPE_1.config.assets.sections.item_bubble.bubble_items_data.data[this.idx];
        if(bubble)
            bubble.runAction( cc.sequence(
                cc.scaleTo(0.25, 1.25),
                cc.callFunc( (target)=>{
                    target.setTexture(
                        new cc.Sprite(
                            ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath + props.imageName).getTexture() );
                } , bubble),
                cc.scaleTo(0.25, 1),
            ) );
    }
});