// NameSpace for this activity
var ACTIVITY_FLASH_CARDS_1 = {};

// socket events
/*
note:-
events mentioned in teacherEvents are emitted from teacher side and should be subscribed from student side.
Similarly events mentioned in studentEvents are emitted from student side and should be subscribed from teacher side
 */
ACTIVITY_FLASH_CARDS_1.socketEventKey = {
  singleEvent: "SingleEvent",
};
ACTIVITY_FLASH_CARDS_1.teacherEvents = {
  FLASH_CARDS_NEXT_ITEM: 6,
};
ACTIVITY_FLASH_CARDS_1.studentEvents = {};

ACTIVITY_FLASH_CARDS_1.SubscriptionNotification = cc.Class.extend({
  onNotificationReceived: function (event) {
    const { eventType, data } = event;
  },
});

// ========================== BookPage ===============================
ACTIVITY_FLASH_CARDS_1.BookPage = cc.Sprite.extend({
  displayImage: undefined,
  displayWord: "",
  displayImageTag: 1,
  displayWordTag: 2,
  animationData: null,
  animationSpeed: 0.065,
  backgroundImage: undefined,
  ctor: function (
    backgroundImage,
    animationData,
    displayImage,
    displayWord,
    displayWordPosition,
    font,
    fontSize,
    color
  ) {
    this._super(backgroundImage);
    this.backgroundImage = backgroundImage;
    this.animationData = animationData;
    if (displayImage) {
      this.displayImage = displayImage;
      this.addDisplayImage();
    }
    if (displayWord) {
      this.displayWord = displayWord;
      this.addWordLabel(displayWordPosition, font, fontSize, color);
    }
  },
  onEnter: function () {
    this._super();
  },

  addWordLabel: function (pos, font, fontSize, color) {
    var wordLabel = new cc.LabelTTF(this.displayWord, font, fontSize);
    wordLabel.setTag(this.displayWordTag);
    wordLabel.setColor(color);
    wordLabel.setPosition(pos);
    //wordLabel.setVisible(false);
    this.addChild(wordLabel);
  },

  addDisplayImage: function () {
    var displayImageSprite = new cc.Sprite(this.displayImage);
    displayImageSprite.setTag(this.displayImageTag);
    this.addChild(displayImageSprite);
    displayImageSprite.setPosition(cc.p(this.width * 0.5, this.height * 0.5));
  },

  setDisplayWord: function (word) {
    this.displayWord = word;
    var labelRef = this.getChildByTag(this.displayWordTag);
    labelRef.setString(word ? word : "");
    labelRef.setVisible(true);
  },

  setDisplayImage: function (image) {
    this.displayImage = image;
    this.getChildByTag(this.displayImageTag).setTexture(image);
  },
  getDisplayImage: function () {
    return this.displayImage;
  },

  getDisplayWord: function () {
    return this.displayWord;
  },

  setBackgroundImage: function (image) {
    this.backgroundImage = image;
    this.setTexture(image);
  },

  setAnimationData: function (data) {
    this.animationData = data;
  },

  getAnimationData: function () {
    return this.animationData;
  },

  getBackgroundImage: function () {
    return this.backgroundImage;
  },

  getTurnAction: function () {
    return HDUtility.runFrameAnimation(
      ACTIVITY_FLASH_CARDS_1.animationPath + this.animationData.frameInitial,
      this.animationData.frameCount,
      this.animationSpeed,
      this.animationData.extension,
      1
    );
  },

  onExit: function () {},
});

