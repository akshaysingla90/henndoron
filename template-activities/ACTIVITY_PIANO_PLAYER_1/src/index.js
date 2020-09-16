// NameSpace for this activity
var ACTIVITY_PIANO_PLAYER_1 = {};
ACTIVITY_PIANO_PLAYER_1 = {
  delegate: null, // teacherViewLayerRef / studentViewLayerRef
  resourcePath: "",
  soundPath: "",
};

ACTIVITY_PIANO_PLAYER_1.updateRoomData = {
  songIdx: 0,
  wordIdx: 0,
  feedbackActivated: false,
  studentsAnswers: {},
};

// socket events
/*
note:-
events mentioned in teacherEvents are emitted from teacher side and should be subscribed from student side.
Similarly events mentioned in studentEvents are emitted from student side and should be subscribed from teacher side
 */
ACTIVITY_PIANO_PLAYER_1.socketEventKey = {
  singleEvent: "SingleEvent",
};
ACTIVITY_PIANO_PLAYER_1.teacherEvents = {
  PIANO_PLAYER_NEXT_SONG: "PIANO_PLAYER_NEXT_SONG",
  PIANO_PLAYER_ACTIVATE_FEEDBACK: "PIANO_PLAYER_ACTIVATE_FEEDBACK",
  PIANO_PLAYER_TEACHER_CLICK: "PIANO_PLAYER_TEACHER_CLICK",
  PIANO_PLAYER_NEXT_WORD: "PIANO_PLAYER_NEXT_WORD",
  PIANO_PLAYER_STUDENT_INTERACTION: "PIANO_PLAYER_STUDENT_INTERACTION",
  PIANO_PLAYER_PLAY_SONG: "PIANO_PLAYER_PLAY_SONG",
};
ACTIVITY_PIANO_PLAYER_1.studentEvents = {
  PIANO_PLAYER_STUDENT_CLICK: "PIANO_PLAYER_STUDENT_CLICK",
};

ACTIVITY_PIANO_PLAYER_1.SubscriptionNotification = cc.Class.extend({
  onNotificationReceived: function (event) {
    const { eventType, data } = event;
    const { type } = data;
  },
});

// ========================== PianoKey ===============================
ACTIVITY_PIANO_PLAYER_1.PianoKey = ccui.Button.extend({
  idleImage: "",
  audio: "",
  word: "",
  feedbackDuration: 0.2,
  keyPressedCorrectImage: "",
  keyPressedIncorrectImage: "",
  displayImage: undefined,
  TAG_DISPLAY_IMAGE: 1,
  ctor: function (
    idleImage,
    pressedImage,
    displayImage,
    audio,
    word,
    keyPressedCorrectImage,
    keyPressedIncorrectImage
  ) {
    this._super(idleImage, pressedImage);
    this.idleImage = idleImage;
    this.displayImage = displayImage;
    this.audio = audio;
    this.word = word;
    this.keyPressedCorrectImage = keyPressedCorrectImage;
    this.keyPressedIncorrectImage = keyPressedIncorrectImage;
    this._createUI(displayImage);
  },

  onEnter: function () {
    this._super();
  },

  onExit: function () { },

  _createUI: function (displayImage) {
    let dispImageSprite = new cc.Sprite(displayImage);
    dispImageSprite.setPosition(cc.p(this.width * 0.5, this.height * 0.45));
    dispImageSprite.setScale(
      64 / dispImageSprite.width,
      64 / dispImageSprite.height
    );
    dispImageSprite.setTag(this.TAG_DISPLAY_IMAGE);
    this.addChild(dispImageSprite, 1);
  },

  playNote: function () {
    cc.audioEngine.playEffect(this.audio);
  },

  getWord: function () {
    return this.word;
  },

  setWord: function (word) {
    this.word = word;
  },

  setDisplayImage: function (displayImage) {
    this.displayImage = displayImage;
    this.getChildByTag(this.TAG_DISPLAY_IMAGE).setTexture(displayImage);
  },

  getDisplayImage: function () {
    return this.displayImage;
  },

  showFeedback: function (flag) {
    this.setTouchEnabled(false);
    this.loadTextureNormal(
      flag ? this.keyPressedCorrectImage : this.keyPressedIncorrectImage
    );
    setTimeout(() => {
      this.loadTextureNormal(this.idleImage);
      this.setTouchEnabled(true);
    }, this.feedbackDuration * 1000);
  },
});

ACTIVITY_PIANO_PLAYER_1.PianoKeyDelegate = cc.Class.extend({
  onPianoKeyClicked: function (pianoKey) {
    // pianoKey being instance of class PianoKey
  },
  onWordClicked: function (idx) { },
});

