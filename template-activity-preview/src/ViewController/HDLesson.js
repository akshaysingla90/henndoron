var lesson_1 = {};
lesson_1.Tag = {
    activityParent              :   1999,
    activityTagStart            :   2000,
    message                     :   100,
    replay                      :   101,
    mouseControl                :   102,
    shortcutHelp                :   103,
    activeActivityTag           :   104,
    activityBox                 :   105,
    playButton                  :   106,
    leftArrow                   :   107,
    rightArrow                  :   108,
    activityName                :   109,
    activityTime                :   110,
    messageButton               :   120,
    shortcutButton              :   122,
    scriptMessage               :   130,
    tipMessage                  :   131,
    studentScrollView           :   132,
    studentListStart            :   133,
    connectionStatusLabelTag    :   140,
    lessonComplete              :   150,
    teacherButton               :   152,
    studentButton               :   153,
    userNameEnterButton         :   154,
    joinRoomButton              :   155,
    createRoomButtom            :   156,
    roomIdEditBox               :   157,
    userNameEditBox             :   158,
    rewardButton                :   159,
    onlineButton                :   160,
    studentPreviewScrollView    :   161,
    scriptScrollView            :   162,
    tipScrollView               :   163,
    scriptBubbleBottom          :   164,
    tipBubbleBottom             :   165,
    timerTag                    :   166,
    script_bubble_middle        :   167,
    script_bubble_top           :   168,
    tip_bubble_middle           :   169,
    tip_bubble_top              :   170,
    scriptBubbleSwallowTouch    :   171,
    tipBubbleSwallowTouch       :   172,
    timerLabel                  :   173,
    logoSprite                  :   174,
    starBg                      :   163,
    rewardStar                  :   164,
    rewardLabel                 :   165,
    RewardScrollView            :   176,
    rewardPanelBg               :   177,
    bottomDrag                  :   178,
    blackDot                    :   179,
    lessonTimer                 :   180,

};

lesson_1.TimerType = {
   lessonTimer   : 1,
   activityTimer : 2
};

lesson_1.socketEventKey = {
    launchActivity      : "launchActivity",
    createRoom          : "createRoom",
    connect             : "connect",
    joinRoom            : "joinRoom",
    studentStatus       : "studentStatus",
    syncData            : "syncData",
    studentTurn         : "studentTurn",
    disconnect          : "disconnect",
    completeLesson      : "completeLesson",
    singleEvent         : "SingleEvent"
}

