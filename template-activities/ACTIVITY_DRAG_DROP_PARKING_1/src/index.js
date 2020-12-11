// namespace for this activity
const ACTIVITY_DRAG_DROP_PARKING_1 = {
  config: null,
  spritePath: "",
  soundPath: "",
  animationPath: "",
  isSyncedState: false,
  maxLevels: 2,
};

ACTIVITY_DRAG_DROP_PARKING_1.SWITCH_BUTTON_TITLE = {
  SHARED: "Shared",
  INDIVIDUAL_MODE: "Individual Mode",
};

ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES = {
  SHARED: 0,
  INDIVIDUAL_MODE: 1,
};

ACTIVITY_DRAG_DROP_PARKING_1.TAGS = {
  BACKGROUND_SPRITE: 1,
  STAR_ANIMATION_SPRITE: 3,
  WIN_ANIMATION_SPRITE: 4,
  NEXT_BUTTON: 5,
  SWITCH_BUTTON: 6,
  CLIPPER_NODE: 7,
  COLOR_LAYER: 8,
  BACK_BUTTON: 9,
  DRAGGABLE_START: 20,
  DROPZONE_START: 50,
};

ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS = {
  ITEM_DRAGGED: "ACTIVITY_DRAG_DROP_PARKING_1_ITEM_DRAGGED",
  ITEM_SNAPPED_BACK: "ACTIVITY_DRAG_DROP_PARKING_1_ITEM_SNAPPED_BACK",
  ITEM_DROPPED_CORRECTLY: "ACTIVITY_DRAG_DROP_PARKING_1_ITEM_DROPPED_CORRECTLY",
  ITEM_DROPPED_INCORRECTLY: "ACTIVITY_DRAG_DROP_PARKING_1_ITEM_DROPPED_INCORRECTLY",
  PREVIEW_REQUEST: "ACTIVITY_DRAG_DROP_PARKING_1_PREVIEW_REQUEST",
  CHANGE_GAME_MODE: "ACTIVITY_DRAG_DROP_PARKING_1_CHANGE_GAME_MODE",
  UPDATE_USER_DATA: "ACTIVITY_DRAG_DROP_PARKING_1_UPDATE_USER_DATA",
  STUDENT_INTERACTION: "ACTIVITY_DRAG_DROP_PARKING_1_STUDENT_INTERACTION",
  NEXT_LEVEL: "ACTIVITY_DRAG_DROP_PARKING_1_NEXT_LEVEL",
  PREV_LEVEL: "ACTIVITY_DRAG_DROP_PARKING_1_PREV_LEVEL",
  RESET: "ACTIVITY_DRAG_DROP_PARKING_1_RESET",
  SHOW_HOVER_EFFECT: "ACTIVITY_DRAG_DROP_PARKING_1_SHOW_HOVER_EFFECT",
  HIDE_HOVER_EFFECT: "ACTIVITY_DRAG_DROP_PARKING_1_HIDE_HOVER_EFFECT",
  LEVEL_COMPLETE_ANIMATION: "ACTIVITY_DRAG_DROP_PARKING_1_LEVEL_COMPLETE_ANIMATION",
};

ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager = (() => {
  let syncedState;
  let maxLevels = 2;
  const setState = (state) => {
    syncedState = state;
  };

  const getState = () => {
    return syncedState;
  };

  const setMaxLevels = (levels = 2) => {
    maxLevels = levels;
  };

  const getDefaultUserData = () => {
    const levelsArr = [];
    for (let i = 0; i < maxLevels; ++i) {
      levelsArr[i] = {
        currentLevelInfo: [], // indices of draggables which are matched correctly,
        correctCount: 0,
      };
    }
    return {
      currentLevel: 0,
      levels: levelsArr,
    };
  };
  const setDefaultState = () => {
    syncedState = {
      gameMode: ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED,
      shared: getDefaultUserData(),
      individual: {
        [HDAppManager.username]: getDefaultUserData(),
      },
    };
  };

  const getCurrentLevel = () => {
    if (syncedState.gameMode === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED) {
      return syncedState.shared.currentLevel;
    } else if (syncedState.gameMode === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.INDIVIDUAL_MODE) {
      const data = syncedState.individual[HDAppManager.username]
        ? syncedState.individual[HDAppManager.username]
        : syncedState.shared;
      return data.currentLevel;
    }
  };

  const setCurrentLevel = (level = 0) => {
    if (syncedState.gameMode === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED) {
      syncedState.shared.currentLevel = level;
    } else if (syncedState.gameMode === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.INDIVIDUAL_MODE) {
      syncedState.individual[HDAppManager.username].currentLevel = level;
    }
  };
  // returns copy
  const getLevelInfo = () => {
    if (syncedState.gameMode === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED) {
      return [...syncedState.shared.levels[syncedState.shared.currentLevel].currentLevelInfo];
    } else if (syncedState.gameMode === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.INDIVIDUAL_MODE) {
      const data = syncedState.individual[HDAppManager.username]
        ? syncedState.individual[HDAppManager.username]
        : syncedState.shared;
      return [...data.levels[data.currentLevel].currentLevelInfo];
    }
  };

  const setLevelInfo = (draggableIdx) => {
    if (syncedState.gameMode === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED) {
      syncedState.shared.levels[syncedState.shared.currentLevel].currentLevelInfo.push(draggableIdx);
    } else if (syncedState.gameMode === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.INDIVIDUAL_MODE) {
      syncedState.individual[HDAppManager.username].levels[
        syncedState.individual[HDAppManager.username].currentLevel
      ].currentLevelInfo.push(draggableIdx);
    }
  };

  const getCorrectCount = () => {
    if (syncedState.gameMode === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED) {
      return syncedState.shared.levels[syncedState.shared.currentLevel].correctCount;
    } else if (syncedState.gameMode === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.INDIVIDUAL_MODE) {
      const data = syncedState.individual[HDAppManager.username]
        ? syncedState.individual[HDAppManager.username]
        : syncedState.shared;
      return data.levels[data.currentLevel].correctCount;
    }
  };

  const setCorrectCount = (count) => {
    if (syncedState.gameMode === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED) {
      syncedState.shared.levels[syncedState.shared.currentLevel].correctCount = count;
    } else if (syncedState.gameMode === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.INDIVIDUAL_MODE) {
      syncedState.individual[HDAppManager.username].levels[
        syncedState.individual[HDAppManager.username].currentLevel
      ].correctCount = count;
    }
  };

  const makeCopy = (data = getDefaultUserData()) => {
    let levelsCopy = [];
    for (let i = 0; i < data.levels.length; ++i) {
      levelsCopy[i] = {
        currentLevelInfo: [...data.levels[i].currentLevelInfo],
        correctCount: data.levels[i].correctCount,
      };
    }
    return {
      ...data,
      levels: levelsCopy,
    };
  };

  // individual mode only
  const setLevelInfoOfUser = (userName, data = getDefaultUserData()) => {
    syncedState.individual[userName] = data;
  };

  // individual mode only
  // returns copy
  const getLevelInfoOfUser = (userName) => {
    const data = syncedState.individual[userName] ? syncedState.individual[userName] : syncedState.shared;
    return makeCopy(data);
  };

  const resetState = () => {
    setDefaultState();
  };
  const setGameMode = (mode = ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED) => {
    syncedState.gameMode = mode;
  };

  const resetCurrentLevel = () => {
    if (syncedState.gameMode === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED) {
      syncedState.shared.levels[syncedState.shared.currentLevel].correctCount = 0;
      syncedState.shared.levels[syncedState.shared.currentLevel].currentLevelInfo = [];
    }
  };

  // set my individual state to shared state (copy of shared state is set to individual state)
  const setMyStateToShared = () => {
    syncedState.individual[HDAppManager.username] = makeCopy(syncedState.shared);
  };

  return {
    getState: getState,
    setState: setState,
    resetState: resetState,
    getCurrentLevel: getCurrentLevel,
    setCurrentLevel: setCurrentLevel,
    getLevelInfo: getLevelInfo,
    setLevelInfo: setLevelInfo,
    setGameMode: setGameMode,
    getLevelInfoOfUser: getLevelInfoOfUser,
    setLevelInfoOfUser: setLevelInfoOfUser,
    getCorrectCount,
    setCorrectCount,
    resetCurrentLevel,
    setMaxLevels,
    setDefaultState,
    setMyStateToShared,
  };
})();

