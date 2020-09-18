var ACTIVITY_SAVE_A_SITUATION_1 = {};  // name space


ACTIVITY_SAVE_A_SITUATION_1.Tag = {
    Land1: 1001,
    Land2: 1002,
    WaterLoopAnimation: 1003,
    CurrentLand: 1005,
    Waves: 1006,
    NextButton: 1007,
    ReplayButton: 1008,
    PopUP: 1009,

}
ACTIVITY_SAVE_A_SITUATION_1.socketEvents = {
    ACTIVATE_CELL: "SAS" + 1,
    MOVE_PLUG: "SAS" + 2,
    PLACE_PLUG_BACK: "SAS" + 3,
    LEVEL_OVER: "SAS" + 10,
    PLUG_PLACED_AT_DESTINATION: "SAS" + 5,
    GAME_OVER: "SAS" + 6,
    NEW_LEVEL: "SAS" + 7,
    ANIMATION_ENDED_ACK: "SAS" + 8,
    START_WATER_FILLING: "SAS" + 9,
}

ACTIVITY_SAVE_A_SITUATION_1.ZORDER = {
    minDepth: -1,
    midDepth: 10,
    highDepth: 30,

}

ACTIVITY_SAVE_A_SITUATION_1.BroadcastType = {
    TO_SELF: "m",
    TO_EVERYONE_EXCEPT_SELF: "a"
}

ACTIVITY_SAVE_A_SITUATION_1.socketEventKey = {
    singleEvent: "SingleEvent"
}

ACTIVITY_SAVE_A_SITUATION_1.WaterFillingStates = {
    NOT_STARTED: 0,
    STARTED: 1,
    PAUSED: 2,
    RESUMED: 3,
    ENDED: 4
}