lesson_1.HDLessonLayer = HDBaseLayer.extend({
    sprite                  :   null,
    config                  :   null,
    size                    :   cc.winSize,
    lessonZOrder            :   10,
    completedActivityIdx    :   -1,
    activityIdx             :   0,
    playActivity            :   0,
    isTeacherView           :   false,
    activeStudent           :   null,
    studentList             :   [],
    currentActivity         :   null,
    mouseControl            :   false,
    turnBased               :   false,
    roomLayer               :   null,
    listAvailableRooms      :   [1,2,3,4,5,6,7],
    buttonLayer             :   null,
    roomListTable           :   null,
    activeStudentList       :   [],
    handIconUI              :   [],
    isPendingRoomJoinReq    :   false,
    studentPanelBG          :   null,
    mousePosDiff            :   null,
    studentCellSize         :   cc.size(100, 22),
    studentPanelRef         :   null,
    activePreviewStudentName:   '',
    studentPreviewPanelHeight:  0,
    prevMouseLocation       :    null,
    studentPanelScrollViewDefaultPos: null,
    isMouseOnPreviewPanel: false,
    isMouseOnMouseControlPanel: false,
    rewardDropDown          :         null,
    isRewardPanelVisible    :         false,
    isMultiPlayer                :         false,
    studentRewardList            :           [],
    lessonHDTimer                :           null,
    activityHDTimer              :           null,
    isActivityTimerReloaded      :           false,
    isLessonTimerOnScreen: false,
    isActivityTimerOnScreen: false,
    pendingLessonTimerProgress: 0,
    pendingActivityTimerProgress:0,
    enableLogs: false,
    loadingResourceLabel: null,


//---------------------------------------- Life cycle -------------------------------------
    ctor:function () {
        this._super();
        cc.winSize = cc.director.getWinSize();
        lesson_1.config = HDAppManager.config;
        lesson_1.ref = this;
        lesson_1.resourcePath = "res/LessonResources/"+lesson_1.config.properties.name+"_";
        this.studentPanelScrollViewDefaultPos = cc.p(this.width * 0.16, 0);
        return true;
    },

    onEnter : function () {
        this._super();

        this.enableLogs = HDAppManager.appRunMode === AppMode.Development;
        this.isTeacherView = HDAppManager.isTeacherView;
        this.isPendingRoomJoinReq = false;
        lesson_1.ref.isRewardAnimationCompleted = true;
        this.addSocketConnectionStatusLabel();
        // this.setBackground("res/LessonResources/backyardtop.png");
      this.createRoomLayer();
        if (HDAppManager.isEventAddedForBackground() == null || !HDAppManager.isEventAddedForBackground()) {
            HDAppManager.setEventAddedForBackground(true);
            this.addBackgroundAndForegroundAppListeners();
        }
    },

    onEnterTransitionDidFinish: function(){
        this._super();
        if(HDAppManager.config.activityGame.length > 1) {
            HDAppManager.startResLoading();
        }
    },

    onExit : function () {
        this._super();
        HDAppManager.setEventAddedForBackground(false);
        cc.eventManager.removeListener(this.gameShowListener);
        cc.eventManager.removeListener(this.gameHideListener);
    },

    //-------------------------------------------------------------------------------------------------
    /**
     * create UI for lesson and Teacher
     */
    setupUI : function(){
        this.lessonUI();
        if(this.isTeacherView){
            this.teacherUI();
        }
        this.addMouseListener();
        if('touches' in cc.sys.capabilities) {
            this.addTouchListener();
        }
        this.logLabel = this.createTTFLabel("",HDConstants.Lato_Regular,24,cc.color(0,0,0,255),cc.p(200,250),this);
        this.logLabel.setLocalZOrder(this.lessonZOrder);
        this.createLabelLoadingRes();
        this.loadingResLabelSetActive(false);
    },
    createLabelLoadingRes: function (){
      this.loadingResourceLabel = this.createTTFLabel(HDString.loadingResources, HDConstants.Sassoon_Medium,
          30, cc.color(0, 255, 0, 255), cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.7), this);
      this.loadingResourceLabel.setLocalZOrder(this.lessonZOrder);
      let bg = this.createButton("res/LessonResources/emptyImage.png", "res/LessonResources/emptyImage.png", "", 0, 8888,
          cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5 ),
          this, null, null);
      bg.setLocalZOrder(this.lessonZOrder + 100);
      bg.setScale( this.getContentSize().width/bg.getContentSize().width,
          this.getContentSize().height/bg.getContentSize().height);
      bg.addTouchEventListener(()=>{}, this);
      this.loadingResourceLabel.bg = bg;
      this.loadingResourceLabel.enableStroke(cc.color(0, 0, 255, 255), 2);
    },

    loadingResLabelSetActive : function (status){
        this.loadingResourceLabel.setVisible(status);
        if(status){
            this.loadingResourceLabel.runAction( cc.sequence( cc.fadeOut(0.5),cc.fadeIn(0.5)).repeatForever());
        }else{
            this.loadingResourceLabel.stopAllActions();
        }
        this.loadingResourceLabel.bg.setVisible(status);
    },

    showLogMessageForTablet : function(message) {
        if(this.enableLogs) {
            this.logLabel.setString(message);
        }
    },

    /**
     * Lesson container controls Header and footer
     */
    lessonUI : function(){
        //logo Sprite
        const xMargin = 0.015;
        const yMargin = 0.015;
        this.lessonHeader(xMargin, yMargin);
        if(this.isTeacherView) {
            this.teacherFooter( xMargin, yMargin);
        }
    },

     addTouchListener : function (){
        cc.eventManager.addListener(cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event){
                if(!lesson_1.ref.checkIfMouseClickedOnPreviewPanel(touch)){
                    lesson_1.ref.checkIfMouseClickedOnMouseControlPanel(touch);
                    lesson_1.ref.checkIfMouseClickedOutSideRewardPanel(touch);
                }
                lesson_1.ref.updateMouseIcon(touch);
                lesson_1.ref.passTouchToChildActivity(touch, event);

                lesson_1.ref.prevMouseLocation = touch.getLocation();
                return true;
            },
            onTouchMoved: function(touch, event) {
                lesson_1.ref.dragStudentPreviewPanel(touch);
                lesson_1.ref.moveStudentPanel(touch);
                lesson_1.ref.passTouchToChildActivity(touch, event );

            },
            onTouchEnded : function (touch, event) {
                lesson_1.ref.isMouseOnMouseControlPanel = false;
                lesson_1.ref.isMouseOnPreviewPanel = false;
                lesson_1.ref.mousePosDiff = null;
                lesson_1.ref.passTouchToChildActivity(touch, event);
            },
            onTouchCancelled: function (touch){
                lesson_1.ref.passTouchToChildActivity(touch.event);
            }
        }), this);
    },

    passTouchToChildActivity : function (touch, event){
        let activityGame = lesson_1.ref.getChildByTag(lesson_1.Tag.activeActivityTag);
        let cursorFound = false;
        for(let obj of  lesson_1.ref.handIconUI){
            if(cc.rectContainsPoint(obj.getBoundingBox(), obj.getParent().convertToNodeSpace(touch.getLocation()))
                && obj.isVisible() && obj.getParent() && obj.getParent().isVisible() && obj.getParent().getParent() &&
                obj.getParent().getParent().isVisible()){
                cursorFound = true;
                break;
            }
        }
        if(!cursorFound && activityGame && activityGame.touchEventListener){
            activityGame.touchEventListener(touch, event);
        }

        this.changeButtonTexture(touch);
        let cursorValue = this.activityInfoOnMouseHover(touch);
        cursorFound = cursorValue ? true : cursorFound;
        if(cursorFound){
            this.moveStudentPanel(touch);
        }
    },

    /**
     * Lesson headers
     * @param xMargin
     * @param yMargin
     */
    lessonHeader : function(xMargin, yMargin){
        this.createLogo(xMargin, yMargin);
        this.createRewardButton(xMargin, yMargin);
    },

    /**
     *
     * @param xMargin
     * @param yMargin
     */
    createLogo : function(xMargin, yMargin) {
        let logo = this.addSprite(lesson_1.resourcePath +  lesson_1.config.graphicalAssets.logo.name, cc.p(0, 0), this);
        logo.setLocalZOrder(this.lessonZOrder);
        logo.setPosition(this.getContentSize().width * xMargin + logo.getContentSize().width*0.5, this.getContentSize().height * (1 - yMargin) - logo.getContentSize().height*0.5);
        logo.setAnchorPoint(cc.p(0.5, 0.5));
        logo.setTag(lesson_1.Tag.logoSprite);
    },

    /**
     *
     * @param xMargin
     * @param yMargin
     */
    createRewardButton: function(xMargin, yMargin){
        var starBGName = HDAppManager.isTeacherView ? lesson_1.resourcePath +  lesson_1.config.graphicalAssets.starBgTeacher.name : lesson_1.resourcePath +  lesson_1.config.graphicalAssets.starBgTeacher.name;
        var rewardBg  = this.createButton(starBGName,null, null, null, lesson_1.Tag.rewardButton,  cc.p(0,0), this, this, starBGName);
        rewardBg.setPosition(this.getContentSize().width * (1 - xMargin) -  rewardBg.getContentSize().width*0.5, this.getContentSize().height * (1 - yMargin) - rewardBg.getContentSize().height*0.5);
        rewardBg.setLocalZOrder(this.lessonZOrder);
        var star     = this.addSprite( lesson_1.resourcePath + lesson_1.config.graphicalAssets.rewardStar.name , cc.p(rewardBg.width * 0.5, rewardBg.height * 0.5), rewardBg);
        star.setVisible(true);
        star.setTag(lesson_1.Tag.rewardStar);
        var rewardLabel = this.createTTFLabel("", HDConstants.LondrinaSolid_Regular, 15, cc.color(101, 64, 39, 255), cc.p(rewardBg.width * 0.5, rewardBg.height * 0.45), rewardBg );
        rewardLabel.setTag(lesson_1.Tag.rewardLabel);
        var isTouch = HDAppManager.isTeacherView ;
        rewardBg.setEnabled(isTouch );
        lesson_1.ref.rewardAnimation = this.addSprite("res/LessonResources/emptyImage.png", cc.p(lesson_1.ref.getContentSize().width * 0.5, lesson_1.ref.getContentSize().height * 0.5), this);
        lesson_1.ref.rewardAnimation.setLocalZOrder(this.lessonZOrder);
        if(HDAppManager.isTeacherView){
            let position = cc.p(rewardBg.getPositionX() - rewardBg.width * 0.4,  rewardBg.getPositionY() - rewardBg.height * 0.35);
            this.createRewardDropDown(position,  rewardBg.height * 0.2);
            this.handIconUI.push(rewardBg);
        }

    },

    createRewardDropDown: function(position, marginY){
        var tempWidth = new cc.Sprite(lesson_1.resourcePath + lesson_1.config.graphicalAssets.rewardDropDown.name).width;
        var clipper = new cc.ClippingNode();
        clipper.setContentSize(tempWidth, this.getContentSize().height);
        clipper.setPosition(position.x, 0);
        clipper.setLocalZOrder(this.lessonZOrder - 1);

        var stencil = new cc.LayerColor(HDConstants.Black, tempWidth, this.getContentSize().height );
        stencil.ignoreAnchorPointForPosition(false);
        stencil.setAnchorPoint(0,1);
        stencil.setPosition(0,position.y);
        clipper.setStencil(stencil);
        this.addChild(clipper);
        this.rewardDropDown =  this.createColourLayer(HDConstants.Black, tempWidth, this.getContentSize().height, cc.p(0,0), clipper, this.lessonZOrder - 1 );
        this.rewardDropDown.setOpacity(0);
        var maxVisibleRewards = 8;


        var totalStudents = lesson_1.ref.studentRewardList.length;
        var cellHeight = this.getContentSize().height  * 0.08;
        var vPadding   = cellHeight * 0.06;
        var selectedBG = this.addSprite(lesson_1.resourcePath + lesson_1.config.graphicalAssets.rewardDropDown.name, cc.p(0, position.y), this.rewardDropDown);
        selectedBG.setAnchorPoint(0,1);
        selectedBG.setTag(lesson_1.Tag.rewardPanelBg);

        let container = new cc.Layer();
        container.setContentSize(cc.size( this.rewardDropDown.width , (cellHeight  + vPadding) * totalStudents));

        selectedBG.setScaleY( container.height / selectedBG.height);
        var bottom = this.addSprite(lesson_1.resourcePath + lesson_1.config.graphicalAssets.bottomRewardDropDown.name, cc.p( 0 ,  selectedBG.getPositionY()  -  selectedBG.height *  selectedBG.getScaleY()),  this.rewardDropDown);
        bottom.setAnchorPoint(0,1);
        bottom.setTag(lesson_1.Tag.bottomDrag);

        var height = totalStudents > maxVisibleRewards ? cellHeight * maxVisibleRewards :  (cellHeight + vPadding) *  totalStudents;
        let scrollView = this.createScrollView(container.getContentSize(), container, cc.size(this.rewardDropDown.width, height ), cc.SCROLLVIEW_DIRECTION_VERTICAL,cc.p(0,  position.y - height - marginY ),  this.rewardDropDown);
        scrollView.setTouchEnabled(true);
        scrollView.setBounceable(false);
        scrollView.setTag(lesson_1.Tag.RewardScrollView);
        //console.log("scrollViewPos",position.y - marginY, scrollView.getPositionY());
        var initialPos = container.height - (cellHeight + vPadding) ;
        //console.log("initialPos", initialPos);
        for(let student in  lesson_1.ref.studentRewardList){
            var cell = this.createStudentRewardCell(parseInt(student),  this.rewardDropDown.width,cellHeight);
            cell.setPosition(0, initialPos  - Math.floor(student * ( cellHeight + vPadding)) );
          //  console.log("pos", cell.getPosition());
            container.addChild(cell);
        }

        this.rewardDropDown.setPositionY(this.height);

    },

    createStudentRewardCell : function(index, width, height){
        console.log("reward cell index", index);
        var starIndex = lesson_1.ref.studentRewardList[index].starColor % lesson_1.config.graphicalAssets.studentRewards.length ;
        var starButtonPng = lesson_1.resourcePath +  lesson_1.config.graphicalAssets.studentRewards[cc.clampf(starIndex, 0, lesson_1.config.graphicalAssets.studentRewards.length - 1)].name;
        var cell = new cc.LayerColor(HDConstants.YellowColor, width, height);
        cell.setOpacity(0);
        var button = new ccui.Button(starButtonPng, null, starButtonPng , "");
        button.setPosition(cc.p(cell.width * 0.5, cell.height * 0.7));
        button.addTouchEventListener(this.studentRewardCallback, this);
        button.setTag(index);
        cell.addChild(button);
        if(HDAppManager.isTeacherView)
        this.handIconUI.push(button);
        var scoreTitle = this.createTTFLabel(lesson_1.ref.studentRewardList[index].rewards ==0 ? "0" : lesson_1.ref.studentRewardList[index].rewards.toString(), HDConstants.LondrinaSolid_Regular, 10,cc.color(101, 64, 39, 255), cc.p(button.getContentSize().width * 0.5, button.getContentSize().height * 0.45), button);
        scoreTitle.setTag(lesson_1.Tag.rewardLabel);
        this.createTTFLabel(lesson_1.ref.studentRewardList[index].name, HDConstants.LondrinaSolid_Regular, 10,cc.color(101, 64, 39, 255), cc.p(cell.getContentSize().width * 0.5, cell.getContentSize().height * 0.15), cell);
        return cell;

    },

    studentRewardCallback : function(pSender, type){
        if(type == ccui.Widget.TOUCH_ENDED){

            console.log(lesson_1.ref.isRewardAnimationCompleted ,lesson_1.ref.rewardDropDown.getNumberOfRunningActions() )
            if( lesson_1.ref.isRewardAnimationCompleted && lesson_1.ref.rewardDropDown.getNumberOfRunningActions() === 0){
                var name = this.studentList[pSender.getTag()];
                pSender.setTouchEnabled(false);
                this.sendRewardInfoToServer({"studentUserName": name, "roomId": HDAppManager.roomId}, pSender, pSender.getTag());
            }
        }
    },

    reloadStudentRewardCell : function(){
        if(!this.isTeacherView){
            return;
        }
        var rewardBg = this.getChildByTag(lesson_1.Tag.rewardButton);
        var defaultScrollViewPos = rewardBg.getPositionY() - rewardBg.height * 0.55;
        var maxVisibleRewards = 8;
        var totalStudents = lesson_1.ref.studentList.length;
        var cellHeight = this.getContentSize().height  * 0.08;
        var vPadding   = cellHeight * 0.06;
        var height = totalStudents > maxVisibleRewards ? cellHeight * maxVisibleRewards :  (cellHeight + vPadding) *  totalStudents;
        var scrollView =  this.rewardDropDown.getChildByTag(lesson_1.Tag.RewardScrollView);
        var container = scrollView.getContainer();
        container.setContentSize(cc.size(container.width , (cellHeight  + vPadding) * totalStudents));
        scrollView.setViewSize(cc.size(container.width, height));
        scrollView.setPositionY( defaultScrollViewPos - height);
        // console.log("container view size", container.getContentSize(), scrollView.getContentSize(), defaultScrollViewPos, defaultScrollViewPos-height);

        container.removeAllChildrenWithCleanup();
        var initialPos = container.height - (cellHeight + vPadding) ;
       // console.log("initialPos", initialPos);
        for(let student in  lesson_1.ref.studentRewardList){
            var cell = this.createStudentRewardCell(parseInt(student),  this.rewardDropDown.width,cellHeight);
            cell.setPosition(container.width * 0.0, initialPos  - Math.floor(student * ( cellHeight + vPadding)) );
            container.addChild(cell);
        }

        var rewardPanel = this.rewardDropDown.getChildByTag(lesson_1.Tag.rewardPanelBg);
        rewardPanel.setScaleY(scrollView.height /rewardPanel.height);
        this.rewardDropDown.getChildByTag(lesson_1.Tag.bottomDrag).setPositionY(rewardPanel.getPositionY() -  rewardPanel.height *  rewardPanel.getScaleY());
    },

    showStudentRewardPanel : function(){
        if( this.rewardDropDown.getNumberOfRunningActions() ==0){
            var callBack = new cc.callFunc(function () {
                lesson_1.ref.isRewardPanelVisible = true;
            });
            this.rewardDropDown.runAction(new cc.sequence(cc.moveTo(0.5,0, 0), callBack));
        }


    },

    hideStudentRewardPanel : function(){
        if( this.rewardDropDown && this.rewardDropDown.getNumberOfRunningActions() ==0) {
            var rewardButton = this.getChildByTag(lesson_1.Tag.rewardButton);
            var callBack = new cc.callFunc(function () {
                lesson_1.ref.isRewardPanelVisible = false;
                rewardButton.setTouchEnabled(true);
            });
            this.rewardDropDown.runAction(new cc.sequence(cc.moveTo(0.5, 0, this.height), callBack));
        }

    },

    /**
     * Teacher
     * @param xMargin
     * @param yMargin
     */
    teacherFooter : function( xMargin, yMargin){
        let messageButton =  this.createScriptButton( xMargin, yMargin);
        let messageReplayButton = this.createReplayButton(messageButton);
        let shortcutButton = this.createShortcutButton( xMargin, yMargin);
        this.createMouseControlButton(shortcutButton);
    },

    /**
     * Lower left script button
     * @returns {*}
     */
    createScriptButton:  function( xMargin, yMargin){
        let messageButton = this.createButton(lesson_1.resourcePath + "btn_idle.png", lesson_1.resourcePath + "btn_selected.png",
            "", 0, lesson_1.Tag.message, cc.p(0, 0), this, null);
        messageButton.setAnchorPoint(cc.p(0.5, 0.5));
        messageButton.setPosition(cc.p(this.getContentSize().width * xMargin + messageButton.getContentSize().width * 0.5, this.getContentSize().height * yMargin + messageButton.getContentSize().height * 0.5))
        messageButton.setLocalZOrder(this.lessonZOrder);
        messageButton.setTag(lesson_1.Tag.messageButton);
        lesson_1.ref.handIconUI.push(messageButton);

        var scriptSprite =  this.addSprite(lesson_1.resourcePath + "script_active_icon.png", cc.p(messageButton.width * 0.5, messageButton.height * 0.5), messageButton);
        scriptSprite.setScale(messageButton.width * 0.5 / scriptSprite.width, messageButton.height * 0.5 / scriptSprite.height);
        scriptSprite.setTag(1);
        this.createScriptBubble();
        return messageButton;
    },

    /**
     * Replay button
     * @param messageButton
     */
    createReplayButton : function(messageButton){
        //- Replay Button
        let messageReplayButton = this.createButton(lesson_1.resourcePath + "btn_idle.png", lesson_1.resourcePath + "btn_selected.png",
            "", 0, lesson_1.Tag.replay, cc.p(messageButton.getPosition().x + messageButton.getContentSize().width * 1.15, messageButton.getPosition().y), this, null);
        messageReplayButton.setAnchorPoint(cc.p(0.5, 0.5));
        messageReplayButton.setLocalZOrder(this.lessonZOrder);
        lesson_1.ref.handIconUI.push(messageReplayButton);
        var resetActiveSprite =  this.addSprite(lesson_1.resourcePath + "reset_idle_icon.png", cc.p(messageReplayButton.width * 0.5, messageReplayButton.height * 0.5), messageReplayButton);
        resetActiveSprite.setTag(1);
        resetActiveSprite.setScale(messageReplayButton.width * 0.5 / resetActiveSprite.width, messageReplayButton.height * 0.5 / resetActiveSprite.height);
        return messageReplayButton;
    },

    /**
     * shortcut button
     * @param xMargin
     * @param yMargin
     * @returns {*}
     */
    createShortcutButton : function( xMargin, yMargin){
        //shortcutButton  Button
        let shortcutButton = this.createButton(lesson_1.resourcePath + "btn_idle.png", lesson_1.resourcePath + "btn_selected.png",
            "", 0, lesson_1.Tag.shortcutHelp, cc.p(0, 0), this, null);
        shortcutButton.setPosition(cc.p(this.getContentSize().width * (1 - xMargin) - shortcutButton.getContentSize().width * 0.5, this.getContentSize().height * yMargin + shortcutButton.getContentSize().height * 0.5));
        shortcutButton.setAnchorPoint(cc.p(0.5, 0.5));
        shortcutButton.setLocalZOrder(this.lessonZOrder);
        shortcutButton.setTag(lesson_1.Tag.shortcutButton);
        lesson_1.ref.handIconUI.push(shortcutButton);


        var tipSprite =  this.addSprite(lesson_1.resourcePath + "tip_active_icon.png", cc.p(shortcutButton.width * 0.5, shortcutButton.height * 0.5), shortcutButton);
        tipSprite.setScale(shortcutButton.width * 0.5 / tipSprite.width, shortcutButton.height * 0.5 / tipSprite.height);
        tipSprite.setTag(1);
        this.createTipBubble();
        return shortcutButton;
    },

    /**
     * Mouse control button to toggle to student panel.
     * @param shortcutButton
     */
    createMouseControlButton : function(shortcutButton){
        let mouseControlButton = this.createButton(lesson_1.resourcePath + "btn_idle.png", lesson_1.resourcePath + "btn_selected.png",
            "", 0, lesson_1.Tag.mouseControl, cc.p(shortcutButton.getPosition().x - shortcutButton.getContentSize().width * 1.15, shortcutButton.getPosition().y), this, null);
        mouseControlButton.setAnchorPoint(cc.p(0.5, 0.5));
        mouseControlButton.setLocalZOrder(this.lessonZOrder);
        lesson_1.ref.handIconUI.push(mouseControlButton);
        var mouseControlSprite =  this.addSprite(lesson_1.resourcePath + "cursor_idle_icon.png", cc.p(mouseControlButton.width * 0.5, mouseControlButton.height * 0.5), mouseControlButton);
        mouseControlSprite.setScale(mouseControlButton.width * 0.5 / mouseControlSprite.width, mouseControlButton.height * 0.5 / mouseControlSprite.height);
        mouseControlSprite.setTag(1);
    },

    /**
     * Top Activity Bar, activity details and Student name list
     */
    teacherUI :function() {
        this.activityBar();
        this.createActivityDialog();
        this.studentsPanel();
        this.studentsPreviewPanel();
        this.createTimer(lesson_1.resourcePath + lesson_1.config.graphicalAssets.lessonTimer[0].name,   lesson_1.ref.lessonZOrder +1, lesson_1.Tag.lessonTimer);  // lessonTimer
        this.createTimer(lesson_1.resourcePath + "timer_1_minute.png", lesson_1.ref.lessonZOrder + 1 , lesson_1.Tag.timerTag);  // activity timer
    },

    /**
     * Top activity Bar To show available activity in lesson.
     */
    activityBar : function () {
        //arrowLeft
        //question mark Button
        let activityCount = lesson_1.config.activityGame.length;
        let maxItemsCountWithScroll = 10; // number of visible items in scroll view at a time
        let maxItemsCountWithoutScroll = 12;

        let startPosX = 0;
        let button = new cc.Sprite("res/LessonResources/lesson_1_activityDone.png");
        let tempSprite = new cc.Sprite("res/LessonResources/lesson_1_blackDot.png");
        var buttonWidth = button.width + tempSprite.getContentSize().width * 3;

        let width = buttonWidth * activityCount;
        let maxWidth = (activityCount > maxItemsCountWithoutScroll ? maxItemsCountWithScroll : maxItemsCountWithoutScroll) * buttonWidth;
        width -= tempSprite.width * 3;

        let scrollView = new cc.ScrollView(cc.size(maxWidth, 80), new cc.LayerColor(cc.color(0,0,0,0),width, 80));
        scrollView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        scrollView.setContentSize(cc.size(width, 80));
        scrollView.setPosition(cc.p(this.getContentSize().width * 0.5 - (cc.clampf(width, 0, maxWidth))*0.5,
            this.getContentSize().height * 0.9 - 15));
        scrollView.setTag(lesson_1.Tag.activityParent);
        scrollView.setLocalZOrder(this.lessonZOrder);
        scrollView.setBounceable(false);
        scrollView.setTouchEnabled(false);
        this.handIconUI.push(scrollView);
        this.addChild(scrollView);
        if(activityCount > maxItemsCountWithoutScroll) {
            var leftNavigation = this.createButton(lesson_1.resourcePath + "leftArrow.png", lesson_1.resourcePath + "leftArrow.png",
                "", 0, lesson_1.Tag.leftArrow, cc.p(this.getContentSize().width * 0.2, this.getContentSize().height * 0.85), this);
            leftNavigation.setAnchorPoint(cc.p(0.5, 0.5));
            leftNavigation.setLocalZOrder(this.lessonZOrder);
            this.handIconUI.push(leftNavigation);
            // leftNavigation.setScale(0.6);
            // leftNavigation.setRotation(180);
            //arrowRight
            var rightNavigation = this.createButton(lesson_1.resourcePath + "rightArrow.png", lesson_1.resourcePath + "rightArrow.png",
                "", 0, lesson_1.Tag.rightArrow, cc.p(this.getContentSize().width * 0.8, this.getContentSize().height * 0.85), this);
            rightNavigation.setAnchorPoint(cc.p(0.5, 0.5));
            rightNavigation.setLocalZOrder(this.lessonZOrder);
            this.handIconUI.push(rightNavigation);


            if(scrollView.getContentOffset().x > scrollView.maxContainerOffset().x - 1 && scrollView.getContentOffset().x < scrollView.maxContainerOffset().x + 1){
                leftNavigation.setOpacity(100);
                leftNavigation.setTouchEnabled(false);
            }
            else if(scrollView.getContentOffset().x > scrollView.minContainerOffset().x - 1 && scrollView.getContentOffset().x < scrollView.minContainerOffset().x + 1) {
                rightNavigation.setOpacity(100);
                rightNavigation.setTouchEnabled(false);
            }

        }

        console.log("size", scrollView.getContainer().getContentSize(), scrollView.getViewSize());

        for(let i = 0; i < activityCount; i++){
            let activityIcon = this.addSprite("res/LessonResources/lesson_1_activityDone.png", cc.p( 15+i*buttonWidth, scrollView.getContentSize().height *0.5  ), scrollView);
            activityIcon.setTag(lesson_1.Tag.activityTagStart + i);
            if(i == activityCount -1) {
                continue;
            }
            let blackDot1 = this.addSprite("res/LessonResources/lesson_1_blackDot.png", cc.p( activityIcon.getPositionX() + activityIcon.getContentSize().width * 0.65 , activityIcon.getPositionY()  ), scrollView);
            blackDot1.setTag(lesson_1.Tag.blackDot);
            let blackDot2 = this.addSprite("res/LessonResources/lesson_1_blackDot.png", cc.p( blackDot1.getPositionX() + blackDot1.getContentSize().width * 1.5, activityIcon.getPositionY()  ), scrollView);
            blackDot2.setTag(lesson_1.Tag.blackDot);
        }
        if(activityCount > maxItemsCountWithoutScroll) {
            leftNavigation.setPosition(cc.p(scrollView.getPosition().x - scrollView.width * 0.05 , scrollView.getPosition().y + scrollView.getContentSize().height * 0.5));
            rightNavigation.setPosition(cc.p(scrollView.getPosition().x + scrollView.width * 1.05, scrollView.getPosition().y + scrollView.getContentSize().height * 0.5));
        }
        // }
        this.updateActivityBar();
    },

    /**
     * Update activity Bar with selected activity
     */
    updateActivityBar : function(){
        if(!this.isTeacherView)
            return;
        if(this.getChildByTag(lesson_1.Tag.activityBox))
            this.getChildByTag(lesson_1.Tag.activityBox).setVisible(false);
        let layer = this.getChildByTag(lesson_1.Tag.activityParent).getContainer();
        for(let i = 0; i < lesson_1.config.activityGame.length;  ++i){
            let activity = layer.getChildByTag(lesson_1.Tag.activityTagStart + i);
            if(i < this.activityIdx){
                //completed
                activity.setTexture( new cc.Sprite("res/LessonResources/lesson_1_activityDone.png").getTexture());
            }else if( i  >= (this.activityIdx + 1)){
                //pending
                activity.setTexture( new cc.Sprite("res/LessonResources/lesson_1_activityPending.png").getTexture());
            }else{
                //ongoing
                activity.setTexture( new cc.Sprite("res/LessonResources/lesson_1_activityInProgress.png").getTexture());
            }
        }
    },

    scrollActivityBar: function (direction) {
        let left =  this.getChildByTag(lesson_1.Tag.leftArrow);
        let right = this.getChildByTag(lesson_1.Tag.rightArrow);
        let activityBar = this.getChildByTag(lesson_1.Tag.activityParent);
        let activityBarContainer = activityBar.getContainer();
        let itemWidth = activityBarContainer.getChildByTag(lesson_1.Tag.activityTagStart).width;
        let currentOffset = activityBar.getContentOffset();
        let blackDot = activityBarContainer.getChildByTag(lesson_1.Tag.blackDot);
        let moveBy = direction * (itemWidth + blackDot.width * 3);//Gap between dots is 0.5 of width.
        let finalOffset = cc.p(cc.clampf(currentOffset.x + moveBy, activityBar.minContainerOffset().x, activityBar.maxContainerOffset().x), currentOffset.y);
        if(finalOffset.x > activityBar.maxContainerOffset().x - 5 && finalOffset.x < activityBar.maxContainerOffset().x + 5){
            left.setOpacity(100);
            left.setTouchEnabled(false);
        }
        else if(finalOffset.x > activityBar.minContainerOffset().x - 5 && finalOffset.x < activityBar.minContainerOffset().x + 5) {
            right.setOpacity(100);
            right.setTouchEnabled(false);
        }
        else {
            left.setOpacity(255);
            left.setTouchEnabled(true);
            right.setOpacity(255);
            right.setTouchEnabled(true);
        }
        // finalOffset.x = parseInt(finalOffset.x.toString());
        activityBar.setContentOffset(finalOffset,1);
    },

    /**
     * Show activity dialog information
     */
    createActivityDialog : function(){
        if(!this.isTeacherView)
            return;
        let layer  = this.addSprite("res/LessonResources/lesson_1_activity_box_top.png", cc.p(0, 0), this );
        layer.setTag(lesson_1.Tag.activityBox);
        layer.setAnchorPoint(cc.p(0,0));
        layer.setLocalZOrder(this.lessonZOrder);
        layer.setScale(0.59);
        this.handIconUI.push(layer);
        let activityName = this.createTTFLabel("Magic Hat", HDConstants.LondrinaSolid_Regular, 32,cc.color(101, 64, 39, 255),
            cc.p(layer.getContentSize().width * 0.5, layer.getContentSize().height * 0.6), layer);
        activityName.setTag(lesson_1.Tag.activityName);
        activityName.setDimensions(cc.size(layer.getContentSize().width * 0.9, 0));
        let activityTime = this.createTTFLabel("Time: 1 Min", HDConstants.Sassoon_Regular, 24, HDConstants.Black,
            cc.p(layer.getContentSize().width * 0.5, layer.getContentSize().height * 0.40), layer);
        activityTime.setTag(lesson_1.Tag.activityTime);
        let playButton = this.createButton(lesson_1.resourcePath +"play.png", lesson_1.resourcePath+"play.png",
            "", 0, lesson_1.Tag.playButton, cc.p(layer.getContentSize().width * 0.5, layer.getContentSize().height * 0.25), layer, this)
        this.handIconUI.push(playButton);
        layer.setVisible(false);

    },

    /**
     * Show Activity dialog on mouse hover
     * @param activityNumber
     */
    showActivityDialog: function(activityNumber){
        if(!this.isTeacherView)
            return;
        this.playActivity = activityNumber;
        let activityLayer = this.getChildByTag(lesson_1.Tag.activityParent).getContainer();
        let button  = activityLayer.getChildByTag(lesson_1.Tag.activityTagStart + activityNumber);
        let activityBox = this.getChildByTag(lesson_1.Tag.activityBox);
        activityBox.getChildByTag(lesson_1.Tag.activityName).setString(lesson_1.config.activityGame[activityNumber].activityName);
        if( HDAppManager.loadedResIndex.indexOf(activityNumber)  == -1 ) {
            activityBox.getChildByTag(lesson_1.Tag.activityTime).setString("Loading...");
            activityBox.getChildByTag(lesson_1.Tag.playButton).setTouchEnabled(false);
            activityBox.getChildByTag(lesson_1.Tag.playButton).setOpacity(100);
        }else{
            activityBox.getChildByTag(lesson_1.Tag.playButton).setTouchEnabled(true);
            activityBox.getChildByTag(lesson_1.Tag.playButton).setOpacity(255);
            activityBox.getChildByTag(lesson_1.Tag.playButton).setVisible(true);
            activityBox.getChildByTag(lesson_1.Tag.playButton).setLocalZOrder(10);
            activityBox.getChildByTag(lesson_1.Tag.activityTime).setString("Time: " + lesson_1.config.activityGame[activityNumber].allocatedTime + " Min");
        }
        activityBox.setVisible(true);
        let position = this.convertToNodeSpace(activityLayer.convertToWorldSpace(button.getPosition()));
        activityBox.setPosition(cc.p(position.x - activityBox.getContentSize().width * activityBox.getScale() * 0.5, position.y - activityBox.getContentSize().height * activityBox.getScale()*1.15));
    },

    /**
     * Create Username panel to show connected user details and mouse control
     */
    studentsPanel : function () {
        if(!this.isTeacherView)
            return;
        let container = new cc.Node();
        let cellSize = this.studentCellSize;
        let cellGap = cellSize.height * 0.2;
        let count =  0;
        let scrollView = this.createScrollView(container.getContentSize(), container, cc.size(
            this.getContentSize().width * 0.2, 9*this.studentCellSize.height*2),
            cc.SCROLLVIEW_DIRECTION_VERTICAL, cc.p(this.getContentSize().width  * 0.7, this.getContentSize().height * 0.3), this);
        container.setContentSize(cc.size(this.getContentSize().width * 0.2, (cellGap*(count+1)) + (count * cellSize.height)));
        container.setAnchorPoint(cc.p(0,0));
        container.setPosition(cc.p(0, 0));
        scrollView.setTouchEnabled(false);
        scrollView.setAnchorPoint(0, 0);
        scrollView.setVisible(false);
        scrollView.setTag(lesson_1.Tag.studentScrollView);
        this.studentPanelBG = new cc.Scale9Sprite(lesson_1.resourcePath + "student_panel_bg.png", null,  cc.rect(40, 40, 40, 40)); //this.addSprite(lesson_1.resourcePath + "student_panel_bg.png", );
        this.studentPanelBG.setAnchorPoint(cc.p(0, 0));
        this.studentPanelBG.setPosition(cc.p(scrollView.getPositionX() - this.studentCellSize.width*0.0625 ,scrollView.getPositionY() - this.studentCellSize.width*0.0625));
        this.addChild(this.studentPanelBG);
        this.studentPanelBG.setLocalZOrder(10);
        this.studentPanelBG.setVisible(false);
        this.handIconUI.push(this.studentPanelBG);
        scrollView.setLocalZOrder(this.lessonZOrder);
        this.studentPanelBG.setScale((container.getContentSize().width + this.studentCellSize.width*0.25)/this.studentPanelBG.getContentSize().width, (container.getContentSize().height + this.studentCellSize.width*0.25) / this.studentPanelBG.getContentSize().height);
    },

     studentsPreviewPanel: function () {
       let bgSprite = new cc.Sprite(lesson_1.resourcePath + "student_panel_bg_horizontal.png");
       bgSprite.setAnchorPoint(cc.p(0,0));
       bgSprite.setOpacity(0);
       this.studentPreviewPanelHeight = bgSprite.height * 0.2;
       var scrollView = new cc.ScrollView(
            cc.size(bgSprite.width, this.studentPreviewPanelHeight),
            bgSprite
        );
        scrollView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        scrollView.setTouchEnabled(true);
        scrollView.setBounceable(false);
        //scrollView.setPosition(this.studentPanelScrollViewDefaultPos);
        scrollView.setTag(lesson_1.Tag.studentPreviewScrollView);
        scrollView.setVisible(false);
        this.handIconUI.push(scrollView);
        this.addChild(scrollView, this.lessonZOrder);
        },

    studentPreviewCellCallback: function (sender, type) {
        let scrollView = this.getChildByTag(lesson_1.Tag.studentPreviewScrollView);
        switch (type) {
            case ccui.Widget.TOUCH_ENDED: {
                let prevSelectedCell = scrollView.getContainer().getChildren().find(item => item.getName() === this.activePreviewStudentName);
                if(prevSelectedCell && prevSelectedCell.getName() === sender.getName()){
                    this.activePreviewStudentName = '';
                }
                else{
                    this.activePreviewStudentName = sender.getName();
                }
                let isSelected = this.activePreviewStudentName ? true : false;
                this.reloadStudentPreviewList();
                let activityLayer = lesson_1.ref.currentActivity;
                if(activityLayer.onStudentPreviewCellClicked){
                   activityLayer.onStudentPreviewCellClicked(sender.getName(), isSelected, scrollView.getContainer());
               }

            }
        }
    },

    createStudentPreviewCell: function (studentName) {
        let studentBg = new ccui.Button(
          lesson_1.resourcePath + "student_icon_bg_defoult.png",
          lesson_1.resourcePath + "student_icon_bg_defoult.png"
        );
        studentBg.addTouchEventListener(this.studentPreviewCellCallback, this);
        studentBg.setName(studentName);

        let nameLabel = this.createTTFLabel(
          studentName,
            HDConstants.Sassoon_Regular,
          45,
          HDConstants.White,
          cc.p(studentBg.width * 0.5, studentBg.height * 0.1),
          studentBg
        );

        let studentIcon = this.addSprite(
          lesson_1.resourcePath + "student_icon_defoult.png",
          cc.p(studentBg.width * 0.5, studentBg.height * 0.5),
          studentBg
        );
        studentIcon.setTag(1);

        return studentBg;
    },

    reloadStudentPreviewList: function () {
        if(!this.isTeacherView){
            return;
        }
        // adding teacher to list
        let scrollView = this.getChildByTag(lesson_1.Tag.studentPreviewScrollView);
        lesson_1.ref.studentList.unshift(HDAppManager.username);
        let count = lesson_1.ref.studentList.length;
        let maxCapacity = 9;
        let cellSize = 64; // this.studentPreviewPanelHeight * 0.8
        let h_padding = 8;
        let maxScrollViewWidth = (cellSize + h_padding) * maxCapacity + h_padding;
        let x_pos = this.studentPanelScrollViewDefaultPos.x;
        let next_x_coord = h_padding + cellSize * 0.5;
        let innerContainerWidth = count * (cellSize + h_padding) + h_padding;
        if(count < maxCapacity){
            x_pos = (maxScrollViewWidth - innerContainerWidth) / 2 + this.studentPanelScrollViewDefaultPos.x - cellSize * 0.5;
        }
        scrollView.setPosition(cc.p(x_pos, this.studentPanelScrollViewDefaultPos.y));
        scrollView.setViewSize(cc.size(innerContainerWidth, this.studentPreviewPanelHeight));
        scrollView.setContentSize(innerContainerWidth, this.studentPreviewPanelHeight);
        let container = scrollView.getContainer();
        container.removeAllChildrenWithCleanup();
        lesson_1.ref.studentList.map((studentName => {
           let student = this.createStudentPreviewCell(studentName);
           //student.setAnchorPoint(cc.p(0,0));
           student.setScale(cellSize / student.width, cellSize / student.height);
           student.setPosition(next_x_coord, this.studentPreviewPanelHeight * 0.5);
           if(student.getName() === this.activePreviewStudentName){
               student.loadTextureNormal(lesson_1.resourcePath + "student_icon_bg_clicked.png");
               student.loadTexturePressed(lesson_1.resourcePath + "student_icon_bg_clicked.png");
               student.getChildByTag(1).setTexture(lesson_1.resourcePath + "student_icon_clicked.png");
           }
           scrollView.addChild(student);
           next_x_coord = student.x + cellSize + h_padding;
        }));
         lesson_1.ref.studentList.shift();
    },

    setStudentsPreviewPanelActive: function (status) {
       let studentPanelScrollView = this.getChildByTag(lesson_1.Tag.studentPreviewScrollView);
       studentPanelScrollView.setVisible(status);
    },

    /**
     * setStudentPanelActive will be called from activity to hide mouse control panel.
     * @param status
     */
    setStudentPanelActive : function(status){
        let mouseControlButton = lesson_1.ref.getChildByTag(lesson_1.Tag.mouseControl);
        if(mouseControlButton){
            mouseControlButton.setTouchEnabled(status);
            mouseControlButton.setOpacity(status ? 255 :100);
            this.toggleMouseControlPanel(!status);
        }
    },

    /**
     *
     * Student name cell
     * @param container
     * @param index
     * @returns {*}
     */
    createStudentCell : function(container, index){
        let nameBg = this.createButton("res/LessonResources/btn_student_enable.png", "res/LessonResources/btn_student_enable.png",
            "", 0, lesson_1.Tag.studentListStart + index, cc.p(0,0), container, this);
        nameBg.addTouchEventListener(this.selectedStudentCallback, this);
        nameBg.setScale(0.5);
        nameBg.name = this.createTTFLabel(lesson_1.ref.studentList[index], HDConstants.Sassoon_Regular,
            20, HDConstants.Black, cc.p(nameBg.getContentSize().width * 0.45, nameBg.getContentSize().height * 0.5), nameBg);
        nameBg.name.setAnchorPoint(cc.p(0.5, 0.5));
        this.studentCellSize = cc.size(nameBg.getContentSize().width * nameBg.getScale(),  nameBg.getContentSize().height * nameBg.getScale());
        nameBg.isActive = false;
        nameBg.tag = lesson_1.Tag.onlineButton;
        this.handIconUI.push(nameBg);
        return nameBg;
    },

    /**
     * toggleMouseControlPanel :
     * @param status
     */
    toggleMouseControlPanel(status) {
        let scrollView = lesson_1.ref.getChildByTag(lesson_1.Tag.studentScrollView);

        if(!this.isTeacherView || !this.mouseControl || !scrollView) {
            if(this.studentPanelBG)
            this.studentPanelBG.setVisible(false);
            return;
        }
        let count = lesson_1.ref.studentList.length;
        let cellSize = this.studentCellSize;
        if(status === undefined)
            status = scrollView.isVisible();
        if (!status) {
            let container = scrollView._container;
            container.setContentSize(cc.size(cellSize.width, cellSize.height*0.2 * (count - 1) + (count * cellSize.height)));
            this.studentPanelBG.setScale((container.getContentSize().width + this.studentCellSize.width*0.125  ) / this.studentPanelBG.getContentSize().width, (container.getContentSize().height + this.studentCellSize.width*0.125) / this.studentPanelBG.getContentSize().height);
            let j = 0;
            container.getChildren().forEach( (element)=>{
                element.setVisible(false);
            });
            for (var i = 0; i < count; ++i) {
                let student = container.getChildByTag(lesson_1.Tag.studentListStart + i);
                if(!student) {
                    student = lesson_1.ref.createStudentCell(container, i);
                    student.setPosition(container.getContentSize().width * 0.5, container.getContentSize().height - (cellSize.height * i * 1.2 + this.studentCellSize.height*0.5));
                }
                student.setVisible(true);
                student.name.setString(lesson_1.ref.studentList[i]);
                student.loadTextureNormal("res/LessonResources/btn_student_disable.png");
                student.loadTexturePressed ("res/LessonResources/btn_student_disable.png");
                if( this.activeStudent && this.activeStudent.name.getString() == student.name.getString()){
                    student.loadTextureNormal("res/LessonResources/btn_student_enable.png");
                    student.loadTexturePressed("res/LessonResources/btn_student_enable.png");
                    this.activeStudent = student;
                }else if(lesson_1.ref.activeStudentList.length > 0){
                    if(lesson_1.ref.activeStudentList.indexOf(student.name.getString()) != -1 ){
                        student.loadTextureNormal("res/LessonResources/btn_student_enable.png");
                        student.loadTexturePressed("res/LessonResources/btn_student_enable.png");
                    }
                }
            }
        }
        scrollView.setVisible(!status);
        this.studentPanelBG.setVisible(!status);
        if(lesson_1.ref.studentList.length < 2){
            this.studentPanelBG.setVisible(false);
        }
        let mouseControlButton = this.getChildByTag(lesson_1.Tag.mouseControl);
        mouseControlButton.loadTextureNormal(lesson_1.resourcePath + (!status? 'btn_selected.png' : 'btn_idle.png'));
        let mouseButtonSprite = mouseControlButton.getChildByTag(1);
        mouseButtonSprite.setTexture(lesson_1.resourcePath + (!status? 'cursor_active_icon.png' : 'cursor_idle_icon.png'));
        mouseButtonSprite.setScale(mouseControlButton.width * 0.5 / mouseButtonSprite.width, mouseControlButton.height * 0.5 / mouseButtonSprite.height);
    },

    /**
     * Callback of student mouse control
     * @param sender
     * @param type
     */
    selectedStudentCallback : function (sender, type) {
        console.log(" selected student callback");
        switch (type) {
            case  ccui.Widget.TOUCH_ENDED:
                var status = false;
                let activityLayer = lesson_1.ref.currentActivity;
                if(activityLayer && activityLayer.isTurnSwitchingBlocked) {
                    status = activityLayer.isTurnSwitchingBlocked();
                    if (status)
                        return;
                }
                if(this.turnBased) {
                    if (this.activeStudent) {
                        this.activeStudent.loadTextureNormal("res/LessonResources/btn_student_disable.png");
                        this.activeStudent.loadTexturePressed("res/LessonResources/btn_student_disable.png");
                        if (sender != this.activeStudent) {
                            sender.loadTextureNormal("res/LessonResources/btn_student_enable.png");
                            sender.loadTexturePressed("res/LessonResources/btn_student_enable.png");
                        } else {
                            if (lesson_1.ref.currentActivity.updateStudentTurn) {
                                lesson_1.ref.currentActivity.updateStudentTurn(null);
                                this.activeStudent = null;
                                return;
                            }
                        }
                    } else {
                        sender.loadTextureNormal("res/LessonResources/btn_student_enable.png");
                        sender.loadTexturePressed("res/LessonResources/btn_student_enable.png");
                    }
                    this.activeStudent = sender;
                    if (lesson_1.ref.currentActivity.updateStudentTurn) {
                        lesson_1.ref.currentActivity.updateStudentTurn(sender.name.getString());
                    }
                    break;
                }else{
                    if(sender.isActive){
                        sender.loadTextureNormal("res/LessonResources/btn_student_disable.png");
                    }else{
                        sender.loadTextureNormal("res/LessonResources/btn_student_enable.png");
                    }
                    if(lesson_1.ref.currentActivity && lesson_1.ref.currentActivity.updateStudentInteraction){
                        lesson_1.ref.currentActivity.updateStudentInteraction(sender.name.getString(), !sender.isActive);
                    }
                    sender.isActive = !sender.isActive;
                    if(sender.isActive){
                        lesson_1.ref.activeStudentList.push(sender.name.getString());
                    }else{
                        lesson_1.ref.activeStudentList.splice( lesson_1.ref.activeStudentList.indexOf(sender.name.getString()), 1);
                    }
                }
        }
    },

    /**
     * Launch a particular activity with index
     * @param index
     */
    launchActivity : function(index){
        console.log(" launch activity idx ", index);
        CMProcessIndicator.removeLoadingIndicator(lesson_1.ref);
        cc.$("#gameCanvas").style.cursor = "default";
        this.activityIdx = (index || this.activityIdx);
        if(this.getChildByTag(lesson_1.Tag.activeActivityTag))
            this.getChildByTag(lesson_1.Tag.activeActivityTag).removeFromParent(true);
        if(this.isTeacherView){
            this.updateScript(HDConstants.defaultTeacherScript.ops);
            this.updateTip(HDConstants.defaultTeacherTip.ops);
            this.showScript(false);
            this.showTip(false, 1);
            this.setResetButtonActive(false);
        }
        let layer =  eval ("new " +  lesson_1.config.activityGame[this.activityIdx].namespace.toString() +"."+ lesson_1.config.activityGame[this.activityIdx].layerName.toString() + "()");
        this.addChild(layer, 0);
        lesson_1.ref.currentActivity = layer;
        if(lesson_1.config.activityGame[this.activityIdx].controls.mouse) {
            lesson_1.ref.mouseControl = lesson_1.config.activityGame[this.activityIdx].controls.mouse;
            this.setStudentPanelActive(true);
        }else{
            lesson_1.ref.mouseControl = false;
        }
        if(lesson_1.config.activityGame[this.activityIdx].controls.turnBased) {
            lesson_1.ref.turnBased = lesson_1.config.activityGame[this.activityIdx].controls.turnBased;
        }else{
            lesson_1.ref.turnBased = false;
        }
        if(this.isTeacherView){
            this.activePreviewStudentName = '';
            this.reloadStudentPreviewList();
            this.reloadStudentRewardCell();
            this.setStudentsPreviewPanelActive( lesson_1.config.activityGame[this.activityIdx].studentPreview);
        }
        lesson_1.ref.activeStudentList.length = 0;
        layer.setTag(lesson_1.Tag.activeActivityTag);
        this.updateActivityBar();
        lesson_1.ref.activeStudent = null;
        this.toggleMouseControlPanel();
        this.mouseControlStatus();
        if(this.activityIdx ==  (lesson_1.config.activityGame.length - 1) && this.isTeacherView){
        }
        if(this.isTeacherView){
            var rewardButton =  lesson_1.ref.getChildByTag(lesson_1.Tag.rewardButton)
            rewardButton.setVisible(HDAppManager.isTeacherView &&  lesson_1.config.activityGame[this.activityIdx].externalRewards);

        }

    },
    /**
     * Socket event to create a room
     * @param capacity
     */
    connectRoom: function(capacity) {
        this.emitSocketEvent(HDSocketEventType.CREATE_ROOM, {"capacity" : capacity});
    },
    /**
     * Join a room with roomid
     * @param roomId
     */
    joinRoom: function(roomId) {
        this.emitSocketEvent(HDSocketEventType.JOIN_ROOM, {"roomId": roomId, "userType": (HDAppManager.isTeacherView ? 1 : 2) });
    },

    /**
     * Create a room
     */
    createRoom(){
        this.isPendingRoomJoinReq = true;
        if(!SocketManager.isSocketConnected()){
            this.connectSocket();
            return;
        };

        this.isPendingRoomJoinReq = false;
        if(!HDAppManager.roomId){
            if(HDAppManager.isTeacherView) {
                lesson_1.ref.connectRoom(8);
            }
        }


    },
    /**
     * Join a room
     *  */
    joinARoom(){
        this.isPendingRoomJoinReq = true;
        if(!SocketManager.isSocketConnected()){
            this.connectSocket();
            return;
        } else{
            lesson_1.ref.joinRoom(HDAppManager.roomId);
        }
    },

    //********************************* Socket Events ************************************************
    //Socket Methods
    //Socket implementation
    setupSocket : function() {
        this.connectSocket();
        this.subscribeToEvents();
    },

    addBackgroundAndForegroundAppListeners: function () {
        this.gameShowListener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: cc.game.EVENT_SHOW,
            callback: this.onApplicationForeground
        });
        this.gameHideListener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: cc.game.EVENT_HIDE,
            callback: this.onApplicationBackground
        });
        cc.eventManager.addListener(this.gameShowListener, this);
        cc.eventManager.addListener(this.gameHideListener, this);
    },

    onApplicationForeground: function (event) {
        console.log(" Foreground called");
        if(SocketManager.socket){
            lesson_1.ref.setupSocket();
        }
        // if (HDAppManager.socket)
        //    HDAppManager.socket.emit(SocketEventKey.GetServerTimeKey);
    },
    onApplicationBackground : function (event){
        console.log(" on backgroud");
    },
    /**
     * Subscribe socket event
     */
    subscribeToEvents: function () {
        if (SocketManager.socket == null || (!SocketManager.isSocketConnected())) {
            SocketManager.subscribeEvent("connect", this.onSocketConnect);
            SocketManager.subscribeEvent("disconnect", this.onSocketDisconnect);
            SocketManager.subscribeEvent("SingleEvent", this.socketListener);
        }
    },
    /**
     * Socket Event listener"
     * Every Activity must have this method to listen socket event
     * @param res
     */
    socketListener : function(res){
        switch (res.eventType) {
            case HDSocketEventType.CREATE_ROOM:
                lesson_1.ref.onRoomCreated(res.data);
                break;
            case HDSocketEventType.JOIN_ROOM:
                lesson_1.ref.onRoomJoined(res.data);
                break;
            case HDSocketEventType.STUDENT_STATUS:
                lesson_1.ref.onStudentStatusUpdate(res.data);
                break;
            case HDSocketEventType.STUDENT_TURN:
                lesson_1.ref.onStudentTurn(res);
                break;
            case HDSocketEventType.COMPLETE_LESSON:
                lesson_1.ref.onLessonCompleted(res);
                break;
            case HDSocketEventType.SYNC_DATA:
                lesson_1.ref.onSyncData(res);
                break;
            case HDSocketEventType.LAUNCH_ACTIVITY:
                if(!HDAppManager.isTeacherView) {
                    let data = JSON.parse(res.data);
                    lesson_1.ref.updateActivity(data['activityIndex']);
                }
                break;
            case HDSocketEventType.REWARD_RECEIVED:
                 if(!HDAppManager.isTeacherView)
                lesson_1.ref.onRewardReceive(res.data);
                break;
        }
        if(lesson_1.ref && lesson_1.ref.currentActivity && lesson_1.ref.currentActivity.socketListener){
            lesson_1.ref.currentActivity.socketListener(res);
        }
    },
    /**
     * Connect to socket.
     */
    connectSocket : function () {
        if (SocketManager.socket == null || (!SocketManager.isSocketConnected())) {
            SocketManager.connect();
        }
    },
    /**
     * LEsson complete button callback and emit socket event for the same.
     * @param sender
     * @param type
     */
    lessonComplete : function(sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                this.emitSocketEvent(HDSocketEventType.COMPLETE_LESSON, {"roomId": HDAppManager.roomId})
                break;
        }
    },
    /**
     * Socket connect event callback
     */
    onSocketConnect: function() {
        var label =  lesson_1.ref.getChildByTag(lesson_1.Tag.connectionStatusLabelTag);
        label.setString('connected');
        label.setColor(HDConstants.Green);
        label.setString('connected');
        if(HDAppManager.roomId != -1){
            lesson_1.ref.joinRoom(HDAppManager.roomId);
        }
    },
    /**
     * Socket Disconnect event callback
     */
    onSocketDisconnect: function () {
        var label =  lesson_1.ref.getChildByTag(lesson_1.Tag.connectionStatusLabelTag);
        label.setString('disconnected');
        label.setColor(HDConstants.RedColor);
    },
    /**
     * Room created callback
     * @param res: Room info
     */
    onRoomCreated: function(res) {
        this.roomLayer.removeFromParent(true);
        lesson_1.ref.roomId = res.roomId;
        HDAppManager.roomId = lesson_1.ref.roomId;
        //Temp remove it-----------------------------
        lesson_1.ref.addRoomIdLabel(res.roomId);
        if(HDAppManager.isTeacherView) {
            this.startLessonTimer(lesson_1.config.properties.timer * 60, false);
            this.emitSocketEvent(HDSocketEventType.LESSON_START_AT, {"roomId": res.roomId, "userType": (HDAppManager.isTeacherView ? 1 : 2) });
        }

        if (!this.currentActivity ) {
            this.startActivityTimer(lesson_1.config.activityGame[this.activityIdx].allocatedTime * 60);
            HDAppManager.setActivityStartTime(new Date().getTime());
            this.activityIdx = 0;
            this.launchActivity(this.activityIdx);
        }



        //-------------------------------------------------
    },
    /**
     * on student connect/disconnect callback
     * @param res
     */
    onStudentStatusUpdate : function(res){
        console.log("data", res);
        if(res.data && res.roomId && parseInt(res.roomId) != HDAppManager.roomId )
            return;
        if(lesson_1.ref.activeStudent && (res.users.map(user => user.userName).indexOf(lesson_1.ref.activeStudent.name.getString()) == -1)){
            lesson_1.ref.activeStudent = null;
        }

        if(parseInt(res.roomId) == HDAppManager.roomId) {
            lesson_1.ref.studentList.length = 0;
            lesson_1.ref.studentRewardList.length = 0;
            res.users.forEach((element)=>{
                if(element.userName != HDAppManager.username){
                    lesson_1.ref.studentList.push(element.userName);

                }

            });


            res.users.forEach((element)=>{
                if(element.userId != res.teacherId){
                    lesson_1.ref.studentRewardList.push({
                        name : element.userName,
                        rewards : element.rewards,
                        starColor : element.starColor == -1 ? 7  : element.starColor
                    });
                }

            });

            lesson_1.ref.studentRewardList.sort((a,b) => a.starColor - b.starColor);

            for(let  i = 0; i < lesson_1.ref.activeStudentList.length; ++i){
                let student  = lesson_1.ref.activeStudentList[i];
                let found = false;
                for(let j = 0; j < res.users.length; ++j){
                   if(res.users[j].userName == student){
                       found = true;
                       break;
                   }
               }
                if(!found) {
                    lesson_1.ref.activeStudentList.splice(i, 1);
                }
            }

            if(lesson_1.ref.studentList.length == 0){
                lesson_1.ref.activeStudent = null;
            }

            if(lesson_1.ref.studentRewardList.length > 1 || lesson_1.ref.studentRewardList.length ==0 ){
                lesson_1.ref.isMultiPlayer = true;
                this.updateRewardInfo(null, null);
            }else if(lesson_1.ref.studentRewardList.length == 1){
                lesson_1.ref.isMultiPlayer = false;
                this.updateRewardInfo(null,  lesson_1.ref.studentRewardList[0].rewards);
            }
            if(lesson_1.ref.studentRewardList.length <= 1 && this.isRewardPanelVisible && HDAppManager.isTeacherView ){
                    this.hideStudentRewardPanel();
            }

            console.log("studentList",lesson_1.ref.studentList);
            console.log("active student list", lesson_1.ref.activeStudent);
            console.log("lesson_1.ref.studentRewardList", lesson_1.ref.studentRewardList);
            lesson_1.ref.toggleMouseControlPanel(false);
            lesson_1.ref.reloadStudentPreviewList();
            if( lesson_1.ref.getChildByTag(lesson_1.Tag.rewardButton).isVisible()){
                lesson_1.ref.reloadStudentRewardCell();
            }

        }
    },
    /**
     * onStudentTurn: callback on student turn
     * @param res
     */
    onStudentTurn : function(res){
        if(!lesson_1.ref.isTeacherView)
            return;
        if(res.data && res.roomId && parseInt(res.roomId) != HDAppManager.roomId )
            return;
        let users = res.data.users;
        if(users.length === 0) {
            if(lesson_1.ref.activeStudent){
                lesson_1.ref.activeStudent.loadTextureNormal("res/LessonResources/btn_student_disable.png");
                lesson_1.ref.activeStudent.loadTexturePressed("res/LessonResources/btn_student_disable.png");
            }
            return;
        }
        let scrollView = lesson_1.ref.getChildByTag(lesson_1.Tag.studentScrollView);
        let count = lesson_1.ref.studentList.length;
        if (!scrollView || !lesson_1.ref.mouseControl) {
            return;
        }
        let container = scrollView._container;
        for(let j = 0; j < users.length; ++j) {
            let studentName = users[j].userName;
            container.getChildren().forEach((child)=>{
                if (child && child.name.getString() == studentName){
                    if(lesson_1.ref.activeStudent){
                        lesson_1.ref.activeStudent.loadTextureNormal("res/LessonResources/btn_student_disable.png");
                        lesson_1.ref.activeStudent.loadTexturePressed("res/LessonResources/btn_student_disable.png");
                    }
                    child.loadTextureNormal("res/LessonResources/btn_student_enable.png");
                    child.loadTexturePressed("res/LessonResources/btn_student_enable.png");
                    lesson_1.ref.activeStudent = child;
                }
            });
        }
    },
    /**
     * Socket callback on room joined
     * @param data
     */
    onRoomJoined: function(data) {
        console.log("on room joined", data);
        lesson_1.ref.addRoomIdLabel(data.roomId);
        lesson_1.ref.onSyncData(data);
        lesson_1.ref.isInsideRoom = true;
        if(!HDAppManager.isTeacherView){
            lesson_1.ref.updateRewardInfo(null, data.rewards);
        }
        if(this.isTeacherView && !this.lessonHDTimer.isTimerRunning()){
           var delay = lesson_1.ref.calculateElapsedTime(data.startAt);
           if(delay > lesson_1.config.properties.timer * 60){
               this.startLessonTimer(0, true);
           }else{
               this.startLessonTimer(lesson_1.config.properties.timer * 60, true);
               this.lessonHDTimer.updateProgress(delay);

           }

        }
    },
    /**
     * on Lesson completed callback
     * @param res
     */
    onLessonCompleted: function(res){
        var alertText = HDAppManager.isTeacherView ? "Lesson has been marked as completed." : "Lesson has been marked as completed by Teacher."
        window.alert(alertText);
        window.location.reload();
    },
    /**
     * Emit socket event
     * @param type
     * @param data
     */
    emitSocketEvent : function(type, data){
    SocketManager.emitCutomEvent(lesson_1.socketEventKey.singleEvent, {'eventType': type, 'roomId':HDAppManager.roomId, 'data':data});
    },

    /**
     * show teacher script
     * @param val
     */
    showScript :function(val) {
        let scriptButton = this.getChildByTag(lesson_1.Tag.messageButton);
        scriptButton.setUserData(val);
        scriptButton.loadTextureNormal(lesson_1.resourcePath + (val? 'btn_selected.png' : 'btn_idle.png'));
        scriptButton.getChildByTag(1).setTexture(lesson_1.resourcePath + (val? 'script_active_icon.png' : 'script_idle_icon.png'));
        let scriptBubble = this.getChildByTag(lesson_1.Tag.scriptMessage);
        if (scriptBubble){
            scriptBubble.setVisible(val);
        }
    },

    showTip: function (isAvailable, sender) {
        let tipButton = this.getChildByTag(lesson_1.Tag.shortcutButton);
        let tipBubble = this.getChildByTag(lesson_1.Tag.tipMessage);
        tipButton.loadTextureNormal(lesson_1.resourcePath + (isAvailable? 'btn_selected.png' : 'btn_idle.png'));
        tipButton.getChildByTag(1).setTexture(lesson_1.resourcePath + (isAvailable ? 'tip_active_icon.png' : 'tip_idle_icon.png'));

        if (tipBubble && sender){
            tipBubble.setVisible(isAvailable);
        }

        if(sender == null && isAvailable){
            isAvailable = !isAvailable;
        }

        tipButton.setUserData(isAvailable);


    },

    mouseControlStatus : function(){
        let scrollView = lesson_1.ref.getChildByTag(lesson_1.Tag.studentScrollView);
        if(scrollView)
        scrollView.setVisible(lesson_1.ref.mouseControl);
        let mouseButton =  lesson_1.ref.getChildByTag(lesson_1.Tag.mouseControl);
        if(mouseButton)
        {
            mouseButton.setOpacity(lesson_1.ref.mouseControl ? 255: 100);
            mouseButton.setTouchEnabled(lesson_1.ref.mouseControl);
            if(!lesson_1.ref.mouseControl){
                let mouseButtonSprite = mouseButton.getChildByTag(1);
                mouseButtonSprite.setTexture(lesson_1.resourcePath + 'cursor_inactive_icon.png');
                mouseButtonSprite.setScale(mouseButton.width / mouseButtonSprite.width, mouseButton.height / mouseButtonSprite.height);
            }
            this.toggleMouseControlPanel(!lesson_1.ref.mouseControl);
        }
    },

    updateActivity(index){
        index = index < 0 ? 0 : index;
        this.activityIdx = index % (lesson_1.config.activityGame.length + 1);
        if(this.isTeacherView){
            this.emitSocketEvent(HDSocketEventType.LAUNCH_ACTIVITY,  JSON.stringify({"lesson" : "1", "activityIndex": this.activityIdx}));
            HDAppManager.setActivityStartTime(new Date().getTime());
            this.startActivityTimer(lesson_1.config.activityGame[this.activityIdx].allocatedTime * 60);  // when we switch to new activity
        }
        //
        //check If Resource Loaded
        //
        if(!HDAppManager.loadedResIndex.includes(this.activityIdx)){
            console.log(" not loaded loading");
            lesson_1.ref.loadingResLabelSetActive(true);
            HDAppManager.nextActivityIdx = lesson_1.ref.activityIdx;
            CMProcessIndicator.addLoadingIndicator(lesson_1.ref);
            cc.eventManager.addCustomListener("loadedActivity", (data)=>{
                console.log(" loaded activity ", data.getUserData());
                if(data.getUserData() == lesson_1.ref.activityIdx) {
                    lesson_1.ref.launchActivity(lesson_1.ref.activityIdx);
                    lesson_1.ref.loadingResLabelSetActive(false);
                    cc.eventManager.removeCustomListeners("loadedActivity");
                }
            });

        }else{
            this.launchActivity(this.activityIdx);
        }


    },
    /**
     *
     */
    addMouseListener : function() {
        var ref = this;
        cc.eventManager.addListener(cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseDown: function(event){
                if(!lesson_1.ref.checkIfMouseClickedOnPreviewPanel(event)){
                    lesson_1.ref.checkIfMouseClickedOnMouseControlPanel(event);
                    lesson_1.ref.checkIfMouseClickedOutSideRewardPanel(event);
                }
                lesson_1.ref.updateMouseIcon(event);
                lesson_1.ref.prevMouseLocation = event.getLocation();
            },
            onMouseMove: function(event) {
              lesson_1.ref.updateMouseIcon(event);
              lesson_1.ref.dragStudentPreviewPanel(event);
              lesson_1.ref.moveStudentPanel(event);

            },
            onMouseUp : function (event) {
                lesson_1.ref.isMouseOnMouseControlPanel = false;
                lesson_1.ref.isMouseOnPreviewPanel = false;
                lesson_1.ref.mousePosDiff = null;
                lesson_1.ref.updateMouseIcon(event);
            }
        }), this);

    },

    checkIfMouseClickedOnMouseControlPanel: function (event) {
        if(this.getChildByTag(lesson_1.Tag.studentScrollView) &&
            this.getChildByTag(lesson_1.Tag.studentScrollView).isVisible() &&
            cc.rectContainsPoint(this.studentPanelBG.getBoundingBox(), this.studentPanelBG.parent.convertToNodeSpace(event.getLocation()))){
            this.isMouseOnMouseControlPanel = true;
            return true;
        }
    },
    checkIfMouseClickedOutSideRewardPanel : function(event){
        if(this.isRewardPanelVisible){
            var rewardPanel = this.rewardDropDown.getChildByTag(lesson_1.Tag.rewardPanelBg);
            var  buttonDrag = this.rewardDropDown.getChildByTag(lesson_1.Tag.bottomDrag);
            var rewardButton = this.getChildByTag(lesson_1.Tag.rewardButton);
            if(cc.rectContainsPoint(rewardPanel.getBoundingBox(), this.rewardDropDown.convertToNodeSpace(event.getLocation())) || cc.rectContainsPoint(buttonDrag.getBoundingBox(), this.rewardDropDown.convertToNodeSpace(event.getLocation()) )){
                // console.log("chicmic");
            }else{
                if(this.isTeacherView){
                    this.hideStudentRewardPanel();
                }

            }
        }

    },
    /**
     temporarily added return false to prevent dragging
    */
    checkIfMouseClickedOnPreviewPanel: function (event) {
        return false;
        let studentPreviewPanelScrollView = this.getChildByTag(
            lesson_1.Tag.studentPreviewScrollView
        );
        if (
            studentPreviewPanelScrollView && studentPreviewPanelScrollView.isVisible() &&
            cc.rectContainsPoint(
                studentPreviewPanelScrollView.getBoundingBox(),
                event.getLocation()
            )
        ){
            this.isMouseOnPreviewPanel = true;
            return true;
        }
    },

    dragStudentPreviewPanel: function (event) {
        let studentPreviewPanelScrollView = this.getChildByTag(
            lesson_1.Tag.studentPreviewScrollView
        );
        if (this.isMouseOnPreviewPanel && studentPreviewPanelScrollView && studentPreviewPanelScrollView.isVisible()) {
            let delta = cc.pSub(event.getLocation(), this.prevMouseLocation);
            let finalPos = cc.pClamp(
              cc.pAdd(studentPreviewPanelScrollView.getPosition(), delta),
              cc.p(0, 0),
              cc.p(
                cc.winSize.width - studentPreviewPanelScrollView.width,
                cc.winSize.height - studentPreviewPanelScrollView.height
              )
            );
            studentPreviewPanelScrollView.setPosition(finalPos);
        }
        this.prevMouseLocation = event.getLocation();
    },

    /**
     * mouseControlEnable: This method must be implemented in activity and return true false to show handle icon.
     *
     * @param event
     */
    updateMouseIcon(event){
        let activityGame = lesson_1.ref.getChildByTag(lesson_1.Tag.activeActivityTag);
        let cursorFound = false;
        for(let obj of  lesson_1.ref.handIconUI){
            if(cc.rectContainsPoint(obj.getBoundingBox(), obj.getParent().convertToNodeSpace(event.getLocation()))
                 && obj.isVisible() && obj.getParent() && obj.getParent().isVisible() && obj.getParent().getParent() &&
                obj.getParent().getParent().isVisible()){
                cursorFound = true;
                break;
            }
        }
        if(!cursorFound && activityGame && activityGame.mouseEventListener){
            activityGame.mouseEventListener(event);
        }

        let activityCursorFound = false;
        let activityCursorDetails = null;
        if(activityGame && activityGame.mouseControlEnable) {
            activityCursorFound = activityGame.mouseControlEnable(event.getLocation());
            if(activityCursorFound){
                if(activityGame.mouseTexture){
                    activityCursorDetails = activityGame.mouseTexture();
                    if(activityCursorDetails.hasCustomTexture){
                        lesson_1.ref.texture = activityCursorDetails.textureUrl;
                    }else{
                        lesson_1.ref.texture = null;
                    }
                }else{
                    lesson_1.ref.texture = null;
                }
            }else{
                lesson_1.ref.texture = null;
            }
        }else{
            lesson_1.ref.texture = null;
        }
        this.changeButtonTexture(event);
        let cursorValue = this.activityInfoOnMouseHover(event);
        cursorFound = cursorValue ? true : cursorFound;

        if (activityCursorFound) {
            cc.$("#gameCanvas").style.cursor = "pointer";
            if(lesson_1.ref.texture){
                if(lesson_1.ref.texture == 'none'){
                    cc.$("#gameCanvas").style.cursor = 'none';
                }else {
                    // lesson_1.ref.texture = "AsyncActivity/"+lesson_1.ref.texture;
                    cc.$("#gameCanvas").style.cursor = "url" + "(\'"  +'AsyncActivity/' + lesson_1.ref.texture + "\')" + "," + "auto";
                }
            }
        }
        if(cursorFound){
            cc.$("#gameCanvas").style.cursor = "pointer";
            this.moveStudentPanel(event);
        } else if(!activityCursorFound){
            cc.$("#gameCanvas").style.cursor = "default";
        }
    },

    moveStudentPanel : function(event){
        if(this.isMouseOnMouseControlPanel && this.getChildByTag(lesson_1.Tag.studentScrollView) && this.getChildByTag(lesson_1.Tag.studentScrollView).isVisible()){
            let mouseLocation = this.studentPanelBG.parent.convertToNodeSpace(event.getLocation());
            if(!this.mousePosDiff) {
                this.mousePosDiff = cc.p( mouseLocation.x - this.studentPanelBG.getPositionX(),
                    mouseLocation.y - this.studentPanelBG.getPositionY())
            }
            this.studentPanelBG.setPosition(mouseLocation.x - this.mousePosDiff.x, mouseLocation.y - this.mousePosDiff.y);
            let scrollList = this.getChildByTag(lesson_1.Tag.studentScrollView);
            if(scrollList && scrollList.isVisible()){
                scrollList.setPosition(this.studentPanelBG.getPositionX() + this.studentCellSize.width * 0.0625, this.studentPanelBG.getPositionY() + this.studentCellSize.width * 0.0625 )
            }
        }
    },

    /**
     * checkIfTurnChangeEnable: This will check if turn change is enabled or not.
     */
    checkIfStudentSwitchTurnDisabled : function(obj) {
        if(obj.tag == lesson_1.Tag.onlineButton) {
            let activityLayer = lesson_1.ref.currentActivity;
            if(activityLayer && activityLayer.isTurnSwitchingBlocked) {
                if (activityLayer.isTurnSwitchingBlocked())
                    return true;
            }
        }
        return false;
    },

    activityInfoOnMouseHover(event){
        let activityBar = lesson_1.ref.getChildByTag(lesson_1.Tag.activityParent);
        if(!activityBar) return;
        let activityLayer = activityBar.getContainer();
        let activitySize = activityBar.getViewSize();
        let activityBox = cc.rect(activityBar.getPositionX(),activityBar.getPositionY(), activitySize.width, activitySize.height);
        if(activityLayer) {
            var locationInNode = activityLayer.convertToNodeSpace(event.getLocation());
            let found = false;
            for(let i = 0; i <  lesson_1.config.activityGame.length; i++){
                let button = activityLayer.getChildByTag(lesson_1.Tag.activityTagStart + i);
                let buttonPosition = activityLayer.convertToWorldSpace(button.getPosition());
                if (cc.rectContainsPoint(button.getBoundingBox(), locationInNode) && cc.rectContainsPoint(activityBox,buttonPosition)) {
                    found = true;
                    lesson_1.ref.showActivityDialog(i);
                }
            }
            if(!found && !cc.rectContainsPoint( lesson_1.ref.getChildByTag(lesson_1.Tag.activityParent).getBoundingBox(),  lesson_1.ref.convertToNodeSpace(event.getLocation())) && !cc.rectContainsPoint( lesson_1.ref.getChildByTag(lesson_1.Tag.activityBox).getBoundingBox(),  lesson_1.ref.convertToNodeSpace(event.getLocation()))){
                lesson_1.ref.getChildByTag(lesson_1.Tag.activityBox).setVisible(false);
            }
            return found;
        }
        return false;
    },

    setActiveActivityInfo : function (status){
        lesson_1.ref.getChildByTag(lesson_1.Tag.activityBox).setVisible(status);
    },

    /**
     * temporarily added return to prevent hovering state
     * @param event
     */

    changeButtonTexture(event){
        return;
        for(let i = 0; i < 3; i++ ) {
            let button = lesson_1.ref.getChildByTag(i + lesson_1.Tag.messageButton);
            if(!button) {
                return;
            }
            if (!button.isEnabled()) {
                continue;
            }
            else if(cc.rectContainsPoint(button.getBoundingBox(), event.getLocation())){
                button.loadTextureNormal(lesson_1.resourcePath + "btn_hover.png");
            }
            // selected state
            else if(button.getUserData()){
                button.loadTextureNormal(lesson_1.resourcePath + "btn_selected.png");
            }
            else {
                button.loadTextureNormal(lesson_1.resourcePath + "btn_idle.png");
            }
        }
    },

    buttonCallback : function (sender, type) {
        var button      = sender;
        var Tag   = button.tag ;
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                switch (Tag) {
                    case lesson_1.Tag.playButton:
                        // console.log("reward animation completd", this.isRewardAnimationCompleted);
                        if(this.isRewardAnimationCompleted)
                        this.updateActivity(this.playActivity);
                        break;
                    case lesson_1.Tag.message:
                        break;
                    case lesson_1.Tag.replay:
                        if(lesson_1.ref.currentActivity.reset) {
                            this.setResetButtonActive(false);
                            lesson_1.ref.currentActivity.reset()
                        }
                        break;
                    case lesson_1.Tag.shortcutHelp:
                        break;
                    case lesson_1.Tag.mouseControl:
                        this.toggleMouseControlPanel();
                        break;
                    case lesson_1.Tag.leftArrow:
                        this.scrollActivityBar(1);
                        break;
                    case lesson_1.Tag.rightArrow:
                        this.scrollActivityBar(-1);
                        break;
                    case lesson_1.Tag.messageButton :
                        this.showScript(!button.getUserData());
                        break;
                    case lesson_1.Tag.shortcutButton:
                        this.showTip(!button.getUserData(), button);
                        break;
                    case lesson_1.Tag.teacherButton:
                        HDAppManager.isTeacherView = true;
                        this.isTeacherView = HDAppManager.isTeacherView;
                        this.buttonLayer.setVisible(false);
                        this.setupUI();
                        // this.setupTableView();
                        this.addEditBox();
                        break;
                    case lesson_1.Tag.studentButton:
                        HDAppManager.isTeacherView = false;
                        this.isTeacherView = HDAppManager.isTeacherView;
                        this.buttonLayer.setVisible(false);
                        this.setupUI();
                        // if (!this.currentActivity) {
                        //     this.activityIdx = 0;
                        //     this.launchActivity(this.activityIdx);
                        // }
                        this.addEditBox();
                        break;
                    case lesson_1.Tag.userNameEnterButton:
                        HDAppManager.username = this.userNameEditBox.getString().toLowerCase();
                        HDNetworkConfig.SocketDevURL = HDNetworkConfig.SocketDevURL + `?userName=${HDAppManager.username}`;
                        HDNetworkConfig.SocketStagingURL = HDNetworkConfig.SocketStagingURL + `?userName=${HDAppManager.username}`;
                        HDNetworkConfig.SocketProURL = HDNetworkConfig.SocketProURL + `?userName=${HDAppManager.username}`;
                        this.editBoxLayer.setVisible(false);
                        this.setupSocket();
                        this.setupButtonLayer();
                        break;
                    case lesson_1.Tag.createRoomButtom:
                        HDAppManager.roomId = this.roomIdEditBox.getString();
                        this.createRoom();
                        this.roleIdEditBoxLayer.setVisible(false);
                        this.setupLoadingLayer("Creating room...");
                        this.buttonLayer.setVisible(true);
                        break;
                    case lesson_1.Tag.joinRoomButton:
                        HDAppManager.roomId = this.roomIdEditBox.getString();
                        this.joinARoom();
                        this.roleIdEditBoxLayer.setVisible(false);
                        this.setupLoadingLayer("Joining room...");
                        this.buttonLayer.setVisible(true);
                        break;
                    case lesson_1.Tag.rewardButton:
                        if (lesson_1.ref.rewardAnimation.getNumberOfRunningActions() > 0 ||  this.studentList.length == 0)
                            return;
                        else {
                             sender.setTouchEnabled(false);
                             var data = {"studentUserName": lesson_1.ref.studentRewardList[0].name, "roomId": HDAppManager.roomId};
                             lesson_1.ref.isMultiPlayer ?  lesson_1.ref.showStudentRewardPanel() :  lesson_1.ref.sendRewardInfoToServer(data, sender, 8);

                        }
                        break;
                }
                break;
        }
    },
    sendRewardInfoToServer: function(data, sender, tag) {
        lesson_1.ref.isRewardAnimationCompleted = false;
        HDNetworkHandler.post(HDAPIRoute.teacher + HDAPIKey.rewardPoints, data, true, (err, data) =>{
            if(data){
                this.startRewardAnimation(tag, data.data.rewards, sender);
                this.studentRewardList[tag].rewards = data.data.rewards;
            }else{
                console.log("error" + err);
            }
        })
    },

    updateRewardInfo : function (ref, data) {
        var rewardLabel = lesson_1.ref.getChildByTag(lesson_1.Tag.rewardButton).getChildByTag(lesson_1.Tag.rewardLabel)
        if(data != null){
            rewardLabel.setString(data.toString());
            rewardLabel.setVisible(true);
        }else {
            if (HDAppManager.isTeacherView) {
                rewardLabel.setVisible(false);
            }
        }
    },

    startRewardAnimation: function (index,rewardCount,sender) {
        let animation = HDUtility.runFrameAnimation("res/LessonResources/AnimationFrames/reward_star_appear/reward_star_appear_", 22, 0.083, ".png", 1);
        let animation2 = HDUtility.runFrameAnimation("res/LessonResources/AnimationFrames/reward_star_track/reward_star_track_", 14, 0.083, ".png", 1);
        lesson_1.ref.rewardAnimation.setRotation(0);
        lesson_1.ref.rewardAnimation.setPosition(cc.p(cc.winSize.width*0.5, cc.winSize.height*0.5));

        var sprite = new cc.Sprite("res/LessonResources/starDummy.png");
        sprite.setPosition(lesson_1.ref.convertToNodeSpace(sender.getParent().convertToWorldSpace(sender.getPosition())));

        var starSpriteCompletion = new cc.CallFunc(function (){
            if(sprite) {
                sprite.setScale(0);
                sprite.removeFromParent();
                sprite = null;
            }
        });

        var starSprite = new cc.CallFunc(function (){
            lesson_1.ref.addChild(sprite,100);
            sprite.runAction(cc.sequence([cc.scaleTo(0.3,1.2),cc.scaleTo(0.1,0.8),starSpriteCompletion]));
        });

        var callBack = new cc.CallFunc(function () {
            var result = lesson_1.ref.getDataForRewardAnimation(index);
            lesson_1.ref.rewardAnimation.setRotation(result.angle);
            var moveAction = cc.moveTo(0.1, result.position);
            lesson_1.ref.rewardAnimation.runAction(cc.spawn([animation2, moveAction,cc.sequence([cc.delayTime(0.581),starSprite])]));
        });


        var completion = new cc.CallFunc(function () {
            sender.getChildByTag(lesson_1.Tag.rewardLabel).setString(rewardCount);
            if(HDAppManager.isTeacherView){
                lesson_1.ref.isRewardAnimationCompleted = true;
                sender.setTouchEnabled(true);
            }
          });


        lesson_1.ref.rewardAnimation.runAction(cc.sequence(animation, callBack, cc.delayTime(0.7), completion));

    },

    getDataForRewardAnimation: function (index) {
        let data = null;
        let arrayAngle = [7.5,
            14,
            20,
            26,
            32,
            38,
            44.5,
            50,
            0];
        let arrayPositionX = [cc.winSize.width * 0.442,
            cc.winSize.width * 0.42,
            cc.winSize.width * 0.41,
            cc.winSize.width * 0.4,
            cc.winSize.width * 0.397,
            cc.winSize.width * 0.4,
            cc.winSize.width * 0.42,
            cc.winSize.width * 0.437,
            cc.winSize.width * 0.475]
        data = {"angle": arrayAngle[index], "position": {"x": arrayPositionX[index], "y": cc.winSize.height * 0.5}};
        return data;
    },


    onRewardReceive: function (res) {
        if (res.userName == HDAppManager.username) {
            var rewardButton = lesson_1.ref.getChildByTag(lesson_1.Tag.rewardButton);
            lesson_1.ref.startRewardAnimation(8,res.rewards,rewardButton);
        }
    },


    /**
     * Return Added temprorily to hide script messsage
     * @param message
     */
    showScriptMessage(message) {
        console.log("message", message);
        if (!lesson_1.ref.isTeacherView) {
            return;
        }
        this.updateScript(message);
        this.showScript(true);
    },

    showTipMessage(message) {
        if (!lesson_1.ref.isTeacherView) {
            return;
        }
        this.updateTip(message);
        this.showTip(true, null);
    },

    setResetButtonActive: function (flag) {
        if(!HDAppManager.isTeacherView){
            return;
        }
        let resetButton = lesson_1.ref.getChildByTag(lesson_1.Tag.replay);
        resetButton.loadTextureNormal(lesson_1.resourcePath + `${flag ? 'btn_selected.png' : 'btn_idle.png'}`);
        resetButton.getChildByTag(1).setTexture(lesson_1.resourcePath + `${flag ? 'reset_active_icon.png' : 'reset_idle_icon.png'}`);
        resetButton.setTouchEnabled(flag);
    },

    createScriptBubble: function () {
        let messageButton = this.getChildByTag(lesson_1.Tag.messageButton);

        var scriptMessageHolderNode = new cc.Node();
        scriptMessageHolderNode.setPosition(cc.p(messageButton.x - messageButton.width * 0.5, messageButton.y + messageButton.height * 0.5 + this.getContentSize().height * 0.01));
        scriptMessageHolderNode.setTag(lesson_1.Tag.scriptMessage);
        scriptMessageHolderNode.setLocalZOrder(1000);
        scriptMessageHolderNode.setVisible(false);
        this.addChild(scriptMessageHolderNode);

        var scriptBubbleBottomSprite = this.addSprite(lesson_1.resourcePath + "script_bubble_bottom.png",cc.p(0,0),scriptMessageHolderNode);
        scriptBubbleBottomSprite.setTag(lesson_1.Tag.scriptBubbleBottom);
        scriptBubbleBottomSprite.setAnchorPoint(0,0);

        //
        let scriptBubbleTopSprite = this.addSprite(lesson_1.resourcePath + 'script_bubble_top.png', cc.p(0,0),scriptMessageHolderNode);
        scriptBubbleTopSprite.setAnchorPoint(cc.p(0,0));
        scriptBubbleTopSprite.setTag(lesson_1.Tag.script_bubble_top);
        //
        let scriptBubbleMiddleSprite = this.addSprite(lesson_1.resourcePath + 'script_bubble_middle.png', cc.p(0, scriptBubbleBottomSprite.y + scriptBubbleBottomSprite.height * 0.95), scriptMessageHolderNode);
        scriptBubbleMiddleSprite.setAnchorPoint(cc.p(0,0));
        scriptBubbleMiddleSprite.setTag(lesson_1.Tag.script_bubble_middle);


        let swallowTouchButton = new ccui.Button(lesson_1.resourcePath + "bubble_speech_buttom_left_small.png", lesson_1.resourcePath + "bubble_speech_buttom_left_small.png");
        swallowTouchButton.setAnchorPoint(cc.p(0,0));
        swallowTouchButton.setOpacity(0);
        swallowTouchButton.setTag(lesson_1.Tag.scriptBubbleSwallowTouch);
        scriptMessageHolderNode.addChild(swallowTouchButton, -1);

        var sv = new cc.ScrollView();
        sv.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        sv.setTouchEnabled(true);
        sv.setBounceable(false);
        sv.setTag(lesson_1.Tag.scriptScrollView);
        sv.setPosition(cc.p(0,scriptBubbleBottomSprite.y + scriptBubbleBottomSprite.height));
        sv.ignoreAnchorPointForPosition(false);
        sv.setAnchorPoint(cc.p(0,0));
        sv.setLocalZOrder(2);
        scriptMessageHolderNode.addChild(sv);

        this.handIconUI.push(scriptMessageHolderNode);
    },
    createTipBubble: function () {
        let shortcutButton = this.getChildByTag(lesson_1.Tag.shortcutButton);

        var tipMessageHolderNode = new cc.Node();
        tipMessageHolderNode.setPosition(cc.p(shortcutButton.x + shortcutButton.width * 0.5, shortcutButton.y + shortcutButton.height * 0.5 + this.getContentSize().height * 0.01));
        tipMessageHolderNode.setTag(lesson_1.Tag.tipMessage);
        tipMessageHolderNode.setLocalZOrder(1000);
        tipMessageHolderNode.setVisible(false);
        tipMessageHolderNode.setAnchorPoint(cc.p(1,0));
        this.addChild(tipMessageHolderNode);

        var tipBubbleBottomSprite = this.addSprite(lesson_1.resourcePath + "tip_bubble_bottom.png",cc.p(tipMessageHolderNode.width,0),tipMessageHolderNode);
        tipBubbleBottomSprite.setAnchorPoint(0,0);
        tipBubbleBottomSprite.setTag(lesson_1.Tag.tipBubbleBottom);
        tipBubbleBottomSprite.setLocalZOrder(1);

        let tipBubbleTopSprite = this.addSprite(lesson_1.resourcePath + 'tip_bubble_top.png', cc.p(tipMessageHolderNode.width,0),tipMessageHolderNode);
        tipBubbleTopSprite.setAnchorPoint(cc.p(0,0));
        tipBubbleTopSprite.setTag(lesson_1.Tag.tip_bubble_top);

        let tipBubbleMiddleSprite = this.addSprite(lesson_1.resourcePath + 'tip_bubble_middle.png', cc.p(tipMessageHolderNode.width, tipBubbleBottomSprite.y + tipBubbleBottomSprite.height * 0.95), tipMessageHolderNode);
        tipBubbleMiddleSprite.setAnchorPoint(cc.p(0,0));
        tipBubbleMiddleSprite.setTag(lesson_1.Tag.tip_bubble_middle);

        let swallowTouchButton = new ccui.Button(lesson_1.resourcePath + "bubble_speech_buttom_right_small.png", lesson_1.resourcePath + "bubble_speech_buttom_right_small.png");
        swallowTouchButton.setAnchorPoint(cc.p(0,0));
        swallowTouchButton.setOpacity(0);
        swallowTouchButton.setPosition(cc.p(tipMessageHolderNode.width, 0));
        swallowTouchButton.setTag(lesson_1.Tag.tipBubbleSwallowTouch);
        tipMessageHolderNode.addChild(swallowTouchButton, -1);

        var tipSv = new cc.ScrollView();
        tipSv.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tipSv.setTouchEnabled(true);
        tipSv.setBounceable(false);
        tipSv.setTag(lesson_1.Tag.tipScrollView);
        tipSv.setPosition(cc.p(tipMessageHolderNode.width,tipBubbleBottomSprite.y + tipBubbleBottomSprite.height));
        tipSv.ignoreAnchorPointForPosition(false);
        tipSv.setAnchorPoint(cc.p(0,0));
        tipSv.setLocalZOrder(2);
        tipMessageHolderNode.addChild(tipSv);
        this.handIconUI.push(tipMessageHolderNode);
    },

    updateScript : function(message) {
            var parseMessage = this.parseFormattedText(message);
            if(parseMessage.length <= 0){
                return ;
            }
            let scriptMessageHolderNode = this.getChildByTag(lesson_1.Tag.scriptMessage);
            let scriptBubbleBottomSprite = scriptMessageHolderNode.getChildByTag(lesson_1.Tag.scriptBubbleBottom);
            let scriptBubbleTopSprite = scriptMessageHolderNode.getChildByTag(lesson_1.Tag.script_bubble_top);
            let scriptBubbleMiddleSprite = scriptMessageHolderNode.getChildByTag(lesson_1.Tag.script_bubble_middle);
            let scriptScrollView = scriptMessageHolderNode.getChildByTag(lesson_1.Tag.scriptScrollView);
            scriptScrollView.getContainer().removeAllChildren();
            let labelsArr = [];
            let totalInnerHeight = 0;
            let maxLabelWidth = scriptBubbleBottomSprite.width * 0.80;
            let maxHeight = cc.winSize.height * 0.6;
            let yPadding = this.height * 0.015; // 0.01
            let paddingWidth = 0;
            for(var i in parseMessage){
                let labelRef = new HDCustomLabel(parseMessage[i].insert, HDConstants.Sassoon_Regular, 18.75, cc.size(maxLabelWidth, 0), parseMessage[i].attributes, paddingWidth);
                labelsArr.push(labelRef);
                paddingWidth = this.calculatePaddingForLabel(labelRef, maxLabelWidth);
                labelRef.setAnchorPoint(0, 1);
                totalInnerHeight += this.getInnerHeight(labelRef, yPadding);
            }
            scriptBubbleBottomSprite.setPosition(cc.p (scriptBubbleBottomSprite.getPositionX(), scriptBubbleBottomSprite.getPositionY()));
            scriptBubbleMiddleSprite.setScaleY(cc.clampf(totalInnerHeight,0, maxHeight) / scriptBubbleMiddleSprite.height);
            scriptBubbleTopSprite.setPositionY(scriptBubbleMiddleSprite.y + (scriptBubbleMiddleSprite.height * scriptBubbleMiddleSprite.scaleY) * .99);
            scriptMessageHolderNode.setContentSize(cc.size(scriptBubbleBottomSprite.width, scriptBubbleBottomSprite.height + scriptBubbleMiddleSprite.height * scriptBubbleMiddleSprite.scaleY + scriptBubbleTopSprite.height));
            let swallowTouchButton = scriptMessageHolderNode.getChildByTag(lesson_1.Tag.scriptBubbleSwallowTouch);
            swallowTouchButton.setScale(scriptBubbleBottomSprite.width/swallowTouchButton.width, scriptMessageHolderNode.height / swallowTouchButton.height);
            swallowTouchButton.setColor(HDConstants.Black);
            scriptScrollView.setViewSize(cc.size(scriptBubbleBottomSprite.width, cc.clampf(totalInnerHeight,0, maxHeight)));
            scriptScrollView.setContentSize(cc.size(scriptBubbleBottomSprite.width, totalInnerHeight));
            let prevLabelHeight = 0;
            let initialPosX = scriptScrollView.getViewSize().width * 0.1;
            let prevLabelYPosition = scriptScrollView.getContainer().getContentSize().height;
            for (let i = 0; i < labelsArr.length; ++i) {
                let labelRef = labelsArr[i];
                labelRef.setPosition(initialPosX, prevLabelYPosition);
                if(labelRef._enableUnderline){
                    labelRef.setunderLine(initialPosX, prevLabelYPosition);
                }
                if(labelRef.isNewLine){
                    prevLabelHeight = labelRef.getContentSize().height;
                    prevLabelYPosition = prevLabelYPosition - prevLabelHeight - yPadding;
                }else if( !labelRef.hasEmptySpace){
                    prevLabelHeight = labelRef.getContentSize().height;
                    prevLabelYPosition = prevLabelYPosition - prevLabelHeight;
                }else {
                    prevLabelYPosition = prevLabelYPosition - (labelRef.height - labelRef.lastStringHeight);
                }
                scriptScrollView.addChild(labelRef);
            }
            scriptScrollView.setContentOffset(scriptScrollView.minContainerOffset(), false);

    },

    updateTip: function (message) {
        var parseMessage = this.parseFormattedText(message);
        var tipMessageHolderNode = this.getChildByTag(lesson_1.Tag.tipMessage);
        let tipBubbleBottomSprite = tipMessageHolderNode.getChildByTag(lesson_1.Tag.tipBubbleBottom);
        let tipBubbleMiddleSprite = tipMessageHolderNode.getChildByTag(lesson_1.Tag.tip_bubble_middle);
        let tipBubbleTopSprite = tipMessageHolderNode.getChildByTag(lesson_1.Tag.tip_bubble_top);
        let tipScrollView = tipMessageHolderNode.getChildByTag(lesson_1.Tag.tipScrollView);
        tipScrollView.getContainer().removeAllChildren();
        var tip = message;
        let tipLabelsArr = [];
        let tipTotalInnerHeight = 0;
        let yPadding = this.height * 0.015; // 0.01
        let maxLabelWidth = tipBubbleBottomSprite.width * 0.80;
        let maxHeight = cc.winSize.height * 0.6;
        var paddingWidth =0;
        for(var i in parseMessage){
            let labelRef = new HDCustomLabel(parseMessage[i].insert, HDConstants.Sassoon_Regular, 18.75, cc.size(maxLabelWidth, 0), parseMessage[i].attributes, paddingWidth);
            tipLabelsArr.push(labelRef);
            paddingWidth = this.calculatePaddingForLabel(labelRef, maxLabelWidth);
            labelRef.setAnchorPoint(0, 1);
            tipTotalInnerHeight  += this.getInnerHeight(labelRef, yPadding);
        }
        tipBubbleMiddleSprite.setScaleY(cc.clampf(tipTotalInnerHeight,0, maxHeight) / tipBubbleMiddleSprite.height);
        tipBubbleTopSprite.setPositionY(tipBubbleMiddleSprite.y + (tipBubbleMiddleSprite.height * tipBubbleMiddleSprite.scaleY) * .99);
        tipMessageHolderNode.setContentSize(cc.size(tipBubbleBottomSprite.width, tipBubbleBottomSprite.height + tipBubbleMiddleSprite.height * tipBubbleMiddleSprite.scaleY + tipBubbleTopSprite.height));
        let swallowTouchButton = tipMessageHolderNode.getChildByTag(lesson_1.Tag.tipBubbleSwallowTouch);
        swallowTouchButton.setScaleY(tipMessageHolderNode.height / swallowTouchButton.height);

        tipScrollView.setViewSize(cc.size(tipBubbleBottomSprite.width, cc.clampf(tipTotalInnerHeight,0, maxHeight)));
        tipScrollView.setContentSize(cc.size(tipBubbleBottomSprite.width, tipTotalInnerHeight));
        let prevLabelHeight = 0;
        var initialPosition = tipScrollView.getViewSize().width * 0.1;
        let prevLabelYPosition = tipScrollView.getContainer().getContentSize().height;
        for (let i = 0; i < tipLabelsArr.length; ++i) {
            let labelRef = tipLabelsArr[i];
            labelRef.setPosition(initialPosition, prevLabelYPosition);
            if(labelRef._enableUnderline){
                labelRef.setunderLine(initialPosition, prevLabelYPosition);
            }
            if(labelRef.isNewLine){
                prevLabelHeight = labelRef.getContentSize().height;
                prevLabelYPosition = prevLabelYPosition - prevLabelHeight - yPadding;
            }else if( !labelRef.hasEmptySpace){
                prevLabelHeight = labelRef.getContentSize().height;
                prevLabelYPosition = prevLabelYPosition - prevLabelHeight;
            }else {
                prevLabelYPosition = prevLabelYPosition - (labelRef.height - labelRef.lastStringHeight);
            }
            tipScrollView.addChild(labelRef);
        }
        tipScrollView.setContentOffset(tipScrollView.minContainerOffset(), false);
    },

    calculatePaddingForLabel(label, maxLabelWidth){
        var paddingWidth = 0;
        var renderString = label.strings;
        var lastString = renderString[renderString.length -1];
        var fontName = label._enabledBold ? HDConstants.Sassoon_Medium : HDConstants.Sassoon_Regular;
        var tempLabel = new cc.LabelTTF(lastString,fontName, 18.75);
        tempLabel._setFontStyle(label._getFontStyle());
        label.lastStringHeight = tempLabel.height;
        if(tempLabel.width >  maxLabelWidth || label.isNewLine ){
            paddingWidth = 0;
            label.hasEmptySpace = false;
        }else{
            paddingWidth = tempLabel.width;
            label.hasEmptySpace = true;
        }
        return paddingWidth;
    },

    parseFormattedText : function(message){
        var teacherScriptsorTips =[];
        if( Array.isArray(message) == false){
            return [];
        }else{
            var mIndex =0;
            while(mIndex < message.length){
                // console.log("here",message[mIndex] );
                if(message[mIndex].attributes){
                    teacherScriptsorTips.push(message[mIndex]);
                }else if(message[mIndex].insert.length !=0){
                        var index = message[mIndex].insert.indexOf('\n');
                        if(index ==0) {
                            var lastScript = teacherScriptsorTips.pop();
                            lastScript.insert += '\n';
                            teacherScriptsorTips.push(lastScript);
                            message[mIndex].insert = message[mIndex].insert.substr(index + 1);
                            mIndex--;
                        }
                        else{
                            var temp = message[mIndex].insert.split('\n');
                            for(var tIndex = 0; tIndex < temp.length;  tIndex++){
                                if(temp[tIndex].length >0 && tIndex < temp.length - 1){
                                    var data = {
                                        insert : temp[tIndex] + '\n',
                                    }
                                    teacherScriptsorTips.push(data);
                                }
                                else if(tIndex == temp.length -1){
                                    teacherScriptsorTips.push({
                                        insert : temp[tIndex]
                                    });
                                }
                            }
                        }
                    }
                mIndex++;
            }
         return [...teacherScriptsorTips];
        }
    },

   getInnerHeight: function(labelRef, yPadding){
       if(labelRef.isNewLine){
           return labelRef.height + yPadding;
       }else if( !labelRef.hasEmptySpace){
           return  labelRef.height;
       }else {
           return (labelRef.height - labelRef.lastStringHeight);
       }
   },

    addSocketConnectionStatusLabel: function () {
        var label = this.createTTFLabel("", HDConstants.Sassoon_Regular,  22, HDConstants.Green, cc.p(this.width * 0.65, this.height * 0.97), this);
        label.setLocalZOrder(this.lessonZOrder);
        label.setAnchorPoint(0, 0.5);
        label.setVisible(HDAppManager.appRunMode != AppMode.Staging);
        label.setTag(lesson_1.Tag.connectionStatusLabelTag);
    },

    lessonCloseButton : function(){
        let closeLesson = this.createButton("res/LessonResources/lesson_1_studentNameBG.png", "res/LessonResources/lesson_1_studentNameBG.png",
            "Close lesson", 20, lesson_1.Tag.lessonComplete, cc.p(this.getContentSize().width * 0.08,this.getContentSize().height * 0.15), this);
        closeLesson.addTouchEventListener(this.lessonComplete, this);
        closeLesson.setScale(0.8);
        this.handIconUI.push(closeLesson);
        closeLesson.setTitleColor(cc.color(0,0,0,255));
    },
    createTimer: function (fileName, zOrder, tag) {
        var logoSprite = this.getChildByTag(lesson_1.Tag.logoSprite);
        var timerSprite = this.addSprite(fileName, cc.p(0, logoSprite.y) , this);
        timerSprite.setPositionX(-timerSprite.width * 0.5);
        timerSprite.setLocalZOrder(zOrder);
        timerSprite.setTag(tag);
        timerSprite.setVisible(false);
        var timerLabel = this.createTTFLabel("", HDConstants.Sassoon_Medium, 25, cc.color(116, 84, 33, 255), cc.p(timerSprite.width * 0.5, timerSprite.height * 0.4), timerSprite);
        timerLabel.setTag(lesson_1.Tag.timerLabel);
        tag == lesson_1.Tag.lessonTimer ? this.lessonHDTimer = new HDTimer() : this.activityHDTimer = new HDTimer();
    },

    resetTimerPosition: function () {
        let timerSprite = this.getChildByTag(lesson_1.Tag.timerTag);
        timerSprite.stopAllActions();
        console.log("timer sprite", timerSprite.getRotation());
        timerSprite.setRotation(0);
        this.isActivityTimerOnScreen = false;
        timerSprite.setTexture(lesson_1.resourcePath + "timer_1_minute.png");
        var logoSprite = this.getChildByTag(lesson_1.Tag.logoSprite);
        timerSprite.setPosition(cc.p(-timerSprite.width * 0.5, logoSprite.y));
        var slideOutAction = cc.moveTo(1, cc.p(-timerSprite.width, logoSprite.y));
        timerSprite.runAction(slideOutAction);
    },
    /**
     *
     * @param slideOut {boolean} whether the timer should stay there or slide out
     */
    performTimerAction: function (slideOut = true, timerTag) {
        let timerSprite = this.getChildByTag(timerTag);
        var logoSprite = this.getChildByTag(lesson_1.Tag.logoSprite);
        console.log("perform timer action", timerTag);
        let slideInFinalPos_X;
        let leftArrow = this.getChildByTag(lesson_1.Tag.leftArrow);
        slideInFinalPos_X = (logoSprite.x + (leftArrow ? leftArrow.x : this.getChildByTag(lesson_1.Tag.activityParent).x)) * 0.5;

        var slideInAction = cc.moveTo(1, cc.p(slideInFinalPos_X, logoSprite.y));
        var easeOut = cc.easeBackOut();
        slideInAction.easing(easeOut);

        var seq;
        if(slideOut){
            var slideOutAction = cc.moveTo(1, cc.p(-timerSprite.width, logoSprite.y));
            var easeIn = cc.easeBackIn();
            slideOutAction.easing(easeIn);
            seq = cc.sequence(slideInAction, cc.delayTime(5), slideOutAction);
        }
        else {
            let jiggleAction = cc.rotateBy(0.08, 8);
            let reverse = jiggleAction.reverse();
            let jiggleSeq = cc.sequence(jiggleAction, reverse);
            let continousJiggleSeq = cc.sequence(jiggleSeq.repeat(3), cc.delayTime(0.5));
            seq = cc.sequence(slideInAction, continousJiggleSeq.repeat(1000));
        }
        let finalSeq = cc.sequence(seq, cc.callFunc(() => {
            if(timerTag === lesson_1.Tag.timerTag){
                this.isActivityTimerOnScreen = false;
                if(this.pendingLessonTimerProgress){
                    this.changeTimerTexture(this.pendingLessonTimerProgress);

                }
            }
            else if(timerTag === lesson_1.Tag.lessonTimer){
                this.isLessonTimerOnScreen = false;
                this.pendingLessonTimerProgress = 0;
                console.log("pending activity",this.pendingActivityTimerProgress );
                if(this.pendingActivityTimerProgress ==1 ){
                    this.showWarningTimer();
                }else if(this.pendingActivityTimerProgress == 2){
                    this.stopActivityTimer(lesson_1.TimerType.activityTimer);
                }

            }
        }));

        timerSprite.runAction(finalSeq);
    },

    // time should be in seconds
    startActivityTimer: function (time) {
       this.resetTimerPosition();
       this.activityHDTimer.stopTimer();
       this.activityHDTimer.startTimer(time, this, lesson_1.TimerType.activityTimer);
    },

    startLessonTimer : function(time, isDelayed){
        this.getChildByTag(lesson_1.Tag.lessonTimer).setVisible(true);
        this.lessonHDTimer.startTimer(time, this, lesson_1.TimerType.lessonTimer);
    },


    stopActivityTimer: function (timerType) {
        if(timerType == 2){
            this.isActivityTimerOnScreen = true;
            let timer = this.getChildByTag(lesson_1.Tag.timerTag);
            timer.setTexture(lesson_1.resourcePath + "timer_over.png");
            timer.getChildByTag(lesson_1.Tag.timerLabel).setString("");
            timer.setVisible(true);
            this.performTimerAction(false,lesson_1.Tag.timerTag);
        }
    },

    changeTimerTexture(progress){
        var timer = this.getChildByTag(lesson_1.Tag.lessonTimer);
        timer.setVisible(true);

        this.isLessonTimerOnScreen = true;
        var timerLabel = timer.getChildByTag(lesson_1.Tag.timerLabel);
        timerLabel.setFontSize(12);
        timerLabel.setFontName(HDConstants.LondrinaSolid_Regular);
        var texture = Math.round(progress);
        timer.setTexture(lesson_1.resourcePath + lesson_1.config.graphicalAssets.lessonTimer[texture].name);

        switch(texture){
            case 1:
                timerLabel.setPosition(timer.width * 0.7, timer.height * 0.6);
                timerLabel.setString( "25%");
                break;

            case 2:
                timerLabel.setPosition(timer.width * 0.74, timer.height * 0.45);
                timerLabel.setString( "50%");
                break;
            case 3:
                timerLabel.setPosition(timer.width * 0.71, timer.height * 0.3);
                timerLabel.setString( "75%");
                break;

            case 4:
                timerLabel.setPosition(timer.width * 0.35, timer.height * 0.3);
                timerLabel.setString( "90%");
                break;

            default:
                console.log("default",texture);



        }

        this.performTimerAction(true, lesson_1.Tag.lessonTimer);

    },

    showWarningTimer : function(){
        this.isActivityTimerOnScreen = true;
        let timer = this.getChildByTag(lesson_1.Tag.timerTag);
        timer.setTexture(lesson_1.resourcePath + "timer_1_minute.png");
        timer.setVisible(true);
        timer.getChildByTag(lesson_1.Tag.timerLabel).setString("1m");
        this.performTimerAction(true, lesson_1.Tag.timerTag);
    },

    addReconnectingLabel: function () {

    },

    addRoomIdLabel : function(roomId) {
        if (this.getChildByTag(41578)) {
            this.getChildByTag(41578).removeFromParent(true);
        }
        let label = this.createTTFLabel("Room id: " + roomId, HDConstants.Sassoon_Regular, 22, HDConstants.Black,
            cc.p(this.getContentSize().width * 0.2, this.getContentSize().height * 0.97), this);
        label.setLocalZOrder(this.lessonZOrder);
        label.setTag(41578);
    },

     fetchRoomDetails : function(userType)
     {
        // SocketManager.emitCutomEvent('listOfRooms', {"role":userType});
     },
     receivedRoomDetails : function(data){
         //this.listAvailableRooms = data.forEach(roomId
        //SocketManager.removeSubscribedEvent('listOfRooms', this.receivedRoomDetails());
     },

    /**
     *
     * @param data
     */
    onSyncData: function(data)  {
        console.log("inside on sycn data");
        var roomDetail = data;
        if(HDAppManager.roomId && HDAppManager.roomId == roomDetail.roomId) {
            if (roomDetail && roomDetail.roomData) {
                var roomData = roomDetail.roomData;
                for (let index = 0; index < HDAppManager.config.activityGame.length; index++) {
                    let activityFromConfig = HDAppManager.config.activityGame[index];
                    if (roomData && roomData.activity == activityFromConfig.namespace) {
                        let currentActivity = lesson_1.ref.getChildByTag(lesson_1.Tag.activeActivityTag);
                        if(currentActivity && currentActivity.config && currentActivity.config.properties && currentActivity.config.properties.namespace == roomData.activity) {
                            currentActivity.syncData(roomData.data);
                        } else {
                            this.roomLayer.removeFromParent(true);
                            this.updateActivityTimerAfterReload(data)
                          let status = HDAppManager.loadedResIndex.indexOf(index) == -1;
                          if(status) {
                              HDAppManager.nextActivityIdx = index;
                              lesson_1.ref.activityIdx = index;
                              lesson_1.ref.loadingResLabelSetActive(true);
                              CMProcessIndicator.addLoadingIndicator(lesson_1.ref);
                              cc.eventManager.addCustomListener("loadedActivity", (data)=>{
                                  if(data.getUserData() == lesson_1.ref.activityIdx) {
                                      lesson_1.ref.launchActivity(index);
                                      let newActivity = lesson_1.ref.getChildByTag(lesson_1.Tag.activeActivityTag);
                                      newActivity.syncData(roomData.data);
                                      lesson_1.ref.loadingResLabelSetActive(false);
                                      cc.eventManager.removeCustomListeners("loadedActivity");
                                  }
                              });
                          }else{
                              lesson_1.ref.launchActivity(index);
                              let newActivity = lesson_1.ref.getChildByTag(lesson_1.Tag.activeActivityTag);
                              newActivity.syncData(roomData.data);
                          }

                        }
                        break;
                    }
                }
            }
        }
    },

    updateActivityTimerAfterReload : function(data){
        if(lesson_1.ref.isTeacherView){
            if(data.roomData){
                var delay = lesson_1.ref.calculateElapsedTime(data.roomData.activityStartTime);
                var time =  delay > lesson_1.config.activityGame[this.activityIdx].allocatedTime * 60 ? 0 : time - lesson_1.config.activityGame[this.activityIdx].allocatedTime;
                this.startActivityTimer(time);
                HDAppManager.setActivityStartTime(new Date().getTime());
            }

        }
    },


    // ----------- Temp UI for Username and Room JOIn --------------
    createRoomLayer: function() {
        this.roomLayer = this.setBackground("res/LessonResources/backyardtop.png");
        this.roomLayer.setLocalZOrder(200);
        this.userNameEditBox();
//        this.setupButtonLayer();
    },

    setupTableView: function() {
        var availableLabel = this.createTTFLabel("Available Rooms",HDConstants.Sassoon_Regular,24, cc.color(0,0,0, 0), cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.75),this.roomLayer);
        availableLabel.setLocalZOrder(201);
        this.setRoomsContent();
        this.roomListTable.reloadData();
    },

    setupButtonLayer: function() {
        this.buttonLayer = this.createColourLayer(cc.color(0,0,0,0),this.getContentSize().width * 0.5, this.getContentSize().height*0.5, cc.p(this.getContentSize().width * 0.25, this.getContentSize().height * 0.25),this.roomLayer, 100);
        var roleLabel = this.createTTFLabel("Are you teacher? ",HDConstants.Sassoon_Medium,32, cc.color(0,0,0, 255), cc.p(this.buttonLayer.getContentSize().width * 0.5, this.buttonLayer.getContentSize().height * 0.75),this.buttonLayer);
        var teacherButton = this.createButton("res/LessonResources/lesson_1_studentNameBG.png","res/LessonResources/lesson_1_studentNameBG.png","YES", 20,lesson_1.Tag.teacherButton, cc.p(this.buttonLayer.getContentSize().width * 0.25, this.buttonLayer.getContentSize().height * 0.5),this.buttonLayer,this,"res/LessonResources/lesson_1_studentNameBG.png");
        teacherButton.setTitleColor(cc.color(0,0,0));
        var studentButton = this.createButton("res/LessonResources/lesson_1_studentNameBG.png","res/LessonResources/lesson_1_studentNameBG.png","NO", 20,lesson_1.Tag.studentButton, cc.p(this.buttonLayer.getContentSize().width * 0.75, this.buttonLayer.getContentSize().height * 0.5),this.buttonLayer,this,"res/LessonResources/lesson_1_studentNameBG.png");
        studentButton.setTitleColor(cc.color(0,0,0));
    },

    setupLoadingLayer: function(message) {
        this.buttonLayer.removeAllChildrenWithCleanup(true);
        var roleLabel = this.createTTFLabel(message,HDConstants.Sassoon_Medium,32, cc.color(0,0,0, 255), cc.p(this.buttonLayer.getContentSize().width * 0.5, this.buttonLayer.getContentSize().height * 0.5),this.buttonLayer);
    },

    addEditBox : function(){
        this.roleIdEditBoxLayer = this.createColourLayer(cc.color(0,0,0,0),this.getContentSize().width * 0.5, this.getContentSize().height*0.5, cc.p(this.getContentSize().width * 0.25, this.getContentSize().height * 0.25),this.roomLayer, 100);
        var textTitle = HDAppManager.isTeacherView ? "Create new room or enter room id to Join Room" : "Enter the room id to Join Room"
        var roleLabel = this.createTTFLabel(textTitle, HDConstants.Sassoon_Medium,28, cc.color(0,0,0, 255), cc.p(this.roleIdEditBoxLayer.getContentSize().width * 0.5, this.roleIdEditBoxLayer.getContentSize().height * 0.75),this.roleIdEditBoxLayer);
        this.roomIdEditBox = this.createEditBox("res/LessonResources/editBoxbackgroundWhite.png",cc.p(this.editBoxLayer.getContentSize().width*0.5,this.editBoxLayer.getContentSize().height*0.5),"  Enter room Id",lesson_1.Tag.roomIdEditBox,cc.EDITBOX_INPUT_MODE_NUMERIC, this.roleIdEditBoxLayer);
        this.roomIdEditBox.setDelegate(this);
        this.roomIdEditBox.setFontColor(cc.color(0,0,0,255));
        var bgSprite = this.addSprite("res/LessonResources/editBoxbackground.png", cc.p(this.roomIdEditBox.x,this.roomIdEditBox.y), this.roleIdEditBoxLayer);
        bgSprite.setLocalZOrder(-12);
        bgSprite.setScale(this.roomIdEditBox.width * 1.1 / bgSprite.width, this.roomIdEditBox.height * 1.1 / bgSprite.height);

        if(!HDAppManager.isTeacherView) {
            this.joinUserNameButton = this.createButton("res/LessonResources/doneEnable.png","res/LessonResources/doneEnable.png", "Join Room",24,lesson_1.Tag.joinRoomButton,cc.p(this.roleIdEditBoxLayer.getContentSize().width * 0.5, this.roleIdEditBoxLayer.getContentSize().height * 0.3),this.roleIdEditBoxLayer,this,"res/LessonResources/doneDisable.png")
            this.joinUserNameButton.setEnabled(false);

        } else {
            this.joinUserNameButton = this.createButton("res/LessonResources/doneEnable.png","res/LessonResources/doneEnable.png", "Join Room",20,lesson_1.Tag.joinRoomButton,cc.p(this.roleIdEditBoxLayer.getContentSize().width * 0.35, this.roleIdEditBoxLayer.getContentSize().height * 0.3),this.roleIdEditBoxLayer,this,"res/LessonResources/doneDisable.png")
            this.joinUserNameButton.setEnabled(false);

            this.createRoomButton = this.createButton("res/LessonResources/doneEnable.png","res/LessonResources/doneEnable.png", "Create Room",20,lesson_1.Tag.createRoomButtom,cc.p(this.roleIdEditBoxLayer.getContentSize().width * 0.65, this.roleIdEditBoxLayer.getContentSize().height * 0.3),this.roleIdEditBoxLayer,this,"res/LessonResources/doneDisable.png")
        }
    },

    userNameEditBox : function(){
        this.editBoxLayer = this.createColourLayer(cc.color(0,0,0,0),this.getContentSize().width * 0.5, this.getContentSize().height*0.5, cc.p(this.getContentSize().width * 0.25, this.getContentSize().height * 0.25),this.roomLayer, 100);
        var roleLabel = this.createTTFLabel("Enter your username.", HDConstants.Sassoon_Regular,32, cc.color(0,0,0, 255), cc.p(this.editBoxLayer.getContentSize().width * 0.5, this.editBoxLayer.getContentSize().height * 0.75),this.editBoxLayer);
        this.userNameEditBox = this.createEditBox("res/LessonResources/editBoxbackgroundWhite.png",cc.p(this.editBoxLayer.getContentSize().width*0.5,this.editBoxLayer.getContentSize().height*0.5),
            "  Enter username",lesson_1.Tag.userNameEditBox,cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_SENTENCE, this.editBoxLayer);
        this.userNameEditBox.setDelegate(this);
        this.userNameEditBox.setFontColor(cc.color(0,0,0,255));
        var bgSprite = this.addSprite("res/LessonResources/editBoxbackground.png", cc.p(this.userNameEditBox.x,this.userNameEditBox.y), this.editBoxLayer);
        bgSprite.setLocalZOrder(-12);
        bgSprite.setScale(this.userNameEditBox.width * 1.1 / bgSprite.width, this.userNameEditBox.height * 1.1 / bgSprite.height);
        this.doneUserNameButton = this.createButton("res/LessonResources/doneEnable.png","res/LessonResources/doneEnable.png", "Done",20,lesson_1.Tag.userNameEnterButton,cc.p(this.editBoxLayer.getContentSize().width * 0.5, this.editBoxLayer.getContentSize().height * 0.3),this.editBoxLayer,this,"res/LessonResources/doneDisable.png")
        this.doneUserNameButton.setEnabled(false);
    },

    //Edit box delegate methods
    editBoxEditingDidBegin: function () {
    },

    editBoxEditingDidEnd: function () {
    },

    editBoxTextChanged: function (sender, text) {
        var isEnable = text.length != 0? true : false;
        switch(sender.tag) {
            case lesson_1.Tag.roomIdEditBox:
                this.joinUserNameButton.setEnabled(isEnable);
                if(HDAppManager.isTeacherView) {
                    this.createRoomButton.setEnabled(true);
                }
                break;
            case lesson_1.Tag.userNameEditBox:
                this.doneUserNameButton.setEnabled(isEnable);
                break;
        }
    },

    //Tableview setup
    setRoomsContent: function () {
        let width = 200;
        let height = 40 * 5;
        let position = cc.p(this.getContentSize().width * 0.5 - width * 0.5, this.getContentSize().height * 0.25+70);
        let baseColorLayer = this.createColourLayer(cc.color(255,255,255,0), width, height, position,this.roomLayer,202);
        this.roomListTable = new cc.TableView(this, cc.size(width, height));
        this.roomListTable.setPosition(cc.p(position.x, position.y));
        this.roomListTable.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.roomListTable.setBounceable(true);
        this.roomListTable.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        this.roomListTable.setTouchEnabled(true);
        this.roomListTable.setDataSource(this);
        this.roomListTable.setDelegate(this);
        this.roomLayer.addChild(this.roomListTable,205);
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(200, 40);
    },

    tableCellAtIndex: function (table, idx) {
        let roomCell   =   table.dequeueCell();
        if(roomCell == null) {
            roomCell   =   new lesson_1.HDRoomDataCell();
        }
        roomCell.tag = idx;
        roomCell.setContentSize(cc.size(200, 40));
        roomCell.createUI(idx, this.listAvailableRooms[idx], roomCell);
        return roomCell;
    },

    numberOfCellsInTableView: function (table) {
        return this.listAvailableRooms.length;
    },
    tableCellTouched: function (table, cell) {
        var selectedRoom = this.listAvailableRooms[cell.tag];
        //Join This room.
        this.roomLayer.removeFromParent(true);
    },

    calculateElapsedTime : function (startAt) {
        var currentTime = new Date().getTime();
        var  seconds = Math.floor((currentTime - startAt)/1000) % 60;
        var  minutes = Math.floor((currentTime - startAt)/1000) / 60;
        return parseInt(minutes.toString()) * 60 + seconds;
    }

});


