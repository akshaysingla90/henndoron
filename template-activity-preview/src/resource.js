var resources = [];
let counter = "";
//--Lesson Resources
var lessonResourceBasePath = "res/LessonResources/";
var magicHatAnimationFrames = "res/LessonResources/AnimationFrames/"
var lessonResources = [
    lessonResourceBasePath + "lesson_1_xo.png",
    lessonResourceBasePath + "lesson_1_mousecontrol.png",
    lessonResourceBasePath + "lesson_1_blackDot.png",
    lessonResourceBasePath + "lesson_1_logo.png",
    lessonResourceBasePath + "lesson_1_starBgTeacher.png",
    lessonResourceBasePath + "lesson_1_starBgStudent.png",
    lessonResourceBasePath + "lesson_1_activityDone.png",
    lessonResourceBasePath + "lesson_1_activityInProgress.png",
    lessonResourceBasePath + "lesson_1_activityPending.png",
    lessonResourceBasePath + "lesson_1_activity_box_top.png",
    lessonResourceBasePath + "lesson_1_btn_idle.png",
    lessonResourceBasePath + "lesson_1_btn_selected.png",
    lessonResourceBasePath + "lesson_1_reset_active_icon.png",
    lessonResourceBasePath + "lesson_1_script_active_icon.png",
    lessonResourceBasePath + "lesson_1_tip_active_icon.png",
    lessonResourceBasePath + "lesson_1_cursor_active_icon.png",
    lessonResourceBasePath + "lesson_1_cursor_inactive_icon.png",
    lessonResourceBasePath + "lesson_1_studentNameBG.png",
    lessonResourceBasePath + "lesson_1_bubble_speech_buttom.png",
    lessonResourceBasePath + "lesson_1_bubble_speech_buttom_small.png",
    lessonResourceBasePath + "lesson_1_bubble_speech_buttom_left.png",
    lessonResourceBasePath + "lesson_1_bubble_speech_buttom_left_small.png",
    lessonResourceBasePath + "lesson_1_bubble_speech_buttom_right.png",
    lessonResourceBasePath + "lesson_1_bubble_speech_buttom_right_small.png",
    lessonResourceBasePath + "doneEnable.png",
    lessonResourceBasePath + "doneDisable.png",
    lessonResourceBasePath + "editBoxbackground.png",
    lessonResourceBasePath + "editBoxbackgroundWhite.png",
    lessonResourceBasePath + "emptyImage.png",
    lessonResourceBasePath + "backyardtop.png",
    lessonResourceBasePath + "btn_student_enable.png",
    lessonResourceBasePath + "btn_student_disable.png",
    lessonResourceBasePath + "lesson_1_student_icon_bg_clicked.png",
    lessonResourceBasePath + "lesson_1_student_icon_bg_defoult.png",
    lessonResourceBasePath + "lesson_1_student_icon_clicked.png",
    lessonResourceBasePath + "lesson_1_student_icon_defoult.png",
    lessonResourceBasePath + "lesson_1_student_panel_bg_horizontal.png",
    lessonResourceBasePath + "lesson_1_timer_1_minute.png",
    lessonResourceBasePath + "lesson_1_timer_over.png",
    lessonResourceBasePath + "lesson_1_reward_star.png",
    lessonResourceBasePath + "lesson_1_btn_star_reward.png",
    lessonResourceBasePath + "lesson_1_icon_star_reward.png",
    lessonResourceBasePath + "lesson_1_icon_student_star_blue.png",
    lessonResourceBasePath + "lesson_1_icon_student_star_green.png",
    lessonResourceBasePath + "lesson_1_icon_student_star_orange.png",
    lessonResourceBasePath + "lesson_1_icon_student_star_pink.png",
    lessonResourceBasePath + "lesson_1_icon_student_star_purple.png",
    lessonResourceBasePath + "lesson_1_icon_student_star_red.png",
    lessonResourceBasePath + "lesson_1_icon_student_star_teal.png",
    lessonResourceBasePath + "lesson_1_icon_student_star_yellow.png",
    lessonResourceBasePath + "lesson_1_slice_bottom_dropdown.png",
    lessonResourceBasePath + "lesson_1_slice_dropdown.png",
    lessonResourceBasePath + "lesson_1_tip_bubble_bottom.png",
    lessonResourceBasePath + "lesson_1_tip_bubble_middle.png",
    lessonResourceBasePath + "lesson_1_tip_bubble_top.png",
    lessonResourceBasePath + "lesson_1_script_bubble_bottom.png",
    lessonResourceBasePath + "lesson_1_script_bubble_middle.png",
    lessonResourceBasePath + "lesson_1_script_bubble_top.png",
    lessonResourceBasePath + "lesson_1_script_idle_icon.png",
    lessonResourceBasePath + "lesson_1_tip_idle_icon.png",
    lessonResourceBasePath + "lesson_1_cursor_idle_icon.png",
    lessonResourceBasePath + "lesson_1_reset_idle_icon.png",
    lessonResourceBasePath + "starDummy.png",
    lessonResourceBasePath + "lesson_1_play.png",
    lessonResourceBasePath + "lesson_1_student_panel_bg.png",
    lessonResourceBasePath + "lesson_1_time_pie_chart.png",
    lessonResourceBasePath + "lesson_1_time_pie_chart_25.png",
    lessonResourceBasePath + "lesson_1_time_pie_chart_50.png",
    lessonResourceBasePath + "lesson_1_time_pie_chart_75.png",
    lessonResourceBasePath + "lesson_1_time_pie_chart_90.png"

]

