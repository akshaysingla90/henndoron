// NameSpace for this activity
var DontWakeTheDragon = {
    // resourcePath: "res/Activity/ACTIVITY_DONT_WAKE_THE_DRAGON/res/Sprite/",
    // soundPath: "res/Activity/ACTIVITY_DONT_WAKE_THE_DRAGON/res/Sound/",
    // animationPath:
    //     "res/Activity/ACTIVITY_DONT_WAKE_THE_DRAGON/res/AnimationFrames/",
    // configFilePath: "res/Activity/ACTIVITY_DONT_WAKE_THE_DRAGON/config.json",
};

// socket events
/*
note:-
events mentioned in teacherEvents are emitted from teacher side and should be subscribed from student side.
Similarly events mentioned in studentEvents are emitted from student side and should be subscribed from teacher side
 */

// update room data format
// DontWakeTheDragon.updateRoomData = {
//   dragonAnimationStage: 1,
//   studentTurn: "chicmic_9",
//   studentsTreasureItems: { chicmic_9: [item_1_Tag, item_2_Tag_2] }, // tags should be the index of array in treasureItems array in config file (in order they appear)
//   treasureItems: [item_1_Tag, item2_Tag_2],
// };

DontWakeTheDragon.socketEventKey = {
    singleEvent: "SingleEvent",
};
DontWakeTheDragon.teacherEvents = {
    DONT_WAKE_THE_DRAGON_RESET_GAME: "DONT_WAKE_THE_DRAGON_RESET_GAME",
    TREASURE_ITEM_DROPPED_IN_CHEST_BY_TEACHER: 'TREASURE_ITEM_DROPPED_IN_CHEST_BY_TEACHER'
};
DontWakeTheDragon.studentEvents = {
    TREASURE_ITEM_DRAGGED: "TREASURE_ITEM_DRAGGED",
    TREASURE_ITEM_DROPPED: "TREASURE_ITEM_DROPPED",
    TREASURE_ITEM_DROPPED_IN_CHEST: "TREASURE_ITEM_DROPPED_IN_CHEST",
    DRAGON_ANIMATION_STAGE: "DRAGON_ANIMATION_STAGE",
};

DontWakeTheDragon.SubscriptionNotification = cc.Class.extend({
    onNotificationReceived: function (event) {
        const {eventType, data} = event;
        const {type} = data;
    },
});

DontWakeTheDragon.PERFORM_DRAGON_ANIMATION_DISTANCE = 50; // pixels

// difference between dragon's position and treasure item's position in pixels
DontWakeTheDragon.DistanceFromDragon = {
    CLOSE: 200,
    VERY_CLOSE: 300,
};

DontWakeTheDragon.DragonWakeUpProbabilities = {
    ITEMS_AROUND_DRAGON: 0.05,
    ITEMS_PARTIALLY_UNDERNEATH_DRAGON: 0.3,
    ITEMS_DIRECTLY_UNDERNEATH_DRAGON: 0.9,
};

DontWakeTheDragon.DragonWakeUpStages = {
    TOTALLY_STILL_AND_IN_A_DEEP_SLEEP: 1,
    MOVING_SLIGHTLY_IN_SLEEP: 2,
    ONE_EYE_OPEN_BUT_STILL_SLEEPY: 3,
    WAKE: 4,
};

// ========================== Dragon ===============================
DontWakeTheDragon.Dragon = cc.Sprite.extend({
    animationStage: 1,
    animationSpeed: 0.065,
    currentAction: null,
    ctor: function (animationStage) {
        this._super();
        this.animationStage = animationStage;
    },

    onEnter: function () {
        this._super();
        this.playAnimation(this.animationStage);
    },

    onExit: function () {
    },

    getAnimationStage: function () {
        return this.animationStage;
    },

    _createAnimationAction: function (animationAction) {
        const data =
            DontWakeTheDragon.MainLayerRef.config.assets.sections.animation.data[
                animationAction
                ];
        const animate = HDUtility.runFrameAnimation(
            DontWakeTheDragon.animationPath + data.frameInitial,
            data.frameCount,
            this.animationSpeed,
            ".png",
            1
        );
        this.stopAction(this.currentAction);
        return animate;
    },

    playStage_1_Animation: function () {
        this.animationStage = 1;
        const animationAction = this._createAnimationAction("DragonSleep");
        this.currentAction = animationAction;
        this.runAction(animationAction.repeatForever());
    },

    playStage_2_Animation: function () {
        this.animationStage = 2;
        const animationAction = this._createAnimationAction("DragonAlertStage1");
        const seqAction = cc.sequence([
            animationAction,
            cc.callFunc(this.playStage_1_Animation, this),
        ]);
        this.currentAction = seqAction;
        this.runAction(seqAction);
    },

    playStage_3_Animation: function () {
        this.animationStage = 3;
        const animationAction = this._createAnimationAction("DragonAlertStage2");
        const seqAction = cc.sequence([
            animationAction,
            cc.callFunc(this.playStage_1_Animation, this),
        ]);
        this.currentAction = seqAction;
        this.runAction(seqAction);
    },

    playStage_4_Animation: function () {
        this.animationStage = 4;
        const animationAction = this._createAnimationAction("DragonAwake");
        const backToSleepAction = this._createAnimationAction('DragonBackToSleep');
        const seqAction = cc.sequence([
            animationAction,
            backToSleepAction,
            cc.callFunc(this.playStage_1_Animation, this),
        ]);
        this.currentAction = seqAction;
        this.runAction(seqAction);
    },

    playAnimation(stage) {
        switch (stage) {
            case DontWakeTheDragon.DragonWakeUpStages
                .TOTALLY_STILL_AND_IN_A_DEEP_SLEEP: {
                this.playStage_1_Animation();
                break;
            }
            case DontWakeTheDragon.DragonWakeUpStages.MOVING_SLIGHTLY_IN_SLEEP: {
                this.playStage_2_Animation();
                break;
            }
            case DontWakeTheDragon.DragonWakeUpStages.ONE_EYE_OPEN_BUT_STILL_SLEEPY: {
                this.playStage_3_Animation();
                break;
            }
            case DontWakeTheDragon.DragonWakeUpStages.WAKE: {
                this.playStage_4_Animation();
                break;
            }
            default: {
                throw new Error(`Invalid dragon animation stage ${stage}`);
            }
        }
    },
});

