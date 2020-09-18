const authToken = cc.sys.localStorage.getItem(HDConstants.UserLoggedInJWTKey);
var HDNetworkHandler = {
    /**
     *
     * @param route : string http url
     * @param jsonParams : JS object data i.e {id:1} etc
     * @param auth : boolean true/false
     * @param callback : : callback function
     */
    get : function (route, jsonParams, auth, callback) {
        axios({
            method: 'get',
            url: HDAppManager.getAPIBaserURL() + route,
            params : jsonParams,
            headers: {
                authorization       :        auth? HDAppManager.username:"",
            }
        }).then(function (response) {
            if (response.data.statusCode === 200) {
                if (callback) {
                    callback(null, response);
                }
            }
        }).catch((error) => {
            if (callback) {
                callback(error.response.data.msg, null);
            }
        });
    },
    /**
     *
     * @param route : string http url
     * @param bodyData : JS object data i.e {id:1} etc
     * @param auth : boolean true/false
     * @param callback : callback function
     */

     put : function (route, bodyData, auth, callback) {
         axios({
             method                  :       'put',
             url                     :     HDAppManager.getAPIBaserURL() + route,
             data: bodyData,
             headers : {
                 authorization       :        auth? HDAppManager.username:"",
             }
         }).then(function (response) {
             if(callback)
             callback(null, response);
         }).catch(function (error) {
             if(callback)
             callback(error.response.data.msg, null);
         });
     },

    /**
     *
     * @param route : string http url
     * @param bodyData : JS object data i.e {id:1} etc
     * @param auth : boolean true/false
     * @param callback : callback function
     */
    post : function (route, bodyData, auth, callback) {
        axios({
            method                  :       'post',
            url                     :        HDAppManager.getAPIBaserURL() + route,
            data                    :        bodyData,
            headers :   {
                authorization       :        auth? HDAppManager.username:"",
            }
        }).then(function (response) {
            console.log("response", response);
            if(JSON.stringify(response.data.statusCode) == 200) {

                if(callback)
                    callback(null, response);
            }
        }).catch(function (error) {
            if(callback)
            callback(error, null);
        });
    },

    /**
     *
     * @param route : string http url
     * @param bodyData : JS object data i.e {id:1} etc
     * @param auth : boolean true/false
     * @param callback : callback function
     */

    delete : function (route, bodyData, auth, callback) {
        axios({
            method                  :       'put',
            url                     :        HDAppManager.getAPIBaserURL() + route,
            data: bodyData,
            headers : {
                authorization       :        auth? HDAppManager.username:"",
            }
        }).then(function (response) {
            if(callback)
                callback(null, response);
        }).catch(function (error) {
            if(callback)
                callback(error.response.data.msg, null);
        });
    },

};
