import React from 'react';
import MessageList from './MessageList.jsx';
import AddMessage from './AddMessage.jsx';
import DocHeader from './DocHeader.jsx';
import Document from './Document.jsx';
import Signon from './Signon.jsx';

window.socket = io();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      docOn: false,
      messages: [],
      selected: {},
      user: {
        name: '',
        usedId: ''
      },
      pmTarget: ''
    };
  }

  submitHandler(message) {
    let user = this.state.user;
    let pmTarget = this.state.pmTarget;
    if (pmTarget !== '') {
      socket.emit('private message', {pmTarget, message, user});
      this.setState({ pmTarget: ''});
    } else {
      socket.emit('chat message', {message, user});
    }
  }

  addNewMessage (message) {
    let messages = JSON.parse(JSON.stringify(this.state.messages));
    messages.push(message);
    this.messagePopulator(messages);
  }

  messagePopulator(messages) {
    this.setState({messages});
  }

  messageSelected(message) {
    let selected = JSON.parse(JSON.stringify(this.state.selected));
    if ( selected[message._id] ) {
      delete selected[message._id];
    } else {
      selected[message._id] = message;
    }
    if (Object.keys(selected).length === 0) {
      this.setState({ selected, docOn: false });
    } else {
      this.setState({ selected });
    }
  }

  login(userId, anything, Else) {
    console.log('Login Succesful!');
    console.log(userId, anything, Else);
    this.changeUser(this.state.user.name, userId);
  }

  whatsGoingOn(userId, anything, Else) {
    debugger;
    console.log('Login Succesful!');
    console.log(userId, anything, Else);
  }

  componentDidMount() {
    socket.on('Channel Messages', this.messagePopulator.bind(this));
    socket.on('new message', this.addNewMessage.bind(this));
    socket.on('logged in', this.login.bind(this));
    // socket.on('hello', this.whatsGoingOn.bind(this));
  }

  docToggle() {
    this.setState({docOn: !this.state.docOn });
  }

  closeSelection() {
    this.setState({docOn: false, selected: {} });
  }

  changeUser(name, userId = '') {
    this.setState({
      user: {
        name,
        userId
      }
    });
  }

  chooseUser(user) {
    let selected = JSON.parse(JSON.stringify(this.state.selected));
    for (let val of this.state.messages) {
      if (val.user === user) {
        selected[val._id] = val;
      }
    }
    this.setState({ selected });
  }

  privateMessage(pmTarget) {
    this.setState({ pmTarget });
  }

  render() {
    if (this.state.user.name === '') {
      return <Signon changeUser={this.changeUser.bind(this)} />;
    } else if (this.state.docOn) {
      return (
        <div>
          <DocHeader docToggle={this.docToggle.bind(this)} close={this.closeSelection.bind(this)} buttonMsg='Return to chat to select more'/>
          <Document messageSelection={this.messageSelected.bind(this)} selected={this.state.selected} docToggle={this.docToggle.bind(this)} />
        </div>
      );
    } else if (Object.keys(this.state.selected).length > 0) {
      return (
        <div>
          <DocHeader docToggle={this.docToggle.bind(this)} close={this.closeSelection.bind(this)} buttonMsg='Create Document from selected Chats'/>
          <MessageList pmUser={this.privateMessage.bind(this)} chooseUser={this.chooseUser.bind(this)} messageSelection={this.messageSelected.bind(this)} messages={this.state.messages} selected={this.state.selected} />
          <AddMessage submitHandler={this.submitHandler.bind(this)}/>
        </div>
      );
    } else {
      return (
        <div>
          <MessageList pmUser={this.privateMessage.bind(this)} chooseUser={this.chooseUser.bind(this)} messageSelection={this.messageSelected.bind(this)} messages={this.state.messages} selected={this.state.selected} />
          <AddMessage submitHandler={this.submitHandler.bind(this)}/>
        </div>
      );
    }
  }
}

export default App;