// ========================== TreasureChest ===============================
DontWakeTheDragon.TreasureChest = cc.Sprite.extend({
    treasureItemSpriteRef: null,
    userName: "",
    TAG_DROP_ANIMATION_SPRITE: 1,
    Z_ORDER_DROP_ANIMATION_SPRITE: 3,
    Z_ORDER_TREASURE_CHEST_SPRITE: 1,
    Z_ORDER_TREASURE_ITEM_SPRITE: 2,
    ctor: function (userName, treasureItemSpriteRef) {
        this._super(DontWakeTheDragon.resourcePath + "student_answer.png");
        this.setOpacity(0);
        this.userName = userName;
        this.treasureItemSpriteRef = treasureItemSpriteRef;
        this._setUpUI();
    },

    _setUpUI: function () {
        this._createNameLabel();
        let treasureChestSprite = new cc.Sprite(
            DontWakeTheDragon.resourcePath + "player_treasure_chest.png"
        );
        treasureChestSprite.setPosition(cc.p(this.width * 0.6, this.height * 0.7));
        this.addChild(treasureChestSprite, this.Z_ORDER_TREASURE_CHEST_SPRITE);
        this._createDropAnimationSprite();
        if (this.treasureItemSpriteRef) {
            this.takeInTreasureItem(this.treasureItemSpriteRef);
        }
    },

    onEnter: function () {
        this._super();
    },

    _createDropAnimationSprite: function () {
        let dropAnimationSprite = new cc.Sprite();
        dropAnimationSprite.setPosition(cc.p(this.width * 0.6, this.height * 0.7));
        dropAnimationSprite.setLocalZOrder(this.Z_ORDER_DROP_ANIMATION_SPRITE);
        dropAnimationSprite.setTag(this.TAG_DROP_ANIMATION_SPRITE);
        this.addChild(dropAnimationSprite);
    },

    _createNameLabel: function () {
        let label = new cc.LabelTTF(this.userName, HDConstants.Sassoon_Regular, 22.5);
        label.setPosition(cc.p(this.width * 0.5, this.height * 0.08));
        label.setColor(
            HDAppManager.username === this.userName
                ? HDConstants.Green
                : HDConstants.White
        );
        this.addChild(label);
    },

    onExit: function () {
    },

    getUserName: function () {
        return this.userName;
    },

    performItemDropAnimation: function () {
        let dropAnimationSprite = this.getChildByTag(
            this.TAG_DROP_ANIMATION_SPRITE
        );
        let animateAction = HDUtility.runFrameAnimation(
            DontWakeTheDragon.animationPath + "cardTakeOut/magicHat_cardTakeOut_",
            15,
            0.05,
            ".png",
            1
        );
        dropAnimationSprite.runAction(animateAction);
    },

    takeInTreasureItem: function (treasureItemSpriteRef) {
        if (this.treasureItemSpriteRef)
            this.removeChild(this.treasureItemSpriteRef);

        this.treasureItemSpriteRef = treasureItemSpriteRef;
        treasureItemSpriteRef.setPosition(cc.p(this.width * 0.4, this.height * 1));
        this.addChild(treasureItemSpriteRef, this.Z_ORDER_TREASURE_ITEM_SPRITE);
        this.performItemDropAnimation();
    },

    removeTreasureItem: function () {
        if (this.treasureItemSpriteRef) {
            this.removeChild(this.treasureItemSpriteRef);
        }
    },
});

// ========================== TreasureItem ===============================
DontWakeTheDragon.TreasureItem = cc.Sprite.extend({
    initialPosition: null,
    dropActionDuration: 0.1,
    putBackAction: null,
    putBackActionDuration: 0.2,
    ctor: function (image, initialPosition) {
        this._super(image);
        this.initialPosition = initialPosition;
        this.setPosition(initialPosition);
        this._createPutBackAction();
    },

    drag: function (position) {
        this.setPosition(position);
    },

    drop: function (destination) {
        let dropAction = cc.moveTo(this.dropActionDuration, destination);
        this.runAction(dropAction);
    },

    onEnter: function () {
        this._super();
    },

    onExit: function () {
    },

    getInitialPosition: function () {
        return this.initialPosition;
    },

    _createPutBackAction: function () {
        this.putBackAction = cc.moveTo(
            this.putBackActionDuration,
            this.initialPosition
        );
    },

    // puts back item to it's initial position
    putBack: function () {
        this.runAction(this.putBackAction);
    },
});

