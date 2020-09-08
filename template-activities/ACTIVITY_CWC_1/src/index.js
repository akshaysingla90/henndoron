/**
 * This file contain logic for Character Convo module
 **/
var ACTIVITY_CWC_1 = {};
ACTIVITY_CWC_1.Tag = {
    natTextStartTag: 1000,
    pollyTextStartTag: 2000,
    natScrollView: 100,
    polyScrollView: 101,
    nat: 102,
    polly: 103,
    characterBase: 200,
    characterTableViewBase: 300,
    characterTextStartBase: 400,
    characterSelectBtnBase: 500,
    chartacterDropDownButtonBase: 600,
    character_1: 200,
    character_1_tableView: 201,
    character_1_textStart: 202,
    character_1_selectBtn: 203,
    character_1_dropDownButton: 2222,
    character_2: 300,
    character_2_tableView: 301,
    character_2_textStart: 302,
    character_2_selectBtn: 303,
    character_2_dropDownButton: 3333,
    character_3: 400,
    character_3_tableView: 401,
    character_3_textStart: 402,
    character_3_selectBtn: 403,
    character_3_dropDownButton: 4444,
    cellArray: [],
}

ACTIVITY_CWC_1.socketEventKey = {
    playCharacterSound: "playCharacterConversation",
}
ACTIVITY_CWC_1.ref = null;
ACTIVITY_CWC_1.CharacterConversationLayer = HDBaseLayer.extend({
    teacherPuppet: null,
    self: null,
    highlightedCell: null,
    isTeacherView: true,
    soundPlayTriggered: false,
    handIconUI: [],
    animationType: {
        wave: "wave",
        excited: "excited",
        idle: "idle",
    },
    ctor: function () {
        this._super();
    },

    onEnter: function () {
        this._super();
        let ref = this;
        ACTIVITY_CWC_1.ref = this;
        cc.loader.loadJson("res/Activity/ACTIVITY_CWC_1/config.json", function (error, config) {
            ACTIVITY_CWC_1.config = config;
            ACTIVITY_CWC_1.resourcePath = "res/Activity/ACTIVITY_CWC_1/res/"
            ACTIVITY_CWC_1.soundPath = ACTIVITY_CWC_1.resourcePath + "Sound/";
            ACTIVITY_CWC_1.animationBasePath = ACTIVITY_CWC_1.resourcePath + "AnimationFrames/";
            ACTIVITY_CWC_1.spriteBasePath = ACTIVITY_CWC_1.resourcePath + "Sprite/";

            ref.isTeacherView = HDAppManager.isTeacherView;

            //audio file polly
            for (var i = 0; i < ACTIVITY_CWC_1.config.charactersData.length; ++i) {
                for (var j = 0; j < ACTIVITY_CWC_1.config.charactersData[i].audioData.length; ++j) {
                    cc.loader.load(ACTIVITY_CWC_1.soundPath + ACTIVITY_CWC_1.config.charactersData[i].audioData[j].audio);
                }
            }
            ref.setupUI();
            if (ref.getChildByTag(ACTIVITY_CWC_1.Tag.characterTableViewBase))
                ref.getChildByTag(ACTIVITY_CWC_1.Tag.characterTableViewBase).reloadData();
            ref.triggerScript(config.teacherScripts.moduleStart.ops);
            ref.triggerTip(config.teacherTips.moduleStart);
        });

        this.cellArray = [];
    },

    onExit: function () {
        this._super();
        ACTIVITY_CWC_1.ref.cellArray.length = 0;
        ACTIVITY_CWC_1.ref = null;
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
        this.setBackground(ACTIVITY_CWC_1.spriteBasePath + ACTIVITY_CWC_1.config.graphicalAssets.background.name);
        this.mBackgroundSprite.setScale(1.0);
        this.mBackgroundSprite.setPosition(cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5));
        this.characterSetup();
        if (this.isTeacherView) {
            this.updateRoomData();
        }
    },

    characterSetup: function () {
        //character setup
        for (let index = 0; index < ACTIVITY_CWC_1.config.charactersData.length; ++index) {
            // for (let index in ACTIVITY_CWC_1.config.charactersData) {
            let character = this.addSprite(ACTIVITY_CWC_1.spriteBasePath + ACTIVITY_CWC_1.config.charactersData[index].imageName, cc.p(ACTIVITY_CWC_1.config.charactersData[index].position.x, ACTIVITY_CWC_1.config.charactersData[index].position.y), this);
            character.setTag(ACTIVITY_CWC_1.Tag.characterBase + index);
            character.setScale(0.6);
            this.playAnimation(ACTIVITY_CWC_1.Tag.characterBase + index, index);
            if (this.isTeacherView) {
                this.textPanelSetup(character, index, cc.p(character.getPositionX() - character.getContentSize().width * 0.135, character.getPositionY() - character.getContentSize().height * 0.28 - this._size.height * 0.26),
                    ACTIVITY_CWC_1.Tag.characterTableViewBase + index, ACTIVITY_CWC_1.Tag.characterTextStartBase + index, ACTIVITY_CWC_1.Tag.characterSelectBtnBase + index, this.playSound);
            }
        }
        // }
    },

    tableCellSizeForIndex: function (table, idx) {
        if (table && table.index != undefined) {
            return cc.size(120, table.getViewSize().height / 4);
            return ACTIVITY_CWC_1.config.charactersData[table.index].audioData.length;
        } else {
            return 1;
        }

    },

    tableCellAtIndex: function (table, idx) {
        let cardCell = table.dequeueCell();
        let cellSize = this.tableCellSizeForIndex(table, idx);
        if (cardCell == null) {
            cardCell = new ACTIVITY_CWC_1.TextCell(cellSize);
        }
        cardCell.tag = idx;
        cardCell.createUI(table.index, idx, table.startTag);
        ACTIVITY_CWC_1.ref.cellArray.push(cardCell);
        ACTIVITY_CWC_1.ref.handIconUI.push(cardCell);
        return cardCell;
    },

    numberOfCellsInTableView: function (table) {
        if (table && table.index != undefined) {
            return ACTIVITY_CWC_1.config.charactersData[table.index].audioData.length;
        } else {
            return 0;
        }
    },
    tableCellTouched: function (table, cell) {

    },
    textPanelSetup: function (parent, index, position, scrollViewTag, startTag, selectButtonTag, callback) {
        let sprite = this.addSprite(ACTIVITY_CWC_1.spriteBasePath + "Characters_popup.png", cc.p(position.x, position.y), this);
        sprite.setAnchorPoint(0, 0);
        sprite.setVisible(false);

        let topSprite = this.addSprite(ACTIVITY_CWC_1.spriteBasePath + "Characters_popup_top.png", cc.p(position.x, position.y + sprite.getContentSize().height), this);
        topSprite.setAnchorPoint(0, 1);
        topSprite.setVisible(true);
        topSprite.setLocalZOrder(10);

        let middleSprite = this.addSprite(ACTIVITY_CWC_1.spriteBasePath + "Characters_popup_middle.png", cc.p(position.x, topSprite.getPositionY() - topSprite.getContentSize().height), this);
        middleSprite.setAnchorPoint(0, 1);
        middleSprite.setVisible(true);
        middleSprite.initialScale = 0.15;
        middleSprite.finalScale = HDUtility.clampANumber((ACTIVITY_CWC_1.config.charactersData[index].audioData.length + 1) * 0.275, 0.15, 1.4)
        middleSprite.setScaleY(0.15);
        middleSprite.setLocalZOrder(5);

        let bottomSprite = this.addSprite(ACTIVITY_CWC_1.spriteBasePath + "Characters_popup_down.png", cc.p(position.x, middleSprite.getPositionY() - middleSprite.getContentSize().height * middleSprite.getScaleY()), this);
        bottomSprite.setAnchorPoint(0, 1);
        bottomSprite.setVisible(true);
        bottomSprite.setLocalZOrder(10);

        let selectButtonBG = this.createButton(ACTIVITY_CWC_1.spriteBasePath + "selectBG.png", ACTIVITY_CWC_1.spriteBasePath + "selectBG.png",
            "", 0, selectButtonTag,
            cc.p(sprite.getPositionX() + sprite.getContentSize().width * 0.5, sprite.getPositionY() + sprite.getContentSize().height * 0.8), this, this);
        selectButtonBG.setLocalZOrder(10);
        this.handIconUI.push(selectButtonBG);
        //Select Text, Button
        let selectLabel = this.createTTFLabel("Select...",
            HDConstants.Sassoon_Medium, 15, HDConstants.Black,
            cc.p(sprite.getPositionX() + sprite.getContentSize().width * 0.3, sprite.getPositionY() + sprite.getContentSize().height * 0.8),
            this);
        selectLabel.setLocalZOrder(11);

        let selectButton = this.createButton(ACTIVITY_CWC_1.spriteBasePath + "btn_down.png", ACTIVITY_CWC_1.spriteBasePath + "btn_down.png",
            "", 0, selectButtonTag,
            cc.p(sprite.getPositionX() + sprite.getContentSize().width * 0.79, sprite.getPositionY() + sprite.getContentSize().height * 0.82), this, this);
        selectButton.setLocalZOrder(20);
        this.handIconUI.push(selectButton);
        var tableView = new cc.TableView(this, cc.size(sprite.getContentSize().width * 0.9, sprite.getContentSize().height * 0.68));
        tableView.setPosition(cc.p(position.x + sprite.getContentSize().width * 0.05, position.y + sprite.getContentSize().height * 0.08));
        tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tableView.setBounceable(false);
        tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        tableView.setTouchEnabled(true);
        tableView.setDataSource(this);
        tableView.setDelegate(this);
        tableView.setTag(scrollViewTag);
        tableView.index = index;
        tableView.startTag = startTag;
        tableView.bottom = bottomSprite;
        tableView.mid = middleSprite;
        this.addChild(tableView, 11);
        tableView.reloadData();
        let layer = this.createColourLayer(cc.color(255, 0, 0, 200), tableView.getViewSize().width, tableView.getViewSize().height, cc.p(position.x, position.y), tableView, 0);
        tableView.setVisible(false);
    },

    playSound: function (cell) {
        if (cell && cell.getParent() && cell.getParent().isVisible()) {
            let characterTag = ACTIVITY_CWC_1.Tag.characterBase + (cell.getParent().getParent().getTag() - ACTIVITY_CWC_1.Tag.characterTableViewBase);//ACTIVITY_CWC_1.Tag.characterBase;
            let index = cell.getTag();//
            let key = characterTag - ACTIVITY_CWC_1.Tag.characterBase;
            SocketManager.emitCutomEvent('SingleEvent', {
                'eventType': HDSocketEventType.GAME_MESSAGE,
                'roomId': HDAppManager.roomId,
                'data': {
                    'eventType': ACTIVITY_CWC_1.socketEventKey.playCharacterSound,
                    "tag": characterTag,
                    "character": key,
                    "audioIdx": index
                }
            }, () => {
            });
            this.playAnimation(characterTag, key, index);
            this.getChildByTag(characterTag).soundPlayed = true;
            cc.audioEngine.playEffect(ACTIVITY_CWC_1.soundPath + ACTIVITY_CWC_1.config.charactersData[characterTag - ACTIVITY_CWC_1.Tag.characterBase].audioData[index].audio);
            if (!this.soundPlayTriggered) {
                let allSoundPlayed = true;

                for (let index in ACTIVITY_CWC_1.config.charactersData) {
                    if (this.getChildByTag(ACTIVITY_CWC_1.Tag.characterBase + index)) {
                        allSoundPlayed = allSoundPlayed && this.getChildByTag(ACTIVITY_CWC_1.Tag.characterBase + index).soundPlayed;
                    }
                }

                if (allSoundPlayed && !this.soundPlayTriggered) {
                    this.triggerScript(ACTIVITY_CWC_1.config.teacherScripts.onSoundPlayed.ops);
                    this.soundPlayTriggered = true;
                }
            }
            this.updateRoomData();
        }
    },
    mouseEventListener: function (event) {
        if (!this.isTeacherView)
            return;
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

    touchEventListener: function (touch, event) {
        if (!this.isTeacherView)
            return;
        switch (event.getEventCode()) {
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

    onMouseDown: function (event) {
        this.highlightSelectedTab(event.getLocation(), cc.EventMouse.DOWN);
    },
    onMouseMove: function (event) {
        this.highlightSelectedTab(event.getLocation(), cc.EventMouse.MOVE);
    },
    onMouseUp: function (event) {
        this.highlightSelectedTab(event.getLocation(), cc.EventMouse.UP);
    },

    highlightSelectedTab: function (location, eventType) {
        var notOverLappedWithAnyone = true;
        let characterTag = ACTIVITY_CWC_1.Tag.characterBase;

        if (!ACTIVITY_CWC_1.config) {
            return;
        }
        for (let index = 0; index < ACTIVITY_CWC_1.config.charactersData.length; ++index) {
            let characterTV = this.getChildByTag(ACTIVITY_CWC_1.Tag.characterTableViewBase + index);
            if (characterTV) {
                if (cc.rectContainsPoint(characterTV.getBoundingBox(), characterTV.parent.convertToNodeSpace(location))) {
                    characterTag = ACTIVITY_CWC_1.Tag.characterBase + index;
                    notOverLappedWithAnyone = false;
                }
            }
        }

        if (this.getChildByTag(characterTag) && !this.getChildByTag(characterTag).restPose) {
            return;
        }
        for (let i = 0; i < this.cellArray.length; ++i) {
            if (this.cellArray[i] && this.cellArray[i].parent && cc.rectContainsPoint(this.cellArray[i].getBoundingBox(), this.cellArray[i].parent.convertToNodeSpace(location)) && this.cellArray[i].parent.parent && this.cellArray[i].parent.parent.isVisible()) {
                if (!this.highlightedCell) {
                    this.highlightedCell = this.cellArray[i];
                }
                this.highlightedCell.playImg.setTexture(new cc.Sprite(ACTIVITY_CWC_1.spriteBasePath + ACTIVITY_CWC_1.config.graphicalAssets.play_btn.name).getTexture());
                if (eventType == cc.EventMouse.UP) {
                    this.cellArray[i].playImg.setTexture(new cc.Sprite(ACTIVITY_CWC_1.spriteBasePath + ACTIVITY_CWC_1.config.graphicalAssets.play_hover.name).getTexture());
                    this.highlightedCell = this.cellArray[i];

                } else if (eventType == cc.EventMouse.DOWN) {
                    if (this.cellArray[i].playImg) {
                        let sprite = new cc.Sprite(ACTIVITY_CWC_1.spriteBasePath + ACTIVITY_CWC_1.config.graphicalAssets.play_click.name);
                        let texture = sprite.getTexture();
                        if (texture) {
                            this.cellArray[i].playImg.setTexture(texture);
                            this.playSound(this.cellArray[i]);
                        }
                    }
                    this.highlightedCell = this.cellArray[i];
                } else {
                    if (this.cellArray[i].playImg) {
                        let sprite = new cc.Sprite(ACTIVITY_CWC_1.spriteBasePath + ACTIVITY_CWC_1.config.graphicalAssets.play_hover.name);
                        let texture = sprite.getTexture();
                        if (texture) {
                            this.cellArray[i].playImg.setTexture(texture);
                        }
                    }
                    this.highlightedCell = this.cellArray[i];
                }
            }
        }

        if (notOverLappedWithAnyone && this.highlightedCell) {
            this.highlightedCell.playImg.setTexture(new cc.Sprite(ACTIVITY_CWC_1.spriteBasePath + "Characters_play.png").getTexture());
            this.highlightedCell = null;
        }
    },

    socketListener: function (msg) {
        if (!ACTIVITY_CWC_1.ref)
            return;
        if (!ACTIVITY_CWC_1.ref.isTeacherView && msg.eventType == HDSocketEventType.GAME_MESSAGE && msg.data.eventType == ACTIVITY_CWC_1.socketEventKey.playCharacterSound) {
            ACTIVITY_CWC_1.ref.playCharacterData(msg.data);
        }
    },

    playCharacterData: function (msg) {
        let data = msg;
        ACTIVITY_CWC_1.ref.playAnimation(data.tag, data.character, data.audioIdx);
        cc.audioEngine.playEffect(ACTIVITY_CWC_1.soundPath + ACTIVITY_CWC_1.config.charactersData[data.character].audioData[data.audioIdx].audio);
    },

    updateRoomData: function () {
        SocketManager.emitCutomEvent("SingleEvent", {
            'eventType': HDSocketEventType.UPDATE_ROOM_DATA,
            'roomId': HDAppManager.roomId,
            'data': {
                "roomId": HDAppManager.roomId,
                "roomData": {
                    "activity": ACTIVITY_CWC_1.config.properties.namespace,
                    "data": "",
                    "activityStartTime": HDAppManager.getActivityStartTime()
                }
            }
        }, null);
    },
    syncData: function (data) {

    },

    playAnimation: function (tag, key, index) {
        var sprite = this.getChildByTag(tag);
        let action = "_idle_";
        let folder = ACTIVITY_CWC_1.config.charactersData[tag - ACTIVITY_CWC_1.Tag.characterBase].name;
        let name = folder;
        let frameCount = ACTIVITY_CWC_1.config.charactersData[tag - ACTIVITY_CWC_1.Tag.characterBase]["animation"]["RestPose01"].frameCount;
        let loop = 1000;
        let actionFolder = "Idle";
        let speed = 0.05;

        // let animation
        let idleAnimName = name;
        let idleAnimSpeed = speed;
        let idleAnimFolder = folder;
        this.idelAnim = cc.callFunc(() => {
            let randNum = Math.ceil(Math.random() * 2 + 1);
            sprite.runAction(new cc.Sequence(HDUtility.runFrameAnimation(ACTIVITY_CWC_1.animationBasePath + idleAnimFolder + "/" + "RestPose0" + randNum + "/" + idleAnimName + "_restpose0" + randNum + "_", ACTIVITY_CWC_1.config.charactersData[key]["animation"]["RestPose0" + randNum].frameCount, idleAnimSpeed, ".png", false), cc.callFunc(this.repeatAnimation, this,
                {
                    "sprite": sprite,
                    "name": idleAnimName,
                    "speed": idleAnimSpeed,
                    "key": tag - ACTIVITY_CWC_1.Tag.characterBase,
                    "folder": idleAnimFolder
                })));
        });

        let actionSeq = this.idelAnim;
        if (index != undefined && index.toString()) {
            action = "_" + ACTIVITY_CWC_1.config.charactersData[tag - ACTIVITY_CWC_1.Tag.characterBase].audioData[index].animation.toLowerCase() + "_";
            folder = ACTIVITY_CWC_1.config.charactersData[tag - ACTIVITY_CWC_1.Tag.characterBase].name;
            name = folder;
            frameCount = ACTIVITY_CWC_1.config.charactersData[tag - ACTIVITY_CWC_1.Tag.characterBase]["animation"][ACTIVITY_CWC_1.config.charactersData[tag - ACTIVITY_CWC_1.Tag.characterBase].audioData[index].animation].frameCount;
            //console.log( ACTIVITY_CWC_1.config.charactersData[tag - ACTIVITY_CWC_1.Tag.characterBase].audioData[index].text , frameCount);
            loop = 1;
            actionFolder = ACTIVITY_CWC_1.config.charactersData[tag - ACTIVITY_CWC_1.Tag.characterBase].audioData[index].animation;
            speed = 0.05;
            let animation = HDUtility.runFrameAnimation(ACTIVITY_CWC_1.animationBasePath + folder + "/" + actionFolder + "/" + name + action, frameCount, speed, ".png", loop);
            actionSeq = new cc.Sequence(animation, this.idelAnim);
            sprite.restPose = false;
        }
        sprite.stopAllActions();
        sprite.runAction(actionSeq);
    },
    repeatAnimation: function (parent, animInfo) {
        let randNum = Math.ceil(Math.random() * 2 + 1);
        animInfo.sprite.restPose = true;
        animInfo.sprite.runAction(new cc.Sequence(HDUtility.runFrameAnimation(ACTIVITY_CWC_1.animationBasePath + animInfo.folder + "/" + "RestPose0" + randNum + "/" + animInfo.name + "_restpose0" + randNum + "_", ACTIVITY_CWC_1.config.charactersData[animInfo.key]["animation"]["RestPose0" + randNum].frameCount, animInfo.speed, ".png", true), cc.callFunc(this.repeatAnimation, this, animInfo)));
    },

    buttonCallback: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                let tag = sender.getTag() - ACTIVITY_CWC_1.Tag.characterSelectBtnBase;
                this.toggleTableView(ACTIVITY_CWC_1.Tag.characterTableViewBase + tag);
                break;
        }
    },

    toggleTableView: function (tableTag) {
        let table = this.getChildByTag(tableTag);
        if (!table)
            return;
        table.setVisible(!table.isVisible());
        table.mid.setScaleY(table.isVisible() ? table.mid.finalScale : table.mid.initialScale);
        table.bottom.setPosition(cc.p(table.mid.getPositionX(), table.mid.getPositionY() - (table.mid.getContentSize().height * table.mid.getScaleY()) + 2));
    },

    mouseControlEnable: function (location) {
        if (this.highlightedCell) {
            return true;
        } else {
            for (let obj of this.handIconUI) {
                if (cc.rectContainsPoint(obj.getBoundingBox(), obj.getParent().convertToNodeSpace(location))) {
                    return true;
                }
            }
            return false;
        }
    },
});