// ========================== Piano ===============================
ACTIVITY_PIANO_PLAYER_1.Piano = cc.Sprite.extend({
  delegate: null,
  pianoKeyButtons: [],
  TAG_PIANO_KEYS_HOLDER: 1,
  TAG_SHEET_SCROLL_VIEW: 2,
  imagePath: undefined,
  soundPath: undefined,
  keyPressedCorrectImage: undefined,
  keyPressedIncorrectImage: undefined,
  sheetWordsHoizontalSpacing: 48,
  pianoKeysEnabled: true,
  isMusicalFretScrollable: false,
  wordClickedDelegate: null,
  prevSelectedWordIdx: 0,
  sheetWords: [],
  pianoKeyIconImages: [],
  sheetWordsPadding: 10,
  ctor: function (
    bgImage,
    pianoKeys,
    delegate,
    imagePath,
    soundPath,
    keyPressedCorrectImage,
    keyPressedIncorrectImage,
    sheetWords,
    isMusicalFretScrollable,
    wordClickedDelegate,
    pianoKeyIconImages
  ) {
    this._super(bgImage);
    this.delegate = delegate;
    this.imagePath = imagePath;
    this.soundPath = soundPath;
    this.keyPressedCorrectImage = keyPressedCorrectImage;
    this.keyPressedIncorrectImage = keyPressedIncorrectImage;
    this.isMusicalFretScrollable = isMusicalFretScrollable;
    this.sheetWords = sheetWords;
    this.pianoKeyButtons = [];
    this.pianoKeyIconImages = pianoKeyIconImages;
    this._createPianoKeysHolder();
    this._createPianoKeys(pianoKeys, pianoKeyIconImages);
    this._createSheetWordsHolder();
    this._assignHeightToSheetWords();
    this._createSheetWords(sheetWords);
    if (isMusicalFretScrollable) {
      //this._addMouseListener();
    }
    this.wordClickedDelegate = wordClickedDelegate;
  },

  onEnter: function () {
    this._super();
  },

  onExit: function () { },

  _assignHeightToSheetWords: function () {
    let containerHeight = this.getChildByTag(
      this.TAG_SHEET_SCROLL_VIEW
    ).getViewSize().height;
    this.pianoKeyIconImages.map(
      (item, idx) =>
        (item.height = cc.lerp(
          0,
          containerHeight * 0.5 - this.sheetWordsPadding,
          idx / this.pianoKeyIconImages.length
        ))
    );
  },

  // _addMouseListener: function () {
  //   if (cc.sys.capabilities.hasOwnProperty("mouse")) {
  //     let self = this;
  //     cc.eventManager.addListener(
  //       {
  //         event: cc.EventListener.MOUSE,
  //         onMouseDown: function (event) {
  //           if (event.getButton() === cc.EventMouse.BUTTON_LEFT) {
  //             if (self.isMusicalFretScrollable)
  //               self._onWordClicked(event.getLocation());
  //           }
  //         },
  //       },
  //       this
  //     );
  //   }
  // },

  _onWordClicked: function (location) {
    location = this.convertToNodeSpace(location);
    let scrollView = this.getChildByTag(this.TAG_SHEET_SCROLL_VIEW);
    cc.pSubIn(
      location,
      cc.p(scrollView.getPosition().x, scrollView.getPosition().y)
    );
    cc.pSubIn(location, scrollView.getContentOffset());
    for (let i = 0; i < this.sheetWords.length; ++i) {
      let word = scrollView.getContainer().getChildByTag(i);
      if (cc.rectContainsPoint(word.getBoundingBox(), location)) {
        this.lightUpSheetWord(i);
        if (this.wordClickedDelegate) this.wordClickedDelegate.onWordClicked(i);
        return;
      }
    }
  },

  _createSheetWords: function (sheetWords) {
    let sheetWordsColorLayers = [];
    let innerContainerWidth = 0;
    for (let i = 0; i < sheetWords.length; ++i) {
      let height = this.pianoKeyIconImages.find(
        (item) => sheetWords[i] === item.word
      ).height;
      let label = new cc.LabelTTF(sheetWords[i], HDConstants.Sassoon_Regular, 35);
      label.setVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM);
      label.setColor(HDConstants.Black);
      label.setTag(i);
      let colorLayer = new cc.LayerColor(
        HDConstants.White,
        label.width + this.sheetWordsPadding,
        label.height + this.sheetWordsPadding
      );
      label.setPosition(
        cc.p(this.sheetWordsPadding * 0.5, this.sheetWordsPadding * 0.5)
      );
      label.setAnchorPoint(cc.p(0, 0));
      colorLayer.setUserData(height);
      colorLayer.addChild(label);
      colorLayer.setTag(i);
      innerContainerWidth += colorLayer.width + this.sheetWordsHoizontalSpacing;
      sheetWordsColorLayers.push(colorLayer);
    }
    let scrollView = this.getChildByTag(this.TAG_SHEET_SCROLL_VIEW);
    scrollView.setContentSize(cc.size(innerContainerWidth, this.height * 0.11));
    for (let i = 0; i < sheetWordsColorLayers.length; ++i) {
      let colorLayer = sheetWordsColorLayers[i];
      colorLayer.setPosition(
        cc.p(
          i === 0
            ? 0
            : sheetWordsColorLayers[i - 1].width +
            sheetWordsColorLayers[i - 1].x +
            this.sheetWordsHoizontalSpacing,
          colorLayer.getUserData()
        )
      );
      scrollView.addChild(colorLayer);
    }
  },

  setSheetWords: function (sheetWords) {
    this.sheetWords = sheetWords;
    this._assignHeightToSheetWords();
    this.getChildByTag(this.TAG_SHEET_SCROLL_VIEW)
      .getContainer()
      .removeAllChildren();
    this._createSheetWords(sheetWords);
  },

  _createSheetWordsHolder: function () {
    var layerColor = new cc.LayerColor(
      cc.color(0, 0, 0, 0),
      this.width * 0.46,
      this.height * 0.1
    );
    layerColor.setPosition(cc.p(this.width * 0.32, this.height * 0.675));
    //this.addChild(layerColor);
    var scrollView = new cc.ScrollView(
      cc.size(this.width * 0.46, this.height * 0.1),
      layerColor
    );
    //scrollView.setContentSize(cc.size(this.width * 0.46, this.height * 0.1));
    scrollView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
    scrollView.setTouchEnabled(this.isMusicalFretScrollable);
    scrollView.setBounceable(true);
    scrollView.setPosition(cc.p(this.width * 0.32, this.height * 0.675));
    scrollView.setTag(this.TAG_SHEET_SCROLL_VIEW);
    this.addChild(scrollView, 1);
  },

  setPianoKeys: function (pianoKeys) {
    this.getChildByTag(this.TAG_PIANO_KEYS_HOLDER).removeAllChildrenWithCleanup(
      true
    );
    this._createPianoKeys(pianoKeys);
  },

  // for changing images in circled borders on piano keys in order and also word associated with it
  setDisplayImagesOfPianoKeys: function (
    images = [{ imageName: "", word: "" }]
  ) {
    this.pianoKeyIconImages = images;
    this.getChildByTag(this.TAG_PIANO_KEYS_HOLDER)
      .getChildren()
      .map((pianoKey, idx) => {
        pianoKey.setDisplayImage(this.imagePath + images[idx].imageName);
        pianoKey.setWord(images[idx].word);
        pianoKey.setTag(images[idx].word);
      });
  },

  _createPianoKeysHolder: function () {
    let pianoKeysHolder = new cc.LayerColor(
      cc.color(0, 0, 0, 0),
      this.width * 0.91,
      this.height * 0.265
    );
    pianoKeysHolder.setPosition(cc.p(this.width * 0.045, this.height * 0.185));
    pianoKeysHolder.setTag(this.TAG_PIANO_KEYS_HOLDER);
    this.addChild(pianoKeysHolder, 1);
  },

  _createPianoKeys: function (pianoKeys, pianoKeyIconImages) {
    // let keyWidth = pianoKeysHolder.width / pianoKeys.length;
    let pianoKeysHolder = this.getChildByTag(this.TAG_PIANO_KEYS_HOLDER);
    let h_Padding = pianoKeysHolder.width * 0.0068;
    pianoKeys.map((pianoKey, idx) => {
      let pianoKeyButton = new ACTIVITY_PIANO_PLAYER_1.PianoKey(
        this.imagePath + pianoKey.idleImage,
        this.imagePath + pianoKey.pressedImage,
        this.imagePath + pianoKeyIconImages[idx].imageName,
        this.soundPath + pianoKey.audio,
        pianoKeyIconImages[idx].word,
        this.imagePath + this.keyPressedCorrectImage,
        this.imagePath + this.keyPressedIncorrectImage
      );
      this.pianoKeyButtons.push(pianoKeyButton);
      pianoKeyButton.setAnchorPoint(cc.p(0, 0));
      pianoKeyButton.setTag(pianoKeyIconImages[idx].word);
      pianoKeyButton.addTouchEventListener(this._handleMouseDown, this);
      if (idx === 0) {
        pianoKeyButton.setPosition(cc.p(0, 0));
      } else {
        let prevPianoButton = this.pianoKeyButtons[idx - 1];
        pianoKeyButton.setPosition(
          cc.p(
            prevPianoButton.x +
            prevPianoButton.width * prevPianoButton.scaleX +
            h_Padding,
            0
          )
        );
      }
      pianoKeysHolder.addChild(pianoKeyButton, 1);
    });
  },

  _handleMouseDown: function (sender, type) {
    switch (type) {
      case ccui.Widget.TOUCH_BEGAN: {
        if (this.pianoKeysEnabled) {
          this.delegate.onPianoKeyClicked(sender);
          return;
        }
      }
    }
  },

  lightUpSheetWord: function (idx) {
    let scrollView = this.getChildByTag(this.TAG_SHEET_SCROLL_VIEW);
    let prevItem = scrollView
      .getContainer()
      .getChildByTag(this.prevSelectedWordIdx);
    if (prevItem) {
      prevItem.setColor(HDConstants.White);
      prevItem
        .getChildByTag(this.prevSelectedWordIdx)
        .setColor(HDConstants.Black);
    }
    let item = scrollView.getContainer().getChildByTag(idx);
    item.setColor(cc.color(255, 84, 124, 255));
    item.getChildByTag(idx).setColor(HDConstants.White);
    this._scrollToWord(idx);
    this.prevSelectedWordIdx = idx;
  },

  _scrollToWord: function (idx) {
    let scrollView = this.getChildByTag(this.TAG_SHEET_SCROLL_VIEW);
    let scrollViewContainer = scrollView.getContainer();
    let moveTo = 0;
    for (let i = 0; i < idx; ++i) {
      let item = scrollViewContainer.getChildByTag(i);
      moveTo += item.width + this.sheetWordsHoizontalSpacing;
    }
    scrollView.setContentOffset(cc.p(-moveTo, 0), true);
  },

  isMouseLocationOnPianoKeys: function (worldLocation) {
    let pianoKeysHolder = this.getChildByTag(this.TAG_PIANO_KEYS_HOLDER);
    return cc.rectContainsPoint(
      pianoKeysHolder.getBoundingBox(),
      this.convertToNodeSpace(worldLocation)
    );
  },

  setPianoKeysEnabled: function (flag = true) {
    this.pianoKeysEnabled = flag;
    this.getChildByTag(this.TAG_PIANO_KEYS_HOLDER)
      .getChildren()
      .map((child) => child.setTouchEnabled(flag));
  },
  isPianoKeysEnabled: function () {
    return this.pianoKeysEnabled;
  },

  getPianoKeyByWord: function (word) {
    return this.getChildByTag(this.TAG_PIANO_KEYS_HOLDER).getChildByTag(word);
  },

  // control touch over sheet words
  setMusicFretTouchEnabled: function (flag) {
    this.getChildByTag(this.TAG_SHEET_SCROLL_VIEW).setTouchEnabled(flag);
    this.isMusicalFretScrollable = flag;
  },
});

