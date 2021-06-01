var word_string, words; //String = enthÃ¤lt die WÃ¶rter; Array(words) = enthÃ¤lt die WÃ¶rter aufgesplittet in einem Array
var row1_string = ""; //enthÃ¤lt die einzugebenen WÃ¶rter der 1. Reihe
var i;
var word_pointer = 0; //markiert das aktuelle Wort welches getippt werden soll
var user_input_stream = ""; //sammelt alle Tastatureingaben des Users
var countdown; //zeigt die Zeit an und wird runtergezÃ¤hlt
var row_counter = 0; //zÃ¤hlt die Anzahl der ZeilensprÃ¼nge
var eingabe; //prÃ¼fvariable => alles was im Inputfeld drinsteht wird hier zwischengespeichert und weiterverarbeitet (manchmal reagiert der Keylistener fÃ¼r das Leerzeichen nicht schnell genug, z.b. "hallo w" wird dann Ã¼bertragen, daher erfolgt zu erst eine weiterverarbeitung)
var start_time = 0; //die Startzeit in Millisekunden
var end_time = 0; //die Endzeit in Millisekunden
var setval = ""; //die Variable fÃ¼r den Timer/setInterval
//var start_time_set = 0;		//wurde die Startzeit auf dem Server mittels Ajax schon gesetzt oder nicht
var line_height = 0; //HÃ¶he des Zeilensprungs
var loading = 0;

var error_wpm = 0; //fallback if ajax call fails => user can still see his result
var error_keystrokes = 0;
var error_correct = 0;
var error_wrong = 0;
var correction_counter = 0;

var _gaq = _gaq || [];
var test_ausgefuehrt = 0;
var selected = 0;
var pre_inputvalue = "";
var inputvalue = "";

var keys = {}; //liest die gedrÃ¼ckten Tasten ein, wird genutzt fÃ¼r Mac/Safari "Smart" Reload

var input_key_value = $("#config_input_key").attr("value");
var $inputfield = $("input#inputfield");
var $row1 = $("#row1");
var $reloadBtn = $("#reload-btn");
var $completeBtn = $("#complete-btn");
var $row1_span_wordnr;

var afk_timer = 0; //counts up if user hasn't typed anything, resets after a keystroke is pressed; if afk_timer bigger 10 seconds, don't post result
var max_time = 0;
var time_complete = 0;

$(document).ready(function () {
    restart();
    activate_keylistener();

    var win_width = $(window).width();

    //reload-button
    //oder "F5"-Taste abfangen
    $(document).keydown(function (event) {
        if (event.which == 116 && loading == 0) {
            loading = 1;
            restart();
            return false;
        }

        keys[event.which] = true;
    });

    $(document).keyup(function (event) {
        delete keys[event.which];
    });


    $("#reload-btn").on("click", function () {
        $("#auswertung-result").css('display', 'none');
        // nếu heret lượt thi thì không ấn đc

        restart();
        return false;
    });
    let cuoc_thi = $("#cuoc_thi").val();

    if (typeof cuoc_thi === 'undefined') {

        $("#reload-btn").removeClass("d-none");
    }
});