// ========================== Book (with node grid and pageTurn3D action) ===============================
ACTIVITY_FLASH_CARDS_1.Book = cc.Node.extend({
  nodeGridTag: 1,
  currentPageTag: 2,
  nextPageTag: 3,
  animationQueue: [],
  isAnimationRunning: false,
  sound: undefined,
  ctor: function (backgroundImage, animationData, sound, displayImage, text, textPos, font, fontSize, color) {
    this._super();
    this.setContentSize(cc.size(cc.winSize.width, cc.winSize.height));
    this.sound = sound;
    this._addPages(backgroundImage, animationData, displayImage, text, textPos, font, fontSize, color);
  },
  _addPages: function (backgroundImage, animationData, displayImage, text, textPos, font, fontSize, color) {
    var currentPage = new ACTIVITY_FLASH_CARDS_1.BookPage(
      backgroundImage,
      animationData,
      displayImage,
      text,
      textPos,
      font,
      fontSize,
      color
    );
    currentPage.setPosition(cc.p(this.width * 0.5, this.height * 0.5));
    currentPage.setTag(this.currentPageTag);
    var nextPage = new ACTIVITY_FLASH_CARDS_1.BookPage(
      backgroundImage,
      animationData,
      displayImage,
      text,
      textPos,
      font,
      fontSize,
      color
    );
    nextPage.setTag(this.nextPageTag);
    nextPage.setPosition(cc.p(this.width * 0.5, this.height * 0.5));
    // var nodeGrid = new cc.NodeGrid();
    // nodeGrid.setTag(this.nodeGridTag);
    // nodeGrid.setTarget(currentPage);
    // this.addChild(nodeGrid, 1);
    this.addChild(currentPage, 2);
    this.addChild(nextPage, 0);
  },
  turnPage: function (animationData) {
    this.animationQueue.push({ animationData: animationData });
    this._runPageTurnAction();
  },
  _runPageTurnAction: function () {
    if (!this.isAnimationRunning) {
      this.isAnimationRunning = true;
      cc.audioEngine.playEffect(this.sound);
      let currentPage = this.getChildByTag(this.currentPageTag);
      let nextPage = this.getChildByTag(this.nextPageTag);
      nextPage.setAnimationData(this.animationQueue[0].animationData);
      nextPage.setBackgroundImage(
        ACTIVITY_FLASH_CARDS_1.animationPath +
          this.animationQueue[0].animationData.frameInitial +
          "0001" +
          this.animationQueue[0].animationData.extension
      );
      // currentPage.setDisplayImage(nextPage.getDisplayImage());
      // currentPage.setDisplayWord(nextPage.getDisplayWord());
      // nextPage.setDisplayImage(this.animationQueue[0].image);
      // nextPage.setDisplayWord(this.animationQueue[0].word);
      currentPage.runAction(
        cc.sequence(
          currentPage.getTurnAction(),
          cc.callFunc(() => {
            this.isAnimationRunning = false;
            this.animationQueue.shift();
            currentPage.setBackgroundImage(nextPage.getBackgroundImage());
            currentPage.setAnimationData(nextPage.getAnimationData());
            if (this.animationQueue.length > 0) {
              this._runPageTurnAction();
            }
          })
        )
      );
    }
  },
  onEnter: function () {
    this._super();
  },
  onExit: function () {},
});

// ========================== Billboard ===============================
ACTIVITY_FLASH_CARDS_1.BillboardSprite = cc.Sprite.extend({
  parentRef: null,
  duration: 0.5,
  yPosition: 0,
  onEnterActionOver: () => {},
  ctor: function (
    parent,
    billboardImage,
    displayImage,
    billboardYPosition,
    duration,
    onEnterActionOver,
    sound,
    displayImagePosition
  ) {
    this._super(billboardImage);
    this.setPosition(cc.p(this.getContentSize().width * 0.5 + parent.getContentSize().width, billboardYPosition));
    parent.addChild(this);
    this.parentRef = parent;
    this.duration = duration;
    this.yPosition = billboardYPosition;
    this.sound = sound;
    if (onEnterActionOver) {
      this.onEnterActionOver = onEnterActionOver;
    }
    this._placeDisplayImageInMiddle(displayImage, displayImagePosition);
  },
  _placeDisplayImageInMiddle: function (displayImage, pos) {
    var displayImageSprite = new cc.Sprite(displayImage);
    displayImageSprite.setScaleY((this.height * 0.43) / displayImageSprite.height);
    displayImageSprite.setPosition(pos);
    this.addChild(displayImageSprite, 1);
  },
  triggerEnterAction: function () {
    var enterAction = cc.moveTo(this.duration, cc.p(this.parentRef.getContentSize().width * 0.5, this.yPosition));
    this.runAction(cc.sequence(enterAction, cc.callFunc(this.onEnterActionOver, this.parentRef)));
    cc.audioEngine.playEffect(this.sound);
  },
  triggerExitAction: function () {
    var exitAction = cc.moveTo(this.duration, cc.p(-this.getContentSize().width * 0.5, this.yPosition));
    this.runAction(cc.sequence(exitAction, cc.callFunc(this._exitCleanup, this)));
  },
  _exitCleanup: function () {
    this.parentRef.removeChild(this);
  },
  onEnter: function () {
    this._super();
  },
  onExit: function () {},
});