// ========================== Student ===============================
ACTIVITY_PIANO_PLAYER_1.Student = HDBaseLayer.extend({
  TAG_CLICKED_KEY_IMAGE: 1,
  TAG_FEEDBACK_LAYER_COLOR: 2,
  ctor: function (
    bgImage,
    userName,
    clickedKeyImage,
    font,
    fontSize,
    color,
    isCorrect
  ) {
    this._super(cc.size(75, 75));
    this.setBackground(bgImage);
    this._createNameLabel(userName, font, fontSize, color);
    this._createClickedKeySprite(clickedKeyImage);
    this._createFeedbackColor(isCorrect);
  },

  onEnter: function () {
    this._super();
  },
  onExit: function () { },

  _createClickedKeySprite: function (clickedKeyImage) {
    let sprite = new cc.Sprite(clickedKeyImage);
    sprite.setTag(this.TAG_CLICKED_KEY_IMAGE);
    sprite.setScale(
      (this.width * 0.65) / sprite.width,
      (this.height * 0.65) / sprite.height
    );
    sprite.setPosition(cc.p(this.width * 0.5, this.height * 0.58));
    this.addChild(sprite, 1);
  },

  _createNameLabel: function (userName, font, fontSize, color) {
    var label = new cc.LabelTTF(userName, font, fontSize);
    label.setPosition(cc.p(this.width * 0.5, this.height * 0.1));
    label.setColor(color);
    this.addChild(label);
  },

  _createFeedbackColor: function (isCorrect) {
    let color;
    if (isCorrect === undefined) {
      color = HDConstants.White;
    } else if (isCorrect === true) {
      color = new cc.Color(53, 184, 47, 255);
    } else {
      color = new cc.Color(226, 30, 43, 255);
    }
    let layerColor = new cc.LayerColor(
      color,
      this.width * 0.7,
      this.height * 0.73
    );
    layerColor.setPosition(cc.p(this.width * 0.15, this.height * 0.2));
    layerColor.setTag(this.TAG_FEEDBACK_LAYER_COLOR);
    this.addChild(layerColor, -1);
  },

  setClickedKeyImage: function (clickedKeyImage, isCorrect, noFeedback) {
    let sprite = this.getChildByTag(this.TAG_CLICKED_KEY_IMAGE);
    if (clickedKeyImage === undefined) {
      sprite.setVisible(false);
    } else {
      sprite.setTexture(clickedKeyImage);
      sprite.setVisible(true);
    }
    sprite.setPosition(cc.p(this.width * 0.5, this.height * 0.58));
    sprite.setScale(
      (this.width * 0.65) / sprite.width,
      (this.height * 0.65) / sprite.height
    );
    let feedbackLayerColor = this.getChildByTag(this.TAG_FEEDBACK_LAYER_COLOR);
    if (noFeedback) {
      feedbackLayerColor.setColor(HDConstants.White);
    } else {
      feedbackLayerColor.setColor(
        isCorrect
          ? new cc.Color(53, 184, 47, 255)
          : new cc.Color(226, 30, 43, 255)
      );
    }
  },

  setFeedbackColor: function (color) {
    this.getChildByTag(this.TAG_FEEDBACK_LAYER_COLOR).setColor(
      HDConstants.White
    );
  },
});

