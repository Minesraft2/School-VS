import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import io from "socket.io-client";
import './Uno.css';

const CARDS = ["w", "wdraw4", "w", "wdraw4", "w", "wdraw4", "w", "wdraw4", "r0", "r1", "r1", "r2", "r2", "r3", "r3", "r4", "r4", "r5", "r5", "r6", "r6", "r7", "r7", "r8", "r8", "r9", "r9", "rskip", "rskip", "rreverse", "rreverse", "rdraw2", "rdraw2", "y0", "y1", "y1", "y2", "y2", "y3", "y3", "y4", "y4", "y5", "y5", "y6", "y6", "y7", "y7", "y8", "y8", "y9", "y9", "yskip", "yskip", "yreverse", "yreverse", "ydraw2", "ydraw2", "g0", "g1", "g1", "g2", "g2", "g3", "g3", "g4", "g4", "g5", "g5", "g6", "g6", "g7", "g7", "g8", "g8", "g9", "g9", "gskip", "gskip", "greverse", "greverse", "gdraw2", "gdraw2", "b0", "b1", "b1", "b2", "b2", "b3", "b3", "b4", "b4", "b5", "b5", "b6", "b6", "b7", "b7", "b8", "b8", "b9", "b9", "bskip", "bskip", "breverse", "breverse", "bdraw2", "bdraw2"];
let socket
//const ENDPOINT = 'http://localhost:5000';
const ENDPOINT = 'https://gamit-backend.herokuapp.com/'

