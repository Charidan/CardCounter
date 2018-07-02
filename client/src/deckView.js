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
        this.deleteCard     = this.deleteCard.bind(this);
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

    deleteCard()
    {
        console.log(this.state);
        this.state.app.server.post("/deck/" + this.state.deckdisp.state.deck._id+ "/deleteCard/", { cardid: this.state.card._id }).then((res) => {
            this.state.deckdisp.setState((prevState) => ({deck: res.data, editing: prevState.editing - 1}));
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
                        this.state.deckdisp.state.showCards ?
                            this.state.card.value :
                            this.state.card.faceup ?
                                this.state.card.value :
                                "Facedown"
                    }
                </td>
                {this.state.app.state.locked ?
                    null :
                     this.state.editing ?
                         <td>
                             Face Up: <input name="faceup" type="checkbox" value={this.state.card.faceup} onChange={this.handleChange}/>
                             <button onClick={ this.updateCard }>Update Card</button>
                             <button onClick={ this.deleteCard }>Delete Card</button>
                         </td>
                         :
                         <td colSpan="2"><button onClick={ this.editCard }>Edit Card</button></td>
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
            newCardValue: '',
            showCards: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.createCard = this.createCard.bind(this);
        this.moveCard = this.moveCard.bind(this);
    }

    handleChange(event)
    {
        this.setState({
            [event.target.name]: (event.target.type === 'checkbox' ? event.target.checked : event.target.value)
        });
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

    moveCard(cardIndex, up)
    {
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
                Cards in deck: {this.state.deck.cards.length}
                <br/>
                {this.state.app.state.locked ?
                 null :
                 <div>
                     Show Card Values: <input type="checkbox" name="showCards" value={this.state.showCards} onChange={this.handleChange} />
                     <br/>
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
                         {this.state.deck.cards.map((card, index) => <CardRow card={card} deckdisp={this} index={index}
                                                                              key={index.toString() + card._id}
                                                                              app={this.state.app}/>)}
                         </tbody>
                     </table>
                 </div>
                }
                {this.state.app.state.locked ? null :
                    <form onSubmit={this.createCard}>
                        <br/><br/>
                        <label>
                            Value:
                            <input type="text" name="newCardValue" value={this.state.newCardValue} onChange={this.handleChange}/>
                        </label>
                        <input type="submit" value="Create Card"/>
                    </form>
                }
            </div>
        );
    }
}

export { DeckDisplay };