lesson_1.HDRoomDataCell = cc.TableViewCell.extend({
    cellData            :   null,
    cellHorizontalPadding : 0,
    cellVerticalPadding : 0,
    cardTextHeight : 25,
    highlightLayer:null,

    ctor : function () {
        this._super();
        return true;
    },

    onEnter : function() {
        this._super();
    },

    createUI : function (idx, data, parent) {
        this.cellData = data;
        this.tag = idx;
        this.removeAllChildren(true);

        let colourLayer = new cc.LayerColor(cc.color(255,100,500,100));
        colourLayer.setPosition(cc.p(this.cellHorizontalPadding, this.cellVerticalPadding));
        // parent.addChild(colourLayer, 2);

        let cardElementImage = new cc.Sprite("res/LessonResources/lesson_1_studentNameBG.png");
        cardElementImage.setPosition(parent.getContentSize().width*0.5, parent.getContentSize().height * 0.5);
        cardElementImage.setAnchorPoint(0.5, 0.5);
        parent.addChild(cardElementImage,3);

        let labelCardText   = new cc.LabelTTF("Room "+ data, HDConstants.Sassoon_Regular,16,cc.size(200,0),cc.TEXT_ALIGNMENT_CENTER);
        labelCardText.setPosition(cc.p(parent.getContentSize().width * 0.5, parent.getContentSize().height * 0.5));
        labelCardText.setColor(cc.color(0,0,0,255));
        labelCardText.setAnchorPoint(cc.p(0.5,0.5));
        parent.addChild(labelCardText,5);
    },

});

