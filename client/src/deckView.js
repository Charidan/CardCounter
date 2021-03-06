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
        // we mutate the card in state because we're about to reset it
        // eslint-disable-next-line
        this.state.card.value = this.state.editValue;
        this.state.app.server.post("/deck/card/" + this.state.index, {card: this.state.card}).then((res) => {
            let card = res.data;
            this.setState({editing: false, card: card});
            this.state.deckdisp.setState((prevState) => ({editing: prevState.editing - 1}));
        });
    }

    deleteCard()
    {
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
                        this.state.deckdisp.state.deck.showCardsEditing || this.state.deckdisp.state.deck.showCardsLocked ?
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
            key: props.key,
            app: props.app,
            deck: props.deck,
            editing: 0,
            newCardValue: '',
            showCardsEditing: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.updateSetting = this.updateSetting.bind(this);
        this.createCard = this.createCard.bind(this);
        this.moveCard = this.moveCard.bind(this);
    }

    handleChange(event)
    {
        this.setState({[event.target.name]: (event.target.type === 'checkbox' ? event.target.checked : event.target.value)});
    }

    updateSetting(event)
    {
        this.state.app.server.post("/deck/" + this.state.deck._id + "/updateSetting/", {
            [event.target.name]: (event.target.type === 'checkbox' ? event.target.checked : event.target.value)
        }).then((res) =>
        {
            this.setState({deck: res.data});
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
                 <div className="smallborder">
                     SETTINGS
                     <br/>
                     Can draw: <input type="checkbox" name="legalDraw" checked={this.state.deck.legalDraw} onChange={this.updateSetting} />
                     <br/>
                     Can shuffle: <input type="checkbox" name="legalShuffle" checked={this.state.deck.legalShuffle} onChange={this.updateSetting} />
                     <br/>
                     Can destroy: <input type="checkbox" name="legalDestroy" checked={this.state.deck.legalDestroy} onChange={this.updateSetting} />
                     <br/>
                     Can put on bottom: <input type="checkbox" name="legalPutOnBottom" checked={this.state.deck.legalPutOnBottom} onChange={this.updateSetting} />
                     <br/>
                     Show Card Values: <input type="checkbox" name="showCardsLocked" checked={this.state.deck.showCardsLocked} onChange={this.updateSetting} />
                     {this.state.deck.showCardsLocked ? null :
                      ["Show cards while editing: ", <input key={this.state.key+"showCardsEditing"} type="checkbox" name="showCardsEditing" checked={this.state.deck.showCardsEditing} onChange={this.updateSetting} />]
                     }
                     <br/>
                 </div>
                 }
                 <br/>
                 {this.state.app.state.locked && !this.state.deck.showCardsLocked ?
                  null :
                  <table className="bordered">
                      <thead>
                      <tr>
                          {this.state.app.state.locked ? null :
                           <th> </th> // up down arrows
                          }
                          <th>Value</th>
                          {this.state.app.state.locked ? null :
                           <th colSpan="2"> </th> // edit button || edit fields
                          }
                      </tr>
                      </thead>
                      <tbody>
                      {this.state.deck.cards.map((card, index) => <CardRow card={card} deckdisp={this} index={index}
                                                                           key={index.toString() + card._id.toString()}
                                                                           app={this.state.app}/>)
                      }
                      </tbody>
                  </table>
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
