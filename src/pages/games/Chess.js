import React, { useEffect, useRef, useState } from "react";
import "./Chess.css";
import { Chess } from 'chess.js';
import Draggable from 'react-draggable';

function parseSpace(position) {
    return `${String.fromCharCode("a".charCodeAt(0) + position.x)}${8 - position.y}`;
}

function unParseSpace(space) {
    return { x: space.charCodeAt(0) - "a".charCodeAt(0), y: 8 - Number(space.charAt(1)) }
}

const PIECES = {
    br: "./pieces/br.png",
    bp: "./pieces/bp.png",
    bn: "./pieces/bn.png",
    bb: "./pieces/bb.png",
    bq: "./pieces/bq.png",
    bk: "./pieces/bk.png",
    wr: "./pieces/wr.png",
    wn: "./pieces/wn.png",
    wb: "./pieces/wb.png",
    wq: "./pieces/wq.png",
    wk: "./pieces/wk.png",
    wp: "./pieces/wp.png",
}

const BLACK = "#769656";
const BLACK_HOVER = "#BACA2B";
const WHITE = "#EEEED2";
const WHITE_HOVER = "#F6F669";
const COLORS = [
    "rgb(235, 97, 80)", //Red       0
    "rgb(172, 206, 89)", //Green    1
    "rgb(255, 170, 0)", //Yellow    2
    "rgb(82, 176, 220)" //Blue      3
]
const SIZE = 64;

const Piece = ({ onMouseDown, resetColors, onContextMenu, click, id, position, chess, onTurn, Ref, hoverFunc, changeHover }) => {
    var { startX, startY, zIndex, hovered } = Ref.current || { startX: null, startY: null, zIndex: null, hovered: null };
    var isTurn = id.charAt(0) === chess.turn();
    return (
        <Draggable onMouseDown={onMouseDown} disabled={!isTurn} position={{ x: position.x * SIZE, y: position.y * SIZE }} onStart={function (e) {
            hoverFunc(parseSpace(position));
            resetColors();
            Ref.current = { startX: e.clientX, startY: e.clientY, zIndex: 999 };
        }} onDrag={function (e) {
            const to = parseSpace({ x: position.x - Math.round((startX - e.clientX) / SIZE), y: position.y - Math.round((startY - e.clientY) / SIZE) });
            if (hovered != to) {
                changeHover(to);
                Ref.current.hovered = to;
            }
        }} onStop={function (e) {
            var dx = Math.round((startX - e.clientX) / SIZE);
            var dy = Math.round((startY - e.clientY) / SIZE);
            this.position.x -= dx * SIZE;
            this.position.y -= dy * SIZE;
            delete this.children.props.style.zIndex;
            Ref.current.zIndex = null;

            const from = parseSpace(position);
            const to = parseSpace({ x: position.x - dx, y: position.y - dy });
            const move = chess.moves({ verbose: true }).find((m) => m.from === from && m.to === to);
            if (move) onTurn({ from, to });
            else {
                this.position.x = position.x * SIZE;
                this.position.y = position.y * SIZE;
            }
            changeHover(null);
            startX = startY = null;
        }}>
            <img onClick={() => {
                if (!isTurn) click();
            }} data-space={parseSpace(position)} onContextMenu={onContextMenu} draggable={false} className="pieceImg" data-movable={isTurn} style={{ width: SIZE, height: SIZE, zIndex }} src={PIECES[id]} />
        </Draggable>
    )
}

const Square = ({ move, capture, highlight, hover, row, col }) => {
    return (<div className="square" data-row={col === 0 ? 8 - row : ""} data-col={row === 7 ? String.fromCharCode("a".charCodeAt(0) + col) : ""} style={{ backgroundColor: (col + row) % 2 === 0 ? highlight ? WHITE_HOVER : WHITE : highlight ? BLACK_HOVER : BLACK, color: (col + row) % 2 === 0 ? highlight ? BLACK_HOVER : BLACK : highlight ? WHITE_HOVER : WHITE }}>
        {capture && <div className="capture"></div>}
        {move && <div className="move"></div>}
        {hover && <div className="hover"></div>}
    </div>)
}

