var ACTIVITY_KEVINS_CRANE_1 = {};
ACTIVITY_KEVINS_CRANE_1.Tag = {
    HOME_BASE           :   100,
    BALANCER_ROW_1      :   101,
    BALANCER_ROW_2      :   102,
    HOME_ROOF           :   103,
    HOME_BASE_LAYER     :   104,
    ROW_1_LAYER         :   105,
    ROW_2_LAYER         :   106,
    ROW_3_LAYER         :   107,
    MULTIPLAYER_MODE    :   108,
    HELP_BUTTON         :   109,
    HINT_BASE           :   110
};

ACTIVITY_KEVINS_CRANE_1.LEVEL_STATE ={
    FAILED   : 0,
    ON_GOING : 1,
    WON      : 2,
}

ACTIVITY_KEVINS_CRANE_1.GAME_TYPE = {
    DEMOLISHING         :   1,
    CONSTRUCTION        :   2
};

ACTIVITY_KEVINS_CRANE_1.MULTIPLAYER_TYPE = {
    INDIVIDUAL          :   1,
    TURN_BASED          :   2
};

ACTIVITY_KEVINS_CRANE_1.socketEventKey = {
    HELP                        : 101,
    CRANE_MOVEMENT              : 102,
    MOVE_WREACKING_BALL         : 103,
    CHANGE_MULTIPLAYER_MODE     : 104,
    CRANE_STOP                  : 105,
    REPLAY                      : 107,
    USER_DATA                   : 109,
    START_NEXT_LEVEL            : 110,
    BRICK_BROCK                 : 112,
    ANIMATION_ENDED_ACK         : 113,
};

ACTIVITY_KEVINS_CRANE_1.ref = null;

var CharacterBox = cc.Sprite.extend({
    text                :   "a",
    rowCounter          :   -1,

    ctor: function () {
        this._super();
    },

    onEnter: function () {
        this._super();
    },

    setupUI(character, position, rowCounter) {
        var basePath            =   ACTIVITY_KEVINS_CRANE_1.config.assets.sections.characters.charactersData;
        this.text               =   character;
        this.rowCounter         =   rowCounter;
        var characterData       =   basePath[this.text];

        this.setTexture(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + characterData.imageName);
        this.setAnchorPoint(cc.p(0.5, 0));
        this.setPosition(position);
        this.setName(characterData.name);
    },

    addHighlighter : function() {
        let correctWordBreakAnimation =  HDUtility.runFrameAnimation(ACTIVITY_KEVINS_CRANE_1.animationBasePath + ACTIVITY_KEVINS_CRANE_1.config.assets.sections.animation.data.correctWordAnimation.frameInitial, ACTIVITY_KEVINS_CRANE_1.config.assets.sections.animation.data.correctWordAnimation.frameCount, 0.05, ".png", 1);
        var imageName = ACTIVITY_KEVINS_CRANE_1.spriteBasePath + ACTIVITY_KEVINS_CRANE_1.config.assets.sections.character_highlight.imageName;
        var highlightImage = new cc.Sprite(imageName);
        highlightImage.setPosition(cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5));
        this.addChild(highlightImage);
        highlightImage.runAction(cc.sequence(correctWordBreakAnimation, cc.blink(1.0, 4), cc.removeSelf()));
    },

    smokeBlastAnimation : function() {
        if (this.getNumberOfRunningActions() > 0)
            return;
        let smokeAnimation =  HDUtility.runFrameAnimation(ACTIVITY_KEVINS_CRANE_1.animationBasePath + ACTIVITY_KEVINS_CRANE_1.config.assets.sections.animation.data.tileBreakAndSmokeAnimation.frameInitial, ACTIVITY_KEVINS_CRANE_1.config.assets.sections.animation.data.tileBreakAndSmokeAnimation.frameCount, 0.05, ".png", 1);
        this.runAction(smokeAnimation);
    },

    runWrongCharacterBlastAnimation : function() {
        var magicNumber = 10 + Math.random() * 10;
        var fallAnimation = cc.rotateBy(0.3, 50);
        if(magicNumber > 12)
            fallAnimation = cc.rotateBy(0.3, -50);

        this.runAction(cc.sequence(cc.rotateBy(0.3, 40 * -Math.random()), cc.rotateBy(0.2, 30 * Math.random()), cc.rotateBy(0.5, -45 * Math.random()), cc.rotateBy(0.4, 60 * Math.random()), fallAnimation, cc.moveBy(0.1, 0, -100 * (this.rowCounter + 1))));
    },

    onExit : function () {
        this._super();
    }
});

/**
 * component to display crane operations
 */
ACTIVITY_KEVINS_CRANE_1.CraneNode = cc.Node.extend({
    gameRef                 :   null,
    craneChanins            :   null,
    craneCockpit            :   null,
    craneCylinder           :   null,
    craneCockpitCollider    :   null,
    initialCockpitPos       :   null,
    isCharacterPicked       :   false,
    initialColliderPos      :   null,

    ctor : function () {
        this._super();
        this.gameRef = ACTIVITY_KEVINS_CRANE_1.ref;
        this.addCrane();
    },

    onEnter : function () {
        this._super();
        this.runCraneIdleAnimation();
    },

    onExit : function () {
        this._super();
    },

    addCrane : function(){
        var componentPath       =   ACTIVITY_KEVINS_CRANE_1.config.assets.sections.crane.component;
        this.craneChanins       =   this.gameRef.addSprite(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + componentPath.craneChassis.imageName, cc.p(this.gameRef._size.width * 0.5,this.gameRef._size.height * 0.1), this);
        this.craneCylinder      =   this.gameRef.addSprite(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + componentPath.craneCylinder.imageName, cc.p(this.gameRef._size.width * 0.52,this.gameRef._size.height * 0.13), this);
        this.craneCylinder.setAnchorPoint(cc.p(0.5,0));
        this.initialCockpitPos   = cc.p(this.gameRef._size.width * 0.425,this.gameRef._size.height * 0.405);

        var imageName           =   componentPath.cockpit.imageName;
        if(this.gameRef.gameType == ACTIVITY_KEVINS_CRANE_1.GAME_TYPE.CONSTRUCTION)
            imageName           =   componentPath.craneClaw.imageName;

        this.craneCockpit       =   this.gameRef.addSprite(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + imageName, this.initialCockpitPos, this);

        this.addColliderImage(" ", 0);
    },

    addColliderImage : function(characterName, opacity) {
        var colliderPosition    =   cc.p(this.gameRef._size.width * 0.335, this.gameRef._size.height * 0.25)
        if(this.gameRef.gameType == ACTIVITY_KEVINS_CRANE_1.GAME_TYPE.CONSTRUCTION)
            colliderPosition    =   cc.p(this.gameRef._size.width * 0.335, this.gameRef._size.height * 0.185);

        if(this.craneCockpitCollider) {
            colliderPosition    =   this.craneCockpitCollider.getPosition();
            this.craneCockpitCollider.removeFromParent();
            this.craneCockpitCollider = null;
        }else {
            this.initialColliderPos     =   colliderPosition;
        }
        this.isCharacterPicked      =   true;
        if(characterName == " ") {
            characterName           =   "empty";
            this.isCharacterPicked  =   false;
        }

        this.craneCockpitCollider   =   new CharacterBox()
        this.craneCockpitCollider.setupUI(characterName, colliderPosition, -1);
        this.addChild(this.craneCockpitCollider);
        this.craneCockpitCollider.runAction(cc.sequence(cc.moveBy(0.15, 0, 1), cc.moveBy(0.15, 0, -1)).repeatForever());
        this.craneCockpitCollider.setOpacity(opacity)
    },


    moveUp : function(){
       if (this.craneCockpit.getPosition().y <= this.gameRef._size.height  * 0.85){
            this.craneCockpit.setPosition(cc.p(this.craneCockpit.getPosition().x, this.craneCockpit.getPosition().y + 1));
            this.craneCockpitCollider.setPosition(cc.p(this.craneCockpitCollider.getPosition().x, this.craneCockpitCollider.getPosition().y + 1));
            this.craneCylinder.setScaleY(this.craneCylinder.getScaleY() + 0.035);
            this.gameRef.colliderPositionUpdated();
        }
    },

    moveDown : function(){
        if (this.craneCockpit.getPosition().y >= this.initialCockpitPos.y){
            this.craneCockpit.setPosition(cc.p(this.craneCockpit.getPosition().x,this.craneCockpit.getPosition().y - 1));
            this.craneCockpitCollider.setPosition(cc.p(this.craneCockpitCollider.getPosition().x, this.craneCockpitCollider.getPosition().y - 1));
            this.craneCylinder.setScaleY(this.craneCylinder.getScaleY() - 0.035);
            this.gameRef.colliderPositionUpdated();
        }
    },

    startMoveAnimation : function (isleft) {
        if (this.craneChanins.getActionByTag(1001))
            this.craneChanins.stopAllActions();

        var craneIdleAnimation = null;
        if (!isleft)
            craneIdleAnimation = cc.repeatForever(HDUtility.runFrameAnimation(ACTIVITY_KEVINS_CRANE_1.animationBasePath+ ACTIVITY_KEVINS_CRANE_1.config.assets.sections.animation.data.craneMoveRight.frameInitial, ACTIVITY_KEVINS_CRANE_1.config.assets.sections.animation.data.craneMoveRight.frameCount, 0.04, ".png", 1));
        else
            craneIdleAnimation = cc.repeatForever(HDUtility.runFrameAnimation(ACTIVITY_KEVINS_CRANE_1.animationBasePath+ ACTIVITY_KEVINS_CRANE_1.config.assets.sections.animation.data.craneMoveLeft.frameInitial, ACTIVITY_KEVINS_CRANE_1.config.assets.sections.animation.data.craneMoveLeft.frameCount, 0.04, ".png", 1));

        craneIdleAnimation.setTag(1001);
        this.craneChanins.runAction(craneIdleAnimation);
    },

    stopMoveAnimation : function () {
        this.craneChanins.stopAllActions();
    },

    runCraneSmasherAnimation : function() {
        if(this.craneCockpit.getNumberOfRunningActions() > 0) {
            this.craneCockpit.stopAllActions();
        }
        let craneSmashAnimation =  HDUtility.runFrameAnimation(ACTIVITY_KEVINS_CRANE_1.animationBasePath + ACTIVITY_KEVINS_CRANE_1.config.assets.sections.animation.data.breakWordWithSmasherAnimation.frameInitial, ACTIVITY_KEVINS_CRANE_1.config.assets.sections.animation.data.breakWordWithSmasherAnimation.frameCount, 0.05, ".png", 1);
        this.craneCockpit.runAction(cc.sequence(craneSmashAnimation, cc.callFunc(this.runCraneIdleAnimation, this)));

    },

    runCranePickAnimation : function() {
        if(this.craneCockpit.getNumberOfRunningActions() > 0) {
            this.craneCockpit.stopAllActions();
            this.craneCockpitCollider.stopAllActions();
        }
        let cranePickAnimation =  HDUtility.runFrameAnimation(ACTIVITY_KEVINS_CRANE_1.animationBasePath + ACTIVITY_KEVINS_CRANE_1.config.assets.sections.animation.data.cranePickTrue.frameInitial, ACTIVITY_KEVINS_CRANE_1.config.assets.sections.animation.data.cranePickTrue.frameCount, 0.1, ".png", 1);
        this.craneCockpit.runAction(cc.sequence(cranePickAnimation, cc.callFunc(this.runCraneIdleAnimation, this)));
    },

    runCraneElementPlaceAnimation : function() {
        if(this.craneCockpit.getNumberOfRunningActions() > 0) {
            this.craneCockpit.stopAllActions();
        }
        let craneElementPlaceAnimation =  HDUtility.runFrameAnimation(ACTIVITY_KEVINS_CRANE_1.animationBasePath + ACTIVITY_KEVINS_CRANE_1.config.assets.sections.animation.data.craneAddElement.frameInitial, ACTIVITY_KEVINS_CRANE_1.config.assets.sections.animation.data.craneAddElement.frameCount, 0.1, ".png", 1);
        this.craneCockpit.runAction(cc.sequence(craneElementPlaceAnimation, cc.callFunc(this.runCraneIdleAnimation, this)));
    },


    runCraneIdleAnimation : function() {
        var craneIdleAnimation = HDUtility.runFrameAnimation(ACTIVITY_KEVINS_CRANE_1.animationBasePath + ACTIVITY_KEVINS_CRANE_1.config.assets.sections.animation.data.craneBallIdle.frameInitial, ACTIVITY_KEVINS_CRANE_1.config.assets.sections.animation.data.craneBallIdle.frameCount, 0.15, ".png", 1);
        if(this.gameRef.gameType == ACTIVITY_KEVINS_CRANE_1.GAME_TYPE.CONSTRUCTION)
            craneIdleAnimation = HDUtility.runFrameAnimation(ACTIVITY_KEVINS_CRANE_1.animationBasePath + ACTIVITY_KEVINS_CRANE_1.config.assets.sections.animation.data.craneClawCloseAnimation.frameInitial, ACTIVITY_KEVINS_CRANE_1.config.assets.sections.animation.data.craneClawCloseAnimation.frameCount, 0.15, ".png", 1);
        this.craneCockpit.runAction(cc.repeatForever(craneIdleAnimation));

    }
});