// ========================== common for both student and teacher ===============================
ACTIVITY_FLASH_CARDS_1.CommonFlashCardsLayer = HDBaseLayer.extend({
  bookTag: 1,
  billboardQueue: [],
  canSelectNextItem: true,
  selectedFlashCardItemSpriteTag: 2,
  selectedFlashCardItemLabelTag: 3,
  wordHolderTag: 4,
  state: undefined, // it is idx, see to it it's not null
  ctor: function (state) {
    this._super();
    ACTIVITY_FLASH_CARDS_1.CommonFlashCardsLayerRef = this;
    this.state = state;
    this.setUpCommonUI();
    if (
      state >= 0 &&
      ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.theme.currentValue ===
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.theme.theme.billboards
    ) {
      this.driveToNextBillboard(
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.carouselAssets.data[state].imageName,
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.carouselAssets.data[state].label
      );
    } else if (
      state >= 0 &&
      ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.theme.currentValue ===
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.theme.theme.bookOfRhymes
    ) {
      this.turnBookPage(
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.bookOfRhymesItems.data[state]
      );
    }
  },
  setUpCommonUI: function () {
    this.addBackground();
    if (
      ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.theme.currentValue !==
      ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.theme.theme.bookOfRhymes
    ) {
      this.setWordHolder(
        this.state >= 0
          ? ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.carouselAssets.data[this.state].label
          : ""
      );
    } else {
      // for book of rhymes show only label for now ,
    }
    if (
      ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.theme.currentValue ===
      ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.theme.theme.classic
    ) {
      this.renderInitialSelectedFlashcardItem();
    }
  },
  addBackground: function () {
    if (
      ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.theme.currentValue ===
      ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.theme.theme.bookOfRhymes
    ) {
      var book = new ACTIVITY_FLASH_CARDS_1.Book(
        ACTIVITY_FLASH_CARDS_1.resourcePath +
          ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.background.sections.background.imageName,
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.pageTurnAnimation,
        ACTIVITY_FLASH_CARDS_1.soundPath +
          ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.swipe.sound
        // undefined,
        // "",
        // cc.p(
        //   HDAppManager.isTeacherView
        //     ? ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.BookOfRhymesWordLabelTeacher.position
        //         .x
        //     : ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.BookOfRhymesWordLabelStudent.position
        //         .x,
        //   HDAppManager.isTeacherView
        //     ? ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.BookOfRhymesWordLabelTeacher.position
        //         .y
        //     : ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.BookOfRhymesWordLabelStudent.position
        //         .y
        // ),
        // HDAppManager.isTeacherView
        //   ? ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.BookOfRhymesWordLabelTeacher.font
        //   : ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.BookOfRhymesWordLabelStudent.font,
        // HDAppManager.isTeacherView
        //   ? ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.BookOfRhymesWordLabelTeacher.fontSize
        //   : ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.BookOfRhymesWordLabelStudent.fontSize,
        // cc.color(
        //   HDAppManager.isTeacherView
        //     ? ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.BookOfRhymesWordLabelTeacher.color.r
        //     : ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.BookOfRhymesWordLabelStudent.color.r,
        //   HDAppManager.isTeacherView
        //     ? ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.BookOfRhymesWordLabelTeacher.color.g
        //     : ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.BookOfRhymesWordLabelStudent.color.g,
        //   HDAppManager.isTeacherView
        //     ? ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.BookOfRhymesWordLabelTeacher.color.b
        //     : ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.BookOfRhymesWordLabelStudent.color.b,
        //   HDAppManager.isTeacherView
        //     ? ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.BookOfRhymesWordLabelTeacher.color.a
        //     : ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.BookOfRhymesWordLabelStudent.color.a
        // ),
      );
      book.setTag(this.bookTag);
      this.addChild(book);
      book.setLocalZOrder(-1);
    } else {
      var bgSpriteRef = this.setBackground(
        ACTIVITY_FLASH_CARDS_1.resourcePath +
          ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.background.sections.background.imageName
      );
      bgSpriteRef.setLocalZOrder(-1);
    }
  },
  renderInitialSelectedFlashcardItem: function () {
    var selectedFlashCardItemSprite = this.addSprite(
      ACTIVITY_FLASH_CARDS_1.resourcePath +
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.carouselAssets.data[
          this.state >= 0 ? this.state : 0
        ].imageName,
      cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5),
      this
    );
    selectedFlashCardItemSprite.setVisible(this.state >= 0);
    selectedFlashCardItemSprite.setTag(this.selectedFlashCardItemSpriteTag);
  },

  updateFlashcardItemImage: function (image) {
    var sprite = this.getChildByTag(this.selectedFlashCardItemSpriteTag);
    sprite.setTexture(ACTIVITY_FLASH_CARDS_1.resourcePath + image);
    sprite.setVisible(true);
  },

  updateWordHolderText: function (text) {
    var wordHolderSprite = this.getChildByTag(this.wordHolderTag);
    var label = wordHolderSprite.getChildByTag(this.selectedFlashCardItemLabelTag);
    label.setString(text);
    wordHolderSprite.setVisible(true);
  },

  turnBookPage: function (animationData) {
    this.getChildByTag(this.bookTag).turnPage(animationData);
  },
  driveToNextBillboard: function (imageName, word) {
    this.canSelectNextItem = false;
    this.exitPreviousBillboard();
    this.enterNewBillboard(imageName, word);
  },
  onBillboardEnterd: function (word) {
    this.canSelectNextItem = true;
    this.updateWordHolderText(word);
  },
  enterNewBillboard: function (imageName, word) {
    var billBoard = new ACTIVITY_FLASH_CARDS_1.BillboardSprite(
      this,
      ACTIVITY_FLASH_CARDS_1.resourcePath +
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.billboard.imageName,
      ACTIVITY_FLASH_CARDS_1.resourcePath + imageName,
      ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.billboard.position.y,
      0.5,
      () => this.onBillboardEnterd(word),
      ACTIVITY_FLASH_CARDS_1.soundPath +
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.swipe.sound,
      cc.p(
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.billboardDisplayImage.animationPath[0]
          .position.x,
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.billboardDisplayImage.animationPath[0]
          .position.y
      )
    );
    this.billboardQueue.push(billBoard);
    billBoard.triggerEnterAction();
  },
  exitPreviousBillboard: function () {
    if (this.billboardQueue[0]) {
      this.billboardQueue[0].triggerExitAction();
      this.billboardQueue.shift();
    }
  },
  showSyncData: function (texture, textData) {
    cc.log("texture", texture);
    switch (ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.theme.currentValue) {
      case ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.theme.theme.classic: {
        this.updateFlashcardItemImage(texture);
        this.updateWordHolderText(textData);
        break;
      }
      case ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.theme.theme.billboards: {
        this.driveToNextBillboard(texture, textData);
        break;
      }
      case ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.theme.theme.bookOfRhymes: {
        this.turnBookPage(texture);
        break;
      }
      default: {
        throw new Error("current theme is not a valid theme. Please check value of 'currentTheme' key in config file");
      }
    }
  },

  setWordHolder: function (initialLabelString) {
    var wordHolderSprite = this.addSprite(
      ACTIVITY_FLASH_CARDS_1.resourcePath +
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.wordHolderTeacher.imageName,
      cc.p(
        HDAppManager.isTeacherView
          ? ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.wordHolderTeacher.position.x
          : ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.wordHolderStudent.position.x,
        HDAppManager.isTeacherView
          ? ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.wordHolderTeacher.position.y
          : ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.wordHolderStudent.position.y
      ),
      this
    );
    wordHolderSprite.setTag(this.wordHolderTag);
    wordHolderSprite.setLocalZOrder(1);
    wordHolderSprite.setVisible(this.state >= 0);

    var label = this.createTTFLabel(
      initialLabelString,
      ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.wordLabelteacher.font,
      ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.wordLabelteacher.fontSize,
      cc.color(
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.wordLabelteacher.color.r,
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.wordLabelteacher.color.g,
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.wordLabelteacher.color.b,
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.wordLabelteacher.color.a
      ),
      cc.p(
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.wordLabelStudent.position.x,
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.wordLabelStudent.position.y
      ),
      wordHolderSprite
    );
    label.setTag(this.selectedFlashCardItemLabelTag);
  },
  onEnter: function () {
    this._super();
  },
  onExit: function () {},
});

