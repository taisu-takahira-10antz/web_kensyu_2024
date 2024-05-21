
//落下サイクル(小さい方が速い)
const speed = 500;
//ブロック1マスの大きさ
const blockSize = 30;
//ボードサイズ
const boardRow = 20;
const boardCol = 10;
//キャンバスの取得
const cvs = document.getElementById('cvs');
//2dコンテキストを取得
const ctx = cvs.getContext('2d');
//キャンバスサイズ
const canvasW = blockSize * boardCol;
const canvasH = blockSize * boardRow;
cvs.width = canvasW;
cvs.height = canvasH;
//コンテナの設定
const container = document.getElementById('container');
container.style.width = canvasW + 'px';


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

//テトリミノの色
const tetColors = [
    '',//これが選択されることはない
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

//テトリミノのオフセット量(何マス分ずれているか)
let offsetX = 0;
let offsetY = 0;

//ボード本体
const board = [];

//タイマーID
let timerId = NaN;

//ゲームオーバーフラグ
let isGameOver = false;

//描画処理
const Draw = () => {
    $('test').text(offsetX);
    //塗りに黒を設定
    ctx.fillStyle = '#000';
    //キャンバスを塗りつぶす
    ctx.fillRect(0, 0, canvasW, canvasH);

    //ボードに存在しているブロックを塗る
    for (let y = 0; y < boardRow; y++) {
        for (let x = 0; x < boardCol; x++) {
            if (board[y][x]) {
                DrawBlock(x, y, board[y][x]);
            }
        }
    }

    //テトリミノの描画
    for (let y = 0; y < tet.length; y++) {
        for (let x = 0; x < tet.length; x++) {
            if (tet[y][x]) {
                DrawBlock(offsetX + x, offsetY + y, tet_idx);
            }
        }
    }
    //ゲームオーバー
    if (isGameOver) {
        //ゲームオーバー表示
        $('gameover').show();
    }
};

//ブロック一つを描画する
const DrawBlock = (x, y, tet_idx) => {
    let px = x * blockSize;
    let py = y * blockSize;
    //塗りを設定
    ctx.fillStyle = tetColors[tet_idx];
    ctx.fillRect(px, py, blockSize, blockSize);
    //線を設定
    ctx.strokeStyle = 'black';
    //線を描画
    ctx.strokeRect(px, py, blockSize, blockSize);
};

//指定された方向に移動できるか？(x移動量,y移動量,対象テト)
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

//回転
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

document.onkeydown = (e) => {
    if (isGameOver) return;
    switch (e.key) {
        case "ArrowLeft": //左
        case "a":
            if (CanMove(-1, 0)) offsetX--;
            break;
        case "ArrowUp": //上
        case "w":
            while (CanMove(0, 1)) {
                offsetY++;
            }
            DropTet();
            break;
        case "ArrowRight": //右
        case "d":
            if (CanMove(1, 0)) offsetX++;
            break;
        case "ArrowDown": //下
        case "s":
            if (CanMove(0, 1)) {
                offsetY++;
                TimerReset(); //タイマーリセット
            }
            break;
        case " ": //space
            let newTet = CreateRotateTet();
            if (CanMove(0, 0, newTet)) {
                tet = newTet;
            }
    }
    Draw();
};

//動きが止まったテトをボード座標に書き写す
const FixTet = () => {
    for (let y = 0; y < tet.length; y++) {
        for (let x = 0; x < tet.length; x++) {
            if (tet[y][x]) {
                //ボードに書き込む
                board[offsetY + y][offsetX + x] = tet_idx;
            }
        }
    }
};

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

//繰り返し行われる落下処理
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

        //次のテトを出せなかったらGameOver
        if (!CanMove(0, 0)) {
            isGameOver = true;
            clearInterval(timerId);
            timerId = NaN;
        }
    }
    Draw();
};

const InitStartPos = () => {
    offsetX = boardCol / 2 - Math.floor(tet.length / 2);
    offsetY = 0;
};

//初期化処理
const Init = () => {
    //ボード(20*10を0埋め)
    for (let y = 0; y < boardRow; y++) {
        board[y] = [];
        for (let x = 0; x < boardCol; x++) {
            board[y][x] = 0;
        }
    }

    SelectTet(); //テト抽選
    TimerReset(); //タイマーセット
    SetNextTet(); //次のテトセット
    InitStartPos();

    Draw();
};

//１パック分のテト追加
const SelectTet = () => {

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

    //データ確認用
    //$('test').text();
}

//次に落ちてくるテトセット
const SetNextTet = () => {
    //次のデータをセット
    tet_idx = tet_list[0][0];
    tet = tet_list[0][1];

    //データを削除
    tet_list.shift();

    //データが１パック分以下になったら、新しいテトを設定する
    if (tet_list.length <= tet_boxnum) {
        SelectTet();
    }
}

//落ちてくるテトリス予測表示
const ShowNextTets = () => {

}

//テト落下タイマーリセット
const TimerReset = () => {
    clearInterval(timerId);
    timerId = NaN;
    timerId = setInterval(DropTet, speed);
}