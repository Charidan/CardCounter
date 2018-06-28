import React, {Component} from "react";

class CardRow extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            app: props.app,
            card: props.card,
            editing: false,
            editName: props.card.name,
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event)
    {
        if(event.target.type === "checkbox") this.card.setState({faceup: event.target.value});
        else this.setState({editName: event.target.value})
    }

    editCard()
    {
        this.state.editing = true;
    }

    updateCard()
    {
        // TODO actually update the card with the new info
        this.state.editing = false;
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
                        <fragment>
                            <td><input name="Face Up" type="checkbox" checked={this.state.card.faceup} onChange={this.handleChange}/></td>
                            <td><button onClick={ this.updateCard }>Update Card</button></td>
                        </fragment>
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
        };
    }

    render()
    {
        return (
            <div className="mainsection">
                <div>
                    <h3>{this.state.deck.name}</h3>
                    <table className="bordered">
                        <thead>
                        <tr>
                            <th>id</th>
                            <th>Name</th>
                            <th colSpan="2"> </th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.app.state.deck.cards.map((card, index) => <CardRow card={card} key={index} app={this.app} />)}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export { DeckDisplay };