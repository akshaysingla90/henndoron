var AppState = {
    None: 500,
};
var AppMode = {
    Development: 600,
    Production: 601,
    Staging: 602,
};

var AppStateKey = "kAppStateKey";

var HDAppManager = new function () {
    this.appRunMode = AppMode.Development;
    this.appState = AppState.None;
    this.config = {};
    this.isTeacherView = false;
    this.roomId = -1;
    this.username = null;
    this.activityStartTime = 0,
        this.resourceCounter = 1;
    this.loadedResIndex = [0];
    this.tempResPath = "";
    this.nextActivityIdx = -1;

    this.setAppState = function (state) {
        cc.sys.localStorage.setItem(AppStateKey, state);
        this.appState = state;
    };

    this.getAppState = function () {
        this.appState = cc.sys.localStorage.getItem(AppStateKey);
        return this.appState;
    };

    this.getAppStateOnPageLoad = function () {

    };

    this.getResourcesToLoadSync = function () {
        // var resourceArray = [...map_resources, ...common_resources];
        // return resourceArray;
    };

    this.getResourcesToLoadAsync = function () {
        // var resourceArray = [...g_resources, ...landSpriteSheet_resources, ...hotel_resources, ...avatar_resources, ...chat_Component_resources, ...trade_resources, ...leader_Board_resources, ...AntiqueStore_resources, ...MarketPlaceData_Resources, ...CollectibleCard_resources, ...InfoCentre_resources, ...HeavyMachinery_resources, ...SupplyStore_resources, ...RealEstate_resources];
        // return resourceArray;
    };

    this.getAPIBaserURL = function () {
        switch (this.appRunMode) {
            case AppMode.Development:
                return HDNetworkConfig.APIDevBaseUrl;
                break;
            case AppMode.Production:
                return HDNetworkConfig.APIProBaseUrl;
                break;
            case AppMode.Staging:
                return HDNetworkConfig.APIStagingUrl;
                break;
        }
    };

    this.getSocketURL = function () {
        let socketURL = HDNetworkConfig.SocketProURL;
        if (AppMode.Development == HDAppManager.appRunMode) {
            socketURL = HDNetworkConfig.SocketDevURL;
        } else if (AppMode.Staging == HDAppManager.appRunMode) {
            socketURL = HDNetworkConfig.SocketStagingURL;
        }
        return socketURL;
    };

    this.getPeerURL = function () {
        let url = HDNetworkConfig.PeerProURL;
        if (AppMode.Development == HDAppManager.appRunMode) {
            url = HDNetworkConfig.PeerDevURL;
        } else if (AppMode.Staging == HDAppManager.appRunMode) {
            url = HDNetworkConfig.PeerStagingURL;
        }
        return url;
    };
    this.startResLoading = function () {
        if (this.config && this.config.activityGame.length > 1) {
            this.resourceCounter = 1;
            this.tempResPath = cc.loader.resPath;
            // cc.loader.resPath =  cc.loader.resPath + "AsyncActivity/";
            cc.loader.load(asyncRes,
                function (result, count, loadedCount) {
                    var percent = ((loadedCount + 1) / count * 100) | 0;
                    percent = Math.min(percent, 100);
                    if (percent == 100) {
                        HDAppManager.loadImageAsync(HDAppManager.resourceCounter);
                    }
                }, function () {
                });
        }
    };
    this.updateResLoading = function () {
        if (this.nextActivityIdx != -1) {
            HDAppManager.resourceCounter = this.nextActivityIdx;
            this.nextActivityIdx = -1;
        } else {
            ++HDAppManager.resourceCounter;
        }
        if (!this.loadedResIndex.includes(this.resourceCounter) && this.resourceCounter < this.config.activityGame.length && this.loadedResIndex.length != this.config.activityGame.length) {
            this.loadImageAsync(this.resourceCounter);
        } else {
            if (this.loadedResIndex.length == this.config.activityGame.length) {
                cc.loader.resPath = this.tempResPath
            } else {
                let counter = 1;
                while (this.loadedResIndex.indexOf(++counter) != -1);
                this.resourceCounter = counter;
                this.loadImageAsync(this.resourceCounter);
            }
        }
    };
    this.setActivityStartTime = function (time) {
        this.activityStartTime = time;
    };

    this.getActivityStartTime = function () {

        return this.activityStartTime;
    };
    this.setEventAddedForBackground = function (status) {
        localStorage.setItem(HDConstants.IsBackgroundEventAdded, status.toString());
    };

    this.isEventAddedForBackground = function () {
        var status = localStorage.getItem(HDConstants.IsBackgroundEventAdded);
        var info = status ? JSON.parse(status) : status;
        return status ? JSON.parse(status) : status;
    };


    this.loadImageAsync = function (activityIndex, callback) {
        let activityInfo = this.config.activityGame[activityIndex];
        let url = activityInfo.url;
        let resources = activityInfo.resources;
        var spritesPath = null;
        var images = null;
        var soundPath = null;
        var sounds = null;
        var animationPath = null;
        var framesInfo = null;
        let soundArr = [];
        let spritesArr = [];
        let animationFramesArr = [];
        if (resources) {
            if (resources.sprites) {
                spritesPath = resources.sprites.basePath;
                images = resources.sprites ? resources.sprites.images : null;
                for (let img of images) {
                    spritesArr.push(url + spritesPath + img);
                }
            }
            if (resources.sounds) {
                soundPath = resources.sounds ? resources.sounds.basePath : null;
                sounds = resources.sounds ? resources.sounds.audio : null;
                for (let sound of sounds) {
                    soundArr.push(url + soundPath + sound)
                }
            }
            if (resources.animationFrames) {
                animationPath = resources.animationFrames.basePath;
                framesInfo = resources.animationFrames.animation;
                for (let obj of framesInfo) {
                    for (let i = 1; i <= obj.frameCount; ++i) {
                        let frameName = obj.frameInitial + ('0000' + i).slice(-4) + obj.extension;
                        animationFramesArr.push(url + animationPath + frameName);
                    }
                }
            }
        }
        var resArr = [...spritesArr, ...animationFramesArr, ...soundArr];

        if (resArr.length > 0) {
            cc.loader.load(resArr,
                function (result, count, loadedCount) {
                    var percent = ((loadedCount + 1) / count * 100) | 0;
                    percent = Math.min(percent, 100);
                    if (percent == 100) {
                        if (callback) {
                            callback(HDAppManager.resourceCounter);
                        }
                        cc.eventManager.dispatchCustomEvent("loadedActivity", HDAppManager.resourceCounter);
                        HDAppManager.loadedResIndex.push(HDAppManager.resourceCounter);
                        HDAppManager.updateResLoading();
                    }
                }, function () {
                });
        } else {
            if (callback) {
                callback(HDAppManager.resourceCounter);
            }
            cc.eventManager.dispatchCustomEvent("loadedActivity", HDAppManager.resourceCounter);
            HDAppManager.loadedResIndex.push(HDAppManager.resourceCounter);
            HDAppManager.updateResLoading();
        }
    }
};
