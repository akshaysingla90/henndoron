/**
 * return the distance between two points.
 *
 * @param {number} x1		x position of first point
 * @param {number} y1		y position of first point
 * @param {number} x2		x position of second point
 * @param {number} y2		y position of second point
 * @return {number} 		distance between given points
 */
Math.getDistance = function( x1, y1, x2, y2 ) {

    var 	xs = x2 - x1,
        ys = y2 - y1;

    xs *= xs;
    ys *= ys;

    return Math.sqrt( xs + ys );
};

var ACTIVITY_FROG_WORD_1 = {};
ACTIVITY_FROG_WORD_1.Tag = {
    HOME_BASE           :   100,
    FrogTounge          :   101,
    LeafItem            :   103
};




ACTIVITY_FROG_WORD_1.socketEventKey = {
    HELP                        : 101,
    USER_DATA                   : 102,
    START_NEXT_LEVEL            : 103,
    STUDENT_INTERACTION         : 104,
    CHANGE_MULTIPLAYER_MODE     : 105,
    REPLAY                      : 106,
    JUMPFROG                    : 107,
    TARGET_LETTER               : 108,
    PATHSELECTION               : 109,
    FROG_ROTATION               : 110,

};

ACTIVITY_FROG_WORD_1.paths_1 = [
    [{"x":192,"y":307},{"x":133,"y":374},{"x":120,"y":455},{"x":227,"y":510},{"x":346,"y":451},{"x":455,"y":461},{"x":556,"y":460},{"x":676,"y":459},{"x":781,"y":440}],
    [{"x":192,"y":307},{"x":242,"y":399},{"x":346,"y":451},{"x":455,"y":461},{"x":556,"y":460},{"x":596,"y":375},{"x":728,"y":347}],
    [{"x":192,"y":307},{"x":242,"y":399},{"x":346,"y":451},{"x":448,"y":375},{"x":596,"y":375},{"x":728,"y":347}],
    [{"x":192,"y":307},{"x":330,"y":327},{"x":448,"y":375},{"x":556,"y":460},{"x":676,"y":459},{"x":781,"y":440}],
    [{"x":192,"y":307},{"x":297,"y":230},{"x":408,"y":181},{"x":513,"y":146},{"x":580,"y":204},{"x":660,"y":274},{"x":728,"y":347}],
    [{"x":192,"y":307},{"x":297,"y":230},{"x":408,"y":181},{"x":513,"y":146},{"x":580,"y":204},{"x":660,"y":274},{"x":755,"y":206},{"x":863,"y":236},{"x":831,"y":305}],
    [{"x":192,"y":307},{"x":242,"y":399},{"x":227,"y":510},{"x":334,"y":541},{"x":423,"y":528},{"x":510,"y":531},{"x":556,"y":460},{"x":676,"y":459},{"x":781,"y":440}],
    [{"x":192,"y":307},{"x":330,"y":327},{"x":420,"y":265},{"x":514,"y":283},{"x":596,"y":375},{"x":728,"y":347},{"x":781,"y":440}],
    [{"x":192,"y":307},{"x":242,"y":399},{"x":346,"y":451},{"x":455,"y":461},{"x":556,"y":460},{"x":676,"y":459},{"x":781,"y":440}],
    [{"x":192,"y":307},{"x":242,"y":399},{"x":346,"y":451},{"x":448,"y":375},{"x":514,"y":283},{"x":580,"y":204},{"x":665,"y":144},{"x":755,"y":206},{"x":863,"y":236}],
    [{"x":192,"y":307},{"x":330,"y":327},{"x":448,"y":375},{"x":596,"y":375},{"x":660,"y":274},{"x":755,"y":206},{"x":863,"y":236},{"x":831,"y":305}],
    [{"x":192,"y":307},{"x":242,"y":399},{"x":227,"y":510},{"x":334,"y":541},{"x":423,"y":528},{"x":510,"y":531},{"x":556,"y":460},{"x":596,"y":375},{"x":728,"y":347},{"x":781,"y":440}],
    [{"x":192,"y":307},{"x":242,"y":399},{"x":346,"y":451},{"x":423,"y":528},{"x":510,"y":531},{"x":556,"y":460},{"x":596,"y":375},{"x":728,"y":347},{"x":831,"y":305}],
    [{"x":192,"y":307},{"x":242,"y":399},{"x":227,"y":510},{"x":334,"y":541},{"x":423,"y":528},{"x":455,"y":461},{"x":448,"y":375},{"x":514,"y":283},{"x":580,"y":204},{"x":665,"y":144},{"x":755,"y":206},{"x":863,"y":236}],
    [{"x":192,"y":307},{"x":297,"y":230},{"x":420,"y":265},{"x":448,"y":375},{"x":455,"y":461},{"x":510,"y":531},{"x":612,"y":531},{"x":676,"y":459},{"x":781,"y":440}],
    [{"x":192,"y":307},{"x":133,"y":374},{"x":120,"y":455},{"x":227,"y":510},{"x":346,"y":451},{"x":455,"y":461},{"x":510,"y":531},{"x":612,"y":531},{"x":676,"y":459},{"x":596,"y":375},{"x":728,"y":347},{"x":831,"y":305}],
    [{"x":192,"y":307},{"x":242,"y":399},{"x":227,"y":510},{"x":334,"y":541},{"x":423,"y":528},{"x":455,"y":461},{"x":556,"y":460},{"x":596,"y":375},{"x":728,"y":347},{"x":831,"y":305},{"x":863,"y":236}],
    [{"x":192,"y":307},{"x":242,"y":399},{"x":346,"y":451},{"x":423,"y":528},{"x":510,"y":531},{"x":556,"y":460},{"x":596,"y":375},{"x":728,"y":347},{"x":781,"y":440},{"x":832,"y":505}],
    [{"x":192,"y":307},{"x":297,"y":230},{"x":408,"y":181},{"x":513,"y":146},{"x":580,"y":204},{"x":660,"y":274},{"x":596,"y":375},{"x":556,"y":460},{"x":612,"y":531},{"x":727,"y":529},{"x":832,"y":505}]

];