for (let i = 1; i <= 22; ++i) {
    counter = (i < 10 ? "000" + i : "00" + i);
    lessonResources.push(magicHatAnimationFrames + "reward_star_appear/reward_star_appear_" + counter + ".png");
}

for (let i = 1; i <= 14; ++i) {
    counter = (i < 10 ? "000" + i : "00" + i);
    lessonResources.push(magicHatAnimationFrames + "reward_star_track/reward_star_track_" + counter + ".png");
}


for (var j in lessonResources) {
    resources.push(lessonResources[j]);
}
//Font file
var fontBasePath = "res/Fonts/"
var fontFile = [
    fontBasePath + "Sassoon_Sans_US_W01_Regular.ttf",
    fontBasePath + "Sassoon_Sans_US_W01_Medium.ttf",
    fontBasePath + "LondrinaSolid-Regular.ttf",
]
for (var ff in fontFile) {
    resources.push(fontFile[ff]);
}

//--------Magic Hat
// var magicHatSpriteBasePath = "res/Activity/ACTIVITY_MAGICHAT_1/res/Sprite/";
// var magicHatAnimationFrames = "res/Activity/ACTIVITY_MAGICHAT_1/res/AnimationFrames/";
// var magicHatSoundPath = "res/Activity/ACTIVITY_MAGICHAT_1/res/Sound/";
// var magicHatRes = [
//     magicHatSpriteBasePath + "background.png",
//     magicHatSpriteBasePath + "ant.png",
//     magicHatSpriteBasePath + "bat.png",
//     magicHatSpriteBasePath + "bee.png",
//     magicHatSpriteBasePath + "cat.png",
//     magicHatSpriteBasePath + "crow.png",
//     magicHatSpriteBasePath + "dog.png",
//     magicHatSpriteBasePath + "frog.png",
//     magicHatSpriteBasePath + "wordHolder.png",
//     magicHatSpriteBasePath + "carouselImage.png",
//     magicHatSpriteBasePath + "carouselBorderImage.png",
//     magicHatSpriteBasePath + "HatFront.png",
//     magicHatSpriteBasePath + "HatBack.png",
//     magicHatSpriteBasePath + "BagFront.png",
//     magicHatSpriteBasePath + "BagBack.png",
//     magicHatSpriteBasePath + "ApronFront.png",
//     magicHatSpriteBasePath + "ApronBack.png",
//     magicHatSpriteBasePath + "cellGlow.png",
//     magicHatSpriteBasePath + "Book.png",
//     magicHatSpriteBasePath + "flupeSad.png",
//     magicHatSpriteBasePath + "house.png",
//     magicHatSpriteBasePath + "paulHappy.png",
//     magicHatSpriteBasePath + "rat.png",
//     magicHatSpriteBasePath + "sheep.png",
//     magicHatSpriteBasePath + "sing.png",
//     magicHatSpriteBasePath + "tub.png",
//     magicHatSpriteBasePath + "tree.png",
//
//     magicHatSoundPath + "cardTakeOut.mp3",
// ]
// for(let i = 1; i <= 15; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     magicHatRes.push(magicHatAnimationFrames + "cardTakeOut/magicHat_cardTakeOut_" + counter + ".png");
// }
// for(var k in magicHatRes){
//     resources.push(magicHatRes[k]);
// }
//-----------FlashCard
// var flashcardSpriteBasePath  = "res/Activity/ACTIVITY_FLASHCARDS/res/Sprite/";
// var flashcardSoundBasePath = "res/Activity/ACTIVITY_FLASHCARDS/res/Sound/";
// var flashcardSpriteRes = [
//     flashcardSpriteBasePath + "flashcards_background.png",
//     flashcardSpriteBasePath + "flashcards_dog.png",
//     flashcardSpriteBasePath + "flashcards_wordHolder.png",
//     flashcardSpriteBasePath + "flashcards_boy.png",
//     flashcardSpriteBasePath + "flashcards_cat.png",
//     flashcardSpriteBasePath + "flashcards_girl.png",
//     flashcardSpriteBasePath + "flashcards_hen.png",
//     flashcardSpriteBasePath + "flashcards_mouse.png",
//     flashcardSpriteBasePath + "flashcards_bookPage.png",
//     flashcardSpriteBasePath + "flashcards_panelBackground.png",
//     flashcardSpriteBasePath + "flashcards_panelForeground.png",
//     flashcardSpriteBasePath + "flashcards_billboardBackground.png",
//     flashcardSpriteBasePath + "flashcards_billboard.png",
//     flashcardSoundBasePath  + "flashcards_pageFlip.mp3",
//     flashcardSoundBasePath  + "flashcards_swipe.mp3"
//
// ]
// for(var l in flashcardSpriteRes){
//     resources.push(flashcardSpriteRes[l]);
// }
//-------------Piano Player
// var  pianoPlayerSpriteBasePath = "res/Activity/ACTIVITY_PIANO_PLAYER/res/Sprite/";
// var pianoPlayerSoundBasePath = "res/Activity/ACTIVITY_PIANO_PLAYER/res/Sound/";
// var pianoPlayerRes = [
//     pianoPlayerSpriteBasePath + 'student_answer.png',
//     pianoPlayerSpriteBasePath + 'Item_book.png',
//     pianoPlayerSpriteBasePath + 'Item_boy.png',
//     pianoPlayerSpriteBasePath + 'Item_hat.png',
//     pianoPlayerSpriteBasePath + 'Item_girl.png',
//     pianoPlayerSpriteBasePath + 'Item_rabbit.png',
//     pianoPlayerSpriteBasePath + 'Item_tree.png',
//     pianoPlayerSpriteBasePath + 'Item_donkey.png',
//     pianoPlayerSpriteBasePath + 'next_idle.png',
//     pianoPlayerSpriteBasePath + 'next_pressed.png',
//     pianoPlayerSpriteBasePath + 'start_idle.png',
//     pianoPlayerSpriteBasePath + 'start_pressed.png',
//     pianoPlayerSpriteBasePath + 'flashcards_boy.png',
//     pianoPlayerSpriteBasePath + 'flashcards_cat.png',
//     pianoPlayerSpriteBasePath + 'flashcards_dog.png',
//     pianoPlayerSpriteBasePath + 'flashcards_girl.png',
//     pianoPlayerSpriteBasePath + 'flashcards_hen.png',
//     pianoPlayerSpriteBasePath + 'flashcards_mouse.png',
//     pianoPlayerSpriteBasePath + 'A_idle.png',
//     pianoPlayerSpriteBasePath + 'A_pressed.png',
//     pianoPlayerSpriteBasePath + 'B_idle.png',
//     pianoPlayerSpriteBasePath + 'B_pressed.png',
//     pianoPlayerSpriteBasePath + 'bg.png',
//     pianoPlayerSpriteBasePath + 'C_idle.png',
//     pianoPlayerSpriteBasePath + 'C_pressed.png',
//     pianoPlayerSpriteBasePath + 'D_idle.png',
//     pianoPlayerSpriteBasePath + 'D_pressed.png',
//     pianoPlayerSpriteBasePath + 'E_idle.png',
//     pianoPlayerSpriteBasePath + 'E_pressed.png',
//     pianoPlayerSpriteBasePath + 'F_idle.png',
//     pianoPlayerSpriteBasePath + 'F_pressed.png',
//     pianoPlayerSpriteBasePath + 'G_idle.png',
//     pianoPlayerSpriteBasePath + 'G_pressed.png',
//     pianoPlayerSpriteBasePath + 'key_pressed_correct.png',
//     pianoPlayerSpriteBasePath + 'key_pressed_incorrect.png',
//     pianoPlayerSpriteBasePath + 'play_idle.png',
//     pianoPlayerSpriteBasePath + 'play_pressed.png',
//     pianoPlayerSoundBasePath + 'a-5.mp3',
//     pianoPlayerSoundBasePath + 'b-5.mp3',
//     pianoPlayerSoundBasePath + 'c-5.mp3',
//     pianoPlayerSoundBasePath + 'd-5.mp3',
//     pianoPlayerSoundBasePath + 'e-5.mp3',
//     pianoPlayerSoundBasePath + 'f-5.mp3',
//     pianoPlayerSoundBasePath + 'g-5.mp3',
// ]
// for(var m in pianoPlayerRes){
//     resources.push(pianoPlayerRes[m]);
// }
//------------Spinning wheel
// var spiningWheelSpriteBasePath = "res/Activity/ACTIVITY_SPINNINGWHEEL_1/res/Sprite/";
// var spiningWheelSoundBasePath = "res/Activity/ACTIVITY_SPINNINGWHEEL_1/res/Sound/";
// var spiningwheelAnimationFrames = "res/Activity/ACTIVITY_SPINNINGWHEEL_1/res/AnimationFrames/";
// var spiningWheelRes = [
//     spiningWheelSpriteBasePath + "bg.png",
//     spiningWheelSpriteBasePath + "carouselBorderImage.png",
//     spiningWheelSpriteBasePath + "carouselImage.png",
//     spiningWheelSpriteBasePath + "ant.png",
//     spiningWheelSpriteBasePath + "bat.png",
//     spiningWheelSpriteBasePath + "bee.png",
//     spiningWheelSpriteBasePath + "crow.png",
//     spiningWheelSpriteBasePath + "go_button_disabled.png",
//     spiningWheelSpriteBasePath + "go_button_idle.png",
//     spiningWheelSpriteBasePath + "go_button_pushed.png",
//     spiningWheelSpriteBasePath + "stop_button_disabled.png",
//     spiningWheelSpriteBasePath + "stop_button_idle.png",
//     spiningWheelSpriteBasePath + "stop_button_pushed.png",
//     spiningWheelSpriteBasePath + "targetBg.png",
//     spiningWheelSpriteBasePath + "wheel_4.png",
//     spiningWheelSpriteBasePath + "wheel_5.png",
//     spiningWheelSpriteBasePath + "wheel_6.png",
//     spiningWheelSpriteBasePath + "wheel_arrow.png",
//     spiningWheelSpriteBasePath + "wheel_center.png",
//
//     spiningWheelSoundBasePath + "tap.mp3"
// ]
// for(let i = 1; i <= 15; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     spiningWheelRes.push(spiningwheelAnimationFrames + "Win/object_pulled_out_animation_" + counter + ".png");
//     spiningWheelRes.push(spiningwheelAnimationFrames + "Loss/object_pulled_out_animation_" + counter + ".png");
// }
//
// for(var n in spiningWheelRes){
//     resources.push(spiningWheelRes[n]);
// }



