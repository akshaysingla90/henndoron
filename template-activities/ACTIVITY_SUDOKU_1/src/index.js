var ACTIVITY_SUDOKU_1 = {};
ACTIVITY_SUDOKU_1.Tag = {
}
ACTIVITY_SUDOKU_1.socketEventKey = {
    SELECT_OBJ : 1,
    DRAG_OBJ: 2,
    PLACE_OBJ: 3,
    DISTRIBUTE_OBJ: 4,
    RETURN_OBJ : 5,
    SELECT_SWAP_OBJ : 6,
    PLACE_SWAP_OBJ : 7,
    UPDATE_BOARD_DATA : 8,
}
ACTIVITY_SUDOKU_1.TileStatus =  {
    Empty: 0,
    Busy: 1,
    Finalised: 2,
}
ACTIVITY_SUDOKU_1.ref = null;
ACTIVITY_SUDOKU_1.SudokuLayer = HDBaseLayer.extend({
    isTeacherView: false,
    isScriptDisplayed : false,
    interactableObject:true,
    curObj: null,
    boardBg:null,
    sidebarTextLable: null,
    gridSize : 88.33,
    gridData : [],
    gridSyncData : [],
    sidebarButtons : [],
    syncDataInfo: null,
    conflictLayerOne : null,
    conflictLayerTwo : null,
    toBeSwappedObjectGridData : {},
    isSwapEnable : false,
    isGameWin : false,
    handIconUI : [],
    boardData : [],
    MouseTextureUrl: "",
    customTexture: true,
    ctor: function () {
        this._super();
    },

    onEnter: function () {
        this._super();
        ACTIVITY_SUDOKU_1.ref = this;
        cc.loader.loadJson("res/Activity/ACTIVITY_SUDOKU_1/config.json", function (error, config) {
            ACTIVITY_SUDOKU_1.config = config;
            ACTIVITY_SUDOKU_1.resourcePath = "res/Activity/" + "ACTIVITY_SUDOKU_1/res/"
            ACTIVITY_SUDOKU_1.soundPath = ACTIVITY_SUDOKU_1.resourcePath + "Sound/";
            ACTIVITY_SUDOKU_1.animationBasePath = ACTIVITY_SUDOKU_1.resourcePath + "AnimationFrames/";
            ACTIVITY_SUDOKU_1.spriteBasePath = ACTIVITY_SUDOKU_1.resourcePath + "Sprite/";
            ACTIVITY_SUDOKU_1.ref.isTeacherView = HDAppManager.isTeacherView;
            ACTIVITY_SUDOKU_1.ref.MouseTextureUrl = ACTIVITY_SUDOKU_1.spriteBasePath + config.cursors.data.cursor.imageName;
            ACTIVITY_SUDOKU_1.ref.setupUI();
            ACTIVITY_SUDOKU_1.ref.createObject();
            if (ACTIVITY_SUDOKU_1.ref.isTeacherView) {
                ACTIVITY_SUDOKU_1.ref.updateRoomData();
                ACTIVITY_SUDOKU_1.ref.isStudentInteractionEnable = true;
            }
            if(!this.isScriptDisplayed){
                ACTIVITY_SUDOKU_1.ref.triggerScript(config.teacherScripts.data.moduleStart.content.ops );
                this.isScriptDisplayed = true;
            }
        });
    },

    onExit: function () {
        this._super();
        ACTIVITY_SUDOKU_1.ref.removeAllChildrenWithCleanup(true);
        ACTIVITY_SUDOKU_1.ref.customTexture = false;
        ACTIVITY_SUDOKU_1.ref.interactableObject = false;
        ACTIVITY_SUDOKU_1.ref = null;
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
     //BG
        let bgColor = this.createColourLayer(cc.color(253, 208, 75, 255 ),
            this.getContentSize().width, this.getContentSize().height, cc.p(0, 0),
            this, 0);
        this.sidebarObjects();
        this.board();
        this.updateGameWithSyncData();
    },
    sidebarObjects : function() {
        let imgArr =  ACTIVITY_SUDOKU_1.config.assets.sections.arrayOfAssets.data;
        let sidebarData = [];
        for(let i = 0; i < 6; ++i){
            sidebarData[i] = {normalImage : ACTIVITY_SUDOKU_1.spriteBasePath + imgArr[i].imageName, name : imgArr[i].label};
        }
        let initialX = cc.winSize.width * 0.07;
        let initialY = cc.winSize.height * 0.21;
        let sidebarBgSprite = this.addSprite(ACTIVITY_SUDOKU_1.spriteBasePath + ACTIVITY_SUDOKU_1.config.assets.sections.arrayOfAssets.data[7].imageName,cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5),this);
        for(var i = 0; i < 6; ++i){
            let sidebarButton = this.createButton(sidebarData[i].normalImage,null,null,null,i,cc.p(initialX, initialY ),this,null,sidebarData[i].normalImage);
            sidebarButton.setName(sidebarData[i].name);
            sidebarButton.setScale(0.22);
            sidebarButton.setTouchEnabled(false);
            this.sidebarButtons.push(sidebarButton);
            initialY += 75;
        }
        this.sidebarTextLable = new cc.LabelTTF("", HDConstants.Sassoon_Regular, 20);
        this.sidebarTextLable.setColor(HDConstants.Black);
        this.sidebarTextLable.setAnchorPoint(0,0.5);
        this.sidebarTextLable.setLocalZOrder(12);
        this.sidebarTextLable.setVisible(false);
        this.addChild(this.sidebarTextLable);
    },
    board : function () {
        //boardBG
        this.boardBg = this.addSprite(ACTIVITY_SUDOKU_1.spriteBasePath + ACTIVITY_SUDOKU_1.config.assets.sections.arrayOfAssets.data[6].imageName,cc.p(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5),this);
        //Conflicted Layers
        this.conflictLayerOne = this.createConflictedLayer();
        this.conflictLayerTwo = this.createConflictedLayer();
        let initialX = this.getContentSize().width * 0.215;
        let initialY = this.getContentSize().height * 0.043;
        for(var i = 0; i < 6; ++i){

            //WhiteLine
            if(i >= 1 && i<= 5 ) {
                let hWhiteLine = this.addSprite(ACTIVITY_SUDOKU_1.spriteBasePath + "line.png",cc.p(initialX + i * this.gridSize,this.getContentSize().height * 0.51),this);
                let vWhiteLine = this.addSprite(ACTIVITY_SUDOKU_1.spriteBasePath + "line.png",cc.p(this.getContentSize().width * 0.52,initialY + i * this.gridSize),this);

                vWhiteLine.setRotation(90);
                vWhiteLine.setScale(i%2 == 0 ? 1 : 0.4,1);
                hWhiteLine.setScale(i%3 == 0 ? 1 : 0.4,1);
                vWhiteLine.setAnchorPoint(0.5,0.5);
                hWhiteLine.setLocalZOrder(12);
                vWhiteLine.setLocalZOrder(12);
            }
            this.gridData[i] = [];
            //Grid
            for(var j = 0; j < 6 && i < 6; ++j){
                //BG Grid
                let layer = this.createColourLayer(cc.color(100, Math.random() * 255, Math.random() * 255, 0 ),
                    this.gridSize, this.gridSize + 0.13 * i, cc.p(initialX + j*this.gridSize, initialY + i*(this.gridSize + 0.13 * i)),
                    this, 10,
                    );

                layer.coordinate = {"x": i, "y": j};
                this.boardData = ACTIVITY_SUDOKU_1.config.assets.sections.arrayOfBoardData.data;
                ACTIVITY_SUDOKU_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {"eventType" : ACTIVITY_SUDOKU_1.socketEventKey.UPDATE_BOARD_DATA, "data" :this.boardData});
                let configGridData = this.boardData[i].rowData[j];
                    let sprite = this.addSprite(ACTIVITY_SUDOKU_1.spriteBasePath + ACTIVITY_SUDOKU_1.config.assets.sections.arrayOfAssets.data[configGridData.imageId].imageName, cc.p(layer.getPositionX() +  layer.getContentSize().width * 0.5, layer.getPositionY() + layer.getContentSize().height * 0.5 ), this);
                    sprite.setLocalZOrder(11);
                    sprite.setScale(0.2);
                    sprite.setVisible(this.isTeacherView);
                    layer.status = ACTIVITY_SUDOKU_1.TileStatus.Finalised;
                    layer.imageId = configGridData.imageId;
                    layer.img = sprite;
                    layer.img.name = configGridData.label;
                    if(i == 0){
                        layer.isColumnCompleted = true;
                    }
                    if(j == 0){
                        layer.isRowCompleted = true;
                    }
                    if(i%2 == 0 && j%3 == 0){
                        layer.isBlockCompleted = false;
                    }
                 this.gridData[i].push(layer);
            }
        }
        if(this.isTeacherView) {
            this.showRandomObjectsOnBoard();
            this.updateGridSyncData();
            this.updateRoomData();
            let params = ACTIVITY_SUDOKU_1.ref.gridSyncData;
            ACTIVITY_SUDOKU_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {"eventType" : ACTIVITY_SUDOKU_1.socketEventKey.DISTRIBUTE_OBJ, "data" :params});
        }


    },

    updateGameWithSyncData : function(){
        if (this.syncDataInfo && this.syncDataInfo.dataArray) {
            let syncDataArray = this.syncDataInfo.dataArray;
            for(let i = 0; i< this.gridData.length; ++i){
                for(let j = 0; j < this.gridData[i].length; ++j){
                    let obj = this.gridData[i][j];
                    let syncDataObj = syncDataArray[i][j];
                    if(syncDataObj.name){
                        obj.img.name = syncDataObj.name;
                        obj.img.setTexture(ACTIVITY_SUDOKU_1.spriteBasePath + ACTIVITY_SUDOKU_1.config.assets.sections.arrayOfAssets.data[syncDataObj.imageId].imageName);
                        if(syncDataArray[i][j].status){
                            obj.status = ACTIVITY_SUDOKU_1.TileStatus.Busy;
                        }
                        else{
                            obj.status = ACTIVITY_SUDOKU_1.TileStatus.Finalised;
                        }
                        obj.img.setVisible(true);
                    }
                    else{
                        obj.status = ACTIVITY_SUDOKU_1.TileStatus.Empty;
                        obj.img.name = "";
                        obj.img.setVisible(false);
                    }
                }
            }
            for(let i = 0; i < this.gridData.length; ++i){
                let rowComplete = this.checkIfRowCompleted(i);
                let columnComplete = this.checkIfColumnCompleted(i);
                this.gridData[i][0].isRowCompleted = rowComplete;
                this.gridData[0][i].isColumnCompleted = columnComplete;
                if(!rowComplete || !columnComplete){
                    this.isGameWin = false;
                    let tempRow = (i % 2 == 0) ? i : i-1;
                    this.gridData[tempRow][0].isBlockCompleted = false;
                    this.gridData[tempRow][3].isBlockCompleted = false;
                }
            }
            if(this.isTeacherView) {
                this.updateGridSyncData();
                this.updateRoomData();
                let params = ACTIVITY_SUDOKU_1.ref.gridSyncData;
                ACTIVITY_SUDOKU_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {"eventType" : ACTIVITY_SUDOKU_1.socketEventKey.DISTRIBUTE_OBJ, "data" :params});
            }
        }
    },

    createObject : function (){
        this.curObj = this.addSprite(ACTIVITY_SUDOKU_1.spriteBasePath + ACTIVITY_SUDOKU_1.config.assets.sections.arrayOfAssets.data[0].imageName, cc.p(0, 0), this );
        this.curObj.setLocalZOrder(13);
        this.curObj.setScale(0.3);
        this.curObj.setVisible(false);
    },

    selectObject : function (objectDetails) {
        this.curObj.setTexture( new cc.Sprite(objectDetails.url).getTexture());
        this.curObj.setVisible(true);
        this.curObj.name = objectDetails.name;
        this.curObj.position = objectDetails.position;
        this.curObj.setPosition(objectDetails.position);
    },

    moveObject : function (location) {
        if(this.curObj.isVisible()){
            this.curObj.setPosition(location);
            this.placeGrid( this.curObj, location, cc.EventMouse.MOVE, true);
        }
    },

    createConflictedLayer : function(){
        let conflictLayer = this.createColourLayer(cc.color(255, 0, 0, 0 ),
            this.gridSize, this.gridSize, cc.p(0, 0), this, 10);
        conflictLayer.setVisible(false);
        return conflictLayer;
    },

    showRandomObjectsOnBoard : function(){
        let columnCountArr = [];
        for(let k = 0; k < this.gridData.length; ++k){
            columnCountArr.push(0);
        }
        for(let i = 0; i < this.gridData.length; i += 2){
            let arrayForRandomNumbers = [];
            for(let k = 0; k < this.gridData.length; ++k){
                arrayForRandomNumbers.push(k);
            }
            for(let j = 0; j < 3; ++j){
                let randNum = Math.floor(Math.random() * arrayForRandomNumbers.length);
                let randomNumber = arrayForRandomNumbers.splice(randNum,1)[0];
                while(columnCountArr[randomNumber] >= 3){
                    randNum = Math.floor(Math.random() * arrayForRandomNumbers.length);
                    randomNumber = arrayForRandomNumbers.splice(randNum,1)[0];
                }

                let objOfRow1 = this.gridData[i][randomNumber];
                objOfRow1.status = ACTIVITY_SUDOKU_1.TileStatus.Empty;
                objOfRow1.img.name = "";
                objOfRow1.img.setVisible(false);
                this.gridData[i][0].isRowCompleted = false;
                this.gridData[0][randomNumber].isColumnCompleted = false;
                columnCountArr[randomNumber]++;

                randomNumber = (randomNumber < 3) ? randomNumber+3 : randomNumber-3;

                let objOfRow2 = this.gridData[i+1][randomNumber];
                objOfRow2.status = ACTIVITY_SUDOKU_1.TileStatus.Empty;
                objOfRow2.img.name = "";
                objOfRow2.img.setVisible(false);
                this.gridData[i+1][0].isRowCompleted = false;
                this.gridData[0][randomNumber].isColumnCompleted = false;
                columnCountArr[randomNumber]++;
            }
            if(i == 2){
                for(let k = 0; k < 3; ++k){
                    if(columnCountArr[k] == 0){
                        for(let col = 0; col < 6; ++col){
                            let tempRow = 2;
                            let configGridData = this.boardData[tempRow].rowData[col];
                            let replaceObjOfRow1 = this.gridData[tempRow][col];
                            if(replaceObjOfRow1.status == ACTIVITY_SUDOKU_1.TileStatus.Empty){
                                columnCountArr[col]--;
                            }
                            replaceObjOfRow1.status = ACTIVITY_SUDOKU_1.TileStatus.Finalised;
                            replaceObjOfRow1.img.name = configGridData.label;
                            replaceObjOfRow1.img.setVisible(true);

                            configGridData = this.boardData[tempRow+1].rowData[col];
                            let replaceObjOfRow2 = this.gridData[tempRow+1][col];
                            if(replaceObjOfRow2.status == ACTIVITY_SUDOKU_1.TileStatus.Empty){
                                columnCountArr[col]--;
                            }
                            replaceObjOfRow2.status = ACTIVITY_SUDOKU_1.TileStatus.Finalised;
                            replaceObjOfRow2.img.name = configGridData.label;
                            replaceObjOfRow2.img.setVisible(true);
                        }
                        i = 0;
                    }
                }
            }
        }
    },

    placeGrid : function ( obj, location, mouseEventType, isManual ){
        if(!this.curObj.isVisible()){
            return;
        }
        let row = -1;
        let column = -1;
        this.conflictLayerOne.setVisible(false);
        this.conflictLayerTwo.setVisible(false);
        for(let  i = 0 ; i < this.gridData.length; ++i)  {
             for(let  j = 0 ; j < this.gridData[i].length; ++j){
             if(cc.rectContainsPoint( this.gridData[i][j].getBoundingBox(), this.convertToNodeSpace(location))){

                 let startingRowOfBlock = (i%2 == 0? i : i-1);
                 let startingColumnOfBlock = (j%3 == 0? j : (j%3 == 1 ? j-1 : j-2));
                 if(this.gridData[i][0].isRowCompleted || this.gridData[0][j].isColumnCompleted || this.gridData[startingRowOfBlock][startingColumnOfBlock].isBlockCompleted){
                     if(mouseEventType == cc.EventMouse.UP){
                         //    move to previous place
                         this.returnToOrigin(false);
                     }
                     return;
                 }

                 row = i, column = j;
                 let response = this.checkIfValidGrid(obj, row, column);
                 if(!response.status ){
                     this.showConflictedGrid(response.row, response.column, this.conflictLayerOne);
                     this.showConflictedGrid(row, column, this.conflictLayerTwo);
                     if(mouseEventType == cc.EventMouse.UP){
                         this.conflictLayerOne.setVisible(false);
                         this.conflictLayerTwo.setVisible(false);
                     //    move to previous place
                         this.returnToOrigin(false);
                     }
                 }else{
                     if(mouseEventType == cc.EventMouse.UP) {
                         this.placeObject(obj, response.row, response.column, isManual );
                         this.playAnimation(response.row,response.column);
                     }
                 }
             }
             this.gridData[i][j].setOpacity(0);
         }
        }
    },

    placeObject : function (obj, row, column, isChangeTurn){
        let isBlockCompleted = this.checkIfBlockComplete(row,column);
        let isRowCompleted = this.checkIfRowCompleted(row);
        let isColumnCompleted = this.checkIfColumnCompleted(column);
        let grid = this.gridData[row][column];
        grid.img.setTexture(obj.getTexture());
        grid.img.name = obj.name;
        grid.img.setScale(0.2);
        grid.img.setVisible(true);
        grid.status = ACTIVITY_SUDOKU_1.TileStatus.Busy;
        if(obj.name == ""){
            grid.img.setVisible(false);
            grid.status = ACTIVITY_SUDOKU_1.TileStatus.Empty;
        }
        this.curObj.setVisible(false);
        this.parent.setResetButtonActive(true);
        if(!this.isSwapEnable || !isBlockCompleted || !isRowCompleted || !isColumnCompleted ){
            let configGridData = this.boardData[row].rowData[column];
            if(this.gridData[row][column].img.name == configGridData.label) {
                this.runSingleObjectPlacedAnimation(row, column);
                grid.status = ACTIVITY_SUDOKU_1.TileStatus.Finalised;
            }
        }
        this.updateGridSyncData();
        this.updateRoomData();
        if (isChangeTurn && !this.isTeacherView &&  this.isStudentInteractionEnable) {
            this.emitSocketEvent(HDSocketEventType.SWITCH_TURN_BY_STUDENT, {"roomId": HDAppManager.roomId});
        }
    },

    returnToOrigin : function (isSwapEnable, toBeSwappedObjectGridData){
        ACTIVITY_SUDOKU_1.ref.conflictLayerOne.setVisible(false);
        ACTIVITY_SUDOKU_1.ref.conflictLayerTwo.setVisible(false);
        let tempObj = this.addSprite(this.curObj.getTexture().url,this.curObj.getPosition(),this.curObj.getParent());
        tempObj.setLocalZOrder(this.curObj.getLocalZOrder());
        tempObj.setScale(this.curObj.getScale());
        this.curObj.setVisible(false);
        tempObj.runAction(cc.sequence(cc.moveTo(0.4,this.curObj.position.x,this.curObj.position.y),cc.delayTime(0.2),cc.callFunc(()=>{
            tempObj.setVisible(false);
            if(isSwapEnable){
                let grid =  ACTIVITY_SUDOKU_1.ref.gridData[toBeSwappedObjectGridData.row][toBeSwappedObjectGridData.column];
                grid.img.setTexture(this.curObj.getTexture());
                grid.img.setVisible(true);
                grid.img.name = this.curObj.name;
            }
        })));
    },

    playAnimation : function(row, column){

        let isBlockCompleted = this.checkIfBlockComplete(row,column);
        let isRowCompleted = this.checkIfRowCompleted(row);
        let isColumnCompleted = this.checkIfColumnCompleted(column);

        // Row or Column Completed Info Updation
        if(isRowCompleted){
            this.gridData[row][0].isRowCompleted = true;
        }
        if(isColumnCompleted){
            this.gridData[0][column].isColumnCompleted = true;
        }

        this.isGameWin = this.checkIfGameWin();
        if(this.isGameWin){
            this.runSingleObjectPlacedAnimation(row,column);
            this.runWinAnimation();
            return;
        }
        if(isBlockCompleted){
            let i = row;
            let j = column;
            let time = 0;
            for(let k = 0; k < this.gridData.length; ++k){
                let tempI = i;
                let tempJ = j;
                this.gridData[i][j].status = ACTIVITY_SUDOKU_1.TileStatus.Finalised;
                setTimeout((i,j)=>{
                    ACTIVITY_SUDOKU_1.ref.runSingleObjectPlacedAnimation(i,j);
                }, time * 70,i,j);
                //Update row
                if( i%2 == 0 && j%3 == 0){
                    ++tempI;
                }
                else if((j+1)%3 == 0 && i%2 != 0){
                    --tempI;
                }

                // Update Column
                if(i%2 != 0 && (j+1)%3 != 0){
                    ++tempJ;
                    ++time;
                }
                else  if( i%2 == 0 && j%3 == 0) {
                    tempJ = tempJ;
                    ++time;
                }
                else if(i%2 == 0){
                    --tempJ;
                    ++time;
                }
                i = tempI;
                j = tempJ;
            }
            this.blockCompleted(row,column);
        }
        //Row or Column Completed Animation
        if(isRowCompleted) {
            let i = column;
            let time = 0;
            while(i >= 0){
                setTimeout((i,row)=>{
                    ACTIVITY_SUDOKU_1.ref.runSingleObjectPlacedAnimation(row,i);
                },time * 70,i,row);

                if(i == (this.gridData[row].length - 1)){
                    i = column - 1;
                    ++time;
                }
                else if( i < column){
                    --i;
                    ++time;
                }
                else{
                    ++i;
                    ++time;
                }
            }
            this.lineCompleted({"row": row});
        }
        if(isColumnCompleted){
            let i = row;
            let time = 0;
            while(i >= 0){
                setTimeout((i,column)=>{
                    ACTIVITY_SUDOKU_1.ref.runSingleObjectPlacedAnimation(i,column);
                },time * 70,i,column);

                if(i == (this.gridData[row].length - 1)){
                    i = row - 1;
                    ++time;
                }
                else if( i < row){
                    --i;
                    ++time;
                }
                else{
                    ++i;
                    ++time;
                }
            }
            this.lineCompleted({"column": column});
        }
    },

    checkIfBlockComplete : function (row,column){
        let blockCompleted = true;
        let startingRow = (row%2 == 0? row : row-1);
        let startingColumn = (column%3 == 0? column : (column%3 == 1 ? column-1 : column-2));
        for(let i = startingRow; i < (startingRow + this.gridData.length/3); ++i){
            for( let j = startingColumn; j < (startingColumn + this.gridData[i].length/2); ++j){
                let obj = this.gridData[i][j];
                if(obj.status ==  ACTIVITY_SUDOKU_1.TileStatus.Empty || obj.status ==  ACTIVITY_SUDOKU_1.TileStatus.Busy){
                    blockCompleted = false;
                    return blockCompleted;
                }
            }
        }
        return blockCompleted;
    },

    checkIfRowCompleted : function(row){
        let rowCompleted = true;
        for(let i = 0; i < this.gridData[row].length; ++i) {
            let obj = this.gridData[row][i];
            if (obj.status == ACTIVITY_SUDOKU_1.TileStatus.Empty || obj.status ==  ACTIVITY_SUDOKU_1.TileStatus.Busy) {
                rowCompleted = false;
                return rowCompleted;
            }
        }
        return rowCompleted;
    },

    checkIfColumnCompleted : function(column){
        let columnCompleted = true;
        for(let i= 0; i < this.gridData.length; ++i) {
            let obj = this.gridData[i][column];
            if (obj.status == ACTIVITY_SUDOKU_1.TileStatus.Empty || obj.status ==  ACTIVITY_SUDOKU_1.TileStatus.Busy) {
                columnCompleted = false;
                return columnCompleted;
            }
        }
        return columnCompleted;
    },

    checkIfGameWin : function(){
        let isGameWin = false;
        let isRowsCompleted = true;
        let isColumnsCompleted = true;
        for(let i= 0; i < this.gridData.length; ++i) {
            let rowObj = this.gridData[i][0];
            let columnObj = this.gridData[0][i];
            if(!rowObj.isRowCompleted){
                isRowsCompleted = false;
            }
            if(!columnObj.isColumnCompleted){
                isColumnsCompleted = false;
            }
        }
        if(isRowsCompleted && isColumnsCompleted){
            isGameWin = true;
        }
        return isGameWin;
    },

    checkIfValidGrid : function (draggedObj, row, column){
      let response  = {"status":  true, "row": row, "column": column,
          "rowCompleted": true, "columnCompleted" : true};
      //Check Rows
        for(let i = 0; i < this.gridData[row].length; ++i) {
            let obj = this.gridData[row][i];
            if (obj.img.name == draggedObj.name) {
                response.status = false;
                response.column = i;
                response.row = row;
                return response;
            }

        }
      //CheckColumn
        for(let i= 0; i < this.gridData.length; ++i){
            let obj = this.gridData[i][column];
            if( obj.img.name  == draggedObj.name){
                response.status = false;
                response.column = column;
                response.row = i;
                return response;
            }
        }

        if (this.gridData[row][column].status ==  ACTIVITY_SUDOKU_1.TileStatus.Finalised || (this.gridData[row][column].status ==  ACTIVITY_SUDOKU_1.TileStatus.Busy && !this.isSwapEnable)){
            response.status = false;
        }
        return response;
    },

    updateGridSyncData : function(){
        for(let i = 0; i< this.gridData.length; ++i){
            this.gridSyncData[i] = [];
            for(let j = 0; j < this.gridData[i].length; ++j){
                let obj = this.gridData[i][j];
                let syncDataObj = {};
                if(obj.img.name){
                    let objStatus = "";
                    if(obj.status == ACTIVITY_SUDOKU_1.TileStatus.Busy){
                        objStatus = "1";
                    }
                    syncDataObj = {"name" : obj.img.name, "status" : objStatus, "imageId" : obj.imageId};
                }
                else{
                    syncDataObj = {"name" : obj.img.name};
                }
                this.gridSyncData[i].push(syncDataObj);
            }
        }
    },

    lineCompleted:  function (params){
        if(params.row >= 0){
            this.runObjectPlacedAnimation(params.row,params.column);
        }
        if(params.column >= 0){
            this.runObjectPlacedAnimation(params.row,params.column);
        }
    },

    showConflictedGrid : function (row, column, conflictedLayer) {
      let obj = this.gridData[row][column];
      conflictedLayer.setPosition(obj.getPosition());
      conflictedLayer.setVisible(true);
      conflictedLayer.runAction(cc.sequence(cc.fadeOut(0.1),cc.fadeIn(0.1)).repeat(5));
    },

    blockCompleted : function(row,column){
        let startingRow = (row%2 == 0? row : row-1);
        let startingColumn = (column%3 == 0? column : (column%3 == 1 ? column-1 : column-2));
        let animationRow = (row%2 == 0? row : row-1);
        let animationColumn = (column%3 == 1? column : (column%3 == 0 ? column+1 : column-1));
        this.gridData[startingRow][startingColumn].isBlockCompleted = true;
        this.runAnimationForSixElement(animationRow,animationColumn);
    },

    swapObject : function(draggedObj,row,column){
        let originRow = this.toBeSwappedObjectGridData.row;
        let originColumn = this.toBeSwappedObjectGridData.column;
            let obj = this.gridData[row][column];
            if(obj.status == ACTIVITY_SUDOKU_1.TileStatus.Busy || obj.status == ACTIVITY_SUDOKU_1.TileStatus.Empty){
                let swappedObj = this.addSprite(obj.img.getTexture().url,obj.img.getPosition(),obj.img.getParent());
                swappedObj.setLocalZOrder(obj.img.getLocalZOrder());
                swappedObj.setScale(obj.img.getScale());
                swappedObj.name = obj.img.name;
                obj.img.name = "";
                let responseOfDraggedObj = this.checkIfValidGrid(draggedObj,row,column);
                let responseOfSwappedObj = this.checkIfValidGrid(swappedObj,originRow,originColumn);
                if(obj.status == ACTIVITY_SUDOKU_1.TileStatus.Empty){
                    responseOfSwappedObj.status = true;
                }
                if(responseOfDraggedObj.status && responseOfSwappedObj.status){
                    this.placeObject(swappedObj,originRow,originColumn, false);
                    this.placeObject(draggedObj,row, column,true);
                    let params = { "row" : row, "column" : column, "originRow" : originRow, "originColumn" : originColumn};
                    this.playAnimation(row,column);
                    this.playAnimation(originRow,originColumn);

                    ACTIVITY_SUDOKU_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {"eventType" : ACTIVITY_SUDOKU_1.socketEventKey.PLACE_SWAP_OBJ, "data" : params } );
                }
                else{
                    let params = {"isSwapEnable" : this.isSwapEnable, "toBeSwappedObjectGridData" : this.toBeSwappedObjectGridData};
                    this.returnToOrigin(this.isSwapEnable, this.toBeSwappedObjectGridData);
                    obj.img.name = swappedObj.name;
                    ACTIVITY_SUDOKU_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {"eventType" : ACTIVITY_SUDOKU_1.socketEventKey.RETURN_OBJ, "data" : params});
                }
                swappedObj.setVisible(false);
            }
            else{
                let params = {"isSwapEnable" : this.isSwapEnable, "toBeSwappedObjectGridData" : this.toBeSwappedObjectGridData};
                this.returnToOrigin(this.isSwapEnable, this.toBeSwappedObjectGridData);
                ACTIVITY_SUDOKU_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {"eventType" : ACTIVITY_SUDOKU_1.socketEventKey.RETURN_OBJ, "data" : params});
            }
            this.isSwapEnable = false;
    },

    sidebarButtonClick : function(sender){
        if (!ACTIVITY_SUDOKU_1.ref.isStudentInteractionEnable)
            return;
        let params =  {
            "url": sender._normalFileName,
            "position": ACTIVITY_SUDOKU_1.ref.convertToNodeSpace(sender.getPosition()),
            "name": sender.name
        };
        this.emitSocketEvent( HDSocketEventType.GAME_MESSAGE, {"eventType": ACTIVITY_SUDOKU_1.socketEventKey.SELECT_OBJ, "data":{params} } );
        this.selectObject(params);
    },

    reset : function (){
        this.isGameWin = false;
        this.resetBoard();
        this.parent.setResetButtonActive(false);
    },

    resetBoard : function(){
        this.boardData = this.resetBoardData();
        ACTIVITY_SUDOKU_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {"eventType" : ACTIVITY_SUDOKU_1.socketEventKey.UPDATE_BOARD_DATA, "data" :this.boardData});
        for(let  i = 0 ; i < this.gridData.length; ++i) {
            for (let j = 0; j < this.gridData[i].length; ++j) {
                let obj = this.gridData[i][j];
                let configGridData = this.boardData[i].rowData[j];
                obj.img.setTexture(ACTIVITY_SUDOKU_1.spriteBasePath + ACTIVITY_SUDOKU_1.config.assets.sections.arrayOfAssets.data[configGridData.imageId].imageName);
                obj.img.setVisible(this.isTeacherView);
                obj.status = ACTIVITY_SUDOKU_1.TileStatus.Finalised;
                obj.imageId = configGridData.imageId;
                obj.img.name = configGridData.label;
                if (i == 0) {
                    obj.isColumnCompleted = true;
                }
                if (j == 0) {
                    obj.isRowCompleted = true;
                }
                if (i % 2 == 0 && j % 3 == 0) {
                    obj.isBlockCompleted = false;
                }
            }
        }
        if(this.isTeacherView) {
            this.showRandomObjectsOnBoard();
            this.updateGridSyncData();
            this.updateRoomData();
            this.isGameWin = false;
            let params = ACTIVITY_SUDOKU_1.ref.gridSyncData;
            ACTIVITY_SUDOKU_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {"eventType" : ACTIVITY_SUDOKU_1.socketEventKey.DISTRIBUTE_OBJ, "data" :params});
        }

    },

    resetBoardData : function(){
        let boardData = [];
        let configGridData = ACTIVITY_SUDOKU_1.config.assets.sections.arrayOfAssets.data;
        for(let i = 0; i < this.gridData.length; ++i){
            boardData[i] = {"rowData" : []};
            if(i % 2 == 0){
                let arrayForRandomNumbers = [];
                for(let k = 0; k < this.gridData.length; ++k){
                    arrayForRandomNumbers.push(k);
                }
                for(let j = 0; j < this.gridData.length; ++j) {
                    let randNum = Math.floor(Math.random() * arrayForRandomNumbers.length);
                    let randomNumber = arrayForRandomNumbers.splice(randNum,1)[0];
                    let name = configGridData[randomNumber].label;
                    let count = 0;
                    while( count <=5 && !(this.checkIfColumnValid(boardData,j,name))){
                        arrayForRandomNumbers.push(randomNumber);
                        randNum = Math.floor(Math.random() * arrayForRandomNumbers.length);
                        randomNumber = arrayForRandomNumbers.splice(randNum,1)[0];
                        name = configGridData[randomNumber].label;
                        count++;
                    }
                    if(count > 5 && !(this.checkIfColumnValid(boardData,j,name))){
                        i = i-1;
                        break;
                    }
                    boardData[i].rowData[j] = {"label" : configGridData[randomNumber].label, "imageId" : randomNumber};
                }
            }
            else{
                let arrayForLeftRandomNumbers = [];
                let arrayForRightRandomNumbers = [];
                for(let k = 0; k < 3; ++k){
                    arrayForLeftRandomNumbers.push(k+3);
                    arrayForRightRandomNumbers.push(k);
                }
                for(let j = 0; j < 3; ++j) {
                    let leftRandNum = Math.floor(Math.random() * arrayForLeftRandomNumbers.length);
                    let leftRandomNumber = arrayForLeftRandomNumbers.splice(leftRandNum,1)[0];
                    let rightRandNum = Math.floor(Math.random() * arrayForRightRandomNumbers.length);
                    let rightRandomNumber = arrayForRightRandomNumbers.splice(rightRandNum,1)[0];
                    let name = boardData[i-1].rowData[leftRandomNumber].label;
                    let count = 0;
                    while(count <= 5 && !(this.checkIfColumnValid(boardData,j,name))){
                        arrayForLeftRandomNumbers.push(leftRandomNumber);
                        leftRandNum = Math.floor(Math.random() * arrayForLeftRandomNumbers.length);
                        leftRandomNumber = arrayForLeftRandomNumbers.splice(leftRandNum,1)[0];
                        name = boardData[i-1].rowData[leftRandomNumber].label;
                        count++;
                    }
                    if(count > 5 && !(this.checkIfColumnValid(boardData,j,name))){
                        i = i-2;
                        break;
                    }
                    count = 0;
                    name = boardData[i-1].rowData[rightRandomNumber].label;
                    while(count <= 5 && !(this.checkIfColumnValid(boardData,j+3,name))){
                        arrayForRightRandomNumbers.push(rightRandomNumber);
                        rightRandNum = Math.floor(Math.random() * arrayForRightRandomNumbers.length);
                        rightRandomNumber = arrayForRightRandomNumbers.splice(rightRandNum, 1)[0];
                        name = boardData[i - 1].rowData[rightRandomNumber].label;
                        count++;
                    }
                    if(count > 5 && !(this.checkIfColumnValid(boardData,j+3,name))){
                        i = i-2;
                        break;
                    }
                    boardData[i].rowData[j] = {"label" : boardData[i-1].rowData[leftRandomNumber].label,"imageId" : boardData[i-1].rowData[leftRandomNumber].imageId};
                    boardData[i].rowData[j+3] = {"label" : boardData[i-1].rowData[rightRandomNumber].label,"imageId" : boardData[i-1].rowData[rightRandomNumber].imageId};
                }
            }
        }
        return boardData;
    },

    checkIfColumnValid : function(boardData,column,name){
        let isColumnValid = true;
        for(let i = 0; i < boardData.length; ++i){
            if(boardData[i].rowData[column]){
                if(boardData[i].rowData[column].label == name){
                    isColumnValid = false;
                    return isColumnValid;
                }
            }
        }
        return isColumnValid;
    },

    checkIfButtonClicked : function(location){
        if(!this.isGameWin){
            for(let i = 0; i < this.sidebarButtons.length; ++i){
                let button = this.sidebarButtons[i];
                if(cc.rectContainsPoint(button.getBoundingBox(),location)){
                    this.sidebarButtonClick(button);
                }
            }
        }
    },

    runObjectPlacedAnimation : function (row,column){
        //add sprite by using first frame.
        let middlePoint;
        let spritePosition;
        if(row >= 0){
            middlePoint = this.gridData[row][2];
            spritePosition = cc.p(middlePoint.getPosition().x + this.gridSize,middlePoint.getPosition().y+ this.gridSize * 0.5);
        }
        else {
            middlePoint = this.gridData[2][column];
            spritePosition = cc.p(middlePoint.getPosition().x + this.gridSize * 0.5,middlePoint.getPosition().y+ this.gridSize);
        }
        let sprite = this.addSprite(ACTIVITY_SUDOKU_1.animationBasePath + "CompleteRowOrColumn/complete_row_0001.png",spritePosition,this);
        sprite.setLocalZOrder(12);
        if(row >= 0){
            sprite.setRotation(90);
        }
        //Scale the sprite based on the bounded area of firstpoint  and second-point
        //position the sprite with respect topoint
        //runAnimation

        //-------------------- update frame path and number of frames
        let animation = HDUtility.runFrameAnimation( ACTIVITY_SUDOKU_1.animationBasePath + "CompleteRowOrColumn/complete_row_", 11, 0.08, ".png", 1 );
        //---------------------
         sprite.runAction( cc.sequence(animation, cc.removeSelf(true) ) );

    },

    runSingleObjectPlacedAnimation : function (row, column){
         //add sprite by using first frame.
         let obj = this.gridData[row][column];
         let sprite = this.addSprite(ACTIVITY_SUDOKU_1.animationBasePath + "RightEffect/right_effect_animation_0001.png",cc.p(obj.getPosition().x + this.gridSize * 0.5,obj.getPosition().y + this.gridSize * 0.3),this);
         sprite.setLocalZOrder(12);
         sprite.setScale(0.8);
         //runAnimation

         //-------------------- update frame path and number of frames
         let animation = HDUtility.runFrameAnimation( ACTIVITY_SUDOKU_1.animationBasePath + "RightEffect/right_effect_animation_", 18, 0.08, ".png", 1 );
         //---------------------
          sprite.runAction( cc.sequence(animation, cc.removeSelf(true) ) );
     },

    runAnimationForSixElement : function (row, column){
        //add sprite by using first frame.
        let middlePoint = this.gridData[row][column];
        let sprite = this.addSprite(ACTIVITY_SUDOKU_1.animationBasePath + "CompleteBlock/complete_block_0001.png",cc.p(middlePoint.getPosition().x + this.gridSize * 0.5, middlePoint.getPosition().y + this.gridSize),this);
        sprite.setLocalZOrder(12);
        sprite.setScale(0.6);
        //runAnimation

        //-------------------- update frame path and number of frames
        let animation = HDUtility.runFrameAnimation( ACTIVITY_SUDOKU_1.animationBasePath + "CompleteBlock/complete_block_", 15, 0.08, ".png", 1 );
        //---------------------
         sprite.runAction( cc.sequence(animation, cc.removeSelf(true) ) );
    },

    runWinAnimation : function (){
        let sprite = this.addSprite(ACTIVITY_SUDOKU_1.animationBasePath + "Win/win_game_animation_0001.png",cc.p(this.getContentSize().width * 0.49, this.getContentSize().height * 0.46),this);
        sprite.setLocalZOrder(12);
        //runAnimation

        //-------------------- update frame path and number of frames
        let animation = HDUtility.runFrameAnimation( ACTIVITY_SUDOKU_1.animationBasePath + "Win/win_game_animation_", 47, 0.08, ".png", 1 );
        //---------------------
        sprite.runAction( cc.sequence(animation, cc.removeSelf(true) ) );
    },

    touchEventListener: function (touch, event) {
        switch (event._eventCode) {
            case cc.EventTouch.EventCode.BEGAN:
                this.onMouseDown(touch);
                break;
            case cc.EventTouch.EventCode.MOVED:
                this.onMouseMove(touch);
                break;
            case cc.EventTouch.EventCode.ENDED:
                this.onMouseUp(touch.getLocation(), true);
                break;
        }
    },

    updateRoomData: function () {
        SocketManager.emitCutomEvent("SingleEvent", {
            'eventType': HDSocketEventType.UPDATE_ROOM_DATA,
            'roomId': HDAppManager.roomId,
            'data': {
                "roomId": HDAppManager.roomId,
                "roomData": {
                    "activity": ACTIVITY_SUDOKU_1.config.properties.namespace,
                    "data": {
                        'dataArray': this.gridSyncData
                    },
                    "activityStartTime": HDAppManager.getActivityStartTime()
                }
            }
        }, null);
    },

    updateStudentInteraction: function (username, status) {
        if (this.isTeacherView) {
            this.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {
                "eventType": ACTIVITY_SUDOKU_1.socketEventKey.STUDENT_INTERACTION,
                "data": {"userName": username, "status": status}
            });
        }
    },

    onUpdateStudentInteraction: function (params) {
        if (params.userName == HDAppManager.username) {
            ACTIVITY_SUDOKU_1.ref.isStudentInteractionEnable = params.status;
        }
    },

    mouseEventListener: function (event) {
        switch (event._eventType) {
            case cc.EventMouse.DOWN:
                this.onMouseDown(event);
                break;
            case cc.EventMouse.MOVE:
                this.onMouseMove(event);
                break;
            case cc.EventMouse.UP:
                this.onMouseUp(event.getLocation(), true);
                break;
        }
    },

    onMouseDown: function (event) {
        if (!ACTIVITY_SUDOKU_1.ref.isStudentInteractionEnable)
            return;
        this.checkIfButtonClicked(event.getLocation());
        for(let  i = 0 ; i < this.gridData.length; ++i) {
            for (let j = 0; j < this.gridData[i].length; ++j) {
                let obj = this.gridData[i][j];
                if (cc.rectContainsPoint(obj.getBoundingBox(), this.convertToNodeSpace(event.getLocation())) && obj.status == ACTIVITY_SUDOKU_1.TileStatus.Busy) {
                    this.toBeSwappedObjectGridData = {"row" : i, "column" : j};
                    this.isSwapEnable = true;
                    let params =  {
                        "url": obj.img.getTexture().url,
                        "position": obj.img.getPosition(),
                        "name": obj.img.name,
                        "toBeSwappedObjectGridData" : this.toBeSwappedObjectGridData,
                    };
                    this.emitSocketEvent( HDSocketEventType.GAME_MESSAGE, {"eventType": ACTIVITY_SUDOKU_1.socketEventKey.SELECT_SWAP_OBJ, "data":params } );
                    this.selectObject(({"url" : obj.img.getTexture().url, "position" : obj.img.getPosition(), "name" : obj.img.name}));
                    this.removeObjectFromOrigin(this.toBeSwappedObjectGridData);
                }
            }
        }
    },

    onMouseUp: function (location, manual) {
        if ( manual && !ACTIVITY_SUDOKU_1.ref.isStudentInteractionEnable)
            return;

        this.conflictLayerOne.setVisible(false);
        this.conflictLayerTwo.setVisible(false);
        let boardBoundingBox = cc.rect(this.gridData[0][0].x,this.gridData[0][0].y,this.gridSize*6,this.gridSize*6);
        if(this.curObj.isVisible()  && !cc.rectContainsPoint( boardBoundingBox, this.convertToNodeSpace(location))) {
            let params = {"isSwapEnable" : this.isSwapEnable, "toBeSwappedObjectGridData" : this.toBeSwappedObjectGridData};
            this.returnToOrigin(this.isSwapEnable, this.toBeSwappedObjectGridData);
            this.isSwapEnable = false;
            ACTIVITY_SUDOKU_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {"eventType" : ACTIVITY_SUDOKU_1.socketEventKey.RETURN_OBJ, "data" : params});
        }
        else if(this.isSwapEnable){
            for(let  i = 0 ; i < this.gridData.length; ++i) {
                for (let j = 0; j < this.gridData[i].length; ++j) {
                    if (cc.rectContainsPoint(this.gridData[i][j].getBoundingBox(), this.convertToNodeSpace(location))) {
                        this.swapObject(this.curObj, i, j);
                    }
                }
            }
        }
        else{
            let params = { "loc": ACTIVITY_SUDOKU_1.ref.convertToNodeSpace(location),"eType": cc.EventMouse.UP};
            ACTIVITY_SUDOKU_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {"eventType" : ACTIVITY_SUDOKU_1.socketEventKey.PLACE_OBJ, "data" : params } );
            this.placeGrid(this.curObj, params.loc ,params.eType, true);
        }
    },

    onMouseMove: function (event) {
        if (!ACTIVITY_SUDOKU_1.ref.isStudentInteractionEnable || this.isGameWin)
            return;

        for(let i = 0; i < 6; ++i){
            let sidebarButton = this.getChildByTag(i);
            if(cc.rectContainsPoint(sidebarButton.getBoundingBox(), this.convertToNodeSpace(event.getLocation()))){
                this.sidebarTextLable.setString(sidebarButton.getName());
                this.sidebarTextLable.setOpacity(255);
                this.sidebarTextLable.setPosition(cc.p(sidebarButton.getPosition().x + sidebarButton.getContentSize().width * 0.1,sidebarButton.getPosition().y))
                this.sidebarTextLable.setVisible(true);
                this.sidebarTextLable.runAction(cc.sequence(cc.fadeOut(2)));
            }
        }
        ACTIVITY_SUDOKU_1.ref.updateMouseIcon(event.getLocation());
        if(ACTIVITY_SUDOKU_1.ref.curObj.isVisible()) {
            let params = ACTIVITY_SUDOKU_1.ref.convertToNodeSpace(event.getLocation());
            ACTIVITY_SUDOKU_1.ref.emitSocketEvent(HDSocketEventType.GAME_MESSAGE, {"eventType" : ACTIVITY_SUDOKU_1.socketEventKey.DRAG_OBJ, "data" :params} );
            ACTIVITY_SUDOKU_1.ref.moveObject(params);
        }

    },

    socketListener: function (res) {
        if (!ACTIVITY_SUDOKU_1.ref)
            return;
        switch (res.eventType) {
            case HDSocketEventType.DISABLE_STUDENT_INTERACTION:
                break;
            case HDSocketEventType.DISABLE_INTERACTION:
                ACTIVITY_SUDOKU_1.ref.disableInteraction(res.data);
                break;
            case HDSocketEventType.RECEIVE_GRADES:
                break;
            case HDSocketEventType.STUDENT_STATUS:
                ACTIVITY_SUDOKU_1.ref.studentStatus(res.data);
                break;
            case HDSocketEventType.STUDENT_TURN:
                ACTIVITY_SUDOKU_1.ref.studentTurn(res.data);
                break;
            case HDSocketEventType.GAME_MESSAGE:
                if (res.data.userName == HDAppManager.username || !ACTIVITY_SUDOKU_1.ref)
                    return;
                ACTIVITY_SUDOKU_1.ref.gameEvents(res.data);
                break;
        }
    },

    disableInteraction: function (enable) {
        this.isStudentInteractionEnable = enable;
    },

    studentTurn: function (res) {
        let users = res.users;
        if (this.isTeacherView && !this.isScriptDisplayed) {
            //Check for this
            ACTIVITY_SUDOKU_1.ref.triggerScript(ACTIVITY_SUDOKU_1.config.teacherScripts.data.studentMouseEnable.content.ops );
            this.isScriptDisplayed = true;
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
        if(this.isTeacherView) {
            this.isStudentInteractionEnable = true;
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

    updateBoardData : function(boardData){
        this.boardData = boardData;
    },

    removeObjectFromOrigin : function(toBeSwappedObjectGridData){
        let obj = this.gridData[toBeSwappedObjectGridData.row][toBeSwappedObjectGridData.column];
        obj.img.name = "";
        obj.img.setVisible(false);
    },

    gameEvents: function (res) {
        if (!ACTIVITY_SUDOKU_1.ref)
            return;
        // console.log("res ", res);
        switch (res.eventType) {
            case ACTIVITY_SUDOKU_1.socketEventKey.SELECT_OBJ:
                if(res.data && res.data.params){
                    this.selectObject(res.data.params)
                }
                break;
            case ACTIVITY_SUDOKU_1.socketEventKey.DRAG_OBJ:
                this.moveObject(res.data);
                break;
            case ACTIVITY_SUDOKU_1.socketEventKey.PLACE_OBJ:
                this.placeGrid(this.curObj,  res.data.loc, res.data.eType, false);
                break;
            case ACTIVITY_SUDOKU_1.socketEventKey.DISTRIBUTE_OBJ:
                this.syncDataInfo = {'dataArray': res.data};
                this.updateGameWithSyncData();
                break;
            case ACTIVITY_SUDOKU_1.socketEventKey.RETURN_OBJ:
                this.returnToOrigin(res.data.isSwapEnable, res.data.toBeSwappedObjectGridData);
                break;
            case ACTIVITY_SUDOKU_1.socketEventKey.SELECT_SWAP_OBJ:
                this.removeObjectFromOrigin(res.data.toBeSwappedObjectGridData);
                this.selectObject(res.data)
                break;
            case ACTIVITY_SUDOKU_1.socketEventKey.PLACE_SWAP_OBJ:
                this.placeObject(this.gridData[res.data.row][res.data.column].img, res.data.originRow, res.data.originColumn, false);
                this.placeObject(this.curObj,res.data.row,res.data.column, false);
                this.playAnimation(res.data.row,res.data.column);
                this.playAnimation(res.data.originRow,res.data.originColumn);
                break;
            case ACTIVITY_SUDOKU_1.socketEventKey.UPDATE_BOARD_DATA:
                this.updateBoardData(res.data);
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
            "eventType": eventType,
            "data": data,
            "roomId": HDAppManager.roomId,
        }
        SocketManager.emitCutomEvent(HDSingleEventKey, dataObj);
    },

    syncData: function (data) {
        ACTIVITY_SUDOKU_1.ref.syncDataInfo = data;
    },


    buttonCallback: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                switch (sender.getTag()) {
                    case 0:
                        this.sidebarButtonClick(sender);
                        break;
                    case 1:
                        this.sidebarButtonClick(sender);
                        break;
                    case 2:
                        this.sidebarButtonClick(sender);
                        break;
                    case 3:
                        this.sidebarButtonClick(sender);
                        break;
                    case 4:
                        this.sidebarButtonClick(sender);
                        break;
                    case 5:
                        this.sidebarButtonClick(sender);
                        break;
                }
                break;
        }
    },

    mouseControlEnable: function (location) {
        return this.isStudentInteractionEnable;
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
                break;
            }
        }
        if (handICon) {
            this.interactableObject = true;
            this.customTexture = false;
        }
    },
});