ACTIVITY_DRAG_DROP_PARKING_1.Draggable = cc.Sprite.extend({
  audioFile: null,
  initialPosition: null,
  draggable: true,
  Z_ORDER_ANIMATION: 2,
  starAnimationSpeed: 0.1,
  winAnimationSpeed: 0.1,

  ctor: function (imgFile, initialPosition, audioFile, dropZoneIdx, idx) {
    this._super(imgFile);
    this.audioFile = audioFile;
    this.initialPosition = initialPosition;
    this.setPosition(initialPosition);
    this.setUserData({
      dropZoneIdx: dropZoneIdx,
      idx: idx,
    });
  },

  onEnter: function () {
    this._super();
    this._createStarAnimationSprite();
  },

  onExit: function () {
    this._super();
  },

  _createStarAnimationSprite: function () {
    const starAnimationObj = ACTIVITY_DRAG_DROP_PARKING_1.config.assets.sections.animation.data.starAnimation;
    const starAnimationSprite = new cc.Sprite(
      ACTIVITY_DRAG_DROP_PARKING_1.animationPath + starAnimationObj.frameInitial + "0001" + starAnimationObj.extension
    );
    starAnimationSprite.setTag(ACTIVITY_DRAG_DROP_PARKING_1.TAGS.STAR_ANIMATION_SPRITE);
    starAnimationSprite.setPosition(cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5));
    starAnimationSprite.setAnchorPoint(cc.p(0.5, 0.8));
    starAnimationSprite.setVisible(false);
    this.addChild(starAnimationSprite, this.Z_ORDER_ANIMATION);
  },

  playCorrectAnimation: function () {
    const starAnimationSprite = this.getChildByTag(ACTIVITY_DRAG_DROP_PARKING_1.TAGS.STAR_ANIMATION_SPRITE);
    starAnimationSprite.setVisible(true);
    const starAnimationObj = ACTIVITY_DRAG_DROP_PARKING_1.config.assets.sections.animation.data.starAnimation;
    const animate = HDUtility.runFrameAnimation(
      ACTIVITY_DRAG_DROP_PARKING_1.animationPath + starAnimationObj.frameInitial,
      starAnimationObj.frameCount,
      this.starAnimationSpeed,
      ".png",
      1
    );
    starAnimationSprite.runAction(
      cc.sequence([
        animate,
        cc.callFunc(() => {
          starAnimationSprite.setVisible(false);
        }),
      ])
    );
  },

  playAudio: function () {},

  snapBack: function () {
    this.setPosition(this.initialPosition);
  },

  isDraggable: function () {
    return this.draggable;
  },

  setDraggable: function (flag) {
    this.draggable = flag;
  },

  drag: function (position) {
    if (this.draggable) {
      this.setPosition(position);
    }
  },

  getDropZoneIdx: function () {
    return this.getUserData().dropZoneIdx;
  },

  getIdx: function () {
    return this.getUserData().idx;
  },
});