// ========================== TreasureChests ===============================
DontWakeTheDragon.TreasureChests = HDBaseLayer.extend({
    horizontalPadding: 105,
    nextItem_X_Position: 0,
    itemScaleFactor: 80,
    ctor: function (studentsTreasureChests) {
        this._super();
        this.createChestsList(studentsTreasureChests);
    },

    createChestsList: function (
        studentsTreasureChests = {userName: {name: "", itemTag: ""}}
    ) {
        // adds new items leaves previous items untouched
        for (let i in studentsTreasureChests) {
            this._createTreasureChest(studentsTreasureChests[i]);
        }
        this._repositionTreasurechests();
    },

    _createTreasureChest: function (
        treasureChestObj = {name: "", itemTag: ""}
    ) {
        let treasureItemSpriteRef = null;
        console.log('treasue',treasureChestObj);
        if (treasureChestObj.itemTag) {
            treasureItemSpriteRef = new cc.Sprite(
                DontWakeTheDragon.resourcePath +
                DontWakeTheDragon.MainLayerRef.config.assets.sections.treasureItems.data[
                    treasureChestObj.itemTag
                    ].imageName
            );
            treasureItemSpriteRef.setScale(
                64 / treasureItemSpriteRef.width,
                64 / treasureItemSpriteRef.height
            );
        }
        const treasureChest = new DontWakeTheDragon.TreasureChest(
            treasureChestObj.name,
            treasureItemSpriteRef
        );
        treasureChest.setTag(treasureChestObj.name);
        //treasureChest.setPosition(this.nextItem_X_Position, 0);
        treasureChest.setAnchorPoint(0, 0);
        treasureChest.setScale(
            this.itemScaleFactor / treasureChest.width,
            this.itemScaleFactor / treasureChest.height
        );
        this.addChild(treasureChest);
        this.nextItem_X_Position =
            treasureChest.x + this.itemScaleFactor + this.horizontalPadding;
    },

    _repositionTreasurechests: function () {
        if (this.getChildren().length <= 4) {
            this.horizontalPadding = 105;
        } else {
            this.horizontalPadding = cc.lerp(105, 2, (this.getChildren().length - 1) / (8 - 1));
        }

        this.nextItem_X_Position = 0;
        this.getChildren().map((child) => {
            child.setPosition(cc.p(this.nextItem_X_Position, 0));
            this.nextItem_X_Position =
                child.x + this.itemScaleFactor + this.horizontalPadding;
        });
    },

    removeTreasureChests: function (list = ["username"]) {
        list.map((name) => this.removeChildByTag(name));
        this._repositionTreasurechests();
    },

    onEnter: function () {
        this._super();
    },

    onExit: function () {
    },

    getTreasureChestByStudentName: function (name) {
        return this.getChildByTag(name);
    },

    removeTreasureItemOfTreasureChestByStudentName: function (name) {
        this.getChildByTag(name).removeTreasureItem();
    },

    removeTreasureItemsOfAllTreasureChests: function () {
        this.getChildren().map((item) => item.removeTreasureItem());
    },

    getAllTreasureChests: function () {
        return this.getChildren();
    },
});

DontWakeTheDragon.TreasureItemDelegate = cc.Class.extend({
    onTreasureItemClicked: function (itemTag) {
    },
    onTreasureItemDragged: function (itemTag, location) {
    },
    onTreasureItemReleased: function (itemTag) {
    },
});

// ========================== TreasurePile ===============================
DontWakeTheDragon.TreasurePile = HDBaseLayer.extend({
    Z_ORDER_TREASURE_ITEM: 1, // make it 4 when pick up but drop to 1 when released
    Z_ORDER_TREASURE_PILE: 2,
    Z_ORDER_DRAGON: 3,
    clickedTreasureItem: null,
    isDragging: false,
    delegate: null,
    treasureItemsTouchEnabled: true,
    isDroppable: true,
    treasureItemsSprites: [],
    mouseListener: null,
    TAG_DRAGON_SPRITE: 100,
    ctor: function (
        treasurePileImage,
        treasureItems = [],
        delegate,
        resourcePath,
        initialDragonAnimationState
    ) {
        this._super();
        this.treasureItemsSprites = [];
        const treasurePileBgSprite = this.setBackground(
            resourcePath + treasurePileImage
        );
        treasurePileBgSprite.setLocalZOrder(this.Z_ORDER_TREASURE_PILE);
        this.delegate = delegate;
        this._createTreasureItems(treasureItems, resourcePath);
        this._createDragon(initialDragonAnimationState);
        // this._addMouseListener();
    },

    onEnter: function () {
        this._super();
    },

    _createDragon: function (initialDragonAnimationState) {
        let dragonSprite = new DontWakeTheDragon.Dragon(
            initialDragonAnimationState
        );
        dragonSprite.setPosition(cc.p(this.width * 0.5, this.height * 0.5));
        dragonSprite.setLocalZOrder(this.Z_ORDER_DRAGON);
        dragonSprite.setTag(this.TAG_DRAGON_SPRITE);
        this.addChild(dragonSprite);
    },

    getDragonAnimationState: function () {
        return this.getChildByTag(this.TAG_DRAGON_SPRITE).getAnimationStage();
    },

    playDragonAnimation: function (stage) {
        this.getChildByTag(this.TAG_DRAGON_SPRITE).playAnimation(stage);
    },

    getDragonPosition: function () {
        return this.getChildByTag(this.TAG_DRAGON_SPRITE).getPosition();
    },

    onExit: function () {
        cc.eventManager.removeListener(this.mouseListener);
        this.treasureItemsSprites = [];
        this._super();
    },

    removeTreasureItemByTag: function (itemTag) {
        this.removeChildByTag(itemTag);
        this.treasureItemsSprites.splice(
            this.treasureItemsSprites.findIndex((item) => item.tag === itemTag),
            1
        );
    },

    dragTreasureItem: function (itemTag, location = {x: 0, y: 0}) {
        let item = this.getChildByTag(itemTag);
        this.reorderChild(item, 4);
        item.drag(cc.p(location.x, location.y));
    },

    releaseTreasureItem: function () {
        if (this.clickedTreasureItem) {
            this.reorderChild(this.clickedTreasureItem, 1);
            this.clickedTreasureItem = null;
        }

        this.isDragging = false;
    },

    putBackTreasureItem: function (itemTag) {
        let item = this.getChildByTag(itemTag);
        if (item) {
            this.reorderChild(item, 1);
            item.putBack();
        }
    },

    getTreasureItemInitialPosition: function (itemTag) {
        return this.getChildByTag(itemTag).getInitialPosition();
    },

    _createTreasureItems: function (
        treasureItems = [{imageName: "", position: {x: 0, y: 0}}],
        resourcePath
    ) {
        treasureItems.map((item, idx) => {
            let treasureItemSprite = new DontWakeTheDragon.TreasureItem(
                resourcePath + item.imageName,
                cc.p(item.position.x, item.position.y)
            );
            treasureItemSprite.setTag(item.tag);
            treasureItemSprite.setScale(
                64 / treasureItemSprite.width,
                64 / treasureItemSprite.height
            );
            this.treasureItemsSprites.push(treasureItemSprite);
            this.addChild(treasureItemSprite, this.Z_ORDER_TREASURE_ITEM);
        });
    },

    setTreasureItems: function (treasureItems, resourcePath) {
        // will replace entirely
        this.treasureItemsSprites.map((item) => this.removeChild(item));
        this.treasureItemsSprites = [];
        this._createTreasureItems(treasureItems, resourcePath);
    },

    // _addMouseListener: function () {
    //   if (cc.sys.capabilities.hasOwnProperty("mouse")) {
    //     let self = this;
    //     this.mouseListener = cc.eventManager.addListener(
    //       {
    //         event: cc.EventListener.MOUSE,
    //         onMouseDown: function (event) {
    //           if (event.getButton() === cc.EventMouse.BUTTON_LEFT) {
    //             self._handleMouseDown(event.getLocation());
    //           }
    //         },
    //         onMouseMove: function (event) {
    //           self._handleMouseMove(event.getLocation());
    //         },
    //       },
    //       this
    //     );
    //   }
    // },

    handleMouseDown: function (location) {
        console.log("inside handle mouse down", this.treasureItemsTouchEnabled);
        if (!this.treasureItemsTouchEnabled) {
            return;
        }
        if (this.isDragging && this.isDroppable) {
            this.delegate.onTreasureItemReleased(this.clickedTreasureItem.getTag());
            this.releaseTreasureItem();
            return;
        }
        let loc = this.convertToNodeSpace(location);
        for (let i = 0; i < this.treasureItemsSprites.length; ++i) {
            let item = this.treasureItemsSprites[i];
            if (cc.rectContainsPoint(item.getBoundingBox(), loc)) {
                this.reorderChild(item, 4);
                this.clickedTreasureItem = item;
                this.isDragging = true;
                this.delegate.onTreasureItemClicked(item.getTag());
                return;
            }
        }
    },

    handleMouseMove: function (location) {
        if (this.isDragging) {
            this.clickedTreasureItem.drag(location);
            this.delegate.onTreasureItemDragged(
                this.clickedTreasureItem.getTag(),
                location
            );
        }
    },

    getTreasureItemByTag: function (itemTag) {
        return this.getChildByTag(itemTag);
    },

    setTreasureItemsTouchEnabled: function (flag) {
        this.treasureItemsTouchEnabled = flag;
        if (flag === false) {
            this.releaseTreasureItem();
        }
    },
});

