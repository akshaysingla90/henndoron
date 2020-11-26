/****************************************************************************
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

/**
 * A brief explanation for "project.json":
 * Here is the content of project.json file, this is the global configuration for your game, you can modify it to customize some behavior.
 * The detail of each field is under it.
 {
    "project_type": "javascript",
    // "project_type" indicate the program language of your project, you can ignore this field

    "debugMode"     : 1,
    // "debugMode" possible values :
    //      0 - No message will be printed.
    //      1 - cc.error, cc.assert, cc.warn, cc.log will print in console.
    //      2 - cc.error, cc.assert, cc.warn will print in console.
    //      3 - cc.error, cc.assert will print in console.
    //      4 - cc.error, cc.assert, cc.warn, cc.log will print on canvas, available only on web.
    //      5 - cc.error, cc.assert, cc.warn will print on canvas, available only on web.
    //      6 - cc.error, cc.assert will print on canvas, available only on web.

    "showFPS"       : true,
    // Left bottom corner fps information will show when "showFPS" equals true, otherwise it will be hide.

    "frameRate"     : 60,
    // "frameRate" set the wanted frame rate for your game, but the real fps depends on your game implementation and the running environment.

    "noCache"       : false,
    // "noCache" set whether your resources will be loaded with a timestamp suffix in the url.
    // In this way, your resources will be force updated even if the browser holds a cache of it.
    // It's very useful for mobile browser debugging.

    "id"            : "gameCanvas",
    // "gameCanvas" sets the id of your canvas element on the web page, it's useful only on web.

    "renderMode"    : 0,
    // "renderMode" sets the renderer type, only useful on web :
    //      0 - Automatically chosen by engine
    //      1 - Forced to use canvas renderer
    //      2 - Forced to use WebGL renderer, but this will be ignored on mobile browsers

    "engineDir"     : "frameworks/cocos2d-html5/",
    // In debug mode, if you use the whole engine to develop your game, you should specify its relative path with "engineDir",
    // but if you are using a single engine file, you can ignore it.

    "modules"       : ["cocos2d"],
    // "modules" defines which modules you will need in your game, it's useful only on web,
    // using this can greatly reduce your game's resource size, and the cocos console tool can package your game with only the modules you set.
    // For details about modules definitions, you can refer to "../../frameworks/cocos2d-html5/modulesConfig.json".

    "jsList"        : [
    ]
    // "jsList" sets the list of js files in your game.
 }
 *
 */

cc.game.onStart = function () {
  var sys = cc.sys;
  if (!sys.isNative && document.getElementById("cocosLoading"))
    //If referenced loading.js, please remove it
    document.body.removeChild(document.getElementById("cocosLoading"));
  // Disable auto full screen on baidu and wechat, you might also want to eliminate sys.BROWSER_TYPE_MOBILE_QQ
  if (sys.isMobile && sys.browserType !== sys.BROWSER_TYPE_BAIDU && sys.browserType !== sys.BROWSER_TYPE_WECHAT) {
    cc.view.enableAutoFullScreen(true);
  }
  cc._loaderImage = HDConstants.HD_Logo;
  cc.view.enableRetina(true);
  // Adjust viewport meta
  cc.view.adjustViewPort(true);
  // Uncomment the following line to set a fixed orientation for your game
  cc.view.setOrientation(cc.ORIENTATION_AUTO);
  // Setup the resolution policy and design resolution size
  cc.view.setDesignResolutionSize(960, 640, cc.ResolutionPolicy.SHOW_ALL);
  // The game will be resized when browser size change
  cc.view.resizeWithBrowserSize(true);
  HDAppManager.appRunMode = AppMode.Development;
  cc.loader.resPath = cc.loader.resPath + "AsyncActivity/";
  window.addEventListener(
    "orientationchange",
    () => {
      // window.location.reload();
    },
    false
  );
  //
  cc.loader.loadJson("res/lesson-config.json", function (error, data) {
    HDAppManager.config = data;
    let activityInfo = data.activityGame[0];
    let url = activityInfo.url;
    let actRes = activityInfo.resources;
    var spritesPath = null;
    var images = null;
    var soundPath = null;
    var sounds = null;
    var animationPath = null;
    var framesInfo = null;
    let soundArr = [];
    let spritesArr = [];
    let animationFramesArr = [];
    if (actRes) {
      if (actRes.sprites) {
        spritesPath = actRes.sprites.basePath;
        images = actRes.sprites ? actRes.sprites.images : null;
        for (let img of images) {
          spritesArr.push(url + spritesPath + img);
        }
      }
      if (actRes.sounds) {
        soundPath = actRes.sounds ? actRes.sounds.basePath : null;
        sounds = actRes.sounds ? actRes.sounds.audio : null;
        for (let sound of sounds) {
          soundArr.push(url + soundPath + sound);
        }
      }
      if (actRes.animationFrames) {
        animationPath = actRes.animationFrames.basePath;
        framesInfo = actRes.animationFrames.animation;
        for (let obj of framesInfo) {
          for (let i = 1; i <= obj.frameCount; ++i) {
            let frameName = obj.frameInitial + ("0000" + i).slice(-4) + obj.extension;
            animationFramesArr.push(url + animationPath + frameName);
          }
        }
      }
    }
    var resArr = [...resources, ...spritesArr, ...animationFramesArr, ...soundArr];
    //load resources
    HDAppManager.isTeacherView = JSON.parse(cc.sys.localStorage.getItem("isTeacherView"));
    cc.LoaderScene.preload(
      resArr,
      function (data) {
        cc.director.runScene(new lesson_1.HDLessonScene());
      },
      this
    );
  });
};
cc.game.run();
function switchVisible() {
  window.dispatchEvent(new CustomEvent("iFrameRemoved"));
  if (document.getElementsByClassName("call_back")) {
    if (document.getElementsByClassName("call_back")[0].style.display != "none") {
      document.getElementsByClassName("video_wrapper")[0].style.display = "none";
      document.getElementsByClassName("video_wrapper")[0].remove();
      document.getElementsByClassName("call_back")[0].style.visibility = "hidden";
    }
  }
}