ACTIVITY_DRAG_DROP_PARKING_1.Dropzone = HDBaseLayer.extend({
  Z_ORDER_DRAGGABLE: 3,
  Z_ORDER_ANIMATION: 4,
  Z_ORDER_DROPZONE: 2,
  Z_ORDER_CLIPPER_NODE: 1,
  winAnimationSpeed: 0.1,
  imgFile: "",
  isSoloDraggable: false,
  draggableHeight: null,
  ctor: function (imgFile, position, idx, isSoloDraggable, draggableHeight) {
    this._super();
    this.setUserData({
      idx: idx,
    });
    this.ignoreAnchorPointForPosition(false);
    this.setAnchorPoint(cc.p(0.5, 0.5));
    this.setPosition(position);
    this.imgFile = imgFile;
    this.isSoloDraggable = isSoloDraggable;
    if (this.isSoloDraggable) {
      this.Z_ORDER_DROPZONE = 1;
      this.Z_ORDER_CLIPPER_NODE = 2;
    }
    this.draggableHeight = draggableHeight;
    this.renderDropzoneSprite();
  },

  onEnter: function () {
    this._super();
    this._createWinAnimationSprite();
    this._addClipperNode();
  },

  onExit: function () {
    this._super();
  },

  renderDropzoneSprite: function () {
    const dropzoneSprite = this.addSprite(this.imgFile, cc.p(0, 0), this);
    dropzoneSprite.setLocalZOrder(this.Z_ORDER_DROPZONE);
    dropzoneSprite.setAnchorPoint(cc.p(0, 0));
    this.setContentSize(dropzoneSprite.getContentSize());
  },

  _addClipperNode: function () {
    const clipperNode = new cc.ClippingNode();
    clipperNode.setLocalZOrder(this.Z_ORDER_CLIPPER_NODE);
    clipperNode.setContentSize(this.getContentSize());
    let stencil;
    if (this.isSoloDraggable) {
      stencil = new cc.Sprite(this.imgFile);
      stencil.setPosition(cc.p(clipperNode.getContentSize().width * 0.5, this.getContentSize().height * 0.5));
    } else {
      stencil = new cc.LayerColor(HDConstants.White, this.getContentSize().width, this.draggableHeight);
    }

    clipperNode.setStencil(stencil);

    clipperNode.setTag(ACTIVITY_DRAG_DROP_PARKING_1.TAGS.CLIPPER_NODE);
    this.addChild(clipperNode);

    let colorLayer = new cc.LayerColor(
      cc.color(202, 202, 202, 255),
      this.getContentSize().width,
      this.getContentSize().height
    );
    colorLayer.setVisible(false);
    colorLayer.setTag(ACTIVITY_DRAG_DROP_PARKING_1.TAGS.COLOR_LAYER);
    clipperNode.addChild(colorLayer);
  },

  _createWinAnimationSprite: function () {
    const winAnimationObj = ACTIVITY_DRAG_DROP_PARKING_1.config.assets.sections.animation.data.winAnimation;
    const winAnimationSprite = new cc.Sprite(
      ACTIVITY_DRAG_DROP_PARKING_1.animationPath + winAnimationObj.frameInitial + "0001" + winAnimationObj.extension
    );
    winAnimationSprite.setTag(ACTIVITY_DRAG_DROP_PARKING_1.TAGS.WIN_ANIMATION_SPRITE);
    winAnimationSprite.setPosition(cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5));
    winAnimationSprite.setAnchorPoint(cc.p(0.5, 0.5));
    winAnimationSprite.setVisible(false);
    this.addChild(winAnimationSprite, this.Z_ORDER_ANIMATION);
  },

  playWinAnimation: function () {
    const winAnimationSprite = this.getChildByTag(ACTIVITY_DRAG_DROP_PARKING_1.TAGS.WIN_ANIMATION_SPRITE);
    winAnimationSprite.setVisible(true);
    const winAnimationObj = ACTIVITY_DRAG_DROP_PARKING_1.config.assets.sections.animation.data.winAnimation;
    const animate = HDUtility.runFrameAnimation(
      ACTIVITY_DRAG_DROP_PARKING_1.animationPath + winAnimationObj.frameInitial,
      winAnimationObj.frameCount,
      this.winAnimationSpeed,
      ".png",
      1
    );
    winAnimationSprite.runAction(
      cc.sequence([
        animate,
        cc.callFunc(() => {
          winAnimationSprite.setVisible(false);
        }),
      ])
    );
  },

  playIncorrectMatchEffect: function (callback, target) {
    const colorLayer = this.getChildByTag(ACTIVITY_DRAG_DROP_PARKING_1.TAGS.CLIPPER_NODE).getChildByTag(
      ACTIVITY_DRAG_DROP_PARKING_1.TAGS.COLOR_LAYER
    );
    colorLayer.setColor(cc.color(174, 86, 97));
    colorLayer.setVisible(true);
    const blinkAction = cc.blink(2, 10);
    colorLayer.runAction(
      cc.sequence([blinkAction, cc.callFunc(() => colorLayer.setVisible(false)), cc.callFunc(callback, target)])
    );
  },

  showHoverEffect: function () {
    const colorLayer = this.getChildByTag(ACTIVITY_DRAG_DROP_PARKING_1.TAGS.CLIPPER_NODE).getChildByTag(
      ACTIVITY_DRAG_DROP_PARKING_1.TAGS.COLOR_LAYER
    );
    colorLayer.setColor(cc.color(205, 207, 208));
    colorLayer.setVisible(true);
  },

  hideHoverEffect: function () {
    this.getChildByTag(ACTIVITY_DRAG_DROP_PARKING_1.TAGS.CLIPPER_NODE)
      .getChildByTag(ACTIVITY_DRAG_DROP_PARKING_1.TAGS.COLOR_LAYER)
      .setVisible(false);
  },

  dropDraggable: function (draggableSprite) {
    draggableSprite.removeFromParent();
    if (this.isSoloDraggable) {
      draggableSprite.setAnchorPoint(cc.p(0.5, 0.5));
      draggableSprite.setPosition(cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5));
    } else {
      draggableSprite.setAnchorPoint(cc.p(0.5, 0));
      draggableSprite.setPosition(cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.0));
    }

    draggableSprite.setLocalZOrder(this.Z_ORDER_DRAGGABLE);
    this.addChild(draggableSprite);
  },

  getIdx: function () {
    return this.getUserData().idx;
  },
});