// ========================== StudentsList ===============================
ACTIVITY_PIANO_PLAYER_1.StudentsList = HDBaseLayer.extend({
  studentsList: {},
  nextStudent_X_Pos: 0,
  h_padding: 4.8,
  ctor: function (list) {
    this._super();
    this.setStudentsList(list);
  },
  onEnter: function () {
    this._super();
  },
  onExit: function () { },

  setStudentsList: function (list = [{ userId: "", userName: "" }]) {
    // retains previous items
    for (let i = 0; i < list.length; ++i) {
      let student = list[i];
      let studentSprite = this._makeStudent(
        student,
        cc.p(this.nextStudent_X_Pos, 0)
      );
      this.studentsList[student.userName] = studentSprite;
      this.nextStudent_X_Pos =
        studentSprite.x + studentSprite.width + this.h_padding;
    }
  },

  addStudent: function (user = { userName: "", userId: "" }) {
    let studentSprite = this._makeStudent(
      user,
      cc.p(this.nextStudent_X_Pos, 0)
    );
    this.studentsList[user.userName] = studentSprite;
    this.nextStudent_X_Pos =
      studentSprite.x + studentSprite.width + this.h_padding;
  },

  removeStudents: function (userNames = ["userName"]) {
    userNames.map((userName) => {
      this.removeChild(this.studentsList[userName]);
      delete this.studentsList[userName];
    });
    this._repositionItems();
  },

  removeStudent: function (userName) {
    this.removeChild(this.studentsList[userName]);
    delete this.studentsList[userName];
    this._repositionItems();
  },

  _repositionItems: function () {
    this.nextStudent_X_Pos = 0;
    for (let i in this.studentsList) {
      let studentSprite = this.studentsList[i];
      studentSprite.setPosition(cc.p(this.nextStudent_X_Pos, 0));
      this.nextStudent_X_Pos =
        studentSprite.x + studentSprite.width + this.h_padding;
    }
  },

  _makeStudent: function (student, position) {
    const { userName } = student;
    let studentSprite = new ACTIVITY_PIANO_PLAYER_1.Student(
      ACTIVITY_PIANO_PLAYER_1.resourcePath +
      ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.assets.sections
        .student_answer.imageName,
      userName,
      student.displayImage,
      HDConstants.Sassoon_Regular,
      12,
      HDConstants.White,
      student.isCorrect
    );
    studentSprite.setAnchorPoint(cc.p(0, 0));
    studentSprite.setPosition(position);
    this.addChild(studentSprite);
    return studentSprite;
  },

  setClickedKeyImageOfStudent: function (userName, image, isCorrect) {
    this.studentsList[userName].setClickedKeyImage(image, isCorrect);
  },

  clearClickedKeyImagesOfAllStudents: function () {
    for (let i in this.studentsList) {
      let studentSprite = this.studentsList[i];
      studentSprite.setClickedKeyImage(undefined, undefined, true);
    }
  },
});

