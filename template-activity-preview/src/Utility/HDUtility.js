var OK_TAG      =   10021;
var CANCEL_TAG  =   10022;
var RELOAD_TAG  = 10023;
var HDUtility =  {

    isMobileBrowser : function() {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    },

    /**
     * Read any static file
     * @param fileUrl
     * @param callback
     */
    readJSONFile : function(fileUrl, callback) {
        cc.loader.loadJson(fileUrl, function(error, data){
            callback(error,data);
        });
    },


    /**
     * will create alert box with option of single or Dual button
     * @param message
     * @param title
     * @param parent
     * @param isDualButton
     * @param cancelTexture
     * @param oktexture
     */
    // createAlertBox : function (message, title, parent,isDualButton, okTag = OK_TAG, okTexture = common.OKButton, okTitle = "", cancelTag = CANCEL_TAG, cancelTexture = common.CancelButton, cancelTitle = "") {
    //   try {
    //       var alertBox = new CMAlertBox(cc.color(169, 169, 169, 200), parent.getContentSize().width, parent.getContentSize().height);
    //       alertBox.addAlertBG(common.AlertBG);
    //       alertBox.createAlertBox(message, title, isDualButton, okTag, okTexture, okTitle, cancelTag, cancelTexture, cancelTitle);
    //       alertBox._delegate = parent;
    //       parent.addChild(alertBox, 1000);
    //   }catch (e) {
    //
    //   }
    // },

    /**
     * will remove all white spaces from given string/text
     * @param string
     */
    removeAllWhiteSpaces : function (string) {
        return string.replace(/\s/g,'');
    },



    /**
     * will clamp a number b/w a range.
     * @param num
     * @param min
     * @param max
     * @returns {*}
     */
    clampANumber : function (num, min, max) {
        return num <= min ? min : num >= max ? max : num;
    },

    getLocalDateStringFromString : function (date) {
        var date          =     new Date(date);
        return date.toLocaleDateString();
    },




    getBoolean : function (fromNumber) {
        return Boolean(Number(fromNumber));
    },

    sortArrayAscending : function (array, withKey) {
        array.sort(function(a, b) {
            return withKey ?   a[withKey] - b[withKey] : a - b;
        });
        return array;
    },

    sortArrayDescending : function (array, withKey) {
        array.sort(function(a, b) {
            return withKey ?   b[withKey] - a[withKey] : b - a;
        });
        return array;
    },

    convertNumberIntoString : function(price) {
        var result      =   price;
        var postFix     =   "";

        if (Math.abs(Number(price)) >= 1.0e+9) {
            result = Math.abs(Number(price)) / 1.0e+9;
            postFix = "B";
        }else if (Math.abs(Number(price)) >= 1.0e+6) {
            result = Math.abs(Number(price)) / 1.0e+6;
            postFix = "M";
        }else if (Math.abs(Number(price)) >= 1.0e+3) {
            result = Math.abs(Number(price)) / 1.0e+3;
            postFix = "K";
        }

        if (!Number.isInteger(result)) {
            result = result.toFixed(2);
        }
        return (result + postFix);
    },

    removeArrayElement : function (arr, value, key) {

        for(var i= 0 ; i < arr.length; ++i){
            if(key){
                if(arr[i][key] == value){
                    arr.splice(i, 1);
                }
            }else{
                if(arr[i] == value){
                    arr.splice(i, 1);
                }
            }

        }
    },

    // addSpriteSheets : function(plistName, pngName){
    //     cc.spriteFrameCache.addSpriteFrames(plistName, pngName);
    // },

    convertSecondsIntoTimeFormat: function(ms){
        var days = this.convertNumberIntoTwoDigit(Math.floor(ms / (24 * 60 * 60)));
        var daysms= ms % (24 * 60 * 60);
        var hours = this.convertNumberIntoTwoDigit(Math.floor((daysms)/(60 * 60)));
        var hoursms= ms % (60 * 60);
        var minutes = this.convertNumberIntoTwoDigit(Math.floor((hoursms)/(60)));
        var minutesms=ms % (60);
        var sec = this.convertNumberIntoTwoDigit(Math.floor(minutesms));
        return days+" : "+hours+" : "+minutes+" : "+sec;
    },

    convertNumberIntoTwoDigit : function(number, targetLength = 2) {
        var output = number + '';
        while (output.length < targetLength) {
            output = '0' + output;
        }
        return output;
    },

    getSubstringOfLength :function(string, length, withDot=false) {
        var substring =  string.substring(0, length);
        if(withDot){
            substring += "...";
        }
        return substring;
    },

    convertSecondsIntoMinFormat: function(ms){
        var minutes     =   this.convertNumberIntoTwoDigit(Math.floor((ms / 1000) / 60));
        var seconds     =   this.convertNumberIntoTwoDigit(Math.floor((ms / 1000) % 60));
        return minutes+" : "+seconds;
    },

    runFrameAnimation : function (imageName, maxFrames, timeFrame, extension, loop) {
        let counter;
        var animation = new cc.Animation();
        animation._delayPerUnit = timeFrame;
        animation._loops = loop;
        for(let i = 1; i <= maxFrames; ++i) {
            counter = (i < 10 ? "000" + i : "00"+i);
            animation.addSpriteFrameWithFile(imageName + counter + extension);
        }
        animation.setRestoreOriginalFrame(true);
        var animate     =   new cc.Animate(animation);
        return animate;
    },

    addSpriteFrames: function(initial, length, name, extension){
        var counter = "";
        for(let i = 1; i <= length; ++i) {
            counter = (i < 10 ? "000" + i : "00"+i);
            cc.spriteFrameCache.addSpriteFrame(initial + counter + extension, name + counter + extension);
        }
    },

}