// common layer for teacher and student
ACTIVITY_DRAG_DROP_PARKING_1.CommonViewLayer = HDBaseLayer.extend({
  _currentLevel: 0,
  _levelInfo: [],
  _draggableSprites: [],
  _dropzoneSprites: [],
  _draggedSpriteRef: null,
  _correctCount: 0,
  _interactionEnabled: true,
  _lastIntersectedDropzoneSprite: null,
  _isDragging: false,
  _isIncorrectMatchAnimationPlaying: false,
  _levelChangeDelegate: null,
  ctor: function () {
    // initializations here
    this._super();
    if (!ACTIVITY_DRAG_DROP_PARKING_1.isSyncedState) {
      this.setDefaultState();
    }
    this._syncState();
  },

  onEnter: function () {
    // rendering & side effects here
    this._super();
    this.updateRoomData();
    this._renderCurrentLevel();
  },

  onExit: function () {
    // cleanup here
    this._super();
    ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.resetState();
    this._cleanup();
    lesson_1.ref.turnBased = true;
  },

  // private functions below

  _removeAllDraggables: function () {
    for (let i = 0; i < this._draggableSprites.length; ++i) {
      const draggableSprite = this._draggableSprites[i];
      draggableSprite.removeFromParent();
    }
  },

  _removeAllDropzones: function () {
    for (let i = 0; i < this._dropzoneSprites.length; ++i) {
      const dropzoneSprite = this._dropzoneSprites[i];
      dropzoneSprite.removeFromParent();
    }
  },

  _cleanup: function () {
    this._removeAllDraggables();
    this._removeAllDropzones();
    this._draggableSprites.length = 0;
    this._dropzoneSprites.length = 0;
    this._levelInfo.length = 0;
    this._correctCount = 0;
    this._isIncorrectMatchAnimationPlaying = false;
  },

  _setCurrentLevel: function (level = 0) {
    this._currentLevel = cc.clampf(
      level,
      0,
      ACTIVITY_DRAG_DROP_PARKING_1.config.assets.sections.levels.data.length - 1
    );
  },

  _syncState: function () {
    this._setCurrentLevel(ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.getCurrentLevel());
    this._levelInfo = ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.getLevelInfo();
    this._correctCount = ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.getCorrectCount();
    lesson_1.ref.turnBased = !(this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.INDIVIDUAL_MODE);
  },

  _renderBackground: function () {
    const bgSprite = this.getChildByTag(ACTIVITY_DRAG_DROP_PARKING_1.TAGS.BACKGROUND_SPRITE);
    const texture =
      ACTIVITY_DRAG_DROP_PARKING_1.spritePath +
      ACTIVITY_DRAG_DROP_PARKING_1.config.background.sections.backgroundSlides.images[
        ACTIVITY_DRAG_DROP_PARKING_1.config.assets.sections.levels.data[this._currentLevel].background
      ];
    if (bgSprite) {
      bgSprite.setTexture(texture);
    } else {
      const bgSprite = this.setBackground(texture);
      bgSprite.setTag(ACTIVITY_DRAG_DROP_PARKING_1.TAGS.BACKGROUND_SPRITE);
    }
  },

  _renderDraggables: function () {
    const draggablesData =
      ACTIVITY_DRAG_DROP_PARKING_1.config.assets.sections.levels.data[this._currentLevel].draggables;
    for (let i = 0; i < draggablesData.length; ++i) {
      const draggableObj = draggablesData[i];
      const draggableSprite = new ACTIVITY_DRAG_DROP_PARKING_1.Draggable(
        ACTIVITY_DRAG_DROP_PARKING_1.spritePath + draggableObj.imageName,
        draggableObj.position,
        ACTIVITY_DRAG_DROP_PARKING_1.soundPath + draggableObj.audioName,
        draggableObj.dropZoneIdx,
        i
      );
      draggableSprite.setTag(ACTIVITY_DRAG_DROP_PARKING_1.TAGS.DRAGGABLE_START + i);
      this.scaleSpriteInRatio(draggableSprite, 1);
      if (this._levelInfo.includes(i)) {
        const dropzoneSprite = this._dropzoneSprites[draggableObj.dropZoneIdx];
        dropzoneSprite.dropDraggable(draggableSprite);
      } else {
        this._draggableSprites.push(draggableSprite);
        this.addChild(draggableSprite);
      }
    }
  },

  _renderDropzones: function () {
    const isSoloDraggable =
      ACTIVITY_DRAG_DROP_PARKING_1.config.assets.sections.levels.data[this._currentLevel].isDraggableSolo;
    const dropzonesData = ACTIVITY_DRAG_DROP_PARKING_1.config.assets.sections.levels.data[this._currentLevel].dropZones;
    for (let i = 0; i < dropzonesData.length; ++i) {
      const dropzoneObj = dropzonesData[i];
      const dropzoneSprite = new ACTIVITY_DRAG_DROP_PARKING_1.Dropzone(
        ACTIVITY_DRAG_DROP_PARKING_1.spritePath + dropzoneObj.imageName,
        dropzoneObj.position,
        i,
        isSoloDraggable,
        new cc.Sprite(
          ACTIVITY_DRAG_DROP_PARKING_1.spritePath +
            ACTIVITY_DRAG_DROP_PARKING_1.config.assets.sections.levels.data[this._currentLevel].draggables[0].imageName
        ).getContentSize().height
      );
      dropzoneSprite.setTag(ACTIVITY_DRAG_DROP_PARKING_1.TAGS.DROPZONE_START + i);
      this.scaleSpriteInRatio(dropzoneSprite, 1);
      this._dropzoneSprites.push(dropzoneSprite);
      this.addChild(dropzoneSprite);
    }
  },

  _renderCurrentLevel: function () {
    this._renderBackground();
    this._renderDropzones();
    this._renderDraggables();
  },

  _dragDraggable: function (location) {
    this._draggedSpriteRef.drag(
      cc.pClamp(
        location,
        cc.p(this._draggedSpriteRef.getContentSize().width * 0.5, this._draggedSpriteRef.getContentSize().height * 0.5),
        cc.p(
          this.getContentSize().width - this._draggedSpriteRef.getContentSize().width * 0.5,
          this.getContentSize().height - this._draggedSpriteRef.getContentSize().height * 0.5
        )
      )
    );
  },

  /**
   * The first ACTIVITY_DRAG_DROP_PARKING_1.Dropzone element that intersects with draggedItem. Otherwise, undefined is returned.
   * @function
   * @return {ACTIVITY_DRAG_DROP_PARKING_1.Dropzone}
   */
  _findDropzone: function () {
    return this._dropzoneSprites.find((sprite) =>
      cc.rectIntersectsRect(sprite.getBoundingBox(), this._draggedSpriteRef.getBoundingBox())
    );
  },

  /**
   * returns whether last intersected dropzone is associated with dragged draggable
   * @function
   * @return {boolean}
   */
  _isMatched: function () {
    return this._draggedSpriteRef.getDropZoneIdx() === this._lastIntersectedDropzoneSprite.getIdx();
  },

  _isCurrentLevelCompleted: function () {
    return (
      this._correctCount ===
      ACTIVITY_DRAG_DROP_PARKING_1.config.assets.sections.levels.data[this._currentLevel].draggables.length
    );
  },

  // socket events

  handleGameSocketEvents: function (data) {
    const { type, data: userData, userName } = data;
    switch (type) {
      case ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.UPDATE_USER_DATA: {
        if (userName !== HDAppManager.username) {
          ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.setLevelInfoOfUser(userName, userData);
        }
        break;
      }

      default: {
      }
    }
  },

  handleSocketEvents: function (event) {
    const { eventType, data } = event;
    switch (eventType) {
    }
  },

  // mouse/touch listeners

  onMouseDown: function (event) {
    if (!this._interactionEnabled || this._isIncorrectMatchAnimationPlaying) {
      return;
    }
    for (let i = 0; i < this._draggableSprites.length; ++i) {
      const draggableSprite = this._draggableSprites[i];
      if (
        cc.rectContainsPoint(draggableSprite.getBoundingBox(), event.getLocation()) &&
        draggableSprite.isDraggable()
      ) {
        this._draggedSpriteRef = draggableSprite;
        this._isDragging = true;
        break;
      }
    }
  },

  onMouseMove: function (event) {
    if (this._isDragging) {
      this._dragDraggable(event.getLocation());
      const dropzoneSprite = this._findDropzone();
      if (dropzoneSprite) {
        if (this._lastIntersectedDropzoneSprite && this._lastIntersectedDropzoneSprite !== dropzoneSprite) {
          this._lastIntersectedDropzoneSprite.hideHoverEffect();
          this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            roomId: HDAppManager.roomId,
            type: ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.HIDE_HOVER_EFFECT,
            userName: HDAppManager.username,
            dropzoneTag: this._lastIntersectedDropzoneSprite.getTag(),
          });
        }
        this._lastIntersectedDropzoneSprite = dropzoneSprite;
        dropzoneSprite.showHoverEffect();
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
          roomId: HDAppManager.roomId,
          type: ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.SHOW_HOVER_EFFECT,
          userName: HDAppManager.username,
          dropzoneTag: this._lastIntersectedDropzoneSprite.getTag(),
        });
      } else if (this._lastIntersectedDropzoneSprite) {
        this._lastIntersectedDropzoneSprite.hideHoverEffect();
        this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
          roomId: HDAppManager.roomId,
          type: ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.HIDE_HOVER_EFFECT,
          userName: HDAppManager.username,
          dropzoneTag: this._lastIntersectedDropzoneSprite.getTag(),
        });
        this._lastIntersectedDropzoneSprite = null;
      }

      return true;
    }
    return false;
  },

  onMouseUp: function (event) {
    if (this._lastIntersectedDropzoneSprite) {
      this._lastIntersectedDropzoneSprite.hideHoverEffect();
      this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
        roomId: HDAppManager.roomId,
        type: ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.HIDE_HOVER_EFFECT,
        userName: HDAppManager.username,
        dropzoneTag: this._lastIntersectedDropzoneSprite.getTag(),
      });
    }
    let isMatchedCorrectly = false;
    if (this._isDragging) {
      this._draggedSpriteRef.setDraggable(false);
      if (this._lastIntersectedDropzoneSprite) {
        const isMatched = this._isMatched();
        if (isMatched) {
          ++this._correctCount;
          ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.setCorrectCount(this._correctCount);
          this._lastIntersectedDropzoneSprite.dropDraggable(this._draggedSpriteRef);
          this._draggedSpriteRef.playCorrectAnimation();
          this.setResetButtonActive(true);
          if (this._isCurrentLevelCompleted()) {
            this.playLevelCompleteAnimation();
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
              roomId: HDAppManager.roomId,
              type: ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.LEVEL_COMPLETE_ANIMATION,
              userName: HDAppManager.username,
            });
          }
          ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.setLevelInfo(this._draggedSpriteRef.getIdx());
          this.updateRoomData();
          if (this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.INDIVIDUAL_MODE) {
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
              roomId: HDAppManager.roomId,
              type: ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.UPDATE_USER_DATA,
              userName: HDAppManager.username,
              data: ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.getLevelInfoOfUser(HDAppManager.username),
            });
          }
          this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            roomId: HDAppManager.roomId,
            type: ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.ITEM_DROPPED_CORRECTLY,
            userName: HDAppManager.username,
            itemTag: this._draggedSpriteRef.getTag(),
            dropzoneTag: this._lastIntersectedDropzoneSprite.getTag(),
            correctCount: this._correctCount,
          });
          isMatchedCorrectly = true;
        } else {
          this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            roomId: HDAppManager.roomId,
            type: ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.ITEM_DROPPED_INCORRECTLY,
            userName: HDAppManager.username,
            itemTag: this._draggedSpriteRef.getTag(),
            dropzoneTag: this._lastIntersectedDropzoneSprite.getTag(),
          });
          this._draggedSpriteRef.setPosition(this._lastIntersectedDropzoneSprite.getPosition());
          this._isIncorrectMatchAnimationPlaying = true;
          this._lastIntersectedDropzoneSprite.playIncorrectMatchEffect(() => {
            this._draggedSpriteRef.snapBack();
            this._isIncorrectMatchAnimationPlaying = false;
          }, this);
        }
      } else {
        if (ACTIVITY_DRAG_DROP_PARKING_1.config.assets.sections.snapBack.value) {
          this._draggedSpriteRef.snapBack();
          this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
            roomId: HDAppManager.roomId,
            type: ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.ITEM_SNAPPED_BACK,
            userName: HDAppManager.username,
            itemTag: this._draggedSpriteRef.getTag(),
          });
        }
      }
      this._draggedSpriteRef.setDraggable(true);
      this._isDragging = false;
      this._lastIntersectedDropzoneSprite = null;
      return isMatchedCorrectly;
    }
  },

  // public exposed functions below

  // set my individual state to shared on individual mode
  setMyStateToShared: function () {
    ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.setMyStateToShared();
  },

  setDefaultState: function () {
    ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.setMaxLevels(ACTIVITY_DRAG_DROP_PARKING_1.maxLevels);
    ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.setDefaultState();
  },

  setResetButtonActive: function (flag) {
    this.getParent().getParent().setResetButtonActive(flag);
  },

  isThereNextLevel: function () {
    return this.getCurrentLevel() < ACTIVITY_DRAG_DROP_PARKING_1.config.assets.sections.levels.data.length - 1;
  },

  setCorrectCount: function (count) {
    ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.setCorrectCount(count);
    this._correctCount = count;
  },

  playLevelCompleteAnimation: function () {
    const self = this;
    let interval = null;
    let i = 0;

    function playDropZoneAnimation() {
      if (i === self._dropzoneSprites.length) {
        clearInterval(interval);
        if (self.isThereNextLevel()) {
          self.renderNextLevelWithDelay(3);
        }
      } else {
        self._dropzoneSprites[i].playWinAnimation();
      }
      ++i;
    }

    interval = setInterval(playDropZoneAnimation, 200);
  },

  renderPreviousLevel: function () {
    this.renderLevel(ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.getCurrentLevel() - 1);
  },

  renderNextLevel: function () {
    this.renderLevel(ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.getCurrentLevel() + 1);
  },

  renderNextLevelWithDelay: function (delay) {
    this.runAction(cc.sequence([cc.delayTime(delay), cc.callFunc(this.renderNextLevel, this)]));
  },

  renderGameMode: function (mode = ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED) {
    ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.setGameMode(mode);
    lesson_1.ref.turnBased = !(mode === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.INDIVIDUAL_MODE);
    this.renderLevel(ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.getCurrentLevel());
  },

  renderLevel: function (level = 1) {
    this._cleanup();
    ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.setCurrentLevel(level);
    this._correctCount = ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.getCorrectCount();
    this._levelInfo = ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.getLevelInfo();
    this._setCurrentLevel(level);
    this._renderCurrentLevel();
    this.updateRoomData();
    this._levelChangeDelegate && this._levelChangeDelegate.onLevelChange();
  },

  // individual mode
  renderWithLevelData: function (userName) {
    this._cleanup();
    const data = ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.getLevelInfoOfUser(userName);
    this._setCurrentLevel(data.currentLevel);
    this._levelInfo = data.levels[data.currentLevel].currentLevelInfo;
    this._renderCurrentLevel();
  },

  getCurrentLevel: function () {
    return this._currentLevel;
  },

  dragDraggableByTag: function (tag, position) {
    this.getChildByTag(tag).drag(position);
  },

  snapBackDraggableByTag: function (tag) {
    this.getChildByTag(tag).snapBack();
  },

  putDraggableInDropzone: function (draggableTag, dropzoneTag) {
    const draggableSprite = this.getChildByTag(draggableTag);
    const dropzoneSprite = this.getChildByTag(dropzoneTag);
    if (draggableSprite && dropzoneSprite) {
      dropzoneSprite.dropDraggable(draggableSprite);
      draggableSprite.playCorrectAnimation();
    }
  },

  incorrectMatch: function (draggableTag, dropzoneTag) {
    const draggableSprite = this.getChildByTag(draggableTag);
    const dropzoneSprite = this.getChildByTag(dropzoneTag);
    draggableSprite.setPosition(dropzoneSprite.getPosition());
    dropzoneSprite.playIncorrectMatchEffect(() => {
      draggableSprite.snapBack();
    }, this);
  },

  emitSocketEvent: function (type, data) {
    SocketManager.emitCutomEvent(HDSingleEventKey, {
      eventType: type,
      roomId: HDAppManager.roomId,
      data: data,
    });
  },

  updateRoomData: function () {
    this.emitSocketEvent(HDSocketEventType.UPDATE_ROOM_DATA, {
      roomId: HDAppManager.roomId,
      roomData: {
        activity: ACTIVITY_DRAG_DROP_PARKING_1.config.properties.namespace,
        data: ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.getState(),
        activityStartTime: HDAppManager.getActivityStartTime(),
      },
    });
  },

  // reset current level
  reset: function () {
    ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.resetCurrentLevel();
    this._cleanup();
    this._renderCurrentLevel();
    this.updateRoomData();
  },

  isInteractionEnabled: function () {
    return this._interactionEnabled;
  },

  setInteractionEnabled: function (flag) {
    this._interactionEnabled = flag;
  },

  getGameMode: function () {
    return ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.getState().gameMode;
  },

  getMouseTexture: function () {
    return (
      ACTIVITY_DRAG_DROP_PARKING_1.spritePath + ACTIVITY_DRAG_DROP_PARKING_1.config.cursors.data.cursorPointer.imageName
    );
  },

  getDraggedItemTag: function () {
    if (this._draggedSpriteRef) {
      return this._draggedSpriteRef.getTag();
    }
    return null;
  },

  // scale between 0 and 1
  scaleSpriteInRatio: function (sprite, scale = 1) {
    const originalWidth = sprite.getContentSize().width;
    const originalHeight = sprite.getContentSize().height;
    const newWidth = originalWidth * scale;
    const newHeight = (newWidth * originalHeight) / originalWidth;
    sprite.setScale(scale, newHeight / originalHeight);
  },

  showHoverEffect: function (dropzoneTag) {
    this.getChildByTag(dropzoneTag).showHoverEffect();
  },

  hideHoverEffect: function (dropzoneTag) {
    this.getChildByTag(dropzoneTag).hideHoverEffect();
  },

  subscribeToLevelChange: function (target) {
    this._levelChangeDelegate = target;
  },

  getDraggableIdxByTag: function (tag) {
    const draggableSprite = this.getChildByTag(tag);
    return draggableSprite.getIdx();
  },
});