//---------------Counting
// var countingSpriteBasePath = "res/Activity/ACTIVITY_COUNTING_1/res/Sprite/";
// var countingSoundBasePath = "res/Activity/ACTIVITY_COUNTING_1/res/Sound/";
// var countingRes = [
//     countingSpriteBasePath + "playground.png",
//     countingSpriteBasePath + "backpack_hidden.png",
//     countingSpriteBasePath + "backpack_revealed.png",
//     countingSpriteBasePath + "bin_hidden.png",
//     countingSpriteBasePath + "bin_revealed.png",
//     countingSpriteBasePath + "book_hidden.png",
//     countingSpriteBasePath + "book_revealed.png",
//     countingSpriteBasePath + "bowl_hidden.png",
//     countingSpriteBasePath + "bowl_revealed.png",
//     countingSpriteBasePath + "box01_hidden.png",
//     countingSpriteBasePath + "box01_revealed.png",
//     countingSpriteBasePath + "box02_hidden.png",
//     countingSpriteBasePath + "box02_revealed.png",
//     countingSpriteBasePath + "hat01_hidden.png",
//     countingSpriteBasePath + "hat01_revealed.png",
//     countingSpriteBasePath + "hat02_hidden.png",
//     countingSpriteBasePath + "hat02_revealed.png",
//     countingSpriteBasePath + "hole_hidden.png",
//     countingSpriteBasePath + "hole_revealed.png",
//     countingSpriteBasePath + "trunk_hidden.png",
//     countingSpriteBasePath + "trunk_revealed.png",
//     countingSpriteBasePath + "btn_disable.png",
//     countingSpriteBasePath + "btn_enable.png",
//
//     countingSoundBasePath + "tap.mp3",
// ];
// for(var o in countingRes){
//     resources.push(countingRes[o]);
// }
// //---------------------Save A situation
// var saveASituationSpriteBasePath = "res/Activity/ACTIVITY_SAVE_A_SITUATION/res/Sprite/";
// var saveASituationAnimationFrames = "res/Activity/ACTIVITY_SAVE_A_SITUATION/res/AnimationFrames/";
// var saveASituationRes = [
//     saveASituationSpriteBasePath + "bg01.png",
//     saveASituationSpriteBasePath + "bg02.png",
//     saveASituationSpriteBasePath + "bg02_win.png",
//     saveASituationSpriteBasePath + "bg03.png",
//     saveASituationSpriteBasePath + "bg04.png",
//     saveASituationSpriteBasePath + "bg05.png",
//     saveASituationSpriteBasePath + "cat_regular.png",
//     saveASituationSpriteBasePath + "dog_regular.png",
//     saveASituationSpriteBasePath + "rat_regular.png",
//     saveASituationSpriteBasePath + "sheep_regular.png",
//     saveASituationSpriteBasePath + "tub02.png",
//     saveASituationSpriteBasePath + "tub01.png",
//     saveASituationSpriteBasePath + "water.png",
//     saveASituationSpriteBasePath + "cat_loose.png",
//     saveASituationSpriteBasePath + "dog_loose.png",
//     saveASituationSpriteBasePath + "rat_loose.png",
//     saveASituationSpriteBasePath + "sheep_loose.png",
//     saveASituationSpriteBasePath + "cat_win.png",
//     saveASituationSpriteBasePath + "dog_win.png",
//     saveASituationSpriteBasePath + "rat_win.png",
//     saveASituationSpriteBasePath + "sheep_win.png",
//     saveASituationSpriteBasePath + "carouselBorderImage.png",
//     saveASituationSpriteBasePath + "cellBGlow.png",
//     saveASituationSpriteBasePath + "cellBg.png",
//     saveASituationSpriteBasePath + "closed_pincer_fingers_pointer.png",
//     saveASituationSpriteBasePath + "open_pincer_fingers_pointer.png",
//     saveASituationSpriteBasePath + "item_house.png",
//     saveASituationSpriteBasePath + "item_tree.png",
//     saveASituationSpriteBasePath + "item_hat.png",
//     saveASituationSpriteBasePath + "item_book.png",
//     saveASituationSpriteBasePath + "item_stickers.png",
//     saveASituationSpriteBasePath + "next_botton_idle.png",
//     saveASituationSpriteBasePath + "next_botton_pushed.png",
//     saveASituationSpriteBasePath + "pop_up_bg.png",
//     saveASituationSpriteBasePath + "replay_botton_idle.png",
//     saveASituationSpriteBasePath + "replay_botton_pushed.png",
//
// ];
//
// for(let i = 1; i <= 12; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     saveASituationRes.push(saveASituationAnimationFrames + "tub_watercircle_12fps_png_seq/tub_watecircle_loop_" + counter + ".png");
// }
//
// for(let i = 1; i <= 5; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     saveASituationRes.push(saveASituationAnimationFrames+ "tubWaterline/tubWaterLine" + counter + ".png");
//     saveASituationRes.push(saveASituationAnimationFrames+ "animalWaterline/animals_waterline_loop_" + counter + ".png");
// }
// for(let i = 1; i <= 24; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     saveASituationRes.push(saveASituationAnimationFrames + "tub_waterFill/tub_fillwaterline_loop_" + counter + ".png");
// }
//
// for(let i = 1; i <= 15; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     saveASituationRes.push(saveASituationAnimationFrames + "cardTakeOut/magicHat_cardTakeOut_" + counter + ".png");
// }
//
//
//
// for(var p in saveASituationRes){
//     resources.push(saveASituationRes[p]);
// }
//--------------Flashlight
// var  flashlightSpriteBasePath = "res/Activity/ACTIVITY_FLASHLIGHT_1/res/Sprite/";
// var flashlightSoundBasePath = "res/Activity/ACTIVITY_FLASHLIGHT_1/res/Sound/";
// var flashlightRes = [
//     flashlightSpriteBasePath + "circle.png",
//     flashlightSpriteBasePath + "redCircle.png",
//     flashlightSpriteBasePath + "bg.png",
//     flashlightSpriteBasePath + "tick.png",
//     flashlightSpriteBasePath + "cross.png",
//     flashlightSpriteBasePath + "blackImage.png",
//
//     flashlightSoundBasePath + "object_pulled_out_animation_sound.mp3",
// ];
// var flashlightAnimationBaePath = "res/Activity/ACTIVITY_FLASHLIGHT_1/res/AnimationFrames/";
// for(let i = 1; i <= 32; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     flashlightRes.push(flashlightAnimationBaePath + "Granny_Fix_celebrating/celebrating_" + counter + ".png");
// }
// for(let i = 1; i <= 16; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     flashlightRes.push(flashlightAnimationBaePath +"Granny_Fix_idle/idle_" + counter + ".png");
// }
// for(let i = 1; i <= 11; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     flashlightRes.push(flashlightAnimationBaePath +"Granny_Fix_run_left/run_left_" + counter + ".png");
//     flashlightRes.push(flashlightAnimationBaePath +"Granny_Fix_run_right/run_right_" + counter + ".png");
// }
// for(var q in flashlightRes){
//     resources.push(flashlightRes[q]);
// }