// ========================== Common Layer for student & teacher ===============================
ACTIVITY_PIANO_PLAYER_1.CommonPianoPlayerLayer = HDBaseLayer.extend({
  isFeedbackActivated: false,
  TAG_PIANO: 1,
  currentNoteIdx: 0,
  currentSongIdx: 0,
  state: null,
  totalCorrect: 0,
  studentAnswers: {},
  songTempo: 425, // in ms,
  songPlayingInterval: null,
  songPlayingCurrentNote: 0,
  ctor: function (delegate, state) {
    this._super();
    this.state = state;
    this.launchInitialSong(delegate);
  },

  onEnter: function () {
    this._super();
  },

  onExit: function () {
    this.currentNoteIdx = 0;
    this.currentSongIdx = 0;
  },

  getCurrentSongIdx: function () {
    return this.currentSongIdx;
  },

  setCurrentSongIdx: function (idx) {
    this.currentSongIdx = idx;
  },

  getCurrentNoteIdx: function () {
    return this.currentNoteIdx;
  },

  setCurrentNoteIdx: function (idx) {
    this.currentNoteIdx = idx;
  },

  getIsFeedbackActivated: function () {
    return this.isFeedbackActivated;
  },

  setIsFeedbackActivated: function (flag) {
    this.isFeedbackActivated = flag;
  },

  makeRoomData: function () {
    return {
      songIdx: this.currentSongIdx,
      wordIdx: this.currentNoteIdx,
      feedbackActivated: this.isFeedbackActivated,
    };
  },

  updateRoomDataFromStudentSide: function (displayImage, isCorrect) {
    this.studentAnswers[HDAppManager.username] = {
      userName: HDAppManager.username,
      displayImage: displayImage,
      isCorrect: isCorrect,
    };
    this.updateRoomData(
      Object.assign(this.makeRoomData(), {
        studentsAnswers: this.studentAnswers,
      })
    );
  },

  setPianoKeysEnabled: function (flag) {
    this.getChildByTag(this.TAG_PIANO).setPianoKeysEnabled(flag);
  },

  isPianoKeysEnabled: function () {
    return this.getChildByTag(this.TAG_PIANO).isPianoKeysEnabled();
  },

  moveToNextWord: function () {
    if (
      this.currentNoteIdx <
      ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.assets.sections.songs.data[
        this.currentSongIdx
      ].correctSequence.length -
      1
    ) {
      ++this.currentNoteIdx;
      this.emitNextWordEvent();
      this.lightUpSheetWord(this.currentNoteIdx);
    }
  },

  launchInitialSong: function (delegate) {
    if (this.state) {
      this.currentSongIdx = this.state.songIdx;
      this.currentNoteIdx = this.state.wordIdx;
      this.isFeedbackActivated = this.state.feedbackActivated;
      this.studentAnswers = this.state.studentsAnswers;
    }
    this.updateRoomData({
      songIdx: this.currentSongIdx,
      wordIdx: this.currentNoteIdx,
      feedbackActivated: this.isFeedbackActivated,
      studentsAnswers: this.studentAnswers,
    });

    this.createPiano(delegate);
  },

  launchNextSong: function () {
    this.currentNoteIdx = 0;
    ++this.currentSongIdx;
    let piano = this.getChildByTag(this.TAG_PIANO);
    piano.setDisplayImagesOfPianoKeys(
      ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.assets.sections.songs.data[
        this.currentSongIdx
      ].pianoKeyIconImages
    );
    piano.setSheetWords(
      ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.assets.sections.songs.data[
        this.currentSongIdx
      ].correctSequence
    );
    this.updateRoomData(this.makeRoomData());
    this.lightUpSheetWord(this.currentNoteIdx);
  },

  onMouseDown: function (event) {
    let piano = this.getChildByTag(this.TAG_PIANO);
    piano._onWordClicked(event.getLocation());

  },

  createPiano: function (delegate) {
    var pianoSprite = new ACTIVITY_PIANO_PLAYER_1.Piano(
      ACTIVITY_PIANO_PLAYER_1.resourcePath +
      ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.background.sections.background
        .imageName,
      ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.assets.sections.pianoKeys.data,
      delegate,
      ACTIVITY_PIANO_PLAYER_1.resourcePath,
      ACTIVITY_PIANO_PLAYER_1.soundPath,
      ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.assets.sections.keyPressedCorrectImage.imageName,
      ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.assets.sections.keyPressedIncorrectImage.imageName,
      ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.assets.sections.songs.data[
        this.currentSongIdx
      ].correctSequence,
      HDAppManager.isTeacherView,
      delegate,
      ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.assets.sections.songs.data[
        this.currentSongIdx
      ].pianoKeyIconImages
    );
    pianoSprite.setPosition(cc.p(this.width * 0.5, this.height * 0.5));
    pianoSprite.setTag(this.TAG_PIANO);
    this.addChild(pianoSprite, -1);
  },

  lightUpSheetWord: function (idx) {
    this.getChildByTag(this.TAG_PIANO).lightUpSheetWord(idx);
  },

  giveFeedback: function (pianoKey) {
    let isCorrect = false;
    if (this.isFeedbackActivated) {
      isCorrect =
        pianoKey.getWord() ===
        ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.assets.sections.songs.data[
          this.currentSongIdx
        ].correctSequence[this.currentNoteIdx];
      if (isCorrect) {
        pianoKey.showFeedback(true);
      } else {
        pianoKey.showFeedback(false);
      }
    }
    return isCorrect;
  },
  updateRoomData: function (data) {
    SocketManager.emitCutomEvent(
      "SingleEvent",
      {
        eventType: HDSocketEventType.UPDATE_ROOM_DATA,
        roomId: HDAppManager.roomId,
        data: {
          roomId: HDAppManager.roomId,
          roomData: {
            activity:
              ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.properties.namespace,
            data: data,
            activityStartTime: HDAppManager.getActivityStartTime()
          },
        },
      },
      null
    );
  },

  updateMouseCursor: function (location) {
    return this.getChildByTag(this.TAG_PIANO).isMouseLocationOnPianoKeys(
      location
    );
  },

  playCurrentSong: function (onOverCb) {
    this.lightUpSheetWord(0);
    this.songPlayingCurrentNote = 0;
    let wordLength =
      ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.assets.sections.songs.data[
        this.currentSongIdx
      ].correctSequence.length;
    this.songPlayingInterval = setInterval(() => {
      if (this.songPlayingCurrentNote === wordLength) {
        this.stopPlayingCurrentSong();
        onOverCb();
        return;
      }
      let word =
        ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.assets.sections.songs.data[
          this.currentSongIdx
        ].correctSequence[this.songPlayingCurrentNote];
      let pianoKey = this.getChildByTag(this.TAG_PIANO).getPianoKeyByWord(word);
      this.lightUpSheetWord(this.songPlayingCurrentNote);
      pianoKey.playNote();
      pianoKey.showFeedback(true);
      ++this.songPlayingCurrentNote;
    }, this.songTempo);
  },

  stopPlayingCurrentSong: function () {
    if (this.songPlayingInterval) {
      clearInterval(this.songPlayingInterval);
      this.currentNoteIdx = HDUtility.clampANumber(
        this.songPlayingCurrentNote,
        0,
        ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.assets.sections.songs.data[
          this.currentSongIdx
        ].correctSequence.length - 1
      );
      this.updateRoomData({
        songIdx: this.currentSongIdx,
        wordIdx: this.currentNoteIdx,
        feedbackActivated: true,
        studentsAnswers: this.studentAnswers
      });
    }
  },

  // control touch over sheet words
  setMusicFretTouchEnabled: function (flag) {
    this.getChildByTag(this.TAG_PIANO).setMusicFretTouchEnabled(flag);
  },
});