// teacher layer
ACTIVITY_DRAG_DROP_PARKING_1.TeacherViewLayer = ACTIVITY_DRAG_DROP_PARKING_1.CommonViewLayer.extend({
  isCustomMouseTexture: true,
  previewRequestUserName: "",
  ctor: function () {
    this._super();
    this.subscribeToLevelChange(this);
    this.sync();
  },

  onEnter: function () {
    this._super();
    this.setResetButtonActive(true);
    this.renderBackButton();
    this.renderNextButton();
    this.renderSwitchButton();
    const moduleStartScriptObj = ACTIVITY_DRAG_DROP_PARKING_1.config.teacherScripts.data.moduleStart;
    moduleStartScriptObj.enable && this.showScriptMessage(moduleStartScriptObj.content.ops);
  },

  onExit: function () {
    this._super();
  },

  onLevelChange: function () {
    this.nextButtonActive();
    this.backButtonActive();
  },

  // sync teacher specific data
  sync: function () {
    this.setStudentPreviewPanelActive(this.getGameMode());
  },

  updateStudentTurn: function (userName) {
    this.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_TEACHER, {
      roomId: HDAppManager.roomId,
      users: userName ? [{ userName: userName }] : [],
    });
    if (userName) {
      this.showScriptMessage(ACTIVITY_DRAG_DROP_PARKING_1.config.teacherScripts.data.StudentMouseEnabled.content.ops);
    }
  },

  updateStudentInteraction: function (userName, enabled) {
    this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
      roomId: HDAppManager.roomId,
      type: ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.STUDENT_INTERACTION,
      userName: HDAppManager.username,
      studentName: userName,
      enabled: enabled,
    });
  },

  onStudentPreviewCellClicked: function (userName, isSelected, scrollViewContainer) {
    this.previewRequestUserName = userName;
    this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
      roomId: HDAppManager.roomId,
      type: ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.PREVIEW_REQUEST,
      userName: HDAppManager.username,
      studentName: userName,
      request: isSelected,
    });
    this.renderWithLevelData(userName);
  },

  handleGameSocketEvents: function (data) {
    this._super(data);
    const { type, userName } = data;
    switch (type) {
      case ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.ITEM_DRAGGED: {
        const { itemTag, location } = data;
        if (
          (this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED &&
            userName !== HDAppManager.username) ||
          (this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.INDIVIDUAL_MODE &&
            userName === this.previewRequestUserName)
        ) {
          this.dragDraggableByTag(itemTag, location);
        }
        break;
      }
      case ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.ITEM_SNAPPED_BACK: {
        const { itemTag } = data;
        if (
          (this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED &&
            userName !== HDAppManager.username) ||
          (this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.INDIVIDUAL_MODE &&
            userName === this.previewRequestUserName)
        ) {
          this.snapBackDraggableByTag(itemTag);
        }
        break;
      }
      case ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.ITEM_DROPPED_CORRECTLY: {
        const { itemTag, dropzoneTag, correctCount } = data;
        if (
          (this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED &&
            userName !== HDAppManager.username) ||
          (this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.INDIVIDUAL_MODE &&
            userName === this.previewRequestUserName)
        ) {
          if (this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED) {
            ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.setLevelInfo(this.getDraggableIdxByTag(itemTag));
            this.setCorrectCount(correctCount);
          }
          this.putDraggableInDropzone(itemTag, dropzoneTag);
          this.showScriptMessage(
            ACTIVITY_DRAG_DROP_PARKING_1.config.teacherScripts.data.StudentFirstCorrectDrop.content.ops
          );
        }
        break;
      }
      case ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.ITEM_DROPPED_INCORRECTLY: {
        const { itemTag, dropzoneTag } = data;
        if (
          (this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED &&
            userName !== HDAppManager.username) ||
          (this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.INDIVIDUAL_MODE &&
            userName === this.previewRequestUserName)
        ) {
          this.incorrectMatch(itemTag, dropzoneTag);
        }
        break;
      }
      case ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.SHOW_HOVER_EFFECT: {
        const { dropzoneTag } = data;
        if (
          (this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED &&
            userName !== HDAppManager.username) ||
          (this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.INDIVIDUAL_MODE &&
            userName === this.previewRequestUserName)
        ) {
          this.showHoverEffect(dropzoneTag);
        }
        break;
      }
      case ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.HIDE_HOVER_EFFECT: {
        const { dropzoneTag } = data;
        if (
          (this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED &&
            userName !== HDAppManager.username) ||
          (this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.INDIVIDUAL_MODE &&
            userName === this.previewRequestUserName)
        ) {
          this.hideHoverEffect(dropzoneTag);
        }
        break;
      }
      case ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.LEVEL_COMPLETE_ANIMATION: {
        if (
          (this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED &&
            userName !== HDAppManager.username) ||
          (this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.INDIVIDUAL_MODE &&
            userName === this.previewRequestUserName)
        ) {
          this.playLevelCompleteAnimation();
        }
        break;
      }
      default: {
      }
    }
  },

  handleSocketEvents: function (event) {
    this._super(event);
    const { eventType, data } = event;
    switch (eventType) {
      case HDSocketEventType.GAME_MESSAGE: {
        this.handleGameSocketEvents(data);
        break;
      }
    }
  },

  reset: function () {
    this._super();
    this.getChildByTag(ACTIVITY_DRAG_DROP_PARKING_1.TAGS.SWITCH_BUTTON).setEnabled(true);
    this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
      roomId: HDAppManager.roomId,
      type: ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.RESET,
      userName: HDAppManager.username,
    });
  },

  mouseControlEnable: function (location) {
    const nodeSpace = this.convertToNodeSpace(location);
    const switchButton = this.getChildByTag(ACTIVITY_DRAG_DROP_PARKING_1.TAGS.SWITCH_BUTTON);
    const nextButton = this.getChildByTag(ACTIVITY_DRAG_DROP_PARKING_1.TAGS.NEXT_BUTTON);
    const backButton = this.getChildByTag(ACTIVITY_DRAG_DROP_PARKING_1.TAGS.BACK_BUTTON);
    this.isCustomMouseTexture = !(
      cc.rectContainsPoint(switchButton.getBoundingBox(), nodeSpace) ||
      (nextButton && cc.rectContainsPoint(nextButton.getBoundingBox(), nodeSpace)) ||
      (backButton && cc.rectContainsPoint(backButton.getBoundingBox(), nodeSpace))
    );
    return true;
  },

  mouseTexture: function () {
    return {
      hasCustomTexture: this.isCustomMouseTexture,
      textureUrl: this.getMouseTexture(),
    };
  },

  onMouseMove: function (event) {
    const isDragging = this._super(event);
    if (isDragging && this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED) {
      const location = event.getLocation();
      this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
        roomId: HDAppManager.roomId,
        type: ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.ITEM_DRAGGED,
        userName: HDAppManager.username,
        itemTag: this.getDraggedItemTag(),
        location: { x: location.x, y: location.y },
      });
    }
  },

  showScriptMessage: function (msg) {
    this.getParent().getParent().showScriptMessage(msg);
  },

  setStudentPreviewPanelActive: function (flag) {
    lesson_1.ref.setStudentsPreviewPanelActive(flag);
  },

  renderBackButton: function () {
    const backButtonObj = ACTIVITY_DRAG_DROP_PARKING_1.config.buttons.data.backButton;
    const backButton = this.createButton(
      ACTIVITY_DRAG_DROP_PARKING_1.spritePath + backButtonObj.enableState,
      ACTIVITY_DRAG_DROP_PARKING_1.spritePath + backButtonObj.pushedState,
      "",
      0,
      ACTIVITY_DRAG_DROP_PARKING_1.TAGS.BACK_BUTTON,
      cc.p(this.getContentSize().width * 0.023, this.getContentSize().height * 0.14),
      this
    );
    backButton.setAnchorPoint(cc.p(0, 0));
    this.backButtonActive();
  },

  renderNextButton: function () {
    const backButton = this.getChildByTag(ACTIVITY_DRAG_DROP_PARKING_1.TAGS.BACK_BUTTON);
    const nextButtonObj = ACTIVITY_DRAG_DROP_PARKING_1.config.buttons.data.nextButton;
    const nextButton = this.createButton(
      ACTIVITY_DRAG_DROP_PARKING_1.spritePath + nextButtonObj.enableState,
      ACTIVITY_DRAG_DROP_PARKING_1.spritePath + nextButtonObj.pushedState,
      "",
      0,
      ACTIVITY_DRAG_DROP_PARKING_1.TAGS.NEXT_BUTTON,
      cc.p(
        backButton.getPositionX(),
        backButton.getPositionY() + backButton.getContentSize().height + this.getContentSize().height * 0.02
      ),
      this
    );
    nextButton.setAnchorPoint(cc.p(0, 0));
    this.nextButtonActive();
  },

  nextButtonActive: function () {
    const nextButton = this.getChildByTag(ACTIVITY_DRAG_DROP_PARKING_1.TAGS.NEXT_BUTTON);
    nextButton.setEnabled(this.isThereNextLevel());
  },

  backButtonActive: function () {
    const backButton = this.getChildByTag(ACTIVITY_DRAG_DROP_PARKING_1.TAGS.BACK_BUTTON);
    backButton.setEnabled(this.getCurrentLevel() !== 0);
  },

  renderSwitchButton: function () {
    const switchButtonObj = ACTIVITY_DRAG_DROP_PARKING_1.config.buttons.data.switchButton;
    const switchButton = this.createButton(
      ACTIVITY_DRAG_DROP_PARKING_1.spritePath + switchButtonObj.enableState,
      ACTIVITY_DRAG_DROP_PARKING_1.spritePath + switchButtonObj.pushedState,
      this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED
        ? ACTIVITY_DRAG_DROP_PARKING_1.SWITCH_BUTTON_TITLE.SHARED
        : ACTIVITY_DRAG_DROP_PARKING_1.SWITCH_BUTTON_TITLE.INDIVIDUAL_MODE,
      16,
      ACTIVITY_DRAG_DROP_PARKING_1.TAGS.SWITCH_BUTTON,
      cc.p(this.getContentSize().width * 0.977, this.getContentSize().height * 0.14),
      this,
      null,
      ACTIVITY_DRAG_DROP_PARKING_1.spritePath + switchButtonObj.disableState
    );
    switchButton.setTitleColor(HDConstants.Black);
    switchButton.setAnchorPoint(cc.p(1, 0));
  },

  onSwitchButtonClicked: function (sender) {
    const gameMode = this.getGameMode();
    sender.setEnabled(gameMode !== ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED);
    sender.setTitleText(
      gameMode === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED
        ? ACTIVITY_DRAG_DROP_PARKING_1.SWITCH_BUTTON_TITLE.INDIVIDUAL_MODE
        : ACTIVITY_DRAG_DROP_PARKING_1.SWITCH_BUTTON_TITLE.SHARED
    );
    this.setStudentPreviewPanelActive(!gameMode);
    const newGameMode = gameMode === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED ? 1 : 0;
    if (newGameMode === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.INDIVIDUAL_MODE) {
      this.setMyStateToShared();
    }
    this.renderGameMode(newGameMode);
    this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
      roomId: HDAppManager.roomId,
      type: ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.CHANGE_GAME_MODE,
      userName: HDAppManager.username,
      gameMode: newGameMode,
    });
  },

  buttonCallback: function (sender, type) {
    switch (type) {
      case ccui.Widget.TOUCH_ENDED:
        switch (sender.getTag()) {
          case ACTIVITY_DRAG_DROP_PARKING_1.TAGS.NEXT_BUTTON: {
            this.renderNextLevel();
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
              roomId: HDAppManager.roomId,
              type: ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.NEXT_LEVEL,
              userName: HDAppManager.username,
            });
            break;
          }
          case ACTIVITY_DRAG_DROP_PARKING_1.TAGS.BACK_BUTTON: {
            this.renderPreviousLevel();
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
              roomId: HDAppManager.roomId,
              type: ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.PREV_LEVEL,
              userName: HDAppManager.username,
            });
            break;
          }
          case ACTIVITY_DRAG_DROP_PARKING_1.TAGS.SWITCH_BUTTON: {
            this.onSwitchButtonClicked(sender);
            break;
          }
        }
        break;
    }
  },
});

