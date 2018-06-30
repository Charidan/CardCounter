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
            editValue: props.card.value,
        };

        this.handleChange   = this.handleChange.bind(this);
        this.editCard       = this.editCard.bind(this);
        this.updateCard     = this.updateCard.bind(this);
    }

    handleChange(event)
    {
        if(event.target.type === "checkbox")
        {
            let faceup = event.target.checked;
            this.setState((prevState) => {
                prevState.card.faceup = faceup;
                return {card: prevState.card};
            });
        }
        else this.setState({editValue: event.target.value})
    }

    editCard()
    {
        console.log("edit card state = ");
        console.log(this.state);
        this.state.deckdisp.setState((prevState) => ({editing: prevState.editing + 1}));
        this.setState((prevState) => ({editing: true, editValue: prevState.card.value}));
    }

    updateCard()
    {
        this.state.app.server.post("/card/" + this.state.card._id, {}).then((res) => {
            let card = res.data;
            this.setState({editing: false, card: card});
            this.state.deckdisp.setState((prevState) => ({editing: prevState.deckdisp.state.editing - 1}));
        });
    }

    render()
    {
        if(this.state.editing)
        {
            console.group();
            console.log(this.state);
            console.log(this.state.card);
            console.log(this.state.card.value);
            console.log(this.state.card.faceup);
            console.log(this.state.editValue);
            console.groupEnd();
        }

        let colA = this.state.app.state.locked ?
                       null :
                       this.state.editing ?
                           <td>Face Up: <input name="faceup" type="checkbox" value={this.state.card.faceup} onChange={this.handleChange}/></td>:
                           <td colSpan="2"><button onClick={ this.editCard } disabled={this.state.deckdisp.state.drawnCard}>Edit Card</button></td>;
        let colB = this.state.app.state.locked ?
                       null :
                       this.state.editing ?
                            <td><button onClick={ this.updateCard }>Update Card</button></td> :
                           null;

        return (
            <tr>
                <td>
                    {this.state.editing ?
                        <input type="text" name="editValue" value={this.state.editValue} onChange={this.handleChange} /> :
                        this.state.card.faceup ?
                            this.state.card.value :
                            "Facedown"
                    }
                </td>
                {colA}
                {colB}
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
        // TODO make a cardlist and make decks not have cards in the schema

        this.handleChange = this.handleChange.bind(this);
        this.createCard = this.createCard.bind(this);
        this.shuffle = this.shuffle.bind(this);
        this.drawCard = this.drawCard.bind(this);
        this.destroyDrawnCard = this.destroyDrawnCard.bind(this);
        this.putDrawnCardOnBottom = this.putDrawnCardOnBottom.bind(this);
    }

    handleChange(event)
    {
        this.setState({newCardValue: event.target.value});
    }

    // create a card
    createCard(event)
    {
        this.state.app.server.post("/deck/" + this.state.deck._id + "/createbottom/", {
            value: this.state.newCardValue,
        }).then((res) =>
        {
            let deck = res.data;
            this.setState({newCardValue: '', deck: deck});
        });

        event.preventDefault();
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
        this.setState({drawnCard: null});
    }

    putDrawnCardOnBottom()
    {
        this.state.app.server.post("/deck/" + this.state.deck._id + "/putbottom/" + this.state.drawnCard._id, {}).then((res) =>
        {
            let deck = res.data;
            this.setState({deck: deck, drawnCard: null});
        });
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
                    {this.state.deck.cards.map((card, index) => <CardRow card={card} deckdisp={this} key={index.toString() + card._id} app={this.state.app} />)}
                    </tbody>
                </table>
                <div>
                    <button onClick={this.shuffle} disabled={this.state.app.state.locked}>Shuffle</button>
                    <button onClick={this.drawCard} disabled={this.state.editing !== false}>Draw</button>
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