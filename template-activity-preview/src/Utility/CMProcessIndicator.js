var LoadingIndicatorTag = 9000;
var CMProcessIndicator = new function(){

    this.addLoadingIndicator = function(parent){
            // var colourLayer = new cc.LayerColor(cc.color(255,255,255,100), cc.winSize.width, cc.winSize.height);
            // colourLayer.setPosition(cc.p(0.0,0.0));
            // colourLayer.setTag(LoadingIndicatorTag);
            // parent.addChild(colourLayer,100);
            // //==== Preventive Touch button
            // var button  = new ccui.Button();
            // button.loadTextures(res.DemoBG, res.DemoBG);
            // button.setPosition(cc.p(colourLayer.getContentSize().width*0.5,colourLayer.getContentSize().height*0.5));
            // button.setOpacity(0.0);
            // colourLayer.addChild(button);
            //
            // var indicator = new cc.Sprite(common.LoadingSp);
            // indicator.setPosition(cc.p(colourLayer.getContentSize().width * 0.5,colourLayer.getContentSize().height * 0.5));
            // colourLayer.addChild(indicator,200);
            // indicator.runAction(new cc.RepeatForever(new cc.RotateBy(1,360)));


    };
    this.removeLoadingIndicator = function(parent){
        // if (parent.getChildByTag(LoadingIndicatorTag)){
        //     parent.removeChildByTag(LoadingIndicatorTag);
        // }
    };

}