ACTIVITY_SAVE_A_SITUATION_1.ref = null;
ACTIVITY_SAVE_A_SITUATION_1.SaveASituation = HDBaseLayer.extend({
    winSize: cc.winSize,
    visibleObject: 5,
    carouselWidth: 120,
    carouselHeight: 100,
    totalHoles: 5,
    currentLevel: 0,
    selectedCellIdx: -1,
    startTime: 0,
    totalJoinedUsers: 0,
    currentPlayerName: "",
    selectedObject: null,
    currentCell: null,
    MouseTextureUrl: null,
    parallaxNode: null,
    tubFront: null,
    tubBack: null,
    baseAnimationSprite: null,
    cliper: null,
    water: null,
    lastSavedState: null,
    isMouseDown: false,
    isDragging: false,
    isStudentInteractionEnable: false,
    hasWon: false,
    hasTextureChanged: false,
    hasWinAnimationPlayed: false,
    isAnyStudentPresent: false,
    hasNewRoundStarted: false,
    filledHoles: [0, 0, 0, 0, 0],
    userAckArray: [],
    holesArray: [],
    animalArray: [],
    currentWaterState: ACTIVITY_SAVE_A_SITUATION_1.WaterFillingStates.NOT_STARTED,
    gameEndTime: 0,

    ctor() {
        this._super();
    },
    onEnter() {
        this._super();
        // loading config file
        this.setContentSize(this.winSize);
        ACTIVITY_SAVE_A_SITUATION_1.ref = this;
        let activityName = 'ACTIVITY_SAVE_A_SITUATION_1';
        cc.loader.loadJson("res/Activity/" + activityName + "/config.json", function (error, config) {
            if (!error) {
                ACTIVITY_SAVE_A_SITUATION_1.ref.config = config;
                ACTIVITY_SAVE_A_SITUATION_1.ref.resourcePath = "res/Activity/" + "" + activityName + "/res/"
                ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath = ACTIVITY_SAVE_A_SITUATION_1.ref.resourcePath + "Sprite/";
                ACTIVITY_SAVE_A_SITUATION_1.ref.animationFrames = ACTIVITY_SAVE_A_SITUATION_1.ref.resourcePath + "AnimationFrames/";
                ACTIVITY_SAVE_A_SITUATION_1.ref.isTeacherView = HDAppManager.isTeacherView;
                ACTIVITY_SAVE_A_SITUATION_1.ref.setUpUI();

            } else {
                console.log("error", error)
            }
          //  ACTIVITY_SAVE_A_SITUATION_1.ref.triggerScript(ACTIVITY_SAVE_A_SITUATION_1.ref.config.teacherScripts.data.moduleStart.content.ops);
            ACTIVITY_SAVE_A_SITUATION_1.ref.config.teacherScripts.data.moduleStart.enable && ACTIVITY_SAVE_A_SITUATION_1.ref.triggerScript(ACTIVITY_SAVE_A_SITUATION_1.ref.config.teacherScripts.data.moduleStart.content.ops);

        })
    },
    onExit() {
        this._super();
        this.holesArray.length = 0;
        this.animalArray.length = 0;
        this.userAckArray.length = 0;
        ACTIVITY_SAVE_A_SITUATION_1.ref = null;
    },

    setUpUI() {
        this.currentLevel = this.lastSavedState ? this.lastSavedState.currentLevel : this.currentLevel;
        var wereAllHolesFilled = this.lastSavedState ? this.lastSavedState.holesInfo.filter(item => item == 1) : [];

        if (wereAllHolesFilled.length == this.totalHoles) {
            this.lastSavedState.holesInfo.fill(0);
            this.currentLevel = this.currentLevel;
        }

        this.createCliper();
        this.setBackground(ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath + ACTIVITY_SAVE_A_SITUATION_1.ref.config.background.sections.background.imageName);
        this.addParallaxEffect();
        this.setWaterLoopAnimation();
        this.setTub();
        this.setWaterAnimations();
        this.setHolesData();
        this.addBottomSideBar();
        this.setSelectedObject();
        if (this.isTeacherView)
            this.updateRoomData();
    },

    createCliper: function () {
        this.cliper = new cc.ClippingNode();
        this.cliper.setContentSize(this.winSize);
        this.addChild(this.cliper, 1);


        let colorNode2 = new cc.DrawNode()
        colorNode2.drawCircle(cc.p(400, 450), 310, 30, 300, true, 11, cc.color.WHITE);
        this.cliper.stencil = colorNode2;
    },

    addParallaxEffect: function () {
        var wavesInfo = ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.waves.data;
        this.parallaxNode = new cc.ParallaxNode();
        var movingOffset = [cc.p(0.5, 1), cc.p(0.7, 1), cc.p(0.9, 1)];
        var index = 0;
        for (var item of wavesInfo) {
            var river = new cc.Sprite(ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath + item.imageName);
            river.setAnchorPoint(0, 0);
            this.parallaxNode.addChild(river, index + 1, movingOffset[index], item.position);
            var river2 = new cc.Sprite(ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath + item.imageName);
            river2.setAnchorPoint(0, 0);
            this.parallaxNode.addChild(river2, index + 1, movingOffset[index], cc.p(river.width, item.position.y));
        }

        var land1 = new cc.Sprite(ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath + ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.land.imageName);
        land1.setAnchorPoint(0, 0);
        land1.setTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.Land1);
        this.parallaxNode.addChild(land1, -1, cc.p(0.7, 1), cc.p(0, 0));

        var land2 = new cc.Sprite(ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath + ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.land.imageName);
        land2.setAnchorPoint(0, 0);
        land2.setTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.Land2);
        this.parallaxNode.addChild(land2, -1, cc.p(0.7, 1), cc.p(land1.width, 0));

        this.addChild(this.parallaxNode);
        this.parallaxNode.runAction(cc.repeatForever(cc.moveBy(2, -land1.width * 0.5, 0)));
        this.scheduleUpdate();

    },

    setWaterLoopAnimation: function () {
        var waterLoop = this.addSprite(ACTIVITY_SAVE_A_SITUATION_1.ref.animationFrames + "tub_watercircle_12fps_png_seq/" + ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animation.data.tubWaterCircle.name + "0011.png", ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animation.data.tubWaterCircle.position, this);
        waterLoop.setScale(ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animation.data.tubWaterCircle.scale);
        waterLoop.setTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.WaterLoopAnimation);
        var animation = HDUtility.runFrameAnimation(ACTIVITY_SAVE_A_SITUATION_1.ref.animationFrames + "tub_watercircle_12fps_png_seq/" + ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animation.data.tubWaterCircle.name, ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animation.data.tubWaterCircle.frameCount, 0.1, ".png", 1);
        waterLoop.runAction(cc.repeatForever(animation));
    },

    setTub: function () {
        this.tubBack = this.addSprite(ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath + ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.tubBack.imageName, ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.tubBack.position, this.cliper);
        this.tubBack.setScale(ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.tubBack.scale);
        this.placeAnimals();
        this.setUpWater();

        this.tubFront = this.addSprite(ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath + ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.levels.data[this.currentLevel].tubFront.imageName, ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.levels.data[this.currentLevel].tubFront.position, this.cliper);
        this.tubFront.setScale(ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.levels.data[this.currentLevel].tubFront.scale);

    },

    setWaterAnimations: function () {
        // water line animations
        this.baseAnimationSprite = this.addSprite(ACTIVITY_SAVE_A_SITUATION_1.ref.animationFrames + "tubWaterline/" + ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animation.data.tubWater.name + "0001.png", ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animation.data.tubWater.position, this);
        this.baseAnimationSprite.setScale(ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animation.data.tubWater.scale);
        this.baseAnimationSprite.setLocalZOrder(3);

        var animation = HDUtility.runFrameAnimation(ACTIVITY_SAVE_A_SITUATION_1.ref.animationFrames + "tubWaterline/" + ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animation.data.tubWater.name, ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animation.data.tubWater.frameCount, 0.1, ".png", cc.REPEAT_FOREVER);
        this.baseAnimationSprite.runAction(animation);
    },

    setHolesData: function () {
        let initalTag = 0;
        for (var item of ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.levels.data[this.currentLevel].carouselAssets) {
            var filledItem = new cc.Sprite(ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath + item.name);
            filledItem.setPosition(this.tubFront.convertToNodeSpace(cc.p(item.holeInfo.coordinates.x, item.holeInfo.coordinates.y)));
            filledItem.setName(item.holeInfo.filledImage);
            filledItem.setScale(item.holeInfo.scale);
            filledItem.setTag(initalTag);
            filledItem.setVisible(this.lastSavedState ? this.lastSavedState.holesInfo[initalTag] : 0);
            this.holesArray.push(filledItem);
            this.filledHoles[initalTag] = filledItem.isVisible();
            initalTag++;
            this.tubFront.addChild(filledItem);
        }
        var totalRound = this.filledHoles.filter(item => item == 1);
        this.totalHoles = this.totalHoles - totalRound.length;
    },

    setSelectedObject: function () {
        this.selectedObject = new cc.Sprite();
        this.selectedObject.setVisible(false);
        this.selectedObject.setLocalZOrder(ACTIVITY_SAVE_A_SITUATION_1.ZORDER.highDepth);
        this.selectedObject.setScale(0.2);
        this.addChild(this.selectedObject);
    },

    setUpWater: function () {
        let waves = this.addSprite(ACTIVITY_SAVE_A_SITUATION_1.ref.animationFrames + "tub_waterFill/" + ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animation.data.waterInTub.name + "0001.png", cc.p(ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.water.dimensions.width * 0.6, -3), this.tubBack);
        waves.setAnchorPoint(0.5, 0);
        waves.setTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.Waves);
        console.log(this.water);
        this.water = this.createColourLayer(cc.color(ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.water.color.r, ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.water.color.g, ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.water.color.b), ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.water.dimensions.width, ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.water.dimensions.height, ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.water.position, this.tubBack);
        this.water.setScaleX(1);
        this.water.setScaleY(0);
        this.water.setAnchorPoint(0.5, 0);
        waves.setScale(this.water.width / waves.width);

        if (this.lastSavedState) {

            if (this.lastSavedState.scale > 1) {
                this.lastSavedState.scale = 0;
                this.lastSavedState.currentWaterState = ACTIVITY_SAVE_A_SITUATION_1.WaterFillingStates.NOT_STARTED;
            }
            if (this.lastSavedState.currentWaterState == ACTIVITY_SAVE_A_SITUATION_1.WaterFillingStates.PAUSED || this.lastSavedState.currentWaterState == ACTIVITY_SAVE_A_SITUATION_1.WaterFillingStates.STARTED || this.lastSavedState.currentWaterState == ACTIVITY_SAVE_A_SITUATION_1.WaterFillingStates.RESUMED || this.lastSavedState.currentWaterState == ACTIVITY_SAVE_A_SITUATION_1.WaterFillingStates.ENDED) {
                this.startWaterFilling(this.lastSavedState.currentWaterState);
            }
        }

    },

    increaseWaveScale: function (ref, time) {
        ref.setScaleX(this.water.width * 1.15 / ref.width);
        ref.runAction(cc.moveBy(time, this.water.width * 0.05, this.water.height * 0.07));
    },

    placeAnimals: function () {
        for (var item of ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animals.data) {
            let animal = this.addSprite(ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath + item.name, item.position, this.tubBack);
            animal.setScale(item.scale);
            this.animalArray.push(animal);
        }
    },

    startWaterFilling(state) {
        var rateOfFilling = ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.levels.data[this.currentLevel].rateOfWaterFilling * 60;
        this.startTime = this.lastSavedState && this.lastSavedState.startTime != 0 ? this.lastSavedState.startTime : new Date().getTime();

        var delay = this.calculateElapsedTime();
        switch (state) {
            case ACTIVITY_SAVE_A_SITUATION_1.WaterFillingStates.NOT_STARTED:
                this.water.setScaleY(0);
                this.startTime = new Date().getTime();
                this.updateWaterFillingInfo(ACTIVITY_SAVE_A_SITUATION_1.WaterFillingStates.STARTED);
                break;
            case  ACTIVITY_SAVE_A_SITUATION_1.WaterFillingStates.STARTED:
                if (delay < rateOfFilling + 1) {
                    let scale = delay / rateOfFilling;
                    this.water.setScaleY(scale);
                    this.tubBack.getChildByTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.Waves).setPositionY(this.water.height * scale - 5);
                    rateOfFilling = Math.abs(rateOfFilling + 1 - delay);
                } else {
                    this.water.setScaleY(this.lastSavedState.scale);
                    this.tubBack.getChildByTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.Waves).setPositionY(this.water.height * this.lastSavedState.scale - 5)
                    rateOfFilling = rateOfFilling - (rateOfFilling * this.lastSavedState.scale);
                    this.startTime = new Date().getTime();
                    this.currentWaterState = ACTIVITY_SAVE_A_SITUATION_1.WaterFillingStates.STARTED;
                    this.updateRoomData();
                }
                break;
            case  ACTIVITY_SAVE_A_SITUATION_1.WaterFillingStates.PAUSED:
                this.water.setScaleY(this.lastSavedState.scale);
                this.tubBack.getChildByTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.Waves).setPositionY(this.water.height * this.lastSavedState.scale - 5);
                rateOfFilling = rateOfFilling - (rateOfFilling * this.lastSavedState.scale);
                if (ACTIVITY_SAVE_A_SITUATION_1.ref.isTeacherView) {
                    this.currentWaterState = ACTIVITY_SAVE_A_SITUATION_1.WaterFillingStates.RESUMED;
                    this.startTime = new Date().getTime();
                    this.updateRoomData();
                } else {
                    this.runWaterAnimation(rateOfFilling);
                    this.water.pause();
                    this.tubBack.getChildByTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.Waves).pause();

                }
                break;
            case ACTIVITY_SAVE_A_SITUATION_1.WaterFillingStates.RESUMED:
                let oldScale = this.lastSavedState.scale.toFixed(2);
                oldScale = parseFloat((delay / rateOfFilling).toFixed(2)) + parseFloat(oldScale);
                rateOfFilling -= (rateOfFilling * oldScale);
                this.water.setScaleY(oldScale);
                this.tubBack.getChildByTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.Waves).setPositionY(this.water.height * oldScale - 5);
                break;

            case ACTIVITY_SAVE_A_SITUATION_1.WaterFillingStates.ENDED:
                this.water.setScaleY(1);
                rateOfFilling = 0;
                break;

        }
        if (this.isTeacherView || (!this.isTeacherView && this.currentWaterState != ACTIVITY_SAVE_A_SITUATION_1.WaterFillingStates.PAUSED)) {
            this.runWaterAnimation(rateOfFilling);
        }
    },

    runWaterAnimation(rateOfFilling) {
        let waves = this.tubBack.getChildByTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.Waves);
        this.water.runAction(cc.sequence(cc.scaleTo(rateOfFilling, 1, 1), cc.callFunc(this.onTubFilled, this)));
        waves.runAction(new cc.sequence(cc.moveBy(rateOfFilling - rateOfFilling * 0.1, 0, this.water.height * 0.9 - this.water.height * this.water.getScaleY()), cc.callFunc(this.increaseWaveScale, this, rateOfFilling * 0.1)));
        var animation = HDUtility.runFrameAnimation(ACTIVITY_SAVE_A_SITUATION_1.ref.animationFrames + "tub_waterFill/" + ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animation.data.waterInTub.name, ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animation.data.waterInTub.frameCount, 0.1, ".png", 1);
        waves.runAction(cc.repeatForever(animation));
    },

    updateWaterFillingInfo: function (state) {
        this.currentWaterState = state;
        if (ACTIVITY_SAVE_A_SITUATION_1.ref.isTeacherView)
            this.updateRoomData();

    },

    calculateElapsedTime: function () {
        var date = new Date();
        var currentTime = date.getTime();
        var delay = this.lastSavedState ? (currentTime - this.lastSavedState.startTime) / 1000 : 0;
        return delay;
    },

    onTubFilled: function (ref, data) {
        this.gameEndTime = this.water.getScaleY() * ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.levels.data[this.currentLevel].rateOfWaterFilling * 60;
        this.stopLandParallax();
        this.getChildByTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.WaterLoopAnimation).setVisible(false);
        this.changeAnimalsTexture(false);
        if (this.isTeacherView) {
            this.updateWaterFillingInfo(ACTIVITY_SAVE_A_SITUATION_1.WaterFillingStates.ENDED);
        }
        this.currentWaterState = ACTIVITY_SAVE_A_SITUATION_1.WaterFillingStates.ENDED;
        this.tubFront.runAction(cc.sequence(cc.spawn(cc.moveBy(0.5, 0, -15), cc.rotateBy(0.5, 5, 5)), cc.spawn(cc.moveBy(0.5, 0, -140), cc.rotateBy(0.5, 5, 10)), cc.spawn(cc.moveBy(0.3, 0, -70), cc.rotateBy(0.3, -15, -10))));
        this.tubBack.runAction(cc.sequence(cc.spawn(cc.moveBy(0.5, 0, -15), cc.rotateBy(0.5, 5, 5)), cc.spawn(cc.moveBy(0.5, 0, -140), cc.rotateBy(0.5, 4, 10)), cc.spawn(cc.moveBy(0.3, 0, -60), cc.rotateBy(0.3, -15, -10)), cc.callFunc(this.changeAnimalsParent, this, ref), cc.spawn(cc.moveBy(0, 0, -100), cc.rotateBy(0, -15, -20)), cc.delayTime(1), cc.callFunc(this.onAnimationEnd, this, false), cc.delayTime(5), cc.callFunc(this.showResultPopUp, this, false)));
        this.baseAnimationSprite.runAction(cc.sequence(cc.delayTime(0.5), cc.spawn(cc.scaleBy(1, 1.2, 1.3), cc.moveBy(1, 10, 23)), cc.callFunc(this.removeFromParent, this.baseAnimationSprite, true)));
    },

    changeAnimalsTexture: function (isHappy) {
        for (var index in ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animals.data) {
            let position = this.animalArray[index].getPosition();
            this.animalArray[index].setTexture(!isHappy ? ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath + ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animals.data[index].sad : ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath + ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animals.data[index].happy);
            let positionY = isHappy ? position.y + 60 : position.y + 45;
            this.animalArray[index].setPosition(position.x, positionY);
        }
    },

    changeAnimalsParent: function (ref, water) {
        let colorNode2 = new cc.DrawNode()
        colorNode2.drawRect(cc.p(100, 170), cc.p(650, 600), null, 11, HDConstants.White);
        this.cliper.stencil = colorNode2;

        // animals are in sequence // sheep , dog, cat, rat
        let movePos = [cc.p(40, 40), cc.p(-40, 40), cc.p(-20, 15), cc.p(0, -5)]
        for (var i in ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animals.data) {

            let animalInfo = ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animals.data[i];
            let item = this.animalArray[i]
            let newPos = item.parent.convertToWorldSpace(item.getPosition());
            let scale = item.setScale(0.5);
            item.removeFromParent(true);
            item.setScale(0.55)
            item.setPosition(newPos.x, newPos.y);
            console.log("animals pos", item.getPosition());
            var clipper = new cc.ClippingNode();
            clipper.setContentSize(this.getContentSize());

            let colorNode2 = new cc.DrawNode();
            colorNode2.drawCircle(cc.p(animalInfo.maskInfo.pos), animalInfo.maskInfo.radius, 30, 300, true, 11, cc.color.WHITE);
            clipper.setStencil(colorNode2);
            clipper.addChild(item);

            this.addChild(clipper, 3);
            let waterAnimation = this.addSprite(ACTIVITY_SAVE_A_SITUATION_1.ref.animationFrames + "animalWaterline/" + ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animation.data.animalWaterLine.name + "0001.png", animalInfo.wPosition, this);
            waterAnimation.setScale(animalInfo.wScale);
            waterAnimation.setAnchorPoint(0.5, 0);
            waterAnimation.setLocalZOrder(3);
            var animation = HDUtility.runFrameAnimation(ACTIVITY_SAVE_A_SITUATION_1.ref.animationFrames + "animalWaterline/" + ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animation.data.animalWaterLine.name, ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animation.data.animalWaterLine.frameCount, 0.1, ".png", cc.REPEAT_FOREVER);
            waterAnimation.runAction(animation);
            clipper.runAction(new cc.moveBy(2, movePos[i]));
            waterAnimation.runAction(new cc.moveBy(2, movePos[i]));

        }
    },

    //######################################## TABLE VIEW  AND IT'S METHODS ##############################
    addBottomSideBar() {
        let position = cc.p(this.getPositionForTableView(), this.height * 0.01);
        let width = this.getWidthOfCarousel();
        var baseColorLayer = this.createColourLayer(cc.color(237, 231, 65), width, this.carouselHeight, cc.p(position.x, position.y + 6), this, 2);
        baseColorLayer.setOpacity(255);
        baseColorLayer.setVisible(true);

        this.tableView = new cc.TableView(this, cc.size(width, this.carouselHeight));
        this.tableView.setPosition(cc.p(position.x, position.y + 6));
        this.tableView.setClippingToBounds(true);
        this.tableView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this.tableView.setBounceable(false);
        this.tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        this.tableView.setTouchEnabled(true);
        this.tableView.setDataSource(this);
        this.tableView.setDelegate(this);
        this.tableView.setOpacity(0);
        this.addChild(this.tableView, 3);

        if (this.lastSavedState && this.lastSavedState.selectedIndex != -1 && this.isStudentInteractionEnable) {
            this.allowStudentTouch(data = {
                "userName": HDAppManager.username,
                "index": this.lastSavedState.selectedIndex,
                "broadcast": ACTIVITY_SAVE_A_SITUATION_1.BroadcastType.TO_SELF
            });
        }

        let hPadding = 20;
        var carouselBaseImage = this.addSprite(ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath + ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.carouselBackgroundBorderImage.imageName, cc.p(position.x - 10, position.y), this);
        carouselBaseImage.setAnchorPoint(0, 0);
        carouselBaseImage.setLocalZOrder(3);
        carouselBaseImage.setScale((width + hPadding) / carouselBaseImage.width, this.carouselHeight.height / carouselBaseImage.height);
    },
    getWidthOfCarousel: function () {
        let cellWidthSize = this.carouselWidth * ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.levels.data[ACTIVITY_SAVE_A_SITUATION_1.ref.currentLevel].carouselAssets.length;

        let maxWidth = this.carouselWidth * this.visibleObject;//this.winSize.width * 0.6
        if (cellWidthSize > maxWidth) {
            return maxWidth
        } else {
            return cellWidthSize
        }
    },
    getPositionForTableView: function () {
        let width = this.getWidthOfCarousel();
        let xPos = (this.winSize.width * 0.5) - (width * 0.5);
        return xPos;
    },
    tableCellSizeForIndex: function (table, idx) {
        return cc.size(this.carouselWidth, table.getViewSize().height);
    },
    tableCellAtIndex: function (table, idx) {
        let cardCell = table.dequeueCell();
        let cellSize = this.tableCellSizeForIndex(table, idx);
        if (cardCell == null) {
            cardCell = new ACTIVITY_SAVE_A_SITUATION_1.CardCell(cellSize);
        }
        cardCell.tag = idx;
        cardCell.createUI(idx, ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.levels.data[this.currentLevel].carouselAssets[idx]);
        if (this.lastSavedState && this.lastSavedState.holesInfo[idx]) {
            cardCell.enableClipper();
        }

        return cardCell;
    },
    numberOfCellsInTableView: function (table) {
        return ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.levels.data[this.currentLevel].carouselAssets.length;
    },

    tableCellTouched: function (table, cell) {
        if (ACTIVITY_SAVE_A_SITUATION_1.ref.isTeacherView && cell.isTouchEnabled()) {
            this.resetCell();
            cell.enableHighLightLayer();
            // this.currentCell = cell;
            var data = {
                "userName": HDAppManager.username,
                "index": cell.getTag(),
                "broadcast": ACTIVITY_SAVE_A_SITUATION_1.BroadcastType.TO_SELF
            };
            this.allowStudentTouch(data);
            ACTIVITY_SAVE_A_SITUATION_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                'eventType': ACTIVITY_SAVE_A_SITUATION_1.socketEvents.ACTIVATE_CELL,
                'data': {
                    "userName": HDAppManager.username,
                    "index": cell.getTag(),
                    "broadcast": ACTIVITY_SAVE_A_SITUATION_1.BroadcastType.TO_EVERYONE_EXCEPT_SELF
                }
            });
        }

    },

    //######################################## SOCKET GAME EVENT CALLBACKS ##############################
    checkOverlap: function (eventLocation, isDemo) {
        for (let index = 0; index < this.holesArray.length; index++) {
            // console.log(cc.rectContainsPoint(this.holesArray[index].getBoundingBoxToWorld(), eventLocation),this.holesArray[index].getName() , this.selectedObject.getName() , this.isStudentInteractionEnable ,this.isTeacherView , !this.holesArray[index].isVisible());
            if (cc.rectContainsPoint(this.holesArray[index].getBoundingBoxToWorld(), eventLocation) && this.holesArray[index].getName() == this.selectedObject.getName() && (this.isStudentInteractionEnable || this.isTeacherView) && !this.holesArray[index].isVisible()) {
                this.plugedInDestination(index);
                ACTIVITY_SAVE_A_SITUATION_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                    'eventType': ACTIVITY_SAVE_A_SITUATION_1.socketEvents.PLUG_PLACED_AT_DESTINATION,
                    'data': this.holesArray[index].getTag()
                });
                if ((this.isStudentInteractionEnable) && !isDemo) {

                    this.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_STUDENT, {"roomId": HDAppManager.roomId});
                }
                break;
            }
        }
    },

    onElementReturn: function (elementRef, index) {
        this.selectedObject.setVisible(false);
        let cell = this.tableView.cellAtIndex(index);
        cell.disableClipper();
        cell.disableHIghlightLayer();
        cell.removeStudentName();
        if (!this.isTeacherView) {
            cell.setTouchEnabled(false);
        }
        this.selectedCellIdx = -1;
        this.changeMouseCursorImage();

    },

    allowStudentTouch: function (data) {
        if ((data.username == HDAppManager.userName && data.broadcast == ACTIVITY_SAVE_A_SITUATION_1.BroadcastType.TO_SELF) || (data.userName != HDAppManager.username && data.broadcast == ACTIVITY_SAVE_A_SITUATION_1.BroadcastType.TO_EVERYONE_EXCEPT_SELF)) {
            this.resetCell();
            var touchedCell = this.tableView.cellAtIndex(data.index);
            touchedCell.cardElement.setOpacity(255);
            touchedCell.setTouchEnabled(true);
            this.currentCell = touchedCell;
            this.selectedCellIdx = data.index;
            if (this.isTeacherView || this.isStudentInteractionEnable)
                touchedCell.enableHighLightLayer();
            this.updateRoomData();
            if (this.isTeacherView) {
                this.currentCell.setStudentName(this.currentPlayerName);
            }
        }
    },

    resetCell: function () {
        if (this.currentCell) {
            this.currentCell.setCardElementOpacity(this.isTeacherView ? 255 : 100);
            this.currentCell.disableHIghlightLayer();
            this.currentCell.removeStudentName();
            if (this.currentCell.isTouchEnabled()) {
                this.currentCell.disableClipper();
            }
        }
    },

    movePlug: function (data) {
        if (data.userName == HDAppManager.username && data.broadcast == ACTIVITY_SAVE_A_SITUATION_1.BroadcastType.TO_SELF && !this.holesArray[data.cellNo].isVisible() || data.userName != HDAppManager.username && data.broadcast == ACTIVITY_SAVE_A_SITUATION_1.BroadcastType.TO_EVERYONE_EXCEPT_SELF && !this.holesArray[data.cellNo].isVisible()) {
            this.currentCell = this.tableView.cellAtIndex(data.cellNo);
            this.selectedObject.setTexture(this.currentCell.cardElement.getTexture());
            this.selectedObject.setName(this.currentCell.filledImage);
            this.selectedObject.setVisible(true);
            this.isDragging = true;
            this.selectedCellIdx = data.cellNo;
            this.selectedObject.setPosition(this.convertToNodeSpace(data.position));
            this.checkOverlap(data.position, data.isDemo);
            if (this.currentCell.isTouchEnabled()) {
                this.currentCell.enableClipper();
            }
        }
    },

    placePlugBack: function (data) {
        if (data.userName == HDAppManager.username && data.broadcast == ACTIVITY_SAVE_A_SITUATION_1.BroadcastType.TO_SELF || data.userName != HDAppManager.username && data.broadcast == ACTIVITY_SAVE_A_SITUATION_1.BroadcastType.TO_EVERYONE_EXCEPT_SELF) {
            this.selectedObject.runAction(cc.sequence(cc.moveTo(0.2, data.position), cc.callFunc(this.onElementReturn, this, data.cellIndex)));
            this.isDragging = false;
            this.isMouseDown = false;
            this.currentCell.setCardElementOpacity(this.isTeacherView ? 255 : 100);
            this.changeMouseCursorImage();
        }
    },

    plugedInDestination(data) {
        if (!this.holesArray[data].isVisible()) {   // if still unfilled
            this.isDragging = false;
            this.holesArray[data].setVisible(true);
            this.selectedObject.setVisible(false);
            this.currentCell.disableHIghlightLayer();
            this.currentCell.removeStudentName();
            this.currentCell.enableClipper();
            this.isMouseDown = false;
            this.selectedCellIdx = -1;
            this.totalHoles--;
            this.filledHoles[data] = 1;
            if (this.totalHoles == 0 && (this.isStudentInteractionEnable || this.isTeacherView)) {
                this.gameEndTime = this.water.getScaleY() * ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.levels.data[this.currentLevel].rateOfWaterFilling * 60;
                ACTIVITY_SAVE_A_SITUATION_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                    'eventType': ACTIVITY_SAVE_A_SITUATION_1.socketEvents.LEVEL_OVER,
                    'data': true
                });
            }
            ACTIVITY_SAVE_A_SITUATION_1.ref.updateRoomData();
            this.changeMouseCursorImage();
        }
    },

    onStartNewLevel: function (data) {
        this.currentLevel = data;
        this.resetGameVariables();
        this.resetUI();
        this.setUpUI();
        if (this.isTeacherView && this.isAnyStudentPresent) {
            this.emitWaterFillingEvent();
        }
    },

    resetUI: function () {
        this.removeAllChildren(true);
        this.unscheduleUpdate();
    },

    resetGameVariables: function () {
        this.holesArray.length = 0;
        this.animalArray.length = 0;
        this.userAckArray.length = 0;
        this.hasWon = false;
        this.filledHoles.fill(0);
        this.hasTextureChanged = false;
        this.hasWinAnimationPlayed = false;
        this.currentWaterState = ACTIVITY_SAVE_A_SITUATION_1.WaterFillingStates.NOT_STARTED;
        this.totalHoles = 5;
        this.lastSavedState = null;
        this.hasNewRoundStarted = false;
        if (ACTIVITY_SAVE_A_SITUATION_1.ref.isTeacherView)
            this.updateRoomData();

    },

    // ###################################### MOUSE LISTENER ##############################
    mouseEventListener: function (event) {
        switch (event._eventType) {
            case cc.EventMouse.DOWN:
                ACTIVITY_SAVE_A_SITUATION_1.ref.isMouseDown = true;
                ACTIVITY_SAVE_A_SITUATION_1.ref.onMouseDown(event);
                break;
            case cc.EventMouse.MOVE:
                ACTIVITY_SAVE_A_SITUATION_1.ref.onMouseMove(event);
                break;
            case cc.EventMouse.UP:
                ACTIVITY_SAVE_A_SITUATION_1.ref.isMouseDown = false;
                ACTIVITY_SAVE_A_SITUATION_1.ref.onMouseUp(event);
                break;
        }
    },

    touchEventListener: function (touch, event) {
        switch (event.getEventCode()) {
            case cc.EventTouch.EventCode.BEGAN:
                ACTIVITY_SAVE_A_SITUATION_1.ref.isMouseDown = true;
                ACTIVITY_SAVE_A_SITUATION_1.ref.onMouseDown(touch);
                break;
            case cc.EventTouch.EventCode.MOVED:
                ACTIVITY_SAVE_A_SITUATION_1.ref.onMouseMove(touch);
                break;
            case cc.EventTouch.EventCode.ENDED:
                ACTIVITY_SAVE_A_SITUATION_1.ref.isMouseDown = false;
                ACTIVITY_SAVE_A_SITUATION_1.ref.onMouseUp(touch);
                break;
        }
    },

    onMouseDown: function (event) {
        if (ACTIVITY_SAVE_A_SITUATION_1.ref.isStudentInteractionEnable) {
            ACTIVITY_SAVE_A_SITUATION_1.ref.updateMouseIcon(event.getLocation());
        }
    },

    onMouseMove: function (event) {
        if (ACTIVITY_SAVE_A_SITUATION_1.ref.isMouseDown && ACTIVITY_SAVE_A_SITUATION_1.ref.selectedCellIdx != -1 && (ACTIVITY_SAVE_A_SITUATION_1.ref.isTeacherView || (!ACTIVITY_SAVE_A_SITUATION_1.ref.isTeacherView && ACTIVITY_SAVE_A_SITUATION_1.ref.isStudentInteractionEnable))) {
            if (ACTIVITY_SAVE_A_SITUATION_1.ref.isStudentInteractionEnable) {
                ACTIVITY_SAVE_A_SITUATION_1.ref.updateMouseIcon(event.getLocation());
            }
            ACTIVITY_SAVE_A_SITUATION_1.ref.tableView._dragging = false;
            ACTIVITY_SAVE_A_SITUATION_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                'eventType': ACTIVITY_SAVE_A_SITUATION_1.socketEvents.MOVE_PLUG,
                'data': {
                    "position": event.getLocation(),
                    "cellNo": ACTIVITY_SAVE_A_SITUATION_1.ref.currentCell.getTag(),
                    "userName": HDAppManager.username,
                    "broadcast": ACTIVITY_SAVE_A_SITUATION_1.BroadcastType.TO_EVERYONE_EXCEPT_SELF,
                    "isDemo": this.isTeacherView
                }
            });
            ACTIVITY_SAVE_A_SITUATION_1.ref.movePlug(data = {
                "position": event.getLocation(),
                "cellNo": ACTIVITY_SAVE_A_SITUATION_1.ref.currentCell.getTag(),
                "userName": HDAppManager.username,
                "broadcast": ACTIVITY_SAVE_A_SITUATION_1.BroadcastType.TO_SELF,
                "isDemo": this.isTeacherView
            });
            // console.log("mouse move", ACTIVITY_SAVE_A_SITUATION_1.ref.isMouseDown);
        }
    },

    onMouseUp: function (event) {
        if (ACTIVITY_SAVE_A_SITUATION_1.ref.isDragging && ACTIVITY_SAVE_A_SITUATION_1.ref.selectedObject.isVisible()) {
            ACTIVITY_SAVE_A_SITUATION_1.ref.placePlugBack(data = {
                "position": ACTIVITY_SAVE_A_SITUATION_1.ref.currentCell.convertToWorldSpaceAR(ACTIVITY_SAVE_A_SITUATION_1.ref.currentCell.cardElement.getPosition()),
                "userName": HDAppManager.username,
                "broadcast": ACTIVITY_SAVE_A_SITUATION_1.BroadcastType.TO_SELF,
                "cellIndex": this.selectedCellIdx
            });
            ACTIVITY_SAVE_A_SITUATION_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                'eventType': ACTIVITY_SAVE_A_SITUATION_1.socketEvents.PLACE_PLUG_BACK,
                'data': {
                    "position": ACTIVITY_SAVE_A_SITUATION_1.ref.currentCell.convertToWorldSpaceAR(ACTIVITY_SAVE_A_SITUATION_1.ref.currentCell.cardElement.getPosition()),
                    "userName": HDAppManager.username,
                    "broadcast": ACTIVITY_SAVE_A_SITUATION_1.BroadcastType.TO_EVERYONE_EXCEPT_SELF,
                    "cellIndex": this.selectedCellIdx
                }
            });
            ACTIVITY_SAVE_A_SITUATION_1.ref.tableView._dragging = true;
        }
    },

    mouseControlEnable: function (location) {
        return this.interactableObject;
    },
    mouseTexture: function () {
        return {'hasCustomTexture': this.customTexture, 'textureUrl': this.MouseTextureUrl};
    },
    updateMouseIcon: function (location) {
        this.changeMouseCursorImage();
        if (location.y < this.getContentSize().height * 0.9 && this.isStudentInteractionEnable) {
            this.customTexture = true;
            this.interactableObject = true;
        } else {
            this.interactableObject = false
        }

    },

    changeMouseCursorImage: function () {
        if (!HDAppManager.isTeacherView && this.isStudentInteractionEnable) {
            var cursorPath = (ACTIVITY_SAVE_A_SITUATION_1.ref.config.properties.preLoaded ? ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath : "AsyncActivity/" + ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath);
            this.MouseTextureUrl = !this.selectedObject.isVisible() ? cursorPath + ACTIVITY_SAVE_A_SITUATION_1.ref.config.cursors.data.openFingers.imageName : cursorPath + ACTIVITY_SAVE_A_SITUATION_1.ref.config.cursors.data.closedFingers.imageName;
        } else {
            this.customTexture = false;
            this.MouseTextureUrl = "";
        }
    },

    //######################################## SOCKET LISTENER ##############################
    emitSocketEvent: function (type, data) {
        SocketManager.emitCutomEvent(ACTIVITY_SAVE_A_SITUATION_1.socketEventKey.singleEvent, {
            'eventType': type,
            'roomId': HDAppManager.roomId,
            'data': data
        }, null);
    },


    socketListener(res) {
        if (!ACTIVITY_SAVE_A_SITUATION_1.ref) {
            return;
        }
        switch (res.eventType) {
            case HDSocketEventType.DISABLE_STUDENT_INTERACTION:
                ACTIVITY_SAVE_A_SITUATION_1.ref.disableInteraction();
            case HDSocketEventType.DISABLE_INTERACTION:
                ACTIVITY_SAVE_A_SITUATION_1.ref.disableInteraction(res.data);
                break;
            case HDSocketEventType.STUDENT_TURN:
                ACTIVITY_SAVE_A_SITUATION_1.ref.studentTurn(res.data);
                break;
            case HDSocketEventType.STUDENT_STATUS:
                ACTIVITY_SAVE_A_SITUATION_1.ref.studentStatus(res.data);
                break;
            case HDSocketEventType.GAME_MESSAGE:
                ACTIVITY_SAVE_A_SITUATION_1.ref.gameEvents(res.data);
                break;

        }

    },

    studentTurn: function (res) {
        let users = res.users;
        if (ACTIVITY_SAVE_A_SITUATION_1.ref.isTeacherView && users.length > 0 && this.water.getNumberOfRunningActions() == 0 && !this.hasWon) {
            this.emitWaterFillingEvent();
        }
        this.isAnyStudentPresent = users.length == 0 ? false : true;

        if (ACTIVITY_SAVE_A_SITUATION_1.ref.isTeacher) {
        } else {
            if (users.length == 0) {
                ACTIVITY_SAVE_A_SITUATION_1.ref.isStudentInteractionEnable = false;
                this.changeMouseCursorImage();
                return;
            }
            for (let index = 0; index < users.length; index++) {
                let obj = users[index];
                if (obj.userName == HDAppManager.username) {
                    ACTIVITY_SAVE_A_SITUATION_1.ref.isStudentInteractionEnable = true;
                    this.changeMouseCursorImage();
                    break;
                } else {
                    ACTIVITY_SAVE_A_SITUATION_1.ref.isStudentInteractionEnable = false;
                    this.changeMouseCursorImage();
                }
            }
        }
        this.updateSelectedCellInfo(users);
    },

    updateSelectedCellInfo: function (users) {
        var cell = null;
        if (this.selectedCellIdx != -1) {
            cell = this.tableView.cellAtIndex(this.selectedCellIdx);
        }

        if (users.length > 0 && this.isTeacherView && users[0].userName != HDAppManager.username) {
            this.currentPlayerName = users[0].userName;
        }

        if (cell) {
            cell.setStudentName(this.currentPlayerName);
            this.isStudentInteractionEnable || this.isTeacherView ? cell.enableHighLightLayer() : cell.disableHIghlightLayer();
        }
    },

    emitWaterFillingEvent: function () {
        ACTIVITY_SAVE_A_SITUATION_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            'eventType': ACTIVITY_SAVE_A_SITUATION_1.socketEvents.START_WATER_FILLING,
            'data': ACTIVITY_SAVE_A_SITUATION_1.ref.lastSavedState ? ACTIVITY_SAVE_A_SITUATION_1.ref.lastSavedState.currentWaterState : ACTIVITY_SAVE_A_SITUATION_1.ref.currentWaterState
        })
    },

    disableInteraction: function () {
        ACTIVITY_SAVE_A_SITUATION_1.ref.isStudentInteractionEnable = false;
        this.isAnyStudentPresent = false;
    },

    gameEvents: function (res) {

        switch (res.eventType) {
            case ACTIVITY_SAVE_A_SITUATION_1.socketEvents.ACTIVATE_CELL:
                ACTIVITY_SAVE_A_SITUATION_1.ref.allowStudentTouch(res.data);
                break;
            case ACTIVITY_SAVE_A_SITUATION_1.socketEvents.MOVE_PLUG:
                ACTIVITY_SAVE_A_SITUATION_1.ref.movePlug(res.data);
                break;

            case ACTIVITY_SAVE_A_SITUATION_1.socketEvents.PLACE_PLUG_BACK:
                ACTIVITY_SAVE_A_SITUATION_1.ref.placePlugBack(res.data);
                break;
            case ACTIVITY_SAVE_A_SITUATION_1.socketEvents.LEVEL_OVER:
                ACTIVITY_SAVE_A_SITUATION_1.ref.changeToWinBg(res.data);
                break;
            case ACTIVITY_SAVE_A_SITUATION_1.socketEvents.PLUG_PLACED_AT_DESTINATION:
                ACTIVITY_SAVE_A_SITUATION_1.ref.plugedInDestination(res.data);
                break;
            case ACTIVITY_SAVE_A_SITUATION_1.socketEvents.NEW_LEVEL:
                ACTIVITY_SAVE_A_SITUATION_1.ref.onStartNewLevel(res.data);
                break;
            case ACTIVITY_SAVE_A_SITUATION_1.socketEvents.ANIMATION_ENDED_ACK:
                ACTIVITY_SAVE_A_SITUATION_1.ref.animationEndAck(res.data);
                break;
            case ACTIVITY_SAVE_A_SITUATION_1.socketEvents.START_WATER_FILLING:
                ACTIVITY_SAVE_A_SITUATION_1.ref.startWaterFilling(res.data);
                break;
        }
    },

    updateStudentTurn: function (userName) {
        if (ACTIVITY_SAVE_A_SITUATION_1.ref.isTeacherView) {
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

    syncData: function (res) {
        this.lastSavedState = res;
    },

    updateRoomData: function () {
        var dataToSent = {
            holesInfo: ACTIVITY_SAVE_A_SITUATION_1.ref.filledHoles,
            selectedIndex: ACTIVITY_SAVE_A_SITUATION_1.ref.selectedCellIdx,
            currentLevel: ACTIVITY_SAVE_A_SITUATION_1.ref.currentLevel,
            startTime: ACTIVITY_SAVE_A_SITUATION_1.ref.startTime,
            currentWaterState: ACTIVITY_SAVE_A_SITUATION_1.ref.currentWaterState,
            scale: ACTIVITY_SAVE_A_SITUATION_1.ref.water.getScaleY(),
        };

        SocketManager.emitCutomEvent("SingleEvent",
            {
                'eventType': HDSocketEventType.UPDATE_ROOM_DATA,
                'roomId': HDAppManager.roomId,
                'data': {
                    "roomId": HDAppManager.roomId,
                    "roomData": {
                        "activity": ACTIVITY_SAVE_A_SITUATION_1.ref.config.properties.namespace,
                        "data": dataToSent,
                        "activityStartTime": HDAppManager.getActivityStartTime()
                    }
                }
            }, null);
    },


    studentStatus: function (data) {
        var teacherId = data.teacherId;
        var user = data.users;
        this.totalJoinedUsers = user.length;
        var teacher = user.filter(item => item.userId == teacherId);
        if (teacher.length == 0 && this.water && this.water.getNumberOfRunningActions() == 1) {
            this.water.pause();
            this.tubBack.getChildByTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.Waves).pause();
            this.currentWaterState = ACTIVITY_SAVE_A_SITUATION_1.WaterFillingStates.PAUSED;
            this.updateRoomData();
        } else if (teacher.length == 1 && this.water && !this.isTeacherView) {
            this.water.resume();
            this.tubBack.getChildByTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.Waves).resume();
        }
    },


    // ##################################### LEVEL END ####################################
    onAnimationEnd: function (ref, isWin) {
        ACTIVITY_SAVE_A_SITUATION_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            'eventType': ACTIVITY_SAVE_A_SITUATION_1.socketEvents.ANIMATION_ENDED_ACK,
            'data': {name: HDAppManager.username, endState: isWin}
        });
    },

    animationEndAck: function (data) {
        var user = this.userAckArray.filter(item => item == data.name);
        if (user.length == 0) {
            this.userAckArray.push(user);
            if (this.userAckArray.length == this.totalJoinedUsers) {
                this.showResultPopUp(null, data.endState);
            }
        }
    },


    startNewLevel: function (ref, level) {
        if (this.isTeacherView && !this.hasNewRoundStarted) {
            ACTIVITY_SAVE_A_SITUATION_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE,
                {
                    'eventType': ACTIVITY_SAVE_A_SITUATION_1.socketEvents.NEW_LEVEL,
                    'data': level
                });
            this.hasNewRoundStarted = true;
        }
    },
    changeToWinBg: function () {
        this.hasWon = true;
        this.water.stopAllActions();
        this.tubBack.getChildByTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.Waves).stopAllActions();

        if (!this.hasWinAnimationPlayed) {
            let winAnimation = this.addSprite("res/LessonResources/emptyImage.png", ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animation.data.winAnimation.position, this);
            winAnimation.setLocalZOrder(5);
            let action = HDUtility.runFrameAnimation(ACTIVITY_SAVE_A_SITUATION_1.ref.animationFrames + "cardTakeOut/" + ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animation.data.winAnimation.name, 15, 0.1, ".png", 1);
            this.changeAnimalsTexture(true);
            winAnimation.runAction(action);
            this.hasWinAnimationPlayed = true;
        }
    },

    moveTubToEnd() {
        this.cliper.runAction(cc.sequence(cc.spawn(cc.moveTo(3, 1000, 150), cc.scaleTo(3, 0.65, .65)), cc.delayTime(2), cc.callFunc(this.onAnimationEnd, this, true), cc.delayTime(5), cc.callFunc(this.showResultPopUp, this, true)));
        this.baseAnimationSprite.removeFromParent();
        this.baseAnimationSprite.setPosition(this.tubFront.width * 0.5, this.tubFront.height * 0.515);
        this.baseAnimationSprite.setScale(this.tubFront.width / this.baseAnimationSprite.width);
        var animation = HDUtility.runFrameAnimation(ACTIVITY_SAVE_A_SITUATION_1.ref.animationFrames + "tubWaterline/" + ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animation.data.tubWater.name, ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.animation.data.tubWater.frameCount, 0.1, ".png", cc.REPEAT_FOREVER);
        this.tubFront.addChild(this.baseAnimationSprite);
        this.baseAnimationSprite.runAction(animation);
        this.getChildByTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.CurrentLand).runAction(cc.moveBy(1.5, -200, 0));
        this.getChildByTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.WaterLoopAnimation).runAction(cc.spawn(cc.moveTo(3, 1250, 340), cc.scaleTo(3, 0.35, 0.35)))
    },

    // ##################################### TICK ####################################
    update: function (dt) {
        for (let i = 0; i < this.parallaxNode.parallaxArray.length; i++) {
            let node = this.parallaxNode.parallaxArray[i];
            if (this.parallaxNode.convertToWorldSpace(node._child.getPosition()).x + node._child.width < -10) {
                node.setOffset(cc.p(node.getOffset().x + (1.99 * node._child.width), node.getOffset().y));
            }
            if (this.hasWon) {
                if ((node._child.getTag() == ACTIVITY_SAVE_A_SITUATION_1.Tag.Land1 || node._child.getTag() == ACTIVITY_SAVE_A_SITUATION_1.Tag.Land2)) {
                    let pos = this.parallaxNode.convertToWorldSpace(node._child.getPosition()).x + node._child.width;
                    if (pos > 1500 && pos < 1980) {
                        this.hasTextureChanged = true;
                        node._child.setTexture(ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath + ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.winLand.imageName);
                    }
                    if (this.hasTextureChanged && pos > 960 && pos < 1200) {
                        let child = node._child;
                        let tag = child.getTag();
                        child.removeFromParent();
                        child.setTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.CurrentLand);
                        child.setPosition(-child.width + pos, 0);
                        this.addChild(child, 0);
                        this.moveTubToEnd();
                        if (tag == ACTIVITY_SAVE_A_SITUATION_1.Tag.Land1) {
                            this.parallaxNode.getChildByTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.Land2).removeFromParent();
                        } else {
                            this.parallaxNode.getChildByTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.Land1).removeFromParent();
                        }
                    }
                }
            }
        }
    },

    stopLandParallax: function () {
        let land1 = this.parallaxNode.getChildByTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.Land1);
        let land2 = this.parallaxNode.getChildByTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.Land2);
        if (land1 && land2) {
            let pos1 = this.parallaxNode.convertToWorldSpace(land1.getPosition()).x + land1.width;
            let pos2 = this.parallaxNode.convertToWorldSpace(land2.getPosition()).x + land2.width;
            land1.setPosition(-land1.width + pos1, 0);
            land1.removeFromParent();
            this.addChild(land1, 0);
            land2.removeFromParent();
            land2.setPosition(-land2.width + pos2, 0);
            this.addChild(land2, 0);
        }

    },

    isLastLevel: function () {
        if (this.currentLevel == ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.levels.data.length - 1) {
            return true;
        } else {
            return false;
        }
    },

    triggerScript: function (message) {
        if (this.parent) {
            this.parent.showScriptMessage(message);
        }
    },

    showResultPopUp: function (ref, isWin) {
        if (this.isTeacherView && this.getChildByTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.PopUP) == null && !this.hasNewRoundStarted) {
            var popup = this.addSprite(ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath + ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.popUp.imageName, ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.popUp.position, this);
            popup.setLocalZOrder(5);
            popup.setTag(ACTIVITY_SAVE_A_SITUATION_1.Tag.PopUP);

            this.gameEndTime = Math.ceil(this.gameEndTime);
            var min = Math.floor(this.gameEndTime / 60);
            var second = Math.trunc(this.gameEndTime % 60);
            var timeString = "";

            timeString = min > 9 ? min : "0" + min;
            timeString += ":";
            timeString += second > 9 ? second : "0" + second;

            this.createTTFLabel(timeString, HDConstants.Sassoon_Medium, 50, HDConstants.Black, cc.p(popup.width * 0.55, popup.height * 0.65), popup)
            var nextButton = this.createButton(ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath + ACTIVITY_SAVE_A_SITUATION_1.ref.config.buttons.data.next.enableState, ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath + ACTIVITY_SAVE_A_SITUATION_1.ref.config.buttons.data.next.pushedState, null, null, ACTIVITY_SAVE_A_SITUATION_1.Tag.NextButton, cc.p(popup.width * 0.75, popup.height * 0.2), popup, this, null);

            if (this.isLastLevel() || !isWin) {
                nextButton.setOpacity(150);
                nextButton.setTouchEnabled(false);
            }
            this.createButton(ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath + ACTIVITY_SAVE_A_SITUATION_1.ref.config.buttons.data.replay.enableState, ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath + ACTIVITY_SAVE_A_SITUATION_1.ref.config.buttons.data.replay.pushedState, null, null, ACTIVITY_SAVE_A_SITUATION_1.Tag.ReplayButton, cc.p(popup.width * 0.25, popup.height * 0.2), popup, this, null);
        }
    },


    buttonCallback: function (sender, type) {
        if (type == ccui.Widget.TOUCH_ENDED) {
            switch (sender.getTag()) {
                case ACTIVITY_SAVE_A_SITUATION_1.Tag.NextButton :
                    this.startNewLevel(sender.parent, this.currentLevel + 1);
                    sender.parent.removeFromParent();
                    break;

                case ACTIVITY_SAVE_A_SITUATION_1.Tag.ReplayButton:
                    this.startNewLevel(sender.parent, this.currentLevel);
                    sender.parent.removeFromParent();
                    break;

            }
        }
    }

});