//------------------cwc
// var cwcSpriteBasePath = "res/Activity/ACTIVITY_CWC_1/res/Sprite/";
// var cwcAnimationFrameBasePath = "res/Activity/ACTIVITY_CWC_1/res/AnimationFrames/";
// var cwcRes = [
//     cwcSpriteBasePath + "Characters_popup.png",
//     cwcSpriteBasePath +  "nat.png",
//     cwcSpriteBasePath + "polly.png",
//     cwcSpriteBasePath + "playground.png",
//     cwcSpriteBasePath + "Characters_popup_top.png",
//     cwcSpriteBasePath + "Characters_popup_middle.png",
//     cwcSpriteBasePath + "Characters_popup_down.png",
//     cwcSpriteBasePath + "Poul.png",
//     cwcSpriteBasePath + "Flupe.png",
//     cwcSpriteBasePath + "Grnanny_fix.png",
// ]
// for(let ei = 1; ei <= 29; ++ei) {
//     counter = (ei < 10 ? "000" + ei : "00"+ei);
//     cwcRes.push(cwcAnimationFrameBasePath + "Flupe/Excited/Flupe_excited_" + counter + ".png");
// }
// for(let di = 1; di <= 23; ++di) {
//     counter = (di < 10 ? "000" + di : "00"+di);
//     cwcRes.push(cwcAnimationFrameBasePath + "Flupe/Hi/Flupe_hi_" + counter + ".png");
// }
// for(let ci = 1; ci <= 26; ++ci) {
//     counter = (ci < 10 ? "000" + ci : "00"+ci);
//     cwcRes.push(cwcAnimationFrameBasePath + "Flupe/RestPose01/Flupe_restpose01_" + counter + ".png");
// }
// for(let bi = 1; bi <= 20; ++bi) {
//     counter = (bi < 10 ? "000" + bi : "00"+bi);
//     cwcRes.push(cwcAnimationFrameBasePath + "Flupe/RestPose02/Flupe_restpose02_" + counter + ".png");
// }
// for(let ai = 1; ai <= 23; ++ai) {
//     counter = (ai < 10 ? "000" + ai : "00"+ai);
//     cwcRes.push(cwcAnimationFrameBasePath + "Flupe/RestPose03/Flupe_restpose03_" + counter + ".png");
// }
// for(let i = 1; i <= 23; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     cwcRes.push(cwcAnimationFrameBasePath + "Poul/Excited/Poul_excited_" + counter + ".png");
// }
// for(let i = 1; i <= 24; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     cwcRes.push(cwcAnimationFrameBasePath + "Poul/Hi/Poul_hi_" + counter + ".png");
// }
// for(let i = 1; i <= 25; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     cwcRes.push(cwcAnimationFrameBasePath + "Poul/RestPose01/Poul_restpose01_" + counter + ".png");
// }
// for(let i = 1; i <= 21; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     cwcRes.push(cwcAnimationFrameBasePath + "Poul/RestPose02/Poul_restpose02_" + counter + ".png");
// }
// for(let i = 1; i <= 25; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     cwcRes.push(cwcAnimationFrameBasePath + "Poul/RestPose03/Poul_restpose03_" + counter + ".png");
// }
//
// for(let i = 1; i <= 24; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     cwcRes.push(cwcAnimationFrameBasePath + "Grnanny_fix/Excited/Grnanny_fix_excited_" + counter + ".png");
// }
// for(let i = 1; i <= 27; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     cwcRes.push(cwcAnimationFrameBasePath + "Grnanny_fix/Hi/Grnanny_fix_hi_" + counter + ".png");
// }
// for(let i = 1; i <= 32; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     cwcRes.push(cwcAnimationFrameBasePath + "Grnanny_fix/RestPose01/Grnanny_fix_restpose01_" + counter + ".png");
// }
// for(let i = 1; i <= 31; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     cwcRes.push(cwcAnimationFrameBasePath + "Grnanny_fix/RestPose02/Grnanny_fix_restpose02_" + counter + ".png");
// }
// for(let i = 1; i <= 31; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     cwcRes.push(cwcAnimationFrameBasePath + "Grnanny_fix/RestPose03/Grnanny_fix_restpose03_" + counter + ".png");
// }
// for(var rs in cwcRes){
//     resources.push(cwcRes[rs]);
// }