// student layer
ACTIVITY_DRAG_DROP_PARKING_1.StudentViewLayer = ACTIVITY_DRAG_DROP_PARKING_1.CommonViewLayer.extend({
  isPreviewRequest: false, // for use in individual mode , teacher wanting to see student's preview
  ctor: function () {
    this._super();
    this.setInteractionEnabled(false);
  },

  onEnter: function () {
    this._super();
  },

  onExit: function () {
    this._super();
  },

  mouseControlEnable: function () {
    return this.isInteractionEnabled();
  },

  onMouseMove: function (event) {
    const isDragging = this._super(event);
    const gameMode = this.getGameMode();
    if (
      (isDragging && gameMode === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED) ||
      (isDragging && gameMode === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.INDIVIDUAL_MODE && this.isPreviewRequest)
    ) {
      const location = event.getLocation();
      this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
        roomId: HDAppManager.roomId,
        type: ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.ITEM_DRAGGED,
        userName: HDAppManager.username,
        itemTag: this.getDraggedItemTag(),
        location: { x: location.x, y: location.y },
      });
    }
  },

  onMouseUp: function (event) {
    const isMatched = this._super(event);
    if (isMatched && this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED) {
      this.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_STUDENT, {
        roomId: HDAppManager.roomId,
      });
    }
  },

  mouseTexture: function () {
    return {
      hasCustomTexture: this.isInteractionEnabled(),
      textureUrl: this.getMouseTexture(),
    };
  },

  handleStudentTurn: function (users = [{ userName: "" }]) {
    this.setInteractionEnabled(users.some((user) => user.userName === HDAppManager.username));
  },

  handleStudentInteraction: function (userName, enabled) {
    if (userName === HDAppManager.username) {
      this.setInteractionEnabled(enabled);
    }
  },

  handleGameSocketEvents: function (data) {
    this._super(data);
    const { type, userName } = data;
    switch (type) {
      case ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.ITEM_DRAGGED: {
        const { itemTag, location } = data;
        if (
          userName !== HDAppManager.username &&
          this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED
        ) {
          this.dragDraggableByTag(itemTag, location);
        }
        break;
      }
      case ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.ITEM_SNAPPED_BACK: {
        const { itemTag } = data;
        if (
          userName !== HDAppManager.username &&
          this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED
        ) {
          this.snapBackDraggableByTag(itemTag);
        }
        break;
      }
      case ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.ITEM_DROPPED_CORRECTLY: {
        const { itemTag, dropzoneTag, correctCount } = data;
        if (
          userName !== HDAppManager.username &&
          this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED
        ) {
          this.setCorrectCount(correctCount);
          ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.setLevelInfo(this.getDraggableIdxByTag(itemTag));
          this.putDraggableInDropzone(itemTag, dropzoneTag);
        }
        break;
      }
      case ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.ITEM_DROPPED_INCORRECTLY: {
        const { itemTag, dropzoneTag } = data;
        if (
          userName !== HDAppManager.username &&
          this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED
        ) {
          this.incorrectMatch(itemTag, dropzoneTag);
        }
        break;
      }
      case ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.PREVIEW_REQUEST: {
        const { studentName, request } = data;
        if (studentName === HDAppManager.username) {
          this.isPreviewRequest = request;
        }
        break;
      }
      case ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.CHANGE_GAME_MODE: {
        const { gameMode } = data;
        if (gameMode === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.INDIVIDUAL_MODE) {
          this.setMyStateToShared();
        }
        this.renderGameMode(gameMode);
        break;
      }
      case ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.STUDENT_INTERACTION: {
        const { studentName, enabled } = data;
        this.handleStudentInteraction(studentName, enabled);
        break;
      }
      case ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.RESET: {
        this.reset();
        break;
      }
      case ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.NEXT_LEVEL: {
        this.renderNextLevel();
        break;
      }
      case ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.PREV_LEVEL: {
        this.renderPreviousLevel();
        break;
      }
      case ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.SHOW_HOVER_EFFECT: {
        const { dropzoneTag } = data;
        if (
          userName !== HDAppManager.username &&
          this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED
        ) {
          this.showHoverEffect(dropzoneTag);
        }
        break;
      }
      case ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.HIDE_HOVER_EFFECT: {
        const { dropzoneTag } = data;
        if (
          userName !== HDAppManager.username &&
          this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED
        ) {
          this.hideHoverEffect(dropzoneTag);
        }
        break;
      }
      case ACTIVITY_DRAG_DROP_PARKING_1.GAME_EVENTS.LEVEL_COMPLETE_ANIMATION: {
        if (
          userName !== HDAppManager.username &&
          this.getGameMode() === ACTIVITY_DRAG_DROP_PARKING_1.GAME_MODES.SHARED
        ) {
          this.playLevelCompleteAnimation();
        }
        break;
      }
      default: {
      }
    }
  },

  handleSocketEvents: function (event) {
    this._super(event);
    const { eventType, data } = event;
    switch (eventType) {
      case HDSocketEventType.STUDENT_TURN: {
        const { users } = data;
        this.handleStudentTurn(users);
        break;
      }
      case HDSocketEventType.SWITCH_TURN_BY_TEACHER: {
        const { users } = data;
        this.handleStudentTurn(users);
        break;
      }
      case HDSocketEventType.GAME_MESSAGE: {
        this.handleGameSocketEvents(data);
        break;
      }
    }
  },
});