// ========================== Teacher view ===============================
ACTIVITY_FLASH_CARDS_1.TeacherViewLayer = ACTIVITY_FLASH_CARDS_1.CommonFlashCardsLayer.extend({
  sideBottomBar_X_position: 0,
  maxSideBottomBarWidth: 0,
  visibleFlashCardItemsCount: 6,
  selectedFlashCardItemIdx: -1,
  selectedFlashCardItemSpriteTag: 100,
  selectedFlashCardItemLabelTag: 101,
  selectedFlashCardItemLabelContainerTag: 102,
  tableViewTag: 102,
  tableViewContainerTag: 103,
  sideBarItems: [],
  ctor: function (state) {
    this._super(state);
    this.sideBottomBar_X_position = cc.winSize.width * 0.18;
    this.maxSideBottomBarWidth = cc.winSize.width * 0.65;
    ACTIVITY_FLASH_CARDS_1.teacherViewLayerRef = this;
    this.selectedFlashCardItemIdx = state;
    this.sideBarItems =
      ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.theme.currentValue ===
      ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.theme.theme.bookOfRhymes
        ? ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.bookOfRhymesItems.data
        : ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.carouselAssets.data;
    this.createUI();
  },
  createUI: function () {
    this.addBottomSideBar(); // contains flash card items
  },
  onNotificationReceived: function () {},
  mouseControlEnable: function (location) {
    let tableView = this.getChildByTag(this.tableViewContainerTag).getChildByTag(this.tableViewTag);
    let loc = tableView.convertToNodeSpace(location);
    if (tableView && cc.rectContainsPoint(tableView.getBoundingBox(), loc)) {
      return true;
    } else {
      return false;
    }
  },
  addBottomSideBar: function () {
    var x_position = this.sideBottomBar_X_position;
    var width = this.maxSideBottomBarWidth;
    if (this.sideBarItems.length < this.visibleFlashCardItemsCount) {
      width = (this.maxSideBottomBarWidth * this.sideBarItems.length) / this.visibleFlashCardItemsCount;
      x_position = (this.maxSideBottomBarWidth - width) / 2 + this.sideBottomBar_X_position;
    }
    var tableViewBackgroundColorLayer = new cc.LayerColor(cc.color(0, 0, 0, 0), width, cc.winSize.height * 0.15);
    tableViewBackgroundColorLayer.setPosition(cc.p(x_position, cc.winSize.height * 0));
    tableViewBackgroundColorLayer.setTag(this.tableViewContainerTag);

    var tableViewBgSprite = this.addSprite(
      ACTIVITY_FLASH_CARDS_1.resourcePath +
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.carouselBackground.imageName,
      cc.p(0, 0),
      tableViewBackgroundColorLayer
    );
    tableViewBgSprite.setLocalZOrder(-1);
    tableViewBgSprite.setScale(
      width / tableViewBgSprite.getContentSize().width,
      (cc.winSize.height * 0.15) / tableViewBgSprite.getContentSize().height
    );
    tableViewBgSprite.setAnchorPoint(0, 0);

    var tableView = new cc.TableView(this, cc.size(width, cc.winSize.height * 0.15));
    this.tableViewRef = tableView;
    tableView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
    tableView.setAnchorPoint(cc.p(0, 0));
    tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
    tableView.setDelegate(this);
    tableView.setBounceable(false);
    tableView.setTag(this.tableViewTag);
    tableViewBackgroundColorLayer.addChild(tableView);
    this.addChild(tableViewBackgroundColorLayer, 2);
  },
  tableCellSizeForIndex: function (table, idx) {
    return cc.size(
      table.width /
        (this.sideBarItems.length < this.visibleFlashCardItemsCount
          ? this.sideBarItems.length
          : this.visibleFlashCardItemsCount),
      table.height
    );
  },
  tableCellAtIndex: function (table, idx) {
    var cell = table.dequeueCell();
    var cellSize = this.tableCellSizeForIndex(table, idx);
    if (cell) {
      cell.removeAllChildren(true);
    } else {
      cell = new ACTIVITY_FLASH_CARDS_1.FlashCardItem();
    }
    cell.createItem(this.sideBarItems[idx], cellSize, this.selectedFlashCardItemIdx === idx);
    return cell;
  },
  numberOfCellsInTableView: function (table) {
    return this.sideBarItems.length;
  },
  tableCellTouched: function (table, cell) {
    var previouslySelectedFlashCardItemIdx = this.selectedFlashCardItemIdx;
    if (previouslySelectedFlashCardItemIdx !== cell.getIdx() && this.canSelectNextItem) {
      this.selectedFlashCardItemIdx = cell.getIdx();
      if (
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.theme.currentValue ===
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.theme.theme.bookOfRhymes
      ) {
        this.showSyncData(this.sideBarItems[cell.getIdx()]);
      } else {
        this.showSyncData(this.sideBarItems[cell.getIdx()].imageName, this.sideBarItems[cell.getIdx()].label);
      }

      // highlight touched cell
      this.getChildByTag(this.tableViewContainerTag).getChildByTag(this.tableViewTag).updateCellAtIndex(cell.getIdx());
      // unhighlight previously selected cell
      if (previouslySelectedFlashCardItemIdx >= 0) {
        this.getChildByTag(this.tableViewContainerTag)
          .getChildByTag(this.tableViewTag)
          .updateCellAtIndex(previouslySelectedFlashCardItemIdx);
      }

      // emit socket event
      SocketManager.emitCutomEvent(
        ACTIVITY_FLASH_CARDS_1.socketEventKey.singleEvent,
        {
          eventType: ACTIVITY_FLASH_CARDS_1.teacherEvents.FLASH_CARDS_NEXT_ITEM,
          roomId: HDAppManager.roomId,
          data: this.sideBarItems[cell.getIdx()],
        },

        () => undefined
      );

      // updated update room data
      SocketManager.emitCutomEvent(
        ACTIVITY_FLASH_CARDS_1.socketEventKey.singleEvent,
        {
          eventType: HDSocketEventType.UPDATE_ROOM_DATA,
          roomId: HDAppManager.roomId,
          data: {
            roomId: HDAppManager.roomId,
            roomData: {
              activity: ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.properties.namespace,
              data: this.selectedFlashCardItemIdx,
            },
          },
        },
        null
      );
    }
  },
  reloadTable: function () {
    var tableView = this.getChildByTag(this.tableViewContainerTag).getChildByTag(this.tableViewTag);
    if (tableView) {
      tableView.reloadData();
    }
  },

  onEnter: function () {
    this._super();
    // updated update room data
    SocketManager.emitCutomEvent(
      ACTIVITY_FLASH_CARDS_1.socketEventKey.singleEvent,
      {
        eventType: HDSocketEventType.UPDATE_ROOM_DATA,
        roomId: HDAppManager.roomId,
        data: {
          roomId: HDAppManager.roomId,
          roomData: {
            activity: ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.properties.namespace,
            data: this.selectedFlashCardItemIdx,
            activityStartTime: HDAppManager.getActivityStartTime(),
          },
        },
      },
      null
    );
  },
  onExit: function () {},
});

