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
        // console.log("text", text);
        this._super(text, fontName, fontSize);
        this.setColor(HDConstants.Black);
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
                this.setFontFillColor(fontDefContent.attributes.color);
            }

        }

        this.splitStringsAccordingly(text, maxLabelWidth);
    },
    setFontStyle : function (style) {
        this._setFontStyle(style)
    },

    setFontWeight : function (weight) {
        this._setFontWeight(weight);

    },
    setunderLine : function () {
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
            this._renderCmd._checkWarp(textArr, i, locDimensionsWidth);
        }
        var org = textArr.length  > 1 ? textArr[0] + '\n' : textArr[0];
        for(var index = 1; index < textArr.length ; index++){
            textArr[index] = textArr[index].trimStart();
            org +=  (index < textArr.length -1) ? textArr[index] + '\n' : textArr[index];
        }
        this.str = org;
        this.setString(org);
        this.strings = [...textArr];

    }





});