import React, {Component} from "react";

class GameRow extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            app: props.app,
            name: props.name,
            id: props.id,
        };
    }

    render()
    {
        return (
            <tr>
                <td>
                    {this.state.id}
                </td>
                <td>
                    {this.state.name}
                </td>
                <td>
                    <button onClick={() => this.state.app.openGame(this.id)}>Open Game</button>
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
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event)
    {
        this.setState({value: event.target.value});
    }

    handleSubmit(event)
    {
        this.state.app.server.post("/games", {
            name: this.state.value,
        });
        this.setState({value: ''});
        this.state.app.fetchGames();
        event.preventDefault();
    }

    render()
    {
        return (
            <div className="mainsection">
                <div>
                    <h3>GAMES</h3>
                    <table className="bordered">
                        <thead>
                        <tr>
                            <th>id</th>
                            <th>Name</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.app.state.gamelist.map((game, index) => <GameRow game={game} key={index} app={this.state.app} />)}
                        </tbody>
                    </table>
                </div>
                {this.state.app.state.locked ? null :
                 <div>
                     <form onSubmit={this.handleSubmit}>
                         <br/>
                         <label>
                             Name:
                             <input type="text" value={this.state.value} onChange={this.handleChange}/>
                         </label>
                         <input type="submit" value="Submit"/>
                     </form>
                 </div>
                }
            </div>
        );
    }
}

export { AllGamesList };