function restart() {
    //wird beim start und beim klick auf "restart" aufgerufen
    //ruft initialisierungsfunktionen auf und setzt werte zurÃ¼ck auf den startwert
    word_string = "";
    words = "";
    row1_string = "";
    word_pointer = 0;
    user_input_stream = "";

    //countdown = 30;
    //max_time = countdown;
    cd_started = 0;
    previous_position_top = 0;
    row_counter = 0;
    eingabe = "";
    start_time = 0;
    end_time = 0;
    //start_time_set = 0;

    //just to count everything if the ajax-call fails
    error_wpm = 0;
    error_keystrokes = 0;
    error_correct = 0;
    error_wrong = 0;
    correction_counter = 0;

    selected = 0;
    pre_inputvalue = "";
    inputvalue = "";
    $("#row1").css("opacity", "1");
    $("#input-row #inputfield").prop("disabled", false);

    $("#ajax-load").css("display", "block");
    $("#reload-box").css("display", "none");
    $("#row1").css("top", "1px");
    $("#timer").removeClass("off");

    window.clearInterval(setval);
    setval = "";
    var de_thi = $("#de_thi").val();
    if (typeof de_thi === 'undefined') {
        de_thi = "";
    }
    let cuoc_thi = $('#cuoc_thi').val();
    if (typeof cuoc_thi === 'undefined')
        cuoc_thi = "";

    let randomWord = getRandomWord(listWords);

    max_time = randomWord.timer;
    countdown = randomWord.timer;
    $(".title span").html(randomWord.title);
    $("#timer").text(max_time + "s");
    setTimeout(function () {
        $("#ajax-load").css("display", "none");
        $("#reload-box").css("display", "block");
        let wordReplace = randomWord.word.replace(/\s/g, '|').toLowerCase();

        $("#wordlist").text(wordReplace);



        word_string = $("#wordlist").text();

        words = word_string.split("|");

        fill_line_switcher();

        p = $('#row1 span[wordnr="' + word_pointer + '"]').position();

        previous_position_top = 0;

        line_height = parseInt(
            $('#row1 span[wordnr="' + word_pointer + '"]').css("line-height")
        );

        //springe ins InputField
        $inputfield.val("");
        //$inputfield.focus();

        $("#row1").show();
        $("#words").fadeTo("fast", 1.0);

        if (test_ausgefuehrt > 0) {
            //ga(function (tracker) {
            (function (tracker) {
                tracker.send("pageview");
            });
        }

        test_ausgefuehrt++;

        loading = 0;
    }, 250);

}


function getRandomWord(arr, last = undefined) {
    if (arr.length === 0) {
        return;
    } else if (arr.length === 1) {
        return arr[0];
    } else {
        let num = 0;
        do {
            num = Math.floor(Math.random() * arr.length);
        } while (arr[num] === last);
        return arr[num];
    }
}

//wartet auf Eingaben die im #inputfield erfolgen
function activate_keylistener() {
    var android_spacebar = 0;

    // Android/mobile specific function to check if inputfield contains a space-char, as the keyup function doesn't work on Android+Chrome
    $(window).on("touchstart", function (event) {
        $("input#inputfield").on("input", function (event) {
            var value = $("input#inputfield").val();

            if (value.indexOf(" ") !== -1) {
                android_spacebar = 1;
            } else {
                android_spacebar = 0;
            }
        });
    });

    $inputfield.keydown(selectionCheck); // tracks how many characters are selected

    $inputfield.keyup(function (event) {
        if (loading == 0) {
            start_countdown();
        }

        if (pre_inputvalue === "" && inputvalue === "")
            inputvalue = $inputfield.val();
        else {
            pre_inputvalue = inputvalue;
            inputvalue = $inputfield.val();
        }

        afk_timer = 0;
        $reloadBtn.show();

        $row1_span_wordnr = $('#row1 span[wordnr="' + word_pointer + '"]');

        var keyid = event.which;
        switch (keyid) {
            case 8:
                correction_counter += compare();
                break;
            case 46:
                correction_counter += compare();
                break;
            default:
                break;
        }
        // only check for selected removed if the input value changed
        if (
            selected &&
            keyid !== 8 &&
            keyid !== 46 &&
            pre_inputvalue !== inputvalue
        ) {
            correction_counter += compare() + 1;
        }

        if (event.which == input_key_value && $inputfield.val() == " ") {
            $inputfield.val("");
        } else if (
            (event.which == input_key_value && loading == 0) ||
            android_spacebar == 1
        ) {
            //event.which == 32 => SPACE-Taste

            //evaluate
            var eingabe = $inputfield.val().split(" ");
            user_input_stream += eingabe[0] + " ";

            $row1_span_wordnr.removeClass("highlight-wrong");

            if (eingabe[0] == words[word_pointer]) {
                $row1_span_wordnr.removeClass("highlight").addClass("correct");
                error_correct++;
                error_keystrokes += words[word_pointer].length;
                error_keystrokes++; //fÃ¼r jedes SPACE
            } else {
                $row1_span_wordnr.removeClass("highlight").addClass("wrong");
                error_wrong++;
                error_keystrokes -= Math.round(words[word_pointer].length / 2);
            }

            //process
            word_pointer++;
            $row1_span_wordnr = $('#row1 span[wordnr="' + word_pointer + '"]');

            $row1_span_wordnr.addClass("highlight");

            p = $row1_span_wordnr.position();

            //console.log(p.top+"\n");

            if (p.top > previous_position_top + 10) {
                //"+ 5 ist die Toleranz, damit der Zeilensprung auch funktioniert, wenn User die Schriftart grÃ¶ÃŸer gestellt hat, etc."
                row_counter++;
                previous_position_top = p.top;

                var zeilensprung_hoehe = -1 * line_height * row_counter;

                $row1.css("display", "block");
                $row1.css("top", zeilensprung_hoehe + "px"); //bei einem zeilensprung wird der text um "line_height" verschoben
                $row1_span_wordnr.addClass("highlight");
            }

            //erase
            $("#inputstream").text(user_input_stream);
            $inputfield.val(eingabe[1]);
        } else {
            //prÃ¼fe ob user das wort gerade falsch schreibt (dann zeige es rot an, damit user direkt korrigieren kann)
            //if($inputfield.val().replace(/\s/g, '') == words[word_pointer].substr(0, $inputfield.val().length))
            if ($inputfield.val().split(" ")[0] == words[word_pointer].substr(0, $inputfield.val().length))
                $row1_span_wordnr.removeClass("highlight-wrong").addClass("highlight");
            else
                $row1_span_wordnr.removeClass("highlight").addClass("highlight-wrong");
        }
    });
}

