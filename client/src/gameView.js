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
                    {this.state.app.state.locked ? null : <button onClick={ () => this.state.app.editDeck(this.state.game.id, this.state.deck.id) }>Edit Card</button>}
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
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.app.state.deck.cards.map((card, index) => <DeckRow game={game} deck={deck} key={index} app={this.state.app} />)}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export { GameDisplay };