//--------------------- Sudoku
// let SudokuSpriteBasePath = "res/Activity/ACTIVITY_SUDOKU_1/res/Sprite/";
// let SudokuRes = [
//     SudokuSpriteBasePath + "cursor_eraser.png",
// ]
// for (var i of SudokuRes) {
//     resources.push(i);
// }


//
// //--------------------- SOT
// let SOTSpriteBasePath = "res/Activity/ACTIVITY_SANDS_OF_TIME_1/res/Sprite/";
// let SOTAnimationBasePath = "res/Activity/ACTIVITY_SANDS_OF_TIME_1/res/AnimationFrames/"
// let SOTRes = [
//     SOTSpriteBasePath + "game_bg.png",
//     SOTSpriteBasePath + "Item_cat.png",
//     SOTSpriteBasePath + "Item_dog.png",
//     SOTSpriteBasePath + "Item_donkey.png",
//     SOTSpriteBasePath + "Item_duck.png",
//     SOTSpriteBasePath + "Item_hare.png",
//     SOTSpriteBasePath + "Item_horse.png",
//     SOTSpriteBasePath + "Item_rabbit.png",
//     SOTSpriteBasePath + "Item_rooster.png",
//     SOTSpriteBasePath + "Item_sheep.png",
//     SOTSpriteBasePath + "Item_tortoise.png",
//     SOTSpriteBasePath +  "leaf_0001.png",
//     SOTSpriteBasePath + "leaf_0002.png",
//     SOTSpriteBasePath + "leaf_0003.png",
//     SOTSpriteBasePath + "leaf_0004.png",
//     SOTSpriteBasePath + "score_window.png",
//     SOTSpriteBasePath + "student1_bag_back.png",
//     SOTSpriteBasePath + "student1_bag_front.png",
//     SOTSpriteBasePath + "student2_bag_back.png",
//     SOTSpriteBasePath + "student2_bag_front.png",
//     SOTSpriteBasePath + "student3_bag_back.png",
//     SOTSpriteBasePath + "student3_bag_front.png",
//     SOTSpriteBasePath + "student4_bag_back.png",
//     SOTSpriteBasePath + "student4_bag_front.png",
//     SOTSpriteBasePath + "student5_bag_back.png",
//     SOTSpriteBasePath + "student5_bag_front.png",
//     SOTSpriteBasePath + "student6_bag_back.png",
//     SOTSpriteBasePath + "student6_bag_front.png",
//     SOTSpriteBasePath + "student7_bag_back.png",
//     SOTSpriteBasePath +  "student7_bag_front.png",
//     SOTSpriteBasePath + "student8_bag_back.png",
//     SOTSpriteBasePath + "student8_bag_front.png"
//     // SOTSpriteBasePath + "bg.png",
//     // SOTSpriteBasePath + "cursor_watercan_idle.png",
//     // SOTSpriteBasePath + "ant.png",
//     // SOTSpriteBasePath + "bat.png",
//     // SOTSpriteBasePath + "bee.png",
//     // SOTSpriteBasePath + "crow.png",
//     // SOTSpriteBasePath + "bat.png",
// ]
//
// for(let i = 1; i <= 6; ++i) {
//     // SOTRes.push(SOTSpriteBasePath + "pot0" + i + "_back.png");
//     // SOTRes.push(SOTSpriteBasePath + "pot0" + i + "_front.png");
// }
// for(let i = 1; i <= 9; ++i) {
//     SOTRes.push(SOTAnimationBasePath + "student1_rake/student1_rake_" + ('0000' + i).slice(-4) + ".png");
//     // SOTRes.push(SOTAnimationBasePath + "watering_effect_animation/watering_" + ('0000' + i).slice(-4) + ".png");
// }
// for (var i of SOTRes) {
//     resources.push(i);
// }
//