var HDTimer =  cc.Class.extend({
    interval : null,
    progress : 0,
    delegate : null,
    timerType : 0,
    isRunning : false,

    ctor : function () {
    },

    startTimer : function (time, delegate, timerType) {
        this.isRunning = true;
        this.timerType = timerType;
        this.delegate = delegate;
        this.interval =  setInterval(() => {
            if (time - this.progress === 60) {
                if(this.delegate && this.timerType == lesson_1.TimerType.activityTimer && !this.delegate.isLessonTimerOnScreen)
                this.delegate.showWarningTimer();
                else if(this.timerType == lesson_1.TimerType.activityTimer && !this.delegate.isLessonTimerOnScreen){
                    this.delegate.pendingActivityTimerProgress = 1;
                }
            }
            if (this.progress >= time) {  // in case of relaod
                  this.stopTimer();
                  if(this.delegate && this.timerType == lesson_1.TimerType.activityTimer && !this.delegate.isLessonTimerOnScreen){
                      this.delegate.stopActivityTimer(this.timerType);
                  }else if(this.timerType == lesson_1.TimerType.activityTimer && !this.delegate.isLessonTimerOnScreen){
                      this.delegate.pendingActivityTimerProgress = 2;
                  }

            }
            else if(this.progress > 0 && this.progress < time && (this.progress % Math.trunc(time *  0.25) == 0 || this.progress == Math.trunc(time * 0.9 ))){
                 if(this.timerType == lesson_1.TimerType.lessonTimer){
                     this.delegate.pendingLessonTimerProgress = this.progress / Math.trunc(time *  0.25);
                 }
                 if(this.timerType == lesson_1.TimerType.lessonTimer && !this.delegate.isActivityTimerOnScreen) {
                     console.log(this.timerType == lesson_1.TimerType.lessonTimer, !this.delegate.isActivityTimerOnScreen);
                     this.delegate.changeTimerTexture(this.progress / Math.trunc(time * 0.25));
                 }
            }
            this.progress = this.progress + 1;

        }, 1000);
    },

    stopTimer : function () {
        if (this.isRunning) {
            clearInterval(this.interval);
        }
        this.isRunning = false;
        this.progress = 0;
    },

    isTimerRunning : function () {
        return this.isRunning;
    },

    updateProgress : function (time) {
        this.progress = time;
    }
});
 lesson_1.HDLessonScene = cc.Scene.extend({
    ctor: function(){
        this._super();
    },
    onEnter:function () {
        this._super();
        var layer = new lesson_1.HDLessonLayer();
        this.addChild(layer, 10)   ;
    }
});

