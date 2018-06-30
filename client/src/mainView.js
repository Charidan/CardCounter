import React, {Component} from "react";
//import Util from "./util";

class GameRow extends Component
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
            <tr>
                <td>
                    {this.state.game.id}
                </td>
                <td>
                    {this.state.game.name}
                </td>
                <td>
                    <button onClick={() => this.state.app.openGame(this.state.game)}>Open Game</button>
                </td>
            </tr>
        )
    }
}

class AllGamesList extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            app: props.app,
            value: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.createGame = this.createGame.bind(this);
    }

    handleChange(event)
    {
        this.setState({value: event.target.value});
    }

    createGame(event)
    {
        this.state.app.server.post("/games", {
            name: this.state.value,
        }).then((res) => {
            let newgame = res.data;

            console.log("newgame = " + newgame);

            this.setState({value: ''});
            this.state.app.setState((prevState) => {
                prevState.gamelist.push(newgame);
                return { gamelist: prevState.gamelist}
            });
        });

        event.preventDefault();
    }

    render()
    {
        return (
            <div className="mainsection">
                <h3>GAMES</h3>
                <table className="bordered">
                    <thead>
                    <tr>
                        <th>id</th>
                        <th>Game Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.app.state.gamelist.map((game, index) => <GameRow game={game} key={index} app={this.state.app} />)}
                    </tbody>
                </table>
                {this.state.app.state.locked ? null :
                    <form onSubmit={this.createGame}>
                        <br/>
                        <label>
                            Name:
                            <input type="text" value={this.state.value} onChange={this.handleChange}/>
                        </label>
                        <input type="submit" value="Create Game"/>
                    </form>
                }
            </div>
        );
    }
}

export { AllGamesList };