// src/components/Objects/index.js
import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import {List, ListItem} from 'material-ui/List';
import Card from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
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

class Objects extends Component {
  static propTypes = {}
  static defaultProps = {}

  state = {
    objects: [],
    importLog: [],
    addSystemName: '',
    openImport: false,
    openImportLog: false,
    addObjectName: '',
    open: false,
    addErrorText : ''
  }

  componentDidMount () {
    this.getUser();
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
      this.getObjects();
    })
    .catch(err => {
      if (err.status === 401)
        window.location.href = `/login`
    });
  }

	getObjects = () => {
    let _this = this;
    makeRequest('GET', 'objects/' + this.state.user._id).then(data => {
      let response = JSON.parse(data);
      _this.setState({
        objects : response.objects,
      });
    })
    .catch(err => {
      alert('Error in objects list')
    });
  }

  goExport = () => {
    let o = this.state.objects;
    o.forEach(i => { delete i._id; delete i.__v });
    FileDownload(JSON.stringify(o, null, ' '), 'objects.json');
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

  onFileLoadObjects = (e, file) => {
    let _this = this;

    let o = JSON.parse(utf8.decode(base64.decode(e.target.result.split(',')[1])));

    let il = o.map(item => (item.objectId ? {
      objectId: item.objectId,
      description: 'checking...',
    } : null ));

    this.setState({ openImport: false });
    this.setState({ importFileName: file.name });
    this.setState({ openImportLog: true });
    this.setState({ importLog: il });

    il.forEach((item, index) => {
      if (item) {
        if (this.state.objects.find(i => i.objectId === item.objectId)) {
          item.description = 'object exists'
        }
      }
    });
    this.setState({ importLog: il });
    il.forEach((item, index) => {
      if (item) {
        if (item.description === 'checking...') {
          makeRequest('POST',
            'object/new', {
              objectId : item.objectId,
              userId : this.state.user._id
            })
          .then(data => {
            let d = JSON.parse(data);
            makeRequest('PUT',
            `object/${d._id}`, o[index]
            ).then( dataput => {
              let objects = _this.state.objects;
              o[index]._id = d._id;
              objects.push(o[index]);
              item.description = 'successfully imported';
              _this.setState({objects : objects});
            })
            .catch(err => {
              console.log('Update object error')
            })
          })
          .catch(err => {
            console.log('Add object error')
          })
        }
      }
    });
    this.setState({ importLog: il });
  }

  goSystem = () => {
    window.location.href = `/systems`;
  }

  goUsers = () => {
    window.location.href = `/users`;
  }

  addObject = () => {
    let _this = this;
    if (this.state.addObjectName.trim().length > 0) {
      makeRequest('POST',
      'object/new',
      {
        objectId : this.state.addObjectName,
        userId : this.state.user._id
      }).then( data => {
      let obj = _this.state.objects;
      obj.push(JSON.parse(data));
      _this.setState({ objects : obj });
      _this.setState({ addObjectName : '' });
      _this.setState({ addErrorText : '' });
    })
    .catch(err => {
      window.location.href = `/login`
    });
    } else {
      this.setState({ addErrorText : 'This field is required' });
    }
  }

  deleteObject = (event) => {
    this.setState({deleteId: event});
    this.setState({open: true});
  }

  changeObject = (event) => {
    window.location.href = `/object/${event}`;
  }

  changeObjectName = (event) => {
    this.setState({addObjectName : event.target.value})
  }

  handleCloseYes = () => {
    let _this = this;
    this.setState({open: false});
    makeRequest('DELETE',
      `object/${this.state.deleteId}`).then( data => {
        _this.getObjects();
    })
    .catch(err => {
      window.location.href = `/login`
    });
  }

  handleCloseNo = () => {
    this.setState({open: false})
  }

  render() {

    let objects = this.state.objects.length === 0 ? '' :
    this.state.objects.map((item, index) =>
      <ListItem key={item._id} primaryText={item.objectId}
        onClick={() => this.changeObject(item._id)}
        rightIconButton={<IconButton onClick={() => this.deleteObject(item._id)}><Delete /></IconButton>}>
      </ListItem>
    );

    let importLog = this.state.importLog.length === 0 ? 'Unknown JSON file' :
    this.state.importLog.map((item, index) =>
      <ListItem
        key={index}
        primaryText={item ? item.objectId : 'Unknown object'}
        secondaryText={item ? item.description : ''}
        disabled={true}
      >
      </ListItem>
    );

    return (
      <div>
        <AppBar
          title="Default Objects"
          style={styles.appBarStyle}
          iconElementRight={
            <IconMenu
              iconButtonElement={
              <IconButton><MoreVertIcon /></IconButton>
              }
              targetOrigin={{horizontal: 'right', vertical: 'top'}}
              anchorOrigin={{horizontal: 'right', vertical: 'top'}}
            >
            <MenuItem onClick={this.goSystem} primaryText="All Systems" />
            <MenuItem onClick={this.goImport} primaryText="Import" />
            <MenuItem onClick={this.goExport} primaryText="Export" />
            <MenuItem onClick={logout} primaryText="Logout" />
          </IconMenu>}
          iconElementLeft={<IconButton
            onClick={logout}>
            <ActionExitToApp />
          </IconButton>}
        />
        <Card style={styles.cardStyle}>
          <List>{objects}</List>

          <TextField
          onChange={this.changeObjectName}
          value={this.state.addObjectName}
          hintText="New object"
          errorText={this.state.addErrorText}
          fullWidth={true}
          />

          <FlatButton onClick={this.addObject} label="Add" />

        </Card>
        <Dialog
          title="Delete object"
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
          title={ 'Import oblects' }
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
              label="Import objects"
              onFileLoad={this.onFileLoadObjects}
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

export default Objects;