/**
 * component to handle crane operations
 */
ACTIVITY_KEVINS_CRANE_1.CraneControl = cc.Node.extend({
    gameRef             :   null,
    craneNode           :   null,
    controlBase         :   null,
    nobShaft            :   null,
    baseSize            :   null,
    joystickDirection   :   0,
    shaftButton         :   null,
    previousDirection   :   0,
    isAnimationStarted  :   false,


    ctor : function (craneNode) {
        this._super();
        this.gameRef = ACTIVITY_KEVINS_CRANE_1.ref;
        this.craneNode = craneNode;
        this.addControls();
        this.scheduleUpdate();
        this.isAnimationStarted = false;
    },

    onEnter : function () {
        this._super();
        this.isAnimationStarted = false;
        this.baseSize = this.controlBase.getContentSize();
    },
    onExit : function () {
        this._super();
    },

    update : function(dt){
        if(this.isAnimationStarted)
            return;
        this.moveCrane(dt);
        this.craneUpDown(dt);
    },

    addControls : function(){
        this.controlBase = this.gameRef.addSprite(ACTIVITY_KEVINS_CRANE_1.spriteBasePath+"joystick_idle.png",cc.p(this.gameRef._size.width*0.93,this.gameRef._size.height*0.265),this);
        this.nobShaft = this.gameRef.addSprite(ACTIVITY_KEVINS_CRANE_1.spriteBasePath+"shaft.png",cc.p(this.controlBase.getContentSize().width*0.5,this.controlBase.getContentSize().height *0.65),this.controlBase);
        this.nobShaft.setOpacity(0);

        this.shaftButton = this.gameRef.createButton(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + "button_idle.png", ACTIVITY_KEVINS_CRANE_1.spriteBasePath+"button_pressed.png",
            "", 0, 100, cc.p( this.controlBase.getContentSize().width * 0.51, this.controlBase.getContentSize().height *0.255),  this.controlBase,this);

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: this.onTouchBegan.bind(this),
            onTouchMoved: this.onTouchMoved.bind(this),
            onTouchEnded: this.onTouchEnded.bind(this),
            onTouchCancelled: this.onTouchCancelled.bind(this)
        }, this);
    },

    buttonCallback : function (sender, type){
        console.log(!ACTIVITY_KEVINS_CRANE_1.ref.isStudentInteractionEnable , ACTIVITY_KEVINS_CRANE_1.ref.isPreviewMode, type);
        if(!ACTIVITY_KEVINS_CRANE_1.ref.isStudentInteractionEnable || ACTIVITY_KEVINS_CRANE_1.ref.isPreviewMode || ( ACTIVITY_KEVINS_CRANE_1.ref.isTeacherView && ACTIVITY_KEVINS_CRANE_1.ref.isStudentSelected && ACTIVITY_KEVINS_CRANE_1.ref.multiPlayerType == ACTIVITY_KEVINS_CRANE_1.MULTIPLAYER_TYPE.TURN_BASED)) return;
        var button      = sender;
        var Tag   = button.tag ;
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN: {
                this.gameRef.shaftButtonPressed();
                sender.runAction(cc.sequence(cc.callFunc(this.changeTouchResponsiveness, this, false), cc.delayTime(1.7), cc.callFunc(this.changeTouchResponsiveness, this, true)));
            }
                break;
            case ccui.Widget.TOUCH_MOVED:
                break;
            case ccui.Widget.TOUCH_ENDED:
                switch (Tag) {
                }
                break;
        }
    },

    changeTouchResponsiveness : function(ref, isTouchEnabled) {
        this.shaftButton.setTouchEnabled(isTouchEnabled);
        this.isAnimationStarted = !isTouchEnabled;
        if(isTouchEnabled)
            this.shaftButton.loadTextureNormal(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + "button_idle.png");
        else
            this.shaftButton.loadTextureNormal(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + "button_pressed.png");
    },

    shaftTouch : function(touch){
        let xfactor = this.controlBase.getPosition().x;
        let yfactor = this.controlBase.getPosition().y + this.controlBase.getContentSize().height * 0.15;
        let touchFactor = this.controlBase.getContentSize();
        if ((touch.x >= xfactor - touchFactor.width * 0.25 && touch.x <= xfactor + touchFactor.width * 0.25) && (touch.y >= yfactor - touchFactor.height * 0.25 && touch.y <= yfactor + touchFactor.height*0.15)){
            return true;
        }else {
            return false;
        }
    },

    setShaftFrame : function(angle, isIdle){
        if (isIdle){
            let mSprite = new cc.Sprite(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + "joystick_idle.png");
            this.controlBase.setTexture(mSprite.getTexture());
            this.joystickDirection = 0;
        } else {
            if (angle >= 125 && angle <= 200){
                //right
                let mSprite = new cc.Sprite(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + "joystick_right.png");
                this.controlBase.setTexture(mSprite.getTexture());
                this.joystickDirection = 1;
                this.craneNode.startMoveAnimation(false);
            } else if(angle >= 50 && angle <= 124){
                // down
                this.craneNode.stopMoveAnimation();
                let mSprite = new cc.Sprite(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + "joystick_down.png");
                this.controlBase.setTexture(mSprite.getTexture());
                this.joystickDirection = 2;

            } else if(angle >= 201 && angle <= 340){
                //up
                this.craneNode.stopMoveAnimation();
                let mSprite = new cc.Sprite(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + "joystick_up.png");
                this.controlBase.setTexture(mSprite.getTexture());
                this.joystickDirection = 4;

            }else {
                // left
                let mSprite = new cc.Sprite(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + "joystick_left.png");
                this.controlBase.setTexture(mSprite.getTexture());
                this.joystickDirection = 3;
                this.craneNode.startMoveAnimation(true);
            }
        }
    },

    moveCrane : function(dt) {
        let pos = this.craneNode.getPosition();
        if (this.craneNode.getPosition().x <= -this.gameRef._size.width * 0.3){
            this.craneNode.setPosition(cc.p(pos.x + 0.05,pos.y));

        }else if(this.craneNode.getPosition().x >= this.gameRef._size.width * 0.25){
            this.craneNode.setPosition(cc.p(pos.x - 0.05, pos.y));

        }else {
            var multiplier  =   1;
            if(cc.sys.browserType == cc.sys.BROWSER_TYPE_FIREFOX) {
                multiplier  =   1.5;
            }
            var distance =  ACTIVITY_KEVINS_CRANE_1.ref.getContentSize().width * 0.001 * multiplier;
            if (this.joystickDirection === 3){
                this.craneNode.setPosition(cc.p(pos.x - distance, pos.y));
            }else if(this.joystickDirection === 1){
                this.craneNode.setPosition(cc.p(pos.x + distance, pos.y));
            }
        }
        this.gameRef.colliderPositionUpdated();
    },

    craneUpDown :  function(){
        if (this.joystickDirection === 4) {
            this.craneNode.moveUp();
        }else if(this.joystickDirection === 2){
            this.craneNode.moveDown();
        }
    },


    onTouchBegan:function(touch, event) {
        console.log("this.isAnimation Started: ", this.isAnimationStarted);
        if(this.isAnimationStarted || !ACTIVITY_KEVINS_CRANE_1.ref.isStudentInteractionEnable || ACTIVITY_KEVINS_CRANE_1.ref.isPreviewMode || ( ACTIVITY_KEVINS_CRANE_1.ref.isTeacherView && ACTIVITY_KEVINS_CRANE_1.ref.isStudentSelected && ACTIVITY_KEVINS_CRANE_1.ref.multiPlayerType == ACTIVITY_KEVINS_CRANE_1.MULTIPLAYER_TYPE.TURN_BASED)) return false;

        var pos = touch.getLocation();
        if (this.shaftTouch(pos)){
            let newPoints = this.nobShaft.parent.convertToNodeSpace(pos);
            let angle = Math.atan2(newPoints.y - this.nobShaft.getPosition().y, newPoints.x - this.nobShaft.getPosition().x) * 180 / Math.PI + 180;
            this.setShaftFrame(angle, false);
            this.previousDirection = this.joystickDirection;
            this.sendCraneMovementToOthers(angle, false);
            return true;
        } else {
            return false;
        }
    },

    onTouchMoved:function(touch, event) {
        if(!ACTIVITY_KEVINS_CRANE_1.ref.isStudentInteractionEnable || ACTIVITY_KEVINS_CRANE_1.ref.isPreviewMode || (ACTIVITY_KEVINS_CRANE_1.ref.isStudentSelected && ACTIVITY_KEVINS_CRANE_1.ref.multiPlayerType == ACTIVITY_KEVINS_CRANE_1.MULTIPLAYER_TYPE.TURN_BASED)) return;
        var pos = touch.getLocation();
        if (this.shaftTouch(pos)){
            let newPoints = this.nobShaft.parent.convertToNodeSpace(pos);
            let angle = Math.atan2(newPoints.y - this.nobShaft.getPosition().y, newPoints.x - this.nobShaft.getPosition().x) * 180 / Math.PI + 180;
            this.setShaftFrame(angle, false);
            if(this.joystickDirection != this.previousDirection) {
                this.sendCraneMovementToOthers(angle, false);
                this.previousDirection = this.joystickDirection;
            }
        }
    },

    onTouchEnded:function(touch, event) {
        if(!ACTIVITY_KEVINS_CRANE_1.ref.isStudentInteractionEnable || ACTIVITY_KEVINS_CRANE_1.ref.isPreviewMode || (ACTIVITY_KEVINS_CRANE_1.ref.isStudentSelected && ACTIVITY_KEVINS_CRANE_1.ref.multiPlayerType == ACTIVITY_KEVINS_CRANE_1.MULTIPLAYER_TYPE.TURN_BASED)) return;
        var pos = touch.getLocation();
        if (this.shaftTouch(pos)){
            // cc.log("onTouchCancelled at: " + pos.x + " " + pos.y + " Id:" + id );
        }
        this.craneNode.stopMoveAnimation();
        this.setShaftFrame(0, true);
        this.previousDirection = this.joystickDirection;
        this.sendCraneFinalPositionToOthers(0, true);
    },

    onTouchCancelled:function(touch, event) {
        if(!ACTIVITY_KEVINS_CRANE_1.ref.isStudentInteractionEnable || ACTIVITY_KEVINS_CRANE_1.ref.isPreviewMode || (ACTIVITY_KEVINS_CRANE_1.ref.isStudentSelected && ACTIVITY_KEVINS_CRANE_1.ref.multiPlayerType == ACTIVITY_KEVINS_CRANE_1.MULTIPLAYER_TYPE.TURN_BASED)) return;
        var pos = touch.getLocation();
        var id = touch.getID();
        if (this.shaftTouch(pos)){
            // cc.log("onTouchCancelled at: " + pos.x + " " + pos.y + " Id:" + id );
        }
        this.craneNode.stopMoveAnimation();
        this.setShaftFrame(0,true);
        this.sendCraneFinalPositionToOthers(0, true);
    },

    sendCraneMovementToOthers(angle, isIdle){
        var dataToSend = ACTIVITY_KEVINS_CRANE_1.ref.createDataToSend();
         ACTIVITY_KEVINS_CRANE_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                "eventType": ACTIVITY_KEVINS_CRANE_1.socketEventKey.CRANE_MOVEMENT,
                "data"      : {
                    "angle"                 :   angle,
                    "isIdle"                :   isIdle,
                    'craneInfo'             :   JSON.stringify(ACTIVITY_KEVINS_CRANE_1.ref.craneInfo),
                    "userInfo"              :   JSON.stringify(dataToSend),
                }
         });
    },

    sendCraneFinalPositionToOthers(angle, isIdle){
        var dataToSend = ACTIVITY_KEVINS_CRANE_1.ref.createDataToSend();
           ACTIVITY_KEVINS_CRANE_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                "eventType": ACTIVITY_KEVINS_CRANE_1.socketEventKey.CRANE_STOP,
                "data"      : {
                    "joystickDirection"     :  this.joystickDirection,
                    "isIdle"                :   isIdle,
                    'craneInfo'             :   JSON.stringify( ACTIVITY_KEVINS_CRANE_1.ref.craneInfo),
                    "userInfo"              :   JSON.stringify(dataToSend),
                }
           });
    },
});