ACTIVITY_FROG_WORD_1.paths = [
    [{"x":192,"y":307},{"x":330,"y":327},{"x":420,"y":265},{"x":514,"y":283},{"x":660,"y":274},{"x":831,"y":305}],
    [{"x":192,"y":307},{"x":242,"y":399},{"x":346,"y":451},{"x":448,"y":375},{"x":556,"y":460},{"x":596,"y":375},{"x":728,"y":347},{"x":781,"y":440}],
    [{"x":192,"y":307},{"x":297,"y":230},{"x":408,"y":181},{"x":420,"y":265},{"x":514,"y":283},{"x":596,"y":375},{"x":728,"y":347},{"x":831,"y":305}],
    [{"x":192,"y":307},{"x":133,"y":374},{"x":242,"y":399},{"x":346,"y":451},{"x":423,"y":528},{"x":510,"y":531},{"x":556,"y":460},{"x":676,"y":459},{"x":781,"y":440}],
    [{"x":192,"y":307},{"x":330,"y":327},{"x":448,"y":375},{"x":596,"y":375},{"x":676,"y":459},{"x":781,"y":440}],
    [{"x":192,"y":307},{"x":330,"y":327},{"x":420,"y":265},{"x":408,"y":181},{"x":580,"y":204},{"x":660,"y":274},{"x":728,"y":347}],
    [{"x":192,"y":307},{"x":297,"y":230},{"x":330,"y":327},{"x":420,"y":265},{"x":514,"y":283},{"x":660,"y":274},{"x":728,"y":347}],
    [{"x":192,"y":307},{"x":133,"y":374},{"x":120,"y":455},{"x":227,"y":510},{"x":346,"y":451},{"x":455,"y":461},{"x":556,"y":460},{"x":596,"y":375},{"x":728,"y":347}],
    [{"x":192,"y":307},{"x":242,"y":399},{"x":346,"y":451},{"x":448,"y":375},{"x":596,"y":375},{"x":676,"y":459},{"x":781,"y":440}],
    [{"x":192,"y":307},{"x":297,"y":230},{"x":330,"y":327},{"x":420,"y":265},{"x":408,"y":181},{"x":513,"y":146},{"x":580,"y":204},{"x":660,"y":274},{"x":728,"y":347}]
];

ACTIVITY_FROG_WORD_1.ref = null;



