import React, {Component} from "react";

class CardRow extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            app: props.app,
            card: props.card,
            index: props.index,
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
        this.state.deckdisp.setState((prevState) => ({editing: prevState.editing + 1}));
        this.setState((prevState) => ({editing: true, editValue: prevState.card.value}));
    }

    updateCard()
    {
        this.state.app.server.post("/card/" + this.state.card._id, {}).then((res) => {
            let card = res.data;
            this.setState({editing: false, card: card});
            this.state.deckdisp.setState((prevState) => ({editing: prevState.editing - 1}));
        });
    }

    render()
    {
        return (
            <tr>
                {this.state.app.state.locked ? null :
                    <td>
                        {this.state.index === 0 ?
                             <i className="disabled fas fa-angle-up" /> :
                             <i className="clickable fas fa-angle-up"   onClick={() => { this.state.deckdisp.moveCard(this.state.index, true) }} />
                        }
                        <br/>
                        {this.state.index === this.state.deckdisp.state.deck.cards.length - 1 ?
                             <i className="disabled fas fa-angle-down" /> :
                             <i className="clickable fas fa-angle-down" onClick={() => { this.state.deckdisp.moveCard(this.state.index, false) }} />
                        }
                    </td>
                }
                <td>
                    {this.state.editing ?
                        <input type="text" name="editValue" value={this.state.editValue} onChange={this.handleChange} /> :
                        this.state.card.faceup ?
                            this.state.card.value :
                        this.state.card.value//"Facedown"
                    }
                </td>
                {this.state.app.state.locked ?
                    null :
                     this.state.editing ?
                         <td>
                             Face Up: <input name="faceup" type="checkbox" value={this.state.card.faceup} onChange={this.handleChange}/>
                             <button onClick={ this.updateCard }>Update Card</button>
                         </td>
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
            editing: 0,
            drawnCard: null,
            newCardValue: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.createCard = this.createCard.bind(this);
        this.shuffle = this.shuffle.bind(this);
        this.drawCard = this.drawCard.bind(this);
        this.destroyDrawnCard = this.destroyDrawnCard.bind(this);
        this.putDrawnCardOnBottom = this.putDrawnCardOnBottom.bind(this);
        this.moveCard = this.moveCard.bind(this);
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
        this.state.app.server.post("/card/" + this.state.drawnCard._id + "/destroy", {}).then(() =>
        {
            this.setState({drawnCard: null});
        });
    }

    putDrawnCardOnBottom()
    {
        this.state.app.server.post("/deck/" + this.state.deck._id + "/putbottom/" + this.state.drawnCard._id, {}).then((res) =>
        {
            this.setState({deck: res.data, drawnCard: null});
        });
    }

    moveCard(cardIndex, up)
    {
        console.log("cardIndex = " + cardIndex);

        this.state.app.server.post("/deck/" + this.state.deck._id + "/move/", { index: cardIndex, up: up}).then((res) =>
        {
            this.setState({deck: res.data});
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
                        {this.state.app.state.locked ? null :
                            <th> </th> // up down arrows
                        }
                        <th>Card Number</th>
                        {this.state.app.state.locked ? null :
                         <th colSpan="2"> </th> // edit button || edit fields
                        }
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.deck.cards.map((card, index) => <CardRow card={card} deckdisp={this} index={index} key={index.toString() + card._id} app={this.state.app} />)}
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