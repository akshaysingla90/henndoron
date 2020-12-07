var ACTIVITY_HUNGRY_FLUPE_1 = {};
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

}
ACTIVITY_HUNGRY_FLUPE_1.gameState = {
    NOT_STARTED : 0,
    STARTED     : 1,
    COMPLETED   : 2,
    STOP: 3
};
ACTIVITY_HUNGRY_FLUPE_1.CollisionType =  {
    Flupe: 1,
    Bubbles: 2,
    SideWall: 3,
    BottomWall: 4,
    AnimationInitiator: 5,
};
ACTIVITY_HUNGRY_FLUPE_1.ref = null;
ACTIVITY_HUNGRY_FLUPE_1.HungryFlupeLayer = HDBaseLayer.extend({
    isTeacherView           : false,
    isPreviewMode           : false,
    gameState               : ACTIVITY_HUNGRY_FLUPE_1.gameState.NOT_STARTED,
    interactableObject      : null,
    customTexture           : null,
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


    ctor: function () {
        this._super();
    },
    onEnter: function () {
        this._super();
        ACTIVITY_HUNGRY_FLUPE_1.ref = this;
        ACTIVITY_HUNGRY_FLUPE_1.ref.catchesBubblesName = new Set();
        ACTIVITY_HUNGRY_FLUPE_1.ref.gameState = ACTIVITY_HUNGRY_FLUPE_1.gameState.NOT_STARTED;
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
            ACTIVITY_HUNGRY_FLUPE_1.ref.isTeacherView = HDAppManager.isTeacherView;
            ACTIVITY_HUNGRY_FLUPE_1.ref.gamePlayTime = config.properties.gamePlayTime;
            ACTIVITY_HUNGRY_FLUPE_1.ref.setupUI();
            if (ACTIVITY_HUNGRY_FLUPE_1.ref.isTeacherView) {
                ACTIVITY_HUNGRY_FLUPE_1.ref.updateRoomData();
                ACTIVITY_HUNGRY_FLUPE_1.ref.isStudentInteractionEnable = true;
            }
            ACTIVITY_HUNGRY_FLUPE_1.ref.triggerScript(config.teacherScripts.data.moduleStart.content.ops);
            ACTIVITY_HUNGRY_FLUPE_1.ref.setPushButtonActive();
        });
    },
    onExit: function () {
        this._super();
        ACTIVITY_HUNGRY_FLUPE_1.ref.removeAllChildrenWithCleanup(true);
        ACTIVITY_HUNGRY_FLUPE_1.ref.customTexture = false;
        ACTIVITY_HUNGRY_FLUPE_1.ref.interactableObject = false;
        ACTIVITY_HUNGRY_FLUPE_1.ref = null;
    },
    setupUI: function () {
        this.setBackground( ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath +
            ACTIVITY_HUNGRY_FLUPE_1.config.background.sections.background.imageName);
        this.initPhysics();
        this.setupBoundry();
        this.setupOptionButtons();
        this.scheduleUpdate();
        this.setupControlButton();
        this.setupBubblePanel();
        this.setupFlupes();
        this.setupTimer();
        //this.populateBubbles(5);
        this.flupeCollisionWithBubbles();
        this.flupeCollidedWithAnimationWall();
        this.flupeCollidedWithBottomWall();
        this.updateFlupes([]);
        if(this.syncDataInfo){
            this.updateUIWithSyncData();
        }
        this.fetchConnectedStudents();
    },
    onEnterTransitionDidFinish: function (){
        this._super();
        console.trace();
        this.setPushButtonActive();
        this.fetchConnectedStudents();

    },
    fetchConnectedStudents: function (){
        SocketManager.emitCutomEvent(HDSingleEventKey, {
            eventType: HDSocketEventType.STUDENT_STATUS,
            data: {
                roomId: HDAppManager.roomId,
            },
        });
    },
    attachGlow : function (sprite){
        if(sprite.glow) return sprite.glow.setVisible(true);
        let animationProps = ACTIVITY_HUNGRY_FLUPE_1.config.assets.animation.data.glowing_outline_land;
        let glow = this.addSprite(ACTIVITY_HUNGRY_FLUPE_1.animationBasePath +
            animationProps.frameInitial +  ("000" + animationProps.frameCount).slice(-4) + ".png",
            cc.p(sprite.getContentSize().width * 0.5, sprite.getContentSize().height * 0.5),
            sprite
        );
        glow.setName("glow");
        sprite.glow = glow;
    },

    /**
     * setupOptionButtons: This will create option button for teacher.
     */
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
    initPhysics: function (){
        this.space = new cp.Space();
        //setup the Gravity
        this.space.gravity = cp.v(0, -1000); //Earth gravity
        this.space.iterations = 30;
        this.space.sleepTimeThreshold = Infinity;
        this.space.collisionSlop = Infinity;
        // this._debugNode = new cc.PhysicsDebugNode(this.space);
        // this.addChild(this._debugNode);
    },
    update : function (dt){
        this.space.step(dt);
        this.flupeList.forEach(flupe=>{
            flupe.setRotation(0);
            flupe.setPosition(cc.p(flupe.initialPos.x, flupe.getPositionY()));
        });
        ACTIVITY_HUNGRY_FLUPE_1.ref.deleteObj.forEach(obj=>{
            console.log("update called for delettion");
            if( ACTIVITY_HUNGRY_FLUPE_1.ref.space.containsBody(obj.b)) {
                console.log("update called for deletion and deleted");
                obj.b.sprite.runAction(cc.sequence(cc.fadeOut(0.1), cc.removeSelf()));
                ACTIVITY_HUNGRY_FLUPE_1.ref.space.removeBody(obj.b);
                ACTIVITY_HUNGRY_FLUPE_1.ref.updateBubblePanel(obj.b.name);
                ACTIVITY_HUNGRY_FLUPE_1.ref.space.removeShape(obj.s);
                ACTIVITY_HUNGRY_FLUPE_1.ref.deleteObj.splice(
                    ACTIVITY_HUNGRY_FLUPE_1.ref.deleteObj.indexOf(obj), 1
                )
            }
        });
        if(ACTIVITY_HUNGRY_FLUPE_1.ref.addObjectCount > 0 &&
         ACTIVITY_HUNGRY_FLUPE_1.ref.gameState == ACTIVITY_HUNGRY_FLUPE_1.gameState.STARTED
        ) {
            ACTIVITY_HUNGRY_FLUPE_1.ref.populateBubbles(ACTIVITY_HUNGRY_FLUPE_1.ref.addObjectCount);
        }
    },
    setupBoundry : function (){
        var WALLS_WIDTH = 20;
        var WALLS_ELASTICITY = 1;
        var WALLS_FRICTION = 1;
        var leftWall = new cp.SegmentShape(this.space.staticBody, new
        cp.v(0, 0), new cp.v(0, 1000000), WALLS_WIDTH);
        leftWall.setElasticity(WALLS_ELASTICITY);
        leftWall.setFriction(WALLS_FRICTION);
        this.space.addStaticShape(leftWall);

        var rightWall = new cp.SegmentShape(this.space.staticBody,
            new cp.v(cc.winSize.width, 1000000),
            new cp.v(cc.winSize.width, 0), WALLS_WIDTH);
        rightWall.setElasticity(WALLS_ELASTICITY);
        rightWall.setFriction(WALLS_FRICTION);
        this.space.addStaticShape(rightWall);

        var bottomWallForAnimation = new cp.SegmentShape(this.space.
            staticBody, new cp.v(0, 270), new cp.v(cc.winSize.width, 270), WALLS_WIDTH);
        bottomWallForAnimation.setElasticity(WALLS_ELASTICITY);
        bottomWallForAnimation.setFriction(WALLS_FRICTION);
        // bottomWallForAnimation.sensor = true;
        bottomWallForAnimation.setCollisionType(ACTIVITY_HUNGRY_FLUPE_1.CollisionType.AnimationInitiator);
        this.space.addStaticShape(bottomWallForAnimation);


        var bottomWallForFlupe = new cp.SegmentShape(this.space.
            staticBody, new cp.v(0, 170),
            new cp.v(cc.winSize.width, 170), WALLS_WIDTH);
        bottomWallForFlupe.setElasticity(WALLS_ELASTICITY);
        bottomWallForFlupe.setFriction(WALLS_FRICTION);
        bottomWallForFlupe.setCollisionType(ACTIVITY_HUNGRY_FLUPE_1.CollisionType.BottomWall
        );
        this.space.addStaticShape(bottomWallForFlupe);

        var upperWall = new cp.SegmentShape(this.space.staticBody,
            new cp.v(0, cc.winSize.height),
            new cp.v(cc.winSize.width, cc.winSize.height), WALLS_WIDTH);
        upperWall.setElasticity(WALLS_ELASTICITY);
        upperWall.setFriction(WALLS_FRICTION);
        this.space.addStaticShape(upperWall);
    },
    populateBubbles: function (count){

        console.trace();
            let bubblesData = this.assets.item_bubble.bubble_items_data.data;
       // let idx = 0;
        let initialX = [300, 600];
        let bubblesInfo = [];
        while(count--) {
            let obj = { "itemInfo":bubblesData[Math.floor(Math.random() * bubblesData.length)],
                "pos": {"x":initialX[Math.floor(Math.random()* 1.8)] + Math.random() * 50,
                        "y":  Math.random() * this.getContentSize().height * 0.2 +
            this.getContentSize().height * 0.6 },
                "impulse": {
                "x" : (Math.random() * -50),
                    "y": 100},
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

    setupFlupes: function (){
            this.flupeList = [];
             var width = 70, height = 30, mass = 1;
            let objInfo =this.assets.flupes.flupes_data.data;
            let initialX = this.getContentSize().width *  0.22;
            let initialY = 205;
            let count = 0;
            for(let obj of objInfo){
                let  phBodyBox = this.space.addBody(new cp.Body(mass,
                    cp.momentForBox(mass, width, height)));
                phBodyBox.stuName= "";
                phBodyBox.setPos(cc.p(initialX, initialY));
                var phShape = this.space.addShape(new cp.BoxShape(phBodyBox, width, height));
                phShape.setFriction(100);
                // phShape.sensor = true;
                phShape.setElasticity(0.1);
                phShape.setCollisionType(ACTIVITY_HUNGRY_FLUPE_1.CollisionType.Flupe);
                let animations = ACTIVITY_HUNGRY_FLUPE_1.config.assets.animation.data;
                let animprops = animations[`${obj.name}_land`];
                let  props  = animprops.frameInitial + (animprops.frameCount< 10 ? "000"+ animprops.frameCount: "00"+animprops.frameCount);
                 var flupe = new cc.PhysicsSprite(ACTIVITY_HUNGRY_FLUPE_1.animationBasePath + props + ".png");
                flupe.setScale(0.5);
                flupe.setBody( phBodyBox );
                flupe.initialPos = flupe.getPosition();
                this.addChild(flupe);
                // let shadow = this.addSprite(
                //     ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath + obj.shadow,
                //     cc.p(initialX, initialY - flupe.getContentSize().height*0.1), this  );
                // shadow.setAnchorPoint(cc.p(0.5, 0));
                // flupe.shadow = shadow;
                initialX += flupe.getContentSize().width*flupe.getScale();
                flupe.stuName  =  phBodyBox.stuName;
                flupe.object = [];
                flupe.imgName  = obj.name;
                flupe.shape = phShape;
                flupe.isGoingUp = false;
                flupe.imgIdx = count++;
                this.flupeList.push(flupe);
            }
    },
    flupeCollisionWithBubbles:function() {
        this.space.addCollisionHandler(ACTIVITY_HUNGRY_FLUPE_1.CollisionType.Flupe,
            ACTIVITY_HUNGRY_FLUPE_1.CollisionType.Bubbles,
            function (arb) {
            let flupeBody =  arb.a.type === "circle" ? arb.body_b : arb.body_a;
            let bubbleBody = arb.a.type === "circle" ? arb.body_a : arb.body_b;
            if(flupeBody.stuName == HDAppManager.username) {
                ACTIVITY_HUNGRY_FLUPE_1.ref.removeBubblesWithAnimation(bubbleBody);
                ACTIVITY_HUNGRY_FLUPE_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                    "eventType": ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.REMOVE_BUBBLES,
                    "data": {"id": bubbleBody.id}
                });
                flupeBody.applyImpulse(cc.p(0, -100), cc.p(0, 0));
            }
            return false;
        }, null, null, null);
    },
    bubbleCollisionWithAnimationWall: function (){
        this.space.addCollisionHandler(ACTIVITY_HUNGRY_FLUPE_1.CollisionType.Flupe,
            ACTIVITY_HUNGRY_FLUPE_1.CollisionType.AnimationInitiator,
            function (arb) {
                if(!arb.b.getBody().isGoingUp) {
                    let flupe =   ACTIVITY_HUNGRY_FLUPE_1.ref.flupeList.find(x=>x.stuName == arb.b.getBody().stuName);
                    flupe.runAction( ACTIVITY_HUNGRY_FLUPE_1.ref.getFlupeAnimation(flupe.imgName, "land") );
                    if(flupe.glow) flupe.glow.runAction(  ACTIVITY_HUNGRY_FLUPE_1.ref.getGlowAnimation("land"));
                }
                return false;

                //Play Catch Animation
            }, null, null, null);
    },
    setScoreScreenActive : function (status){
        let score = this.getChildByTag(ACTIVITY_HUNGRY_FLUPE_1.Tag.SCORE_BG);
        if(score) return score.setVisible(status);
        let bgProps = this.assets.score_bg;
        let basketProps = this.assets.score_bucket;
        let bg = this.addSprite(ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath + bgProps.imageName,
            bgProps.position, this);
        bg.setTag(ACTIVITY_HUNGRY_FLUPE_1.Tag.SCORE_BG);
        bg.setVisible(status);
        bg.setLocalZOrder(100);
        let bucket = this.addSprite(ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath + basketProps.imageName,
            basketProps.position, bg);
        bucket.setScale(basketProps.scale);
    },
    flupeCollidedWithAnimationWall:function() {
        this.space.addCollisionHandler(ACTIVITY_HUNGRY_FLUPE_1.CollisionType.Flupe,
            ACTIVITY_HUNGRY_FLUPE_1.CollisionType.AnimationInitiator,
            function (arb) {
                if(!arb.b.getBody().isGoingUp) {
                  let flupe =   ACTIVITY_HUNGRY_FLUPE_1.ref.flupeList.find(x=>x.stuName == arb.b.getBody().stuName);
                  flupe.runAction( ACTIVITY_HUNGRY_FLUPE_1.ref.getFlupeAnimation(flupe.imgName, "land") );
                  if(flupe.glow) flupe.glow.runAction(  ACTIVITY_HUNGRY_FLUPE_1.ref.getGlowAnimation("land"));
                }
            return false;

                //Play Catch Animation
            }, null, null, null);
    },
    flupeCollidedWithBottomWall:function() {
        this.space.addCollisionHandler(ACTIVITY_HUNGRY_FLUPE_1.CollisionType.Flupe,
            ACTIVITY_HUNGRY_FLUPE_1.CollisionType.BottomWall,
            function (arb) {
                return true;
            }, null, null, null);
    },
    updateFlupes: function (nameList){
        for(let name of nameList){
            if( ACTIVITY_HUNGRY_FLUPE_1.ref.flupeList.filter( x => x.stuName == name).length == 0  ){
                for(let bag of ACTIVITY_HUNGRY_FLUPE_1.ref.flupeList){
                    if(bag.stuName == ""){
                        bag.stuName =  name;
                        bag.getBody().stuName = name;
                        break;
                    }
                }
            }
        }

        //Remove Bag of student left the game.
        let initialX = this.getContentSize().width * 0.22;
        this.nextItem_X_Position = initialX;
        let initialY = 205;
        for(let bag of ACTIVITY_HUNGRY_FLUPE_1.ref.flupeList) {
            if (!nameList.includes(bag.stuName)) {
                bag.stuName= "";
                bag.getBody().stuName = "";
            }
            if (bag.stuName != "") {
            }
            if(bag.stuName == "") {
                bag.removeFromParent();
            }
            else {
                if(bag.getParent() == null) {
                    ACTIVITY_HUNGRY_FLUPE_1.ref.addChild(bag);
                }
            }
        }


        //childLength =
        if (nameList.length < 4) {
            this.horizontalPadding = 105;
        } else {
            this.horizontalPadding = cc.lerp(105, 2, (nameList.length - 1) / (8 - 1));
        }

        ACTIVITY_HUNGRY_FLUPE_1.ref.flupeList.map((child) => {
            if(child.isVisible()) {
                child.getBody().setPos(cc.p(this.nextItem_X_Position, initialY));
                // child.initialPos = child.getPosition();
                this.nextItem_X_Position =
                    child.x + child.getContentSize().width + this.horizontalPadding;
                if(child.stuName == HDAppManager.username) ACTIVITY_HUNGRY_FLUPE_1.ref.attachGlow(child);
            }
        });
    },
    addBubbleSprite: function({itemInfo, id, pos, impulse}) {
        var width = 5, height = 5, mass = 0.2;
        let  phBodyCircle = ACTIVITY_HUNGRY_FLUPE_1.ref.space.addBody(new cp.Body(mass,
            cp.momentForCircle(mass, 0, width * 0.5, cc.p(0, 0))));
        phBodyCircle.setPos(pos);
        phBodyCircle.name = itemInfo.name;
        phBodyCircle.id = id;

        //#4
        var phShape = ACTIVITY_HUNGRY_FLUPE_1.ref.space.addShape(new cp.CircleShape(phBodyCircle, width, cc.p(0, 0)));
        phShape.setFriction(0);
        phShape.setElasticity(1);
        phShape.setCollisionType(ACTIVITY_HUNGRY_FLUPE_1.CollisionType.Bubbles);

        var sprite = new cc.PhysicsSprite(ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath+ itemInfo.imageName);
        phBodyCircle.sprite = sprite;
        sprite.setScale(1);
        sprite.shape = phShape;
        sprite.id = id;
        sprite.setBody( phBodyCircle );
        ACTIVITY_HUNGRY_FLUPE_1.ref.addChild(sprite);
        ACTIVITY_HUNGRY_FLUPE_1.ref.bubbleList.push(sprite);
        phBodyCircle.applyImpulse(cc.p(impulse.x, impulse.y), cc.p(0, 0));
        //         cc.p(0, 0));
        return sprite;
    },
    removeBubbles : function ({id}){
        console.log("rB id ", id );
        let bubble =  ACTIVITY_HUNGRY_FLUPE_1.ref.bubbleList.find(x=>x.id==id);
        if(!bubble) return;
        console.log("it's not null");
        ACTIVITY_HUNGRY_FLUPE_1.ref.deleteObj.push({'b': bubble.getBody(), 's': bubble.shape});
        console.log("dL", ACTIVITY_HUNGRY_FLUPE_1.ref.deleteObj.length);
        let idx = ACTIVITY_HUNGRY_FLUPE_1.ref.bubbleList.indexOf(bubble);
        ACTIVITY_HUNGRY_FLUPE_1.ref.bubbleList.splice( idx, 1);
        ACTIVITY_HUNGRY_FLUPE_1.ref.syncBubbleInfo.splice(idx, 1);
        if(ACTIVITY_HUNGRY_FLUPE_1.ref.joinedStudentList
            && ACTIVITY_HUNGRY_FLUPE_1.ref.joinedStudentList.users &&
            ACTIVITY_HUNGRY_FLUPE_1.ref.joinedStudentList.users[0] &&
            HDAppManager.username == ACTIVITY_HUNGRY_FLUPE_1.ref.joinedStudentList.users[0].userName) {
            ACTIVITY_HUNGRY_FLUPE_1.ref.updateRoomData();
            if(ACTIVITY_HUNGRY_FLUPE_1.ref.gameState == ACTIVITY_HUNGRY_FLUPE_1.gameState.STARTED)
                ++ACTIVITY_HUNGRY_FLUPE_1.ref.addObjectCount;
        };
    },

    removeBubblesWithAnimation : function ({id}){
        let bubble =  ACTIVITY_HUNGRY_FLUPE_1.ref.bubbleList.find(x=>x.id==id);
        if(!bubble) return;
         ACTIVITY_HUNGRY_FLUPE_1.ref.getStarsAnimation(bubble.getPosition());
        let  label = this.createTTFLabel(bubble.getBody().name, HDConstants.DarkBrown, 30,
            HDConstants.Brown, bubble.getPosition(), this);
        label.setLocalZOrder(100);
        label.runAction(cc.sequence(cc.fadeOut(2), cc.removeSelf()));
        this.removeBubbles({id});
    },

    setupControlButton: function (){
        let props =  ACTIVITY_HUNGRY_FLUPE_1.config.buttons.data.push;
        let button = this.createButton( ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath +
          props.idleState, ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath +
          props.pressedState, "", 0, ACTIVITY_HUNGRY_FLUPE_1.Tag.PUSH_BUTTON,
          cc.p( props.position.x, props.position.y), this);
    },
    setPushButtonActive(){
        if(this.getChildByTag(ACTIVITY_HUNGRY_FLUPE_1.Tag.PUSH_BUTTON)) {
           let  status =  this.isTeacherView ? this.gameState == ACTIVITY_HUNGRY_FLUPE_1.gameState.STARTED : this.isStudentInteractionEnable
            console.log(status);
            this.getChildByTag(ACTIVITY_HUNGRY_FLUPE_1.Tag.PUSH_BUTTON).setTouchEnabled(
                status);
            this.getChildByTag(ACTIVITY_HUNGRY_FLUPE_1.Tag.PUSH_BUTTON).setOpacity(  status ? 255 : 100);
        }
    },

    getFlupeAnimation : function (name, type){
        let animations = ACTIVITY_HUNGRY_FLUPE_1.config.assets.animation.data;
        let flupeAnimationProps = animations[`${name}_${type}`];

    return cc.sequence( HDUtility.runFrameAnimation(
            ACTIVITY_HUNGRY_FLUPE_1.animationBasePath +
        flupeAnimationProps.frameInitial,
        flupeAnimationProps.frameCount, 0.1, '.png', 1));
    },

    getGlowAnimation : function (type){
        let animations = ACTIVITY_HUNGRY_FLUPE_1.config.assets.animation.data;
        let glowAnimationProps = animations[`glowing_outline_${type}`];
        return cc.sequence( HDUtility.runFrameAnimation(
            ACTIVITY_HUNGRY_FLUPE_1.animationBasePath +
            glowAnimationProps.frameInitial,
            glowAnimationProps.frameCount, 0.1, '.png', 1));
    },
    getStarsAnimation : function (pos){
        let animations = ACTIVITY_HUNGRY_FLUPE_1.config.assets.animation;
        let starsAnimProps = animations.data.object_pulled_out_animation;
        let sprite = this.addSprite(ACTIVITY_HUNGRY_FLUPE_1.animationBasePath +  starsAnimProps.frameInitial+'0001.png',
            pos, this);
        sprite.runAction( cc.sequence( HDUtility.runFrameAnimation(
            ACTIVITY_HUNGRY_FLUPE_1.animationBasePath +
            starsAnimProps.frameInitial,
            starsAnimProps.frameCount, 0.08, '.png', true) ,
            cc.removeSelf()));
    },
    setupBubblePanel: function(){
        //BG
        let imgProp = ACTIVITY_HUNGRY_FLUPE_1.config.assets.sections.bubbles_panel;
        let bg = this.addSprite(
            ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath +  imgProp.imageName,
            cc.p(imgProp.position.x, imgProp.position.y),
            this);

       this.tableView = new cc.TableView(this,
            cc.size(bg.getContentSize().width * 0.85, bg.getContentSize().height * 0.8));
         this.tableView.setPosition(cc.p(bg.getContentSize().width * 0.07, bg.getContentSize().height * 0.1));
         this.tableView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        // tableView.setBounceable(true);
         this.tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_BOTTOMUP);
         this.tableView.setTouchEnabled(this.assets.item_bubble.bubble_items_data.data.length > 5);
         this.tableView.setDataSource(this);
         this.tableView.setDelegate(this);
         bg.addChild( this.tableView, 11);
         this.tableView.reloadData();
    },
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
            HDAppManager.username == ACTIVITY_HUNGRY_FLUPE_1.ref.joinedStudentList.users[0].userName) {
            ACTIVITY_HUNGRY_FLUPE_1.ref.updateRoomData();
        };
    },


    updateTimer : function(){
        this.time--;
        if(this.time < 0){
            this.time = 0;
            this.gameCompletion();
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
    setGameCompleted : function (){
        ACTIVITY_HUNGRY_FLUPE_1.ref.setScoreScreenActive(true);
        if(this.isTeacherView)  ACTIVITY_HUNGRY_FLUPE_1.ref.stopTheGame();

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
        this.gameState = ACTIVITY_HUNGRY_FLUPE_1.gameState.STOP;
    },


    updateBubblePanel : function (name){
        if(this.gameState != ACTIVITY_HUNGRY_FLUPE_1.gameState.STARTED) return;
       ACTIVITY_HUNGRY_FLUPE_1.ref.catchesBubblesName.add(name);
        this.parent.setResetButtonActive( ACTIVITY_HUNGRY_FLUPE_1.ref.catchesBubblesName.size > 0);
       let cells =  ACTIVITY_HUNGRY_FLUPE_1.ref.tableView.getContainer().getChildren();
       let newCell = cells.find(x=>x.name==name);
       if(newCell) newCell.makeColoured();
       if(ACTIVITY_HUNGRY_FLUPE_1.ref.catchesBubblesName.size == 5){
           //ACTIVITY_HUNGRY_FLUPE_1.ref.gameCompletion();
       }
    },
    /**
     * Size of bubbles in bottom panel
     * @param table
     * @param idx
     * @returns {cc.Size}
     */
    tableCellSizeForIndex: function (table, idx) {
        return cc.size(table.getViewSize().width / 5, table.getViewSize().height);
    },
    tableCellAtIndex: function (table, idx) {
        let cardCell = table.dequeueCell();
        let cellSize = this.tableCellSizeForIndex(table, idx);
        const bubbleProps = this.assets.item_bubble.bubble_items_data.data[idx];
        if (cardCell == null) {
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
    fetchGameData: function () {
        HDNetworkHandler.get(HDAPIKey.GameData,
            {"roomId": HDAppManager.roomId},
            true, (err, res) => {
        });
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
                        "activity": ACTIVITY_HUNGRY_FLUPE_1.config.properties.namespace,
                        "data": {"bubbleInfo" : ACTIVITY_HUNGRY_FLUPE_1.ref.syncBubbleInfo,
                            "catchBubbleInfo": [...ACTIVITY_HUNGRY_FLUPE_1.ref.catchesBubblesName],
                            "gameState": ACTIVITY_HUNGRY_FLUPE_1.ref.gameState,
                            "gameStartTime" : ACTIVITY_HUNGRY_FLUPE_1.ref.gameStartTime,
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
        if (params.userName == HDAppManager.username) {
            ACTIVITY_HUNGRY_FLUPE_1.ref.isStudentInteractionEnable = params.status;
        }
        this.setPushButtonActive();
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
        if (!ACTIVITY_HUNGRY_FLUPE_1.ref.isStudentInteractionEnable)
            return;
    },
    onMouseUp: function (event) {
        if (!ACTIVITY_HUNGRY_FLUPE_1.ref.isStudentInteractionEnable)
            return;
    },
    onMouseMove: function (event) {
        ACTIVITY_HUNGRY_FLUPE_1.ref.updateMouseIcon(event.getLocation());
        if (!ACTIVITY_HUNGRY_FLUPE_1.ref.isStudentInteractionEnable)
            return;
    },
    socketListener: function (res) {
        if (!ACTIVITY_HUNGRY_FLUPE_1.ref)
            return;
        switch (res.eventType) {
            case HDSocketEventType.DISABLE_STUDENT_INTERACTION:
                break;
            case HDSocketEventType.DISABLE_INTERACTION:
                ACTIVITY_HUNGRY_FLUPE_1.ref.disableInteraction(res.data);
                break;
            case HDSocketEventType.RECEIVE_GRADES:
                break;
            case HDSocketEventType.STUDENT_STATUS:
                ACTIVITY_HUNGRY_FLUPE_1.ref.studentStatus(res.data);
                break;
            case HDSocketEventType.STUDENT_TURN:
                ACTIVITY_HUNGRY_FLUPE_1.ref.studentTurn(res.data);
                break;
            case HDSocketEventType.GAME_MESSAGE:
                if (res.data.userName == HDAppManager.username || !ACTIVITY_HUNGRY_FLUPE_1.ref)
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
        if (this.isTeacherView) {
            //Check for this
        } else {
            if (!users.length) {
                this.isStudentInteractionEnable = false;
                this.setPushButtonActive();
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
        this.setPushButtonActive();
    },
    updateStudentTurn: function (userName) {
      //  cc.log(""userName);
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
        this.joinedStudentList = [];
        this.joinedStudentList = data;
        // (data.users.filter( x => x.userId != data.teacherId )).map( x=> x.userName);
        // let students = (data.users.filter( x => x.userId != data.teacherId )).map( x=> x.userName);
        this.updateFlupes([ data.users.map(x=>x.userName)]);
    },
    gameEvents: function (res) {
        if (!ACTIVITY_HUNGRY_FLUPE_1.ref) return;
        switch (res.eventType) {
            case ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.STUDENT_INTERACTION:
                this.onUpdateStudentInteraction(res.data);
                break;
            case ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.START:
                this.gameState = ACTIVITY_HUNGRY_FLUPE_1.gameState.STARTED;
                this.startTimer(this.gamePlayTime);
                break;
            case ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.STOP:
                ACTIVITY_HUNGRY_FLUPE_1.ref.gameState = ACTIVITY_HUNGRY_FLUPE_1.gameState.STOP;
                this.resetGame();
                break;
            case ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.ADD_BUBBLES:
                res.data.forEach(ACTIVITY_HUNGRY_FLUPE_1.ref.addBubbleSprite);
                break;
            case ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.REMOVE_BUBBLES:
                this.removeBubblesWithAnimation(res.data);
                // res.data.forEach(ACTIVITY_HUNGRY_FLUPE_1.ref.removeBubbles);
                break;
            case ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.JUMP:
                this.flupeJump(res.userName);
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

    updateUIWithSyncData : function (){
        if(this.syncDataInfo &&
            this.syncDataInfo.bubbleInfo &&
            this.syncDataInfo.catchBubbleInfo && this.syncDataInfo.gameState) {
            this.syncDataInfo.catchBubbleInfo.forEach(ACTIVITY_HUNGRY_FLUPE_1.ref.updateBubblePanel);
            this.syncDataInfo.bubbleInfo.forEach(ACTIVITY_HUNGRY_FLUPE_1.ref.addBubbleSprite);
            this.gameState = this.syncDataInfo.gameState;
            var date = new Date();
            var currentTime = date.getTime();
            var delay = (currentTime - this.syncDataInfo.gameStartTime) / 1000;
            console.log("sync time ",  this.syncDataInfo.gameStartTime, "Delay ", delay);
            if (this.time < 0 && this.gameState == ACTIVITY_SANDS_OF_TIME_1.gameState.STARTED) {
                this.resetGame();
            } else if (this.gameState == ACTIVITY_SANDS_OF_TIME_1.gameState.STARTED) {
                this.startTimer(this.gamePlayTime - delay);
            }
            if(this.syncBubbleInfo.gameState == ACTIVITY_HUNGRY_FLUPE_1.gameState.COMPLETED){
                this.gameCompletion();
            }
        }
    },

    updateButtonVisibility: function (tag, visible) {
        var button = this.getChildByTag(tag);
        button.setVisible(visible);
        button.setEnabled(visible);
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
        cc.log(" ACTIVITY_HUNGRY_FLUPE_1.ref.gameState ",  ACTIVITY_HUNGRY_FLUPE_1.ref.gameState);
        this.updateButtonVisibility(ACTIVITY_HUNGRY_FLUPE_1.Tag.startButton, false);
        this.updateButtonVisibility(ACTIVITY_HUNGRY_FLUPE_1.Tag.stopButton, true);
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE,
            {"eventType": ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.START} );
        this.getParent().setAllStudentsMouseActive(true);
        this.populateBubbles(10);
        this.startTimer(this.gamePlayTime);
        this.showStartScript && ACTIVITY_HUNGRY_FLUPE_1.ref.triggerScript(
           ACTIVITY_HUNGRY_FLUPE_1.config.teacherScripts.data.startButton.content.ops
        );
        this.showStartScript = false;
        this.setPushButtonActive();
    },

    resetTheGame : async function (){
        //while( ACTIVITY_HUNGRY_FLUPE_1.ref.catchesBubblesName.size > 0) {
        console.log(" b4 bubbles ",  ACTIVITY_HUNGRY_FLUPE_1.ref.catchesBubblesName);

        console.log(" after bubbles ",  ACTIVITY_HUNGRY_FLUPE_1.ref.catchesBubblesName);
        this.setScoreScreenActive(false);
        this.stopTimer();

    },

    resetGame : function (){
    //=====
     this.stopTimer();
     this.setScoreScreenActive(false);
     ACTIVITY_HUNGRY_FLUPE_1.ref.catchesBubblesName.clear();
     ACTIVITY_HUNGRY_FLUPE_1.ref.tableView.reloadData();
     while (this.bubbleList.length > 0){
        this.removeBubbles(this.bubbleList[0]);
     }
    },

    gameCompletion : function (){
        this.gameState = ACTIVITY_HUNGRY_FLUPE_1.gameState.COMPLETED;
        this.stopTimer();
        this.setScoreScreenActive(true);
        while (this.bubbleList.length > 0){
            console.log("this.bubbleList.length ", this.bubbleList.length);
            this.removeBubbles(this.bubbleList[0]);
        }
        this.isTeacherView && this.getParent().setAllStudentsMouseActive(false);
        this.setPushButtonActive()
    },


    reset : function (){
      this.stopTheGame();
    },

    stopTheGame : function (){
        ACTIVITY_HUNGRY_FLUPE_1.ref.gameState = ACTIVITY_HUNGRY_FLUPE_1.gameState.STOP;
        this.updateButtonVisibility(ACTIVITY_HUNGRY_FLUPE_1.Tag.startButton, true);
        this.updateButtonVisibility(ACTIVITY_HUNGRY_FLUPE_1.Tag.stopButton, false);
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE,
            {"eventType": ACTIVITY_HUNGRY_FLUPE_1.socketEventKey.STOP} );
        this.getParent().setAllStudentsMouseActive(false);
        this.parent.setResetButtonActive(false);
        this.resetGame();
        this.setPushButtonActive();
    },

    flupeJump : function (name){
        let flupe =  this.flupeList.find(x=>x.stuName == name);
        if(!flupe) return;
        if(flupe.getPositionY() - flupe.initialPos.y > 50 ||  flupe.isGoingUp) return;
        flupe.isGoingUp = true;
        flupe.getBody().isGoingUp = true;
        flupe.runAction( cc.sequence(this.getFlupeAnimation(flupe.imgName, "leap"),
            cc.callFunc((target, data)=>{
                target.setTexture(new cc.Sprite(ACTIVITY_HUNGRY_FLUPE_1.spriteBasePath +
                    flupe.imgName + '_midair.png').getTexture());
                target.getBody().applyImpulse(cc.p(0, this.impulse), cc.p(0, 100));
            }, flupe ), cc.delayTime(1),
            cc.callFunc((target, data)=>{
                let animations = ACTIVITY_HUNGRY_FLUPE_1.config.assets.animation.data;
                let animprops = animations[`${flupe.imgName}_land`];
                target.isGoingUp = false;
                target.getBody().isGoingUp = false;
                let  props  = animprops.frameInitial + (animprops.frameCount< 10 ? "000"+ animprops.frameCount: "00"+animprops.frameCount);
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
                    let animations = ACTIVITY_HUNGRY_FLUPE_1.config.assets.animation.data;
                    let animprops = animations[`glowing_outline_land`];
                    let  props  = animprops.frameInitial +  ("000"+animprops.frameCount).slice(-4);
                    target.setTexture(new cc.Sprite(ACTIVITY_HUNGRY_FLUPE_1.animationBasePath +
                        props+".png").getTexture());
                }, flupe.glow )

            ));
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
        if (handICon) {
            this.interactableObject = true;
            this.customTexture = false;
        }
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