// ========================== Teacher Layer ===============================
ACTIVITY_PIANO_PLAYER_1.TeacherViewLayer = ACTIVITY_PIANO_PLAYER_1.CommonPianoPlayerLayer.extend({
  TAG_START_BUTTON: 5,
  TAG_NEXT_BUTTON: 2,
  TAG_STUDENTS_LIST_LAYER: 3,
  TAG_PLAY_BUTTON: 4,
  state: null,
  currentStudentsList: [],

  ctor: function (state) {
    this._super(this, state);
    this.state = state;
    if (state && state.studentsAnswers) {
      for (let i in state.studentsAnswers) {
        this.currentStudentsList.push(state.studentsAnswers[i]);
      }
      this.createStudentsList(this.currentStudentsList);
    }

    this.setUpUI();
  },

  onEnter: function () {
    this._super();
    this.getStudentsList();
    this.showScriptMessage(ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.teacherScripts.data.moduleStart);
    this.showTipMessage(ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.teacherTips.data.moduleStart);
    this.lightUpSheetWord(this.currentNoteIdx);
  },

  onExit: function () { },

  updateStudentInteractionStatus: function (userName, status) {
    SocketManager.emitCutomEvent(
      ACTIVITY_PIANO_PLAYER_1.socketEventKey.singleEvent,
      {
        eventType: HDSocketEventType.GAME_MESSAGE,
        roomId: HDAppManager.roomId,
        data: {
          roomId: HDAppManager.roomId,
          type: ACTIVITY_PIANO_PLAYER_1.teacherEvents.PIANO_PLAYER_STUDENT_INTERACTION,
          userName: userName,
          status: status,
        },
      },
      () => undefined
    );
  },

  emitNextWordEvent: function () {
    SocketManager.emitCutomEvent(
      ACTIVITY_PIANO_PLAYER_1.socketEventKey.singleEvent,
      {
        eventType: HDSocketEventType.GAME_MESSAGE,
        roomId: HDAppManager.roomId,
        data: {
          roomId: HDAppManager.roomId,
          type: ACTIVITY_PIANO_PLAYER_1.teacherEvents.PIANO_PLAYER_NEXT_WORD,
          wordIdx: this.currentNoteIdx,
        },
      },
      () => undefined
    );
    this.updateRoomData({
      songIdx: this.currentSongIdx,
      wordIdx: this.currentNoteIdx,
      feedbackActivated: true,
      studentsAnswers: this.studentAnswers,
    });
  },

  showScriptMessage: function (msg) {
    this.getParent().getParent().showScriptMessage(msg.content.ops);
  },

  showTipMessage: function (msg) {
    this.getParent().getParent().showTipMessage(msg.content.ops);
  },

  getStudentsList: function () {
    SocketManager.emitCutomEvent(ACTIVITY_PIANO_PLAYER_1.socketEventKey.singleEvent, {
      eventType: HDSocketEventType.STUDENT_STATUS,
      data: {
        roomId: HDAppManager.roomId,
      },
    });
  },

  setUpUI: function () {
    if (!this.isFeedbackActivated) {
      this.addStartButton();
    } else {
      this.addPlayButton();
    }

    if (
      ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.assets.sections.songs.data[
      this.currentSongIdx + 1
      ]
    ) {
      this.addNextButton();
    }
  },

  addStartButton: function () {
    var startButton = this.createButton(
      ACTIVITY_PIANO_PLAYER_1.resourcePath +
      ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.buttons.data
        .startButton.enableState,
      ACTIVITY_PIANO_PLAYER_1.resourcePath +
      ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.buttons.data
        .startButton.pushedState,
      "",
      0,
      this.TAG_START_BUTTON,
      cc.p(this.width * 0.125, this.height * 0.55),
      this
    );
  },

  addNextButton: function () {
    var nextButton = this.createButton(
      ACTIVITY_PIANO_PLAYER_1.resourcePath +
      ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.buttons.data
        .nextButton.enableState,
      ACTIVITY_PIANO_PLAYER_1.resourcePath +
      ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.buttons.data
        .nextButton.pushedState,
      "",
      0,
      this.TAG_NEXT_BUTTON,
      cc.p(this.width * 0.88, this.height * 0.55),
      this
    );
  },

  // button to play song in regular time
  addPlayButton: function () {
    let playSongButton = this.createButton(
      ACTIVITY_PIANO_PLAYER_1.resourcePath +
      ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.buttons.data
        .playButton.enableState,
      ACTIVITY_PIANO_PLAYER_1.resourcePath +
      ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.buttons.data
        .playButton.pushedState,
      "",
      0,
      this.TAG_PLAY_BUTTON,
      cc.p(this.width * 0.125, this.height * 0.55),
      this
    );
    playSongButton.setVisible(true);
  },

  onNotificationReceived: function (event) {
    const { eventType, data } = event;
    const { type, userName, displayImage, isCorrect } = data;
    switch (eventType) {
      case HDSocketEventType.GAME_MESSAGE: {
        switch (type) {
          case ACTIVITY_PIANO_PLAYER_1.studentEvents.PIANO_PLAYER_STUDENT_CLICK: {
            if (isCorrect) {
              if (
                ++ACTIVITY_PIANO_PLAYER_1.delegate.totalCorrect ===
                ACTIVITY_PIANO_PLAYER_1.delegate.currentStudentsList.length
              ) {
                ACTIVITY_PIANO_PLAYER_1.delegate.totalCorrect = 0;
                ACTIVITY_PIANO_PLAYER_1.delegate.moveToNextWord();
              }
            }
            ACTIVITY_PIANO_PLAYER_1.delegate.updateStudentClickedImage(
              userName,
              displayImage,
              isCorrect
            );
            ACTIVITY_PIANO_PLAYER_1.delegate.studentAnswers[userName] = {
              userName: userName,
              displayImage: displayImage,
              isCorrect: isCorrect,
            };
            break;
          }
        }
        break;
      }
      case HDSocketEventType.STUDENT_STATUS: {
        ACTIVITY_PIANO_PLAYER_1.delegate.updateStudentsList(
          data.users.filter((user) => user.userName !== HDAppManager.username)
        );
      }
    }
  },

  updateStudentsList: function (updatedStudentsList) {
    let studentsList = this.getChildByTag(this.TAG_STUDENTS_LIST_LAYER);
    if (studentsList) {
      if (this.currentStudentsList.length < updatedStudentsList.length) {
        // add
        //Find values that are in updatedStudentsList but not in currentStudentsList
        studentsList.setStudentsList(
          updatedStudentsList.filter(
            (updated) =>
              !this.currentStudentsList.some(
                (current) => current.userName === updated.userName
              )
          )
        );
      } else if (this.currentStudentsList.length > updatedStudentsList.length) {
        // remove
        //Find values that are in currentStudentsList but not in updatedStudentsList
        studentsList.removeStudents(
          this.currentStudentsList
            .filter(
              (current) =>
                !updatedStudentsList.some(
                  (updated) => updated.userName === current.userName
                )
            )
            .map((student) => student.userName)
        );
      }
    } else {
      this.createStudentsList(updatedStudentsList);
    }

    this.currentStudentsList = updatedStudentsList;
  },

  createStudentsList: function (list) {
    let studentsList = new ACTIVITY_PIANO_PLAYER_1.StudentsList(list);
    studentsList.setTag(this.TAG_STUDENTS_LIST_LAYER);
    studentsList.setLocalZOrder(2);
    studentsList.setPosition(cc.p(this.width * 0.17, this.height * 0.01));
    this.addChild(studentsList);
  },

  updateStudentClickedImage: function (userName, displayImage, isCorrect) {
    this.getChildByTag(
      this.TAG_STUDENTS_LIST_LAYER
    ).setClickedKeyImageOfStudent(userName, displayImage, isCorrect);
  },

  onPianoKeyClicked: function (pianoKey) {
    // pianoKey being instance of class PianoKey
    pianoKey.playNote();
  },

  onWordClicked: function (idx) {
    this.currentNoteIdx = idx;
    this.totalCorrect = 0;
    if (this.isFeedbackActivated) {
      this.emitNextWordEvent();
    }
  },

  mouseControlEnable: function (location) {
    let nextButton = this.getChildByTag(this.TAG_NEXT_BUTTON);
    let startButton = this.getChildByTag(this.TAG_START_BUTTON);
    if (this.updateMouseCursor(location)) {
      return true;
    } else if (
      nextButton &&
      cc.rectContainsPoint(nextButton.getBoundingBox(), location)
    ) {
      return true;
    } else if (
      startButton &&
      cc.rectContainsPoint(startButton.getBoundingBox(), location)
    ) {
      return true;
    }
    return false;
  },

  onSongStopped: function () {
    this.setMusicFretTouchEnabled(true);
    this.getChildByTag(this.TAG_PLAY_BUTTON).setTouchEnabled(true);
    this.getChildByTag(this.TAG_NEXT_BUTTON) &&
      this.getChildByTag(this.TAG_NEXT_BUTTON).setTouchEnabled(true);
  },

  buttonCallback: function (sender, type) {
    var button = sender;
    var tag = button.tag;
    switch (type) {
      case ccui.Widget.TOUCH_ENDED: {
        switch (tag) {
          case this.TAG_START_BUTTON: {
            this.isFeedbackActivated = true;
            SocketManager.emitCutomEvent(
              ACTIVITY_PIANO_PLAYER_1.socketEventKey.singleEvent,
              {
                eventType: HDSocketEventType.GAME_MESSAGE,
                roomId: HDAppManager.roomId,
                data: {
                  type:
                    ACTIVITY_PIANO_PLAYER_1.teacherEvents.PIANO_PLAYER_ACTIVATE_FEEDBACK,
                  wordIdx: this.currentNoteIdx,
                  roomId: HDAppManager.roomId,
                },
              }
            );
            this.updateRoomData({
              songIdx: this.currentSongIdx,
              wordIdx: this.currentNoteIdx,
              feedbackActivated: true,
            });
            this.showScriptMessage(ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.teacherScripts.data.startButtonClicked);
            this.showTipMessage(ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.teacherTips.data.startButtonClicked);
            sender.setVisible(false);
            this.addPlayButton();
            break;
          }
          case this.TAG_NEXT_BUTTON: {
            SocketManager.emitCutomEvent(
              ACTIVITY_PIANO_PLAYER_1.socketEventKey.singleEvent,
              {
                eventType: HDSocketEventType.GAME_MESSAGE,
                roomId: HDAppManager.roomId,
                data: {
                  type: ACTIVITY_PIANO_PLAYER_1.teacherEvents.PIANO_PLAYER_NEXT_SONG,
                  roomId: HDAppManager.roomId,
                },
              }
            );
            //this.showScriptMessage("next button clicked");
            this.getChildByTag(
              this.TAG_STUDENTS_LIST_LAYER
            ).clearClickedKeyImagesOfAllStudents();
            this.launchNextSong();
            if (
              !ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.config.assets.sections.songs.data[
              this.currentSongIdx + 1
              ]
            ) {
              button.setVisible(false);
              button.setTouchEnabled(false);
            }
            break;
          }
          case this.TAG_PLAY_BUTTON: {
            this.setMusicFretTouchEnabled(false);
            this.getChildByTag(this.TAG_PLAY_BUTTON).setTouchEnabled(false);
            this.getChildByTag(this.TAG_NEXT_BUTTON) &&
              this.getChildByTag(this.TAG_NEXT_BUTTON).setTouchEnabled(false);
            SocketManager.emitCutomEvent(
              ACTIVITY_PIANO_PLAYER_1.socketEventKey.singleEvent,
              {
                eventType: HDSocketEventType.GAME_MESSAGE,
                roomId: HDAppManager.roomId,
                data: {
                  type: ACTIVITY_PIANO_PLAYER_1.teacherEvents.PIANO_PLAYER_PLAY_SONG,
                  roomId: HDAppManager.roomId,
                },
              }
            );
            this.playCurrentSong(this.onSongStopped.bind(this));
            break;
          }
        }
      }
    }
  },
});