ACTIVITY_FROG_WORD_1.FrogWordHop = HDBaseLayer.extend({
    isTeacherView               :   false,
    interactableObject          :   false,
    customTexture               :   false,
    handIconUI                  :   [],
    gameData                    :   [],
    currentLevel                :   0,
    gamePlayInfo                :   {},
    syncInfo                    :   null,
    //
    totalLeafsInPath            :   0,
    carouselWidth               :   70,
    carouselHeight              :   70,
    pathAndItems                : {},
    isFrogInAction              : false,
    tempPath                    : [],
    targetLetter                : null,
    occupiedLeaf                : null,
    frog                        : null,
    targetLetterBase            : null,
    emptyBoxes                  : [],
    itemsCollected              : [],
    lillyLeafs                  : [],
    isMouseDown                 : false,
    itemPositions               : [{x:120,y:455,s:0.8},{x:227,y:510,s:1},{x:133,y:374,s:0.7},{x:242,y:399,s:1},{x:192,y:307,s:1},{x:128,y:226,s:0.8},{x:297,y:230,s:1},{x:330,y:327,s:1},{x:346,y:451,s:1},{x:334,y:541,s:0.7},{x:423,y:528,s:0.65},{x:455,y:461,s:0.75},{x:448,y:375,s:1},{x:420,y:265,s:0.75},{x:408,y:181,s:1},{x:513,y:146,s:0.9},{x:580,y:204,s:1},{x:514,y:283,s:1},{x:596,y:375,s:1},{x:556,y:460,s:0.8},{x:510,y:531,s:0.7},{x:612,y:531,s:0.8},{x:727,y:529,s:0.8},{x:832,y:505,s:0.7},{x:676,y:459,s:0.8},{x:781,y:440,s:1},{x:728,y:347,s:1},{x:660,y:274,s:0.8},{x:831,y:305,s:1},{x:863,y:236,s:0.8},{x:755,y:206,s:1},{x:665,y:144,s:0.8}],



    ctor: function () {
        this._super();
    },
    //************************************** GAME CONFIG SETUP *****************************************//
    onEnter: function () {
        this._super();
        ACTIVITY_FROG_WORD_1.ref = this;
        let activityName = 'ACTIVITY_FROG_WORD_1';
        ACTIVITY_FROG_WORD_1.ref.isStudentInteractionEnable = false;
        cc.loader.loadJson("res/Activity/" + activityName + "/config.json", function (error, config) {
            ACTIVITY_FROG_WORD_1.config = config;
            ACTIVITY_FROG_WORD_1.resourcePath = "res/Activity/" + "" + activityName + "/res/";
            ACTIVITY_FROG_WORD_1.soundPath = ACTIVITY_FROG_WORD_1.resourcePath + "Sound/";
            ACTIVITY_FROG_WORD_1.animationBasePath = ACTIVITY_FROG_WORD_1.resourcePath + "AnimationFrames/";
            ACTIVITY_FROG_WORD_1.spriteBasePath = ACTIVITY_FROG_WORD_1.resourcePath + "Sprite/";
            ACTIVITY_FROG_WORD_1.ref.isTeacherView = HDAppManager.isTeacherView;
            ACTIVITY_FROG_WORD_1.ref.setupUI();
            if (ACTIVITY_FROG_WORD_1.ref.isTeacherView) {
                ACTIVITY_FROG_WORD_1.ref.createDataToSend();
                ACTIVITY_FROG_WORD_1.ref.updateRoomData();
                ACTIVITY_FROG_WORD_1.ref.isStudentInteractionEnable = true;
            }
            ACTIVITY_FROG_WORD_1.ref.MouseTextureUrl = ACTIVITY_FROG_WORD_1.spriteBasePath + ACTIVITY_FROG_WORD_1.config.cursors.data.cursorPointer.imageName;
            ACTIVITY_FROG_WORD_1.ref.triggerScript( ACTIVITY_FROG_WORD_1.config.teacherScripts.data.moduleStart.content.ops);
            ACTIVITY_FROG_WORD_1.ref.syncInfo &&  ACTIVITY_FROG_WORD_1.ref.distributeItemsStudent(ACTIVITY_FROG_WORD_1.ref.syncInfo.pathAndItems);
            ACTIVITY_FROG_WORD_1.ref.syncInfo &&  ACTIVITY_FROG_WORD_1.ref.setTargetLetter(ACTIVITY_FROG_WORD_1.ref.syncInfo.targetLetter);
        });
    },

    fetchGameData: function () {
        HDNetworkHandler.get(HDAPIKey.GameData, {"roomId": HDAppManager.roomId}, true, (err, res) => {
        });
    },

    onExit: function () {
        this._super();
        ACTIVITY_FROG_WORD_1.ref.removeAllChildrenWithCleanup(true);
        ACTIVITY_FROG_WORD_1.ref.customTexture = false;
        ACTIVITY_FROG_WORD_1.ref.interactableObject = false;
        ACTIVITY_FROG_WORD_1.ref.handIconUI.length = 0;
        ACTIVITY_FROG_WORD_1.ref = null;

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
        this.setBackground(ACTIVITY_FROG_WORD_1.spriteBasePath + ACTIVITY_FROG_WORD_1.config.background.sections.background.imageName);
        this.setPondLeafs();
        this.setFrogToInitialPos();
        this.targetLetterBase = this.addSprite(ACTIVITY_FROG_WORD_1.spriteBasePath +  ACTIVITY_FROG_WORD_1.config.assets.sections.FinishLine.baseImage ,cc.p(this._size.width*0.93,this._size.height*0.63),this);
        this.setTargetLetter();
        this.isTeacherView && this.brodcastPathSelection();
        this.addBottomSideBar();

    },
    distributeItems :  function(path){
        let itemsToBroadcast = [];
        this.totalLeafsInPath = path.length;
        let correctItems = this.getCorrectItems(true);
        let inCorrectItems = this.getCorrectItems(false);
        if (correctItems.length < path.length){
            let moreItemsNeeded = path.length - correctItems.length;
            for (let i = 0; i< moreItemsNeeded;i++){
                correctItems.push(correctItems[Math.floor(Math.random() * correctItems.length)])
            }
        }
        let correctItemsCounter = 0;
        for (let leaf of this.lillyLeafs){
            if (leaf !== ACTIVITY_FROG_WORD_1.ref.lillyLeafs[5]) {
                let itemName = inCorrectItems[Math.floor(Math.random() * inCorrectItems.length)];
                if (this.isLeafOnCorrectPath(path,leaf)){
                    itemName = correctItems[correctItemsCounter];
                    correctItemsCounter = correctItemsCounter + 1;
                }

                let item = this.addSprite(ACTIVITY_FROG_WORD_1.spriteBasePath + itemName,cc.p(leaf.getContentSize().width*0.5,leaf.getContentSize().height*0.5),leaf);
                item.setName(itemName);
                item.setTag(ACTIVITY_FROG_WORD_1.Tag.LeafItem);
                itemsToBroadcast.push({"leafTag":leaf.getTag(),"itemName":itemName})
            }
        }
        return itemsToBroadcast;
    },
    distributeItemsStudent : function({path,itemsToBroadcast}){
        this.setEmptyBoxes(path.length);
        for (let i = 0;i<this.lillyLeafs.length;i++){
            let leaf = this.lillyLeafs[i];
            if (leaf !== ACTIVITY_FROG_WORD_1.ref.lillyLeafs[5]) {
                let obj = this.getItemNameFromData(leaf,itemsToBroadcast);
                let itemName = obj.itemName;
                let item = this.addSprite(ACTIVITY_FROG_WORD_1.spriteBasePath + itemName,cc.p(leaf.getContentSize().width*0.5,leaf.getContentSize().height*0.5),leaf);
                item.setName(itemName);
                item.setTag(ACTIVITY_FROG_WORD_1.Tag.LeafItem);
            }
        }

    },
    getItemNameFromData : function(leaf, itemsToBroadcast){
        for (let obj of itemsToBroadcast){
            if(leaf.getTag() === obj.leafTag){
                return obj;
                break;
            }
        }
    },
    brodcastPathSelection : function(){
        let path = ACTIVITY_FROG_WORD_1.paths_1[Math.floor(Math.random() * ACTIVITY_FROG_WORD_1.paths_1.length)];
        let itemsToBroadcast = this.distributeItems(path);
        let param = {"path":path,"itemsToBroadcast":itemsToBroadcast};
        this.pathAndItems = param;
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE,{
            "eventType":ACTIVITY_FROG_WORD_1.socketEventKey.PATHSELECTION,
            "data" : param
        });
    },
    isLeafOnCorrectPath : function(path,leaf){
        let status = false;
        for (let pathPos of path){
            if (leaf.getPosition().x === pathPos.x && leaf.getPosition().y === pathPos.y){
                status = true;
                break;
            }
        }
        return status;
    },
    setTargetLetter : function(){
        this.targetLetter = ACTIVITY_FROG_WORD_1.config.assets.sections.FinishLine.FinishLineImage;
        this.addSprite(ACTIVITY_FROG_WORD_1.spriteBasePath + this.targetLetter,cc.p(this.targetLetterBase.getContentSize().width*0.5,this.targetLetterBase.getContentSize().height*0.5),this.targetLetterBase);

    },
    getCorrectItems : function(areCorrect){
        let lType = this.targetLetter.slice(this.targetLetter.length - 5);
        let allItemImages =  ACTIVITY_FROG_WORD_1.config.assets.sections.items.data;
        let correctLetterImages = [];
        for (let item of allItemImages){
            let itemName = item.imageName.slice(5);
            if (areCorrect){
                if (lType.charAt(0) === itemName.charAt(0))
                    correctLetterImages.push(item.imageName);
            } else {
                if (lType.charAt(0) !== itemName.charAt(0))
                    correctLetterImages.push(item.imageName);
            }
        }
        return correctLetterImages;
    },
    setPondLeafs : function() {
        console.log("length", this.itemPositions.length, ACTIVITY_FROG_WORD_1.config.assets.sections.tiles.data.length);
        var leafTag = 500;
        for(let lilyPads of ACTIVITY_FROG_WORD_1.config.assets.sections.tiles.data){
            let sprite = this.addSprite(ACTIVITY_FROG_WORD_1.spriteBasePath + ACTIVITY_FROG_WORD_1.config.assets.sections.leafs.tiled,lilyPads.centerPosition,this);
            console.log("sprite", sprite.getPosition());
            sprite.setScale(lilyPads.scale);
            sprite.setTag(leafTag++);
            ACTIVITY_FROG_WORD_1.ref.lillyLeafs.push(sprite);
        }
    },
    setEmptyBoxes :  function(maxItems){
        // let sizeRefrence = new cc.Sprite(ACTIVITY_FROG_WORD_1.spriteBasePath + "box_collected-item.png");
        // for (let i =1; i <= maxItems; i++) {
        //     let  pos = cc.p(((this._size.width*0.25)-sizeRefrence.getContentSize().width*0.525*(maxItems-6)) + sizeRefrence.getContentSize().width*1.1*i,this._size.height*0.065);
        //     let sprite = this.addSprite(ACTIVITY_FROG_WORD_1.spriteBasePath + "box_collected-item.png",pos,this);
        //     ACTIVITY_FROG_WORD_1.ref.emptyBoxes.push(sprite);
        // }
    },
    setFrogToInitialPos : function(){
        let leaf = ACTIVITY_FROG_WORD_1.ref.lillyLeafs[5];
        let pos = cc.p(leaf.getContentSize().width*0.5,leaf.getContentSize().height*0.5);
        this.frog = this.addSprite(ACTIVITY_FROG_WORD_1.spriteBasePath + "froggy_idle.png",leaf.getPosition(),this);
        this.frog.setZOrder(100);
        this.occupiedLeaf = leaf;
        this.changeOccupiedLeafTexture(this.occupiedLeaf);
        // add tongue
        let tongue = this.addSprite(ACTIVITY_FROG_WORD_1.spriteBasePath + "tongue_arow_slice_01.png",cc.p(this.frog.getContentSize().width*0.35,this.frog.getContentSize().height*0.5),this.frog);
        tongue.setTag(ACTIVITY_FROG_WORD_1.Tag.FrogTounge);
        tongue.setAnchorPoint(cc.p(1.0,0.5));
        tongue.setZOrder(-10);
        tongue.setVisible(false);

        this.frog.setRotation(150);
    },
    showFrogTounge : function(shouldShow){
        let tounge = this.frog.getChildByTag(ACTIVITY_FROG_WORD_1.Tag.FrogTounge);
        tounge.setVisible(shouldShow);
    },
    enlrageFrogTounge :  function(toPoint){
        let tounge = this.frog.getChildByTag(ACTIVITY_FROG_WORD_1.Tag.FrogTounge);
        let touchDistance = Math.getDistance(this.frog.getPosition().x,this.frog.getPosition().y,toPoint.x,toPoint.y);
        // cc.log("distance = "+touchDistance);
        if(touchDistance/25 < 5.0)
            tounge.setScaleX(touchDistance/25);

    },
    nodeMoveToLocation : function({location,leafTag}){
        let leaf = this.getChildByTag(leafTag);
        this.isFrogInAction = true;
        if(this.checkAnswer(leaf)){
            // answer is correct
            let moveAnimation = HDUtility.runFrameAnimation(ACTIVITY_FROG_WORD_1.animationBasePath+ ACTIVITY_FROG_WORD_1.config.assets.sections.animation.data.froggy_jump_land.frameInitial, ACTIVITY_FROG_WORD_1.config.assets.sections.animation.data.froggy_jump_land.frameCount, 0.03, ".png", 1);
            this.frog.runAction(cc.spawn(moveAnimation,cc.sequence(cc.delayTime(0.1),cc.moveTo(0.2,location),cc.callFunc(function () {
                this.frog.setScale(this.frog.getScale() + 0.05);
            },this))));
            leaf.runAction(cc.sequence(cc.delayTime(0.3),cc.callFunc(this.changeOccupiedLeafTexture, this, leaf)));

        }else {
            // answer is incorrect

            let midX = ((location.x + this.frog.getPosition().x)/2);
            let midY = ((location.y + this.frog.getPosition().y)/2);

            let moveAnimation = HDUtility.runFrameAnimation(ACTIVITY_FROG_WORD_1.animationBasePath+ ACTIVITY_FROG_WORD_1.config.assets.sections.animation.data.froggy_jump_splash.frameInitial, ACTIVITY_FROG_WORD_1.config.assets.sections.animation.data.froggy_jump_splash.frameCount, 0.03, ".png", 1);
            let climbBack = HDUtility.runFrameAnimation(ACTIVITY_FROG_WORD_1.animationBasePath+ ACTIVITY_FROG_WORD_1.config.assets.sections.animation.data.froggy_climb_back.frameInitial, ACTIVITY_FROG_WORD_1.config.assets.sections.animation.data.froggy_climb_back.frameCount, 0.07, ".png", 1);

            this.frog.runAction(cc.sequence(cc.spawn(moveAnimation,cc.sequence(cc.delayTime(0.1),cc.moveTo(0.2,cc.p(midX ,midY)))),cc.moveTo(0.0,this.frog.getPosition()),climbBack,cc.callFunc(function () {
                this.isFrogInAction = false;
            },this)));

            //==leaf shake animation
            let currentScale = leaf.getScale();
            leaf.runAction(cc.sequence(cc.delayTime(0.3),cc.spawn(cc.sequence(cc.scaleTo(0.1,currentScale - 0.2),cc.scaleTo(0.1,currentScale)),cc.callFunc(this.itemShakeAnimation, this, leaf)),));

        }

    },
    jumpFrogBrodcasting : function(location, leaf){
        //ge identify tag
        let param = {location:location,leafTag:leaf.getTag()};
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE,{
            "eventType":ACTIVITY_FROG_WORD_1.socketEventKey.JUMPFROG,
            "data" : param
        });
        this.nodeMoveToLocation(param);
    },
    itemShakeAnimation : function(leaf){
        let leafItem = leaf.getChildByTag(ACTIVITY_FROG_WORD_1.Tag.LeafItem);
        leafItem.setVisible(false);
        let leafItemReplica = this.addSprite(ACTIVITY_FROG_WORD_1.spriteBasePath+leafItem.getName(),leaf.getPosition(),this);
        leafItemReplica.setScale(leaf.getScale());
        leafItemReplica.runAction(cc.sequence(cc.rotateTo(0.1,-15),cc.rotateTo(0.1,15),cc.rotateTo(0.1,0),cc.callFunc(this.removeReplicaItem, this, leafItemReplica)));
        leafItem.runAction(cc.sequence(cc.delayTime(0.25),cc.callFunc(function (leafItem) {
            leafItem.setVisible(true);
        }, this)));

    },
    removeReplicaItem : function(data){
        data.removeFromParent(true);

    },
    changeOccupiedLeafTexture : function(leaf){
        if (leaf){
            let mSprite = new cc.Sprite(ACTIVITY_FROG_WORD_1.spriteBasePath+  ACTIVITY_FROG_WORD_1.config.assets.sections.leafs.activeFilePath);
            this.occupiedLeaf = leaf;
            this.occupiedLeaf.setTexture(mSprite.getTexture());
            let item = this.occupiedLeaf.getChildByTag(ACTIVITY_FROG_WORD_1.Tag.LeafItem);
            if (item){
                this.addItemTobucket(item.getName());
                let animation = HDUtility.runFrameAnimation(ACTIVITY_FROG_WORD_1.animationBasePath+ ACTIVITY_FROG_WORD_1.config.assets.sections.animation.data.correct_answer.frameInitial, ACTIVITY_FROG_WORD_1.config.assets.sections.animation.data.correct_answer.frameCount, 0.07, ".png", 1);
                item.runAction(cc.sequence(animation,cc.callFunc(function () {
                    item.removeFromParent(true);
                },this)));
            }
            this.isFrogInAction = false;
        }

        // changing student turn
        if (!this.isTeacherView && this.isStudentInteractionEnable) {
            this.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_STUDENT, {"roomId": HDAppManager.roomId});
        }

    },
    addItemTobucket : function(itemName){
        for (let bucket of this.emptyBoxes){
            cc.log("childeren count = "+parseInt(bucket.getChildrenCount()));
            if (parseInt(bucket.getChildrenCount()) === 0){
                let item1 = this.addSprite(ACTIVITY_FROG_WORD_1.spriteBasePath+itemName,cc.p(bucket.getContentSize().width*0.5,bucket.getContentSize().height*0.5),bucket)
                item1.setScale(0.7);
                this.itemsCollected.push(item1);
                let item = this.addSprite(ACTIVITY_FROG_WORD_1.spriteBasePath+itemName,cc.p(bucket.getContentSize().width*0.5,bucket.getContentSize().height*0.5),bucket)
                item.setScale(0.7);
                let animation = HDUtility.runFrameAnimation(ACTIVITY_FROG_WORD_1.animationBasePath+ ACTIVITY_FROG_WORD_1.config.assets.sections.animation.data.correct_answer.frameInitial, ACTIVITY_FROG_WORD_1.config.assets.sections.animation.data.correct_answer.frameCount, 0.07, ".png", 1);
                item.runAction(cc.sequence(animation,cc.callFunc(function () {
                    if (this.emptyBoxes.length ===  this.itemsCollected.length){
                        this.jumpFrogOutOfScreen();

                    }

                },this)));
                break;
            }
        }
    },
    jumpFrogOutOfScreen :  function(){
        let moveAnimation = HDUtility.runFrameAnimation(ACTIVITY_FROG_WORD_1.animationBasePath+ ACTIVITY_FROG_WORD_1.config.assets.sections.animation.data.froggy_jump_land.frameInitial, ACTIVITY_FROG_WORD_1.config.assets.sections.animation.data.froggy_jump_land.frameCount, 0.07, ".png", 1);

        this.frog.runAction(cc.spawn(moveAnimation,cc.sequence(cc.delayTime(0.2),cc.callFunc(function () {
            this.rotateNodeToPoint(this.frog,cc.p(this._size.width*1.05,this._size.height*0.7));
        },this),cc.moveTo(0.5,cc.p(this._size.width*1.05,this._size.height*0.7)))));
    },
    checkAnswer : function(leaf){
        let lType = this.targetLetter.slice(this.targetLetter.length - 5);
        let itemName = leaf.getChildByTag(ACTIVITY_FROG_WORD_1.Tag.LeafItem).getName();
        itemName = itemName.slice(5);
        if (lType.charAt(0) === itemName.charAt(0)){
            return true;
        }else {
            return false;
        }
    },
    getTouchedLeaf : function(touch){
        let leafSp = null;
        for (let leaf of this.lillyLeafs){
            if (cc.rectContainsPoint(leaf.getBoundingBox(),touch.getLocation())) {
                leafSp = leaf;
                break;
            }
        }
        return leafSp;
    },
    onMouseDown: function (event) {
        cc.log("onMouseDown");
        if (!ACTIVITY_FROG_WORD_1.ref.isStudentInteractionEnable)
            return;
        if( !ACTIVITY_FROG_WORD_1.ref.isStudentInteractionEnable || ACTIVITY_FROG_WORD_1.ref.isPreviewMode)  return;
        var pos = event.getLocation();
        // var id = event.getID();
        // cc.log("onTouchBegan at: " + pos.x + " " + pos.y + " Id:" + id );
        let leaf = this.getTouchedLeaf(event);
        this.rotateNodeToPoint(this.frog,pos);
        this.showFrogTounge(true);
        this.enlrageFrogTounge(pos);
        //
        if(leaf) this.tempPath.push(leaf.getPosition());
        this.tempPathDisplay();

        //
        return true;
    },
    onMouseUp: function (event) {
        if( !ACTIVITY_FROG_WORD_1.ref.isStudentInteractionEnable || ACTIVITY_FROG_WORD_1.ref.isPreviewMode)  return;
        var pos = event.getLocation();
        // var id = event.getID();
        this.showFrogTounge(false);
        this.enlrageFrogTounge(pos);
        let leaf = this.getTouchedLeaf(event);
        if (leaf && leaf.getChildByTag(ACTIVITY_FROG_WORD_1.Tag.LeafItem) && this.isApproachable(leaf.getPosition()) && !this.isFrogInAction) {
            // this.nodeMoveToLocation(leaf.getPosition(),leaf);
            this.jumpFrogBrodcasting(leaf.getPosition(),leaf);
            this.brodcastFrogRotation();
        }
    },
    onMouseMove: function (event) {
        if( !ACTIVITY_FROG_WORD_1.ref) return;
        ACTIVITY_FROG_WORD_1.ref.updateMouseIcon(event.getLocation());
        if( !ACTIVITY_FROG_WORD_1.ref.isStudentInteractionEnable || ACTIVITY_FROG_WORD_1.ref.isPreviewMode || !ACTIVITY_FROG_WORD_1.ref.isMouseDown)  return;
        var pos = event.getLocation();
        // var id = event.getID();
        let leaf = this.getTouchedLeaf(event);
        this.rotateNodeToPoint(this.frog,pos);
        this.enlrageFrogTounge(pos);


    },
    getCurrentAngleOfNode : function (node) {
        let rotAng = node.getRotation();

        if(rotAng >= 180)
        {
            rotAng -= 360;
        }
        else if (rotAng < -180)
        {
            rotAng +=360;
        }

        // negative angle means node is facing to its left
        // positive angle means node is facing to its right
        return rotAng;
    },
    getAngleDifference : function(angle1, angle2) {
        let diffAngle = (angle1 - angle2);

        if(diffAngle >= 180)
        {
            diffAngle -= 360;
        }
        else if (diffAngle < -180)
        {
            diffAngle +=360;
        }

        // how much angle the node needs to rotate
        return diffAngle;
    },
    getAngleOfTwoVectors : function(vec1, vec2) {
        let diff_x = vec2.x - vec1.x;
        let diff_y = vec2.y - vec1.y;
        let angle = Math.atan2(diff_y,diff_x);
        // return 180 * angle/Math.PI
        return -Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x) * 180 / Math.PI + 180;
    },
    rotateNodeToPoint : function(node,touchPos) {
        let angleNodeToRotateTo = this.getAngleOfTwoVectors(node.getPosition(), touchPos);
        let nodeCurrentAngle = this.getCurrentAngleOfNode(node);

        let diffAngle = this.getAngleDifference(angleNodeToRotateTo, nodeCurrentAngle);

        let rotation = nodeCurrentAngle + diffAngle;

        node.setRotation(rotation);
    },
    setFrogRotation : function({frogRotation}){
        this.frog.setRotation(frogRotation)
    },
    brodcastFrogRotation : function(){
        let param = {"frogRotation":this.frog.getRotation()};
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE,{
            "eventType":ACTIVITY_FROG_WORD_1.socketEventKey.FROG_ROTATION,
            "data" : param
        });
    },
    tempPathDisplay : function(){
        // cc.log(JSON.stringify(this.tempPath));
    },
    isApproachable : function(location){
        let frogPos = this.frog.getPosition();
        let xFactor = Math.abs(location.x - frogPos.x);
        let yFactor = Math.abs(location.y - frogPos.y);
        cc.log("x factor = "+xFactor+"  yfactor = "+yFactor);
        if (xFactor >= this._size.width * 0.16 || yFactor >= this._size.height * 0.2)
            return false;
        else
            return true;

    },
    onTouchCancelled:function(touch, event) {
        if(!ACTIVITY_FROG_WORD_1.ref.isStudentInteractionEnable || ACTIVITY_FROG_WORD_1.ref.isPreviewMode) return;
        var pos = touch.getLocation();
        // var id = touch.getID();
    },


    //TABLE VIEW AND IT's METHODS
    addBottomSideBar() {
        let position = cc.p(this.getPositionForTableView(), this.height * 0.01);
        let width = this.getWidthOfCarousel();
        var baseColorLayer = this.createColourLayer(cc.color(237, 231, 65), width, this.carouselHeight, cc.p(position.x, position.y + 6), this, 2);
        baseColorLayer.setOpacity(100);
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
    },
    getWidthOfCarousel: function () {
        let cellWidthSize = this.carouselWidth * this.totalLeafsInPath;
        var visibleObjects = this.totalLeafsInPath > 8 ? 8 : this.totalLeafsInPath
        let maxWidth = this.carouselWidth * visibleObjects;//this.winSize.width * 0.6
        if (cellWidthSize > maxWidth) {
            return maxWidth
        } else {
            return cellWidthSize
        }
    },
    getPositionForTableView: function () {
        let width = this.getWidthOfCarousel();
        let xPos = (this.width * 0.5) - (width * 0.5);
        return xPos;
    },
    tableCellSizeForIndex: function (table, idx) {
        return cc.size(this.carouselWidth, table.getViewSize().height);
    },
    tableCellAtIndex: function (table, idx) {
        let cardCell = table.dequeueCell();
        let cellSize = this.tableCellSizeForIndex(table, idx);
        if (cardCell == null) {
            cardCell = new ACTIVITY_FROG_WORD_1.CardCell(cellSize);

        }
        cardCell.tag = idx;
        return cardCell;
    },
    numberOfCellsInTableView: function (table) {
        return this.totalLeafsInPath;
    },








    //******************************** SOCKET EVENTS ***************************************//
    updateRoomData: function () {
        // console.log("update room data", this.gamePlayInfo, this.multiPlayerType);
        SocketManager.emitCutomEvent("SingleEvent", {
            'eventType': HDSocketEventType.UPDATE_ROOM_DATA,
            'roomId': HDAppManager.roomId,
            'data': {
                "roomId": HDAppManager.roomId,
                "roomData": {
                    "activity": ACTIVITY_FROG_WORD_1.config.properties.namespace,
                    "data": {
                        "pathAndItems" : this.pathAndItems,
                        "targetLetter" : {"letter":this.targetLetter}
                    },
                    "activityStartTime": HDAppManager.getActivityStartTime()
                }
            }
        }, null);

        // console.log("user info", [...ACTIVITY_FROG_WORD_1.ref.gamePlayInfo]);
    },
    updateStudentInteraction: function (username, status) {
        if (this.isTeacherView) {
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                "eventType": ACTIVITY_FROG_WORD_1.socketEventKey.STUDENT_INTERACTION,
                "data": {"userName": username, "status": status}
            });
        }
    },
    onUpdateStudentInteraction: function (params) {
        if (params.userName == HDAppManager.username) {
            ACTIVITY_FROG_WORD_1.ref.isStudentInteractionEnable = params.status;
        }
    },
    socketListener: function (res) {
        if (!ACTIVITY_FROG_WORD_1.ref)
            return;
        switch (res.eventType) {
            case HDSocketEventType.DISABLE_STUDENT_INTERACTION:
                break;
            case HDSocketEventType.DISABLE_INTERACTION:
                ACTIVITY_FROG_WORD_1.ref.disableInteraction(res.data);
                break;
            case HDSocketEventType.RECEIVE_GRADES:
                break;
            case HDSocketEventType.STUDENT_STATUS:
                ACTIVITY_FROG_WORD_1.ref.studentStatus(res.data);
                break;
            case HDSocketEventType.STUDENT_TURN:
                ACTIVITY_FROG_WORD_1.ref.studentTurn(res.data);
                break;
            case HDSocketEventType.GAME_MESSAGE:
                if (res.data.userName == HDAppManager.username || !ACTIVITY_FROG_WORD_1.ref)
                    return;
                ACTIVITY_FROG_WORD_1.ref.gameEvents(res.data);
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
            return;
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
        if (!ACTIVITY_FROG_WORD_1.ref)
            return;
        switch (res.eventType) {
            case ACTIVITY_FROG_WORD_1.socketEventKey.STUDENT_INTERACTION:
                ACTIVITY_FROG_WORD_1.ref.onUpdateStudentInteraction(res.data);
                break;


            case ACTIVITY_FROG_WORD_1.socketEventKey.HELP:
                if(this.multiPlayerType == ACTIVITY_FROG_WORD_1.MULTIPLAYER_TYPE.TURN_BASED || this.isPreviewMode)
                ACTIVITY_FROG_WORD_1.ref.showOrHideBoard(res.data.show);
                break;


            case ACTIVITY_FROG_WORD_1.socketEventKey.CHANGE_MULTIPLAYER_MODE:
                ACTIVITY_FROG_WORD_1.ref.multiPlayerType = res.data.mode;
                break;


            case ACTIVITY_FROG_WORD_1.socketEventKey.REPLAY:
                ACTIVITY_FROG_WORD_1.ref.restart(res.data.levelNo);
                break;

            case ACTIVITY_FROG_WORD_1.socketEventKey.USER_DATA:
                 this.updateUserInfo(res.data);
                 break;


            case ACTIVITY_FROG_WORD_1.socketEventKey.START_NEXT_LEVEL:
                this.currentLevel = res.data.level;
                this.startNewLevel();
                break;
            case ACTIVITY_FROG_WORD_1.socketEventKey.JUMPFROG:
                this.nodeMoveToLocation(res.data);
                break;
            case ACTIVITY_FROG_WORD_1.socketEventKey.TARGET_LETTER:
                this.setTargetLetter(res.data);
                break;
            case ACTIVITY_FROG_WORD_1.socketEventKey.PATHSELECTION:
                this.distributeItemsStudent(res.data);
                break;
            case ACTIVITY_FROG_WORD_1.socketEventKey.FROG_ROTATION:
                this.setFrogRotation(res.data);
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
        ACTIVITY_FROG_WORD_1.ref.syncInfo = data;
        console.log("sync Data", data);

    },
    updateUserInfo : function(data, caller) {
        // console.log("update userInfo", data.userGamePlay,data.userGamePlay.userData, caller);
        if (this.multiPlayerType == ACTIVITY_FROG_WORD_1.MULTIPLAYER_TYPE.TURN_BASED) {
            this.gamePlayInfo[HDAppManager] = data.userGamePlay.userData;
        }else {
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
        }
       if(this.isTeacherView){
           this.updateRoomData();
       }

    },
    updateUI : function(){
        this.multiPlayerType = this.syncInfo.multiPlayerType;
        this.level           = this.syncInfo.level;
        this.gamePlayInfo     = JSON.parse(this.syncInfo.gamePlayInfo);

    },
    reset: function(){
        console.log("reset called");
        ACTIVITY_FROG_WORD_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            "eventType": ACTIVITY_FROG_WORD_1.socketEventKey.REPLAY,
            "data"      : {
                "levelNo"                 :  this.currentLevel,
            }
        });
        this.restart(this.currentLevel);
    },
    restart : function(level){
        this.currentLevel       = level;
        this.gamePlayInfo.length    = 0;
        this.syncInfo           = null;
        this.handIconUI.length  = 0;
        this.multiPlayerType = ACTIVITY_FROG_WORD_1.MULTIPLAYER_TYPE.TURN_BASED;
        this.gameData = [];
        this.removeAllChildren();
        this.setupUI();
        this.runAction(cc.sequence(cc.delayTime(1),   cc.callFunc(this.showResetHover, this)));

    },
    createDataToSend : function(){

    },


    //******************************** TOUCH LISTENERS EVENTS ENDED *************************//
    buttonCallback: function (sender, type) {
        if(!this.isStudentInteractionEnable){
            return;
        }
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                switch (sender.getTag()) {
                    case ACTIVITY_FROG_WORD_1.Tag.HELP_BUTTON:
                        if(this.isHintOpen) return;
                        if(ACTIVITY_FROG_WORD_1.ref.multiPlayerType == ACTIVITY_FROG_WORD_1.MULTIPLAYER_TYPE.TURN_BASED){
                            this.showOrHideBoard(true);
                            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                                "eventType": ACTIVITY_FROG_WORD_1.socketEventKey.HELP,
                                "data"      : {
                                    "show" : true,
                                }
                            });
                        }else{
                            this.showOrHideBoard(true);
                        }
                        break;

                    case ACTIVITY_FROG_WORD_1.Tag.MULTIPLAYER_MODE:
                        sender.setTouchEnabled(false);
                        this.multiPlayerType = ACTIVITY_FROG_WORD_1.MULTIPLAYER_TYPE.INDIVIDUAL;
                        lesson_1.ref.turnBased = false;
                        lesson_1.ref.setStudentsPreviewPanelActive(true);
                        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                            "eventType": ACTIVITY_FROG_WORD_1.socketEventKey.CHANGE_MULTIPLAYER_MODE,
                            "data"      : {
                                "mode" : ACTIVITY_FROG_WORD_1.MULTIPLAYER_TYPE.INDIVIDUAL,
                            }
                        });


                }
                break;
        }
    },
    touchEventListener: function (touch, event) {
        switch (event._eventCode) {
            case cc.EventTouch.EventCode.BEGAN:
                this.isMouseDown = true;
                this.onMouseDown(touch);
                break;
            case cc.EventTouch.EventCode.MOVED:

                this.onMouseMove(touch);
                break;
            case cc.EventTouch.EventCode.ENDED:
                this.isMouseDown = false;
                this.onMouseUp(touch);
                break;
        }
    },
    mouseEventListener: function (event) {
        switch (event._eventType) {

            case cc.EventMouse.DOWN:
                this.isMouseDown = true;
                this.onMouseDown(event);
                break;
            case cc.EventMouse.MOVE:
                this.onMouseMove(event);
                break;
            case cc.EventMouse.UP:
                this.isMouseDown = false;
                this.onMouseUp(event);
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
                console.log("update request");
                break;
            }
        }
        this.interactableObject = this.isStudentInteractionEnable;
        // console.log("mouse icon", this.interactableObject, this.MouseTextureUrl );
        this.customTexture = true;

    },
});

