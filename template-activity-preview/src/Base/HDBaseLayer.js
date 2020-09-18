var HDBaseLayer = cc.Layer.extend({
    _size: null,
    delegate: null,
    ctor: function (size = cc.winSize, preventTouch = true) {
        this._super();
        this._size = size;
        this.setContentSize(size);
        //==== Preventive Touch button
        // if (preventTouch) {
        //     var button = new ccui.Button();
        //     button.loadTextures(res.DemoBG, res.DemoBG);
        //     button.setPosition(cc.p(this._size.width * 0.5, this._size.height * 0.5));
        //     button.setScale(this._size.width / button.getContentSize().width, this._size.height / button.getContentSize().height);
        //     button.setOpacity(0);
        //     this.addChild(button, -1);
        // }
    },
    onEnter: function () {
        this._super();
        // if (HDAppManager.isEventAddedForBackground() == null || !HDAppManager.isEventAddedForBackground()) {
        //     HDAppManager.setEventAddedForBackground(true);
        //     this.addBackgroundAndForegroundAppListeners();
        // }
    },

    addBackgroundAndForegroundAppListeners: function () {
        // this.gameShowListener = cc.EventListener.create({
        //     event: cc.EventListener.CUSTOM,
        //     eventName: cc.game.EVENT_SHOW,
        //     callback: this.onApplicationForeground
        // });
        // cc.eventManager.addListener(this.gameShowListener, this);
    },

    onApplicationForeground: function (event) {
        // if (HDAppManager.socket)
        //     HDAppManager.socket.emit(SocketEventKey.GetServerTimeKey);
    },

    removeBackgroundAndForegroundAppListeners: function () {
        // HDAppManager.setEventAddedForBackground(false);
        // cc.eventManager.removeListener(this.gameShowListener);
    },

    onExit: function () {
        this._super();
        // this.removeBackgroundAndForegroundAppListeners();
    },

    setDelegate: function (ref) {
        // MMBaseLayerRef.delegate = ref;
    },

    addKeyBoardEvent: function (target) {
        // var listener = cc.EventListener.create({
        //     event: cc.EventListener.KEYBOARD,
        //     swallowTouches: true,
        //     onKeyPressed: function (keyCode, event) {
        //         target.keyBoardPressedKey(keyCode);
        //     },
        //
        // });
        // cc.eventManager.addListener(listener, target);
    },

    /**
     * add background to layer
     * @param imageName
     */
    setBackground: function (imageName) {
        this.mBackgroundSprite =new cc.Sprite(imageName);
        this.mBackgroundSprite.setPosition(this._size.width * 0.5, this._size.height * 0.5);
        this.mBackgroundSprite.setAnchorPoint(0.5, 0.5);
        this.addChild(this.mBackgroundSprite);
        return this.mBackgroundSprite;
    },

    log : function(str){
        if(HDAppManager.appRunMode == AppMode.Development) {
            console.log(str);
        }
    },
    addSprite: function (fileName, position, parent) {
        var mSprite = new cc.Sprite(fileName);
        mSprite.setPosition(position);
        parent.addChild(mSprite);
        return mSprite;
    },
    /**
     * createButton() will create and return Button() Instance
     * @param normalImage
     * @param selectedImage
     * @param title
     * @param titleSize
     * @param tag
     * @param position
     * @param parent
     * @returns {*}
     */

    createButton: function (normalImage, selectedImage, title, titleSize, tag, position, parent, callbackParent, disabledImage) {
        var button = new ccui.Button();
        button.loadTextures(normalImage, selectedImage, disabledImage);
        button.setPosition(position);
        button.setTag(tag);
        button.setTitleText(title);
        button.setTitleColor(HDConstants.White);
        button.setTitleFontName(HDConstants.Sassoon_Medium);
        button.setTitleFontSize(titleSize);
        button.addTouchEventListener(parent.buttonCallback, parent);
        if (callbackParent)
            button.addTouchEventListener(callbackParent.buttonCallback, callbackParent);
        parent.addChild(button);
        return button;
    },
    /**
     * createMenuItemSprite() return menuitem of sprite
     * @param normalSpName
     * @param selectedSpName
     * @param disabledSpName
     * @param tag
     * @param position
     * @param parent
     * @returns {*}
     */
    createMenuItemSprite: function (normalSpName, selectedSpName, disabledSpName, tag, position, parent) {
        var normalSp = new cc.Sprite(normalSpName);
        var selectedSp = new cc.Sprite(selectedSpName);
        var disabledSp = new cc.Sprite(disabledSpName);
        var menuItemSp = new cc.MenuItemSprite(normalSp, selectedSp, disabledSp, parent.onMenucallBack, parent);
        menuItemSp.setPosition(position);
        menuItemSp.setTag(tag);
        return menuItemSp;

    },

    createMenuItemLabel: function (pLabelText, pColor, pTag, pTextSize, pFontFile, pPosition, pOnMenucallBack, pParent) {
        var menuItemLabel = new cc.MenuItemLabel(new cc.LabelTTF(pLabelText, pFontFile, pTextSize, cc.size(0., 0), cc.TEXT_ALIGNMENT_CENTER), pOnMenucallBack, pParent);
        menuItemLabel.setColor(pColor);
        menuItemLabel.setTag(pTag);
        menuItemLabel.setPosition(cc.p(pPosition.x, pPosition.y));
        return menuItemLabel;
    },

    /**
     * create LabelTTF instance and returns same
     * @param text
     * @param font
     * @param fontSize
     * @param textColour
     * @param position
     * @param parent
     * @returns {text}
     */
    createTTFLabel: function (text, font, fontSize, textColour, position, parent) {
        var label = cc.LabelTTF.create(text, font, fontSize, cc.size(0., 0), cc.TEXT_ALIGNMENT_CENTER);
        label.setPosition(position);
        label.setColor(textColour);
        parent.addChild(label);
        return label;
    },
    /**
     * create LabelBMFont instance and returns same
     * @param text
     * @param fontName
     * @param fontSize
     * @param position
     * @param parent
     * @returns {*}
     */
    createBMFLabel: function (text, fontName, fontSize, position, parent) {
        var label = new cc.LabelBMFont(text, fontName, fontSize.width, cc.TEXT_ALIGNMENT_CENTER);
        label.setPosition(position);
        parent.addChild(label);
        return label;
    },
    /**
     * create and return LayerColor
     * @param colour
     * @param width
     * @param height
     * @param position
     * @param parent
     * @param zorder
     * @returns {*}
     */
    createColourLayer: function (colour, width, height, position, parent, zorder) {
        var colourLayer = new cc.LayerColor(colour, width, height);
        colourLayer.setPosition(position);
        parent.addChild(colourLayer, zorder);
        return colourLayer;
    },

    createEditBox: function (bgSpriteName, position, placeHolderText, tag, inputFlagType, parent) {
        var editBoxSprite = new cc.Scale9Sprite(bgSpriteName);
        var mEditBox = new cc.EditBox(editBoxSprite.getContentSize(), editBoxSprite);
        mEditBox.setPosition(position);
        mEditBox.setTag(tag);
        mEditBox.setFontName(HDConstants.Sassoon_Regular);
        mEditBox.setPlaceholderFontName(HDConstants.Sassoon_Regular);
        mEditBox.setPlaceholderFontColor(cc.color(100, 100, 100));
        mEditBox.setFontSize(22);
        mEditBox.setPlaceholderFontSize(22);
        mEditBox.setPlaceHolder(placeHolderText);
        mEditBox.setFontColor(HDConstants.Gold);
        mEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
        mEditBox.setInputFlag(inputFlagType);
        mEditBox.setDelegate(parent);
        parent.addChild(mEditBox);
        return mEditBox;
    },

    createScrollView : function (containerSize, container, viewSize, direction, position, delegate) {
       let scrollView =  new cc.ScrollView(containerSize,  container);//new cc.ScrollView(cc.size(container.getContentSize().width, container.getContentSize().width), container);
        scrollView.setPosition(position);
        scrollView.setAnchorPoint(cc.p(0, 0));
        scrollView.setViewSize(viewSize);
        scrollView.setDelegate(delegate);
        scrollView.setDirection( direction);
        delegate.addChild(scrollView);
        return scrollView;
    }

});