ACTIVITY_CWC_1.TextCell = cc.TableViewCell.extend({
    cellData: null,
    ctor: function (cellSize) {
        this._super();
        this.setContentSize(cellSize);
        return true;
    },

    onEnter: function () {
        this._super();
    },

    createUI: function (tableIndex, index, startTag) {
        this.removeAllChildren(true);
        //BORDER
        this.layer = new cc.LayerColor(cc.color(100, 100 * Math.random() * 10, 100, 0), 130, this.getContentSize().height * 0.9);
        this.layer.setPosition(cc.p(0, 0));
        this.addChild(this.layer);
        if (tableIndex != undefined) {
            this.cellData = tableIndex;
            let lable = new cc.LabelTTF(ACTIVITY_CWC_1.config.charactersData[tableIndex].audioData[index].text,
                HDConstants.Sassoon_Regular, 12, cc.size(this.getContentSize().width * 0.8, 0), cc.TEXT_ALIGNMENT_LEFT, cc.TEXT_ALIGNMENT_CENTER);
            this.addChild(lable);
            lable.setFontFillColor(cc.color(0, 0, 0, 255));
            lable.setPosition(cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.4));

            //boarderLine
            let boarder = new cc.Sprite(ACTIVITY_CWC_1.spriteBasePath + "dotted_line_popup.png");
            boarder.setPosition(cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.95))
            this.addChild(boarder);

            this.playImg = new cc.Sprite(ACTIVITY_CWC_1.spriteBasePath + "Characters_play.png");
            this.playImg.setPosition(cc.p(this.getContentSize().width * 0.85, this.getContentSize().height * 0.47))
            this.addChild(this.playImg);
        }
    },
});