const Arrow = ({ to, from, color }) => {
    var colors = [
        "rgba(255, 170, 0, 0.8)", //Yellow    0
        "rgba(159, 207, 63, 0.8)", //Green    1
        "rgba(248, 85, 63, 0.8)", //Red       2
        "rgba(72, 193, 249, 0.8)" //Blue      3
    ]
    var centers = { a1: { x: 6.25, y: 93.75 }, a2: { x: 6.25, y: 81.25 }, a3: { x: 6.25, y: 68.75 }, a4: { x: 6.25, y: 56.25 }, a5: { x: 6.25, y: 43.75 }, a6: { x: 6.25, y: 31.25 }, a7: { x: 6.25, y: 18.75 }, a8: { x: 6.25, y: 6.25 }, b1: { x: 18.75, y: 93.75 }, b2: { x: 18.75, y: 81.25 }, b3: { x: 18.75, y: 68.75 }, b4: { x: 18.75, y: 56.25 }, b5: { x: 18.75, y: 43.75 }, b6: { x: 18.75, y: 31.25 }, b7: { x: 18.75, y: 18.75 }, b8: { x: 18.75, y: 6.25 }, c1: { x: 31.25, y: 93.75 }, c2: { x: 31.25, y: 81.25 }, c3: { x: 31.25, y: 68.75 }, c4: { x: 31.25, y: 56.25 }, c5: { x: 31.25, y: 43.75 }, c6: { x: 31.25, y: 31.25 }, c7: { x: 31.25, y: 18.75 }, c8: { x: 31.25, y: 6.25 }, d1: { x: 43.75, y: 93.75 }, d2: { x: 43.75, y: 81.25 }, d3: { x: 43.75, y: 68.75 }, d4: { x: 43.75, y: 56.25 }, d5: { x: 43.75, y: 43.75 }, d6: { x: 43.75, y: 31.25 }, d7: { x: 43.75, y: 18.75 }, d8: { x: 43.75, y: 6.25 }, e1: { x: 56.25, y: 93.75 }, e2: { x: 56.25, y: 81.25 }, e3: { x: 56.25, y: 68.75 }, e4: { x: 56.25, y: 56.25 }, e5: { x: 56.25, y: 43.75 }, e6: { x: 56.25, y: 31.25 }, e7: { x: 56.25, y: 18.75 }, e8: { x: 56.25, y: 6.25 }, f1: { x: 68.75, y: 93.75 }, f2: { x: 68.75, y: 81.25 }, f3: { x: 68.75, y: 68.75 }, f4: { x: 68.75, y: 56.25 }, f5: { x: 68.75, y: 43.75 }, f6: { x: 68.75, y: 31.25 }, f7: { x: 68.75, y: 18.75 }, f8: { x: 68.75, y: 6.25 }, g1: { x: 81.25, y: 93.75 }, g2: { x: 81.25, y: 81.25 }, g3: { x: 81.25, y: 68.75 }, g4: { x: 81.25, y: 56.25 }, g5: { x: 81.25, y: 43.75 }, g6: { x: 81.25, y: 31.25 }, g7: { x: 81.25, y: 18.75 }, g8: { x: 81.25, y: 6.25 }, h1: { x: 93.75, y: 93.75 }, h2: { x: 93.75, y: 81.25 }, h3: { x: 93.75, y: 68.75 }, h4: { x: 93.75, y: 56.25 }, h5: { x: 93.75, y: 43.75 }, h6: { x: 93.75, y: 31.25 }, h7: { x: 93.75, y: 18.75 }, h8: { x: 93.75, y: 6.25 } };
    var { x: fromX, y: fromY } = centers[from];
    var { x: toX, y: toY } = centers[to];
    const slope = Number(((fromY - toY) / (fromX - toX)).toFixed(1));
    const distance = Math.hypot(fromX - toX, fromY - toY);
    var { WIDTH, HEAD_HEIGHT, TAIL_PADDING, HEAD_WIDTH } = {
        WIDTH: 2.75,
        HEAD_HEIGHT: 4.5,
        TAIL_PADDING: 4.5,
        HEAD_WIDTH: 6.5
    }
    var width = WIDTH / 2;
    var headWidth = HEAD_WIDTH / 2;
    if (distance == 27.95084971874737 && [2, .5, -.5, -2].includes(slope)) {
        let rotation = 0;
        switch (slope) {
            case 2: rotation = fromX > toX ? 180 : 0; break;
            case -2: rotation = fromX > toX ? 0 : 180; break;
            case .5: case -.5: rotation = fromX > toX ? 90 : 270; break;
        }
        const points = `${fromX - width} ${fromY + TAIL_PADDING},\n    ${fromX - width} ${fromY + 25 + width},\n    ${fromX + 12.5 - HEAD_HEIGHT} ${fromY + 25 + width},\n    ${fromX + 12.5 - HEAD_HEIGHT} ${fromY + 25 + headWidth},\n    ${fromX + 12.5} ${fromY + 25},\n    ${fromX + 12.5 - HEAD_HEIGHT} ${fromY + 25 - headWidth},\n    ${fromX + 12.5 - HEAD_HEIGHT} ${fromY + 25 - width},\n    ${fromX + width} ${fromY + 25 - width},\n    ${fromX + width} ${fromY + TAIL_PADDING}\n  `.trim()
        return (<polygon transform={`rotate(${rotation} ${fromX} ${fromY})${[.5, -2].includes(slope) ? ` scale(-1, 1) translate(-${2 * fromX}, 0)` : ''}`} points={points} fill={colors[color]}></polygon>)
    };
    const rotation = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;
    const points = `\n    ${fromX - width} ${fromY + TAIL_PADDING},\n    ${fromX - width} ${fromY + distance - HEAD_HEIGHT},\n    ${fromX - headWidth} ${fromY + distance - HEAD_HEIGHT},\n    ${fromX} ${fromY + distance},\n    ${fromX + headWidth} ${fromY + distance - HEAD_HEIGHT},\n    ${fromX + width} ${fromY + distance - HEAD_HEIGHT},\n    ${fromX + width} ${fromY + TAIL_PADDING}\n  `.trim()
    return (<polygon transform={`rotate(${rotation - 90} ${fromX} ${fromY})`} points={points} fill={colors[color]}></polygon>)
}

