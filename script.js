const CELL=50,ROWS=10,COLS=10;

const boardCanvas=document.getElementById("board");
const piecesCanvas=document.getElementById("pieces");
const btx=boardCanvas.getContext("2d");
const ptx=piecesCanvas.getContext("2d");

let board=Array.from({length:ROWS},()=>Array(COLS).fill(0));
let score=0;

const COLORS=["#222","#f85","#3cf","#9f4","#ffdf4d"];
const SHAPES=[
[[1,1],[1,1]],
[[1,1,1]],
[[1],[1],[1]],
[[1,1,1,1]],
[[1,0],[1,1]],
[[0,1],[1,1]]
];

let activePieces=[];
let dragging=null;
let dragOffset={x:0,y:0};
let originalPos={x:0,y:0};

function drawBoard(){
btx.clearRect(0,0,500,500);
for(let r=0;r<ROWS;r++){
for(let c=0;c<COLS;c++){
btx.fillStyle=board[r][c]?COLORS[board[r][c]]:"#222";
btx.fillRect(c*CELL+1,r*CELL+1,CELL-2,CELL-2);
}}
}

function drawPieces(){
ptx.clearRect(0,0,500,180);
activePieces.forEach(p=>{
ptx.fillStyle=COLORS[p.color];
for(let r=0;r<p.shape.length;r++){
for(let c=0;c<p.shape[0].length;c++){
if(p.shape[r][c]){
ptx.fillRect(p.x+c*CELL,p.y+r*CELL,CELL-2,CELL-2);
}}}});
}

function newPieces(){
activePieces=[];
for(let i=0;i<3;i++){
let s=SHAPES[Math.floor(Math.random()*SHAPES.length)];
activePieces.push({
shape:JSON.parse(JSON.stringify(s)),
x:80+i*150,
y:40,
color:Math.floor(Math.random()*4)+1
});
}
drawPieces();
}

function pieceHit(p,mx,my){
for(let r=0;r<p.shape.length;r++){
for(let c=0;c<p.shape[0].length;c++){
if(p.shape[r][c]){
let px=p.x+c*CELL;
let py=p.y+r*CELL;
if(mx>=px&&mx<=px+CELL&&my>=py&&my<=py+CELL) return true;
}}}
return false;
}

function canPlace(p,br,bc){
for(let r=0;r<p.shape.length;r++){
for(let c=0;c<p.shape[0].length;c++){
if(p.shape[r][c]){
let rr=br+r,cc=bc+c;
if(rr<0||cc<0||rr>=ROWS||cc>=COLS) return false;
if(board[rr][cc]!==0) return false;
}}}
return true;
}

function lockPiece(p,br,bc){
for(let r=0;r<p.shape.length;r++){
for(let c=0;c<p.shape[0].length;c++){
if(p.shape[r][c]) board[br+r][bc+c]=p.color;
}}
}

function clearLines(){
let cleared=0;
for(let r=0;r<ROWS;r++){
if(board[r].every(x=>x!==0)){board[r].fill(0);cleared++;}
}
for(let c=0;c<COLS;c++){
if(board.every(row=>row[c]!==0)){
for(let r=0;r<ROWS;r++) board[r][c]=0;
cleared++;
}}
if(cleared){
score+=cleared*10;
document.getElementById("score").textContent=score;
}
}

function hasValidMove(){
for(let p of activePieces){
for(let r=0;r<ROWS;r++){
for(let c=0;c<COLS;c++){
if(canPlace(p,r,c)) return true;
}}}
return false;
}

function checkGameState(){
if(activePieces.length===0){
newPieces();
return;
}
if(!hasValidMove()){
newPieces();
}
}

piecesCanvas.addEventListener("mousedown",e=>{
const rect=piecesCanvas.getBoundingClientRect();
const mx=e.clientX-rect.left;
const my=e.clientY-rect.top;
for(let p of activePieces){
if(pieceHit(p,mx,my)){
dragging=p;
dragOffset.x=mx-p.x;
dragOffset.y=my-p.y;
originalPos={x:p.x,y:p.y};
}}
});

document.addEventListener("mousemove",e=>{
if(!dragging) return;
const rect=piecesCanvas.getBoundingClientRect();
dragging.x=e.clientX-rect.left-dragOffset.x;
dragging.y=e.clientY-rect.top-dragOffset.y;
drawBoard();
drawPieces();
});

document.addEventListener("mouseup",e=>{
if(!dragging) return;

const brect=boardCanvas.getBoundingClientRect();
const bx=e.clientX-brect.left;
const by=e.clientY-brect.top;

let br=Math.floor(by/CELL);
let bc=Math.floor(bx/CELL);

if(br>=0&&bc>=0&&br<ROWS&&bc<COLS&&canPlace(dragging,br,bc)){
lockPiece(dragging,br,bc);
activePieces=activePieces.filter(p=>p!==dragging);
clearLines();
drawBoard();
}

dragging.x=originalPos.x;
dragging.y=originalPos.y;
dragging=null;

checkGameState();
drawPieces();
});

newPieces();
drawBoard();
drawPieces();