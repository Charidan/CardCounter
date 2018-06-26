import React, {Component} from 'react';
import './App.css';
import Util from './util.js';
import { GameCreationForm, GameRow } from './gameEntry.js';
import axios from 'axios';

class App extends Component
{
    constructor()
    {
        super();
        this.state = {
            gamelist : [],
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
                    <div className="mainsection">
                        <div>
                            <h3>GAMES</h3>
                            <table className="bordered">
                                <thead>
                                <tr>
                                    <th>id</th>
                                    <th>Name</th>
                                </tr>
                                </thead>
                                <tbody>
                                    {this.state.gamelist.map((game, index) => <GameRow name={game.name} id={game.id} key={index} />)}
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <GameCreationForm app={this}/>
                        </div>
                    </div>
                    <br/>
                </div>
            </div>
        );
    }
}

export default App;
