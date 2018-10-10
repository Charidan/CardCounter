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

class DeckTargetChooser extends React.Component
{
    constructor(props)
    {
        super(props);

        let initProhib = [];
        for(let i = 0; i < props.app.state.decklist.length; i++)
        {
            // if deck accepts transfers and is not self
            if(props.app.state.decklist[i].legalAcceptTransfer && props.app.state.decklist[i]._id !== props.deckid)
            {
                let duplicate = false;

                // and deck is not already a target deck
                for(let j = 0; j < props.initTargets.length; j++)
                {
                    if(props.app.state.decklist[i]._id === props.initTargets[j].deckid)
                    {
                        duplicate = true;
                        break;
                    }
                }

                if(!duplicate)
                {
                    // add deck to list of potential but currently prohibited targets
                    initProhib.push({deckid: props.app.state.decklist[i]._id, name: props.app.state.decklist[i].name});
                }
            }
        }

        initProhib.sort(this.nameComparator);
        props.initTargets.sort(this.nameComparator);

        this.state = {
            app: props.app,
            callback: props.callback,
            deckid: props.deckid,
            prohibDecks: initProhib,
            targetDecks: props.initTargets,
        };

        this.addTargets = this.addTargets.bind(this);
        this.removeTargets = this.removeTargets.bind(this);
        this.repopulateLists = this.repopulateLists.bind(this);
    }

    nameComparator(a,b)
    {
        if (a.name < b.name)
            return -1;
        if (a.name > b.name)
            return 1;
        return 0;
    };

    repopulateLists()
    {
        this.setState((prevState) =>
        {

            let initProhib = [];
            let newTargetDecks = prevState.targetDecks;
            for(let i = 0; i < prevState.app.state.decklist.length; i++)
            {
                // if deck accepts transfers and is not self
                if(prevState.app.state.decklist[i].legalAcceptTransfer && prevState.app.state.decklist[i]._id !== prevState.deckid)
                {
                    let duplicate = false;

                    // ensure deck is not already a target
                    for(let j = 0; j < newTargetDecks.length; j++)
                    {
                        if(prevState.app.state.decklist[i]._id === newTargetDecks[j].deckid)
                        {
                            duplicate = true;
                            break;
                        }
                    }

                    if(!duplicate)
                    {
                        // add deck to list of potential but currently prohibited targets
                        initProhib.push({
                            deckid: prevState.app.state.decklist[i]._id,
                            name: prevState.app.state.decklist[i].name
                        });
                    }
                }
            }

            initProhib.sort(this.nameComparator);
            newTargetDecks.sort(this.nameComparator);

            return { prohibDecks: initProhib, targetDecks: newTargetDecks };
        });
    }

    addTargets()
    {
        let newTargetDecks = this.state.targetDecks;
        let newProhibDecks = this.state.prohibDecks;
        let foundSelected = false;
        for(let i = 0; i < this.refs.prohibDeckSelect.options.length; i++)
        {
            if(this.refs.prohibDeckSelect.options[i].selected)
            {
                foundSelected = true;
                // add to targets
                newTargetDecks.push(JSON.parse(this.refs.prohibDeckSelect.options[i].value));
                // remove from prohib
                for(let j = 0; j < newProhibDecks.length; j++)
                {
                    if(newProhibDecks[j].deckid === JSON.parse(this.refs.prohibDeckSelect.options[i].value).deckid)
                    {
                        newProhibDecks.splice(j, 1);
                        j--;
                    }
                }
            }
        }

        // nothing was selected, do nothing
        if(!foundSelected) return;

        newTargetDecks.sort(this.nameComparator);
        newProhibDecks.sort(this.nameComparator);

        this.state.callback(newTargetDecks, this.repopulateLists);

        this.setState({ targetDecks: newTargetDecks, prohibDecks: newProhibDecks });
    }

    removeTargets()
    {
        let newTargetDecks = this.state.targetDecks;
        let newProhibDecks = this.state.prohibDecks;
        let foundSelected = false;
        for(let i = 0; i < this.refs.targetDeckSelect.options.length; i++)
        {
            if(this.refs.targetDeckSelect.options[i].selected)
            {
                foundSelected = true;
                // add to prohib
                newProhibDecks.push(JSON.parse(this.refs.targetDeckSelect.options[i].value));
                // remove from target
                for(let j = 0; j < newTargetDecks.length; j++)
                {
                    if(newTargetDecks[j].deckid === JSON.parse(this.refs.targetDeckSelect.options[i].value).deckid)
                    {
                        newTargetDecks.splice(j, 1);
                        j--;
                    }
                }
            }
        }

        // nothing was selected, do nothing
        if(!foundSelected) return;

        newTargetDecks.sort(this.nameComparator);
        newProhibDecks.sort(this.nameComparator);

        this.state.callback(newTargetDecks);

        this.setState({ targetDecks: newTargetDecks, prohibDecks: newProhibDecks });
    }

    render()
    {
        return (
            <table>
                <tbody>
                    <tr>
                        <td>Prohibited:</td>
                        <td colSpan="2"> </td>
                        <td>Targetable:</td>
                    </tr>
                    <tr>
                        <td><select multiple id="prohibDeckSelect" ref="prohibDeckSelect">
                            {this.state.prohibDecks.map((deckref, index) => <option value={JSON.stringify(deckref)} key={""+index+"prohib"+deckref.deckid}>{deckref.name}</option>)}
                        </select></td>

                        <td>
                            <button onClick={this.addTargets}>{'>>'}</button>
                            <br/>
                            <br/>
                            <button onClick={this.removeTargets}>{'<<'}</button>
                        </td>

                        <td><select multiple id="targetDeckSelect" ref="targetDeckSelect">
                            {this.state.targetDecks.map((deckref, index) => <option value={JSON.stringify(deckref)} key={""+index+"target"+deckref.deckid}>{deckref.name}</option>)}
                        </select></td>
                    </tr>
                </tbody>
            </table>
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
        this.setTargets = this.setTargets.bind(this);
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

    setTargets(drawnOrAny, targetDecks, callback)
    {
        this.state.app.server.post('/deck/' + this.state.deck._id + '/setTargets', {drawnOrAny: drawnOrAny, targetDecks: targetDecks}).then((res) =>
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
                     Can receive cards from other decks: <input type="checkbox" name="legalAcceptTransfer" checked={this.state.deck.legalAcceptTransfer} onChange={this.updateSetting} />
                     <br/>
                     Can discard drawn card to other decks: <input type="checkbox" name="legalPerformTransferDrawn" checked={this.state.deck.legalPerformTransferDrawn} onChange={this.updateSetting} />
                     <br/>
                     {
                         this.state.deck.legalPerformTransferDrawn ?
                              <DeckTargetChooser id="drawnTargetChooser" app={this.state.app} callback={this.setTargets.bind(this, true)} initTargets={this.state.deck.drawTransferTargets} deckid={this.state.deck._id}/>
                              :
                              null
                     }
                     { this.state.deck.legalPerformTransferDrawn ? <br/> : null }
                     Can transfer any card to other decks: <input type="checkbox" name="legalPerformTransferAny" checked={this.state.deck.legalPerformTransferAny} onChange={this.updateSetting} />
                     <br/>
                     {
                         this.state.deck.legalPerformTransferAny ?
                            <DeckTargetChooser id="anyTargetChooser" app={this.state.app} callback={this.setTargets.bind(this, false)} initTargets={this.state.deck.anyTransferTargets} deckid={this.state.deck._id}/>
                            :
                            null
                     }
                     { this.state.deck.legalPerformTransferAny ? <br/> : null }
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