//--------------------- Chug
// let GftgSpriteBasePath = "res/Activity/ACTIVITY_GFTG_1/res/Sprite/";
// let GftgAnimationBasePath = "res/Activity/ACTIVITY_GFTG_1/res/AnimationFrames/"
// let ChugRes = [
//     GftgSpriteBasePath + "bg.png",
//     GftgSpriteBasePath + "cursor_watercan_idle.png",
//     GftgSpriteBasePath + "ant.png",
//     GftgSpriteBasePath + "bat.png",
//     GftgSpriteBasePath + "bee.png",
//     GftgSpriteBasePath + "crow.png",
//     GftgSpriteBasePath + "bat.png",
// ]
//
// for(let i = 1; i <= 6; ++i) {
//     ChugRes.push(GftgSpriteBasePath + "pot0" + i + "_back.png");
//     ChugRes.push(GftgSpriteBasePath + "pot0" + i + "_front.png");
// }
// for(let i = 1; i <= 3; ++i) {
//     ChugRes.push(GftgAnimationBasePath + "cursor_watercan_animation/cursor_watercan_" + ('0000' + i).slice(-4) + ".png");
//     ChugRes.push(GftgAnimationBasePath + "watering_effect_animation/watering_" + ('0000' + i).slice(-4) + ".png");
// }
// for (var i of ChugRes) {
//     resources.push(i);
// }
//




