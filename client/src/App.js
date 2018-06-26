import React, {Component} from 'react';
import './App.css';
import Util from './util.js';
import { PhonemeCreationForm, PhonemeRow } from './phonemeEntry.js';
import { LanguageCreationForm, LanguageRow } from './languageEntry.js';
import axios from 'axios';

class App extends Component
{
    constructor()
    {
        super();
        this.state = {
            langlist : [],
            phonemelist: [],
        };
        this.server = axios.create({
            baseURL: 'http://localhost:2837/langgen',
            timeout: 10000,
        });
        this.fetchLanguages();
        this.fetchPhonemes();
    }

    fetchLanguages()
    {
        this.server.get('/languages').then(res =>
        {
            this.setState({langlist : res.data});
        }).catch(err =>
        {
            console.error(err);
        });
    }

    fetchPhonemes()
    {
        this.server.get('/phonemes').then(res =>
        {
            this.setState({phonemelist : res.data});
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
                    <h2>Language Generator by Richard Nicholson</h2>
                </div>
                <div className="mainsection">
                    <div>
                        <h3>LANGUAGES</h3>
                        <table className="bordered">
                            <thead>
                            <tr>
                                <th>id</th>
                                <th>Name</th>
                            </tr>
                            </thead>
                            <tbody>
                                {this.state.langlist.map((lang, index) => <LanguageRow name={lang.name} id={lang.id} key={index} />)}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <LanguageCreationForm app={this}/>
                    </div>
                </div>
                <br/>
                <div className="mainsection">
                    <div>
                        <h3>PHONEMES</h3>
                        <table className="bordered">
                            <thead>
                            <tr>
                                <th>id</th>
                                <th>kind</th>
                                <th>long</th>
                                <th>nasal</th>

                                <th>front</th>
                                <th>back</th>
                                <th>high</th>
                                <th>low</th>
                                <th>tense</th>
                                <th>round</th>

                                <th>place</th>
                                <th>manner</th>
                                <th>aspirated</th>
                                <th>ejective</th>
                                <th>lateral</th>
                                <th>retroflex</th>
                                <th>sibilant</th>
                                <th>voiced</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.phonemelist.map((phoneme, index) => <PhonemeRow phoneme={phoneme} id={phoneme.id} key={index} />)}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <PhonemeCreationForm app={this}/>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
