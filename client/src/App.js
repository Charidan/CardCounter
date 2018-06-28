import React, {Component} from 'react';
import './App.css';
import Util from './util.js';
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
            gamelist : [],
            activeGame : null,
            activeDeck : null,
            locked: true,
        };
        this.server = axios.create({
            baseURL: 'http://localhost:2837/cardcounter',
            timeout: 10000,
        });
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

    openGame(gameid)
    {
        this.state.activeGame = gameid;
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
