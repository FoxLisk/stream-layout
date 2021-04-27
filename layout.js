"use strict";
function log_to_amarec(msg) {
    let el = document.getElementById('log');
    var new_span = document.createElement('p');
    new_span.innerHTML = msg;
    el.prepend(new_span);
    if (el.childElementCount > 9) {
        var c = el.children[el.children.length - 1];
        c.remove();

    }
}

document.addEventListener('DOMContentLoaded', function() {

    let f = document.getElementById('F'),
        o = document.getElementById('O'),
        x = document.getElementById('X'),
        l = document.getElementById('L'),
        i = document.getElementById('I'),
        s = document.getElementById('S'),
        k = document.getElementById('K'),
        letters = [f, o, x, l, i, s, k],
        changing_letters = [
            new ChangingElement(f, 240),
            new ChangingElement(o, 240),
            new ChangingElement(x, 240),
            new ChangingElement(l, 240),
            new ChangingElement(i, 240),
            new ChangingElement(s, 240),
            new ChangingElement(k, 240),
        ],
        gol_el = document.getElementById('gol'),
        starting_gol_html_elements,
        static_ticks_before_starting = 20,
        static_ticks = 0,
        message_wrapper = document.getElementById('controller_box');

    function tickLetters() {
        for (var letter of changing_letters) {
            letter.pump();
        }
    }
    setInterval(tickLetters, 20);


    let height = 35, width = 46;

    var gol = new GameOfLife({
        height: height,
        width: width,
        ticks_after_stuck: 20,
    });
    gol.zeroBoard();
    starting_gol_html_elements = flexBoxInitial(height, width);
    gol_el.innerHTML = '';
    gol_el.append(starting_gol_html_elements.container);

    function resetBoard(gol) {
        gol.zeroBoard();
        if (Math.random() < 0.4) {
            let pattern = PATTERNS[randomInt(PATTERNS.length)];
            let startx = randomInt(gol.getWidth() - pattern[0].length);
            let starty = randomInt(gol.getHeight() - pattern.length);
            
            try {
                gol.setRect(pattern, startx, starty);
                return;
            } catch (e) {
            }
        } else {
            gol.newRandomBoard(randomScaledFloat(0.3, 0.7));
        }
            

    }
    function drawBoard(new_board) {
        for (var row_n in new_board) {
            for (var col_n in new_board[row_n]) {
                if (!starting_gol_html_elements.els[row_n][col_n]) {
                }
                starting_gol_html_elements.els[row_n][col_n].classList.remove('alive')
                if (new_board[row_n][col_n]) {
                    starting_gol_html_elements.els[row_n][col_n].classList.add('alive');
                }
            }
        }
    }

    resetBoard(gol);
    drawBoard(gol.copyBoard());

    function run_the_gol() {
        if (gol.isStale()) {
            resetBoard(gol);
            static_ticks = 0;
            drawBoard(gol.copyBoard());
        }
        if (static_ticks < static_ticks_before_starting) {
            static_ticks += 1;
            return;
        }
        var new_board = gol.tick();
        drawBoard(new_board);

    }

    setInterval(run_the_gol, 100);

    function rotate_messages() {
        let active = message_wrapper.querySelector('.active');
        let next = active.nextElementSibling || message_wrapper.firstElementChild;
        active.classList.remove('active');
        next.classList.add('active');
    }

    setInterval(rotate_messages, 1000 * 30);

    log_to_amarec(window.obsstudio.pluginVersion);


    // i am having trouble making this robust to come-up order
    function open_websocket() {
        // i dont know how to make it wss
        let ws = new WebSocket("ws://localhost:3001");
        log_to_amarec(ws);
        ws.addEventListener('open', function (event) {
            log_to_amarec('websocket open');
            console.log('websocket open!!!1');
        });

        ws.addEventListener('message', function (event) {
            let obj = JSON.parse(event.data);
            console.log(obj);
            //log_to_amarec(event.data);
            if (obj.type === 'FontChange') {
                console.log('changing letters!!');
                for (var l of letters) {
                    //log_to_amarec('setting ' + l + ' to ' + obj.font);
                    l.style.fontFamily = obj.font;
                }
            } else {
                console.log('fell out');
            }
        });

        ws.addEventListener('onerror', function(e) {
            log_to_amarec(e);
            console.log(e);
            ws.close();
            // this could probably blow the stack in theory
            open_websocket();
        });
        ws.addEventListener('onclose', function(e) {
            log_to_amarec(e);
            console.log(e);
            open_websocket();
        });
        return ws;
    }

    open_websocket();

});
