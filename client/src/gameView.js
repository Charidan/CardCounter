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
                    <button onClick={ () => this.state.app.openDeck(this.state.game, this.state.deck) }>View Deck</button>
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
        };
    }

    render()
    {
        // TODO
        return (
            <div className="mainsection">
                <div>
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
                        {this.state.app.state.game.decks.map((card, index) => <DeckRow game={game} deck={deck} key={index} app={this.state.app} />)}
                        </tbody>
                    </table>
                    <br/><br/>
                    {
                        //TODO change this to make new decks when unlocked
                    }
                    { this.state.drawnCard ?
                        <Fragment>
                            Drawn card: {this.state.drawnCard.value}
                            <button>Place on bottom</button>
                            <button>Destroy</button>
                        </Fragment>
                        :
                        <Fragment>
                          <button onClick={this.drawCard}>Draw</button>
                          <button disabled={this.state.app.state.locked}>Shuffle</button>
                        </Fragment>
                    }

                </div>
            </div>
        );
    }
}

export { GameDisplay };