var ACTIVITY_EWG_1 = {};
ACTIVITY_EWG_1.Tag = {
    FrameObj : 10,
    Projector: 100,
    Machine: 101,
}
ACTIVITY_EWG_1.socketEventKey = {
    SELECT: 1,
    MOVE: 2,
    PLACED: 3,
    CLEAR: 4,
}

ACTIVITY_EWG_1.frameStatus = {
    Empty: 0,
    Filled: 1
}

ACTIVITY_EWG_1.ref = null;
ACTIVITY_EWG_1.EwgLayer = HDBaseLayer.extend({
    isTeacherView: false,
    customTexture:true,
    MouseTextureUrl:"",
    interactableObject: true,
    sideBarItem : [],
    itemFrame: [],
    placeItemName: [],
    handIconUI: [],
    itemDropped : false,
    syncInfo: [],
    blueLightIntervalId: null,

    ctor: function () {
        this._super();
    },

    onEnter: function () {
        this._super();
        ACTIVITY_EWG_1.ref = this;
        let activityName = 'ACTIVITY_EWG_1';
        cc.loader.loadJson("res/Activity/" + activityName + "/config.json", function (error, config) {
            ACTIVITY_EWG_1.config = config;
            ACTIVITY_EWG_1.resourcePath = "res/Activity/"+ "" + activityName + "/res/"
            ACTIVITY_EWG_1.soundPath = ACTIVITY_EWG_1.resourcePath + "Sound/";
            ACTIVITY_EWG_1.animationBasePath = ACTIVITY_EWG_1.resourcePath + "AnimationFrames/";
            ACTIVITY_EWG_1.spriteBasePath = ACTIVITY_EWG_1.resourcePath + "Sprite/";
            ACTIVITY_EWG_1.ref.isTeacherView = HDAppManager.isTeacherView;
            ACTIVITY_EWG_1.ref.MouseTextureUrl = ACTIVITY_EWG_1.spriteBasePath + config.cursors.data.cursor.imageName;
            ACTIVITY_EWG_1.ref.setupUI();
            if (ACTIVITY_EWG_1.ref.isTeacherView) {
                ACTIVITY_EWG_1.ref.updateRoomData();
                ACTIVITY_EWG_1.ref.isStudentInteractionEnable = true;
            }

            // ACTIVITY/_EWG_1.ref.triggerTip(config.teacherTips.moduleStart);
        });
    },

    fetchGameData: function () {
        HDNetworkHandler.get(HDAPIKey.GameData, {"roomId": HDAppManager.roomId}, true, (err, res) => {
        });
    },

    onExit: function () {
        this._super();
        ACTIVITY_EWG_1.ref.clear();
        ACTIVITY_EWG_1.ref.itemFrame.length = 0;
        ACTIVITY_EWG_1.ref.removeAllChildrenWithCleanup(true);
        ACTIVITY_EWG_1.ref.customTexture = false;
        ACTIVITY_EWG_1.ref.interactableObject = false;
        ACTIVITY_EWG_1.ref = null;
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

    setupUI: function () {
        //BG
        this.setBackground( ACTIVITY_EWG_1.spriteBasePath + "bg.png" );

        // SideBar
        this.setSideBar();

        //setItemFrame
        this.setItmFrame();

        this.updateSyncInfo();
    },

    setSideBar : function (){
     let imgInfo =  ACTIVITY_EWG_1.config.assets.sections.arrayOfAssets.data;
     let yInitial = this.getContentSize().height * 0.8;
     for(let i = 0; i < imgInfo.length; ++i ){
        let  sp = this.addSprite(ACTIVITY_EWG_1.animationBasePath + "sidebar_item_box/sidebar_item_box_0001.png",
            cc.p(this.getContentSize().width * 0.065, yInitial ), this);
        sp.setAnchorPoint(0.5, 0.5);
        sp.runAction( this.runSideBarAnimation() );
        sp.name = imgInfo[i].imageName;
        let obj = this.addSprite( ACTIVITY_EWG_1.spriteBasePath + imgInfo[i].imageName,
            cc.p(sp.getContentSize().width * 0.6, sp.getContentSize().height * 0.5 ), sp )
        yInitial -= sp.getContentSize().height;
        obj.setScale(0.25);
        this.sideBarItem.push(sp);
     }
    },
    setItmFrame : function (){
        let posX = [0.33, 0.52, 0.715];
        let posY = [0.15, 0.21, 0.15];
        let topY = [1.13, 1.15, 1.13];
        for(let i = 0; i < 3; ++i) {
            let bottom = this.addSprite(ACTIVITY_EWG_1.spriteBasePath + "frame_bottom.png",
                cc.p(this.getContentSize().width * posX[i],  this.getContentSize().height * posY[i]), this);
            let top =  this.addSprite(ACTIVITY_EWG_1.spriteBasePath + "frame_top_lights_off.png",
                cc.p(bottom.getContentSize().width * 0.5, bottom.getContentSize().height*topY[i]), bottom);
            bottom.top = top;
            bottom.status = ACTIVITY_EWG_1.frameStatus.Empty;
            this.itemFrame.push(bottom);

        }
    },

    selectObj  : function (pos, userName = HDAppManager.username){
        let name= null;
        for(let item of this.sideBarItem){
            if( cc.rectContainsPoint( item.getBoundingBox(), cc.p( pos.x, pos.y))){
                name  = item.name;
                break;
            }
        }
        if(!name || this.getChildByName(userName)){
            return;
        }
        let bg =  this.addSprite(ACTIVITY_EWG_1.animationBasePath + "item_box/item_box_0001.png",
           cc.p(pos.x, pos.y), this);
        bg.setName(userName);
        bg.itemName = name;
        bg.initialPos = bg.getPosition();
        let item = this.addSprite(ACTIVITY_EWG_1.spriteBasePath + name,
            cc.p(bg.getContentSize().width * 0.5, bg.getContentSize().height * 0.5), bg);
        item.setScale(0.25);
    },

    moveObj  : function (pos, userName = HDAppManager.username){
       let item = this.getChildByName( userName );
       if(item && !item.returning){
           item.setPosition( cc.p(pos.x, pos.y) );
       }
    },

    placeObj  : function (pos, userName = HDAppManager.username){
        let frame = null;
        for(let item of this.itemFrame){
            if( cc.rectContainsPoint( item.getBoundingBox(), cc.p( pos.x, pos.y))){
                frame = item;
                break;
            }
        }
        let sp  = this.getChildByName(userName );
        if(!frame || frame.status ==  ACTIVITY_EWG_1.frameStatus.Filled){
            let sp  = this.getChildByName(userName );
            if(sp)
            {
                sp.returning = true;
                sp.runAction( cc.sequence( cc.moveTo( 0.5, sp.initialPos), cc.removeSelf()) );
                // sp.removeFromParent(true);
            }
            return;
        }
        if(sp) {
            sp.removeFromParent();
            frame.addChild(sp, 100);
            this.parent.setResetButtonActive(true);
            sp.setTag( ACTIVITY_EWG_1.Tag.FrameObj);
            this.placeItemName.push(sp.itemName);
            sp.setPosition( frame.getContentSize().width * 0.5, frame.getContentSize().height * 0.55 )
            sp.runAction( this.runItemBoxAnimation() );
            frame.status =  ACTIVITY_EWG_1.frameStatus.Filled;
            frame.top.setTexture( new cc.Sprite( ACTIVITY_EWG_1.spriteBasePath + "frame_top_lights_on.png" ).getTexture()  );
            this.syncInfo.push({ "frameIndex": this.itemFrame.indexOf(frame), "userName": userName, "itemName": sp.itemName });
            if(this.isTeacherView) {
                this.updateRoomData();
            }
        }
        if(this.placeItemName.length == 3){
            this.runWinAnimation();
        }
    },

    reset : function (){
        this.emitSocketEvent( HDSocketEventType.GAME_MESSAGE, {'eventType': ACTIVITY_EWG_1.socketEventKey.CLEAR} );
        this.clear();
        this.parent.setResetButtonActive(false);
    },

    clear: function (){
        this.placeItemName.length = 0;
        for(let frame of this.itemFrame){
            frame.status = ACTIVITY_EWG_1.frameStatus.Empty;
            frame.top.setTexture( new cc.Sprite( ACTIVITY_EWG_1.spriteBasePath + "frame_top_lights_off.png" ).getTexture()  );
            let obj = frame.getChildByTag(ACTIVITY_EWG_1.Tag.FrameObj);
            if(obj)
                obj.removeFromParent(true);
            this.removeWinAnimation();
        }
        this.removeBlueSprite();
        clearTimeout(this.blueLightIntervalId);
        this.syncInfo.length = 0;
        if (!this.isTeacherView && this.isStudentInteractionEnable) {
            this.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_STUDENT, {"roomId": HDAppManager.roomId});
        }
    },


    runSideBarAnimation : function (){
        let animation = HDUtility.runFrameAnimation( ACTIVITY_EWG_1.animationBasePath + "sidebar_item_box/sidebar_item_box_", 22, 0.08, ".png", 1000 );
        return animation;
    },

    runItemBoxAnimation : function (){
        let animation = HDUtility.runFrameAnimation( ACTIVITY_EWG_1.animationBasePath + "item_box/item_box_", 22, 0.08, ".png", 1000 );
        return animation;
    },

    runWinAnimation : function (){

        // Win Animation
        let sprite = this.addSprite(ACTIVITY_EWG_1.animationBasePath + "win/win_animation_0001.png",
            cc.p(this.getContentSize().width * 0.595, this.getContentSize().height * 0.655), this );
        let animation = HDUtility.runFrameAnimation( ACTIVITY_EWG_1.animationBasePath + "win/win_animation_", 3, 0.08, ".png", 1000 );
       sprite.runAction( animation );
       sprite.setTag( ACTIVITY_EWG_1.Tag.Machine );

       // projector
        let projector = this.addSprite(ACTIVITY_EWG_1.spriteBasePath + "win_screen_0" + Math.ceil(Math.random() + 1) + ".png",
            cc.p(this.getContentSize().width * 0.5, this.getContentSize().height* 0.7 ), this );
        let  blueLayer = this.addBlueLight(cc.p(projector.getPositionX()  , projector.getPositionY() ));
        this.runBlueLightAnimation(blueLayer);

        let posX = [0.20, 0.5, 0.75];
        let posY = [0.4, 0.45, 0.55];
        projector.setTag( ACTIVITY_EWG_1.Tag.Projector );

        for(let i = 0; i < this.placeItemName.length; ++i){
            let sp = this.addSprite( ACTIVITY_EWG_1.spriteBasePath + this.placeItemName[i],
                cc.p( projector.getContentSize().width * posX[i], projector.getContentSize().height * posY[i]  ), projector);
            sp.setScale(0.5);
        }
    },

    addBlueLight : function( position){
       this.blueLight = this.addSprite( ACTIVITY_EWG_1.spriteBasePath + "blue_light.png",
            position, this);
        this.blueLight.setLocalZOrder(20);
        return  this.blueLight;
    },

    runBlueLightAnimation : function (){
      let opacity  = Math.random()* 30;
      let timeOut = Math.random() * 200;
      if(!ACTIVITY_EWG_1.ref || !ACTIVITY_EWG_1.ref.blueLight){
          return;
      }
      ACTIVITY_EWG_1.ref.blueLight.setOpacity( opacity );
      ACTIVITY_EWG_1.ref.blueLightIntervalId = setTimeout(ACTIVITY_EWG_1.ref.runBlueLightAnimation, timeOut);
    },

    removeBlueSprite : function (){
      //
        if( ACTIVITY_EWG_1.ref.blueLight) {
            ACTIVITY_EWG_1.ref.blueLight.removeFromParent(true);
        }
      //
    },

    removeWinAnimation : function (){
        let projector = this.getChildByTag( ACTIVITY_EWG_1.Tag.Projector );
        let machine = this.getChildByTag( ACTIVITY_EWG_1.Tag.Machine );
        if(projector){
            projector.removeAllChildrenWithCleanup(true);
            projector.removeFromParent(true);
        }
        if(machine){
            machine.removeFromParent(true);
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
        SocketManager.emitCutomEvent("SingleEvent", {
            'eventType': HDSocketEventType.UPDATE_ROOM_DATA,
            'roomId': HDAppManager.roomId,
            'data': {
                "roomId": HDAppManager.roomId,
                "roomData": {
                    "activity": ACTIVITY_EWG_1.config.properties.namespace,
                    "data": ACTIVITY_EWG_1.ref.syncInfo,
                    "activityStartTime": HDAppManager.getActivityStartTime()
                }
            }
        }, null);
    },

    updateStudentInteraction: function (username, status) {
        if (this.isTeacherView) {
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                "eventType": ACTIVITY_EWG_1.socketEventKey.STUDENT_INTERACTION,
                "data": {"userName": username, "status": status}
            });
        }
    },

    onUpdateStudentInteraction: function (params) {
        if (params.userName == HDAppManager.username) {
            ACTIVITY_EWG_1.ref.isStudentInteractionEnable = params.status;
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
        if (!ACTIVITY_EWG_1.ref.isStudentInteractionEnable || !this.itemDropped)
            return;
        this.itemDropped = false;
        this.emitSocketEvent( HDSocketEventType.GAME_MESSAGE, {'eventType': ACTIVITY_EWG_1.socketEventKey.SELECT, 'data': {
            "pos": ACTIVITY_EWG_1.ref.convertToNodeSpace(event.getLocation()), "userName": HDAppManager.username
            }} );
        this.selectObj( ACTIVITY_EWG_1.ref.convertToNodeSpace(event.getLocation()));
    },

    onMouseUp: function (event) {
        if (!ACTIVITY_EWG_1.ref.isStudentInteractionEnable)
            return;
        this.emitSocketEvent( HDSocketEventType.GAME_MESSAGE, {'eventType': ACTIVITY_EWG_1.socketEventKey.PLACED, 'data': {
                "pos": ACTIVITY_EWG_1.ref.convertToNodeSpace(event.getLocation()), "userName": HDAppManager.username
            }} );
        this.placeObj(ACTIVITY_EWG_1.ref.convertToNodeSpace(event.getLocation()));
        this.itemDropped = true;
    },

    onMouseMove: function (event) {
        ACTIVITY_EWG_1.ref.updateMouseIcon(event.getLocation());
        if (!ACTIVITY_EWG_1.ref.isStudentInteractionEnable)
            return;
        this.emitSocketEvent( HDSocketEventType.GAME_MESSAGE, {'eventType': ACTIVITY_EWG_1.socketEventKey.MOVE, 'data': {
                "pos": ACTIVITY_EWG_1.ref.convertToNodeSpace(event.getLocation()), "userName": HDAppManager.username
            }} );
        ACTIVITY_EWG_1.ref.moveObj(event.getLocation());
    },
    socketListener: function (res) {
        if (!ACTIVITY_EWG_1.ref)
            return;
        switch (res.eventType) {
            case HDSocketEventType.DISABLE_STUDENT_INTERACTION:
                break;
            case HDSocketEventType.DISABLE_INTERACTION:
                ACTIVITY_EWG_1.ref.disableInteraction(res.data);
                break;
            case HDSocketEventType.RECEIVE_GRADES:
                break;
            case HDSocketEventType.STUDENT_STATUS:
                ACTIVITY_EWG_1.ref.studentStatus(res.data);
                break;
            case HDSocketEventType.STUDENT_TURN:
                ACTIVITY_EWG_1.ref.studentTurn(res.data);
                break;
            case HDSocketEventType.GAME_MESSAGE:
                if (res.data.userName == HDAppManager.username || !ACTIVITY_EWG_1.ref)
                    return;
                ACTIVITY_EWG_1.ref.gameEvents(res.data);
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

    studentStatus: function (data) {
        if (this.isTeacherView) {
            this.joinedStudentList = [];
            this.joinedStudentList = data;
        }

    },

    gameEvents: function (res) {
        if (!ACTIVITY_EWG_1.ref)
            return;
        switch (res.eventType) {
            case ACTIVITY_EWG_1.socketEventKey.CLEAR:
                this.clear();
                break;
            case ACTIVITY_EWG_1.socketEventKey.MOVE:
                if(res && res.data && res.data.pos && res.data.userName)
                this.moveObj( res.data.pos, res.data.userName);
                break;
            case ACTIVITY_EWG_1.socketEventKey.PLACED:
                if(res && res.data && res.data.pos && res.data.userName)
                this.placeObj(res.data.pos, res.data.userName);
                break;
            case ACTIVITY_EWG_1.socketEventKey.SELECT:
                if(res && res.data && res.data.pos && res.data.userName)
                this.selectObj(res.data.pos, res.data.userName);
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
        ACTIVITY_EWG_1.ref.syncDataInfo = data;
    },

     updateSyncInfo :  function (){
        // { "frameIndex": this.itemFrame.indexOf(frame), "userName": userName, "itemName": sp.itemName }
         if( ACTIVITY_EWG_1.ref.syncDataInfo ) {
             for (let obj of ACTIVITY_EWG_1.ref.syncDataInfo) {
                 let frame = this.itemFrame[obj.frameIndex];
                 let bg =  this.addSprite(ACTIVITY_EWG_1.animationBasePath + "item_box/item_box_0001.png",
                     cc.p(0, 0), frame);
                 bg.setName(obj.userName);
                 bg.itemName = obj.itemName;
                 bg.initialPos = bg.getPosition();
                 let item = this.addSprite(ACTIVITY_EWG_1.spriteBasePath + obj.itemName,
                     cc.p(bg.getContentSize().width * 0.5, bg.getContentSize().height * 0.5), bg);
                 item.setScale(0.25);
                 if (frame && bg) {
                     this.parent.setResetButtonActive(true);
                     bg.setTag(ACTIVITY_EWG_1.Tag.FrameObj);
                     this.placeItemName.push(bg.itemName);
                     // console.log(" frame ", frame.getContentSize().width)
                     bg.setPosition(frame.getContentSize().width * 0.5, frame.getContentSize().height * 0.55)
                     bg.runAction(this.runItemBoxAnimation());
                     frame.status = ACTIVITY_EWG_1.frameStatus.Filled;
                     frame.top.setTexture(new cc.Sprite(ACTIVITY_EWG_1.spriteBasePath + "frame_top_lights_on.png").getTexture());
                 }
             }
             if(this.isTeacherView){
                 this.syncInfo = ACTIVITY_EWG_1.ref.syncDataInfo;
                 this.updateRoomData();
             }
         }
         if(this.placeItemName.length == 3){
             this.runWinAnimation();
         }
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
        if (handICon) {
            this.interactableObject = true;
            this.customTexture = true;
        }
    },
});




