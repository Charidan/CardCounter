import React, {Component} from "react";

class DeckRow extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            app: props.app,
            game: props.game,
            deck: props.deck,
        };
    }

    render()
    {
        return (
            <tr>
                <td>
                    {this.state.deck.id}
                </td>
                <td>
                    {this.state.deck.name}
                </td>
                <td>
                    <button onClick={ () => this.state.app.openDeck(this.state.game, this.state.deck) }>View Deck</button>
                </td>
            </tr>
        )
    }
}

class GameDisplay extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            app: props.app,
            game: props.game,
            drawnCard: null,
            nameEntry: '',
            rangeMin: '',
            rangeMax: '',
            useRange: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.createDeck = this.createDeck.bind(this);
    }

    handleChange(event)
    {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    createDeck(event)
    {
        let reqobj = { name: this.state.value };
        if(this.state.useRange)
        {
            reqobj.rangeMin = this.state.rangeMin;
            reqobj.rangeMax = this.state.rangeMax;
        }

        let deck = this.state.app.server.post("/decks", {reqobj});
        this.setState({value: ''});
        this.state.app.setState((prevState) => ({ decklist: prevState.decklist.push(deck)}));
        event.preventDefault();
    }

    render()
    {
        return (
            <div className="mainsection">
                <button onClick={this.state.app.closeGame}>Return to Main</button>
                <h3>{this.state.game.name}</h3>
                <table className="bordered">
                    <thead>
                    <tr>
                        <th>id</th>
                        <th>Deck Name</th>
                        <th> </th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.app.state.decklist.map((deck, index) => <DeckRow game={this.state.game} deck={deck} key={index} app={this.state.app} />)}
                    </tbody>
                </table>
                {this.state.app.state.locked ? null :
                    <div>
                        <br/><br/>
                        <form onSubmit={this.createDeck}>
                            <label>
                                Name:
                                <input type="text" value={this.state.nameEntry} onChange={this.handleChange}/>
                            </label>
                            <label>
                                Name:
                                <input type="checkbox" value={this.state.useRange} onChange={this.handleChange}/>
                            </label>
                            {this.state.useRange ?
                                <React.Fragment>
                                    <label>
                                        Low:
                                        <input type="text" value={this.state.rangeMin} onChange={this.handleChange}/>
                                    </label>
                                    <label>
                                        High:
                                        <input type="text" value={this.state.rangeMax} onChange={this.handleChange}/>
                                    </label>
                                </React.Fragment>
                                :
                                null
                            }
                            <input type="submit" value="Create Deck"/>
                        </form>
                    </div>
                }
            </div>
        );
    }
}

export { GameDisplay };