// ========================== Student Layer ===============================
ACTIVITY_PIANO_PLAYER_1.StudentViewLayer = ACTIVITY_PIANO_PLAYER_1.CommonPianoPlayerLayer.extend({
  state: undefined,
  blockedOnCorrectAnswer: false,
  interactionEnabled: false,
  ctor: function (state) {
    this._super(this, state);
    this.state = state;
  },

  onEnter: function () {
    this._super();
    if (this.state && this.state.feedbackActivated) {
      this.lightUpSheetWord(this.currentNoteIdx);
    }
    this.setPianoKeysEnabled(false);
  },

  onExit: function () { },

  onSongStopped: function () {
    this.setPianoKeysEnabled(this.interactionEnabled);
  },

  onNotificationReceived: function (event) {
    const { eventType, data } = event;
    switch (eventType) {
      case HDSocketEventType.GAME_MESSAGE: {
        switch (data.type) {
          case ACTIVITY_PIANO_PLAYER_1.teacherEvents.PIANO_PLAYER_ACTIVATE_FEEDBACK: {
            ACTIVITY_PIANO_PLAYER_1.delegate.isFeedbackActivated = true;
            ACTIVITY_PIANO_PLAYER_1.delegate.currentNoteIdx = data.wordIdx;
            ACTIVITY_PIANO_PLAYER_1.delegate.lightUpSheetWord(data.wordIdx);
            break;
          }
          case ACTIVITY_PIANO_PLAYER_1.teacherEvents.PIANO_PLAYER_NEXT_SONG: {
            if (this.blockedOnCorrectAnswer) {
              ACTIVITY_PIANO_PLAYER_1.delegate.setPianoKeysEnabled(true);
              this.blockedOnCorrectAnswer = false;
              this.interactionEnabled = true;
            }
            ACTIVITY_PIANO_PLAYER_1.delegate.launchNextSong();
            break;
          }
          case ACTIVITY_PIANO_PLAYER_1.teacherEvents.PIANO_PLAYER_NEXT_WORD: {
            ACTIVITY_PIANO_PLAYER_1.delegate.currentNoteIdx = data.wordIdx;
            ACTIVITY_PIANO_PLAYER_1.delegate.lightUpSheetWord(data.wordIdx);
            if (this.blockedOnCorrectAnswer) {
              ACTIVITY_PIANO_PLAYER_1.delegate.setPianoKeysEnabled(true);
              this.interactionEnabled = true;
            }
            this.blockedOnCorrectAnswer = false;
            break;
          }
          case ACTIVITY_PIANO_PLAYER_1.teacherEvents.PIANO_PLAYER_STUDENT_INTERACTION: {
            const { userName, status } = data;
            if (userName === HDAppManager.username) {
              ACTIVITY_PIANO_PLAYER_1.delegate.setPianoKeysEnabled(status);
              this.interactionEnabled = status;
            }
            break;
          }
          case ACTIVITY_PIANO_PLAYER_1.teacherEvents.PIANO_PLAYER_PLAY_SONG: {
            this.setPianoKeysEnabled(false);
            this.playCurrentSong(this.onSongStopped.bind(this));
          }
        }
        break;
      }
    }
  },

  onPianoKeyClicked: function (pianoKey) {
    // pianoKey being instance of class PianoKey
    pianoKey.playNote();
    let isCorrect = this.giveFeedback(pianoKey);
    if (isCorrect) {
      this.setPianoKeysEnabled(false);
      this.blockedOnCorrectAnswer = true;
      this.interactionEnabled = false;
    }
    if (this.getIsFeedbackActivated()) {
      SocketManager.emitCutomEvent(
        ACTIVITY_PIANO_PLAYER_1.socketEventKey.singleEvent,
        {
          eventType: HDSocketEventType.GAME_MESSAGE,
          roomId: HDAppManager.roomId,
          data: {
            roomId: HDAppManager.roomId,
            type: ACTIVITY_PIANO_PLAYER_1.studentEvents.PIANO_PLAYER_STUDENT_CLICK,
            userName: HDAppManager.username,
            displayImage: pianoKey.getDisplayImage(),
            isCorrect: isCorrect,
          },
        },
        () => undefined
      );
      this.updateRoomDataFromStudentSide(pianoKey.getDisplayImage(), isCorrect);
    }
  },

  mouseControlEnable: function (location) {
    return this.updateMouseCursor(location);
  },
});

