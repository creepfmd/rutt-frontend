// src/components/Systems/index.js
import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import {List, ListItem} from 'material-ui/List';
import Card from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import ActionExitToApp from 'material-ui/svg-icons/action/exit-to-app';
import Delete from 'material-ui/svg-icons/action/delete';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import FileDownload from 'react-file-download';
import Upload from 'material-ui-upload/Upload';
import base64 from 'base-64';
import utf8 from 'utf8';

import { makeRequest, logout, styles } from '../util';

class Systems extends Component {
  static propTypes = {}
  static defaultProps = {
  }

  state = {
    systems: [],
    importLog: [],
    addSystemName: '',
    open: false,
    openImport: false,
    openImportLog: false,
    importFileName: '',
    addSystemErrorText : '',
    userName : ''
  }

  componentDidMount () {
    this.getUser();
  }

	getSystems = () => {
    let _this = this;

    makeRequest('GET', 'systems/' + this.state.user._id).then(data => {
      let response = JSON.parse(data);
      _this.setState({
        systems : response.systems,
      });
      response.systems.forEach( (element) => {
        makeRequest('GET', 'redis/zcard/' + element.systemId).then(data => {
          let s = _this.state.systems;
          let d = JSON.parse(data);
          s.find(item => {return item.systemId === element.systemId}).zcard = d.zcard;
          _this.setState({
            systems : s,
          });
        })
        .catch(err => {
          if (err.status === 401)
          console.log('Error get redis zcard')
        })
      })
    })
    .catch(err => {
      if (err.status === 401)
        alert('Error in systems list')
    });
  }

	getUser = () => {
    let _this = this;
    makeRequest('GET', 'me').then(data => {
      let response = JSON.parse(data);
      _this.setState({
        user : response,
      });
      _this.setState({
        userName : response.name,
      });
      this.getSystems();
    })
    .catch(err => {
      if (err.status === 401)
        window.location.href = `/login`
    });
  }

  goExport = () => {
    let s = this.state.systems;
    s.forEach(i => { delete i._id; delete i.zcard; delete i.__v });
    FileDownload(JSON.stringify(s, null, ' '), 'systems.json');
  }

  goImport = (event) => {
    this.setState({openImport: true});
  }

  handleCloseImport = () => {
    this.setState({openImport: false});
  }

  handleCloseImportLog = () => {
    this.setState({openImportLog: false});
  }

  onFileLoadSystems = (e, file) => {
    let _this = this;

    let s = JSON.parse(utf8.decode(base64.decode(e.target.result.split(',')[1])));

    let il = s.map(item => (item.systemId ? {
      systemName: item.systemName ? item.systemName : item.systemId,
      systemId: item.systemId,
      description: 'checking...',
    } : null ));

    this.setState({ openImport: false });
    this.setState({ importFileName: file.name });
    this.setState({ openImportLog: true });
    this.setState({ importLog: il });

    il.forEach((item, index) => {
      if (item) {
        if (this.state.systems.find(i => i.systemId === item.systemId)) {
          item.description = 'system exists'
        }
      }
    });
    this.setState({ importLog: il });
    il.forEach((item, index) => {
      if (item) {
        if (item.description === 'checking...') {
          makeRequest('POST',
            'system/new',
            { userId : this.state.user._id })
          .then(data => {
            let d = JSON.parse(data);
            makeRequest('PUT',
            `system/${d.systemId}`, s[index]
            ).then( dataput => {
              let systems = _this.state.systems;
              systems.push(s[index]);
              item.description = 'successfully imported';
              _this.setState({systems : systems});
            })
            .catch(err => {
              console.log('Update system error')
            })
          })
          .catch(err => {
            console.log('Add system error')
          })
        }
      }
    });
    this.setState({ importLog: il });
  }

  goObjects = () => {
    window.location.href = `/objects`;
  }

  goUsers = () => {
    if (this.state.userName === "admin")
      window.location.href = `/users`
    else
      window.location.href = `/user/${ this.state.user._id }`
  }

