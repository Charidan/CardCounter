import React, {Component} from 'react';
import './App.css';
import { AllGamesList } from './mainView.js';
import { GameDisplay } from './gameView.js';
import axios from 'axios';
import {DeckDisplay} from "./deckView";

class App extends Component
{
    constructor()
    {
        super();
        this.state = {
            // TODO gamelist should be in mainView.js and deckList should be in gameView.js
            gamelist : [],
            decklist : [],
            activeGame : null,
            activeDeck : null,
            locked: true,
        };
        this.server = axios.create({
            baseURL: 'http://localhost:2837/cardcounter',
            timeout: 10000,
        });

        //bind fiesta
        this.fetchGames         = this.fetchGames.bind(this);
        this.doLock             = this.doLock.bind(this);
        this.doUnlock           = this.doUnlock.bind(this);
        this.openGame           = this.openGame.bind(this);
        this.closeGame          = this.closeGame.bind(this);
        this.openDeck           = this.openDeck.bind(this);
        this.closeDeck          = this.closeDeck.bind(this);

        // get initial gameid list
        this.fetchGames();
    }

    fetchGames()
    {
        this.server.get('/games').then(res =>
        {
            this.setState({gamelist : res.data});
        }).catch(err =>
        {
            console.error(err);
        });
    }

    doLock()
    {
        this.setState({locked: true});
    }

    doUnlock()
    {
        this.setState({locked: false});
    }

    openGame(game, callback)
    {
        this.server.get('/decks/' + game._id).then((res) =>
        {
            this.setState({activeGame: game, decklist: res.data});
            if(callback) callback();
        });
    }

    closeGame()
    {
        this.setState({activeGame: null, decklist: null});
    }

    cloneGame(game)
    {
        this.server.post('/game/clone/', {gameid: game._id}).then((res) =>
        {
            console.log(res.data);
            this.setState((oldState) => {
                oldState.gamelist.push(res.data);
                return { gamelist: oldState.gamelist };
            });
        });
    }

    openDeck(deck, game)
    {
        this.server.get('/deck/' + deck._id).then((res) =>
        {
            let newState = {activeDeck : res.data};
            if(game) newState.activeGame = game;
            this.setState(newState);
        });
    }

    closeDeck()
    {
        this.openGame(this.state.activeGame, this.setState.bind(this, {activeDeck: null}));
    }

    render()
    {
        return (
            <div className="App">
                <div className="App-header">
                    <h2>Card Counter by Richard Nicholson</h2>
                </div>
                <div className="below-header">
                    <div className="modebar">
                        { this.state.locked ?
                          <div><i className="fa fa-lock fa-2x clickable pad-2" onClick={() => this.doUnlock()} /></div> :
                          <div><i className="fa fa-unlock fa-2x clickable pad-2" onClick={() => this.doLock()} /></div>
                        }
                    </div>
                    {this.state.activeGame ?
                        this.state.activeDeck ?
                            <DeckDisplay app={this} game={this.state.activeGame} deck={this.state.activeDeck} /> :
                            <GameDisplay app={this} game={this.state.activeGame} />
                        :
                        <AllGamesList app={this}/>
                    }
                </div>
            </div>
        );
    }
}

export default App;
