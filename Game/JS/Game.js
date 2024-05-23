//落下サイクル(小さい方が速い)
const speed = 500;
//ブロック1マスの大きさ
const blockSize = 30;
//ネクストのブロック1マスの大きさ
const nextBlockSize = 30;
//ホールドのブロック1マスの大きさ
const holdBlockSize = 20;
//ネクストの表示数
const nextTetNum = 6;
//ボードサイズ
const boardRow = 20;
const boardCol = 10;
//ネクストのサイズ
const nextRow = (nextTetNum * 4);
const nextCol = 6;
//ホールドのサイズ
const holdRow = 5;
const holdCol = 5;
//キャンバスの取得
const maincvs = document.getElementById('maincvs');
const nextcvs = document.getElementById('nextcvs');
const holdcvs = document.getElementById('holdcvs');
//2dコンテキストを取得
const mainctx = maincvs.getContext('2d');
const nextctx = nextcvs.getContext('2d');
const holdctx = holdcvs.getContext('2d');
//キャンバスサイズ
const canvasW = (blockSize * boardCol);
const canvasH = (blockSize * boardRow);
//ネクストのキャンバスサイズ
const nextCanvasW = (nextBlockSize * nextCol);
const nextCanvasH = (nextBlockSize * nextRow);
//ホールドのキャンバスサイズ
const holdCanvasW = (holdBlockSize * holdCol);
const holdCanvasH = (holdBlockSize * holdRow);
maincvs.width = canvasW;
maincvs.height = canvasH;
nextcvs.width = nextCanvasW;
nextcvs.height = nextCanvasH;
holdcvs.width = holdCanvasW;
holdcvs.height = holdCanvasH;
//コンテナの設定
const container = document.getElementById('container');


//BGM
const BGM = new Audio('Resource/BGM/tetris_game.mp3');
let isPlayBGM = false;

//SE
const SE_DORPDOWN = new Audio('Resource/SE/tet_drop_down.mp3'); //即時落下音
const SE_FIT = new Audio('Resource/SE/tet_fit.mp3'); //固定音
const SE_MOVE = new Audio('Resource/SE/tet_move.mp3'); //移動音
const SE_LINECLEAR = new Audio('Resource/SE/tet_line_clear.mp3'); //列消去音声
const SE_GAMEOVER = new Audio('Resource/SE/gameover.mp3'); //ゲームオーバー音

const ENUM_SE_TYPE = {
    DROPDOWN: 'DROPDOWN',
    FIT: 'FIT',
    MOVE: 'MOVE',
    LINECLEAR: 'LINECLEAR',
    GAMEOVER: 'GAMEOVER',
};

//テトリミノの全種類数
const tet_boxnum = 7;
//テトリミノの種類
const tetTypes = [
    [], //0を空としておく
    [
        [1, 1],
        [1, 1],
    ],
    [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
    ],
    [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1],
    ],
    [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
    ],
];