//--------------------- BAP
// let BAPSpriteBasePath = "res/Activity/ACTIVITY_BAP_1/res/Sprite/";
// let BAPRes = [
//     BAPSpriteBasePath + "eraser.png",
//     BAPSpriteBasePath + "background_1.png",
//     BAPSpriteBasePath + "cursor_eraser.png",
//     BAPSpriteBasePath + "cursor_pencil.png",
//     BAPSpriteBasePath + "palette_sidebar.png",
//     BAPSpriteBasePath + "colour_black.png",
//     BAPSpriteBasePath + "colour_blue.png",
//     BAPSpriteBasePath + "colour_green.png",
//     BAPSpriteBasePath + "colour_orange.png",
//     BAPSpriteBasePath + "colour_pink.png",
//     BAPSpriteBasePath + "colour_red.png",
//     BAPSpriteBasePath + "colour_white.png",
//     BAPSpriteBasePath + "colour_yellow.png",
//     BAPSpriteBasePath + "btn_disable.png",
//     BAPSpriteBasePath + "btn_enable.png",
//
// ]
// for (var i in BAPRes) {
//     resources.push(BAPRes[i]);
// }

//--------------------------Dont wake dragon
// let dontWakeDragonSpriteBasePath = "res/Activity/ACTIVITY_DONT_WAKE_THE_DRAGON/res/Sprite/";
// let dontWakeDragonAnimationFramesPath = 'res/Activity/ACTIVITY_DONT_WAKE_THE_DRAGON/res/AnimationFrames/';
// let dontWakeDragonRes = [
//     dontWakeDragonSpriteBasePath + "background.png",
//     dontWakeDragonSpriteBasePath + "closed_pincer_fingers_pointer.png",
//     dontWakeDragonSpriteBasePath + "Item_book.png",
//     dontWakeDragonSpriteBasePath + "Item_hat.png",
//     dontWakeDragonSpriteBasePath + "Item_house.png",
//     dontWakeDragonSpriteBasePath + "Item_tree.png",
//     dontWakeDragonSpriteBasePath + "Item_stickers.png",
//     dontWakeDragonSpriteBasePath + "open_pincer_fingers_pointer.png",
//     dontWakeDragonSpriteBasePath + "player_treasure_chest.png",
//     dontWakeDragonSpriteBasePath + "treasurePile.png",
//     dontWakeDragonSpriteBasePath + "student_answer.png"
// ]
// for(let i = 1; i <= 15; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     dontWakeDragonRes.push(dontWakeDragonAnimationFramesPath + "cardTakeOut/magicHat_cardTakeOut_" + counter + ".png");
// }
// for(let i = 1; i <= 48; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     dontWakeDragonRes.push(dontWakeDragonAnimationFramesPath + "dragon_awake/dragon_awake_" + counter + ".png");
// }
// for(let i = 1; i <= 35; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     dontWakeDragonRes.push(dontWakeDragonAnimationFramesPath + "dragon_sleep01/dragon_sleep01_" + counter + ".png");
// }
// for(let i = 1; i <= 24; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     dontWakeDragonRes.push(dontWakeDragonAnimationFramesPath + "dragon_sleep02/dragon_sleep02_" + counter + ".png");
// }
// for(let i = 1; i <= 24; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     dontWakeDragonRes.push(dontWakeDragonAnimationFramesPath + "dragon_sleep03/dragon_sleep03_" + counter + ".png");
// }
// for(let i = 1; i <= 38; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     dontWakeDragonRes.push(dontWakeDragonAnimationFramesPath + "dragon_back_to_sleep/dragon_back_to_sleep_" + counter + ".png");
// }
// for (let i in dontWakeDragonRes) {
//     resources.push(dontWakeDragonRes[i]);
// }
// // Build something
// let BuildSomethingSpriteBasePath = "res/Activity/ACTIVITY_BUILD_SOMETHING_1/res/Sprite/";
// let BuildSomethingRes = [
//     BuildSomethingSpriteBasePath + "background.png",
//     BuildSomethingSpriteBasePath + "circle.png",
//     BuildSomethingSpriteBasePath + "stop_idle.png",
//     BuildSomethingSpriteBasePath + "stop_pressed.png",
//     BuildSomethingSpriteBasePath + "start_idle.png",
//     BuildSomethingSpriteBasePath + "start_pressed.png",
//     BuildSomethingSpriteBasePath + "reset_idle.png",
//     BuildSomethingSpriteBasePath + "reset_pressed.png",
//     BuildSomethingSpriteBasePath + "carouselBorderImage.png",
//     BuildSomethingSpriteBasePath + "carouselImage.png",
//     BuildSomethingSpriteBasePath + "dwarf_head.png",
//     BuildSomethingSpriteBasePath + "dwarf_lefthand.png",
//     BuildSomethingSpriteBasePath + "dwarf_leftleg.png",
//     BuildSomethingSpriteBasePath + "dwarf_righthand.png",
//     BuildSomethingSpriteBasePath + "dwarf_rightleg.png",
//     BuildSomethingSpriteBasePath + "dwarf_torso.png",
//     BuildSomethingSpriteBasePath + "king_leftleg.png",
//     BuildSomethingSpriteBasePath + "king_lefthand.png",
//     BuildSomethingSpriteBasePath + "king_rightleg.png",
//     BuildSomethingSpriteBasePath + "king_head.png",
//     BuildSomethingSpriteBasePath + "king_torso.png",
//     BuildSomethingSpriteBasePath + "knight_head.png",
//     BuildSomethingSpriteBasePath + "knight_leftleg.png",
//     BuildSomethingSpriteBasePath + "knight_lefthand.png",
//     BuildSomethingSpriteBasePath + "knight_righthand.png",
//     BuildSomethingSpriteBasePath + "knight_rightleg.png",
//     BuildSomethingSpriteBasePath + "knight_torso.png",
//     BuildSomethingSpriteBasePath + "reward_screen_frame.png",
//     BuildSomethingSpriteBasePath + "close.png",
//     BuildSomethingSpriteBasePath + "left_arrow_idle.png",
//     BuildSomethingSpriteBasePath + "left_arrow_pushed.png",
//     BuildSomethingSpriteBasePath + "right_arrow_idle.png",
//     BuildSomethingSpriteBasePath + "right_arrow_pushed.png",
//     BuildSomethingSpriteBasePath + "winScreen.png",
//     BuildSomethingSpriteBasePath + "looseScreen.png",
// ]
//
// let BuildSomethingAnimationBasePath = "res/Activity/ACTIVITY_BUILD_SOMETHING_1/res/AnimationFrames/";
// for(let i = 1; i <= 16; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     BuildSomethingRes.push(BuildSomethingAnimationBasePath + "dwarf_animation/dwarf_animation_" + counter + ".png");
// }
// for(let i = 1; i <= 16; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     BuildSomethingRes.push(BuildSomethingAnimationBasePath + "king_animation/king_animation_" + counter + ".png");
// }
//
// for(let i = 1; i <= 16; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     BuildSomethingRes.push(BuildSomethingAnimationBasePath + "knight_animation/knight_animation_" + counter + ".png");
// }
//
// for (var i in BuildSomethingRes) {
//     resources.push(BuildSomethingRes[i]);
// }