ACTIVITY_SAVE_A_SITUATION_1.CardCell = cc.TableViewCell.extend({
    cellData: null,
    highlightLayer: null,
    translucentLayer: null,
    cardElement: null,
    filledImage: null,
    touchEnabled: true,
    nameLable: null,

    ctor: function (cellSize) {
        this._super();
        this.setContentSize(cellSize);
        return true;
    },

    onEnter: function () {
        this._super();
    },

    createUI: function (idx, data) {
        this.cellData = data;
        this.tag = idx;
        this.removeAllChildren(true);

        let cardBg = new cc.Layer();
        cardBg.setContentSize(this.width, this.height);
        cardBg.setPosition(0, 0);
        this.addChild(cardBg);
        cardBg.setOpacity(100);

        this.cardElement = new cc.Sprite(ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath + data.name);
        this.cardElement.setPosition(this.width * 0.5, this.height * 0.6);
        this.cardElement.setScale(0.18);
        this.addChild(this.cardElement, 3);
        this.cardElement.setOpacity(ACTIVITY_SAVE_A_SITUATION_1.ref.isTeacherView ? 255 : 100);

        this.nameLable = new cc.LabelTTF(" ", HDConstants.Sassoon_Medium, 14);
        this.nameLable.setColor(HDConstants.Black);
        this.nameLable.setDimensions(this.width * 0.8, 0);
        this.nameLable.setPosition(cardBg.width * 0.5, cardBg.height * 0.15);
        this.nameLable.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

        cardBg.addChild(this.nameLable, 5);

        let color = new cc.Color(255, 251, 119, 100);
        this.highlightLayer = new cc.Sprite(ACTIVITY_SAVE_A_SITUATION_1.ref.spriteBasePath + ACTIVITY_SAVE_A_SITUATION_1.ref.config.assets.sections.carouselGlowBoxCard.name);
        this.highlightLayer.setPosition(cardBg.width * 0.5, cardBg.height * 0.5);
        this.highlightLayer.setColor(color);
        this.highlightLayer.setScale(cardBg.width * 0.8 / this.highlightLayer.width, cardBg.height * 0.85 / this.highlightLayer.height);
        this.highlightLayer.setColor(color);
        cardBg.addChild(this.highlightLayer, 4);
        this.highlightLayer.setVisible(false);
        this.filledImage = data.holeInfo.filledImage;
        if (!ACTIVITY_SAVE_A_SITUATION_1.ref.isTeacherView) {
            this.touchEnabled = false;
        }
    },

    enableHighLightLayer() {
        this.highlightLayer.setVisible(true);
    },

    isTouchEnabled: function () {
        return this.touchEnabled;
    },

    setTouchEnabled: function (touch) {
        this.touchEnabled = touch;
    },

    disableHIghlightLayer: function () {
        this.highlightLayer.setVisible(false);
    },

    setCardElementOpacity: function (opacity) {
        // console.log("opacity",opacity);
        this.cardElement.setOpacity(opacity);

    },

    setStudentName: function (name) {
        this.nameLable.setString(name);
        this.nameLable.setVisible(true);
    },

    removeStudentName: function () {
        this.nameLable.setVisible(false);
    },

    enableClipper: function () {
        this.cardElement.setVisible(false);
        this.setTouchEnabled(false);
    },

    disableClipper: function () {
        this.cardElement.setOpacity(HDAppManager.isTeacherView ? 255 : 100);
        this.setTouchEnabled(true);
        this.cardElement.setVisible(true);

    }
});



