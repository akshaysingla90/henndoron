/**
 *  Copyright (c) 2018 ChicMic
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

/**
 * SoundManager: This will handle all the sound functionality of the game.
 * @type {{getInstance, playSound, playMusic, stopMusic, stopAllSound, isMusicRunning, preloadMusic}}
 */
var HDSoundManager = (function () {
    this.isSoundOn  =  false;
    return {
        playSound : function (soundName, isLoopRequired) {
            if(this.isSoundOn)
                cc.audioEngine.playEffect(soundName, isLoopRequired);
        },

        playMusic : function (musicName, isLoopRequired) {
            if(this.isSoundOn)
                cc.audioEngine.playMusic(musicName, isLoopRequired);
        },

        stopMusic : function() {
            cc.audioEngine.stopMusic(true);
        },

        stopAllSound : function() {
            cc.audioEngine.stopAllEffects();
        },

        isMusicRunning : function () {
            return cc.audioEngine.isMusicPlaying();
        },

        preloadMusic : function () {
            // cc.audioEngine.preload(res.GamePlayMusic_MP3);
            // cc.audioEngine.preload(res.HomeSceneLoopTrack_Mp3);
            // cc.audioEngine.preload(res.HomeSceneInitialMusic_Mp3);
        },

        updateSoundStatus : function(status) {
            // this.isSoundOn = status;
            // if (!status) {
            //     this.stopAllSound();
            //     this.stopMusic();
            // }else {
            //     if (AppState.MapScene == HDAppManager.appState)
            //         this.playMusic(hotelRes.GamePlayMusic_MP3, true);
            //     else
            //         this.playMusic(hotelRes.HomeSceneLoopTrack_Mp3, true);
            // }
        }
    };

})();