// compares previous value with current, check difference
function compare() {
    return pre_inputvalue.length - inputvalue.length;
}

// count highlighted characters
function selectionCheck(event) {
    selected = event.target.selectionEnd - event.target.selectionStart;
}

//zÃ¤hlt die Zeit runter und stoppt den Speedtest
function start_countdown() {
    if (cd_started == 0) {
        cd_started = 1;
        setval = window.setInterval(count_down, 1000);
        start_time = get_current_time();
    }
}

//zÃ¤hlt die Zeit runter
function count_down() {
    countdown--;
    $('#complete-btn').prop("disabled", false);
    afk_timer++;

    var first_part;
    var second_part;

    first_part = Math.floor(countdown / 60);
    second_part = countdown % 60;

    if (second_part < 10) second_part = "0" + second_part;

    $("#timer").text(first_part + ":" + second_part);
    if (countdown > 9) {
        //$("#timer").text("0:" + countdown);
    } else if (countdown > 0) {
        //$("#timer").text("0:0" + countdown);
    } else {
        countDownResult();
    }
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, "g"), replace);
}

function get_current_time() {
    var d = new Date();
    return d.getTime();
}

//String "Trim" Function
function trim11(str) {
    str = str.replace(/^\s+/, "");
    for (var i = str.length - 1; i >= 0; i--) {
        if (/\S/.test(str.charAt(i))) {
            str = str.substring(0, i + 1);
            break;
        }
    }
    return str;
}

//befÃ¼llt #row1 und #row2 mit neuen WÃ¶rtern
function fill_line_switcher() {
    for (i = 0; i < words.length; i++)
        row1_string += '<span wordnr="' + i + '" class="">' + words[i] + "</span> "; //classes = NONE, green, red, highlight

    $("#row1").html(row1_string);

    $("#row1 span:first").addClass("highlight");
}

function completeTest() {
    //console.log(time_complete);
    var result = confirm("Bạn thực sự muốn kết thúc bài thi");
    if (result) {
        countDownResult();
        if (countdown > 9) {
            //$("#timer").text("0:" + countdown);
        } else if (countdown > 0) {
            //$("#timer").text("0:0" + countdown);
        }
    }

}
function countWpm(s) {
    return s.trim().split(' ').length;
}