ACTIVITY_FROG_WORD_1.CardCell = cc.TableViewCell.extend({
    cardElement: null,
    cardBg      :null,
    animationBase   : null,
    ctor: function (cellSize) {
        this._super();
        this.setContentSize(cellSize);
        return true;
    },

    onEnter: function () {
        this._super();
        this.createUI();
    },

    createUI: function () {
       this.cardBg =  new cc.Sprite(ACTIVITY_FROG_WORD_1.spriteBasePath + ACTIVITY_FROG_WORD_1.config.assets.sections.itemContainer.ImageName);
       this.cardBg.setPosition(this.width * 0.5, this.height * 0.5);
       this.addChild(this.cardBg);
       this.cardElement = new cc.Sprite();
       this.cardElement.setPosition(this.cardBg * 0.5, this.cardBg.height * 0.6);
       this.cardBg.addChild(this.cardElement );
       this.animationBase =  new cc.Sprite();
       this.animationBase.setPosition(this.cardBg.width *0.5, this.cardBg.height*0.5);
       this.cardBg.addChild(this.animationBase );
    },

    updateCardElement : function(imageName){
        this.animationBase.setTexture(ACTIVITY_FROG_WORD_1.spriteBasePath + imageName);
       this.cardElement.setTexture(ACTIVITY_FROG_WORD_1.spriteBasePath + imageName);
       this.playAnimation()
    },

    playAnimation: function () {
        let animation = HDUtility.runFrameAnimation(ACTIVITY_FROG_WORD_1.animationBasePath+ ACTIVITY_FROG_WORD_1.config.assets.sections.animation.data.correct_answer.frameInitial, ACTIVITY_FROG_WORD_1.config.assets.sections.animation.data.correct_answer.frameCount, 0.07, ".png", 1);
        this.animationBase.runAction(animation);
    }


});