// ========================== Common Layer for student & teacher ===============================
DontWakeTheDragon.CommonLayer = HDBaseLayer.extend({
    state: null,
    Z_ORDER_BACKGROUND: 1,
    Z_ORDER_TREASURE_PILE: 2,
    Z_ORDER_TREASURE_CHESTS: 3,
    TAG_TREASURE_PILE: 2,
    TAG_TREASURE_CHESTS: 3,
    closeCalls: 0,
    maxCloseCalls: 3,
    isDragonAnimationDone: false,
    studentsTreasureChests: {},
    tempStudentsTreasureChests: {},
    treasureItems: [],
    delegate: null,
    isCustomCursorTexture: false,
    customCursorTextureUrl: "",
    initialDragonAnimationStage: 1,
    treasureChestsMax_X_Pos: 0,
    treasureChestsMin_X_Pos: 0,
    maxTreasureChests: 8,
    ctor: function (delegate, state) {
        this._super();
        this.state = state;
        this.delegate = delegate;
        this.treasureChestsMax_X_Pos = this.width * 0.46;
        this.treasureChestsMin_X_Pos = this.width * 0.16;
        this.tempStudentsTreasureChests = {};
        this._initializeFromState();
        this._setUpUI();
    },

    onEnter: function () {
        this._super();
        this.updateRoomData();
        this.getStudentsList();
    },

    onExit: function () {
        this.removeAllChildrenWithCleanup(true);
        this._super();
    },

    getStudentsList: function () {
        this.emitSocketEvent(HDSocketEventType.STUDENT_STATUS, {
            roomId: HDAppManager.roomId,
        });
    },

    _setUpUI: function () {
        let bgSprite = this.setBackground(
            DontWakeTheDragon.resourcePath +
            DontWakeTheDragon.MainLayerRef.config.background.sections.background
                .imageName
        );
        bgSprite.setLocalZOrder(this.Z_ORDER_BACKGROUND);
        this._createTreasurePile(this.delegate);
    },

    _initializeFromState: function () {
        if (this.state) {
            this.studentsTreasureChests = this.state.studentsTreasureChests;
            this.treasureItems = this.state.treasureItems;
            this.initialDragonAnimationStage = this.state.dragonAnimationStage;
        } else {
            this.treasureItems = DontWakeTheDragon.MainLayerRef.config.assets.sections.treasureItems.data.map(
                (item, idx) => {
                    return Object.assign(item, {tag: idx});
                }
            );
            this.studentsTreasureChests = {};
        }
    },

    // update treasure items state when a student drops it into his treasure chest
    updateTreasureItemsState: function (itemTag, userName) {
        //adding treasure item to student's treasure chest
        this.studentsTreasureChests[userName] = {
            name: userName,
            itemTag: itemTag,
        };

        // removing treasure item from treasureItems
        this.treasureItems.splice(
            this.treasureItems.findIndex((item) => item.tag === itemTag),
            1
        );
        //this.getChildByTag(this.TAG_TREASURE_PILE).removeTreasureItemByTag(itemTag);
    },

    emitSocketEvent: function (type, data) {
        SocketManager.emitCutomEvent(DontWakeTheDragon.socketEventKey.singleEvent, {
            eventType: type,
            roomId: HDAppManager.roomId,
            data: data,
        });
    },

    _createTreasureChests: function () {
        const treasureChests = new DontWakeTheDragon.TreasureChests(
            this.tempStudentsTreasureChests
        );
        treasureChests.setTag(this.TAG_TREASURE_CHESTS);
        treasureChests.setLocalZOrder(this.Z_ORDER_TREASURE_CHESTS);
        treasureChests.setPosition(cc.p(this.width * 0.16, this.height * 0.025));
        this.addChild(treasureChests);
    },

    _repositionTreasureChests: function () {
        const treasureChests = this.getChildByTag(this.TAG_TREASURE_CHESTS);
        console.log(cc.lerp(
            this.treasureChestsMax_X_Pos, this.treasureChestsMin_X_Pos,
            (Object.keys(this.tempStudentsTreasureChests).length - 1) / (this.maxTreasureChests - 1)));

        treasureChests.setPosition(cc.p(cc.lerp(
            this.treasureChestsMax_X_Pos, this.treasureChestsMin_X_Pos,
            (Object.keys(this.tempStudentsTreasureChests).length - 1) / (this.maxTreasureChests - 1)),
            this.height * 0.025));

    },

    _createTreasurePile: function (delegate) {
        let treasurePileSprite = new DontWakeTheDragon.TreasurePile(
            DontWakeTheDragon.MainLayerRef.config.assets.sections.treasurePile.imageName,
            this.treasureItems,
            this,
            DontWakeTheDragon.resourcePath,
            this.initialDragonAnimationStage
        );
        treasurePileSprite.setPosition(cc.p(0, 0));
        treasurePileSprite.setTag(this.TAG_TREASURE_PILE);
        treasurePileSprite.setLocalZOrder(this.Z_ORDER_TREASURE_PILE);
        this.addChild(treasurePileSprite);
    },

    updateRoomData: function () {
        this.emitSocketEvent(HDSocketEventType.UPDATE_ROOM_DATA, {
            roomId: HDAppManager.roomId,
            roomData: {
                activity: DontWakeTheDragon.MainLayerRef.config.properties.namespace,
                data: {
                    dragonAnimationStage: this.getChildByTag(
                        this.TAG_TREASURE_PILE
                    ).getDragonAnimationState(),
                    studentTurn: undefined,
                    studentsTreasureChests: this.studentsTreasureChests,
                    treasureItems: this.treasureItems,
                },
                activityStartTime: HDAppManager.getActivityStartTime()
            },
        });
    },

    onTreasureItemClicked: function (itemTag) {
        this._setClosedPincerFingersCursor();
        this.isDragonAnimationDone = false;
    },

    onTreasureItemDragged: function (itemTag, location) {
        let clickedItem = this.getChildByTag(
            this.TAG_TREASURE_PILE
        ).getTreasureItemByTag(itemTag);
        if (!this.isDragonAnimationDone) {
            if (
                cc.pDistance(
                    clickedItem.getPosition(),
                    clickedItem.getInitialPosition()
                ) >= DontWakeTheDragon.PERFORM_DRAGON_ANIMATION_DISTANCE
            ) {
                this.performDragonAnimation(itemTag);
                this.isDragonAnimationDone = true;
            }
        }
        if (this._checkItemForIntersectionWithTreasureChest(itemTag)) {
            this.getChildByTag(this.TAG_TREASURE_PILE).releaseTreasureItem();
            this._setOpenPincerFingersCursor(true);
            if (HDAppManager.isTeacherView) {
                this.getParent().getParent().setResetButtonActive(true);
            }
        } else {
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                roomId: HDAppManager.roomId,
                type: DontWakeTheDragon.studentEvents.TREASURE_ITEM_DRAGGED,
                userName: HDAppManager.username,
                itemTag: itemTag,
                location: {x: location.x, y: location.y},
            });
        }
    },

    _dropItemInChest: function (itemTag, treasureChest) {
        const treasureItem = this.getChildByTag(
            this.TAG_TREASURE_PILE
        ).getTreasureItemByTag(itemTag);
        this.getChildByTag(this.TAG_TREASURE_PILE).removeTreasureItemByTag(
            itemTag
        );
        treasureChest.takeInTreasureItem(treasureItem);
        let data = {
            roomId: HDAppManager.roomId,
            userName: HDAppManager.username,
            itemTag: itemTag,
        };
        if (HDAppManager.isTeacherView) {
            data.type = DontWakeTheDragon.teacherEvents.TREASURE_ITEM_DROPPED_IN_CHEST_BY_TEACHER,
                data.studentName = treasureChest.tag;
        } else {
            data.type = DontWakeTheDragon.studentEvents.TREASURE_ITEM_DROPPED_IN_CHEST
        }
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, data);
        if (!HDAppManager.isTeacherView) {
            this.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_STUDENT, {
                roomId: HDAppManager.roomId,
            });
        }

        this.updateTreasureItemsState(itemTag, HDAppManager.isTeacherView ? treasureChest.tag : HDAppManager.username);
        this.updateRoomData();
    },

    _compareRectsOfItemAndChest: function (treasureItem, treasureChest) {
        const treasurechests = this.getChildByTag(this.TAG_TREASURE_CHESTS);
        const treasureChestLocalBoundingBox = treasureChest.getBoundingBox();
        const worldSpace = treasurechests.convertToWorldSpace(
            treasureChest.getPosition()
        );
        const treasureChestWorldBoundingBox = cc.rect(
            worldSpace.x,
            worldSpace.y,
            treasureChestLocalBoundingBox.width,
            treasureChestLocalBoundingBox.height
        );
        return cc.rectIntersectsRect(treasureItem.getBoundingBox(), treasureChestWorldBoundingBox);
    },

    // check if dragged treasure item intersects with treasure chests
    _checkItemForIntersectionWithTreasureChest: function (itemTag) {
        const treasurechests = this.getChildByTag(this.TAG_TREASURE_CHESTS);
        const treasureItem = this.getChildByTag(
            this.TAG_TREASURE_PILE
        ).getTreasureItemByTag(itemTag);
        if (HDAppManager.isTeacherView) {
            let allTreasureChests = treasurechests.getAllTreasureChests();
            for (let i = 0; i < allTreasureChests.length; ++i) {
                let isIntersected = this._compareRectsOfItemAndChest(treasureItem, allTreasureChests[i]);
                if (isIntersected) {
                    this._dropItemInChest(itemTag, allTreasureChests[i]);
                    return true;
                }

            }
            return false;
        } else {
            const treasureChest = treasurechests.getTreasureChestByStudentName(
                HDAppManager.username
            );
            let isIntersected = this._compareRectsOfItemAndChest(treasureItem, treasureChest);
            if (isIntersected) {
                this._dropItemInChest(itemTag, treasureChest);
                return true;
            } else {
                return false;
            }
        }

    },

    onTreasureItemReleased: function (itemTag) {
        this._setOpenPincerFingersCursor(true);
        //this.dropItemIntoChest(itemTag, HDAppManager.username);
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            type: DontWakeTheDragon.studentEvents.TREASURE_ITEM_DROPPED,
            roomId: HDAppManager.roomId,
            userName: HDAppManager.username,
            itemTag: itemTag,
        });
        this.getChildByTag(this.TAG_TREASURE_PILE).putBackTreasureItem(itemTag);
        //this.updateRoomData();
    },

    // probability should be between 0 and 1
    _isCloseCall: function (probability) {
        return !!probability && Math.random() <= probability;
    },

    playDragonAnimation: function (animationStage) {
        this.getChildByTag(this.TAG_TREASURE_PILE).playDragonAnimation(
            animationStage
        );
    },

    // @ param closeCall is booleanweb
    _playDragonAnimationByCloseCall: function (closeCall) {
        if (closeCall) {
            ++this.closeCalls;
            let animationStage;
            if (this.closeCalls === 1) {
                animationStage =
                    DontWakeTheDragon.DragonWakeUpStages.MOVING_SLIGHTLY_IN_SLEEP;
            } else if (this.closeCalls === 2) {
                animationStage =
                    DontWakeTheDragon.DragonWakeUpStages.ONE_EYE_OPEN_BUT_STILL_SLEEPY;
            } else if (this.closeCalls === 3) {
                this.closeCalls = 0;
                animationStage = DontWakeTheDragon.DragonWakeUpStages.WAKE;
            }
            this.playDragonAnimation(animationStage);
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                dragonAnimationStage: animationStage,
                roomId: HDAppManager.roomId,
                type: DontWakeTheDragon.studentEvents.DRAGON_ANIMATION_STAGE,
                userName: HDAppManager.username,
                closeCalls: this.closeCalls,
            });
            //this.updateRoomData();
        }
    },

    performDragonAnimation: function (itemTag) {
        let item = this.getChildByTag(this.TAG_TREASURE_PILE).getTreasureItemByTag(
            itemTag
        );
        let closeCall;

        // position based
        let distance = cc.pDistance(
            this.getChildByTag(this.TAG_TREASURE_PILE).getDragonPosition(),
            item.getPosition()
        );
        if (distance <= DontWakeTheDragon.DistanceFromDragon.VERY_CLOSE) {
            closeCall = this._isCloseCall(
                DontWakeTheDragon.DragonWakeUpProbabilities
                    .ITEMS_DIRECTLY_UNDERNEATH_DRAGON
            );
        } else if (
            distance > DontWakeTheDragon.DistanceFromDragon.VERY_CLOSE &&
            distance <= DontWakeTheDragon.DistanceFromDragon.CLOSE
        ) {
            closeCall = this._isCloseCall(
                DontWakeTheDragon.DragonWakeUpProbabilities
                    .ITEMS_PARTIALLY_UNDERNEATH_DRAGON
            );
        } else {
            closeCall = this._isCloseCall(
                DontWakeTheDragon.DragonWakeUpProbabilities.ITEMS_AROUND_DRAGON
            );
        }

        this._playDragonAnimationByCloseCall(closeCall);
    },

    updateMouseCursor: function (location) {
        return true;
    },

    setInteractionEnabled: function (flag) {
        this.getChildByTag(this.TAG_TREASURE_PILE).setTreasureItemsTouchEnabled(
            flag
        );
        this._setOpenPincerFingersCursor(flag);
    },

    onNotificationReceived: function (event) {
        const {eventType, data} = event;
        const {type} = data;
        switch (eventType) {
            case HDSocketEventType.GAME_MESSAGE: {
                switch (type) {
                    case DontWakeTheDragon.studentEvents.TREASURE_ITEM_DRAGGED: {
                        const {userName, itemTag, location} = data;
                        if (userName !== HDAppManager.username) {
                            this.getChildByTag(this.TAG_TREASURE_PILE).dragTreasureItem(
                                itemTag,
                                location
                            );
                        }
                        break;
                    }
                    case DontWakeTheDragon.studentEvents.DRAGON_ANIMATION_STAGE: {
                        const {dragonAnimationStage, userName, closeCalls} = data;
                        if (userName !== HDAppManager.username) {
                            this.playDragonAnimation(dragonAnimationStage);
                            this.closeCalls = closeCalls;
                        }
                        break;
                    }
                    case DontWakeTheDragon.studentEvents.TREASURE_ITEM_DROPPED: {
                        const {itemTag, userName} = data;
                        if (userName !== HDAppManager.username) {
                            //this.dropItemIntoChest(itemTag, userName);
                            this.getChildByTag(this.TAG_TREASURE_PILE).putBackTreasureItem(
                                itemTag
                            );
                        }

                        break;
                    }
                    case DontWakeTheDragon.studentEvents.TREASURE_ITEM_DROPPED_IN_CHEST: {
                        const {userName, itemTag} = data;
                        if (userName !== HDAppManager.username) {
                            const treasurechests = this.getChildByTag(
                                this.TAG_TREASURE_CHESTS
                            );
                            const treasureChest = treasurechests.getTreasureChestByStudentName(
                                userName
                            );
                            const treasureItem = this.getChildByTag(
                                this.TAG_TREASURE_PILE
                            ).getTreasureItemByTag(itemTag);
                            this.getChildByTag(
                                this.TAG_TREASURE_PILE
                            ).removeTreasureItemByTag(itemTag);
                            treasureChest.takeInTreasureItem(treasureItem);
                            this.updateTreasureItemsState(itemTag, userName);
                            this.getParent().getParent().setResetButtonActive(true);
                        }
                        break;
                    }
                    case DontWakeTheDragon.teacherEvents.TREASURE_ITEM_DROPPED_IN_CHEST_BY_TEACHER: {
                        const {userName, studentName, itemTag} = data;
                        if (userName !== HDAppManager.username) {
                            const treasurechests = this.getChildByTag(
                                this.TAG_TREASURE_CHESTS
                            );
                            const treasureChest = treasurechests.getTreasureChestByStudentName(
                                studentName
                            );
                            const treasureItem = this.getChildByTag(
                                this.TAG_TREASURE_PILE
                            ).getTreasureItemByTag(itemTag);
                            this.getChildByTag(
                                this.TAG_TREASURE_PILE
                            ).removeTreasureItemByTag(itemTag);
                            treasureChest.takeInTreasureItem(treasureItem);
                            this.updateTreasureItemsState(itemTag, studentName);
                        }
                    }
                }
                break;
            }
            case HDSocketEventType.STUDENT_STATUS: {
                const {users, teacherId} = data;
                this._manageStudentTreasureChests(
                    users
                        .filter((user) => user.userId !== teacherId)
                        .map((user) => user.userName)
                );
                break;
            }
        }
    },

    _manageStudentTreasureChests: function (updatedList) {
        if (!this.getChildByTag(this.TAG_TREASURE_CHESTS)) {
            updatedList.map((name) => {
                if (this.studentsTreasureChests[name]) {
                    if (this.studentsTreasureChests[name].itemTag) {
                        this.tempStudentsTreasureChests[name] = {
                            name: name,
                            itemTag: this.studentsTreasureChests[name].itemTag,
                        };
                    } else {
                        this.tempStudentsTreasureChests[name] = {name: name};
                    }
                } else {
                    // totally new entry
                    this.studentsTreasureChests[name] = this.tempStudentsTreasureChests[
                        name
                        ] = {name: name};
                }
            });
            this._createTreasureChests();
        } else if (
            Object.keys(this.tempStudentsTreasureChests).length < updatedList.length
        ) {
            // add
            //Find values that are in updatedList but not in tempStudentsTreasureChests

            let difference = updatedList.filter(
                (updated) =>
                    !Object.values(this.tempStudentsTreasureChests).some(
                        (treasureChest) => treasureChest.name === updated
                    )
            );
            let differenceList = {};
            difference.map((name) => {
                if (this.studentsTreasureChests[name]) {
                    if (this.studentsTreasureChests[name].itemTag) {
                        differenceList[name] = this.tempStudentsTreasureChests[name] = {
                            name: name,
                            itemTag: this.studentsTreasureChests[name].itemTag,
                        };
                    } else {
                        differenceList[name] = this.tempStudentsTreasureChests[name] = {
                            name: name,
                        };
                    }
                } else {
                    // totally new entry
                    this.studentsTreasureChests[name] = this.tempStudentsTreasureChests[
                        name
                        ] = differenceList[name] = {name: name};
                }
            });
            this.getChildByTag(this.TAG_TREASURE_CHESTS).createChestsList(
                differenceList
            );
        } else if (
            Object.keys(this.tempStudentsTreasureChests).length > updatedList.length
        ) {
            //remove
            //Find values that are in tempStudentsTreasureChests but not in updatedList

            let difference = Object.values(this.tempStudentsTreasureChests)
                .filter(
                    (current) => !updatedList.some((updated) => updated === current.name)
                )
                .map((student) => student.name);
            difference.map((name) => {
                delete this.tempStudentsTreasureChests[name];
            });
            this.getChildByTag(this.TAG_TREASURE_CHESTS).removeTreasureChests(
                difference
            );
        }
        //this._repositionTreasureChests();
    },

    mouseTexture: function () {
        return {
            hasCustomTexture: this.isCustomCursorTexture,
            textureUrl: this.customCursorTextureUrl,
        };
    },

    _setClosedPincerFingersCursor: function () {
        this.isCustomCursorTexture = true;
        this.customCursorTextureUrl =
            (DontWakeTheDragon.MainLayerRef.config.properties.preLoaded ? DontWakeTheDragon.resourcePath : "AsyncActivity/" + DontWakeTheDragon.resourcePath) +
            DontWakeTheDragon.MainLayerRef.config.cursors.data
                .closedFingers.imageName;
    },

    _setOpenPincerFingersCursor: function (flag) {
        if (flag) {
            this.isCustomCursorTexture = true;
            this.customCursorTextureUrl =
                (DontWakeTheDragon.MainLayerRef.config.properties.preLoaded ? DontWakeTheDragon.resourcePath : "AsyncActivity/" + DontWakeTheDragon.resourcePath) +
                DontWakeTheDragon.MainLayerRef.config.cursors.data
                    .openFingers.imageName;
        } else {
            this.isCustomCursorTexture = false;
            this.customCursorTextureUrl = "";
        }
    },

    resetGame: function () {
        this.closeCalls = 0;
        for (let i in this.studentsTreasureChests) {
            if (this.studentsTreasureChests[i].itemTag) {
                delete this.studentsTreasureChests[i].itemTag;
            }
        }
        this.treasureItems = DontWakeTheDragon.MainLayerRef.config.assets.sections.treasureItems.data.map(
            (item, idx) => {
                return Object.assign(item, {tag: idx});
            }
        );
        this.getChildByTag(this.TAG_TREASURE_PILE).setTreasureItems(
            this.treasureItems,
            DontWakeTheDragon.resourcePath
        );
        this.getChildByTag(
            this.TAG_TREASURE_CHESTS
        ).removeTreasureItemsOfAllTreasureChests();
    },

    onMouseDown: function (event) {

        var tPile = this.getChildByTag(this.TAG_TREASURE_PILE);

        console.log("on mouse down", tPile);
        if (tPile) {
            tPile.handleMouseDown(event.getLocation());
        }

    },

    onMouseMove: function (event) {
        var tPile = this.getChildByTag(this.TAG_TREASURE_PILE);
        if (tPile) {
            tPile.handleMouseMove(event.getLocation());
        }
    },

});