// ========================== Main Layer ===============================
ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayer = cc.Layer.extend({
  state: undefined,
  config: null,
  ctor: function () {
    this._super();
    var self = this;
    ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef = this;
    let activityName = 'ACTIVITY_PIANO_PLAYER_1';
    cc.loader.loadJson(
      "res/Activity/" + activityName + "/config.json",
      function (error, data) {
        self.config = data;
        ACTIVITY_PIANO_PLAYER_1.resourcePath =
          "res/Activity/" + "" + activityName + "/res/Sprite/";
        ACTIVITY_PIANO_PLAYER_1.soundPath = "res/Activity/" + "" + activityName + "/res/Sound/";
        if (HDAppManager.isTeacherView) {
          var teacherViewLayer = new ACTIVITY_PIANO_PLAYER_1.TeacherViewLayer(self.state);
          teacherViewLayer.setTag(1);
          ACTIVITY_PIANO_PLAYER_1.delegate = teacherViewLayer;
          self.addChild(teacherViewLayer);
        } else {
          var studentViewLayer = new ACTIVITY_PIANO_PLAYER_1.StudentViewLayer(self.state);
          studentViewLayer.setTag(2);
          ACTIVITY_PIANO_PLAYER_1.delegate = studentViewLayer;
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

  touchEventListener: function (touch, event) {
    if (!HDAppManager.isTeacherView)
      return;

    switch (event._eventCode) {
      case cc.EventTouch.EventCode.BEGAN:
        break;
      case cc.EventTouch.EventCode.MOVED:
        break;
      case cc.EventTouch.EventCode.ENDED:
        if (ACTIVITY_PIANO_PLAYER_1.delegate) {
          ACTIVITY_PIANO_PLAYER_1.delegate.onMouseDown(touch);
        }
        break;
    }
  },

  mouseEventListener: function (event) {
    if (!HDAppManager.isTeacherView)
      return;

    switch (event._eventType) {
      case cc.EventMouse.DOWN:
        if (ACTIVITY_PIANO_PLAYER_1.delegate) {
          ACTIVITY_PIANO_PLAYER_1.delegate.onMouseDown(event);
        }
        break;
      case cc.EventMouse.MOVE:
        break;
      case cc.EventMouse.UP:
        break;
    }
  },


  socketListener: function (event) {
    if (ACTIVITY_PIANO_PLAYER_1.delegate)
      ACTIVITY_PIANO_PLAYER_1.delegate.onNotificationReceived(event);
  },

  mouseControlEnable: function (location) {
    if (ACTIVITY_PIANO_PLAYER_1.delegate)
      return ACTIVITY_PIANO_PLAYER_1.delegate.mouseControlEnable(location);
  },
  updateStudentInteraction: function (username, status) {
    ACTIVITY_PIANO_PLAYER_1.delegate.updateStudentInteractionStatus(username, status);
  },

  syncData: function (data) {
    ACTIVITY_PIANO_PLAYER_1.MainPianoPlayerLayerRef.state = data;
  },

  onEnter: function () {
    this._super();
  },
  onExit: function () { },
});