// ========================== Flashcard item cell ===============================
ACTIVITY_FLASH_CARDS_1.FlashCardItem = cc.TableViewCell.extend({
  ctor: function () {
    this._super();
  },
  createItem: function (item, cellSize, isSelected) {
    var r, g, b, a;
    if (isSelected) {
      r = ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.carouselItemHighlighted.color.r;
      g = ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.carouselItemHighlighted.color.g;
      b = ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.carouselItemHighlighted.color.b;
      a = ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.carouselItemHighlighted.color.a;
    } else {
      r = 0;
      g = 0;
      b = 0;
      a = 0;
    }

    var itemBgColorLayer = new cc.LayerColor(new cc.Color(r, g, b, a), cellSize.width * 0.9, cellSize.height * 0.9);
    var itemBgSprite = new cc.Sprite(
      ACTIVITY_FLASH_CARDS_1.resourcePath +
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.carouselForeground.imageName
    );
    itemBgSprite.setScale(
      (cellSize.width * 0.9) / itemBgSprite.getContentSize().width,
      (cellSize.height * 0.9) / itemBgSprite.getContentSize().height
    );
    itemBgSprite.setPosition(cc.p(itemBgColorLayer.width * 0.5, itemBgColorLayer.height * 0.5));
    itemBgSprite.setLocalZOrder(-1);
    itemBgColorLayer.setPosition(
      cc.p((cellSize.width - itemBgColorLayer.width) / 2, (cellSize.height - itemBgColorLayer.height) / 2)
    );
    itemBgColorLayer.addChild(itemBgSprite);
    var itemSpriteRef = ACTIVITY_FLASH_CARDS_1.teacherViewLayerRef.addSprite(
      ACTIVITY_FLASH_CARDS_1.resourcePath + item.imageName,
      cc.p(itemBgColorLayer.getContentSize().width * 0.5, itemBgColorLayer.getContentSize().height * 0.5),
      itemBgColorLayer
    );
    itemSpriteRef.setScale(
      (itemBgColorLayer.getContentSize().width * 0.85) / itemSpriteRef.getContentSize().width,
      (itemBgColorLayer.getContentSize().height * 0.85) / itemSpriteRef.getContentSize().height
    );
    var itemNameColorLayer = ACTIVITY_FLASH_CARDS_1.teacherViewLayerRef.createColourLayer(
      new cc.Color(
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.carouselItemLabelBackground.color.r,
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.carouselItemLabelBackground.color.g,
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.carouselItemLabelBackground.color.b,
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.carouselItemLabelBackground.color.a
      ),
      itemBgColorLayer.getContentSize().width,
      itemBgColorLayer.getContentSize().height * 0.25,
      cc.p(0, itemBgColorLayer.getContentSize().height * 0.8),
      itemBgColorLayer,
      2
    );
    ACTIVITY_FLASH_CARDS_1.teacherViewLayerRef.createTTFLabel(
      item.label,
      ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.carouselItemLabel.font,
      ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.carouselItemLabel.fontSize,
      cc.color(
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.carouselItemLabel.color.r,
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.carouselItemLabel.color.g,
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.carouselItemLabel.color.b,
        ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.carouselItemLabel.color.a
      ),
      cc.p(itemNameColorLayer.getContentSize().width * 0.5, itemNameColorLayer.getContentSize().height * 0.5),
      itemNameColorLayer
    );
    this.addChild(itemBgColorLayer);
  },
});
// ========================== Student view ===============================
ACTIVITY_FLASH_CARDS_1.StudentViewLayer = ACTIVITY_FLASH_CARDS_1.CommonFlashCardsLayer.extend({
  ctor: function (state) {
    this._super(state);
  },
  onNotificationReceived: function (event) {
    const { eventType, data } = event;
    switch (eventType) {
      case ACTIVITY_FLASH_CARDS_1.teacherEvents.FLASH_CARDS_NEXT_ITEM: {
        if (
          ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.theme.currentValue ===
          ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.config.assets.sections.theme.theme.bookOfRhymes
        ) {
          this.showSyncData(data);
        } else {
          this.showSyncData(data.imageName, data.label);
        }

        break;
      }
      default: {
        return;
      }
    }
  },
  onEnter: function () {
    this._super();
  },
  onExit: function () {},
});