// ========================== Teacher Layer ===============================
DontWakeTheDragon.TeacherViewLayer = DontWakeTheDragon.CommonLayer.extend({
    state: null,
    TAG_RESET_BUTTON: 1,
    ctor: function (state) {
        this._super(this, state);
        this.state = state;
        this.setUpUI();
    },

    onEnter: function () {
        this._super();
        this.setInteractionEnabled(true);
        this.showScriptMessage(DontWakeTheDragon.MainLayerRef.config.teacherScripts.data.moduleStart);
        this.showTipMessage(DontWakeTheDragon.MainLayerRef.config.teacherTips.data.moduleStart);
        if (this.state && this.state.treasureItems.length < DontWakeTheDragon.MainLayerRef.config.assets.sections.treasureItems.data.length) {
            this.getParent().getParent().setResetButtonActive(true);
        }
    },

    onExit: function () {
    },

    showScriptMessage: function (msg) {
        this.getParent().getParent().showScriptMessage(msg.content.ops);
    },

    showTipMessage: function (msg) {
        this.getParent().getParent().showTipMessage(msg.content.ops);
    },

    buttonCallback: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                switch (sender.getTag()) {
                }
                break;
        }
    },

    resetGame: function () {
        this._super();
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            roomId: HDAppManager.roomId,
            type:
            DontWakeTheDragon.teacherEvents.DONT_WAKE_THE_DRAGON_RESET_GAME,
        });
        this.updateRoomData();
    },

    setUpUI: function () {
    },

    onNotificationReceived: function (event) {
        this._super(event);
        const {eventType, data} = event;
        const {type} = data;
    },

    mouseControlEnable: function (location) {
        return this.updateMouseCursor(location);
    },

    updateStudentTurn: function (userName) {
        this.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_TEACHER, {
            roomId: HDAppManager.roomId,
            users: userName ? [{userName: userName}] : [],
        });
    },
    onMouseDown: function (event) {
        console.log("on mouse down in teacher");
        this._super(event);

    },

    onMouseMove: function (event) {
        this._super(event);
    }
});

