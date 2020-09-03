var magicHat_1 = {};

magicHat_1.Tag = {
    flashCard : 101,
    currentCard : 102,
    animation: 103,
}

magicHat_1.socketEvents = {
    ADD_CARD_TO_QUEUE: 1,
    REMOVE_CARD_FROM_QUEUE: 2,
     SHOW_FLASH_CARD:  3
}
magicHat_1.socketEventKey = {
    singleEvent         : "SingleEvent"
}

 magicHat_1.ref =  null;

magicHat_1.HDMagicHatLayer = HDBaseLayer.extend({
    carouselHeight : 120,
    config : null,
    winSize: cc.winSize,
    isTeacher: false,
    cardQueue: [],
    flashCardBaseFront: null,
    flashCardBaseBack: null,
    currentCard: null,
    animationCompleted: true,
    answerCard : null,
    answerCardText: null,
    tableView:null,
    scalePercentage:25,
    roomId : null,
    isStudentInteractionEnable: false,
    joinedStudentList: [],

    ctor:function () {
        this._super();
        magicHat_1.ref = this;
        this.isTeacher = HDAppManager.isTeacherView;
        this.winSize =  cc.winSize;
        return true;
    },
    onEnter : function () {
        this._super();
        this.cardQueue.length = 0;

        this.joinedStudentList.length = 0;
        magicHat_1.ref = this;
        cc.loader.loadJson ("res/Activity/ACTIVITY_MAGICHAT_1/config.json",function(error, config){
            magicHat_1.config = config;
            magicHat_1.ref.config = config;
            magicHat_1.resourcePath = "res/Activity/"+"ACTIVITY_MAGICHAT_1/res/Sprite/";
            magicHat_1.soundPath = "res/Activity/"+"ACTIVITY_MAGICHAT_1/res/Sound/";
            magicHat_1.animationPath = "res/Activity/"+"ACTIVITY_MAGICHAT_1/res/AnimationFrames/";
            magicHat_1.ref.isStudentInteractionEnable = magicHat_1.ref.isTeacher ? true : false;
            magicHat_1.ref.loadSpriteFrames();
            magicHat_1.ref.setupUI();
        });
    },

    onExit : function () {
        this._super();
        magicHat_1.ref = null;
    },
    /**
     * loadSpriteFrames: To load animation sprites.
     */
    loadSpriteFrames : function(){
        HDUtility.addSpriteFrames(  magicHat_1.animationPath+"cardTakeOut/magicHat_cardTakeOut_", magicHat_1.config.animation.flashCardGlow.frameCount, "magicHat_cardTakeOut_" , ".png");
    },
    /**
     * To get reduced size of each sprite  to a percent.
     * @param size
     * @returns {number}
     */
    getReducedSize : function(size) {
        return (size/100) * this.scalePercentage;
    },
    /**
     * setupUI: To setup UI for teacher and student.
     */
    setupUI : function() {
        this.setBackground(magicHat_1.resourcePath + magicHat_1.config.graphicalAssets.background.name);
        this.setBaseFlashCard();//To set cup, hat etc
        this.setAnswerCard("");
        this.answerCard.setVisible(false);
        if(this.isTeacher) { //Set only for Teacher
            this.setCardContent();
            this.updateRoomData();
        }

    },
    /**
     * setBaseFlashCard: This will create base flash card.
     */
    setBaseFlashCard : function() {
        //Front
        this.flashCardBaseFront = this.createButton(magicHat_1.resourcePath + magicHat_1.config.graphicalAssets.flashCardFront.name, magicHat_1.resourcePath + magicHat_1.config.graphicalAssets.flashCardFront.name, null,0,magicHat_1.Tag.flashCard,magicHat_1.config.graphicalAssets.flashCardFront.position,this,this);
        this.flashCardBaseFront.setLocalZOrder(3);
        var scaleFactorX = this.getReducedSize(this.winSize.width)/this.flashCardBaseFront.getContentSize().width;
        var scaleFactoyY = this.getReducedSize(this.winSize.width)/this.flashCardBaseFront.getContentSize().height;
        this.flashCardBaseFront.setScaleX(scaleFactorX);
        this.flashCardBaseFront.setScaleY(scaleFactoyY);
        //Back
        this.flashCardBaseBack = this.createButton(magicHat_1.resourcePath + magicHat_1.config.graphicalAssets.flashCardBack.name, magicHat_1.resourcePath + magicHat_1.config.graphicalAssets.flashCardBack.name, null,0,magicHat_1.Tag.flashCard,magicHat_1.config.graphicalAssets.flashCardBack.position,this,this);
        this.flashCardBaseBack.setLocalZOrder(1);
        var scaleFactorX = this.getReducedSize(this.winSize.width)/this.flashCardBaseBack.getContentSize().width;
        var scaleFactoyY = this.getReducedSize(this.winSize.width)/this.flashCardBaseBack.getContentSize().height;
        this.flashCardBaseBack.setScaleX(scaleFactorX);
        this.flashCardBaseBack.setScaleY(scaleFactoyY);

        var animationObject = magicHat_1.config.animation.flashCardGlow;
        var baseAnimationSprite = magicHat_1.ref.addSprite("res/LessonResources/emptyImage.png",cc.p(animationObject.position.x, animationObject.position.y), magicHat_1.ref.flashCardBaseFront);
        baseAnimationSprite.tag = magicHat_1.Tag.animation;
        baseAnimationSprite.setVisible(false);
    },
    /**
     * setAnswerCard: This will set answercard text.
     * @param name
     */
    setAnswerCard : function(name) {
        this.answerCard = this.addSprite(magicHat_1.resourcePath + magicHat_1.config.graphicalAssets.currentCardDescriptionBox.name,magicHat_1.config.graphicalAssets.currentCardDescriptionBox.position,this);
        this.answerCardText = this.createTTFLabel(name,HDConstants.Sassoon_Regular,magicHat_1.config.graphicalAssets.answerCardText.fontSize, cc.color(magicHat_1.config.graphicalAssets.answerCardText.color.r,magicHat_1.config.graphicalAssets.answerCardText.color.g,magicHat_1.config.graphicalAssets.answerCardText.color.b), cc.p(this.answerCard._contentSize.width * 0.5, this.answerCard._contentSize.height * 0.5),this.answerCard);
        if(magicHat_1.config.graphicalAssets.answerCardText.font)
        this.answerCardText.setFontName(magicHat_1.config.graphicalAssets.answerCardText.font)
        this.answerCard.setScale(0.7);
    },
    /**
     * moveCardOut: This will create card take out aniamtion sequence.
     */
    moveCardOut : function() {
        var imageName = null;
        var cardValue = null;
        if (this.cardQueue.length != 0) {
            let obj = this.cardQueue[0];
            imageName = obj.name;
            cardValue = obj.cardValue;
        } else {
            return;
        }

        // this.flashCardBase
        if(!this.animationCompleted) {
            return;
        }
        this.animationCompleted = false;
         magicHat_1.ref = this;

        let addAnswerCard =  cc.callFunc(function(){
            magicHat_1.ref.answerCardText.setString(cardValue);
            magicHat_1.ref.answerCard.setVisible(false);
        });

        let animationObj = magicHat_1.config.animation.cardTakeOut;
        let actionOffFromScreen = null;
        if(this.currentCard != null) {
            let scaleAction = cc.scaleTo(0.3, 0, 0);
            let rotate = cc.rotateBy(0.3, 360);
            actionOffFromScreen = cc.MoveTo.create(0.5, cc.p(1200, this.flashCardBaseFront.getPosition().y));
        }

        let customFunc = cc.callFunc(function(){
            if (magicHat_1.ref.currentCard != null) {
                let mSprite = new cc.Sprite(magicHat_1.resourcePath + imageName);
                magicHat_1.ref.currentCard.setTexture(mSprite.getTexture());
                magicHat_1.ref.currentCard.setPosition(magicHat_1.ref.flashCardBaseFront.getPosition());
                magicHat_1.ref.currentCard.setScale(0.0);
            }
        });
        if(this.currentCard == null) {
            this.currentCard = this.addSprite(magicHat_1.resourcePath + imageName,this.flashCardBaseFront.getPosition(), this);
            this.currentCard.tag = magicHat_1.Tag.currentCard;
            this.currentCard.setScale(0.0);
            this.currentCard.setLocalZOrder(2); //2
        }

        let movementActions = actionOffFromScreen != null ? [addAnswerCard, actionOffFromScreen, customFunc] : [addAnswerCard, customFunc];

        let actionScale = cc.scaleTo(2.0,0.3,0.3);
        let actionMove1 = cc.bezierTo(2.0, animationObj.animationPath).easing(cc.easeBounceIn());
        let actionMove = cc.spawn([actionMove1, actionScale]);

        let playGlowAnimation = cc.callFunc(function(){
            cc.audioEngine.playEffect(magicHat_1.soundPath + magicHat_1.config.animation.flashCardGlow.sound);

            let animation = HDUtility.runFrameAnimation(magicHat_1.animationPath+"cardTakeOut/magicHat_cardTakeOut_", magicHat_1.config.animation.flashCardGlow.frameCount, 0.1, ".png", 1);
            let baseAnimationSprite = magicHat_1.ref.flashCardBaseFront.getChildByTag(magicHat_1.Tag.animation);
            baseAnimationSprite.stopAllActions();
            baseAnimationSprite.setVisible(true);
            baseAnimationSprite.runAction(animation);
        });


        let spawnAction = cc.spawn([actionMove, playGlowAnimation]);
        movementActions.push(spawnAction);

        let scaleX = cc.scaleTo(0.1, 0.2, 0.2);
        movementActions.push(scaleX);

        let scaleXY = this.getReducedSize(this.winSize.width) / this.currentCard._contentSize.width;
        let scaleSize = cc.scaleTo(0.2, scaleXY, scaleXY);
        movementActions.push(scaleSize);

        let completedAnimation = cc.callFunc(function(){
            magicHat_1.ref.answerCard.setVisible(true);
            // To hide last sprite
            let baseAnimationSprite = magicHat_1.ref.flashCardBaseFront.getChildByTag(magicHat_1.Tag.animation);
            baseAnimationSprite.stopAllActions();
            baseAnimationSprite.setVisible(false);

            magicHat_1.ref.animationCompleted = true
            var lastIndex = magicHat_1.ref.cardQueue.length == 0 ? -1 : magicHat_1.ref.getIndexOfCurrentElement(magicHat_1.ref.cardQueue[0]);
            magicHat_1.ref.removeCardDataFromQueue(magicHat_1.ref.cardQueue[0]);
            if(lastIndex  != -1 && magicHat_1.ref.tableView) {
                magicHat_1.ref.tableView.updateCellAtIndex(lastIndex);
            }
        });
        movementActions.push(completedAnimation);
        this.currentCard.runAction(cc.sequence(movementActions));
    },

    /**
     * removeCardDataFromQueue: To remove card from queue
     * @param data
     */
    removeCardDataFromQueue: function(data) {
        for(let i = 0; i<this.cardQueue.length; i++) {
            if(this.cardQueue[i].name == data.name) {
                this.cardQueue.splice(i,1);
                break;
            }
        }
    },

    /**
     * setCardContent: This will setup table view for wheel items.
     */
    setCardContent: function () {
        let position = cc.p(this.getPositionForTableView(), 0);
        let width = this.getWidthOfCarousel();

        let baseColorLayer = this.createColourLayer(cc.color(magicHat_1.config.graphicalAssets.carouselBackground.color.r,magicHat_1.config.graphicalAssets.carouselBackground.color.g,magicHat_1.config.graphicalAssets.carouselBackground.color.b, magicHat_1.config.graphicalAssets.carouselBackground.color.a), width, this.carouselHeight, position,this,5);

        let carouselBaseImage = this.addSprite(magicHat_1.resourcePath + magicHat_1.config.graphicalAssets.carouselBackgroundImage.name,cc.p(position.x-10,position.y),this);
        carouselBaseImage.setLocalZOrder(3);
        let scaleX = (baseColorLayer._contentSize.width + 20) / carouselBaseImage._contentSize.width;
        let scaleY = (baseColorLayer._contentSize.height + 40) / carouselBaseImage._contentSize.height;
        carouselBaseImage.setScaleX(scaleX);
        carouselBaseImage.setScaleY(scaleY);
        carouselBaseImage.setAnchorPoint(0,0);

        let carouselBorderImage = this.addSprite(magicHat_1.resourcePath + magicHat_1.config.graphicalAssets.carouselBackgroundBorderImage.name,cc.p(position.x-10,position.y),this);
        carouselBorderImage.setLocalZOrder(5);
        carouselBorderImage.setScaleX(scaleX);
        carouselBorderImage.setScaleY(scaleY);
        carouselBorderImage.setAnchorPoint(0,0);

        this.tableView = new cc.TableView(this, cc.size(width, this.carouselHeight+11));
        this.tableView.setPosition(cc.p(position.x, position.y + 14));
        this.tableView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this.tableView.setBounceable(false);
        this.tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        this.tableView.setTouchEnabled(true);
        this.tableView.setDataSource(this);
        this.tableView.setDelegate(this);
        this.addChild(this.tableView,4);
    },

    /**
     * getWidthOfCarousel: This will calculate the width of tableview width.
     * @returns {number}
     */
    getWidthOfCarousel: function() {
        let cellWidthSize = this.carouselHeight * magicHat_1.config.carouselAssets.length;
        let maxWidth =  this.carouselHeight * 5;//this.winSize.width * 0.6
        if(cellWidthSize > maxWidth) {
            return maxWidth
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
        let xPos = (this.winSize.width * 0.5) - (width * 0.5);
        return xPos;
    },

    /**
     * isCellSelected: To check id cell is selected of not.
     * @param data
     * @returns {boolean}
     */
    isCellSelected: function(data) {
        for(let index in this.cardQueue) {
            if(data.name == this.cardQueue[index].name) {
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
            cardCell   =   new magicHat_1.HDCardCell(cellSize);
        }
        cardCell.tag = idx;
        cardCell.createUI(idx,magicHat_1.config.carouselAssets[idx],cardCell, this.isCellSelected(magicHat_1.config.carouselAssets[idx]));
        return cardCell;
    },

    /**
     * numberOfCellsInTableView: Return number of cell in table view.
     * @param table
     * @returns {*}
     */
    numberOfCellsInTableView: function (table) {
        return magicHat_1.config.carouselAssets.length;
    },
    /**
     * tableCellTouched: To perform action when cell is touched.
     * @param table
     * @param cell
     */
    tableCellTouched: function (table, cell) {

        cell.stopAllActions();
        let completedAnimation = cc.callFunc(function(){
            if(magicHat_1.ref.isCellSelected(cell.cellData)) {
                cell.highlightLayer.setVisible(false);
                magicHat_1.ref.removeCardDataFromQueue(cell.cellData);
                magicHat_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {'eventType': magicHat_1.socketEvents.REMOVE_CARD_FROM_QUEUE, 'data': cell.cellData});
                // SocketManager.emitCutomEvent("removeCardFromQueue",cell.cellData,null);

            } else {
                cell.highlightLayer.setVisible(true);
                var lastIndex = magicHat_1.ref.cardQueue.length == 0 ? -1 : magicHat_1.ref.getIndexOfCurrentElement(magicHat_1.ref.cardQueue[0]);
                magicHat_1.ref.addCardToQueue(cell.tag);
                if(lastIndex  != -1) {
                    magicHat_1.ref.tableView.updateCellAtIndex(lastIndex);
                }
                magicHat_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {'eventType': magicHat_1.socketEvents.ADD_CARD_TO_QUEUE, 'data': cell.tag});
                // SocketManager.emitCutomEvent("addCardToQueue",cell.tag,null);
            }
            magicHat_1.ref.updateRoomData();
        });

        cell.runAction( cc.sequence(completedAnimation, cc.scaleTo(0.1, 1.02, 1.02), cc.scaleTo(0.2,1, 1)));
    },

    /**
     * getIndexOfCurrentElement: It will provide index of data.
     * @param data
     * @returns {number}
     */
    getIndexOfCurrentElement: function(data) {
        for(var index = 0; index < magicHat_1.config.carouselAssets.length; index++) {
            if(data.name == magicHat_1.config.carouselAssets[index].name) {
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
    buttonCallback : function (sender, type) {
        let button      = sender;
        let buttonTag   = button.tag ;
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                switch(buttonTag){
                    case magicHat_1.Tag.flashCard:
                        if (this.isStudentInteractionEnable) {
                            if(this.cardQueue.length > 0) {
                                let obj = this.cardQueue[0];
                                this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {'eventType': magicHat_1.socketEvents.SHOW_FLASH_CARD, 'data': obj});
                                if(!this.isTeacher) {
                                    this.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_STUDENT,{"roomId":HDAppManager.roomId});
                                }
                            }
                        }
                            break;
                }
                break;
        }
    },

    /**
     * updateStudentTurn: This will emit event to change student turn.
     * @param userName
     */
    updateStudentTurn : function(userName) {
        if(this.isTeacher) {
            if(!userName) {
                this.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_TEACHER,{"roomId":HDAppManager.roomId, "users":[]});

            } else {
                this.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_TEACHER,{"roomId":HDAppManager.roomId, "users":[{userName: userName}]});
            }
        }
    },

    /**
     * connectSocket: This will connect call.
     */
    connectSocket : function () {
        if (SocketManager.socket == null || (!SocketManager.isSocketConnected())) {
            SocketManager.connect();
        }
    },
    /**
     * emitSocketEvent : This will emit event to server.
     * @param type - Event Type
     * @param data - Data to sent
     */
    emitSocketEvent : function(type, data){
        SocketManager.emitCutomEvent(magicHat_1.socketEventKey.singleEvent, {'eventType': type, 'roomId':HDAppManager.roomId, 'data':data});
    },

    /**
     * disableInteraction: This  will update student interaction and go button state.
     * @param enable
     */
    disableInteraction : function (enable) {
        magicHat_1.ref.isStudentInteractionEnable = enable;
    },

    /**
     * addCardToQueue: To add item to cards queue.
     * @param index
     */
    addCardToQueue : function(index) {
        let obj = magicHat_1.config.carouselAssets[index];
        if(magicHat_1.ref.cardQueue == null) {
            magicHat_1.ref.cardQueue = [];
        }
        magicHat_1.ref.cardQueue.length = 0;
        magicHat_1.ref.cardQueue.push(obj);
    },

    /**
     * removeCardFromQueue: To remove card from queue
     * @param data
     */
    removeCardFromQueue: function(data) {
        if(data != null) {
            magicHat_1.ref.cardQueue.length = 0;
        }
    },

    /**
     * showFlashCard: This will take card out from the base card.
     */
    showFlashCard: function() {
        magicHat_1.ref.moveCardOut();
    },
    /**
     * syncData: This will update game state according to current game state of other users.
     * @param data
     */
    syncData: function(data) {
        magicHat_1.ref.cardQueue.length = 0;
        magicHat_1.ref.cardQueue = data;
        if(magicHat_1.ref.isTeacher) {
            magicHat_1.ref.tableView.reloadData();
        }
    },

    /**
     * studentStatus: To manage current student list.
     * @param data
     */
    studentStatus: function (data) {
        if(magicHat_1.ref != null && magicHat_1.ref.isTeacher) {
            magicHat_1.ref.joinedStudentList = [];
            magicHat_1.ref.joinedStudentList = data;
        }
    },
    /**
     * studentTurn: This method will update user  turn.
     * @param res
     */
    studentTurn: function (res) {
        let users = res.users;
        if(!magicHat_1.ref.isTeacher) {
            if(users.length == 0) {
                magicHat_1.ref.isStudentInteractionEnable = false;
                return;
            }
            for(let index = 0; index < users.length; index++) {
                let obj = users[index];
                if(obj.userName == HDAppManager.username) {
                    magicHat_1.ref.isStudentInteractionEnable = true;
                    break;
                } else {
                    magicHat_1.ref.isStudentInteractionEnable = false;
                }
            }
        }
    },
    /**
     * updateRoomData: This will be update room data which is required for game state management.
     */
    updateRoomData: function() {
        console.log("update room data magic hat");
        SocketManager.emitCutomEvent("SingleEvent", {'eventType':HDSocketEventType.UPDATE_ROOM_DATA,'roomId': HDAppManager.roomId ,'data':  {"roomId":HDAppManager.roomId,"roomData": {"activity":  magicHat_1.config.properties.namespace,"data": magicHat_1.ref.cardQueue,  "activityStartTime" : HDAppManager.getActivityStartTime()} }},null);
    },
    /**
     * mouseControlEnable: To check if mouse is enabled or not
     * @param location
     * @returns {boolean}
     */
    mouseControlEnable: function(location) {
        magicHat_1.ref = this;
        if(magicHat_1.ref.flashCardBaseFront && cc.rectContainsPoint(magicHat_1.ref.flashCardBaseFront.getBoundingBox(), location)){
            return magicHat_1.ref.isStudentInteractionEnable && magicHat_1.ref.cardQueue.length != 0 ?  true : false;
        } else if( magicHat_1.ref.tableView && cc.rectContainsPoint(magicHat_1.ref.tableView.getBoundingBox(), location)){
            return true;
        } else {
            return false;
        }
    },
    /**
     * socketListener: This will receive all the emitted socket events.
     * @param res
     */
    socketListener : function(res){
        if(!magicHat_1.ref)
        {
            return;
        }
        switch (res.eventType) {
            case HDSocketEventType.DISABLE_INTERACTION:
                magicHat_1.ref.disableInteraction(res.data);
                break;
            case HDSocketEventType.STUDENT_STATUS:
                magicHat_1.ref.studentStatus(res.data);
                break;
            case HDSocketEventType.STUDENT_TURN:
                magicHat_1.ref.studentTurn(res.data);
                break;
            case HDSocketEventType.GAME_MESSAGE:
                magicHat_1.ref.gameEvents(res.data);
                break;
        }
    },
    /**
     * gameEvents: This will handle events specific to this game.
     * @param res
     */
    gameEvents: function (res) {
        switch ( res.eventType) {
            case magicHat_1.socketEvents.ADD_CARD_TO_QUEUE:
                magicHat_1.ref.addCardToQueue(res.data);
                break;
            case magicHat_1.socketEvents.SHOW_FLASH_CARD:
                magicHat_1.ref.showFlashCard();
                break;
            case magicHat_1.socketEvents.REMOVE_CARD_FROM_QUEUE:
                magicHat_1.ref.removeCardFromQueue(res.data);
                break;
        }
    }
});