ACTIVITY_KEVINS_CRANE_1.KevinsCrane = HDBaseLayer.extend({
    isTeacherView               :   false,
    isPreviewMode               :   false,
    previewingStudentName       :   "",
    interactableObject          :   null,
    customTexture               :   null,
    handIconUI                  :   [],
    characterWidth              :   0,
    characterHeight             :   0,
    gameName                    :   "Demolishing",
    gameType                    :   1,
    maxNumberOfRows             :   3,
    maxCharacterInRow           :   8,
    gameData                    :   [],
    homeLayer                   :   null,
    hintImagesBase              :   null,
    resetHoverImage             :   null,
    itemData                    :   [],
    currentLevel                :   0,
    craneControlNode            :   null,
    multiPlayerType             :   ACTIVITY_KEVINS_CRANE_1.MULTIPLAYER_TYPE.TURN_BASED,
    isHintOpen                  :   false,
    gamePlayInfo                :   {},
    syncInfo                    :   null,
    correctedRow                :   0,
    totalLevels                 :   0,
    craneInfo                   :   {},
    groundLetters               :   "oingts",
    maxCharacterInGround        :   6,
    levelStatus                 :   ACTIVITY_KEVINS_CRANE_1.LEVEL_STATE.ON_GOING,
    selectedCharacterFromGround :   null,
    isStudentSelected           :   false,
    animationAck                :   0,
    userAckArray                :   [],
    isResetAnimationPlaying     : false,

    ctor: function () {
        this._super();
    },
    //************************************** GAME CONFIG SETUP *****************************************//
    onEnter: function () {
        this._super();
        ACTIVITY_KEVINS_CRANE_1.ref = this;
        let activityName = 'ACTIVITY_KEVINS_CRANE_1';
        ACTIVITY_KEVINS_CRANE_1.ref.isStudentInteractionEnable = false;
        cc.loader.loadJson("res/Activity/" + activityName + "/config.json", function (error, config) {
            ACTIVITY_KEVINS_CRANE_1.config = config;
            ACTIVITY_KEVINS_CRANE_1.resourcePath = "res/Activity/" + "" + activityName + "/res/"
            ACTIVITY_KEVINS_CRANE_1.soundPath = ACTIVITY_KEVINS_CRANE_1.resourcePath + "Sound/";
            ACTIVITY_KEVINS_CRANE_1.animationBasePath = ACTIVITY_KEVINS_CRANE_1.resourcePath + "AnimationFrames/";
            ACTIVITY_KEVINS_CRANE_1.spriteBasePath = ACTIVITY_KEVINS_CRANE_1.resourcePath + "Sprite/";
            ACTIVITY_KEVINS_CRANE_1.ref.isTeacherView = HDAppManager.isTeacherView;
            ACTIVITY_KEVINS_CRANE_1.ref.setupUI();
            if (ACTIVITY_KEVINS_CRANE_1.ref.isTeacherView) {
                ACTIVITY_KEVINS_CRANE_1.ref.createDataToSend();
                ACTIVITY_KEVINS_CRANE_1.ref.updateRoomData();
                ACTIVITY_KEVINS_CRANE_1.ref.isStudentInteractionEnable = true;
            }
            // ACTIVITY_KEVINS_CRANE_1.ref.triggerTip(config.teacherTips.moduleStart);
        });
    },

    fetchGameData: function () {
        HDNetworkHandler.get(HDAPIKey.GameData, {"roomId": HDAppManager.roomId}, true, (err, res) => {
        });
    },

    onExit: function () {
        this._super();
        ACTIVITY_KEVINS_CRANE_1.ref.removeAllChildrenWithCleanup(true);
        ACTIVITY_KEVINS_CRANE_1.ref.customTexture       =   false;
        ACTIVITY_KEVINS_CRANE_1.ref.interactableObject  =   false;
        ACTIVITY_KEVINS_CRANE_1.ref.handIconUI.length   =   0;
        ACTIVITY_KEVINS_CRANE_1.ref.gameData.length     =   0;
        ACTIVITY_KEVINS_CRANE_1.ref.syncInfo            =   null;
        ACTIVITY_KEVINS_CRANE_1.ref                     =   null;
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
        console.log("on student preview cell", studentName, status);
        if(studentName == HDAppManager.username && this.isTeacherView){
            this.isPreviewMode  = false;
        }else{
            this.isPreviewMode = status;
        }

        this.previewingStudentName = (!status ? null : studentName);
        studentName  = this.previewingStudentName;
        this.showPreview(studentName);
    },

    setupUI: function () {

        this.setBackground(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + ACTIVITY_KEVINS_CRANE_1.config.background.sections.background.imageName);
        var button =this.createButton(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + ACTIVITY_KEVINS_CRANE_1.config.buttons.data.help.enableState, ACTIVITY_KEVINS_CRANE_1.spriteBasePath + ACTIVITY_KEVINS_CRANE_1.config.buttons.data.help.pushedState, null, 0, ACTIVITY_KEVINS_CRANE_1.Tag.HELP_BUTTON, ACTIVITY_KEVINS_CRANE_1.config.buttons.data.help.position, this, this, null);
        button.setLocalZOrder(100);
        if(this.isTeacherView){
            let multiPlayerMode = this.createButton(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + ACTIVITY_KEVINS_CRANE_1.config.buttons.data.multiplayerMode.enableState,
                null, "Individual Mode", 16, ACTIVITY_KEVINS_CRANE_1.Tag.MULTIPLAYER_MODE, cc.p(this.getContentSize().width * 0.1, this.getContentSize().height * 0.15), this);
            multiPlayerMode.setTitleColor(cc.color(0, 0, 0, 255));
            multiPlayerMode.setLocalZOrder(10000);
            multiPlayerMode.setAnchorPoint(cc.p(0.5, 0.5));
            this.handIconUI.push(multiPlayerMode);
        }
        var themeData   =  ACTIVITY_KEVINS_CRANE_1.config.assets.sections.theme;
        var optionData  =   themeData.options;
        for (var counter = 0; counter < optionData.length; counter++) {
            var option = optionData[counter];
            console.log("option data: ", JSON.stringify(option));
            if(option.value == themeData.currentValue) {
                this.gameName   =   option.label;
                this.gameType   =   option.value;
                break;
            }
        }

        this.setGameInfo();
        if(this.gameType == ACTIVITY_KEVINS_CRANE_1.GAME_TYPE.DEMOLISHING) {
            //START DEMOLISHING GAME
            this.buildHome(ACTIVITY_KEVINS_CRANE_1.config.assets.sections.demolishing);
            this.totalLevels = ACTIVITY_KEVINS_CRANE_1.config.assets.sections.demolishing.levels.data.length;
        }else{
            this.buildHome(ACTIVITY_KEVINS_CRANE_1.config.assets.sections.construction);
            this.totalLevels = ACTIVITY_KEVINS_CRANE_1.config.assets.sections.demolishing.levels.data.length;
        }
        this.addCraneInGame();
        SocketManager.emitCutomEvent(HDSingleEventKey, {
            eventType: HDSocketEventType.STUDENT_STATUS,
            data: {
                roomId: HDAppManager.roomId,
            },
        });

        if(this.multiPlayerType == ACTIVITY_KEVINS_CRANE_1.MULTIPLAYER_TYPE.TURN_BASED && this.isTeacherView){
            lesson_1.ref.setStudentsPreviewPanelActive(false);
        }

        if(this.syncInfo){
            this.updateUI();
        }
        var dataToSend = this.createDataToSend();
        this.updateUserInfo(dataToSend,"setUp");
        ACTIVITY_KEVINS_CRANE_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                "eventType"     : ACTIVITY_KEVINS_CRANE_1.socketEventKey.USER_DATA,
                "data"          : dataToSend,
        });
    },

    setGameInfo : function() {
        if(this.gameType == ACTIVITY_KEVINS_CRANE_1.GAME_TYPE.DEMOLISHING) {
            this.itemData = ACTIVITY_KEVINS_CRANE_1.config.assets.sections.demolishing.images_items_data.data;
        }else{
            this.itemData = ACTIVITY_KEVINS_CRANE_1.config.assets.sections.construction.images_items_data.data;
        }
    },


     //************************************** GAME CONFIG ENDED ***************************************//
    //************************************** GAME UI & LOGIC *****************************************//
    buildHome: function(gameConfigData) {
        this.maxNumberOfRows    =   gameConfigData.numberOfRows;
        this.maxCharacterInRow  =   gameConfigData.maxCharacterInRow;

        for(let item in gameConfigData.levels.data[this.currentLevel].words){
            this.gameData.push({...gameConfigData.levels.data[this.currentLevel].words[item]});
        }

        this.characterHeight   =   ACTIVITY_KEVINS_CRANE_1.config.assets.sections.characters.charactersData.a.dimension.height;
        this.characterWidth    =   ACTIVITY_KEVINS_CRANE_1.config.assets.sections.characters.charactersData.a.dimension.width;
        var homeBase = this.addSprite(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + ACTIVITY_KEVINS_CRANE_1.config.assets.sections.homeBase.imageName, cc.p(this.width * 0.275, this.height * 0.195), this);
        homeBase.setTag(ACTIVITY_KEVINS_CRANE_1.Tag.HOME_BASE);
        homeBase.setName(ACTIVITY_KEVINS_CRANE_1.config.assets.sections.homeBase.name);


        this.homeLayer = this.createColourLayer(cc.color(0,0,0,0), homeBase.getContentSize().width, this.getContentSize().height * 0.5,
            cc.p(homeBase.getPosition().x - homeBase.getContentSize().width * 0.5, homeBase.getPosition().y + homeBase.getContentSize().height * 0.5),
            this, 10);
        this.homeLayer.setTag(ACTIVITY_KEVINS_CRANE_1.Tag.HOME_BASE_LAYER);

        var floorBalancerPositionInY    =   this.characterHeight;
        for (var floorBalancerCounter = this.maxNumberOfRows - 1; floorBalancerCounter > 0; floorBalancerCounter--) {
            var floorBalancer   =   this.addSprite(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + ACTIVITY_KEVINS_CRANE_1.config.assets.sections.floorBalancer.imageName,
                cc.p(this.homeLayer.getContentSize().width * 0.5, floorBalancerPositionInY), this.homeLayer);
            floorBalancer.setAnchorPoint(cc.p(0.5, 0));
            floorBalancer.setTag(ACTIVITY_KEVINS_CRANE_1.Tag.BALANCER_ROW_1 + (this.maxNumberOfRows - (floorBalancerCounter + 1)));
            floorBalancerPositionInY = floorBalancerPositionInY + this.characterHeight + floorBalancer.getContentSize().height;
            console.log("height",  floorBalancerPositionInY,this.characterHeight, floorBalancer.getContentSize().height, floorBalancer.getPosition());
        }

        var roof = this.addSprite(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + ACTIVITY_KEVINS_CRANE_1.config.assets.sections.homeRoof.imageName,
            cc.p(this.homeLayer.getContentSize().width * 0.5, floorBalancerPositionInY), this.homeLayer);
        roof.setTag(ACTIVITY_KEVINS_CRANE_1.Tag.HOME_ROOF);
        roof.setAnchorPoint(cc.p(0.5, 0));
        roof.setName(ACTIVITY_KEVINS_CRANE_1.config.assets.sections.homeRoof.name);
        this.homeLayer.setContentSize(cc.size(this.homeLayer.getContentSize().width, roof.getPosition().x + roof.getContentSize().height * 1.1));
        roof.setLocalZOrder(10);
        this.homeLayer.runAction(this.getHomeAnimation());
        this.setupCharacters();
        this.addHintImagesBase();
        this.addAllImagesInBoard();
        this.addResetHoverImage();
        if(this.gameType == ACTIVITY_KEVINS_CRANE_1.GAME_TYPE.CONSTRUCTION) {
            this.addCharacterInGrounds();
        }
    },

    reconstructHome : function(){
        var homeBase = this.getChildByTag(ACTIVITY_KEVINS_CRANE_1.Tag.HOME_BASE);
        homeBase.setPosition(this.width * 0.275, this.height * 0.195);
        // this.getContentSize().height * 0.5,
            // cc.p(homeBase.getPosition().x - homeBase.getContentSize().width * 0.5, homeBase.getPosition().y + homeBase.getContentSize().height * 0.5
        this.homeLayer.setPosition( cc.p(homeBase.getPosition().x - homeBase.getContentSize().width * 0.5, homeBase.getPosition().y + homeBase.getContentSize().height * 0.5));
        var floorBalancerPositionInY    =   this.characterHeight;
        for (var floorBalancerCounter = this.maxNumberOfRows - 1; floorBalancerCounter > 0; floorBalancerCounter--) {
            var floorBalancer = this.homeLayer.getChildByTag(ACTIVITY_KEVINS_CRANE_1.Tag.BALANCER_ROW_1 + (this.maxNumberOfRows - (floorBalancerCounter + 1)));
            floorBalancer.setRotation(0);
            floorBalancer.setPosition(cc.p(this.homeLayer.getContentSize().width * 0.5, floorBalancerPositionInY));
            floorBalancerPositionInY = floorBalancerPositionInY + this.characterHeight + floorBalancer.getContentSize().height;
        }
        var roof =  this.homeLayer.getChildByTag(ACTIVITY_KEVINS_CRANE_1.Tag.HOME_ROOF)
        roof.setPosition(this.homeLayer.getContentSize().width * 0.5, floorBalancerPositionInY);
        roof.setRotation(0);
        this.homeLayer.runAction(this.getHomeAnimation());
    },

    addCraneInGame : function(){
        let craneNode = new ACTIVITY_KEVINS_CRANE_1.CraneNode();
        this.craneControlNode = new ACTIVITY_KEVINS_CRANE_1.CraneControl(craneNode);
        this.addChild(this.craneControlNode,60);
        this.addChild(craneNode,1500);
    },

    addDustImage : function() {
        var dustImage   =   this.addSprite(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + ACTIVITY_KEVINS_CRANE_1.config.assets.sections.dustImage.imageName,
            cc.p(this.getContentSize().width * 0.25, this.getContentSize().height * 0.45), this);
        dustImage.setLocalZOrder(1400);

        var animation = HDUtility.runFrameAnimation(ACTIVITY_KEVINS_CRANE_1.animationBasePath + ACTIVITY_KEVINS_CRANE_1.config.assets.sections.animation.data.fallDustEffectAnimation.frameInitial, ACTIVITY_KEVINS_CRANE_1.config.assets.sections.animation.data.fallDustEffectAnimation.frameCount, 0.08, ".png", 1);
        dustImage.runAction(cc.sequence(animation, cc.removeSelf()));
    },


    addHintImagesBase : function() {
        var hintImageBase   =   this.addSprite(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + ACTIVITY_KEVINS_CRANE_1.config.assets.sections.hint_images_base.imageName,
            cc.p(this.getContentSize().width * 0.975, this.getContentSize().height * 0.755), this);
        hintImageBase.setAnchorPoint(cc.p(1, 0.5));
        hintImageBase.setLocalZOrder(100);
        hintImageBase.setTag(ACTIVITY_KEVINS_CRANE_1.Tag.HINT_BASE);
        var initialPositionInX = hintImageBase.getContentSize().width * 0.175;
        for (var rowCounter = 0; rowCounter < this.maxNumberOfRows; rowCounter++) {
            var displayWords = this.gameData[rowCounter].correct_word;
            var image = this.itemData.filter(item => item.name == displayWords)[0];
            var hintImage = this.addSprite(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + image.imageName, cc.p(initialPositionInX, hintImageBase.getContentSize().height * 0.5), hintImageBase);
            hintImage.setName(image.name);
            hintImage.setScale(hintImageBase.getContentSize().width * 0.225 / hintImage.getContentSize().width);
            initialPositionInX = initialPositionInX + hintImageBase.getContentSize().width * 0.325;
        }
    },


    setupCharacters : function() {
      for (var rowCounter = 0; rowCounter < this.maxNumberOfRows; rowCounter++) {
          var displayWords = this.gameData[rowCounter].display_word;
          this.addCharacterInRow(displayWords, rowCounter)
      }
    },

    addCharacterInGrounds : function() {
        this.groundLetters      =   ACTIVITY_KEVINS_CRANE_1.config.assets.sections.construction.levels.data[this.currentLevel].ground_word;
        var initialPositionX    =   this.getContentSize().width * 0.1;
        for (var counter = 0; counter < this.groundLetters.length; counter++) {
            var character           =   this.addCharacter(this.groundLetters[counter], -1, cc.p(initialPositionX, this.getContentSize().height * 0.1), (-1000 + counter), true);
            character.runAction(cc.rotateBy(0.1 , Math.random() * 10));
            this.addChild(character, 1400);
            initialPositionX        = initialPositionX + character.getContentSize().width * 1.05;
        }
    },

    removeGroundCharacterRef : function() {
        this.selectedCharacterFromGround.removeFromParent();
        this.selectedCharacterFromGround = null;
    },

    addRowBase(rowCounter) {
        var rowLayer    =   this.homeLayer.getChildByTag(this.getRowCounterTag(rowCounter));
        var rowBalancer =   this.homeLayer.getChildByTag(ACTIVITY_KEVINS_CRANE_1.Tag.BALANCER_ROW_1);
        var layerPosInY =   this.characterHeight * rowCounter + ((this.maxNumberOfRows > 1) ? rowBalancer.getContentSize().height * rowCounter : 0);
        if(!rowLayer) {
            rowLayer    =   this.createColourLayer(cc.color(100 * rowCounter, 0, 120, 0), this.homeLayer.getContentSize().width, this.characterHeight,
                cc.p(0, layerPosInY), this.homeLayer, 10);
            rowLayer.setTag(this.getRowCounterTag(rowCounter));
        }
        return rowLayer;
    },

    addCharacterInRow(rowData, rowCounter) {
        var rowLayer                = this.addRowBase(rowCounter);
        rowLayer.removeAllChildrenWithCleanup(true);

        var columnLength            =   rowData.length;
        var difference              =   (this.maxCharacterInRow - columnLength) / 2;
        var positionInX             =   parseInt(difference) * this.characterWidth;

        for (var counter = 0; counter < columnLength; counter++) {
            var character           =   this.addCharacter(rowData[counter], rowCounter, cc.p(positionInX, 0), counter);
            rowLayer.addChild(character);
            character.setPositionX(character.getPositionX() + character.getContentSize().width * 0.51);
            positionInX = positionInX + character.getContentSize().width * 1.05;
        }
    },

    addCharacter : function(characterText, rowCounter, position, tag, isGroundCharacter = false) {
        var character           =   new CharacterBox();
        var imageName           =   characterText;
        if(imageName == " ")
            imageName           =   "empty";

        character.setupUI(imageName, position, rowCounter);
        character.setTag(tag);
        if (!isGroundCharacter && this.checkifCorrectWordAchieved(rowCounter)) {
            character.addHighlighter();
        }
        return character;
    },

    getRowCounterTag(rowCounter) {
        var tag = ACTIVITY_KEVINS_CRANE_1.Tag.ROW_1_LAYER;
        if(rowCounter == 1) {
            tag = ACTIVITY_KEVINS_CRANE_1.Tag.ROW_2_LAYER;
        }else if(rowCounter == 2) {
            tag = ACTIVITY_KEVINS_CRANE_1.Tag.ROW_3_LAYER;
        }
        return tag;
    },

    checkCollision : function() {
        if(this.gameType == ACTIVITY_KEVINS_CRANE_1.GAME_TYPE.DEMOLISHING) {
            this.checkDemolishingCollision();
        }else {
            if(this.craneControlNode.craneNode.isCharacterPicked) {
                this.checkCharcterFixingProcess();
            }else {
                if(this.craneControlNode.craneNode.craneCockpitCollider.getNumberOfRunningActions() > 1)
                    return;

                this.characterPickingProcess();
            }
        }
    },

    characterPickingProcess : function() {
        this.craneControlNode.craneNode.runCranePickAnimation();
        this.selectedCharacterFromGround = null;
        var colliderLocation = cc.p(this.craneControlNode.craneNode.craneCockpitCollider.getPosition().x + this.craneControlNode.craneNode.getPositionX(), this.craneControlNode.craneNode.craneCockpitCollider.getPosition().y + this.craneControlNode.craneNode.craneCockpitCollider.getContentSize().height * 0.15);
        for(var counter = 0; counter < ACTIVITY_KEVINS_CRANE_1.ref.maxCharacterInGround; counter++) {
            var characterBox = ACTIVITY_KEVINS_CRANE_1.ref.getChildByTag(-1000 + counter);
            if(characterBox && cc.rectContainsPoint(characterBox.getBoundingBox(), colliderLocation)) {
                ACTIVITY_KEVINS_CRANE_1.ref.selectedCharacterFromGround = characterBox;
                ACTIVITY_KEVINS_CRANE_1.ref.selectedCharacterFromGround.runAction(cc.sequence(cc.delayTime(0.4), cc.rotateTo(0.1, 0)));
                this.craneControlNode.craneNode.addColliderImage(characterBox.text, 0);
                this.craneControlNode.craneNode.craneCockpitCollider.runAction(cc.sequence(cc.moveBy(0, 0, - this.craneControlNode.craneNode.craneCockpitCollider.height * 0.6), cc.delayTime(0.6), cc.fadeIn(0.1), cc.moveBy(0.2, 0, this.craneControlNode.craneNode.craneCockpitCollider.height * 0.6)));
                break;
            }
        }

        if(this.selectedCharacterFromGround){
           if(this.isStudentInteractionEnable && !this.isTeacherView){


           }

        }
    },

    checkCharcterFixingProcess : function() {
        var colliderLocation = cc.p(this.craneControlNode.craneNode.craneCockpitCollider.getPosition().x + this.craneControlNode.craneNode.getPositionX(), this.craneControlNode.craneNode.craneCockpitCollider.getPosition().y +  this.craneControlNode.craneNode.craneCockpitCollider.getContentSize().height * 0.5);
        ACTIVITY_KEVINS_CRANE_1.ref.checkConstructionCollision(colliderLocation, this.craneControlNode.craneNode.craneCockpitCollider.text);
    },

    colliderPositionUpdated : function() {
        if(ACTIVITY_KEVINS_CRANE_1.ref.selectedCharacterFromGround && this.craneControlNode.craneNode.isCharacterPicked)
            ACTIVITY_KEVINS_CRANE_1.ref.selectedCharacterFromGround.setPosition(cc.p(this.craneControlNode.craneNode.getPosition().x + this.craneControlNode.craneNode.craneCockpitCollider.getPosition().x, this.craneControlNode.craneNode.craneCockpitCollider.getPosition().y));
    },

    checkDemolishingCollision : function() {
        var crankColliderPosition   =   cc.p(this.craneControlNode.craneNode.craneCockpitCollider.getPosition().x + this.craneControlNode.craneNode.getPositionX(),
            this.craneControlNode.craneNode.craneCockpitCollider.getPosition().y + this.craneControlNode.craneNode.craneCockpitCollider.getContentSize().height * 0.5);
        var selectedCharacter       =   null;

        var collidedLayer           =   this.checkWhichLayerContainsPoint(crankColliderPosition);
        if(collidedLayer) {
            var convertedPosInLayer     =   collidedLayer.convertToNodeSpace(crankColliderPosition);
            for(var subChildCounter = 0; subChildCounter < collidedLayer.getChildrenCount(); subChildCounter++) {
                var characterBox    =   collidedLayer.children[subChildCounter];
                var updatedRect     =   cc.rect(convertedPosInLayer.x - this.craneControlNode.craneNode.craneCockpitCollider.getContentSize().width * 0.1, convertedPosInLayer.y - this.craneControlNode.craneNode.craneCockpitCollider.getContentSize().height * 0.1,
                                                this.craneControlNode.craneNode.craneCockpitCollider.getContentSize().width * 0.2, this.craneControlNode.craneNode.craneCockpitCollider.getContentSize().height * 0.2);
                if (cc.rectIntersectsRect(characterBox.getBoundingBox(), updatedRect)) {
                    selectedCharacter = characterBox;
                    break;
                }
            }
        }
        if(this.isStudentInteractionEnable){
            var data = {
                "rowNo"       : collidedLayer ? collidedLayer.getTag() : null,
                "characterNo" : selectedCharacter ? selectedCharacter.getTag(): null
            };

            ACTIVITY_KEVINS_CRANE_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                "eventType": ACTIVITY_KEVINS_CRANE_1.socketEventKey.MOVE_WREACKING_BALL,
                "data"      : data
            });
            this.brokeBlock(data);
        }
    },

    brokeBlock(data){
        if(data.characterNo != null && this.levelStatus == ACTIVITY_KEVINS_CRANE_1.LEVEL_STATE.ON_GOING) {
            var rowLayer = this.homeLayer.getChildByTag(data.rowNo);
            var selectedCharacter = rowLayer.getChildByTag(data.characterNo);
            if(selectedCharacter) {
                var data = {"rowCounter" : selectedCharacter.rowCounter, "tag" : selectedCharacter.getTag()};
                this.runAction(cc.sequence(cc.callFunc(this.craneControlNode.craneNode.runCraneSmasherAnimation, this.craneControlNode.craneNode),cc.callFunc(this.removeKey, this, data), cc.delayTime(1.0), cc.callFunc(this.playRoofAnimation, this), cc.delayTime(0.05), cc.callFunc(selectedCharacter.smokeBlastAnimation, selectedCharacter), cc.delayTime(0.2), cc.callFunc(this.updateGameRowData, this, data)));
                if(this.isTeacherView){
                    this.parent.setResetButtonActive(true);
                }
            }
        } else {
            this.craneControlNode.craneNode.runCraneSmasherAnimation();
        }
    },

    checkConstructionCollision : function(position) {
        var selectedCharacter       =   null;
        var collidedLayer           =   this.checkWhichLayerContainsPoint(position);
        if(collidedLayer) {
            var convertedPosInLayer     =   collidedLayer.convertToNodeSpace(position);
            for(var subChildCounter = 0; subChildCounter < collidedLayer.getChildrenCount(); subChildCounter++) {
                var characterBox = collidedLayer.children[subChildCounter];
                if(characterBox.getName() == "empty") {
                    if (cc.rectContainsPoint(characterBox.getBoundingBox(), convertedPosInLayer)) {
                        selectedCharacter = characterBox;
                        break;
                    }
                }
            }
        }
        if(selectedCharacter) {
            var data = {"rowCounter" : selectedCharacter.rowCounter, "tag" : selectedCharacter.getTag(), "text" : this.selectedCharacterFromGround.text};
            this.runAction(cc.sequence(cc.callFunc(this.craneControlNode.craneNode.runCraneElementPlaceAnimation, this.craneControlNode.craneNode), cc.delayTime(0.5), cc.callFunc(this.removeGroundCharacterRef, this), cc.callFunc(this.addCharacterAndUpdateGameRowData, this, data)));
            this.craneControlNode.craneNode.addColliderImage(" ", 0);
        }else {
            this.craneControlNode.craneNode.addColliderImage(" ", 0);
            this.craneControlNode.craneNode.runCraneElementPlaceAnimation();
            this.selectedCharacterFromGround.runAction(cc.sequence(cc.delayTime(0.5), this.fallCharacterToGround(this.selectedCharacterFromGround.getPositionX())));
        }
    },


    checkWhichLayerContainsPoint : function(position) {
        if(cc.rectContainsPoint(this.homeLayer.getBoundingBox(), position)) {
            var nodeSpaceLocation = this.homeLayer.convertToNodeSpace(position);
            var convertedPosInLayer = nodeSpaceLocation;

            for (var childCounter = 0; childCounter < this.maxNumberOfRows; childCounter++) {
                var rowLayer = this.homeLayer.getChildByTag(this.getRowCounterTag(childCounter));

                if (childCounter > 0)
                    convertedPosInLayer = rowLayer.convertToNodeSpace(position);

                if (cc.rectContainsPoint(rowLayer.getBoundingBox(), nodeSpaceLocation)) {
                    return rowLayer;
                }
            }
        }
        return null;
    },

    //********************************* GAME UI & LOGIC ENDED *************************************//
    //********************************* HOVER IMAGES & ANIMATION STARTED ************************//
    addAllImagesInBoard : function() {
        this.hintImagesBase = this.addSprite(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + ACTIVITY_KEVINS_CRANE_1.config.assets.sections.help_window.imageName,
            cc.p(this.getContentSize().width * 1.1, this.getContentSize().height * 0.9), this);
        this.hintImagesBase.setAnchorPoint(cc.p(0, 1));
        this.hintImagesBase.setLocalZOrder(10005);

        // var itemsImagesData =   ACTIVITY_KEVINS_CRANE_1.config.assets.sections.images_items_data.imagesData;
        var positionInX     =   this.hintImagesBase.getContentSize().width * 0.12;
        var positionInY     =   this.hintImagesBase.getContentSize().height * 0.825;

        var ref             =   this;
        var counter         =   1;
        for(let itemData of this.itemData){
            var item = ref.addSprite(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + itemData.imageName, cc.p(positionInX, positionInY), ref.hintImagesBase);
            item.setName(itemData.name);
            item.setScale(ref.hintImagesBase.getContentSize().width * 0.1 / item.getContentSize().width);

            var text    =   itemData.name;
            var title   =   ref.createTTFLabel(text, HDConstants.Sassoon_Medium, 80, HDConstants.Black, cc.p(item.getContentSize().width * 0.5, - item.getContentSize().height * item.getScale()), item);

            positionInX = positionInX + ref.hintImagesBase.getContentSize().width * 0.15;
            counter++;
            if ((counter - 1) % 6 == 0) {
                positionInX =   ref.hintImagesBase.getContentSize().width * 0.12;
                positionInY =   positionInY - ref.hintImagesBase.getContentSize().height * 0.3;
            }
        }
    },

    showOrHideBoard(openImageBoard) {
        if(this.isHintOpen){
            return;
        }
        var movement = this.hintImagesBase.getContentSize().width * (openImageBoard ? -1.2 : 1.2);
        var action   = new cc.MoveBy(0.5, movement, 0);
        var delay  = this.gameType == ACTIVITY_KEVINS_CRANE_1.GAME_TYPE.DEMOLISHING ? ACTIVITY_KEVINS_CRANE_1.config.assets.sections.demolishing.hintShowTime : ACTIVITY_KEVINS_CRANE_1.config.assets.sections.construction.hintShowTime;
        this.isHintOpen = true;
        this.hintImagesBase.runAction(cc.sequence(action, cc.delayTime(delay), action.reverse(), cc.callFunc(()=>{
            ACTIVITY_KEVINS_CRANE_1.ref.isHintOpen = false;
        })));
    },

    addResetHoverImage : function() {
        this.resetHoverImage = this.addSprite(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + ACTIVITY_KEVINS_CRANE_1.config.assets.sections.reset_cover_up.imageName,
            cc.p(-this.getContentSize().width * 0.1, this.getContentSize().height * 0.55), this);
        this.resetHoverImage.setAnchorPoint(cc.p(1, 0.5));
        this.resetHoverImage.setLocalZOrder(1400);
    },


    showResetHover() {
        var movement = this.resetHoverImage.getContentSize().width * 1.15;
        if(this.isResetAnimationPlaying) return
        this.isResetAnimationPlaying = true;
        this.resetHoverImage.runAction(cc.sequence(cc.moveBy(0.5, movement, 0), cc.delayTime(1.0), cc.callFunc(this.reconstructHome,this), cc.moveBy(0.5, -movement, 0),cc.callFunc(this.sendAnimationEndAck, this), cc.delayTime(3), cc.callFunc(this.enableControllerTouch, this)));
    },


    //************************ HOVER IMAGES ENDED ***************************************//
    //************************ ANIMATION STARTED ****************************************//
    getHomeAnimation : function() {
        return cc.sequence(cc.rotateTo(0.25, 0.8), cc.rotateTo(0.25, -0.8), cc.rotateTo(0.15, 0.5), cc.rotateTo(0.15, -0.5), cc.rotateTo(0.05, 0));
    },

    playRoofAnimation : function() {
        var roof = this.homeLayer.getChildByTag(ACTIVITY_KEVINS_CRANE_1.Tag.HOME_ROOF);
        roof.runAction(cc.sequence(cc.moveBy(0.1,0, 8), cc.rotateTo(0.1, 2), cc.moveBy(0.1, 0, -7), cc.rotateTo(0.1, -1), cc.moveBy(0.0, 0, -1), cc.rotateTo(0.0, 0)));
    },

    playBreakAnimation : function() {
        var roof = this.homeLayer.getChildByTag(ACTIVITY_KEVINS_CRANE_1.Tag.HOME_ROOF);
        roof.runAction(this.getBreakAnimation());
        //FloorBalancer
        for (var floorBalancerCounter = this.maxNumberOfRows - 1; floorBalancerCounter > 0; floorBalancerCounter--) {
            var floorBalancer = this.homeLayer.getChildByTag(ACTIVITY_KEVINS_CRANE_1.Tag.BALANCER_ROW_1 + (this.maxNumberOfRows - (floorBalancerCounter + 1)))
            floorBalancer.runAction(this.getBreakAnimation());
            // console.log("floorBalancer", floorBalancerCounter);
        }
        //Characters
        for(var childCounter = 0; childCounter < this.maxNumberOfRows; childCounter++) {
            var rowLayer    =   this.homeLayer.getChildByTag(this.getRowCounterTag(childCounter));
            var rowChildren =   rowLayer.getChildren();
            for(var subChildCounter = 0; subChildCounter < rowLayer.getChildrenCount(); subChildCounter++) {
                var characterBox = rowChildren[subChildCounter];
                if(characterBox) {
                    characterBox.runWrongCharacterBlastAnimation();
                }
            }
        }
        this.runAction(cc.sequence(cc.delayTime(1.75), cc.callFunc(this.addDustImage, this), cc.delayTime(3), cc.callFunc(this.moveToNextLevel, this)));
    },

    getBreakAnimation : function() {
        var magicNumber = 10 + Math.random() * 10;
        var action = cc.sequence(cc.rotateBy(0.4, 20), cc.rotateBy(0.4, -20), cc.rotateBy(0.25, 10), cc.rotateBy(0.25, 10), cc.spawn(cc.rotateBy(0.2, 5), cc.moveTo(0.5, this.homeLayer.getPosition().x + this.homeLayer.getContentSize().width * 0.5, this.homeLayer.getPosition().y - this.homeLayer.getContentSize().height * 0.5)));
        if(magicNumber > 14)
            action = cc.sequence(cc.rotateBy(0.4, 20), cc.rotateBy(0.4, -20), cc.rotateBy(0.25, 10), cc.rotateBy(0.25, -10), cc.spawn(cc.rotateBy(0.2, -5), cc.moveTo(0.5, this.homeLayer.getPosition().x + this.homeLayer.getContentSize().width * 0.5, this.homeLayer.getPosition().y - this.homeLayer.getContentSize().height * 0.5)));
        return action;
    },

    fallCharacterToGround : function(positionX) {
        var magicNumber = 10 + Math.random() * 10;
        var rotationAngle   =   20;
        if(magicNumber > 13)
            rotationAngle   =   -20;
        return cc.spawn(cc.moveTo(0.25, positionX, this.getContentSize().height * 0.1), cc.rotateTo(0.25, rotationAngle));
    },

    //************************ ANIMATION ENDED *******************************************//
    //************************ DATA MODIFICATION STARTED *********************************//
    removeKey : function(ref, rowData){
        var displayWords = this.gameData[rowData.rowCounter].display_word;
        displayWords = this.removeCharacterAtIndex(displayWords, rowData.tag);
        this.gameData[rowData.rowCounter].display_word = displayWords;
    },

    updateGameRowData(ref, rowData) {
        var displayWords = this.gameData[rowData.rowCounter].display_word;
        this.addCharacterInRow(displayWords, rowData.rowCounter);

       /*
          Turn based :
          Only selected student can send socket call
          if there is no sleected student i.e only if teacher is playing then teacher will send sokcet call

          Individual mode :
          each one can play there own game and send socket event:
          if teacher is previewing only selected student will send socket call

       * */

        if((this.isStudentInteractionEnable && !this.isTeacherView) || (this.isTeacherView && !this.isStudentSelected)) {
            console.log("send brick broke information to others");
            if (this.checkIfWordFormationPossible(rowData.rowCounter)) {
                this.playWordSuccessAnimation();
                this.levelStatus = ACTIVITY_KEVINS_CRANE_1.LEVEL_STATE.ON_GOING;
            }else {
                this.levelStatus = ACTIVITY_KEVINS_CRANE_1.LEVEL_STATE.FAILED;
                this.playWordFailedAnimation(ACTIVITY_KEVINS_CRANE_1.LEVEL_STATE.FAILED);
            }
            var dataToSend = this.createDataToSend();
            ACTIVITY_KEVINS_CRANE_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                "eventType": ACTIVITY_KEVINS_CRANE_1.socketEventKey.BRICK_BROCK,
                "data": dataToSend
            });

            this.updateUserInfo(dataToSend);
        }


    },

    playWordSuccessAnimation : function(){
        console.log("inisde win ",this.checkIfAllWordsCompleted(),  this.gameData);
        this.homeLayer.runAction(cc.sequence(cc.delayTime(0.1), this.getHomeAnimation()));
        if (this.checkIfAllWordsCompleted()) {
            if (this.currentLevel < this.totalLevels - 1) {
                this.currentLevel++;
                this.levelStatus = ACTIVITY_KEVINS_CRANE_1.LEVEL_STATE.WON;
                // disable all touch events:
                this.craneControlNode.isAnimationStarted = true;
                this.moveToNextLevel();

            }
        }else{
            console.log("playWordSuccessAnimation",this.checkIfAllWordsCompleted() , this.isTeacherView);
        }
    },

    playWordFailedAnimation : function(levelStatus){
        console.log("play word failed animation");
        this.playBreakAnimation();
        this.craneControlNode.isAnimationStarted = true;
        this.levelStatus = levelStatus;

    },

    moveToNextLevel : function() {
        console.log("move to next level", this.levelStatus, this.currentLevel);
        if(this.levelStatus == ACTIVITY_KEVINS_CRANE_1.LEVEL_STATE.ON_GOING) return // teacher has called reset button so don't automatically call start new level
        // console.log("move to next level", this.isStudentInteractionEnable);
        if(this.isTeacherView && this.isTurnBased() || !this.isTurnBased()){
            ACTIVITY_KEVINS_CRANE_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                "eventType": ACTIVITY_KEVINS_CRANE_1.socketEventKey.START_NEXT_LEVEL,
                "data": {
                    "level"         : this.currentLevel,
                    "levelStatus"   : this.levelStatus
                }
            });
            this.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(this.startNewLevel, this)));
        }
    },


    isTurnBased : function(){
        return this.multiPlayerType == ACTIVITY_KEVINS_CRANE_1.MULTIPLAYER_TYPE.TURN_BASED ? true : false
    },

    startNewLevel : function(data){
        this.gameData.length = 0;
        if (this.gameType == ACTIVITY_KEVINS_CRANE_1.GAME_TYPE.DEMOLISHING) {
            for(let item of ACTIVITY_KEVINS_CRANE_1.config.assets.sections.demolishing.levels.data[this.currentLevel].words){
                this.gameData.push({...item});
            }
        } else {
            for(let item of ACTIVITY_KEVINS_CRANE_1.config.assets.sections.construction.levels.data[this.currentLevel].words){
                this.gameData.push({...item});
            }
        }

        console.log("start  next level",this.currentLevel);
        this.levelStatus = ACTIVITY_KEVINS_CRANE_1.LEVEL_STATE.ON_GOING;
        this.showResetHover();
        this.setupCharacters();
        this.removeChildByTag(ACTIVITY_KEVINS_CRANE_1.Tag.HINT_BASE);
        this.addHintImagesBase();
        var dataToSend = this.createDataToSend();
        this.updateUserInfo(dataToSend);

    },

    updateBrickInfo(levelStatus){

        console.log("update brick info")
        if(levelStatus == ACTIVITY_KEVINS_CRANE_1.LEVEL_STATE.ON_GOING){
            this.playWordSuccessAnimation();
        }else if(levelStatus == ACTIVITY_KEVINS_CRANE_1.LEVEL_STATE.FAILED){
            this.playWordFailedAnimation(levelStatus);
        }
    },

    addCharacterAndUpdateGameRowData(ref, data) {
        var displayWords        =   this.gameData[data.rowCounter].display_word;
        displayWords            =   displayWords.substring(0, data.tag) + data.text + displayWords.substring(data.tag + 1);
        this.gameData[data.rowCounter].display_word = displayWords;

        this.addCharacterInRow(displayWords, data.rowCounter);

        if(this.checkIfWordConstructionPossible(data.rowCounter))
            this.homeLayer.runAction(cc.sequence(cc.delayTime(0.1), this.getHomeAnimation()));
        else
            this.playBreakAnimation();
    },

    removeCharacterAtIndex : function(word, index) {
        var tempWord = word.split('');
        tempWord.splice(index , 1); // remove 1 element from the array (adjusting for non-zero-indexed counts)
        word =  tempWord.join('')
        return word;
    },

    checkifCorrectWordAchieved : function(counter) {
        var correctWord         =   this.gameData[counter].correct_word;
        var displayWord         =   this.gameData[counter].display_word;
        // console.log("correct word",correctWord, displayWord );
        if(correctWord == displayWord)
            return true;

        return false;
    },

    checkIfWordConstructionPossible : function(counter) {
        var displayWord         =   this.gameData[counter].display_word;
        var correctWord         =   this.gameData[counter].correct_word;
        var isPossible          =   true;

        if(displayWord == correctWord)
            return true;

        for(var displayCounter = 0; displayCounter < correctWord.length; displayCounter++) {
            if(correctWord[displayCounter] != displayWord[displayCounter] && displayWord[displayCounter] != " ") {
                isPossible      =   false;
                break;
            }
        }
        return isPossible;
    },

    checkIfWordFormationPossible : function(counter) {
        var correctWord         =   this.gameData[counter].correct_word;
        var displayWord         =   this.gameData[counter].display_word;
        var tempString          =   "";

        var correctWordCounter  =   0;
        var correctCharAtIndex  =   correctWord[correctWordCounter];
        for(var displayCounter = 0; displayCounter < displayWord.length && correctWord.length > correctWordCounter; displayCounter++) {
            if(correctCharAtIndex == displayWord[displayCounter]) {
                tempString          +=  correctCharAtIndex;
                correctWordCounter  =   correctWordCounter + 1;
                correctCharAtIndex  =   correctWord[correctWordCounter]
            }
        }
        if(tempString == correctWord)
            return true;

        return false;
    },

    checkIfAllWordsCompleted : function() {
        var correctWordAchieved = true;
        for(var gameOverCounter = 0; gameOverCounter < this.maxNumberOfRows; gameOverCounter++) {
            correctWordAchieved = this.checkifCorrectWordAchieved(gameOverCounter);
            if(!correctWordAchieved)
                break;
        }
        return correctWordAchieved;
    },


    sendAnimationEndAck : function(){
        this.isResetAnimationPlaying = false;
        console.log("send end ack to others");
        this.onAckReceived(data = {"name" : HDAppManager.username})
        ACTIVITY_KEVINS_CRANE_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            'eventType': ACTIVITY_KEVINS_CRANE_1.socketEventKey.ANIMATION_ENDED_ACK,
            'data': {name: HDAppManager.username}
        });
    },

    onAckReceived : function(data){
        console.log("Received  end ack to others");
        var user = this.userAckArray.filter(item => item == data.name);
        if (user.length == 0) {
            this.userAckArray.push(user);
            if (this.userAckArray.length == this.joinedStudentList.length + 1) {
                this.enableControllerTouch();
                this.userAckArray.length = 0;
            }
        }
    },


    enableControllerTouch : function(){
        this.craneControlNode.isAnimationStarted = false;
    },





    //********************************** DATA MODIFICATION ENDED **************************//
    //******************************** TOUCH LISTENERS EVENTS STARTED *************************//
    shaftButtonPressed : function() {
        // console.log("check collison");
        this.checkCollision();
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
        if (!ACTIVITY_KEVINS_CRANE_1.ref.isStudentInteractionEnable)
            return;
    },

    onMouseUp: function (event) {
        if (!ACTIVITY_KEVINS_CRANE_1.ref.isStudentInteractionEnable)
            return;
    },

    onMouseMove: function (event) {
        if( !ACTIVITY_KEVINS_CRANE_1.ref) return;
        ACTIVITY_KEVINS_CRANE_1.ref.updateMouseIcon(event.getLocation());
        if (!ACTIVITY_KEVINS_CRANE_1.ref.isStudentInteractionEnable)
            return;

    },
    //******************************** TOUCH LISTENERS EVENTS ENDED *************************//

    //******************************** SOCKET EVENTS ***************************************//
    updateRoomData: function () {
        // console.log("updae user inof", ACTIVITY_KEVINS_CRANE_1.ref.gamePlayInfo);
        SocketManager.emitCutomEvent("SingleEvent", {
            'eventType': HDSocketEventType.UPDATE_ROOM_DATA,
            'roomId': HDAppManager.roomId,
            'data': {
                "roomId": HDAppManager.roomId,
                "roomData": {
                    "activity": ACTIVITY_KEVINS_CRANE_1.config.properties.namespace,
                    "data": {
                        'gameType'          : ACTIVITY_KEVINS_CRANE_1.ref.gameType,
                        'level'             : ACTIVITY_KEVINS_CRANE_1.ref.currentLevel,
                        'gamePlayInfo'      : JSON.stringify(ACTIVITY_KEVINS_CRANE_1.ref.gamePlayInfo),
                        'multiPlayerType'   : ACTIVITY_KEVINS_CRANE_1.ref.multiPlayerType
                    },
                    "activityStartTime": HDAppManager.getActivityStartTime()
                }
            }
        }, null);

        // console.log("user room data", JSON.stringify(ACTIVITY_KEVINS_CRANE_1.ref.gamePlayInfo));
    },

    updateStudentInteraction: function (username, status) {
        if (this.isTeacherView) {
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                "eventType": ACTIVITY_KEVINS_CRANE_1.socketEventKey.STUDENT_INTERACTION,
                "data": {"userName": username, "status": status}
            });
        }
    },

    onUpdateStudentInteraction: function (params) {
        if (params.userName == HDAppManager.username) {
            ACTIVITY_KEVINS_CRANE_1.ref.isStudentInteractionEnable = params.status;
        }
    },


    socketListener: function (res) {
        if (!ACTIVITY_KEVINS_CRANE_1.ref)
            return;
        switch (res.eventType) {
            case HDSocketEventType.DISABLE_STUDENT_INTERACTION:
                break;
            case HDSocketEventType.DISABLE_INTERACTION:
                ACTIVITY_KEVINS_CRANE_1.ref.disableInteraction(res.data);
                break;
            case HDSocketEventType.RECEIVE_GRADES:
                break;
            case HDSocketEventType.STUDENT_STATUS:
                ACTIVITY_KEVINS_CRANE_1.ref.studentStatus(res.data);
                break;
            case HDSocketEventType.STUDENT_TURN:
                ACTIVITY_KEVINS_CRANE_1.ref.studentTurn(res.data);
                break;
            case HDSocketEventType.GAME_MESSAGE:
                // console.log("game mode",  ACTIVITY_KEVINS_CRANE_1.ref.isPreviewMode,  ACTIVITY_KEVINS_CRANE_1.ref.multiPlayerType )
                if (res.data.userName == HDAppManager.username  || !ACTIVITY_KEVINS_CRANE_1.ref )
                    return;
                ACTIVITY_KEVINS_CRANE_1.ref.gameEvents(res.data);
                break;
        }
    },

    disableInteraction: function (enable) {
        this.isStudentInteractionEnable = enable;
    },

    studentTurn: function (res) {
        let users = res.users;
        if (this.isTeacherView) {
            this.isStudentSelected = users.length > 0 ? true : false;
        } else {
            if(users.length == 0) {
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
            if(data){
                this.joinedStudentList = data.users;
                console.log("joined student list",  this.joinedStudentList);
            }
    },

    gameEvents: function (res) {
        if (!ACTIVITY_KEVINS_CRANE_1.ref)
            return;

        console.log(this.isTurnBased() || this.isPreviewMode &&  res.userName == this.previewingStudentName );
        switch (res.eventType) {
            case ACTIVITY_KEVINS_CRANE_1.socketEventKey.STUDENT_INTERACTION:
                ACTIVITY_KEVINS_CRANE_1.ref.onUpdateStudentInteraction(res.data);
                break;

            case ACTIVITY_KEVINS_CRANE_1.socketEventKey.CRANE_MOVEMENT:
                if(this.isTurnBased() || this.isPreviewMode &&  res.userName == this.previewingStudentName ){
                    ACTIVITY_KEVINS_CRANE_1.ref.updateCranePosition(res.data);
                }
                this.updateUserInfo(JSON.parse(res.data.userInfo));
                break;

            case ACTIVITY_KEVINS_CRANE_1.socketEventKey.HELP:
                if(this.isTurnBased() || (this.isPreviewMode &&  res.userName == this.previewingStudentName))
                ACTIVITY_KEVINS_CRANE_1.ref.showOrHideBoard(res.data.show);
                break;

            case ACTIVITY_KEVINS_CRANE_1.socketEventKey.MOVE_WREACKING_BALL:
                if(this.isTurnBased() || (this.isPreviewMode &&  res.userName == this.previewingStudentName))
                ACTIVITY_KEVINS_CRANE_1.ref.brokeBlock(res.data);
                break;

            case ACTIVITY_KEVINS_CRANE_1.socketEventKey.CHANGE_MULTIPLAYER_MODE:
                ACTIVITY_KEVINS_CRANE_1.ref.multiPlayerType = res.data.mode;
                break;


            case ACTIVITY_KEVINS_CRANE_1.socketEventKey.CRANE_STOP:
                if(this.isTurnBased() || (this.isPreviewMode &&   res.userName == this.previewingStudentName))
                ACTIVITY_KEVINS_CRANE_1.ref.stopCrane(res.data);
                this.updateUserInfo(JSON.parse(res.data.userInfo));
                break;

            case ACTIVITY_KEVINS_CRANE_1.socketEventKey.REPLAY:
                ACTIVITY_KEVINS_CRANE_1.ref.restart(res.data.levelNo);
                break;

            case ACTIVITY_KEVINS_CRANE_1.socketEventKey.USER_DATA:
                console.log("update user data", res.data);
                 this.updateUserInfo(res.data);
                 break;


            case ACTIVITY_KEVINS_CRANE_1.socketEventKey.START_NEXT_LEVEL:
                this.currentLevel = res.data.level;
                this.startNewLevel();
                break;

            case ACTIVITY_KEVINS_CRANE_1.socketEventKey.BRICK_BROCK:
                this.updateUserInfo(res.data);
                if(this.isTurnBased() || (this.isPreviewMode &&   res.userName == this.previewingStudentName))
                this.updateBrickInfo(res.data.userGamePlay.userData.levelStatus);
                break;

            case ACTIVITY_KEVINS_CRANE_1.socketEventKey.ANIMATION_ENDED_ACK:
                this.onAckReceived(res.data);
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
            "eventType" :   eventType,
            "data"      :   data,
            "roomId"    :   HDAppManager.roomId,
        }
        SocketManager.emitCutomEvent(HDSingleEventKey, dataObj);
    },
    syncData: function (data) {
        ACTIVITY_KEVINS_CRANE_1.ref.syncInfo = data;
    },
    updateCranePosition : function(data){
        ACTIVITY_KEVINS_CRANE_1.ref.craneControlNode.setShaftFrame(data.angle, data.isIdle);
    },
    stopCrane : function(data){;
        ACTIVITY_KEVINS_CRANE_1.ref.craneControlNode.setShaftFrame(data.angle, data.isIdle);
        if(!data.isIdle){
            this.craneControlNode.craneNode.startMoveAnimation();
        }
        var craneInfo   =   JSON.parse(data.craneInfo);
        var moveFactor  =   this.getContentSize().width * 0.075;
        var duration    =   Math.abs(this.craneControlNode.craneNode.getPosition().x - craneInfo.position.x)  / moveFactor;

        this.craneControlNode.craneNode.runAction(cc.sequence(cc.moveTo(duration, craneInfo.position.x, craneInfo.position.y), cc.callFunc(this.craneControlNode.craneNode.stopMoveAnimation, this.craneControlNode.craneNode), cc.callFunc(this.craneControlNode.craneNode.runCraneIdleAnimation, this.craneControlNode.craneNode)));
        this.craneControlNode.craneNode.craneCockpit.setPosition(craneInfo.cockpitPosition);
        this.craneControlNode.craneNode.craneCockpitCollider.setPosition(craneInfo.colliderPosition);
        duration        =   0.05 * (craneInfo.cylenderScaleY);
        this.craneControlNode.craneNode.craneCylinder.runAction(cc.scaleTo(duration, this.craneControlNode.craneNode.craneCylinder.getScaleX(), craneInfo.cylenderScaleY));
    },
    updateUserInfo : function(data, caller) {
            var userExist = false;
            for (let user in this.gamePlayInfo) {
                if (user == data.userGamePlay.username) {
                    this.gamePlayInfo[data.userGamePlay.username] = data.userGamePlay.userData;
                    userExist = true;
                    break;
                }
            }
            if (!userExist) {
                this.gamePlayInfo[data.userGamePlay.username] = data.userGamePlay.userData;
            }

            if (this.multiPlayerType == ACTIVITY_KEVINS_CRANE_1.MULTIPLAYER_TYPE.TURN_BASED) {
                for (let user in this.gamePlayInfo) {
                    this.gamePlayInfo[user] = data.userGamePlay.userData;
                }

            }

        if(this.isTeacherView){
           this.updateRoomData();
       }
    },
    updateUI : function(){
        this.multiPlayerType = this.syncInfo.multiPlayerType;
        this.gameType        = this.syncInfo.gameType;
        this.gamePlayInfo     = JSON.parse(this.syncInfo.gamePlayInfo);

        var userDataPresent = false;
        if(this.multiPlayerType == ACTIVITY_KEVINS_CRANE_1.MULTIPLAYER_TYPE.INDIVIDUAL){
            for(let user in this.gamePlayInfo) {
                if (user == HDAppManager.username) {
                    this.gameData           = this.gamePlayInfo[user].rowInfo;
                    this.syncInfo           = null;
                    userDataPresent         = true;
                    this.levelStatus        = this.gamePlayInfo[user].levelStatus;
                    this.currentLevel              = this.gamePlayInfo[user].level;
                    this.setupCharacters();
                    this.syncCranePosition(this.gamePlayInfo[user].craneInfo);
                    lesson_1.ref.setStudentsPreviewPanelActive(true);
                    lesson_1.ref.turnBased = false;
                    this.getChildByTag(ACTIVITY_KEVINS_CRANE_1.Tag.MULTIPLAYER_MODE).loadTextures(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + ACTIVITY_KEVINS_CRANE_1.config.buttons.data.multiplayerMode.disableState, null, ACTIVITY_KEVINS_CRANE_1.spriteBasePath + ACTIVITY_KEVINS_CRANE_1.config.buttons.data.multiplayerMode.disableState);
                    this.getChildByTag(ACTIVITY_KEVINS_CRANE_1.Tag.MULTIPLAYER_MODE).setTouchEnabled(false);
                }
                if(!userDataPresent){
                    this.levelStatus  = 1;
                    this.currentLevel        = 0;
                }
            }
        }else{
                for(let user in this.gamePlayInfo){
                    console.log("inside turn based" , this.gamePlayInfo[user].levelStatus, this.gamePlayInfo[user].level);
                    this.gameData        = this.gamePlayInfo[user].rowInfo;
                    this.levelStatus     = this.gamePlayInfo[user].levelStatus;
                    this.currentLevel           = this.gamePlayInfo[user].level;
                    userDataPresent      = true;
                    this.setupCharacters();
                    this.syncCranePosition(this.gamePlayInfo[user].craneInfo);
                    break;
                }
        }


        this.removeChildByTag(ACTIVITY_KEVINS_CRANE_1.Tag.HINT_BASE);
        this.addHintImagesBase();



        switch( this.levelStatus){
            case  ACTIVITY_KEVINS_CRANE_1.LEVEL_STATE.FAILED:
                this.playBreakAnimation();
                break;

            case ACTIVITY_KEVINS_CRANE_1.LEVEL_STATE.WON:
        }

    },
    showPreview : function(userName){
        var  previewingStudent = userName ? userName : HDAppManager.username;
        if(this.gamePlayInfo[previewingStudent]){
            this.gameData = this.gamePlayInfo[previewingStudent].rowInfo;
            this.setupCharacters();
            if(this.gamePlayInfo[previewingStudent].levelStatus == ACTIVITY_KEVINS_CRANE_1.LEVEL_STATE.ON_GOING){
                this.reconstructHome();
            }
            this.syncCranePosition(this.gamePlayInfo[previewingStudent].craneInfo);
            this.removeChildByTag(ACTIVITY_KEVINS_CRANE_1.Tag.HINT_BASE);
            this.addHintImagesBase();

        }
    },
    syncCranePosition(data){
        this.craneControlNode.craneNode.setPosition(data.position);
        this.craneControlNode.craneNode.craneCockpit.setPosition(data.cockpitPosition);
        this.craneControlNode.craneNode.craneCockpitCollider.setPosition(data.colliderPosition);
        this.craneControlNode.craneNode.craneCylinder.setScaleY(data.cylenderScaleY);
    },
    reset: function(){
        console.log("reset called");
        ACTIVITY_KEVINS_CRANE_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {

            "eventType"     :   ACTIVITY_KEVINS_CRANE_1.socketEventKey.REPLAY,
            "data"          :   {
                "levelNo"   :   0,

            }
        });
        this.restart(this.currentLevel);
    },
    restart : function(level){
        console.log("inside reset");
        this.currentLevel                = level;
        this.gamePlayInfo.length         = 0;
        this.syncInfo                    = null;
        this.handIconUI.length           = 0;
        this.multiPlayerType             = ACTIVITY_KEVINS_CRANE_1.MULTIPLAYER_TYPE.TURN_BASED;
        this.gameData.length             = 0;
        this.levelStatus                 =  ACTIVITY_KEVINS_CRANE_1.LEVEL_STATE.ON_GOING;
        this.removeAllChildren();
        this.setupUI();
        // this.craneNode.isAnimationStarted = true;
        this.runAction(cc.sequence(cc.delayTime(0.4), cc.callFunc(this.showResetHover, this)));
    },
    createDataToSend : function(){
        ACTIVITY_KEVINS_CRANE_1.ref.craneInfo = {
            "position"           :   this.craneControlNode.craneNode.getPosition() ,
            "cockpitPosition"    :   this.craneControlNode.craneNode.craneCockpit.getPosition(),
            "colliderPosition"   :   this.craneControlNode.craneNode.craneCockpitCollider.getPosition(),
            "cylenderScaleY"     :   this.craneControlNode.craneNode.craneCylinder.getScaleY(),
        };

        var data  = {
            "craneInfo"         : ACTIVITY_KEVINS_CRANE_1.ref.craneInfo,
            "rowInfo"           : this.gameData,
            "level"             : this.currentLevel,
            "levelStatus"       : this.levelStatus

        }

        var dataToSend = {
            "userGamePlay" : {
                "username"      :   HDAppManager.username,
                "userData"      :   data
            }
        };


        return {...dataToSend};
    },
    buttonCallback: function (sender, type) {
        if(!this.isStudentInteractionEnable){
           return;
        }
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                switch (sender.getTag()) {
                    case ACTIVITY_KEVINS_CRANE_1.Tag.HELP_BUTTON:
                        if(this.isHintOpen) return;
                        if(ACTIVITY_KEVINS_CRANE_1.ref.multiPlayerType == ACTIVITY_KEVINS_CRANE_1.MULTIPLAYER_TYPE.TURN_BASED){
                            this.showOrHideBoard(true);
                            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                                "eventType" :   ACTIVITY_KEVINS_CRANE_1.socketEventKey.HELP,
                                "data"      :   {
                                    "show"  :   true,
                                }
                            });
                        }else{
                            this.showOrHideBoard(true);
                        }
                        break;

                    case ACTIVITY_KEVINS_CRANE_1.Tag.MULTIPLAYER_MODE:
                        sender.setTouchEnabled(false);
                        this.multiPlayerType = ACTIVITY_KEVINS_CRANE_1.MULTIPLAYER_TYPE.INDIVIDUAL;
                        lesson_1.ref.turnBased = false;
                        lesson_1.ref.setStudentsPreviewPanelActive(true);
                        sender.loadTextures(ACTIVITY_KEVINS_CRANE_1.spriteBasePath + ACTIVITY_KEVINS_CRANE_1.config.buttons.data.multiplayerMode.disableState, null, ACTIVITY_KEVINS_CRANE_1.spriteBasePath + ACTIVITY_KEVINS_CRANE_1.config.buttons.data.multiplayerMode.disableState );
                        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                            "eventType" :   ACTIVITY_KEVINS_CRANE_1.socketEventKey.CHANGE_MULTIPLAYER_MODE,
                            "data"      :   {
                                "mode"  :   ACTIVITY_KEVINS_CRANE_1.MULTIPLAYER_TYPE.INDIVIDUAL,
                            }
                        });
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
        let handICon = false;
        for (let obj of this.handIconUI) {
            if (cc.rectContainsPoint(obj.getBoundingBox(), obj.getParent().convertToNodeSpace(location))) {
                handICon = true;
                break;
            }
        }
        if (handICon) {
            this.interactableObject = true;
            this.customTexture = false;
        }
    },
});