function countDownResult() {
    //ENDE => countdown erreicht 0 Sekunden, stoppe den Countdown und Auswertung mittels Ajax
    $("#timer").text("0:00");
    $("#timer").addClass("off");
    $("#row1").show();
    $("#row1").css("opacity", "0.3");
    $("#words").fadeTo('fast', 0.3);
    $("#words").fadeIn();
    $("#row1").css("opacity", "0.3");
    $("#input-row #inputfield").prop("disabled", true);
    window.clearInterval(setval);
    setval = "";

    end_time = get_current_time();
    let count_correct = $('.correct').length;
    let count_error = $('.wrong').length;

    if (typeof tai_khoan === 'undefined')
        tai_khoan = "";

    let cuoc_thi = $('#cuoc_thi').val();
    if (typeof cuoc_thi === 'undefined')
        cuoc_thi = "";
    //encodeURIComponent is to escape accidental "&" character to ensure that the user_input_stream isn't cut off at this point
    time_complete = max_time - countdown;
    var send_data = "&cuoc_thi=" + cuoc_thi + "&time_complete=" + time_complete +
        "&sz=" +
        start_time +
        "&ez=" +
        end_time +
        "&wordlist=" +
        $("#wordlist").text() +
        "&user_input=" +
        encodeURIComponent(user_input_stream) +
        "&backspace_counter=" +
        correction_counter +
        "&afk_timer=" +
        afk_timer +
        "&speedtest_id=" +
        $("#speedtest-id").attr("value") +
        "&mode=" +
        $("#speedtest_mode").attr("value") + "&word_correct=" + count_correct + "&word_wrong=" + count_error;



    let htmlResult = "";


    htmlResult += "<h3>Kết quả </h3>";
    htmlResult += "<table class='table table-striped' id='result-table'>";
    htmlResult += "<tbody>";
    htmlResult += `<tr id='wpm'><td class='name'>Số từ đã gõ: </td><td class='value'> <strong>${countWpm(user_input_stream)}</strong></td></tr>`;
    //htmlResult += "<tr id='point'><td class='name'>Điểm đạt được: </td><td class='value'> <strong>{muc_do_hoan_thanh * 100:F2}</strong></td></tr>";
    htmlResult += `<tr id='correct'><td class='name'>Số từ gõ đúng: </td><td class='value'> <strong>${count_correct}</strong></td></tr>`;
    htmlResult += `<tr id='wrong'><td class='name'>Số từ gõ sai: </td><td class='value'> <strong>${count_error}</strong></td></tr>`;
    //htmlResult += "<tr id='ratio'><td class='name'>Mức độ hoàn thành: </td><td class='value'> <strong>{muc_do_hoan_thanh * 100:F2}%</strong></td></tr>";
    htmlResult += `<tr id='time'><td class='name'>Thời gian hoàn thành (giây): </td><td class='value'> <strong>${time_complete}</strong></td></tr>`;
    htmlResult += "</tbody>";
    htmlResult += "<table>";
    $("#result-load-indicator").show();
    $("#result-load-indicator").hide();
    $("#auswertung-result").html(htmlResult);
   

    var node = document.getElementById('result-table');

    domtoimage.toPng(node)
        .then(function (dataUrl) {
            var img = new Image();
            img.src = dataUrl;
            $("#resultImage").append(img);
        })
        .catch(function (error) {
            console.error('oops, something went wrong!', error);
        });

    $(".fb-share-button").removeClass("d-none");

    $("#auswertung-result").show();

    //if(data['showLoginWarning']) $("#loginWarning").show(); else $("#loginWarning").hide();

    //$("#badge-box").html(data["badge"]);
    $("#badge-box").show();

    $("#advertisement").css("width", "1400px");
    $("#ads-speedtest-view-container").css("width", "");

    //check immediately for flagged results and 70 seconds later => achievements are processed every minute, so it has to be one minute later

    setTimeout(function () {
        //load_notifications();
    }, 5000);

    //hides the secondary main-ad and resizes the "main-ad-box" to fit on the right side next to "result" & "share"
    //$("#ad-main-secondary").hide();
    $("#ad-main").css("margin", "0");
    $("#ad-main").css("float", "left");
    $("#ad-main-secondary").css("float", "left");

    if (afk_timer >= 10)
        alert("Are you afk? Your score has not been saved.");

    //scores with 20 or more wrong words aren't saved, show user a message to clarify this
    if ($("tr#wrong > td.value > strong").text() >= 20)
        alert(
            "You made more than 20 mistakes, your score has not been saved."
        );
}
