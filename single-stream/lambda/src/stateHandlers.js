'use strict';

var Alexa = require('alexa-sdk');
var audioData = require('./audioAssets');
var constants = require('./constants');

var stateHandlers = {
    'LaunchRequest': function () {
        this.emit('PlayAudio');
    },
    'PlayAudio': function () {
        // play the radio
        controller.play.call(this, this.t('WELCOME_MSG', { skillName: audioData.title }));
    },
    'AMAZON.HelpIntent': function () {
        this.response.listen(this.t('HELP_MSG', { skillName: audioData.title }));
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        // No session ended logic
    },
    'ExceptionEncountered': function () {
        console.log("\n******************* EXCEPTION **********************");
        console.log("\n" + JSON.stringify(this.event.request, null, 2));
        this.callback(null, null)
    },
    'Unhandled': function () {
        this.response.speak(this.t('UNHANDLED_MSG'));
        this.emit(':responseReady');
    },

    'AMAZON.PauseIntent': function () { this.emit('AMAZON.StopIntent'); },
    'AMAZON.ResumeIntent': function () { controller.play.call(this, this.t('RESUME_MSG')) },
    'PlayCommandIssued': function () { controller.play.call(this, this.t('WELCOME_MSG', { skillName: audioData.title })) },
    'PauseCommandIssued': function () { controller.stop.call(this, this.t('STOP_MSG')) }
}

module.exports = stateHandlers;

var controller = function () {
    return {
        play: function (text) {
            /*
             *  Using the function to begin playing audio when:
             *      Play Audio intent invoked.
             *      Resuming audio when stopped/paused.
             *      Next/Previous commands issued.
             */

            if (canThrowCard.call(this)) {
                var cardTitle = audioData.subtitle;
                var cardContent = audioData.cardContent;
                var cardImage = audioData.image;
                this.response.cardRenderer(cardTitle, cardContent, cardImage);
            }

            this.response.speak(text).audioPlayerPlay('REPLACE_ALL', audioData.url, audioData.url, null, 0);
            this.emit(':responseReady');
        },
        stop: function (text) {
            /*
             *  Issuing AudioPlayer.Stop directive to stop the audio.
             *  Attributes already stored when AudioPlayer.Stopped request received.
             */
            this.response.speak(text).audioPlayerStop();
            this.emit(':responseReady');
        }
    }
}();

function canThrowCard() {
    /*
     * To determine when can a card should be inserted in the response.
     * In response to a PlaybackController Request (remote control events) we cannot issue a card,
     * Thus adding restriction of request type being "IntentRequest".
     */
    if (this.event.request.type === 'IntentRequest' || this.event.request.type === 'LaunchRequest') {
        return true;
    } else {
        return false;
    }
}