// ========================== Main Layer ===============================

ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayer = cc.Layer.extend({
  isTeacher: null,
  notificationDelegate: null,
  state: undefined,
  self: null,
  config: null,
  teacherViewRef: null,
  ctor: function () {
    this._super();
    var self = this;
    let activityName = "ACTIVITY_FLASH_CARDS_1";
    ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef = this;
    cc.loader.loadJson("res/Activity/" + activityName + "/config.json", function (error, data) {
      self.config = data;
      ACTIVITY_FLASH_CARDS_1.resourcePath = "res/Activity/" + "" + activityName + "/res/Sprite/";
      ACTIVITY_FLASH_CARDS_1.soundPath = "res/Activity/" + "" + activityName + "/res/Sound/";
      ACTIVITY_FLASH_CARDS_1.animationPath = "res/Activity/" + activityName + "/res/AnimationFrames/";
      self.isTeacher = HDAppManager.isTeacherView; //get user token to determine whether user is teacher or student
      if (self.isTeacher) {
        var teacherViewLayer = new ACTIVITY_FLASH_CARDS_1.TeacherViewLayer(self.state);
        self.notificationDelegate = teacherViewLayer;
        self.teacherViewRef = teacherViewLayer;
        self.addChild(teacherViewLayer);
      } else {
        var studentViewLayer = new ACTIVITY_FLASH_CARDS_1.StudentViewLayer(self.state);
        self.notificationDelegate = studentViewLayer;
        self.addChild(studentViewLayer);
      }
      self.connectSocket();
    });
  },
  connectSocket: function () {
    if (SocketManager.socket === null || !SocketManager.isSocketConnected()) {
      SocketManager.connect();
    }
  },

  socketListener: function (event) {
    if (this.notificationDelegate) this.notificationDelegate.onNotificationReceived(event);
  },

  mouseControlEnable: function (location) {
    if (this.teacherViewRef) return this.teacherViewRef.mouseControlEnable(location);
  },

  syncData: function (data) {
    ACTIVITY_FLASH_CARDS_1.MainFlashCardsLayerRef.state = data;
  },

  onEnter: function () {
    this._super();
  },
  onExit: function () {},
});