const Game = (props) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [room, setRoom] = useState(searchParams.get('room') || searchParams.get('host'));
    const [roomFull, setRoomFull] = useState(false);
    const [users, setUser] = useState([]);
    const [currentUser, setCurrentUser] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [host, setHost] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [eventMessage, setEventMessage] = useState('');
    const [roomLoaded, setRoomLoaded] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        if (!room) navigate('/games/uno');
        const connectionOptions = {
            "forceNew": true,
            "reconnectionAttempts": "Infinity",
            "timeout": 10000,
            "transports": ["websocket"]
        }
        socket = io.connect(ENDPOINT, connectionOptions);
        socket.emit(searchParams.has('host') ? 'createRoom' : 'join', { room }, err => {
            if (err) navigate('/games/uno?error=' + encodeURI(err));
            else setRoomLoaded(true);
        });
        return function cleanup() {
            socket.emit('leave');
            socket.off();
        }
    }, []);

    const [gameOver, setGameOver] = useState(true);
    const [winner, setWinner] = useState("");
    const [userDecks, setUserDecks] = useState([]);
    const [turn, setTurn] = useState(-1);
    const [playedCards, setPlayedCards] = useState([]);
    const [drawCardPile, setDrawCardPile] = useState([]);
    const [currentColor, setCurrentColor] = useState("");
    const [currentNumber, setCurrentNumber] = useState("");
    const [deck, setDeck] = useState([...CARDS]);
    const [cardsToDraw, setCardsToDraw] = useState(0);
    const [unoCalled, setUnoCalled] = useState(false);
    const [isChatHidden, setChatHidden] = useState(true);
    const [reversed, setReversed] = useState(false);

    function shuffleDeck(arr) {
        let currentIndex = arr.length, randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
        }
        return arr;
    }
    function parseCard(card) {
        const colors = {
            r: "Red",
            y: "Yellow",
            g: "Green",
            b: "Blue",
            w: "Wild"
        };
        const numbers = {
            skip: " Skip",
            reverse: " Reverse",
            draw2: " Draw 2",
            draw4: " Draw 4",
            "": " Card"
        };
        console.log(card.charAt(0), card.slice(1))
        return colors[card.charAt(0)] + (Object.keys(numbers).includes(card.slice(1)) ? numbers[card.slice(1)] : ` ${card.slice(1)}`)
    }
    useEffect(() => {
        socket.on('startGame', ({ users }) => {
            var cards = shuffleDeck([...CARDS]);
            var decks = [];
            for (var i = 0; i < users.length; i++) decks.push(cards.splice(0, 7));
            var startingIndex;
            while (true) {
                startingIndex = Math.floor(Math.random() * cards.length);
                if (cards[startingIndex].length == 2) break;
                else continue;
            }
            const playedCardsPile = cards.splice(startingIndex, 1);
            socket.emit('initGameState', {
                gameOver: false,
                winner: "",
                turn: 0,
                decks,
                currentColor: playedCardsPile[0].charAt(0),
                currentNumber: playedCardsPile[0].slice(1),
                playedCards: [...playedCardsPile],
                drawCardPile: cards,
                cardsToDraw: 0,
                unoCalled: false,
                reversed: false
            });
        });
    }, []);
    useEffect(() => {
        socket.on('initGameState', ({ gameOver, turn, decks, currentColor, currentNumber, playedCards, drawCardPile, cardsToDraw, unoCalled, reversed, winner }) => {
            setGameOver(gameOver);
            setWinner(winner);
            setTurn(turn);
            setUserDecks(decks);
            setCurrentColor(currentColor);
            setCurrentNumber(currentNumber);
            setPlayedCards(playedCards);
            setDrawCardPile(drawCardPile);
            setCardsToDraw(cardsToDraw);
            setUnoCalled(unoCalled);
            setReversed(reversed);
        });
        socket.on('updateGameState', ({ gameOver, turn, decks, currentColor, currentNumber, playedCards, drawCardPile, cardsToDraw, unoCalled, winner, reversed }) => {
            gameOver != null && setGameOver(gameOver);
            if (winner != null && winner != "") {
                setGameOver(true);
                setWinner(winner);
            }
            turn != null && setTurn(turn);
            decks != null && setUserDecks(decks);
            currentColor != null && setCurrentColor(currentColor);
            currentNumber != null && setCurrentNumber(currentNumber);
            playedCards != null && setPlayedCards(playedCards);
            drawCardPile != null && setDrawCardPile(drawCardPile);
            cardsToDraw != null && setCardsToDraw(cardsToDraw);
            unoCalled != null && setUnoCalled(unoCalled);
            reversed != null && setReversed(reversed);
        });
        socket.on('roomData', ({ users }) => {
            setUser(users);
        });
        socket.on('currentUserData', ({ player, host }) => {
            setCurrentUser(player);
            setHost(host);
        });
        socket.on('message', message => {
            setMessages(messages => [...messages, message]);
            const chatBody = document.querySelector('.chat-body');
            chatBody.scrollTop = chatBody.scrollHeight;
        });
    }, []);

    const toggleChatBox = () => setChatHidden(!isChatHidden);
    const sendMessage = (e) => {
        e.preventDefault();
        if (message) socket.emit('sendMessage', { message }, () => setMessage(''));
    }
    const canPlayCard = (card) => (card.charAt(0) === currentColor || card.charAt(0) == "w" || currentColor == "w") || card.slice(1) == currentNumber;
    const calcNextTurn = (skip, rever = reversed) => {
        var curTurn = turn;
        var curTurn = rever ? (curTurn == 0 ? users.length : curTurn) - 1 : (curTurn + 1) % users.length;
        if (skip) curTurn = rever ? (curTurn == 0 ? users.length : curTurn) - 1 : (curTurn + 1) % users.length;
        return curTurn;
    }
    const checkWin = (arr) => arr.length == 1;
    const checkWinner = (arr, player) => checkWin(arr) && player.toString();
    const onCardPlayed = (playedCard) => {
        const playedNumber = playedCard.slice(1);
        const playedColor = playedCard.charAt(0);
        //if (!canPlayCard(playedCard)) return alert('invalid move');
        if (currentUser !== turn || !canPlayCard(playedCard)) return;
        var playerDeck = userDecks[turn];
        const removeIndex = playerDeck.indexOf(playedCard);
        var updatedPlayerDeck = playerDeck.filter((card, i) => i !== removeIndex);
        //number card
        if (playedCard.length == 2) {
            if (playerDeck.length == 2 && !unoCalled) {
                alert('You forgot to press UNO! 2 penalty cards drawn.');
                const copiedDrawPile = [...drawCardPile];
                const drawnCards = copiedDrawPile.splice(0, 2);
                updatedPlayerDeck = [...updatedPlayerDeck, ...drawnCards];
                socket.emit('updateGameState', {
                    turn: calcNextTurn(),
                    playedCards: playedCards.concat(playedCard),
                    decks: userDecks.map((deck, i) => i == turn ? updatedPlayerDeck : deck),
                    currentColor: playedColor,
                    currentNumber: playedNumber,
                    drawCardPile: copiedDrawPile,
                    unoCalled: false
                });
            } else socket.emit('updateGameState', {
                winner: checkWinner(playerDeck, turn),
                turn: calcNextTurn(),
                playedCards: playedCards.concat(playedCard),
                decks: userDecks.map((deck, i) => i == turn ? updatedPlayerDeck : deck),
                currentColor: playedColor,
                currentNumber: playedNumber,
                unoCalled: false
            })
        } else {
            switch (playedNumber) {
                case "skip": {
                    if (playerDeck.length == 2 && !unoCalled) {
                        alert('You forgot to press UNO! 2 penalty cards drawn.');
                        const copiedDrawPile = [...drawCardPile];
                        const drawnCards = copiedDrawPile.splice(0, 2);
                        updatedPlayerDeck = [...updatedPlayerDeck, ...drawnCards];
                        socket.emit('updateGameState', {
                            turn: calcNextTurn(true),
                            playedCards: playedCards.concat(playedCard),
                            decks: userDecks.map((deck, i) => i == turn ? updatedPlayerDeck : deck),
                            currentColor: playedColor,
                            currentNumber: playedNumber,
                            drawCardPile: copiedDrawPile,
                            unoCalled: false
                        });
                    } else socket.emit('updateGameState', {
                        winner: checkWinner(playerDeck, turn),
                        turn: calcNextTurn(true),
                        playedCards: playedCards.concat(playedCard),
                        decks: userDecks.map((deck, i) => i == turn ? updatedPlayerDeck : deck),
                        currentColor: playedColor,
                        currentNumber: playedNumber,
                        unoCalled: false
                    });
                    break;
                }
                case "reverse": {
                    var data = {
                        reversed: !reversed,
                        winner: checkWinner(playerDeck, turn),
                        turn: calcNextTurn(null, !reversed),
                        playedCards: playedCards.concat(playedCard),
                        decks: userDecks.map((deck, i) => i == turn ? updatedPlayerDeck : deck),
                        currentColor: playedColor,
                        currentNumber: playedNumber,
                        unoCalled: false
                    }
                    if (playerDeck.length == 2 && !unoCalled) {
                        alert('You forgot to press UNO! 2 penalty cards drawn.');
                        const copiedDrawPile = [...drawCardPile];
                        const drawnCards = copiedDrawPile.splice(0, 2);
                        updatedPlayerDeck = [...updatedPlayerDeck, ...drawnCards];
                        socket.emit('updateGameState', {
                            reversed: !reversed,
                            turn: calcNextTurn(null, !reversed),
                            playedCards: playedCards.concat(playedCard),
                            decks: userDecks.map((deck, i) => i == turn ? updatedPlayerDeck : deck),
                            currentColor: playedColor,
                            currentNumber: playedNumber,
                            drawCardPile: copiedDrawPile,
                            unoCalled: false
                        });
                    } else socket.emit('updateGameState', data);
                    console.log(data);
                    break;
                }
                case "draw2": {
                    var target = calcNextTurn();
                    let copiedDrawPile = [...drawCardPile];
                    const draw2cards = copiedDrawPile.splice(0, 2);
                    var updatedTargetDeck = [...userDecks[target], ...draw2cards];
                    if (playerDeck.length == 2 && !unoCalled) {
                        alert('You forgot to press UNO! 2 penalty cards drawn.');
                        const drawnCards = copiedDrawPile.splice(0, 2);
                        updatedPlayerDeck = [...updatedPlayerDeck, ...drawnCards];
                        socket.emit('updateGameState', {
                            turn: calcNextTurn(true),
                            playedCards: playedCards.concat(playedCard),
                            decks: userDecks.map((deck, i) => i == turn ? updatedPlayerDeck : i == target ? updatedTargetDeck : deck),
                            currentColor: playedColor,
                            currentNumber: playedNumber,
                            drawCardPile: copiedDrawPile,
                            unoCalled: false
                        });
                    } else socket.emit('updateGameState', {
                        winner: checkWinner(playerDeck, turn),
                        turn: calcNextTurn(true),
                        playedCards: playedCards.concat(playedCard),
                        decks: userDecks.map((deck, i) => i == turn ? updatedPlayerDeck : i == target ? updatedTargetDeck : deck),
                        currentColor: playedColor,
                        currentNumber: playedNumber,
                        drawCardPile: copiedDrawPile,
                        unoCalled: false
                    });
                    break;
                }
                case "draw4": {
                    console.log('draw 4 played');
                    var target = calcNextTurn();
                    const copiedDrawPile = [...drawCardPile];
                    const draw4cards = copiedDrawPile.splice(0, 4);
                    var updatedTargetDeck = [...userDecks[target], ...draw4cards];
                    var newColor;
                    while (!"rygb".split('').includes(newColor)) newColor = prompt('Enter first letter of new color (R/G/B/Y)').toLowerCase();
                    if (playerDeck.length == 2 && !unoCalled) {
                        alert('You forgot to press UNO! 2 penalty cards drawn.');
                        const drawnCards = copiedDrawPile.splice(0, 2);
                        updatedPlayerDeck = [...updatedPlayerDeck, ...drawnCards];
                        socket.emit('updateGameState', {
                            turn: calcNextTurn(true),
                            playedCards: playedCards.concat(playedCard),
                            decks: userDecks.map((deck, i) => i == turn ? updatedPlayerDeck : i == target ? updatedTargetDeck : deck),
                            currentColor: newColor,
                            currentNumber: playedNumber,
                            drawCardPile: copiedDrawPile,
                            unoCalled: false
                        });
                    } else socket.emit('updateGameState', {
                        winner: checkWinner(playerDeck, turn),
                        turn: calcNextTurn(true),
                        playedCards: playedCards.concat(playedCard),
                        decks: userDecks.map((deck, i) => i == turn ? updatedPlayerDeck : i == target ? updatedTargetDeck : deck),
                        currentColor: newColor,
                        currentNumber: playedNumber,
                        drawCardPile: copiedDrawPile,
                        unoCalled: false
                    });
                    break;
                }
                default: {
                    console.log("wild played")
                    var newColor;
                    while (!"rygb".split('').includes(newColor)) newColor = prompt('Enter first letter of new color (R/G/B/Y)').toLowerCase();
                    if (playerDeck.length == 2 && !unoCalled) {
                        alert('You forgot to press UNO! 2 penalty cards drawn.');
                        const copiedDrawPile = [...drawCardPile];
                        const drawnCards = copiedDrawPile.splice(0, 2);
                        updatedPlayerDeck = [...updatedPlayerDeck, ...drawnCards];
                        socket.emit('updateGameState', {
                            turn: calcNextTurn(),
                            playedCards: playedCards.concat(playedCard),
                            decks: userDecks.map((deck, i) => i == turn ? updatedPlayerDeck : deck),
                            currentColor: newColor,
                            currentNumber: playedNumber,
                            drawCardPile: copiedDrawPile,
                            unoCalled: false
                        });
                    } else socket.emit('updateGameState', {
                        winner: checkWinner(playerDeck, turn),
                        turn: calcNextTurn(),
                        playedCards: playedCards.concat(playedCard),
                        decks: userDecks.map((deck, i) => i == turn ? updatedPlayerDeck : deck),
                        currentColor: newColor,
                        currentNumber: playedNumber,
                        unoCalled: false
                    });
                }
            }
        }
        /* 
            check turn
            check if card can be played
            switch through card cases
                case 1: number card
                    move card from player's to playedCards
                    update currentCard
                    next turn
                case 2: skip card
                    move card from player's to playedCards
                    update currentCard
                    update turn twice to skip next player
                case 3: draw 2 
                    move card from player's to playedCards
                    update currentCard
                    move 2 cards from drawCardPile to player's deck
                    update turn twice to skip next player
                case 4: wild card
                    move card from player's to playedCards
                    ask user for new color and set currentColor
                    update currentCard
                case 5: wild draw 4
                    move card from player's to playedCards
                    ask user for new color and set currentColor
                    update currentCard
                    move 4 cards from drawCardPile to player's deck
                    skip next player
            if played card is last in their deck set inGame to false and set winner to player

        */
    }
    const onDrawCard = () => {


        /* const copiedDrawPile = [...drawCardPile];
        var drawnCards = [];
        drawLoop: for (;;) {
            const drawnCard = copiedDrawPile.shift();
            const drawnNumber = drawnCard.slice(1);
            let drawnColor = drawnCard.charAt(0);
            if (canPlayCard(drawnCard)) {
                if(confirm(`You drew a ${drawnCard}. Would you like to play it?`)) {
                    if (drawnNumber === '' || drawnNumber === "draw4") {
                        drawnColor = null;
                        while (!"rygb".split('').includes(drawnColor)) drawnColor = prompt('Enter first letter of new color (R/G/B/Y)').toLowerCase();
                    }
                    socket.emit('updateGameState', {
                        turn: calcNextTurn((drawnNumber === "skip" || drawnNumber === "draw2" || drawnNumber === "draw4"), (drawnNumber === "reverse" ? !reversed : null)),
                        decks: drawnNumber === "draw2" ? userDecks.map((deck, player) => player == calcNextTurn() ? [...deck, ...copiedDrawPile.splice(0, 2)] : deck) : drawnNumber === "draw4" ? userDecks.map((deck, player) => player == calcNextTurn() ? [...deck, ...copiedDrawPile.splice(0, 4)] : deck) : null,
                        playedCards: playedCards.concat(drawnCard),
                        currentColor: drawnColor,
                        currentNumber: drawnNumber,
                        drawCardPile: copiedDrawPile,
                        reversed: drawnNumber === "reverse" ? !reversed : null
                    });
                } else {
                    drawnCards.push(drawnCard);
                    socket.emit('updateGameState', {
                        turn: calcNextTurn(),
                        drawCardPile: copiedDrawPile,
                        decks: userDecks.map((deck, i) => i === turn ? deck.concat(drawnCards) : deck)
                    });
                }
                break drawLoop;
            }
        } */

        const copiedPlayedCards = [...playedCards];
        const copiedDrawPile = drawCardPile.length == 0 ? [...shuffleDeck(copiedPlayedCards.splice(0, copiedPlayedCards.length - 1))] : [...drawCardPile];
        const drawnCard = copiedDrawPile.splice(0, 1)[0];
        var drawnColor = drawnCard.charAt(0);
        const drawnNumber = drawnCard.slice(1);
        /* if (canPlayCard(drawnCard)) {
            if (confirm(`You drew a ${drawnCard}. Would you like to play it?`)) {
                if (drawnNumber === '' || drawnNumber === "draw4") {
                    drawnColor = null;
                    while (!"rygb".split('').includes(drawnColor)) drawnColor = prompt('Enter first letter of new color (R/G/B/Y)').toLowerCase();
                }
                socket.emit('updateGameState', {
                    turn: calcNextTurn((drawnNumber === "skip" || drawnNumber === "draw2" || drawnNumber === "draw4"), (drawnNumber === "reverse" ? !reversed : null)),
                    decks: drawnNumber === "draw2" ? userDecks.map((deck, player) => player == calcNextTurn() ? [...deck, ...copiedDrawPile.splice(0, 2)] : deck) : drawnNumber === "draw4" ? userDecks.map((deck, player) => player == calcNextTurn() ? [...deck, ...copiedDrawPile.splice(0, 4)] : deck) : null,
                    playedCards: copiedPlayedCards.concat(drawnCard),
                    currentColor: drawnColor,
                    currentNumber: drawnNumber,
                    drawCardPile: copiedDrawPile,
                    reversed: drawnNumber === "reverse" ? !reversed : null
                });
            } else socket.emit('updateGameState', {
                turn: calcNextTurn(),
                drawCardPile: copiedDrawPile,
                playedCards: copiedPlayedCards,
                decks: userDecks.map((deck, i) => i === turn ? deck.concat(drawnCard) : deck)
            });
        } else */ socket.emit('updateGameState', {
            drawCardPile: copiedDrawPile,
            playedCards: copiedPlayedCards,
            decks: userDecks.map((deck, i) => i === turn ? deck.concat(drawnCard) : deck)
        });
        setEventMessage(`You drew a ${parseCard(drawnCard)}`);
        /*
            take 1 card from drawCardPle
            check playable
                if playable
                    check keep or play
                    if keep
                        add drawn_card to player's deck
                        next player
                    else
                        execute onCardPlayed(drawn_card)
                else
                    add drawn_card to player's deck
                    repeat onDrawCard until card is playable
        */
    }
    const numberSort = (p, c) => {
        var numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "skip", "reverse", "draw2", "", "draw4"];
        var prevNumber = p.slice(1);
        var curNumber = c.slice(1);
        return numbers.indexOf(prevNumber) - numbers.indexOf(curNumber)
    }
    const colorSort = (p, c) => {
        var colors = ["r", "y", "g", "b", "w"];
        var prevColor = p.charAt(0);
        var curColor = c.charAt(0);
        return colors.indexOf(prevColor) - colors.indexOf(curColor)
    }
    var debug = false;
    return roomLoaded && (
        <>
            {debug && <div>
                game over: {JSON.stringify(gameOver, null, 4)}<br />
                winner: {JSON.stringify(winner, null, 4)}<br />
                userDecks: {JSON.stringify(userDecks, null, 4)}<br />
                turn: {JSON.stringify(turn, null, 4)}<br />
                played cards: {JSON.stringify(playedCards, null, 4)}<br />
                draw pile: {JSON.stringify(drawCardPile, null, 4)}<br />
                cur color: {JSON.stringify(currentColor, null, 4)}<br />
                cur number: {JSON.stringify(currentNumber, null, 4)}<br />
                cards to draw: {JSON.stringify(cardsToDraw, null, 4)}<br />
                uno called: {JSON.stringify(unoCalled, null, 4)}<br />
                hidden chat: {JSON.stringify(isChatHidden, null, 4)}<br />
                reversed: {JSON.stringify(reversed, null, 4)}<br />
                users: {JSON.stringify(users, null, 4)}<br />
                cur player: {JSON.stringify(currentUser, null, 4)}<br />
                is host: {JSON.stringify(host, null, 4)}<br />
            </div>}
            <div className="unoContainer">
                {errorMessage && <div className="errorContainer">
                    <div className="error">
                        {errorMessage}
                    </div>
                </div>}
                {
                    gameOver ? <div className="lobby">
                        {winner && <>WINNER: Player {Number(winner) + 1}<br /></>}
                        Room Code: {room}<br />
                        Players In Room: {users.length}<br />
                        {host && <>
                            You are the host of this lobby<br />
                            <button onClick={() => {
                                setErrorMessage('');
                                socket.emit('startGame', ({ error, data }) => {
                                    setErrorMessage(error);
                                    console.log(data)
                                });
                            }}>Start Game</button>
                        </>}
                    </div> : <div>
                        <div className="decks">
                            {(() => {
                                switch (users.length - 1) {
                                    case 1: return userDecks.map((deck, player) => {
                                        return (player !== currentUser && <div key={Math.random()}>
                                            <div className="deck opponent only" data-side="top" data-color={currentColor} data-active={player === turn}>
                                                {deck.sort(numberSort).sort(colorSort).map((x, i) => <img className="unoCard" key={Math.random()} src={`./uno_cards/back.png`} alt="card" />)}
                                            </div>
                                        </div>)
                                    });
                                    default: {
                                        return userDecks.map((v, i) => [v, i]).filter((v, i) => i !== currentUser).map(([deck, originalIndex], player) => {
                                            var afterUser = originalIndex == ((currentUser + 1) % users.length);
                                            var beforeUser = originalIndex == ((currentUser == 0 ? users.length : currentUser) - 1);
                                            console.log(beforeUser, afterUser, originalIndex, player);
                                            return (<div key={Math.random()}>
                                                <div className="deck opponent" data-color={currentColor} data-side={afterUser ? "right" : beforeUser ? "left" : "top"} data-active={originalIndex === turn}>
                                                    {deck.sort(numberSort).sort(colorSort).map((x, i) => <img className="unoCard" key={Math.random()} src={`./uno_cards/back.png`} alt="card" />)}
                                                </div>
                                            </div>)
                                        });
                                    }
                                }
                            })()}
                            {/* {userDecks.map((deck, player) => {
                                return (
                                    player !== currentUser && <div key={Math.random()}>
                                        <div className="deck opponent" data-active={player === turn}>{deck.sort(numberSort).sort(colorSort).map((x, i) => <img className="unoCard" key={Math.random()} src={`./uno_cards/back.png`} alt="card" />)}</div>
                                    </div>
                                )
                            })} */}
                        </div>
                        <div className="piles">
                            <div className="pilesContainer">
                                <img className="unoCard drawPile" data-active={turn == currentUser && !userDecks[currentUser].some(canPlayCard)} onClick={() => turn == currentUser && !userDecks[currentUser].some(canPlayCard) && onDrawCard()} src={`./uno_cards/back.png`} alt="drawPile" />
                                {turn == currentUser && !userDecks[currentUser].some(canPlayCard) && <span className="drawText">Draw</span>}
                                <img className="unoCard lastPlayed" src={`./uno_cards/${playedCards[playedCards.length - 1]}.png`} alt="lastCard" />
                            </div>
                        </div>
                        <span className="eventMessage">{eventMessage}</span>
                        <div className="unoUser">
                            {userDecks.map((deck, player) => {
                                return (player === currentUser && <div key={Math.random()} className="deck playerDeck" data-color={currentColor} data-active={player === turn}>
                                    {deck.sort(numberSort).sort(colorSort).map((x, i) => <img className="unoCard" data-color={x.charAt(0)} data-canplay={player === turn && canPlayCard(x)} onClick={() => onCardPlayed(x)} key={Math.random()} src={`./uno_cards/${x}.png`} alt={x} />)}
                                </div>)
                            })}<br />
                            {reversed ? "<---" : " \t"}
                            <button onClick={() => {
                                setUnoCalled(true);
                            }}>UNO</button>
                            {!reversed ? "--->" : '\t'}
                        </div>
                    </div>
                }
            </div>
        </>
    )
}
export default Game;