// ========================== Student Layer ===============================
DontWakeTheDragon.StudentViewLayer = DontWakeTheDragon.CommonLayer.extend({
    state: undefined,
    ctor: function (state) {
        this._super(this, state);
        this.state = state;
    },

    onEnter: function () {
        this._super();
        this.setInteractionEnabled(false);
    },

    onExit: function () {
    },

    handleStudentTurn: function (users = [{userName: ""}]) {
        this.setInteractionEnabled(
            users.some((user) => user.userName === HDAppManager.username)
        );
    },

    onNotificationReceived: function (event) {
        this._super(event);
        const {eventType, data} = event;
        const {type} = data;
        switch (eventType) {
            case HDSocketEventType.STUDENT_TURN: {
                const {users} = data;
                this.handleStudentTurn(users);
                break;
            }
            case HDSocketEventType.GAME_MESSAGE: {
                switch (type) {
                    case DontWakeTheDragon.teacherEvents
                        .DONT_WAKE_THE_DRAGON_RESET_GAME: {
                        this.resetGame();
                        break;
                    }
                }
                break;
            }
        }
    },

    mouseControlEnable: function (location) {
        return this.updateMouseCursor(location);
    },

    onMouseDown: function (event) {
        this._super(event);

    },

    onMouseMove: function (event) {
        this._super(event);
    }

});

