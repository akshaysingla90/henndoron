let ACTIVITY_MEMORY_GAME_1 = {};
ACTIVITY_MEMORY_GAME_1.Tag = {
    CARD_INITIAL : 100
}
ACTIVITY_MEMORY_GAME_1.socketEventKey = {
    RESET : 1,
    POPULATE_CARDS: 2,
    FLIP_CARD: 3,
    UPDATE_LEVEL: 4
}
ACTIVITY_MEMORY_GAME_1.gameState = {
    NOT_STARTED : 0,
    STARTED     : 1,
    COMPLETED   : 2,
    STOP        : 3
};
ACTIVITY_MEMORY_GAME_1.ref          =   null;
ACTIVITY_MEMORY_GAME_1.MemoryGame   =   HDBaseLayer.extend({
    isTeacherView                   :   false,
    isPreviewMode                   :   false,
    gameState                       :   ACTIVITY_MEMORY_GAME_1.gameState.NOT_STARTED,
    interactableObject              :   null,
    customTexture                   :   true,
    handIconUI                      :   [],
    joinedStudentList               :   {},
    syncDataInfo                    :   null,
    card                            :   [],
    recentOpenCards                 :   [],
    distributionInfo                :   [],
    cardDetails                     :   [],
    studentMouseScriptShown         :   false,
    cardConfigData                  :   [],
    currentLevel                    :   0,
    isStudentInteractionEnable      :   false,
    isProcessing                    :   false,

    //================================== NODE LIFECYCLE
    ctor: function () {
        this._super();
    },
    onEnter: function () {
        this._super();
        console.log("on enter called");
        ACTIVITY_MEMORY_GAME_1.ref = this;
        ACTIVITY_MEMORY_GAME_1.ref.gameState = ACTIVITY_MEMORY_GAME_1.gameState.NOT_STARTED;
        let activityName = 'ACTIVITY_MEMORY_GAME_1';
        cc.loader.loadJson("res/Activity/" + activityName + "/config.json",
            function (error, config) {
                console.log("oconfig added ", config);
            ACTIVITY_MEMORY_GAME_1.config = config;
            ACTIVITY_MEMORY_GAME_1.ref.cardConfigData = config.cardsInfo.sections.levels.data;
            ACTIVITY_MEMORY_GAME_1.ref.assets =  ACTIVITY_MEMORY_GAME_1.config.assets.sections;
            ACTIVITY_MEMORY_GAME_1.resourcePath = "res/Activity/" + "" + activityName + "/res/"
            ACTIVITY_MEMORY_GAME_1.soundPath = ACTIVITY_MEMORY_GAME_1.resourcePath + "Sound/";
            ACTIVITY_MEMORY_GAME_1.animationBasePath =
                ACTIVITY_MEMORY_GAME_1.resourcePath + "AnimationFrames/";
            ACTIVITY_MEMORY_GAME_1.spriteBasePath =
                ACTIVITY_MEMORY_GAME_1.resourcePath + "Sprite/";
            ACTIVITY_MEMORY_GAME_1.ref.isTeacherView = HDAppManager.isTeacherView;
             ACTIVITY_MEMORY_GAME_1.ref.setupUI();
            if (ACTIVITY_MEMORY_GAME_1.ref.isTeacherView && !ACTIVITY_MEMORY_GAME_1.ref.syncDataInfo) {
                ACTIVITY_MEMORY_GAME_1.ref.isStudentInteractionEnable = true;
                ACTIVITY_MEMORY_GAME_1.ref.updateRoomData();
            }
                ACTIVITY_MEMORY_GAME_1.ref.MouseTextureUrl = ACTIVITY_MEMORY_GAME_1.spriteBasePath + config.cursors.data.cursor.imageName;
            // ACTIVITY_MEMORY_GAME_1.ref.triggerScript(config.teacherScripts.data.moduleStart.content.ops);
                ACTIVITY_MEMORY_GAME_1.config.teacherScripts.data.moduleStart.enable &&
                ACTIVITY_MEMORY_GAME_1.ref.triggerScript(ACTIVITY_MEMORY_GAME_1.config.teacherScripts.data.moduleStart.content.ops);
                ACTIVITY_MEMORY_GAME_1.config.teacherTips.data.moduleStart.enable &&
                ACTIVITY_MEMORY_GAME_1.ref.triggerTip(ACTIVITY_MEMORY_GAME_1.config.teacherTips.data.moduleStart.content);
        });
    },
    onEnterTransitionDidFinish: function (){
        this._super();
        this.fetchConnectedStudents();

    },
    onExit: function () {
        this._super();
        ACTIVITY_MEMORY_GAME_1.ref.removeAllChildrenWithCleanup(true);
        ACTIVITY_MEMORY_GAME_1.ref.customTexture = false;
        ACTIVITY_MEMORY_GAME_1.ref.interactableObject = false;
        ACTIVITY_MEMORY_GAME_1.ref = null;
    },

    //================================ UI  & Control =================
    setupUI: function () {
        this.setBackground( ACTIVITY_MEMORY_GAME_1.spriteBasePath +
            ACTIVITY_MEMORY_GAME_1.config.background.sections.background.imageName);
        this.distributeCards(this.cardConfigData[this.currentLevel].cards.length);
        if(this.syncDataInfo){
            this.updateUIWithSyncData();
        }else{
            this.isTeacherView && this.populateCards();
        }
    },
    updateUIWithSyncData : function (){
        if(this.syncDataInfo &&
            this.syncDataInfo.openCardTags &&
            this.syncDataInfo.recentCardTags && this.syncDataInfo.cardDetails) {
            this.syncDataInfo.level = HDUtility.clampANumber( this.syncDataInfo.level,
                0,  ACTIVITY_MEMORY_GAME_1.ref.cardConfigData.length - 1 );

            ACTIVITY_MEMORY_GAME_1.ref.distributeCards(
                ACTIVITY_MEMORY_GAME_1.ref.cardConfigData[this.syncDataInfo.level].cards.length
            );

            if(this.syncDataInfo.cardDetails.length > 0) {
                ACTIVITY_MEMORY_GAME_1.ref.cardDetails = this.syncDataInfo.cardDetails;
                this.addCardSprites(this.syncDataInfo.cardDetails);
            }else{
                this.populateCards();
            }
            this.syncAlreadyOpenCards(this.syncDataInfo.openCardTags.map(x=>this.getChildByTag(x)));
            this.recentOpenCards = this.syncDataInfo.recentCardTags.map(x=>this.getChildByTag(x));
            this.isStudentInteractionEnable = this.isTeacherView;

            this.parent.setResetButtonActive(
                (this.syncDataInfo.openCardTags.length > 0) && this.isTeacherView
            );
            if(  (this.syncDataInfo.openCardTags.length > 0) && this.isTeacherView){
                this.parent.setActive(true);
            }

            setTimeout(this.updateRoomData, 1000);
        }
    },
    buttonCallback: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                switch (sender.getTag()) {

                }
                break;
            case ccui.Widget.TOUCH_ENDED:
                if(!this.isStudentInteractionEnable) return;
                let button =   this.getChildByTag(sender.getTag());
                this.flipTheCard(sender.getTag(), sender.showFront, true);
                break;
        }
    },

    //===================================  GAME PLAY ========================
    distributeCards : function (count){
        console.log('distributed card ', count, count % 3);
        if(count < 4) return window.alert("Minimum 4 cards are allowed.");
        let countArr = [];
        let column = Math.floor(HDUtility.clampANumber(count/(count > 12 ? 3 : 2), 4, 8));
        if((column - (count % column) > 2  &&  (count % column) !== 0 && column !== count) || count/column > 3 ) column++;
        column = HDUtility.clampANumber(column, 4, 8);
         countArr.push(column);
          count -= column;
          while(count - column > 0){
              countArr.push(column);
              count -= column;
          }
        (count > 0) && countArr.push(count);
          this.distributionInfo = [...countArr];
          console.log('card distributed ',countArr);

    },
    populateCards : function (){
        console.trace();
      var cardProps  = [...ACTIVITY_MEMORY_GAME_1.ref.cardConfigData[ACTIVITY_MEMORY_GAME_1.ref.currentLevel].cards];
        for (var i = cardProps.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = cardProps[i];
            cardProps[i] = cardProps[j];
            cardProps[j] = temp;
        }
        this.cardDetails = cardProps;
        this.addCardSprites(cardProps);
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            "eventType" : ACTIVITY_MEMORY_GAME_1.socketEventKey.POPULATE_CARDS,
            "data": cardProps
        });
        console.log('card populated ',this.card);
        this.updateRoomData();
    },
    addCardSprites : function (cardDetails){
        let countArr = this.distributionInfo;
        this.cardDetails = cardDetails;
        this.card.forEach(x=>{
            x.front.removeFromParent(true)
            x.removeFromParent(true);
        }
        );
        // this.recentOpenCards.length = 0;
         let  scaleObj = { "4" : 0.5, "5": 0.4, "6": 0.35, "7": 0.3, "8": 0.25};
         let scale = scaleObj[countArr[0]];
        this.card.length = 0;
        let space = (8 - countArr[0]) * 7 + 10;
        let initialX = 0;
        let initialY = 0;
        let cardProps = {"x" : 350, "y": 350};
        initialY = this.getContentSize().height * 0.75;
        let idx = 0;
        for(let c of countArr){
            let rowWidth = c * cardProps.x * scale + (c - 1) * space;
            initialX = (this.getContentSize().width -  rowWidth)/2;
            initialX = initialX + cardProps.x * scale/2;
            for(let i = 0; i < c; ++i){
                let sp = this.getCard(cardDetails, idx, cc.p(initialX, initialY), scale, space);
                this.card.push(sp);
                initialX += sp.getContentSize().width * scale + space;
                idx++;
            }
            initialY -= cardProps.y * scale + space;
        }
    },
    flipTheCard : function(tag, showFront, bySelf){
        if(ACTIVITY_MEMORY_GAME_1.ref.recentOpenCards.length == 2) return;
        if(bySelf && showFront){
            if(ACTIVITY_MEMORY_GAME_1.ref.isProcessing) return;
            ACTIVITY_MEMORY_GAME_1.ref.isProcessing = true;
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                "eventType": ACTIVITY_MEMORY_GAME_1.socketEventKey.FLIP_CARD,
                "data": tag
            });
            setTimeout(()=>{
                ACTIVITY_MEMORY_GAME_1.ref.isProcessing = false;
            }, 700);
        }
        var cardRef = this.getChildByTag(tag);;
        let soundProps = ACTIVITY_MEMORY_GAME_1.config.assets.sections;
        HDSoundManager.playSound(
            ACTIVITY_MEMORY_GAME_1.soundPath +  (cardRef.specialCard ?
            soundProps.specialCardTurnSound.sound  : soundProps.normalCardTurnSound.sound));
        if(showFront) {
            cardRef.setTouchEnabled(false);
            cardRef.runAction(new cc.Sequence(new cc.RotateTo(0.1, 0, 90), new cc.callFunc((cardRef) => {
                cardRef.front.setVisible(true);
                cardRef.front.setRotationY(90);
                cardRef.showFront = false;
                // cardRef.front.setScale(0.2);
                cardRef.front.runAction(new cc.RotateTo(0.1, 0, 180));
                (!cardRef.specialCard) && ACTIVITY_MEMORY_GAME_1.ref.recentOpenCards.push(cardRef);
                if(bySelf){
                    ACTIVITY_MEMORY_GAME_1.ref.updateRoomData();
                    if (!ACTIVITY_MEMORY_GAME_1.ref.isTeacherView &&
                        ACTIVITY_MEMORY_GAME_1.ref.isStudentInteractionEnable && ACTIVITY_MEMORY_GAME_1.ref.checkIfCorrectCards()) {
                        ACTIVITY_MEMORY_GAME_1.ref.emitSocketEvent(
                            HDSocketEventType.SWITCH_TURN_BY_STUDENT,
                            {"roomId": HDAppManager.roomId
                            });
                    }
                }
                // ACTIVITY_MEMORY_GAME_1.ref.isProcessing = true;
                setTimeout(()=> {
                    if (ACTIVITY_MEMORY_GAME_1.ref.recentOpenCards.length === 2) {
                        if (ACTIVITY_MEMORY_GAME_1.ref.checkIfCorrectCards()) {
                            let data = [...ACTIVITY_MEMORY_GAME_1.ref.recentOpenCards];
                            ACTIVITY_MEMORY_GAME_1.ref.recentOpenCards.length = 0;
                            ACTIVITY_MEMORY_GAME_1.ref.openCards(data);
                        } else {
                            let data = [...ACTIVITY_MEMORY_GAME_1.ref.recentOpenCards];
                            ACTIVITY_MEMORY_GAME_1.ref.recentOpenCards.length = 0;
                           ACTIVITY_MEMORY_GAME_1.ref.closeCards(data);
                        }
                    }
                    // ACTIVITY_MEMORY_GAME_1.ref.isProcessing = false;
                }, 500);
            }, cardRef)));
        }else{
            cardRef.front.runAction(new cc.Sequence(new cc.RotateTo(0.1, 0, 90), new cc.callFunc((target, cardRef) => {
                ////console.log("cardRef ", target, "ref", cardRef);
                cardRef.setVisible(true);
                cardRef.front.setVisible(false);
                cardRef.showFront = true;
                cardRef.setTouchEnabled(true);
                // cardRef.setRotationY(90);
                // cardRef.front.setScale(0.2);
                cardRef.runAction(new cc.RotateTo(0.1, 0, 0));
            }, cardRef.front, cardRef)));
        }
    },
    checkIfCorrectCards : function (){
        return (ACTIVITY_MEMORY_GAME_1.ref.recentOpenCards.length === 2 &&
             (ACTIVITY_MEMORY_GAME_1.ref.recentOpenCards[0].pair ===
                ACTIVITY_MEMORY_GAME_1.ref.recentOpenCards[1].pair) );
    },
    playGameCompleteAnimation : function (){
      let interVal = 500;
        ACTIVITY_MEMORY_GAME_1.ref.gameState = ACTIVITY_MEMORY_GAME_1.gameState.COMPLETED;
        let soundProps = ACTIVITY_MEMORY_GAME_1.config.assets.sections.winSound.sound;
        HDSoundManager.playMusic(ACTIVITY_MEMORY_GAME_1.soundPath + soundProps);
      for(let i = 0; i < this.card.length; ++i){
          setTimeout( (card)=>{
             if(ACTIVITY_MEMORY_GAME_1.ref.gameState !== ACTIVITY_MEMORY_GAME_1.gameState.COMPLETED){
                 HDSoundManager.stopMusic();
                 return;
             }

             let scale = card.getScale();
             card.front.runAction( cc.sequence( cc.scaleTo(0.1, scale+0.1),  cc.scaleTo(0.1, scale)));
             ACTIVITY_MEMORY_GAME_1.ref.getStarsAnimation(card.getPosition());
          }, interVal * i, ACTIVITY_MEMORY_GAME_1.ref.card[i]);
      }

      setTimeout( ()=>{
          if(ACTIVITY_MEMORY_GAME_1.ref.currentLevel <
              ACTIVITY_MEMORY_GAME_1.ref.cardConfigData.length &&
              HDAppManager.username === ACTIVITY_MEMORY_GAME_1.ref.joinedStudentList.users[0].userName){
              if(ACTIVITY_MEMORY_GAME_1.ref.gameState === ACTIVITY_MEMORY_GAME_1.gameState.COMPLETED) {
                  ACTIVITY_MEMORY_GAME_1.ref.updateLevel();
              }
          }
      }, interVal * this.card.length);
    },
    updateLevel : function (){
        console.trace();
        ++ACTIVITY_MEMORY_GAME_1.ref.currentLevel;
        if(ACTIVITY_MEMORY_GAME_1.ref.currentLevel >=
        ACTIVITY_MEMORY_GAME_1.ref.cardConfigData.length) return;
        ACTIVITY_MEMORY_GAME_1.ref.distributeCards(
            ACTIVITY_MEMORY_GAME_1.ref.cardConfigData[ACTIVITY_MEMORY_GAME_1.ref.currentLevel].cards.length
           );
        ACTIVITY_MEMORY_GAME_1.ref.emitSocketEvent(
            HDSocketEventType.GAME_MESSAGE, {
                "eventType" : ACTIVITY_MEMORY_GAME_1.socketEventKey.UPDATE_LEVEL,
            }
        )
        ACTIVITY_MEMORY_GAME_1.ref.populateCards();
    },
    syncAlreadyOpenCards : function (arr){
        for(let cardRef of arr){
        cardRef.runAction(new cc.Sequence(new cc.RotateTo(0.1, 0, 90), new cc.callFunc((cardRef) => {
            cardRef.front.setVisible(true)
            cardRef.front.setRotationY(90);
            cardRef.showFront = false;
            cardRef.front.runAction(new cc.RotateTo(0.1, 0, 180));
        })));
        }
    },
    openCards : function (arr){
        ACTIVITY_MEMORY_GAME_1.ref.gameState = ACTIVITY_MEMORY_GAME_1.gameState.STARTED;
        arr.forEach((x)=> {
            let s = x.getScale();
            let soundProps = ACTIVITY_MEMORY_GAME_1.config.assets.sections.correctCard.sound;
            HDSoundManager.playSound(ACTIVITY_MEMORY_GAME_1.soundPath + soundProps);
            x.front.runAction( cc.sequence( cc.scaleTo(0.1,s + 0.1), cc.scaleTo(0.1, s)));
            ACTIVITY_MEMORY_GAME_1.ref.getStarsAnimation(x.getPosition());
            if(ACTIVITY_MEMORY_GAME_1.ref.card.filter(x=> x.showFront === false).length ===
                ACTIVITY_MEMORY_GAME_1.ref.card.length){
                ACTIVITY_MEMORY_GAME_1.ref.playGameCompleteAnimation();

            }
        } );
        this.parent.setResetButtonActive(true);
        if(HDAppManager.username === this.joinedStudentList.users[0].userName) {
            this.updateRoomData();
        }
    },
    closeCards : function (arr){
        ////console.log( "close card called ", arr);
        arr.forEach( x=>ACTIVITY_MEMORY_GAME_1.ref.flipTheCard( x.getTag(), false, true ) );
        setTimeout(    ACTIVITY_MEMORY_GAME_1.ref.updateRoomData, 1000);
        let soundProps = ACTIVITY_MEMORY_GAME_1.config.assets.sections.wrongCard.sound;
        HDSoundManager.playSound(ACTIVITY_MEMORY_GAME_1.soundPath + soundProps);
        this.updateRoomData();

    },
    getCard : function (cardArr, idx, position, scale, space){
        let back = this.createButton(
            "res/Activity/ACTIVITY_MEMORY_GAME_1/res/Sprite/card_back.png",
            "res/Activity/ACTIVITY_MEMORY_GAME_1/res/Sprite/card_back.png",
            "",0, idx + ACTIVITY_MEMORY_GAME_1.Tag.CARD_INITIAL,
            position, this);
        back.name = cardArr[idx].name;
        back.pair = cardArr[idx].pair;
        back.specialCard = cardArr[idx].specialCard;
        back.setScale(scale);
        // initialX += back.getContentSize().width * back.getScale() + space;
        back.setLocalZOrder(10);
        back.showFront = true;

        let front  = this.addSprite(
            "res/Activity/ACTIVITY_MEMORY_GAME_1/res/Sprite/card_front.png",
            position, this);
        front.setScale(scale);
        front.setVisible(false);
        front.setLocalZOrder(12);
        back.front = front;
        let item  = this.addSprite(
            "res/Activity/ACTIVITY_MEMORY_GAME_1/res/Sprite/" + cardArr[idx].imageName,
            cc.p(front.getContentSize().width * 0.5, front.getContentSize().height * 0.5), front);
        item.setLocalZOrder(11);
        item.setScale(0.8);

        return back;
    },
    getStarsAnimation : function (pos){
        let animations = ACTIVITY_MEMORY_GAME_1.config.assets.animation;
        let starsAnimProps = animations.data.object_pulled_out_animation;
        let sprite = ACTIVITY_MEMORY_GAME_1.ref.addSprite(ACTIVITY_MEMORY_GAME_1.animationBasePath +  starsAnimProps.frameInitial+'0001.png',
            pos, ACTIVITY_MEMORY_GAME_1.ref);
        sprite.setLocalZOrder(20);
        sprite.runAction( cc.sequence( HDUtility.runFrameAnimation(
            ACTIVITY_MEMORY_GAME_1.animationBasePath +
            starsAnimProps.frameInitial,
            starsAnimProps.frameCount, 0.08, '.png', true) ,
            cc.removeSelf()));
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
        this.parent.setResetButtonActive(false);
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            "eventType" : ACTIVITY_MEMORY_GAME_1.socketEventKey.RESET
        });
        this.resetGame();
    },
    resetGame : function() {
        this.gameState = ACTIVITY_MEMORY_GAME_1.gameState.NOT_STARTED;
        ACTIVITY_MEMORY_GAME_1.ref.gameState = ACTIVITY_MEMORY_GAME_1.gameState.NOT_STARTED;
        this.currentLevel = -1;
        this.updateLevel();
        this.recentOpenCards.length = 0;
    },
    updateRoomData: function () {
        console.log("openCardTags", ACTIVITY_MEMORY_GAME_1.ref.card.filter(x=> x.showFront === false).map(x=>x.getTag()));
            SocketManager.emitCutomEvent("SingleEvent", {
                'eventType': HDSocketEventType.UPDATE_ROOM_DATA,
                'roomId': HDAppManager.roomId,
                'data': {
                    "roomId": HDAppManager.roomId,
                    "roomData": {
                        "activity": ACTIVITY_MEMORY_GAME_1.config.properties.namespace,
                        "data": {
                            "openCardTags" : [...ACTIVITY_MEMORY_GAME_1.ref.card.filter(x=> x.showFront === false).map(x=>x.getTag())],
                             "recentCardTags" : [...ACTIVITY_MEMORY_GAME_1.ref.recentOpenCards.map(x=>x.getTag())],
                            "level": ACTIVITY_MEMORY_GAME_1.ref.currentLevel,
                            "cardDetails" : [...ACTIVITY_MEMORY_GAME_1.ref.cardDetails]
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
                "eventType": ACTIVITY_MEMORY_GAME_1.socketEventKey.STUDENT_INTERACTION,
                "data": {"userName": username, "status": status}
            });
        }
    },
    onUpdateStudentInteraction: function (params) {
        if (params.userName === HDAppManager.username) {
            ACTIVITY_MEMORY_GAME_1.ref.isStudentInteractionEnable = params.status;
        }
    },
    socketListener: function (res) {
        if (!ACTIVITY_MEMORY_GAME_1.ref)
            return;
        switch (res.eventType) {
            case HDSocketEventType.DISABLE_INTERACTION:
                ACTIVITY_MEMORY_GAME_1.ref.disableInteraction(res.data);
                break;
            case HDSocketEventType.STUDENT_STATUS:
                ACTIVITY_MEMORY_GAME_1.ref.studentStatus(res.data);
                break;
            case HDSocketEventType.STUDENT_TURN:
                ACTIVITY_MEMORY_GAME_1.ref.studentTurn(res.data);
                break;
            case HDSocketEventType.GAME_MESSAGE:
                if (res.data.userName === HDAppManager.username || !ACTIVITY_MEMORY_GAME_1.ref)
                    return;
                ACTIVITY_MEMORY_GAME_1.ref.gameEvents(res.data);
                break;
        }
    },
    disableInteraction: function (enable) {
        this.isStudentInteractionEnable = enable;
    },
    studentTurn: function (res) {
        let users = res.users;
        if (!this.isTeacherView) {
            if (!users.length) {
                this.isStudentInteractionEnable = false;
                return;
            }
            this.isStudentInteractionEnable = users.map(x=>x.userName).includes(HDAppManager.username);
        }
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
            if(!ACTIVITY_MEMORY_GAME_1.ref.studentMouseScriptShown) {
                ACTIVITY_MEMORY_GAME_1.config.teacherScripts.data.onMouseEnable.enable &&
                ACTIVITY_MEMORY_GAME_1.ref.triggerScript(ACTIVITY_MEMORY_GAME_1.config.teacherScripts.data.onMouseEnable.content.ops);
                ACTIVITY_MEMORY_GAME_1.ref.studentMouseScriptShown = true;
            }
        }
    },
    studentStatus: function (data) {
        this.joinedStudentList = [];
        this.joinedStudentList = data;
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
        if (!ACTIVITY_MEMORY_GAME_1.ref) return;
        switch (res.eventType) {
            case ACTIVITY_MEMORY_GAME_1.socketEventKey.STUDENT_INTERACTION:
                this.onUpdateStudentInteraction(res.data);
                break;
            case ACTIVITY_MEMORY_GAME_1.socketEventKey.RESET:
                this.recentOpenCards.length = 0;
                this.currentLevel = -1;
                this.gameState = ACTIVITY_MEMORY_GAME_1.gameState.NOT_STARTED;
                break;
            case ACTIVITY_MEMORY_GAME_1.socketEventKey.POPULATE_CARDS:
                this.addCardSprites(res.data);
                break;
            case ACTIVITY_MEMORY_GAME_1.socketEventKey.FLIP_CARD:
                this.flipTheCard(res.data, true, false);
                break;
            case ACTIVITY_MEMORY_GAME_1.socketEventKey.UPDATE_LEVEL:
                ACTIVITY_MEMORY_GAME_1.ref.distributeCards(
                    ACTIVITY_MEMORY_GAME_1.ref.cardConfigData[++ACTIVITY_MEMORY_GAME_1.ref.currentLevel].cards.length
               );
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
        ACTIVITY_MEMORY_GAME_1.ref.syncDataInfo = data;
    },
    mouseControlEnable: function (location) {
        return this.isStudentInteractionEnable;
    },
    /**
     *  Return a Bool if custom texture has to be show on mouse cursor.
     *  This will be called by parent app.
     * @returns {{textureUrl: (null|string), hasCustomexture: boolean}}
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
