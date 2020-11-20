var ACTIVITY_GFTG_1 = {};
ACTIVITY_GFTG_1.Tag = {
    PotInitial : 100,
}
ACTIVITY_GFTG_1.socketEventKey = {
    CLEAR: 1,
    DRAG_WATER_CAN: 2,
    WATER_CAN_ANIMATION: 3,
    SHOW_OBJECT: 4,
    STOP_WATER_CAN_ANIMATION:5
}
ACTIVITY_GFTG_1.PotStatus =  {
    Empty: 0,
    Filled: 1,
}
ACTIVITY_GFTG_1.ref = null;
ACTIVITY_GFTG_1.GftgLayer = HDBaseLayer.extend({
    isTeacherView: false,
    interactableObject:null,
    waterCan : null,
    potAnimation : null,
    handIconUI :[],
    hiddenObjects: [],
    syncDataInfo: [],
    ctor: function () {
        this._super();
    },

    onEnter: function () {
        this._super();
        ACTIVITY_GFTG_1.ref = this;
        let activityName = 'ACTIVITY_GFTG_1';
        cc.loader.loadJson("res/Activity/" + activityName + "/config.json", function (error, config) {
            ACTIVITY_GFTG_1.config = config;
            ACTIVITY_GFTG_1.resourcePath = "res/Activity/" + "" + activityName + "/res/"
            ACTIVITY_GFTG_1.soundPath = ACTIVITY_GFTG_1.resourcePath + "Sound/";
            ACTIVITY_GFTG_1.animationBasePath = ACTIVITY_GFTG_1.resourcePath + "AnimationFrames/";
            ACTIVITY_GFTG_1.spriteBasePath = ACTIVITY_GFTG_1.resourcePath + "Sprite/";
            ACTIVITY_GFTG_1.ref.isTeacherView = HDAppManager.isTeacherView;

            ACTIVITY_GFTG_1.ref.setupUI();
            if (ACTIVITY_GFTG_1.ref.isTeacherView) {
                ACTIVITY_GFTG_1.ref.updateRoomData();
                ACTIVITY_GFTG_1.ref.isStudentInteractionEnable = true;
            }
            // ACTIVITY_GFTG_1.ref.triggerTip(config.teacherTips.moduleStart);
        });

    },

    onExit: function () {
        this._super();
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            "eventType": ACTIVITY_GFTG_1.socketEventKey.CLEAR
        });

       ACTIVITY_GFTG_1.ref.syncDataInfo.length = 0;
        ACTIVITY_GFTG_1.ref.removeAllChildrenWithCleanup(true);
        ACTIVITY_GFTG_1.ref.customTexture = false;
        ACTIVITY_GFTG_1.ref.interactableObject = false;
        ACTIVITY_GFTG_1.ref.removeAllChildrenWithCleanup(true);
        ACTIVITY_GFTG_1.ref = null;
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
     //BG
     this.setBackground( ACTIVITY_GFTG_1.spriteBasePath+ "bg.png");
     this.setPot();
     this.setWaterCan();
     this.setPotAnimation();
     this.updateWithSyncData();
     this.triggerScript(ACTIVITY_GFTG_1.config.teacherScripts.data.moduleStart.content.ops);
    },
    setPot : function (){
        let initialX = this.getContentSize().width * 0.12;
        let initialY = this.getContentSize().height * 0.27;
        let spacingFactor = 1.05;
        let imgArr =  ACTIVITY_GFTG_1.config.assets.sections.arrayOfAssets.data;
        console.log("imgArr ", imgArr);
      for(let i = 1; i <= imgArr.length; ++i){
          console.log( i, " ", imgArr[i - 1])
          let frontSprite = this.addSprite( ACTIVITY_GFTG_1.spriteBasePath + imgArr[i - 1].image_1, cc.p(0, 0), this);
          frontSprite.setScale(0.5);
          frontSprite.setPosition(((i - 1) *frontSprite.getContentSize().width * spacingFactor * frontSprite.getScale()) + initialX, initialY );
          frontSprite.setLocalZOrder(12);

          let backSprite = this.addSprite( ACTIVITY_GFTG_1.spriteBasePath + imgArr[i - 1].image_2, cc.p(0, 0), this);
          backSprite.setTag(ACTIVITY_GFTG_1.Tag.PotInitial + i );
          backSprite.setLocalZOrder(10);
          backSprite.status = ACTIVITY_GFTG_1.PotStatus.Empty;
          backSprite.setScale(0.5);
          this.handIconUI.push(backSprite);
          backSprite.setPosition(((i - 1) *backSprite.getContentSize().width * spacingFactor * backSprite.getScale()) + initialX, initialY );
      }
    },

    setWaterCan : function(){
        this.waterCan = this.addSprite( ACTIVITY_GFTG_1.spriteBasePath + "cursor_watercan_idle.png",
            cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5 ), this);
        this.waterCan.setLocalZOrder(15);

    },

    runWaterCanAnimation : function (){
        let animation = HDUtility.runFrameAnimation( ACTIVITY_GFTG_1.animationBasePath + "cursor_watercan_animation/cursor_watercan_", 3, 0.08, ".png", 1000 );
        this.waterCan.runAction( animation);
        this.checkSelectedPot();
    },

    stopWaterCanAnimation : function (){
        console.log(" stop water can animation called.");
        this.waterCan.stopAllActions();
        this.stopPotAnimation();
        this.waterCan.setTexture( new cc.Sprite(ACTIVITY_GFTG_1.spriteBasePath + "cursor_watercan_idle.png").getTexture() );
    },

    checkSelectedPot :function (){
        let waterCanX = this.waterCan.getPositionX()  - this.waterCan.getContentSize().width * 0.5;
        let waterCanY = this.waterCan.getPositionY()  - this.waterCan.getContentSize().height * 0.5;
        for(let i = 1; i <= ACTIVITY_GFTG_1.config.assets.sections.arrayOfAssets.data.length ; ++i){
            let pot  = this.getChildByTag( ACTIVITY_GFTG_1.Tag.PotInitial + i );
            // console.log("=============== " + i + "==============================");
             if( (Math.abs(pot.getPositionX() - waterCanX )  <= pot.getContentSize().width * 0.25)  &&
                 (pot.status == ACTIVITY_GFTG_1.PotStatus.Empty) &&
                 (pot.getPositionY()  < waterCanY) ) {
                 this.runPotAnimation(pot.getTag());
                 if (this.isStudentInteractionEnable) {
                     setTimeout((tag) => {
                         if (ACTIVITY_GFTG_1.ref.potAnimation.getNumberOfRunningActions() > 0) {
                             let pot = ACTIVITY_GFTG_1.ref.getChildByTag(tag);
                             if (pot &&
                                 (Math.abs(pot.getPositionX() - ACTIVITY_GFTG_1.ref.potAnimation.getPositionX()) < 5)
                             ) {
                                 ACTIVITY_GFTG_1.ref.showObject(tag)
                                 ACTIVITY_GFTG_1.ref.emitSocketEvent( HDSocketEventType.GAME_MESSAGE, {"eventType": ACTIVITY_GFTG_1.socketEventKey.SHOW_OBJECT, "data":{'tag':tag} }   );
                                 if (!ACTIVITY_GFTG_1.ref.isTeacherView &&  ACTIVITY_GFTG_1.ref.isStudentInteractionEnable) {
                                     ACTIVITY_GFTG_1.ref.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_STUDENT, {"roomId": HDAppManager.roomId});
                                 }
                             }

                         }
                     }, 2000, pot.getTag());
                 }
                 break;
             }
         }
    },
    setPotAnimation : function (){
        this.potAnimation = this.addSprite( ACTIVITY_GFTG_1.animationBasePath + "watering_effect_animation/watering_0001.png",
            cc.p(0,0 ), this);
        this.potAnimation.setVisible(false);
        this.potAnimation.setScale(0.4);
        this.potAnimation.setLocalZOrder(12);
    },

    runPotAnimation : function (tag){
        console.log(" run Pot animation ", tag);
        let pot = this.getChildByTag(tag);
        let pos = cc.p(pot.getPositionX(), pot.getPositionY() + pot.getContentSize().height * 0.45 * pot.getScale())
        this.potAnimation.setPosition(pos);
        this.potAnimation.setVisible(true);
        let animation = HDUtility.runFrameAnimation( ACTIVITY_GFTG_1.animationBasePath + "watering_effect_animation/watering_", "3", 0.08, ".png", 1000 );
        this.potAnimation.runAction(animation);
    },

    stopPotAnimation : function (){
      this.potAnimation.stopAllActions();
      this.potAnimation.setVisible(false);
    },


    showObject : function (tag) {
        let obj = this.getChildByTag(tag);
        if(obj && obj.status != ACTIVITY_GFTG_1.PotStatus.Empty)
            return;
        if(this.isTeacherView){
            this.syncDataInfo.push(tag);
            this.updateRoomData();
        }
        this.parent.setResetButtonActive(true);

        let index = tag - ACTIVITY_GFTG_1.Tag.PotInitial - 1;
        let sp = this.addSprite(ACTIVITY_GFTG_1.spriteBasePath + ACTIVITY_GFTG_1.config.assets.sections.arrayOfAssets.data[index].image_3,
            cc.p(obj.getPositionX(), obj.getPositionY() + obj.getContentSize().height * 0.18), this);
        sp.setLocalZOrder(11);
        sp.setAnchorPoint(0.5, 0);
        sp.setScale(0);
        this.hiddenObjects.push(sp);
        sp.runAction(cc.sequence(cc.scaleTo(0.25, 0.5, 1.25), cc.scaleTo(0.25, 1, 1)));
        obj.status = ACTIVITY_GFTG_1.PotStatus.Filled;
        this.stopWaterCanAnimation();
    },
    reset : function (){
      this.restart();
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            "eventType": ACTIVITY_GFTG_1.socketEventKey.CLEAR
        });
    },
    restart : function (){
        this.hiddenObjects.forEach( x=>x.removeFromParent(true));
        for(let i = 1; i <= ACTIVITY_GFTG_1.config.assets.sections.arrayOfAssets.data.length ; ++i){
            this.getChildByTag(ACTIVITY_GFTG_1.Tag.PotInitial + i).status = ACTIVITY_GFTG_1.PotStatus.Empty;
        }
        this.syncDataInfo.length = 0;
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
                    "activity": ACTIVITY_GFTG_1.config.properties.namespace,
                    "data": ACTIVITY_GFTG_1.ref.syncDataInfo,
                    "activityStartTime": HDAppManager.getActivityStartTime()
                }
            }
        }, null);
    },

    updateStudentInteraction: function (username, status) {
        if (this.isTeacherView) {
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                "eventType": ACTIVITY_GFTG_1.socketEventKey.STUDENT_INTERACTION,
                "data": {"userName": username, "status": status}
            });
        }
    },

    onUpdateStudentInteraction: function (params) {
        if (params.userName == HDAppManager.username) {
            ACTIVITY_GFTG_1.ref.isStudentInteractionEnable = params.status;
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
        if (!ACTIVITY_GFTG_1.ref.isStudentInteractionEnable)
            return;
        ACTIVITY_GFTG_1.ref.moveWaterCan(ACTIVITY_GFTG_1.ref.convertToNodeSpace(event.getLocation()));
        this.runWaterCanAnimation();
        this.emitSocketEvent( HDSocketEventType.GAME_MESSAGE, {"eventType": ACTIVITY_GFTG_1.socketEventKey.WATER_CAN_ANIMATION }   );
    },

    onMouseUp: function (event) {
        if (!ACTIVITY_GFTG_1.ref.isStudentInteractionEnable)
            return;
        if(ACTIVITY_GFTG_1.ref.waterCan.getNumberOfRunningActions() > 0){
            ACTIVITY_GFTG_1.ref.stopWaterCanAnimation();
                this.emitSocketEvent( HDSocketEventType.GAME_MESSAGE, {"eventType": ACTIVITY_GFTG_1.socketEventKey.STOP_WATER_CAN_ANIMATION }   );
        }
    },

    onMouseMove: function (event) {
        ACTIVITY_GFTG_1.ref.updateMouseIcon(event.getLocation());
        if (!ACTIVITY_GFTG_1.ref.isStudentInteractionEnable)
            return;
        if(ACTIVITY_GFTG_1.ref.waterCan.getNumberOfRunningActions() > 0){
            ACTIVITY_GFTG_1.ref.stopWaterCanAnimation();
            if(this.isStudentInteractionEnable){
                this.emitSocketEvent( HDSocketEventType.GAME_MESSAGE, { "eventType": ACTIVITY_GFTG_1.socketEventKey.STOP_WATER_CAN_ANIMATION } );
            }
        }
        ACTIVITY_GFTG_1.ref.moveWaterCan(ACTIVITY_GFTG_1.ref.convertToNodeSpace(event.getLocation()));
        if(this.isStudentInteractionEnable){
                this.emitSocketEvent( HDSocketEventType.GAME_MESSAGE, { "eventType": ACTIVITY_GFTG_1.socketEventKey.DRAG_WATER_CAN, "data": { "position": ACTIVITY_GFTG_1.ref.convertToNodeSpace(event.getLocation())  } } );
        }
    },
    moveWaterCan : function (pos){
        let waterPot = this.getChildByTag( ACTIVITY_GFTG_1.Tag.PotInitial + 1 );
        // if( pos.y >  this.getContentSize().height * 0.7 || (waterPot && pos.y < waterPot.getPositionY() + waterPot.getContentSize().height * 0.6 )  ){
        //     this.interactableObject = false;
        //     return;
        // }
        this.interactableObject = true;
        // this.waterCan.setPosition( cc.p(pos.x, pos.y));
        this.waterCan.setPosition( cc.p( HDUtility.clampANumber(pos.x, this.getContentSize().width * 0.1, this.getContentSize().width * 0.9),
          HDUtility.clampANumber(pos.y, 0, this.getContentSize().height * 0.75)));

    },
    socketListener: function (res) {
        if (!ACTIVITY_GFTG_1.ref)
            return;
        switch (res.eventType) {
            case HDSocketEventType.DISABLE_STUDENT_INTERACTION:
                break;
            case HDSocketEventType.DISABLE_INTERACTION:
                ACTIVITY_GFTG_1.ref.disableInteraction(res.data);
                break;
            case HDSocketEventType.RECEIVE_GRADES:
                break;
            case HDSocketEventType.STUDENT_STATUS:
                ACTIVITY_GFTG_1.ref.studentStatus(res.data);
                break;
            case HDSocketEventType.STUDENT_TURN:
                ACTIVITY_GFTG_1.ref.studentTurn(res.data);
                break;
            case HDSocketEventType.GAME_MESSAGE:
                if (res.data.userName == HDAppManager.username || !ACTIVITY_GFTG_1.ref)
                    return;
                ACTIVITY_GFTG_1.ref.gameEvents(res.data);
                break;
        }
    },

    disableInteraction: function (enable) {
        this.isStudentInteractionEnable = enable;
    },

    studentTurn: function (res) {
        console.log("GfTG Student Turn ", res);
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
        cc.log(userName);
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
        if (this.isTeacherView) {
            this.joinedStudentList = [];
            this.joinedStudentList = data;
        }

    },

    gameEvents: function (res) {
        if (!ACTIVITY_GFTG_1.ref)
            return;
        switch (res.eventType) {
            case ACTIVITY_GFTG_1.socketEventKey.CLEAR:
                 if(!this.isTeacherView){
                     this.restart();
                 }
            case ACTIVITY_GFTG_1.socketEventKey.DRAG_WATER_CAN:
                   if(res && res.data && res.data.position) {
                       this.moveWaterCan(res.data.position);
                   }
                break;
            case ACTIVITY_GFTG_1.socketEventKey.SHOW_OBJECT:
                    this.showObject(res.data.tag);
                break;
            case ACTIVITY_GFTG_1.socketEventKey.WATER_CAN_ANIMATION:
                    this.runWaterCanAnimation();
                break;
            case ACTIVITY_GFTG_1.socketEventKey.STOP_WATER_CAN_ANIMATION:
                this.stopWaterCanAnimation();
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
        console.log("sync data ", data);
        ACTIVITY_GFTG_1.ref.syncDataInfo = data;
    },
    updateWithSyncData : function (){
        ACTIVITY_GFTG_1.ref.syncDataInfo.forEach( x=> ACTIVITY_GFTG_1.ref.showObject(x) );
    },


    buttonCallback: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                switch (sender.getTag()) {

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
        return {'hasCustomTexture': this.interactableObject, 'textureUrl': 'none'};
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
            if (obj && obj.getParent() && cc.rectContainsPoint(obj.getBoundingBox(), obj.getParent().convertToNodeSpace(location))) {
                handICon = true;
                break;
            }
        }
        if (handICon) {
            this.interactableObject = true;
            this.customTexture = true;
        }
    },
});
