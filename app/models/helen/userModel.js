"use strict";
/************* Modules ***********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;
/**************************************************
 ************* User Model or collection ***********
 **************************************************/
const userSchema = new Schema({
    name: { type: { first: String, last: String } },
    email: { type: String },
    password: { type: String },
    country: { type: String },
    city: { type: String, },
    resetPasswordToken: { type: String },
    googlePlayServices: {
        id: { type: String }
    },
    gameCenter: {
        id: { type: String }
    },
    isDeleted: { type: Boolean, default: false },
    isRestored: {
        from: { type: Schema.Types.ObjectId, ref: 'user' },
        status: { type: Boolean, default: false }
    },
    socketId: { type: String },
    expPoints: { type: Number, default: 0 },
    currencyWallet: { type: Number },
    level: { type: Number },
    rankValue: { type: Number },
    rankType: { type: Schema.Types.ObjectId, ref: 'rankType' },
    stars: { type: Number, default: 0 },
    earnedStars: { type: Number, default: 0 },
    isLegend: { type: Boolean, default: false },
    legendRank: { type: Number },
    legendPoints: { type: Number },
    totalGamesPlayed: { type: Number, default: 0 },
    totalGameWon: { type: Number, default: 0 },
    winRatio: { type: Number, default: 0 },
    totalGamesLost: { type: Number, default: 0 },
    totalGamesLeaved: { type: Number, default: 0 },
    avtar: { type: String, default: '' },
    image: { type: String, default: '' },
    premiumSubscription: { startDate: { type: Date }, endDate: { type: Date } },
    chips: { type: Number, default: 0 },
    golds: { type: Number, default: 0 },
    totalNakedWin: { type: Number, default: 0 },
    totalFlawlessWin: { type: Number, default: 0 },
    profileLikes: { type: Number, default: 0 }
});

userSchema.set('timestamps', true);

module.exports = MONGOOSE.model('user', userSchema);