/**
 * Card Cell
 */
magicHat_1.HDCardCell = cc.TableViewCell.extend({
    cellData            :   null,
    cellHorizontalPadding : 10,
    cellVerticalPadding :4,
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

        let colourLayer = new cc.LayerColor(cc.color(magicHat_1.config.graphicalAssets.carouselBoxBackground.color.r,magicHat_1.config.graphicalAssets.carouselBoxBackground.color.g,magicHat_1.config.graphicalAssets.carouselBoxBackground.color.b, magicHat_1.config.graphicalAssets.carouselBoxBackground.color.a), this._contentSize.width - this.cellHorizontalPadding, this._contentSize.height - this.cellVerticalPadding);
        colourLayer.setPosition(cc.p(this.cellHorizontalPadding * 0.5, this.cellVerticalPadding * 0.5));
        parent.addChild(colourLayer, 2);

        var scaleFactorX = colourLayer._contentSize.width / data.size.width;
        var scaleFactorY = colourLayer._contentSize.height / data.size.height;

        let cardElementImage = cc.Sprite.create(magicHat_1.resourcePath + data.name);
        cardElementImage.setContentSize(cc.size(colourLayer._contentSize.width, colourLayer._contentSize.height));
        cardElementImage.setPosition(this.cellHorizontalPadding * 0.5, this.cellVerticalPadding * 0.5);
        cardElementImage.setAnchorPoint(0, 0);
        cardElementImage.setScaleX(scaleFactorX);
        cardElementImage.setScaleY(scaleFactorY);
        parent.addChild(cardElementImage,3);

        let textBaseLayer = new cc.LayerColor(cc.color(magicHat_1.config.graphicalAssets.carouselBoxCardBackground.color.r,magicHat_1.config.graphicalAssets.carouselBoxCardBackground.color.g,magicHat_1.config.graphicalAssets.carouselBoxCardBackground.color.b, magicHat_1.config.graphicalAssets.carouselBoxCardBackground.color.a), this._contentSize.width - this.cellHorizontalPadding, this.cardTextHeight);
        textBaseLayer.setPosition(cc.p(this.cellHorizontalPadding * 0.5, this._contentSize.height - this.cellVerticalPadding - this.cardTextHeight));
        parent.addChild(textBaseLayer, 4);

        let labelCardText   = cc.LabelTTF.create(data.cardValue,magicHat_1.config.graphicalAssets.carouselBoxCardText.font,magicHat_1.config.graphicalAssets.carouselBoxCardText.fontSize,cc.size(0.,0),cc.TEXT_ALIGNMENT_CENTER);
        labelCardText.setPosition(cc.p(textBaseLayer._contentSize.width * 0.5,textBaseLayer._contentSize.height * 0.5));
        labelCardText.setColor(cc.color(magicHat_1.config.graphicalAssets.carouselBoxCardText.color.r,magicHat_1.config.graphicalAssets.carouselBoxCardText.color.g,magicHat_1.config.graphicalAssets.carouselBoxCardText.color.b,magicHat_1.config.graphicalAssets.carouselBoxCardText.color.a));
        textBaseLayer.addChild(labelCardText,5);

        this.highlightLayer = new cc.LayerColor(cc.color(magicHat_1.config.graphicalAssets.carouselBoxHighlight.color.r,magicHat_1.config.graphicalAssets.carouselBoxHighlight.color.g,magicHat_1.config.graphicalAssets.carouselBoxHighlight.color.b, magicHat_1.config.graphicalAssets.carouselBoxHighlight.color.a), this._contentSize.width , this._contentSize.height);
        this.highlightLayer.setPosition(cc.p(this.cellHorizontalPadding * 0.5, this.cellVerticalPadding * 0.5));
        parent.addChild(this.highlightLayer, 10);

        if(isSelected) {
            this.highlightLayer.setVisible(true);
        } else {
            this.highlightLayer.setVisible(false);
        }
    },
});