// ========================== Main Layer ===============================
DontWakeTheDragon.MainLayer = cc.Layer.extend({
    state: undefined,
    config: null,
    delegate: null,
    ctor: function () {
        this._super();
        DontWakeTheDragon.MainLayerRef = this;
        this.state = undefined;
        const self = this;
        let activityName = 'ACTIVITY_DONT_WAKE_THE_DRAGON';
        cc.loader.loadJson("res/Activity/"+ activityName +"/config.json", function (
            error,
            data
        ) {
            self.config = data;
            DontWakeTheDragon.resourcePath= "res/Activity/" + ""+ activityName +  "/res/Sprite/";
            DontWakeTheDragon.soundPath= "res/Activity/" + ""+ activityName +  "/res/Sound/";
            DontWakeTheDragon.animationPath=
            "res/Activity/ACTIVITY_DONT_WAKE_THE_DRAGON/res/AnimationFrames/";
            DontWakeTheDragon.configFilePath= "res/Activity/" + ""+ activityName +  "/config.json";

            if (HDAppManager.isTeacherView) {
                const teacherViewLayer = new DontWakeTheDragon.TeacherViewLayer(
                    self.state
                );
                self.delegate = teacherViewLayer;
                self.addChild(teacherViewLayer);
            } else {
                const studentViewLayer = new DontWakeTheDragon.StudentViewLayer(
                    self.state
                );
                self.delegate = studentViewLayer;
                self.addChild(studentViewLayer);
            }
            self.connectSocket();

        });
    },

    mouseTexture: function () {
        return this.delegate.mouseTexture();
    },

    socketListener: function (event) {
        if (this.delegate) this.delegate.onNotificationReceived(event);
    },

    updateStudentTurn: function (userName) {
        if (HDAppManager.isTeacherView) this.delegate.updateStudentTurn(userName);
    },

    connectSocket: function () {
        if (SocketManager.socket === null || !SocketManager.isSocketConnected()) {
            SocketManager.connect();
        }
    },

    mouseControlEnable: function (location) {
        if (this.delegate) return this.delegate.mouseControlEnable(location);
    },

    syncData: function (data) {
        this.state = data;
    },

    touchEventListener: function (touch, event) {
        switch (event._eventCode) {
            case cc.EventTouch.EventCode.BEGAN:
                if (this.delegate) {
                    this.delegate.onMouseDown(touch);
                }
                break;
            case cc.EventTouch.EventCode.MOVED:
                if (this.delegate) {
                    this.delegate.onMouseMove(touch);
                }
                break;
            case cc.EventTouch.EventCode.ENDED:
                if (this.delegate) {
                    this.delegate.onMouseDown(touch);
                }
                break;

            case cc.EventTouch.EventCode.CANCELLED:
                if (this.delegate) {
                    this.delegate.onMouseDown(touch);
                }
        }
    },

    mouseEventListener: function (event) {
        switch (event._eventType) {
            case cc.EventMouse.DOWN:
                if (this.delegate) {
                    this.delegate.onMouseDown(event);
                }
                //this.onMouseDown(event);
                break;
            case cc.EventMouse.MOVE:
                if (this.delegate) {
                    this.delegate.onMouseMove(event);
                }
                //this.onMouseMove(event);
                break;
            case cc.EventMouse.UP:
                // this.onMouseUp(event);
                break;
        }
    },

    reset: function () {
        this.delegate.resetGame();
    },

    onEnter: function () {
        this._super();
    },
    onExit: function () {
    },


});
