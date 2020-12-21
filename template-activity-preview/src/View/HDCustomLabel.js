
// wordRex = /(?:((?>.{1,16}(?:(?<=[^\S\r\n])[^\S\r\n]?|(?=\r?\n)|$|[^\S\r\n]))|.{1,16})(?:\r?\n)?|(?:\r?\n|$))/



var _lastWordRex = /[a-zA-Z0-9ÄÖÜäöüßéèçàùêâîôû,]+$/;
var _lastEnglish = /[a-zA-Z0-9ÄÖÜäöüßéèçàùêâîôû,']+$/;
var _firstEnglish = /^[a-zA-Z0-9ÄÖÜäöüßéèçàùêâîôû,]/;

var HDCustomLabel= cc.LabelTTF.extend({
    _enableUnderline : false,
    isNewLine        :   false,
    _enabledBold      : false,
    _enableItalic     : false,
    lastStringHeight    : 0,
    paddingWidth        :0,
    hasEmptySpace     : false,
    strings            :  [],
    dimensions          : null,
    ctor : function (text, fontName, fontSize, dimensions,fontDefContent,  paddingWidth, maxLabelWidth) {
        if(text && text.includes('\n')){
            var index = text.indexOf('\n');
            text = text.substr(0, index);
            this.isNewLine = true;
        }
        this.dimensions = dimensions;
        this.paddingWidth = paddingWidth;
        text = this.addPadding(text, fontName, fontSize, paddingWidth);
        this._super(text, fontName, fontSize);
        this.setFontFillColor(HDConstants.Black);
        if(fontDefContent){
            if(fontDefContent.italic){
                this._enableItalic = true;
                this.setFontStyle("italic");
            }
            if(fontDefContent.bold){
                this._enabledBold = true;
                this.setFontName(HDConstants.Sassoon_Medium);
                // this._setFontWeight("bold");
            }
            if(fontDefContent.underline){
                this._enableUnderline = true;

            }
            if(fontDefContent.color){
                console.log("color is present", fontDefContent.color);
                console.log(this.convertHexToRGB(fontDefContent.color))
                this.setFontFillColor(this.convertHexToRGB(fontDefContent.color));
            }

        }
        this.splitStringsAccordingly(text, maxLabelWidth);
        // this.createColourLayer(paddingWidth);
        console.log("width", this.width, text);
    },
    setFontStyle : function (style) {
        this._setFontStyle(style)
    },
    setFontWeight : function (weight) {
        this._setFontWeight(weight);

    },
    createColourLayer : function(paddingWidth){
        var r = Math.random() * 255;
        var g = Math.random() * 255;
        var b = Math.random() * 255;
        var colourLayer = new cc.LayerColor(cc.color(r,g,b,100), paddingWidth, this.height);
        colourLayer.setPosition(0, 0);


        if(paddingWidth){
            this.addChild(colourLayer, -1);
        }

    },
    setunderLine : function () {
        console.log("underline");
        var pxRatio = cc.view.getDevicePixelRatio()
        var posX = this.getPositionX();
        var posY = this.getPosition().y;
        var actualHeight = this.height * pxRatio;
        var length = this.strings.length -1;
        for(var i =0; i < this.strings.length ; i++){
                var label = new cc.LabelTTF(this.strings[i].substr(0, this.strings[i].length -1), this.getFontName(), this.getFontSize());
                var width = label.width * pxRatio;
                actualHeight -=  label.height * pxRatio;
                var marginY = this.getFontSize() * 0.4;
                var line = new cc.DrawNode();
                line.drawSegment(cc.p(0, actualHeight + marginY), cc.p(width,actualHeight + marginY),.5, HDConstants.Black);
                length--;
                this.addChild(line);
        }

    },
    getNumberOfSpaces : function (paddingWidth, font, fontSize) {
        if(paddingWidth ==0) return 0;
        else {
            var dummyLabel = new cc.LabelTTF(" ", font, fontSize);
            return paddingWidth / dummyLabel.width;
        }
    },
    addPadding : function (text, font, fontSize, paddingWidth) {
        var number = this.getNumberOfSpaces(paddingWidth, font, fontSize);
        var str ="";
        while(str.length < Math.ceil(number)){
            str+= " ";
        }
        text = str + text;
        return text;
    },
    splitStringsAccordingly : function (text, maxWidth) {
        var pixelRatio = cc.view.getDevicePixelRatio();
        var locDimensionsWidth = this.dimensions.width * pixelRatio, i;
        var textArr = [text];
        for (i = 0; i < textArr.length; i++) {
            this.checkWarp(textArr, i, locDimensionsWidth);
        }
        var org = textArr.length  > 1 ? textArr[0] + '\n' : textArr[0];
        for(var index = 1; index < textArr.length ; index++){
            textArr[index] = textArr[index].trimStart();
            org +=  (index < textArr.length -1) ? textArr[index] + '\n' : textArr[index];
        }
        this.str = org;
        this.setString(org);
        this.strings = [...textArr];

    },
    convertHexToRGB : function (color) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            } : null;
    },
    checkWarp(strArr, i, maxWidth){
        var text = strArr[i];
        var allWidth = this._renderCmd._measure(text);
        if (allWidth > maxWidth && text.length > 1) {
            var fuzzyLen = text.length * ( maxWidth / allWidth ) | 0;
            var tmpText = text.substr(fuzzyLen);
            var width = allWidth - this._renderCmd._measure(tmpText);
            var sLine;
            var pushNum = 0;
            //Increased while cycle maximum ceiling. default 100 time
            var checkWhile = 0;
            while (width > maxWidth && checkWhile++ < 100) {
                fuzzyLen *= maxWidth / width;
                fuzzyLen = fuzzyLen | 0;
                tmpText = text.substr(fuzzyLen);
                width = allWidth - this._renderCmd._measure(tmpText);
            }

            checkWhile = 0;
            //Find the truncation point
            while (width < maxWidth && checkWhile++ < 100) {
                if (tmpText) {
                    var exec = cc.LabelTTF._wordRex.exec(tmpText);
                    pushNum = exec ? exec[0].length : 1;
                    sLine = tmpText;
                }
                fuzzyLen = fuzzyLen + pushNum;
                tmpText = text.substr(fuzzyLen);
                width = allWidth - this._renderCmd._measure(tmpText);
            }
            fuzzyLen -= pushNum;
            if (fuzzyLen === 0) {
                fuzzyLen = 1;
                sLine = sLine.substr(1);
            }

            var sText = text.substr(0, fuzzyLen), result;
            //symbol in the first
            if (cc.LabelTTF.wrapInspection) {
                if (cc.LabelTTF._symbolRex.test(sLine || tmpText)) {
                    result = _lastWordRex.exec(sText);
                    console.log("result", result, sText, "sline: ", sLine, fuzzyLen);
                    fuzzyLen -= result ? result[0].length : 0;
                    if (fuzzyLen === 0) fuzzyLen = 1;
                    sLine = text.substr(fuzzyLen);
                    sText = text.substr(0, fuzzyLen);

                    console.log("substring", sText, "sline", sLine, fuzzyLen);

                }
            }

            if (_firstEnglish.test(sLine)) {
                result =_lastEnglish.exec(sText);
                if (result && sText !== result[0]) {
                    fuzzyLen -= result[0].length;
                    sLine = text.substr(fuzzyLen);
                    sText = text.substr(0, fuzzyLen);
                }
            }
            strArr[i] = sLine || tmpText;
            strArr.splice(i, 0, sText);
        }
    }





});