//テトリミノの種類(ネクスト、ホールド表示用)
const tetTypesSub = [
    [], //0を空としておく
    [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [0, 0, 1, 0],
        [0, 1, 1, 1],
        [0, 0, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 1],
        [0, 0, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [0, 0, 1, 1],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [0, 1, 1, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [0, 0, 0, 1],
        [0, 1, 1, 1],
        [0, 0, 0, 0],
    ],
];

//テトリミノの色
const tetColors = [
    '#fd312300',
    '#f6fe85',
    '#07e0e7',
    '#7ced77',
    '#f78ff0',
    '#f94246',
    '#9693fe',
    '#f2b907',
];

//今後落ちてくる予定のテト
var tet_list = new Array();
//テトリミノのindex
let tet_idx;
//選択されたテト
let tet;
//ホールドされたテトindex
let holdtet_idx = 0;
//ホールドされたテト
let holdtet = 0;
//ホールドフラグ
let holdflag = false;

//テトリミノのオフセット量(何マス分ずれているか)
let offsetX = 0;
let offsetY = 0;

//ボード本体
const board = [];
const nextBoard = [];
const holdBoard = [];

//タイマーID
let timerId = NaN;

//ゲームオーバーフラグ
let isGameOver = false;

//================
//初期化処理
//================
const Init = () => {
    //ボード(20*10を0埋め)
    for (let y = 0; y < boardRow; y++) {
        board[y] = [];
        for (let x = 0; x < boardCol; x++) {
            board[y][x] = 0;
        }
    }
    for (let y = 0; y < nextRow; y++) {
        nextBoard[y] = [];
        for (let x = 0; x < nextCol; x++) {
            nextBoard[y][x] = 0;
        }
    }
    for (let y = 0; y < holdRow; y++) {
        holdBoard[y] = [];
        for (let x = 0; x < holdCol; x++) {
            holdBoard[y][x] = 0;
        }
    }

    AddTet(); //テト抽選
    TimerReset(); //タイマーセット
    SetNextTet(); //次のテトセット
    InitStartPos(); //初期位置に戻す
    DrawNextTets(); //ネクスト描画
    DrawHoldTets(); //ホールド描画

    InitAudio(); //オーディオ初期化

    Draw();
};

//==============
// オーディオ初期化
//==============
const InitAudio = () => {
    //BGM
    BGM.load();
    BGM.currentTime = 1.5;
    BGM.playbackRate = 1;
    BGM.volume = 0.6;
    BGM.loop = true;

    //SE
    SE_DORPDOWN.load();
    SE_DORPDOWN.loop = false;
    SE_FIT.load();
    SE_FIT.playbackRate = 2;
    SE_FIT.loop = false;
    SE_MOVE.load();
    SE_MOVE.loop = false;
    SE_LINECLEAR.load();
    SE_LINECLEAR.loop = false;
    SE_GAMEOVER.load();
    SE_GAMEOVER.loop = false;
}

//==============
//BGM再生
//==============
const PlayBGM = () => {
    BGM.pause();
    BGM.play();
}
//==============
//BGM停止
//==============
const StopBGM = () => {
    BGM.pause();
}

//==============
//SE再生
//==============
const PlaySE = (enum_se_type) => {
    switch (enum_se_type) {
        case ENUM_SE_TYPE.DROPDOWN:
            SE_DORPDOWN.pause();
            SE_DORPDOWN.currentTime = 0;
            SE_DORPDOWN.play();
            break;
        case ENUM_SE_TYPE.FIT:
            SE_FIT.pause();
            SE_FIT.currentTime = 0.025;
            SE_FIT.play();
            break;
        case ENUM_SE_TYPE.MOVE:
            SE_MOVE.pause();
            SE_MOVE.currentTime = 0;
            SE_MOVE.play();
            break;
        case ENUM_SE_TYPE.LINECLEAR:
            SE_LINECLEAR.pause();
            SE_LINECLEAR.currentTime = 0;
            SE_LINECLEAR.play();
            break;
        case ENUM_SE_TYPE.GAMEOVER:
            SE_GAMEOVER.pause();
            SE_GAMEOVER.currentTime = 0;
            SE_GAMEOVER.play();
            break;
        default:
            break;
    }
}

//==============
//描画処理
//==============
const Draw = () => {
    //デバッグ用
    //$('test').text(offsetX);

    //塗りに黒を設定
    mainctx.fillStyle = '#000';
    //キャンバスを塗りつぶす
    mainctx.fillRect(0, 0, canvasW, canvasH);

    //ボードに存在しているブロックを塗る
    for (let y = 0; y < boardRow; y++) {
        for (let x = 0; x < boardCol; x++) {
            if (board[y][x]) {
                DrawBlock(mainctx, x, y, board[y][x]);
            }
        }
    }

    //テトリミノの描画
    for (let y = 0; y < tet.length; y++) {
        for (let x = 0; x < tet.length; x++) {
            if (tet[y][x]) {
                DrawBlock(mainctx, offsetX + x, offsetY + y, tet_idx);
            }
        }
    }
    DrowTetDorpDownPos(); //テト予測描画

    //ゲームオーバー
    if (isGameOver) {
        StopBGM(); //BGM停止
        PlaySE(ENUM_SE_TYPE.GAMEOVER); //SE再生
        //ゲームオーバー表示
        //$('#gameover').show();
        mainctx.font = '45px Arial';
        mainctx.fillStyle = '#a41900';
        mainctx.textAlign = 'center';
        mainctx.fillText('GAME OVER', maincvs.width / 2, maincvs.height / 2);
    }
};

//==================
//ブロック一つを描画する
//==================
const DrawBlock = (ctx, x, y, tet_idx, blocksize = blockSize, linecolor = 'black', linesize = 1) => {
    let px = x * blocksize;
    let py = y * blocksize;
    //塗りを設定
    ctx.fillStyle = tetColors[tet_idx];
    ctx.fillRect(px, py, blocksize, blocksize);
    //線を設定
    ctx.strokeStyle = linecolor;
    //線を描画
    ctx.lineWidth = linesize;
    ctx.strokeRect(px, py, blocksize, blocksize);
};

//================================================
//指定された方向に移動できるか？(x移動量,y移動量,対象テト)
//================================================
const CanMove = (dx, dy, nowTet = tet) => {
    for (let y = 0; y < tet.length; y++) {
        for (let x = 0; x < tet.length; x++) {
            //その場所にブロックがあれば
            if (nowTet[y][x]) {
                //ボード座標に変換（offsetX(-2~8)+x(0~3)+移動量(-1~1)
                let nx = offsetX + x + dx;
                let ny = offsetY + y + dy;
                if (
                    //調査する座標がボード外だったらできない
                    ny < 0 ||
                    nx < 0 ||
                    ny >= boardRow ||
                    nx >= boardCol ||
                    //移動したいボード上の場所にすでに存在してたらできない
                    board[ny][nx]
                ) {
                    //移動できない
                    return false;
                }
            }
        }
    }
    //移動できる
    return true;
};

//=====
//回転
//=====
const CreateRotateTet = () => {
    //新しいテトを作る
    let newTet = [];
    for (let y = 0; y < tet.length; y++) {
        newTet[y] = [];
        for (let x = 0; x < tet.length; x++) {
            //時計回りに90度回転させる
            newTet[y][x] = tet[tet.length - 1 - x][y];
        }
    }
    return newTet;
};

//=======
//操作入力
//=======
document.onkeydown = (e) => {
    if (isGameOver) return;
    switch (e.key) {
        case "ArrowLeft": //左
        case "a":
            if (CanMove(-1, 0)) {
                offsetX--;
                PlaySE(ENUM_SE_TYPE.MOVE);
            }
            break;
        case "ArrowUp": //上
        case "w":
            while (CanMove(0, 1)) {
                offsetY++;
            }
            PlaySE(ENUM_SE_TYPE.DROPDOWN);
            DropTet();
            break;
        case "ArrowRight": //右
        case "d":
            if (CanMove(1, 0)) {
                offsetX++;
                PlaySE(ENUM_SE_TYPE.MOVE);
            }
            break;
        case "ArrowDown": //下
        case "s":
            if (CanMove(0, 1)) {
                offsetY++;
                PlaySE(ENUM_SE_TYPE.MOVE);
                TimerReset(); //タイマーリセット
            }
            break;
        case " ": //space
            let newTet = CreateRotateTet();
            if (CanMove(0, 0, newTet)) {
                tet = newTet;
            }
            break;
        case "Shift":
            HoldTet();
            break;
    }
    if (!isPlayBGM) {
        isPlayBGM = true;
        PlayBGM();
    }
    Draw();
};
//==================================
//動きが止まったテトをボード座標に書き写す
//==================================
const FixTet = () => {
    PlaySE(ENUM_SE_TYPE.FIT); //SE再生
    holdflag = false; //ホールドフラグ解除

    for (let y = 0; y < tet.length; y++) {
        for (let x = 0; x < tet.length; x++) {
            if (tet[y][x]) {
                //ボードに書き込む
                board[offsetY + y][offsetX + x] = tet_idx;
            }
        }
    }
};

//==============
//揃ったライン消去
//==============
const ClearLine = () => {
    //ボードの行を上から調査
    for (let y = 0; y < boardRow; y++) {
        //一列揃ってると仮定する(フラグ)
        let isLineOK = true;
        //列に0が入っていないか調査
        for (let x = 0; x < boardCol; x++) {
            if (board[y][x] === 0) {
                //0が入ってたのでフラグをfalse
                isLineOK = false;
                break;
            }
        }
        if (isLineOK) {//ここに来るということはその列が揃っていたことを意味する

            PlaySE(ENUM_SE_TYPE.LINECLEAR); // SEならす
            //その行から上に向かってfor文を動かす
            for (let ny = y; ny > 0; ny--) {
                for (let nx = 0; nx < boardCol; nx++) {
                    //一列上の情報をコピーする
                    board[ny][nx] = board[ny - 1][nx];
                }
            }
        }
    }
};

//=====================
//繰り返し行われる落下処理
//=====================
const DropTet = () => {
    if (isGameOver) return;
    //下に行けたら
    if (CanMove(0, 1)) {
        //下に行く
        offsetY++;
    } else {
        FixTet(); //行けなかったら固定する
        ClearLine(); //揃ったラインがあったら消す
        SetNextTet(); //次のテトセット
        InitStartPos(); //初期位置に戻す
        TimerReset(); //落下時間リセット
        DrawNextTets(); //ネクスト描画

        //次のテトを出せなかったらGameOver
        if (!CanMove(0, 0)) {
            isGameOver = true;
            clearInterval(timerId);
            timerId = NaN;
        }
    }
    Draw();
};

//================
//初期座標に戻す処理
//================
const InitStartPos = () => {
    offsetX = boardCol / 2 - Math.ceil(tet.length / 2);
    offsetY = 0;
};

//=================
//１パック分のテト追加
//=================
const AddTet = () => {

    //データが１パック分以下なら、新しいテトを追加する
    if (tet_list.length > tet_boxnum) {
        return;
    }

    let tets = [1, 2, 3, 4, 5, 6, 7];

    let length = tets.length;
    for (let i = length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = tets[i];
        tets[i] = tets[j];
        tets[j] = tmp;
    }

    tets.forEach(element => {
        tet_list.push([element, tetTypes[element]]);
    });

    //データが１パック分以下なら、新しいテトを追加する
    if (tet_list.length <= tet_boxnum) {
        AddTet();
    }

    //データ確認用
    //$('test').text();
}

//====================
//次に落ちてくるテトセット
//====================
const SetNextTet = () => {
    //次のデータをセット
    tet_idx = tet_list[0][0];
    tet = tet_list[0][1];

    //データを削除
    tet_list.shift();

    // 次に落ちてくるテト追加
    AddTet();
}

//======================
//落ちてくるテトリス予測表示
//======================
const DrawNextTets = () => {
    nextctx.fillStyle = '#000'; //塗りに黒を設定
    nextctx.fillRect(0, 0, nextCanvasW, nextCanvasH); //キャンバスを塗りつぶす

    //ネクストボード初期化
    for (let y = 0; y < nextRow; y++) {
        for (let x = 0; x < nextCol; x++) {
            nextBoard[y][x] = 0;
        }
    }

    //ボードにネクストテト格納
    for (let i = 0; i < nextTetNum; i++) {
        let x = 1;
        let y = (i * 4);
        let drawTet = tetTypesSub[tet_list[i][0]];

        for (let j = 0; j < drawTet.length; j++) {
            for (let k = 0; k < drawTet.length; k++) {
                if (drawTet[j][k]) {
                    nextBoard[y + j][k + x] = tet_list[i][0];
                }
            }
        }
    }

    //ネクストボード描画
    for (let y = 0; y < nextRow; y++) {
        for (let x = 0; x < nextCol; x++) {
            if (nextBoard[y][x]) {
                DrawBlock(nextctx, x, y, nextBoard[y][x], nextBlockSize);
            }
        }
    }
}
//======================
//ホールド表示
//======================
const DrawHoldTets = () => {
    holdctx.fillStyle = '#000'; //塗りに黒を設定
    holdctx.fillRect(0, 0, holdCanvasW, holdCanvasH); //キャンバスを塗りつぶす

    if (holdtet_idx == 0) {
        return;
    }

    //ホールド描画
    for (let y = 0; y < holdtet.length; y++) {
        for (let x = 0; x < holdtet.length; x++) {
            if (holdtet[y][x]) {
                DrawBlock(holdctx, x + 0.5, y + 0.5, holdtet_idx, holdBlockSize);
            }
        }
    }

    //$('test').text(holdBoard);
}

//====================
//ホールドする処理
//====================
const HoldTet = () => {
    if (holdflag) {
        return;
    }

    holdflag = true; //ホールドフラグON
    //ホールド切り替え
    if (holdtet_idx) {
        let temp_idx = holdtet_idx;
        holdtet_idx = tet_idx;
        holdtet = tetTypesSub[tet_idx];
        tet_idx = temp_idx;
        tet = tetTypes[temp_idx];
        InitStartPos(); //初期位置に戻す
        TimerReset(); //落下時間リセット
    }
    else {
        holdtet_idx = tet_idx;
        holdtet = tetTypesSub[tet_idx];
        SetNextTet(); //次のテトセット
        InitStartPos(); //初期位置に戻す
        TimerReset(); //落下時間リセット
    }
    DrawHoldTets(); //ホールド描画
    Draw();
}

//====================
//テト落下タイマーリセット
//====================
const TimerReset = () => {
    clearInterval(timerId);
    timerId = NaN;
    timerId = setInterval(DropTet, speed);
}

//====================
//落下予測表示
//====================
const DrowTetDorpDownPos = () => {
    let move_y = 1;
    while (CanMove(0, move_y)) {
        move_y++;
    }
    if (move_y <= 1) {
        return;
    }

    move_y--;
    for (let y = 0; y < tet.length; y++) {
        for (let x = 0; x < tet.length; x++) {
            if (tet[y][x]) {
                DrawBlock(mainctx, offsetX + x, offsetY + y + move_y, 0, blockSize, '#ababab', 2);
            }
        }
    }
}