// main layer
ACTIVITY_DRAG_DROP_PARKING_1.MainDragDropParkingLayer = cc.Layer.extend({
  delegate: null,
  ctor: function () {
    this._super();
    const self = this;

    const activityName = "ACTIVITY_DRAG_DROP_PARKING_1";
    ACTIVITY_DRAG_DROP_PARKING_1.spritePath = "res/Activity/" + "" + activityName + "/res/Sprite/";
    ACTIVITY_DRAG_DROP_PARKING_1.soundPath = "res/Activity/" + "" + activityName + "/res/Sound/";
    ACTIVITY_DRAG_DROP_PARKING_1.animationPath = "res/Activity/" + activityName + "/res/AnimationFrames/";
    cc.loader.loadJson("res/Activity/" + activityName + "/config.json", function (error, data) {
      ACTIVITY_DRAG_DROP_PARKING_1.config = data;
      ACTIVITY_DRAG_DROP_PARKING_1.maxLevels = data.assets.sections.levels.data.length;
      if (HDAppManager.isTeacherView) {
        const teacherViewLayer = new ACTIVITY_DRAG_DROP_PARKING_1.TeacherViewLayer();
        self.delegate = teacherViewLayer;
        self.addChild(teacherViewLayer);
      } else {
        const studentViewLayer = new ACTIVITY_DRAG_DROP_PARKING_1.StudentViewLayer();
        self.delegate = studentViewLayer;
        self.addChild(studentViewLayer);
      }
    });
  },

  onEnter: function () {
    this._super();
  },

  onExit: function () {
    this._super();
    ACTIVITY_DRAG_DROP_PARKING_1.isSyncedState = false;
  },

  // delegate methods from lesson container below

  mouseControlEnable: function (location) {
    if (this.delegate) {
      return this.delegate.mouseControlEnable(location);
    }
  },

  mouseTexture: function () {
    if (this.delegate) {
      return this.delegate.mouseTexture();
    }
  },

  updateStudentTurn: function (userName) {
    this.delegate.updateStudentTurn(userName);
  },

  updateStudentInteraction: function (userName, enabled) {
    this.delegate.updateStudentInteraction(userName, enabled);
  },

  onStudentPreviewCellClicked: function (userName, isSelected, scrollViewContainer) {
    this.delegate.onStudentPreviewCellClicked(userName, isSelected, scrollViewContainer);
  },

  socketListener: function (event) {
    if (this.delegate) this.delegate.handleSocketEvents(event);
  },

  syncData: function (data) {
    ACTIVITY_DRAG_DROP_PARKING_1.SyncedStateManager.setState(data);
    ACTIVITY_DRAG_DROP_PARKING_1.isSyncedState = true;
  },

  reset: function () {
    this.delegate.reset();
  },

  touchEventListener: function (touch, event) {
    if (!this.delegate) return;
    switch (event._eventCode) {
      case cc.EventTouch.EventCode.BEGAN:
        this.delegate.onMouseDown(touch);
        break;
      case cc.EventTouch.EventCode.MOVED:
        this.delegate.onMouseMove(touch);
        break;
      case cc.EventTouch.EventCode.ENDED:
        this.delegate.onMouseUp(touch);
        break;
      case cc.EventTouch.EventCode.CANCELLED:
        this.delegate.onMouseUp(touch);
    }
  },

  mouseEventListener: function (event) {
    if (!this.delegate) return;
    switch (event._eventType) {
      case cc.EventMouse.DOWN:
        this.delegate.onMouseDown(event);
        break;
      case cc.EventMouse.MOVE:
        this.delegate.onMouseMove(event);
        break;
      case cc.EventMouse.UP:
        this.delegate.onMouseUp(event);
        break;
    }
  },
});
