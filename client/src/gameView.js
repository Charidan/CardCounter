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

        this.shuffle = this.shuffle.bind(this);
        this.drawCard = this.drawCard.bind(this);
        this.destroyDrawnCard = this.destroyDrawnCard.bind(this);
        this.putDrawnCardOnBottom = this.putDrawnCardOnBottom.bind(this);
    }

    shuffle()
    {
        this.state.app.server.post("/deck/" + this.state.deck._id + "/shuffle", {}).then((res) =>
        {
            let deck = res.data;
            this.setState({deck: deck});
        });
    }

    drawCard()
    {
        this.state.app.server.post("/deck/" + this.state.deck._id + "/draw", {}).then((res) =>
        {
            this.setState({drawnCard: res.data[0], deck: res.data[1]});
        });
    }

    destroyDrawnCard()
    {
        this.state.app.server.post("/deck/" + this.state.deck._id + "/destroyDrawnCard", {}).then((res) =>
        {
            this.setState({deck: res.data});
        });
    }

    putDrawnCardOnBottom()
    {
        this.state.app.server.post("/deck/" + this.state.deck._id + "/putbottom/" + this.state.deck.drawnCard._id, {}).then((res) =>
        {
            this.setState({deck: res.data});
        });
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
                    {this.state.deck.cards.length}
                </td>
                <td colSpan={this.state.deck.drawnCard == null ? "2" : "1"}>{/* fill other column if drawn card will be null */}
                    {!this.state.app.state.locked && this.state.deck.legalShuffle ?
                     <button onClick={this.shuffle}>Shuffle</button>
                     : null
                    }
                    {this.state.deck.legalDraw ?
                     <button onClick={this.drawCard} disabled={this.state.deck.drawnCard}>Draw</button>
                     : null
                    }
                </td>
                {this.state.deck.drawnCard == null ? null :
                 <td>
                     Drawn Card: {this.state.deck.drawnCard.value}
                     {this.state.deck.legalPutOnBottom ?
                      <button onClick={this.putDrawnCardOnBottom}>Place on Bottom</button>
                      : null
                     }
                     {this.state.deck.legalDestroy ?
                      <button onClick={this.destroyDrawnCard}>Destroy</button>
                      : null
                     }
                 </td>
                }
                <td>
                    <button onClick={() => this.state.app.openDeck(this.state.deck, this.state.game)} disabled={this.state.deck.drawnCard}>Open Deck</button>
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
                        <th>Cards</th>
                        <th colSpan="2"> </th>{/* shuffle/draw | drawn card */}
                        <th> </th>{/* open deck */}
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.app.state.decklist.map((deck, index) => <DeckRow game={this.state.game} deck={deck} key={index.toString() + deck._id.toString()} app={this.state.app} />)}
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