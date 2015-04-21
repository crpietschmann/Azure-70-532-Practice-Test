// jsQuizEngine https://github.com/crpietschmann/jsQuizEngine
// Copyright (c) 2015 Chris Pietschmann http://pietschsoft.com
// Licensed under MIT License https://github.com/crpietschmann/jsQuizEngine/blob/master/LICENSE
(function (window, $) {

    function getCurrentQuiz(container) {
        return container.find('.question-pool > .quiz');
    }
    function getAllQuestions(container) {
        return container.find('.question-pool > .quiz .question');
    }
    function getQuestionByIndex(container, index) {
        return container.find('.question-pool > .quiz .question:nth-child(' + index + ')');
    }
    function getNowDateTimeStamp() {
        var dt = new Date();
        return dt.getMonth() + '/' + dt.getDate() + '/' + dt.getFullYear() + ' ' + dt.getHours() + ':' + (dt.getMinutes() >= 10 ? dt.getMinutes() : '0' + dt.getMinutes());
    }

    var ViewModel = function (elem, options) {
        var self = this;
        self.element = $(elem);
        self.options = $.extend({}, engine.defaultOptions, options);

        self.element.find('.question-pool').load(self.options.quizUrl, function () {
            // quiz loaded into browser from HTML file

            getCurrentQuiz(self.element).find('.answer').each(function (e, i) {
                var elem = $(this),
                    newAnswer = $('<label></label>').addClass('answer').append('<input type=\'checkbox\'/>').append($('<div></div>').html(elem.html()));
                if (elem.is('[data-correct]')) {
                    newAnswer.attr('data-correct', '1');
                }
                elem.replaceWith(newAnswer);
            });

            self.questionCount(getAllQuestions(self.element).length);
            self.quizTitle(getCurrentQuiz(self.element).attr('data-title'));
            self.quizSubTitle(getCurrentQuiz(self.element).attr('data-subtitle'));
        });
        
        self.quizStarted = ko.observable(false);
        self.quizComplete = ko.observable(false);

        self.quizTitle = ko.observable('');
        self.quizSubTitle = ko.observable('');
        self.questionCount = ko.observable(0);

        self.currentQuestionIndex = ko.observable(0);
        self.currentQuestionIndex.subscribe(function (newValue) {
            if (newValue < 1) {
                self.currentQuestionIndex(1);
            } else if(newValue > self.questionCount()) {
                self.currentQuestionIndex(self.questionCount());
            } else {
                getAllQuestions(self.element).hide()
                getQuestionByIndex(self.element, newValue).show();
            }

            if (self.questionCount() !== 0) {
                self.currentProgress(self.currentQuestionIndex() / self.questionCount() * 100);
            }
        });
        self.currentProgress = ko.observable(0);

        self.currentQuestionIsFirst = ko.computed(function () {
            return self.currentQuestionIndex() === 1;
        });
        self.currentQuestionIsLast = ko.computed(function () {
            return self.currentQuestionIndex() === self.questionCount();
        });

        self.startQuiz = function () {
            // reset quiz to start state
            self.currentQuestionIndex(0);
            self.currentQuestionIndex(1);

            self.quizStarted(true);
        }

        self.moveNextQuestion = function () {
            self.currentQuestionIndex(self.currentQuestionIndex() + 1);
        };
        self.movePreviousQuestion = function () {
            self.currentQuestionIndex(self.currentQuestionIndex() - 1);
        };
        self.showCurrentQuestionAnswer = function () {
            var q = getQuestionByIndex(self.element, self.currentQuestionIndex());
            q.find('.answer[data-correct]').addClass('highlight');
            q.find('.description').slideDown();
        };

        

        self.calculateScore = function () {
            var correctQuestions = [];
            getAllQuestions(self.element).each(function (i, e) {
                var q = $(this);
                if (q.find('.answer').length === (
                    q.find('.answer[data-correct] > input[type=checkbox]:checked').length + q.find('.answer:not([data-correct]) > input[type=checkbox]:not(:checked)').length
                    )) {
                    correctQuestions.push(q);
                }
            });
            self.totalQuestionsCorrect(correctQuestions.length);

            if (self.questionCount() !== 0) {
                self.calculatedScore(self.totalQuestionsCorrect() / self.questionCount() * 100);
            }

            self.calculatedScoreDate(getNowDateTimeStamp());

            self.quizComplete(true);
        };
        self.totalQuestionsCorrect = ko.observable(0);
        self.calculatedScore = ko.observable(0);
        self.calculatedScoreDate = ko.observable('');
        self.quizPassed = ko.computed(function () {
            return self.calculatedScore() >= 50;
        });
    };


    var engine = window.jsQuizEngine = function (elem, options) {
        return new engine.fn.init(elem, options);
    };
    engine.defaultOptions = {
        quizUrl: 'original.htm'
    };
    engine.fn = engine.prototype = {
        version: 0.1,
        init: function (elem, options) {
            var vm = new ViewModel(elem[0], options);
            ko.applyBindings(vm, elem[0]);
        }
    };
    engine.fn.init.prototype = engine.fn;


})(window, jQuery);