  addSystem = () => {
    let _this = this;
    makeRequest('POST',
      'system/new',
      { userId : this.state.user._id })
    .then(data => {
      let systems = _this.state.systems;
      systems.push(JSON.parse(data));
      _this.setState({systems : systems});
    })
    .catch(err => {
      if (err.status === 401)
        window.location.href = `/login`
    })
  }

  deleteSystem = (event) => {
    this.setState({deleteId: event._id});
    this.setState({deleteSystemId: event.systemId});
    this.setState({open: true});
  }

  changeSystem = (event) => {
    window.location.href = `/system/${event}`;
  }

  changeSystemName = (event) => {
    this.setState({addSystemName : event.target.value})
  }

  handleCloseYes = () => {
    let _this = this;
    this.setState({open: false});
    makeRequest('DELETE',
      `system/${this.state.deleteId}`).then( data => {
        _this.getSystems();
    })
    .catch(err => {
      if (err.status === 401)
        window.location.href = `/login`
    });
  }

  handleCloseNo = () => {
    this.setState({open: false})
  }

  render() {

    let systems = this.state.systems.length === 0 ? '' :
    this.state.systems.map((item, index) =>
      <ListItem
        key={item._id}
        primaryText={item.systemName ? item.systemName : item.systemId}
        secondaryText={item.zcard ? item.systemId + ' [' + item.zcard + ']' : item.systemId}
        onClick={() => this.changeSystem(item.systemId)}
        rightIconButton={<IconButton onClick={() => this.deleteSystem(item)}><Delete /></IconButton>}
      >
      </ListItem>
    );

    let importLog = this.state.importLog.length === 0 ? 'Unknown JSON file' :
    this.state.importLog.map((item, index) =>
      <ListItem
        key={index}
        primaryText={item ? item.systemName : 'Unknown system'}
        secondaryText={item ? item.description : ''}
        disabled={true}
      >
      </ListItem>
    );

    return (
      <div>
        <AppBar
          style={styles.appBarStyle}
          title="All Systems"
          iconElementRight={
            <IconMenu
              iconButtonElement={
              <IconButton><MoreVertIcon /></IconButton>
              }
              targetOrigin={{horizontal: 'right', vertical: 'top'}}
              anchorOrigin={{horizontal: 'right', vertical: 'top'}}
            >
            <MenuItem onClick={this.goObjects} primaryText="Default Objects" />
            <MenuItem onClick={this.goImport} primaryText="Import" />
            <MenuItem onClick={this.goExport} primaryText="Export" />
            <MenuItem onClick={this.goUsers} primaryText={this.state.userName === "admin" ? "Users" : "Profile"} />
            <MenuItem onClick={logout} primaryText="Log out" />
          </IconMenu>}
          iconElementLeft={<IconButton
            onClick={logout}>
            <ActionExitToApp />
          </IconButton>}
        />
        <Card style={styles.cardStyle}>
          <List>{systems}</List>
          <FlatButton onClick={this.addSystem} label="Add SYSTEM" />
        </Card>
        <Dialog
          title={ 'Delete system ' + this.state.deleteSystemId }
          actions={[
            <FlatButton
              label="No"
              primary={true}
              onClick={this.handleCloseNo}
            />,
            <FlatButton
              label="Yes"
              primary={true}
              onClick={this.handleCloseYes}
            />,
          ]}
          modal={true}
          open={this.state.open}>
          Are you sure?
        </Dialog>
        <Dialog
          title={ 'Import systems' }
          actions={[
            <FlatButton
              label="Close"
              primary={true}
              onClick={this.handleCloseImport}
            />,
          ]}
          modal={true}
          open={this.state.openImport}>
            <Upload
              key="1"
              label="Import systems"
              onFileLoad={this.onFileLoadSystems}
            />
        </Dialog>
        <Dialog
          title={ 'Import file ' + this.state.importFileName }
          actions={[
            <FlatButton
              label="Close log"
              primary={true}
              onClick={this.handleCloseImportLog}
            />,
          ]}
          modal={true}
          open={this.state.openImportLog}>
          <List>{importLog}</List>
        </Dialog>
      </div>
    );
  }
}

export default Systems;
