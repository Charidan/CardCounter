import React, {Component} from "react";

class CardRow extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            app: props.app,
            card: props.card,
            deckdisp: props.deckdisp,
            editing: false,
            editName: props.card.name,
        };

        this.handleChange   = this.handleChange.bind(this);
        this.editCard       = this.editCard.bind(this);
        this.updateCard     = this.updateCard.bind(this);
    }

    handleChange(event)
    {
        if(event.target.type === "checkbox")
        {
            this.card.faceup = event.target.value;
            this.forceUpdate();
        }
        else this.setState({editName: event.target.value})
    }

    editCard()
    {
        this.state.deckdisp.setState((prevState) => ({editing: prevState.deckdisp.state.editing + 1}));
        this.setState({editing: true});
    }

    updateCard()
    {
        this.state.deckdisp.setState((prevState) => ({editing: prevState.deckdisp.state.editing - 1}));
        let card = this.state.app.server.post("/card/" + this.state.card._id + "/update", {});
        this.setState({editing: false, card: card});
    }

    render()
    {
        return (
            <tr>
                <td>
                    {this.state.card.faceup || this.state.card.editing ? this.state.card.value : "Facedown"}
                </td>
                {this.state.app.state.locked ?
                    null :
                    this.state.editing ?
                        <React.Fragment>
                            <td><input name="Face Up" type="checkbox" checked={this.state.card.faceup} onChange={this.handleChange}/></td>
                            <td><button onClick={ this.updateCard }>Update Card</button></td>
                        </React.Fragment>
                        :
                        <td colSpan="2"><button onClick={ this.editCard } disabled={this.state.deckdisp.state.drawnCard}>Edit Card</button></td>
                }
            </tr>
        )
    }
}

class DeckDisplay extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            app: props.app,
            deck: props.deck,
            editing: false,
            drawnCard: null,
            newCardValue: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.createCard = this.createCard.bind(this);
        this.shuffle = this.shuffle.bind(this);
        this.drawCard = this.drawCard.bind(this);
        this.destroyDrawnCard = this.destroyDrawnCard.bind(this);
        this.putDrawnCardOnBottom = this.putDrawnCardOnBottom.bind(this);
    }

    handleChange(event)
    {
        this.setState({newCardValue: event.target.newCardValue});
    }

    // create a card
    createCard(event)
    {
        let deck = this.state.app.server.post("/deck/" + this.state.deck._id + "/createbottom/", {});
        this.setState({value: '', deck: deck});
        event.preventDefault();
    }
    shuffle()
    {
        let deck = this.state.app.server.post("/deck/" + this.state.deck._id + "/shuffle", {});
        this.setState({deck: deck});
    }

    drawCard()
    {
        let ret = this.state.app.server.post("/deck/" + this.state.deck._id + "/draw", {});
        this.setState({drawnCard: ret[0], deck: ret[1]});
    }

    destroyDrawnCard()
    {
        this.setState({drawnCard: null});
    }

    putDrawnCardOnBottom()
    {
        let deck = this.state.app.server.post("/deck/" + this.state.deck._id + "/putbottom/" + this.state.drawnCard._id, {});
        this.setState({deck: deck, drawnCard: null});
    }

    render()
    {
        return (
            <div className="mainsection">
                <button onClick={this.state.app.closeDeck}>Return to Game</button>
                <h3>{this.state.deck.name}</h3>
                <table className="bordered">
                    <thead>
                    <tr>
                        <th>id</th>
                        <th>Card Number</th>
                        <th colSpan="2"> </th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.deck.cards.map((card, index) => <CardRow card={card} deckdisp={this} key={index} app={this.app} />)}
                    </tbody>
                </table>
                <div>
                    <button onClick={this.shuffle} disabled={this.state.app.state.locked}>Shuffle</button>
                    <button onClick={this.drawCard} disabled={this.state.editing !== 0}>Draw</button>
                    {!this.state.drawnCard ? null :
                        <div>
                            Drawn Card: {this.state.drawnCard.value}
                            <button onClick={this.putDrawnCardOnBottom}>Place on Bottom</button>
                            <button onClick={this.destroyDrawnCard}>Destroy</button>
                        </div>
                    }
                </div>
                {this.state.app.state.locked ? null :
                    <form onSubmit={this.createCard}>
                        <br/><br/>
                        <label>
                            Value:
                            <input type="text" value={this.state.newCardValue} onChange={this.handleChange}/>
                        </label>
                        <input type="submit" value="Create Card"/>
                    </form>
                }
            </div>
        );
    }
}

export { DeckDisplay };