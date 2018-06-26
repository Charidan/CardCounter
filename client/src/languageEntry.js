import React, {Component} from "react";

class LanguageRow extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
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
            </tr>
        )
    }
}

class LanguageCreationForm extends React.Component
{
    constructor(props)
    {
        super(props);
        this.app = props.app;
        this.state = {
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
        this.app.server.post("/languages", {
            name: this.state.value,
        });
        this.setState({value: ''});
        this.app.fetchLanguages();
        event.preventDefault();
    }

    render()
    {
        return (
            <form onSubmit={this.handleSubmit}>
                <br/>
                <label>
                    Name:
                    <input type="text" value={this.state.value} onChange={this.handleChange}/>
                </label>
                <input type="submit" value="Submit"/>
            </form>
        );
    }
}

export { LanguageCreationForm, LanguageRow };