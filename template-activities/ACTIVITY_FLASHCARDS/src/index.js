// NameSpace for this activity
var Flashcards = {};

// socket events
/*
note:-
events mentioned in teacherEvents are emitted from teacher side and should be subscribed from student side.
Similarly events mentioned in studentEvents are emitted from student side and should be subscribed from teacher side
 */
Flashcards.socketEventKey = {
  singleEvent: "SingleEvent",
};
Flashcards.teacherEvents = {
  FLASH_CARDS_NEXT_ITEM: 6,
};
Flashcards.studentEvents = {};

Flashcards.SubscriptionNotification = cc.Class.extend({
  onNotificationReceived: function (event) {
    const { eventType, data } = event;
  },
});

// ========================== BookPage ===============================
Flashcards.BookPage = cc.Sprite.extend({
  displayImage: undefined,
  displayWord: "",
  displayImageTag: 1,
  displayWordTag: 2,
  ctor: function (
      backgroundImage,
      displayImage,
      displayWord,
      displayWordPosition,
      font,
      fontSize,
      color
  ) {
    this._super(backgroundImage);
    this.displayImage = displayImage;
    this.displayWord = displayWord;
    this.addDisplayImage();
    this.addWordLabel(displayWordPosition, font, fontSize, color);
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

  onExit: function () {},
});

// ========================== Book (with node grid and pageTurn3D action) ===============================
Flashcards.Book = cc.Node.extend({
  nodeGridTag: 1,
  currentPageTag: 2,
  nextPageTag: 3,
  animationQueue: [],
  isAnimationRunning: false,
  sound: undefined,
  ctor: function (
      backgroundImage,
      displayImage,
      text,
      textPos,
      font,
      fontSize,
      color,
      sound
  ) {
    this._super();
    this.setContentSize(cc.size(cc.winSize.width, cc.winSize.height));
    this.sound = sound;
    this._addPages(
        backgroundImage,
        displayImage,
        text,
        textPos,
        font,
        fontSize,
        color
    );
  },
  _addPages: function (
      backgroundImage,
      displayImage,
      text,
      textPos,
      font,
      fontSize,
      color
  ) {
    var currentPage = new Flashcards.BookPage(
        backgroundImage,
        displayImage,
        text,
        textPos,
        font,
        fontSize,
        color
    );
    currentPage.setPosition(cc.p(this.width * 0.5, this.height * 0.5));
    currentPage.setTag(this.currentPageTag);
    var nextPage = new Flashcards.BookPage(
        backgroundImage,
        displayImage,
        text,
        textPos,
        font,
        fontSize,
        color
    );
    nextPage.setTag(this.nextPageTag);
    nextPage.setPosition(cc.p(this.width * 0.5, this.height * 0.5));
    var nodeGrid = new cc.NodeGrid();
    nodeGrid.setTag(this.nodeGridTag);
    nodeGrid.setTarget(currentPage);
    this.addChild(nodeGrid, 1);
    this.addChild(currentPage, 2);
    this.addChild(nextPage, 0);
  },
  turnPage: function (image, word) {
    this.animationQueue.push({ image: image, word: word });
    this._runPageTurnAction();
  },
  _runPageTurnAction: function () {
    if (!this.isAnimationRunning) {
      this.isAnimationRunning = true;
      cc.audioEngine.playEffect(this.sound);
      let currentPage = this.getChildByTag(this.currentPageTag);
      let nextPage = this.getChildByTag(this.nextPageTag);
      currentPage.setDisplayImage(nextPage.getDisplayImage());
      currentPage.setDisplayWord(nextPage.getDisplayWord());
      nextPage.setDisplayImage(this.animationQueue[0].image);
      nextPage.setDisplayWord(this.animationQueue[0].word);
      this.getChildByTag(this.nodeGridTag).runAction(
          cc.sequence(
              cc.pageTurn3D(1, cc.size(16, 12)),
              cc.callFunc(() => {
                this.isAnimationRunning = false;
                this.animationQueue.shift();
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
Flashcards.BillboardSprite = cc.Sprite.extend({
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
    this.setPosition(
        cc.p(
            this.getContentSize().width * 0.5 + parent.getContentSize().width,
            billboardYPosition
        )
    );
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
    displayImageSprite.setScaleY(
        (this.height * 0.43) / displayImageSprite.height
    );
    displayImageSprite.setPosition(pos);
    this.addChild(displayImageSprite, 1);
  },
  triggerEnterAction: function () {
    var enterAction = cc.moveTo(
        this.duration,
        cc.p(this.parentRef.getContentSize().width * 0.5, this.yPosition)
    );
    this.runAction(
        cc.sequence(
            enterAction,
            cc.callFunc(this.onEnterActionOver, this.parentRef)
        )
    );
    cc.audioEngine.playEffect(this.sound);
  },
  triggerExitAction: function () {
    var exitAction = cc.moveTo(
        this.duration,
        cc.p(-this.getContentSize().width * 0.5, this.yPosition)
    );
    this.runAction(
        cc.sequence(exitAction, cc.callFunc(this._exitCleanup, this))
    );
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
Flashcards.CommonFlashCardsLayer = HDBaseLayer.extend({
  bookTag: 1,
  billboardQueue: [],
  canSelectNextItem: true,
  selectedFlashCardItemSpriteTag: 2,
  selectedFlashCardItemLabelTag: 3,
  wordHolderTag: 4,
  state: undefined, // it is idx, see to it it's not null
  ctor: function (state) {
    this._super();
    Flashcards.CommonFlashCardsLayerRef = this;
    this.state = state;
    this.setUpCommonUI();
    if (
        state >= 0 &&
        Flashcards.MainFlashCardsLayerRef.config.assets.sections.theme.currentValue ===
        Flashcards.MainFlashCardsLayerRef.config.assets.sections.theme.theme.billboards
    ) {
      this.driveToNextBillboard(
          Flashcards.MainFlashCardsLayerRef.config.assets.sections.carouselAssets.data[
              state
              ].imageName,
          Flashcards.MainFlashCardsLayerRef.config.assets.sections.carouselAssets.data[
              state
              ].label
      );
    } else if (
        state >= 0 &&
        Flashcards.MainFlashCardsLayerRef.config.assets.sections.theme.currentValue ===
        Flashcards.MainFlashCardsLayerRef.config.assets.sections.theme.theme.bookOfRhymes
    ) {
      this.turnBookPage(
          Flashcards.MainFlashCardsLayerRef.config.assets.sections.carouselAssets.data[
              state
              ].imageName,
          Flashcards.MainFlashCardsLayerRef.config.assets.sections.carouselAssets.data[
              state
              ].label
      );
    }
  },
  setUpCommonUI: function () {
    this.addBackground();
    if (
        Flashcards.MainFlashCardsLayerRef.config.assets.sections.theme.currentValue !==
        Flashcards.MainFlashCardsLayerRef.config.assets.sections.theme.theme.bookOfRhymes
    ) {
      this.setWordHolder(
          this.state >= 0
              ? Flashcards.MainFlashCardsLayerRef.config.assets.sections.carouselAssets.data[this.state].label
              : ""
      );
    } else {
      // for book of rhymes show only label for now ,
    }
    if (
        Flashcards.MainFlashCardsLayerRef.config.assets.sections.theme.currentValue ===
        Flashcards.MainFlashCardsLayerRef.config.assets.sections.theme.theme.classic
    ) {
      this.renderInitialSelectedFlashcardItem();
    }
  },
  addBackground: function () {
    if (
        Flashcards.MainFlashCardsLayerRef.config.assets.sections.theme.currentValue ===
        Flashcards.MainFlashCardsLayerRef.config.assets.sections.theme.theme.bookOfRhymes
    ) {
      var book = new Flashcards.Book(
          Flashcards.resourcePath +
          Flashcards.MainFlashCardsLayerRef.config.background.sections.background
              .imageName,
          undefined,
          "",
          cc.p(
              HDAppManager.isTeacherView
                  ? Flashcards.MainFlashCardsLayerRef.config.assets.sections
                      .BookOfRhymesWordLabel.teacher.position.x
                  : Flashcards.MainFlashCardsLayerRef.config.assets.sections
                      .BookOfRhymesWordLabel.student.position.x,
              HDAppManager.isTeacherView
                  ? Flashcards.MainFlashCardsLayerRef.config.assets.sections
                      .BookOfRhymesWordLabel.teacher.position.y
                  : Flashcards.MainFlashCardsLayerRef.config.assets.sections
                      .BookOfRhymesWordLabel.student.position.y
          ),
          Flashcards.MainFlashCardsLayerRef.config.assets.sections.BookOfRhymesWordLabel.font,
          Flashcards.MainFlashCardsLayerRef.config.assets.sections.BookOfRhymesWordLabel.fontSize,
          cc.color(
              Flashcards.MainFlashCardsLayerRef.config.assets.sections
                  .BookOfRhymesWordLabel.color.r,
              Flashcards.MainFlashCardsLayerRef.config.assets.sections
                  .BookOfRhymesWordLabel.color.g,
              Flashcards.MainFlashCardsLayerRef.config.assets.sections
                  .BookOfRhymesWordLabel.color.b,
              Flashcards.MainFlashCardsLayerRef.config.assets.sections
                  .BookOfRhymesWordLabel.color.a
          ),
          Flashcards.soundPath +
          Flashcards.MainFlashCardsLayerRef.config.assets.sections.swipe.sound
      );
      book.setTag(this.bookTag);
      this.addChild(book);
      book.setLocalZOrder(-1);
    } else {
      var bgSpriteRef = this.setBackground(
          Flashcards.resourcePath +
          Flashcards.MainFlashCardsLayerRef.config.background.sections.background
              .imageName
      );
      bgSpriteRef.setLocalZOrder(-1);
    }
  },
  renderInitialSelectedFlashcardItem: function () {

    var selectedFlashCardItemSprite = this.addSprite(
        Flashcards.resourcePath +
        Flashcards.MainFlashCardsLayerRef.config.assets.sections.carouselAssets.data[
            this.state >= 0 ? this.state : 0
            ].imageName,
        cc.p(
            this.getContentSize().width * 0.5,
            this.getContentSize().height * 0.5
        ),
        this
    );
    selectedFlashCardItemSprite.setVisible(this.state >= 0);
    selectedFlashCardItemSprite.setTag(this.selectedFlashCardItemSpriteTag);
  },

  updateFlashcardItemImage: function (image) {
    var sprite = this.getChildByTag(this.selectedFlashCardItemSpriteTag);
    sprite.setTexture(Flashcards.resourcePath + image);
    sprite.setVisible(true);
  },

  updateWordHolderText: function (text) {
    var wordHolderSprite = this.getChildByTag(this.wordHolderTag);
    var label = wordHolderSprite.getChildByTag(
        this.selectedFlashCardItemLabelTag
    );
    label.setString(text);
    wordHolderSprite.setVisible(true);
  },

  turnBookPage: function (image, word) {
    this.getChildByTag(this.bookTag).turnPage(
        Flashcards.resourcePath + image,
        word
    );
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
    var billBoard = new Flashcards.BillboardSprite(
        this,
        Flashcards.resourcePath +
        Flashcards.MainFlashCardsLayerRef.config.assets.sections.billboard
            .imageName,
        Flashcards.resourcePath + imageName,
        Flashcards.MainFlashCardsLayerRef.config.assets.sections.billboard.position.y,
        0.5,
        () => this.onBillboardEnterd(word),
        Flashcards.soundPath +
        Flashcards.MainFlashCardsLayerRef.config.assets.sections.swipe.sound,
        cc.p(
            Flashcards.MainFlashCardsLayerRef.config.assets.sections
                .billboardDisplayImage.animationPath[0],
            Flashcards.MainFlashCardsLayerRef.config.assets.sections
                .billboardDisplayImage.animationPath[1]
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
    switch (Flashcards.MainFlashCardsLayerRef.config.assets.sections.theme.currentValue) {
      case Flashcards.MainFlashCardsLayerRef.config.assets.sections.theme.theme.classic: {
        this.updateFlashcardItemImage(texture);
        this.updateWordHolderText(textData);
        break;
      }
      case Flashcards.MainFlashCardsLayerRef.config.assets.sections.theme.theme.billboards: {
        this.driveToNextBillboard(texture, textData);
        break;
      }
      case Flashcards.MainFlashCardsLayerRef.config.assets.sections.theme.theme.bookOfRhymes: {
        this.turnBookPage(texture, textData);
        break;
      }
      default: {
        throw new Error(
            "current theme is not a valid theme. Please check value of 'currentTheme' key in config file"
        );
      }
    }
  },
  setWordHolder: function (initialLabelString) {
    var wordHolderSprite = this.addSprite(
        Flashcards.resourcePath +
        Flashcards.MainFlashCardsLayerRef.config.assets.sections.wordHolderTeacher
            .imageName,
        cc.p(
            HDAppManager.isTeacherView
                ? Flashcards.MainFlashCardsLayerRef.config.assets.sections.wordHolderTeacher.position.x
                : Flashcards.MainFlashCardsLayerRef.config.assets.sections.wordHolderStudent.position.x,
            HDAppManager.isTeacherView
                ? Flashcards.MainFlashCardsLayerRef.config.assets.sections.wordHolderTeacher.position.y
                : Flashcards.MainFlashCardsLayerRef.config.assets.sections.wordHolderStudent.position.y
        ),
        this
    );
    wordHolderSprite.setTag(this.wordHolderTag);
    wordHolderSprite.setLocalZOrder(1);
    wordHolderSprite.setVisible(this.state >= 0);

    var label = this.createTTFLabel(
        initialLabelString,
        Flashcards.MainFlashCardsLayerRef.config.assets.sections.wordLabelteacher.font,
        Flashcards.MainFlashCardsLayerRef.config.assets.sections.wordLabelteacher.fontSize,
        cc.color(
            Flashcards.MainFlashCardsLayerRef.config.assets.sections.wordLabelteacher.color.r,
            Flashcards.MainFlashCardsLayerRef.config.assets.sections.wordLabelteacher.color.g,
            Flashcards.MainFlashCardsLayerRef.config.assets.sections.wordLabelteacher.color.b,
            Flashcards.MainFlashCardsLayerRef.config.assets.sections.wordLabelteacher.color.a
        ),
        cc.p(
            Flashcards.MainFlashCardsLayerRef.config.assets.sections.wordLabelStudent.position.x,
            Flashcards.MainFlashCardsLayerRef.config.assets.sections.wordLabelStudent.position.y
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
Flashcards.TeacherViewLayer = Flashcards.CommonFlashCardsLayer.extend({
  sideBottomBar_X_position: 0,
  maxSideBottomBarWidth: 0,
  visibleFlashCardItemsCount: 6,
  selectedFlashCardItemIdx: -1,
  selectedFlashCardItemSpriteTag: 100,
  selectedFlashCardItemLabelTag: 101,
  selectedFlashCardItemLabelContainerTag: 102,
  tableViewTag: 102,
  tableViewContainerTag: 103,
  ctor: function (state) {
    this._super(state);
    this.sideBottomBar_X_position = cc.winSize.width * 0.18;
    this.maxSideBottomBarWidth = cc.winSize.width * 0.65;
    Flashcards.teacherViewLayerRef = this;
    this.selectedFlashCardItemIdx = state;
    this.createUI();
  },
  createUI: function () {
    this.addBottomSideBar(); // contains flash card items
  },
  onNotificationReceived: function () {},
  mouseControlEnable: function (location) {
    let tableView = this.getChildByTag(
        this.tableViewContainerTag
    ).getChildByTag(this.tableViewTag);
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
    if (
        Flashcards.MainFlashCardsLayerRef.config.assets.sections.carouselAssets.data
            .length < this.visibleFlashCardItemsCount
    ) {
      width =
          (this.maxSideBottomBarWidth *
              Flashcards.MainFlashCardsLayerRef.config.assets.sections.carouselAssets.data.length) /
          this.visibleFlashCardItemsCount;
      x_position =
          (this.maxSideBottomBarWidth - width) / 2 +
          this.sideBottomBar_X_position;
    }
    var tableViewBackgroundColorLayer = new cc.LayerColor(
        cc.color(0, 0, 0, 0),
        width,
        cc.winSize.height * 0.15
    );
    tableViewBackgroundColorLayer.setPosition(
        cc.p(x_position, cc.winSize.height * 0)
    );
    tableViewBackgroundColorLayer.setTag(this.tableViewContainerTag);

    var tableViewBgSprite = this.addSprite(
        Flashcards.resourcePath +
        Flashcards.MainFlashCardsLayerRef.config.assets.sections
            .carouselBackground.imageName,
        cc.p(0, 0),
        tableViewBackgroundColorLayer
    );
    tableViewBgSprite.setLocalZOrder(-1);
    tableViewBgSprite.setScale(
        width / tableViewBgSprite.getContentSize().width,
        (cc.winSize.height * 0.15) / tableViewBgSprite.getContentSize().height
    );
    tableViewBgSprite.setAnchorPoint(0, 0);

    var tableView = new cc.TableView(
        this,
        cc.size(width, cc.winSize.height * 0.15)
    );
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
        (Flashcards.MainFlashCardsLayerRef.config.assets.sections.carouselAssets.data
            .length < this.visibleFlashCardItemsCount
            ? Flashcards.MainFlashCardsLayerRef.config.assets.sections.carouselAssets.data.length
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
      cell = new Flashcards.FlashCardItem();
    }
    cell.createItem(
        Flashcards.MainFlashCardsLayerRef.config.assets.sections.carouselAssets.data[
            idx
            ],
        cellSize,
        this.selectedFlashCardItemIdx === idx
    );
    return cell;
  },
  numberOfCellsInTableView: function (table) {
    return Flashcards.MainFlashCardsLayerRef.config.assets.sections.carouselAssets.data.length;
  },
  tableCellTouched: function (table, cell) {
    var previouslySelectedFlashCardItemIdx = this.selectedFlashCardItemIdx;
    if (
        previouslySelectedFlashCardItemIdx !== cell.getIdx() &&
        this.canSelectNextItem
    ) {
      this.selectedFlashCardItemIdx = cell.getIdx();
      this.showSyncData(
          Flashcards.MainFlashCardsLayerRef.config.assets.sections.carouselAssets.data[
              cell.getIdx()
              ].imageName,
          Flashcards.MainFlashCardsLayerRef.config.assets.sections.carouselAssets.data[
              cell.getIdx()
              ].label
      );
      // highlight touched cell
      this.getChildByTag(this.tableViewContainerTag)
          .getChildByTag(this.tableViewTag)
          .updateCellAtIndex(cell.getIdx());
      // unhighlight previously selected cell
      if (previouslySelectedFlashCardItemIdx >= 0) {
        this.getChildByTag(this.tableViewContainerTag)
            .getChildByTag(this.tableViewTag)
            .updateCellAtIndex(previouslySelectedFlashCardItemIdx);
      }

      // emit socket event
      SocketManager.emitCutomEvent(
          Flashcards.socketEventKey.singleEvent,
          {
            eventType: Flashcards.teacherEvents.FLASH_CARDS_NEXT_ITEM,
            roomId: HDAppManager.roomId,
            data:
                Flashcards.MainFlashCardsLayerRef.config.assets.sections.carouselAssets.data[cell.getIdx()],
          },

          () => undefined

      );

      // updated update room data
      SocketManager.emitCutomEvent(
          Flashcards.socketEventKey.singleEvent,
          {
            eventType: HDSocketEventType.UPDATE_ROOM_DATA,
            roomId: HDAppManager.roomId,
            data: {
              roomId: HDAppManager.roomId,
              roomData: {
                activity:
                Flashcards.MainFlashCardsLayerRef.config.properties.namespace,
                data: this.selectedFlashCardItemIdx,
              },
            },

          },
          null
      );
    }
  },
  reloadTable: function () {
    var tableView = this.getChildByTag(
        this.tableViewContainerTag
    ).getChildByTag(this.tableViewTag);
    if (tableView) {
      tableView.reloadData();
    }
  },

  onEnter: function () {
    this._super();
    // updated update room data
    SocketManager.emitCutomEvent(
        Flashcards.socketEventKey.singleEvent,
        {
          eventType: HDSocketEventType.UPDATE_ROOM_DATA,
          roomId: HDAppManager.roomId,
          data: {
            roomId: HDAppManager.roomId,
            roomData: {
              activity:
              Flashcards.MainFlashCardsLayerRef.config.properties.namespace,
              data: this.selectedFlashCardItemIdx,
              activityStartTime : HDAppManager.getActivityStartTime()
            },
          },
        },
        null
    );
  },
  onExit: function () {},
});

// ========================== Flashcard item cell ===============================
Flashcards.FlashCardItem = cc.TableViewCell.extend({
  ctor: function () {
    this._super();
  },
  createItem: function (item, cellSize, isSelected) {
    var r, g, b, a;
    if (isSelected) {
      r =
          Flashcards.MainFlashCardsLayerRef.config.assets.sections
              .carouselItemHighlighted.color.r;
      g =
          Flashcards.MainFlashCardsLayerRef.config.assets.sections
              .carouselItemHighlighted.color.g;
      b =
          Flashcards.MainFlashCardsLayerRef.config.assets.sections
              .carouselItemHighlighted.color.b;
      a =
          Flashcards.MainFlashCardsLayerRef.config.assets.sections
              .carouselItemHighlighted.color.a;
    } else {
      r = 0;
      g = 0;
      b = 0;
      a = 0;
    }

    var itemBgColorLayer = new cc.LayerColor(
        new cc.Color(r, g, b, a),
        cellSize.width * 0.9,
        cellSize.height * 0.9
    );
    var itemBgSprite = new cc.Sprite(
        Flashcards.resourcePath +
        Flashcards.MainFlashCardsLayerRef.config.assets.sections
            .carouselForeground.imageName
    );
    itemBgSprite.setScale(
        (cellSize.width * 0.9) / itemBgSprite.getContentSize().width,
        (cellSize.height * 0.9) / itemBgSprite.getContentSize().height
    );
    itemBgSprite.setPosition(
        cc.p(itemBgColorLayer.width * 0.5, itemBgColorLayer.height * 0.5)
    );
    itemBgSprite.setLocalZOrder(-1);
    itemBgColorLayer.setPosition(
        cc.p(
            (cellSize.width - itemBgColorLayer.width) / 2,
            (cellSize.height - itemBgColorLayer.height) / 2
        )
    );
    itemBgColorLayer.addChild(itemBgSprite);
    var itemSpriteRef = Flashcards.teacherViewLayerRef.addSprite(
        Flashcards.resourcePath + item.imageName,
        cc.p(
            itemBgColorLayer.getContentSize().width * 0.5,
            itemBgColorLayer.getContentSize().height * 0.5
        ),
        itemBgColorLayer
    );
    itemSpriteRef.setScale(
        (itemBgColorLayer.getContentSize().width * 0.85) /
        itemSpriteRef.getContentSize().width,
        (itemBgColorLayer.getContentSize().height * 0.85) /
        itemSpriteRef.getContentSize().height
    );
    var itemNameColorLayer = Flashcards.teacherViewLayerRef.createColourLayer(
        new cc.Color(
            Flashcards.MainFlashCardsLayerRef.config.assets.sections.carouselItemLabelBackground.color.r,
            Flashcards.MainFlashCardsLayerRef.config.assets.sections.carouselItemLabelBackground.color.g,
            Flashcards.MainFlashCardsLayerRef.config.assets.sections.carouselItemLabelBackground.color.b,
            Flashcards.MainFlashCardsLayerRef.config.assets.sections.carouselItemLabelBackground.color.a
        ),
        itemBgColorLayer.getContentSize().width,
        itemBgColorLayer.getContentSize().height * 0.25,
        cc.p(0, itemBgColorLayer.getContentSize().height * 0.8),
        itemBgColorLayer,
        2
    );
    Flashcards.teacherViewLayerRef.createTTFLabel(
        item.label,
        Flashcards.MainFlashCardsLayerRef.config.assets.sections.carouselItemLabel
            .font,
        Flashcards.MainFlashCardsLayerRef.config.assets.sections.carouselItemLabel
            .fontSize,
        cc.color(
            Flashcards.MainFlashCardsLayerRef.config.assets.sections
                .carouselItemLabel.color.r,
            Flashcards.MainFlashCardsLayerRef.config.assets.sections
                .carouselItemLabel.color.g,
            Flashcards.MainFlashCardsLayerRef.config.assets.sections
                .carouselItemLabel.color.b,
            Flashcards.MainFlashCardsLayerRef.config.assets.sections
                .carouselItemLabel.color.a
        ),
        cc.p(
            itemNameColorLayer.getContentSize().width * 0.5,
            itemNameColorLayer.getContentSize().height * 0.5
        ),
        itemNameColorLayer
    );
    this.addChild(itemBgColorLayer);
  },
});
// ========================== Student view ===============================
Flashcards.StudentViewLayer = Flashcards.CommonFlashCardsLayer.extend({
  ctor: function (state) {
    this._super(state);
  },
  onNotificationReceived: function (event) {
    const { eventType, data } = event;
    switch (eventType) {
      case Flashcards.teacherEvents.FLASH_CARDS_NEXT_ITEM: {
        this.showSyncData(data.imageName, data.label);

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

Flashcards.MainFlashCardsLayer = cc.Layer.extend({
  isTeacher: null,
  notificationDelegate: null,
  state: undefined,
  self: null,
  config: null,
  teacherViewRef: null,
  ctor: function () {
    this._super();
    var self = this;
    let activityName = 'ACTIVITY_FLASHCARDS';
    Flashcards.MainFlashCardsLayerRef = this;
    cc.loader.loadJson(
        "res/Activity/" + activityName + "/config.json",
        function (error, data) {
          self.config = data;
          Flashcards.resourcePath =
              "res/Activity/" + ""+ activityName +  "/res/Sprite/";
          Flashcards.soundPath = "res/Activity/" + ""+ activityName +  "/res/Sound/";
          self.isTeacher = HDAppManager.isTeacherView; //get user token to determine whether user is teacher or student
          if (self.isTeacher) {
            var teacherViewLayer = new Flashcards.TeacherViewLayer(self.state);
            self.notificationDelegate = teacherViewLayer;
            self.teacherViewRef = teacherViewLayer;
            self.addChild(teacherViewLayer);
          } else {
            var studentViewLayer = new Flashcards.StudentViewLayer(self.state);
            self.notificationDelegate = studentViewLayer;
            self.addChild(studentViewLayer);
          }
          self.connectSocket();
        }
    );
  },
  connectSocket: function () {
    if (SocketManager.socket === null || !SocketManager.isSocketConnected()) {
      SocketManager.connect();
    }
  },

  socketListener: function (event) {
    if (this.notificationDelegate)
      this.notificationDelegate.onNotificationReceived(event);
  },

  mouseControlEnable: function (location) {
    if (this.teacherViewRef)
      return this.teacherViewRef.mouseControlEnable(location);
  },

  syncData: function (data) {
    Flashcards.MainFlashCardsLayerRef.state = data;
  },

  onEnter: function () {
    this._super();
  },
  onExit: function () {},
});