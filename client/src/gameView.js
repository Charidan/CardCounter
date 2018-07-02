import React, {Component} from "react";
//import Util from "./util";

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
                    <button onClick={ () => this.state.app.openDeck(this.state.deck, this.state.game) }>View Deck</button>
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
        let reqobj = {
            name: this.state.nameEntry,
            gameid: this.state.game._id,
        };
        if(this.state.useRange)
        {
            reqobj.rangeMin = this.state.rangeMin;
            reqobj.rangeMax = this.state.rangeMax;
        }

        this.state.app.server.post("/decks", reqobj).then((res) => {
            let deck = res.data;
            this.state.app.setState((prevState) =>
            {
                prevState.decklist.push(deck);
                return {decklist: prevState.decklist}
            });
            this.setState({nameEntry: ''});
        });

        event.preventDefault();
    }

    render()
    {
        let low = this.state.useRange ?
                  <label>
                      Low:
                      <input type="text" name='rangeMin' value={this.state.rangeMin} onChange={this.handleChange}/>
                  </label>
                  :
                  null;
        let high = this.state.useRange ?
                   <label>
                       High:
                       <input type="text" name='rangeMax' value={this.state.rangeMax} onChange={this.handleChange}/>
                   </label>
                  :
                  null;

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
                    <form onSubmit={this.createDeck}>
                        <br/><br/>
                        <label>
                            Name:
                            <input type="text" name='nameEntry' value={this.state.nameEntry} onChange={this.handleChange}/>
                        </label>
                        <label>
                            Fill with card range:
                            <input type="checkbox" name='useRange' value={this.state.useRange} onChange={this.handleChange}/>
                        </label>
                        {low}
                        {high}
                        <br/>
                        <input type="submit" value="Create Deck"/>
                    </form>
                }
            </div>
        );
    }
}

export { GameDisplay };