// let BuildSomethingSpriteBasePath = "res/Activity/ACTIVITY_CHUG_1/res/Sprite/";
// let BuildSomethingRes = [
//     BuildSomethingSpriteBasePath + "bg.png",
//     BuildSomethingSpriteBasePath + "botle_mask.png",
//     BuildSomethingSpriteBasePath + "chug_btn_idle.png",
//     BuildSomethingSpriteBasePath + "chug_btn_pressed.png",
//     BuildSomethingSpriteBasePath + "Item_bg.png",
//     BuildSomethingSpriteBasePath + "coffee_mug_mask.png",
//     BuildSomethingSpriteBasePath + "Item_big_ball.png",
//     BuildSomethingSpriteBasePath + "Item_big_boy.png",
//     BuildSomethingSpriteBasePath + "Item_big_braclet.png",
//     BuildSomethingSpriteBasePath + "Item_big_girl.png",
//     BuildSomethingSpriteBasePath + "Item_little_ball.png",
//     BuildSomethingSpriteBasePath + "Item_little_boy.png",
//     BuildSomethingSpriteBasePath + "Item_little_braclet.png",
//     BuildSomethingSpriteBasePath + "Item_little_girl.png",
//     BuildSomethingSpriteBasePath + "jar_mask.png",
//     BuildSomethingSpriteBasePath + "milkshake_glass_mask.png",
//     BuildSomethingSpriteBasePath + "plastic_cup_mask.png",
//     BuildSomethingSpriteBasePath + "preview.png",
//     BuildSomethingSpriteBasePath + "regular_glass_mask.png",
//     BuildSomethingSpriteBasePath + "tea_cup_mask.png",
//     BuildSomethingSpriteBasePath + "umbrella_glass_mask.png",
// ]
//
// for (var i in BuildSomethingRes) {
//     resources.push(BuildSomethingRes[i]);
// }
//
// let BuildSomethingAnimationBasePath = "res/Activity/ACTIVITY_CHUG_1/res/AnimationFrames/";
// for(let i = 1; i <= 11; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     BuildSomethingRes.push(BuildSomethingAnimationBasePath + "bottle_animation/bottle_" + counter + ".png");
// }
// for(let i = 1; i <= 11; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     BuildSomethingRes.push(BuildSomethingAnimationBasePath + "coffee_mug_animation/coffee_mug_" + counter + ".png");
// }
// for(let i = 1; i <= 11; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     BuildSomethingRes.push(BuildSomethingAnimationBasePath + "jar_animation/jar_" + counter + ".png");
// }
// for(let i = 1; i <= 11; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     BuildSomethingRes.push(BuildSomethingAnimationBasePath + "milkshake_glass_animation/milkshake_glass_" + counter + ".png");
// }
// for(let i = 1; i <= 11; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     BuildSomethingRes.push(BuildSomethingAnimationBasePath + "plastic_cup_animation/plastic_cup_" + counter + ".png");
// }
// for(let i = 1; i <= 11; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     BuildSomethingRes.push(BuildSomethingAnimationBasePath + "regular_glass_animation/regular_glass_" + counter + ".png");
// }
// for(let i = 1; i <= 11; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     BuildSomethingRes.push(BuildSomethingAnimationBasePath + "tea_cup_animation/tea_cup_" + counter + ".png");
// }
// for(let i = 1; i <= 11; ++i) {
//     counter = (i < 10 ? "000" + i : "00"+i);
//     BuildSomethingRes.push(BuildSomethingAnimationBasePath + "umbrella_glass_animation/umbrella_glass_" + counter + ".png");
// }
//
//