const Board = () => {
    const chess = useConst(() => new Chess());
    const [state, setState] = useState({
        player: "w",
        board: chess.board(),
        selectedSquare: '',
        lastMove: null
    });
    const refs = Object.fromEntries(new Array(8).fill(0).flatMap((_, i) => new Array(8).fill(i).map((i, j) => [i * 10 + j, useRef()])));
    const [hovered, setHovered] = useState(null);
    const [coloredSquares, setColoredSquares] = useState({});
    const [arrows, setArrows] = useState({});
    useEffect(() => {
        window.chess = chess;
    }, [])
    const movePiece = ({ from, to, promotion }) => {
        chess.move({ from, to, promotion });
        console.log(`Moved from ${from} to square ${to}${promotion ? ` promoting to ${promotion}` : ''}`, chess.turn(), state.player);
        setState({
            player: chess.turn() === "w" ? "b" : "w",
            board: chess.board(),
            selectedSquare: '',
            lastMove: { from, to, promotion }
        });
    }
    const handleClick = (space) => {
        const move = chess.moves({ verbose: true }).filter(m => m.from === state.selectedSquare && (m.flags !== 'e' && m.flags !== 'c')).map(x => x.to).includes(space);
        const capture = chess.moves({ verbose: true }).filter(m => m.from === state.selectedSquare && (m.flags == 'e' || m.flags == 'c')).map(x => x.to).includes(space);
        setColoredSquares({});
        setArrows({});
        if (!state.selectedSquare) return;
        if (move || capture) movePiece({ from: state.selectedSquare, to: space });
        else setState({ ...state, selectedSquare: null });
    }
    const handleRightClick = (space, type) => {
        setColoredSquares({ ...coloredSquares, [space]: coloredSquares[space] !== type ? type : null });
        setState({ ...state, selectedSquare: null })
    }
    const arrowStart = useRef();
    const handleArrowStart = (e) => e.button === 2 && (arrowStart.current = e.target.getAttribute('data-space'));
    return (
        <div className="board" onContextMenu={(e) => (e.preventDefault(), false)}>
            <div className="squares">
                {
                    new Array(8).fill(0).map((_, row) => new Array(8).fill(0).map((__, col) => {
                        const space = parseSpace({ x: col, y: row });
                        const move = chess.moves({ verbose: true }).filter(m => m.from === state.selectedSquare && (m.flags !== 'e' && m.flags !== 'c')).map(x => x.to).includes(space);
                        const capture = chess.moves({ verbose: true }).filter(m => m.from === state.selectedSquare && (m.flags == 'e' || m.flags == 'c')).map(x => x.to).includes(space);
                        return (
                            <Square
                                hover={hovered === space} move={move} capture={capture} highlight={space === state.selectedSquare || Object.values(state.lastMove || {}).includes(space)}
                                key={`${row}${col}`} row={row} col={col} />
                        )
                    }))
                }
            </div>
            <div className="colors">
                {
                    new Array(8).fill(0).map((_, row) => new Array(8).fill(0).map((__, col) => {
                        const space = parseSpace({ x: col, y: row });
                        return (
                            <div
                                key={Math.random()}
                                className="square"
                                data-space={space}
                                style={coloredSquares[space] != null ? { backgroundColor: COLORS[coloredSquares[space]], opacity: 0.8 } : { opacity: 0 }}
                                onClick={e => {
                                    handleClick(space)
                                }}
                                onContextMenu={e => {
                                    e.preventDefault();
                                    if (arrowStart.current == e.target.getAttribute('data-space')) handleRightClick(space, (e.altKey ? 3 : e.ctrlKey ? 2 : e.shiftKey ? 1 : 0));
                                    else {
                                        var spaces = `${arrowStart.current}${e.target.getAttribute('data-space')}`;
                                        var color = (e.altKey ? 3 : e.ctrlKey ? 2 : e.shiftKey ? 1 : 0);
                                        arrowStart.current = null;
                                        setArrows({ ...arrows, [spaces]: arrows[spaces] !== color ? color : null })
                                    }
                                    return false;
                                }}
                                onMouseDown={handleArrowStart}></div>
                        )
                    }))
                }
            </div>
            <div className="pieces">
                {
                    state.board.map((row, i) => row.map((square, j) => square == null ? null : <Piece hoverRef={hovered} Ref={refs[j * 10 + i]} hoverFunc={(selectedSquare) => {
                        setState({ ...state, selectedSquare });
                    }} resetColors={() => (setColoredSquares({}), setArrows({}))} click={() => handleClick(parseSpace({ x: j, y: i }))} onContextMenu={e => {
                        e.preventDefault();
                        if (arrowStart.current == e.target.getAttribute('data-space')) handleRightClick(parseSpace({ x: j, y: i }), (e.altKey ? 3 : e.ctrlKey ? 2 : e.shiftKey ? 1 : 0));
                        else {
                            var spaces = `${arrowStart.current}${e.target.getAttribute('data-space')}`;
                            var color = (e.altKey ? 3 : e.ctrlKey ? 2 : e.shiftKey ? 1 : 0);
                            arrowStart.current = null;
                            setArrows({ ...arrows, [spaces]: arrows[spaces] !== color ? color : null })
                        }
                        return false;
                    }} onMouseDown={handleArrowStart} onTurn={movePiece} changeHover={setHovered} chess={chess} position={{ x: j, y: i }} id={`${square.color}${square.type}`} key={`${j}${i}`} />))
                }
            </div>
            <svg className="arrows" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                {
                    Object.entries(arrows).map(([space, color]) => {
                        return color !== null && <Arrow key={space} from={space.slice(0, 2)} to={space.slice(2)} color={color} />
                    })
                }
            </svg>
        </div>
    );
}

const ChessGame = (props) => {
    return (
        <div className="boardWrapper">
            <Board />
        </div>
    )
}
export default ChessGame;

function useConst(initialValue) {
    const ref = useRef();
    if (ref.current === undefined) ref.current = { value: typeof initialValue === "function" ? initialValue() : initialValue };
    return ref.current.value;
}