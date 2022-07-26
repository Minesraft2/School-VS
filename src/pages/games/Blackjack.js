import React, { useEffect, useRef, useState } from "react";
import './Blackjack.css';
import Nav from "../../Nav";

const MAX_BET = 5000

class Game {
    constructor(bet, refs, setState, setHands) {
        this.setHands = setHands;
        this.setState = setState;
        this.gameOver = false;
        this.bet = bet;
        this.deck = [];
        this.imgDeck = {};
        this.player = {
            hand: [],
            soft: false
        };
        this.dealer = {
            hand: [],
            soft: false
        };
        this.elements = refs;
        this.stand = this.stand.bind(this);
        this.handValue = this.handValue.bind(this);
        this.getResult = this.getResult.bind(this);
        this.newDeck = this.newDeck.bind(this);
        this.shuffleDeck = this.shuffleDeck.bind(this);
        this.dealCards = this.dealCards.bind(this);
        this.getValue = this.getValue.bind(this);
        this.endGame = this.endGame.bind(this);

        this.listeners = {}
    }
    endGame() {
        console.log("END GAME");
        this.gameOver = true;
        this.setState(state => ({ ...state, gameOver: true }));
        this.elements.hitButton.current.disabled = true;
        this.elements.hitButton.current.removeEventListener("click", this.listeners.hit);
        this.elements.standButton.current.disabled = true;
        this.elements.standButton.current.removeEventListener("click", this.listeners.stand);
        this.elements.doubleButton.current.disabled = true;
        this.elements.doubleButton.current.removeEventListener("click", this.listeners.double);
        this.listeners = {};
    }
    startGame() {
        this.elements.hitButton.current.disabled = false;
        this.elements.standButton.current.disabled = false;
        this.elements.doubleButton.current.disabled = false;
        this.elements.doubleButton.current.classList.add("hidden");
        this.listeners = {
            hit: () => {
                var card = this.deck.shift();
                this.player.hand.push(card);
                this.setHands({ player: Object.fromEntries(this.player.hand.map(x => [x, false])), dealer: Object.fromEntries(this.dealer.hand.map((x, i) => [x, i === 0])) });
                if (this.handValue(this.player.hand, true) <= 21 && this.handValue(this.player.hand, this.player.soft) > 21) this.player.soft = true;
                if (this.handValue(this.player.hand, this.player.soft) > 21) this.elements.message.current.innerHTML = this.getResult("BUST");
                this.elements.doubleButton.current.disabled = true;
            },
            stand: this.stand,
            double: () => {
                var card = this.deck.shift();
                this.player.hand.push(card);
                this.setHands({ player: Object.fromEntries(this.player.hand.map(x => [x, false])), dealer: Object.fromEntries(this.dealer.hand.map((x, i) => [x, i === 0])) });
                this.bet *= 2;
                this.elements.doubleButton.current.disabled = true;
                if (this.handValue(this.player.hand, true) <= 21 && this.handValue(this.player.hand, this.player.soft) > 21) this.player.soft = true;
                if (this.handValue(this.player.hand, this.player.soft) > 21) this.elements.message.current.innerHTML = this.getResult("BUST");
                this.stand();
            }
        };
        this.elements.hitButton.current.addEventListener("click", this.listeners.hit);
        this.elements.standButton.current.addEventListener("click", this.listeners.stand);
        this.elements.doubleButton.current.addEventListener("click", this.listeners.double);

        this.elements.message.current.innerHTML = "<br>";
        this.elements.result.current.innerHTML = "";
        this.newDeck();
        this.deck.forEach(card => {
            let img = document.createElement('img');
            img.src = `./cards/${card}.png`;
            this.imgDeck[card] = img;
        })
        this.shuffleDeck();
        this.dealCards();
        var playerNatural = this.getValue(this.player.hand[0]) + this.getValue(this.player.hand[1]) === 21;
        var dealerNatural = this.getValue(this.dealer.hand[0]) + this.getValue(this.dealer.hand[1]) === 21;
        if (playerNatural) {
            this.setHands({ player: Object.fromEntries(this.player.hand.map(x => [x, false])), dealer: Object.fromEntries(this.dealer.hand.map(x => [x, false])) });
            if (dealerNatural) {
                this.elements.message.current.innerText = "Tie!";
                this.elements.result.current.innerText = `Tie! Keep all bets`;
                return this.endGame();
            }
            this.elements.message.current.innerText = "Blackjack!";
            this.elements.result.current.innerText = `You earned ${Math.floor(this.bet * 1.5)}`;
            return this.endGame();
        }
        if (dealerNatural) {
            this.setHands({ player: Object.fromEntries(this.player.hand.map(x => [x, false])), dealer: Object.fromEntries(this.dealer.hand.map(x => [x, false])) });
            this.elements.message.current.innerText = "Dealer's Natural";
            this.elements.result.current.innerText = `You lost ${this.bet}`;
            return this.endGame();
        }
        if (this.handValue(this.player.hand, this.player.soft) >= 9 && this.handValue(this.player.hand, this.player.soft) <= 11) this.elements.doubleButton.current.classList.remove("hidden");
    }
    getValue(card, soft = false) {
        let value = card.slice(0, -1);
        switch (value) {
            case "2": return 2;
            case "3": return 3;
            case "4": return 4;
            case "5": return 5;
            case "6": return 6;
            case "7": return 7;
            case "8": return 8;
            case "9": return 9;
            case "10": return 10;
            case "J": return 10;
            case "Q": return 10;
            case "K": return 10;
            case "A": return soft ? 1 : 11;
        }
    }
    dealCards() {
        this.player.hand = this.deck.splice(0, 2);
        this.dealer.hand = this.deck.splice(0, 2);
        this.setHands({ player: Object.fromEntries(this.player.hand.map(x => [x, false])), dealer: Object.fromEntries(this.dealer.hand.map((x, i) => [x, i === 0])) });
    }
    shuffleDeck() {
        let currentIndex = this.deck.length, randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [this.deck[currentIndex], this.deck[randomIndex]] = [this.deck[randomIndex], this.deck[currentIndex]];
        }
    }
    newDeck() {
        var values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
        var suits = ["C", "S", "H", "D"];
        var cards = [];
        for (var i = 0; i < values.length; i++)for (var j = 0; j < suits.length; j++) {
            cards.push([values[i], suits[j]])
        }
        this.deck = cards.map(x => x.join(''));
    }
    stand() {
        while (this.handValue(this.dealer.hand, this.dealer.soft) < 17) {
            var card = this.deck.shift();
            this.dealer.hand.push(card);
            this.setHands(cards => {
                cards.dealer[card] = false;
                return cards;
            });
            if (this.handValue(this.dealer.hand, true) < 17 && this.handValue(this.dealer.hand, this.dealer.soft) > 21) this.dealer.soft = true;
        }
        this.elements.message.current.innerHTML = this.getResult();
    }
    handValue(hand, soft) {
        return hand.map(c => this.getValue(c, soft)).reduce((a, b) => a + b)
    }
    getResult(message) {
        this.setHands({ player: Object.fromEntries(this.player.hand.map(x => [x, false])), dealer: Object.fromEntries(this.dealer.hand.map(x => [x, false])) });
        var dealerValue = this.handValue(this.dealer.hand, this.dealer.soft);
        var playerValue = this.handValue(this.player.hand, this.player.soft);
        console.log(dealerValue, playerValue)
        this.elements.hitButton.current.disabled = true;
        this.elements.standButton.current.disabled = true;
        this.elements.doubleButton.current.disabled = true;
        var msg = "LOST";
        if (dealerValue == playerValue) msg = "TIE";
        if (msg != "TIE" && ((playerValue > dealerValue && playerValue <= 21) || dealerValue > 21)) msg = "WIN";
        switch (msg) {
            case "TIE": this.elements.result.current.innerText = `Tie! Keep all bets`; break;
            case "WIN": this.elements.result.current.innerText = `You earned ${this.bet}`; break;
            default: this.elements.result.current.innerText = `You lost ${this.bet}`;
        }
        this.endGame()
        return message || msg;
    }
}
const Blackjack = (props) => {
    var Refs = {
        playerDiv: useRef(),
        dealerDiv: useRef(),
        hitButton: useRef(),
        standButton: useRef(),
        doubleButton: useRef(),
        message: useRef(),
        result: useRef()
    };
    var [state, setState] = useState({
        gameOver: false,
        ingame: false,
        bet: MAX_BET / 2
    });
    var [hands, setHands] = useState({ player: {}, dealer: {} });
    var game;
    return (
        <>
            <div className="blackjackContainer">
                <div style={{ display: state.ingame ? "" : "none" }}>
                    <div className="hands">
                        <div className="dealerHand" ref={Refs.dealerDiv}>
                            {Object.entries(hands.dealer).map(([card, hidden]) => <img key={card} src={hidden ? './cards/back.png' : `./cards/${card}.png`} />)}
                        </div>
                        <span className="message" ref={Refs.message}></span>
                        <div className="playerHand" ref={Refs.playerDiv}>
                            {Object.entries(hands.player).map(([card, hidden]) => <img key={card} src={hidden ? './cards/back.png' : `./cards/${card}.png`} />)}
                        </div>
                    </div>
                    <div className="buttons">
                        <button className="button" id="hit" ref={Refs.hitButton}>Hit</button>
                        <button className="button" id="stand" ref={Refs.standButton}>Stand</button>
                        <button id="double" className="hidden button" ref={Refs.doubleButton}>x2</button>
                    </div>
                    <div><span className="result" ref={Refs.result}></span></div>
                </div>
                {state.ingame ? null : <>
                    <div className="startPage">
                        <span className="gameTitle">Blackjack</span>
                        <button className="bet button" disabled={Math.max(0, state.bet - 5) === 0} onClick={() => setState(state => ({ ...state, bet: Math.max(1, state.bet - 5) }))}>-5</button>
                        <button className="bet button" disabled={Math.max(0, state.bet - 1) === 0} onClick={() => setState(state => ({ ...state, bet: Math.max(1, state.bet - 1) }))}>-1</button>
                        <input type="number" id="bet" min={1} max={MAX_BET} onChange={e => setState(state => {
                            var input = Number(parseInt(e.target.value));
                            return ({ ...state, bet: Math.max(1, Math.min(MAX_BET, input)) })
                        })} value={state.bet}></input>
                        <button className="bet button" disabled={Math.min(MAX_BET, state.bet) === MAX_BET} onClick={() => setState(state => ({ ...state, bet: Math.min(MAX_BET, state.bet + 1) }))}>+1</button>
                        <button className="bet button" disabled={Math.min(MAX_BET, state.bet + 4) === MAX_BET} onClick={() => setState(state => ({ ...state, bet: Math.min(MAX_BET, state.bet + 5) }))}>+5</button>
                        <div style={{ margin: "2rem" }}>
                            <button className="button" id="start" onClick={() => {
                                setState(state => ({ ...state, ingame: true }));
                                setHands({ player: {}, dealer: {} });
                                game = new Game(state.bet, Refs, setState, setHands);
                                game.startGame();
                            }}>Start Game</button>
                        </div>
                    </div>
                </>}
                {state.gameOver ? <div id="gameOver">
                    <button className="button" id="retry" onClick={() => {
                        game = null;
                        setState(s => ({ ...s, ingame: false, gameOver: false }));
                        setHands({ player: {}, dealer: {} });
                    }}>Back</button>
                </div> : null}
            </div>
        </>
    )
}
export default Blackjack;