// src/components/System/index.js
import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import {List, ListItem} from 'material-ui/List';
import Card from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import LinearProgress from 'material-ui/LinearProgress';
import NavigationRefresh from 'material-ui/svg-icons/navigation/refresh';
import NavigationCheck from 'material-ui/svg-icons/navigation/check';
import Delete from 'material-ui/svg-icons/action/delete';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import md5 from 'md5';
import { makeRequest, logout, styles } from '../util';

class ChangeSystem extends Component {
  static propTypes = {}
  static defaultProps = {}

  constructor(props) {
    super(props);
    this.state = {
      _id : '',
      userId : '',
      systemId : '',
      zcard : '',
      publishToken : '',
      systemName : '',
      systemDescription : '',
      systemType : '',
      scriptLanguage : '',
      objectTypes : [],
      objects : [],
      selectedObject : '',
      openDeleteDialog : false,
      deleteDialogText : '',
      deleteDialogHeader : '',
      deleteId : null,
      deleteParam : '',
      systemIdErrorText : '',
      showProgress : styles.reloadBarOff,
      wannaUpdate : false,
    };
  }

  componentDidMount () {
    this.getSystem(this.props.params.systemId);
  }

	getSystem = (id) => {
    let _this = this;

    this.setState({ showProgress : styles.reloadBarOn });

    makeRequest('GET', 'system/' + id).then(data => {
      let s = JSON.parse(data)[0];

      _this.setState({
          _id : s._id,
          userId : s.userId,
          systemId : s.systemId,
          publishToken : s.publishToken,
          systemName : s.systemName,
          systemDescription : s.systemDescription,
          systemType : s.systemType,
          scriptLanguage : s.scriptLanguage,
          objectTypes : s.objectTypes,
      });

      makeRequest('GET', 'redis/zcard/' + s.systemId).then(data => {
          let d = JSON.parse(data);
          _this.setState({
            zcard : d.zcard ? ' [' + d.zcard + ']' : '',
          });
      })
      .catch(err => {
        if (err.status === 401)
        console.log('Error get redis zcard')
      });

      this.getObjects( s.userId );

      _this.setState({ showProgress : styles.reloadBarOff });
    })
    .catch(err => {
      _this.setState({ showProgress : styles.reloadBarOff });
      alert('Error in systems list')
      //window.location.href = `/login`
    });
  }

	getObjects = (id) => {
    let _this = this;
    this.setState({ showProgress : styles.reloadBarOn });
    makeRequest('GET', 'objects/' + id).then(data => {
      let response = JSON.parse(data);
      _this.setState({
        objects : response.objects,
      });
      _this.setState({ showProgress : styles.reloadBarOff });
    })
    .catch(err => {
      _this.setState({ showProgress : styles.reloadBarOff });
      window.location.href = `/login`
    });
  }

  /* Params func */
  changeUserId = (event) => {
    this.setState({ userId : event.target.value });
    this.setState({ wannaUpdate : true });
  }

  changeSystemId = (event) => {
    this.setState({ systemId : event.target.value });
    this.setState({ wannaUpdate : true });
  }

  changePublishToken = (event) => {
    this.setState({ publishToken : event.target.value });
    this.setState({ wannaUpdate : true });
  }

  changeSystemName = (event) => {
    this.setState({ systemName : event.target.value });
    this.setState({ wannaUpdate : true });
  }

  changeSystemDescription = (event) => {
    this.setState({ systemDescription : event.target.value });
    this.setState({ wannaUpdate : true });
  }

  changeSystemType = (event, index, value) => {
    this.setState({ systemType : value });
    this.setState({ wannaUpdate : true });
  }

  changeScriptLanguage = (event, index, value) => {
    this.setState({ scriptLanguage : value });
    this.setState({ wannaUpdate : true });
  }

  goSystems = () => {
    window.location.href = `/systems`;
  }

  applyJSON = () => {
    let _this = this;
    if (this.state.systemId.trim().length > 0) {
      this.setState({ showProgress : styles.reloadBarOn });
      makeRequest('PUT',
      `system/${this.props.params.systemId}`,
      {
        userId : this.state.userId,
        systemId : this.state.systemId,
        publishToken : this.state.publishToken,
        systemName : this.state.systemName,
        systemDescription : this.state.systemDescription,
        systemType : this.state.systemType,
        scriptLanguage : this.state.scriptLanguage,
        objectTypes : this.state.objectTypes
      }).then( data => {
        _this.getSystem(_this.props.params.systemId);
        _this.setState({ showProgress : styles.reloadBarOff });
        _this.setState({ wannaUpdate : false });
        _this.setState({ systemIdErrorText : '' });
      })
      .catch(err => {
        _this.setState({ showProgress : styles.reloadBarOff });
        window.location.href = `/login`
      })
    } else {
      this.setState({ systemIdErrorText : 'This field is required' });
    }
  }

  handleSelectObject = (event) => {
    this.setState({selectedObject : event.target.value});
  }

  addObject = () => {
    let _this = this;
    if (this.state.selectedObject.trim().length > 0) {
      this.setState({ showProgress : styles.reloadBarOn });
      makeRequest('GET', 'object/' + this.state.selectedObject).then(data => {
        let o = JSON.parse(data);
        let ot = _this.state.objectTypes;
        ot.push({
            _id : o._id,
            objectId : o.objectId,
            objectName : o.objectName,
            preloadScript : o.preloadScript,
            preloadActions: o.preloadActions,
            destinations: o.destinations,
          });
        _this.setState({objectTypes : ot});
        _this.setState({ selectedObjectErrorText : '' });
        _this.setState({ showProgress : styles.reloadBarOff });
        _this.setState({ wannaUpdate : true });
        _this.applyJSON();
        })
      .catch(err => {
        _this.setState({ showProgress : styles.reloadBarOff });
        window.location.href = `/login`
      })
    }
    else {
      this.setState({ selectedObjectErrorText : 'This field is required' });
    }
  }

  editObject = (item, index) => {
    window.location.href = `${this.state.systemId}/object/${index}`;
  }

  deleteDialog = (index, param)  => {
    this.setState({ deleteId: index});
    this.setState({ deleteParam: param});
    this.setState({ deleteDialogText : 'Are you sure?' });
    this.setState({ deleteDialogHeader : 'Delete object' });
    this.setState({ openDeleteDialog: true });
  }

  handleDeleteDialogYes = () => {
    let o = this.state.objectTypes;
    o.splice(this.state.deleteId, 1);
    this.setState({ objectTypes : o });
    this.setState({ wannaUpdate : true });
    this.setState({ openDeleteDialog: false });
  }

  handleDeleteDialogNo = () => {
    this.setState({ openDeleteDialog: false })
  }

  linearProgress = () => {
    return this.state.showProgress ? `<LinearProgress mode="indeterminate" color"red"/>` : ''
  }

  handleSelectObject = (event, index, value)  => {
    this.setState({selectedObject : value});
  }

  regenerate = () => {
    this.setState({publishToken : md5(this.state.publishToken)});
    this.setState({ wannaUpdate : true });
  }

  render() {
    const dialogHeader = styles.dialogHeader;

    let objects =
    this.state.objects.map((item, index) =>
        <MenuItem
          key={index}
          value={item._id}
          primaryText={item.objectId} />
    );

    let objectTypes =
    this.state.objectTypes ? this.state.objectTypes.map((item, index) =>
      <ListItem
        key={index}
        primaryText={item.objectId}
        onClick={() => this.editObject(item, index)}
        rightIconButton={<IconButton onClick={() => this.deleteDialog(index, 'object')}><Delete /></IconButton>}>
      </ListItem>
    ) :
      <ListItem/>;

    return (
        <div>
          <LinearProgress mode="indeterminate" color="red" style={this.state.showProgress}/>
          <AppBar
            style={ styles.appBarStyle }
            title={ this.state.systemName ?
              'System ' + this.state.systemName + this.state.zcard
              : 'System ' + this.state.systemId + this.state.zcard
            }
            iconElementRight={
            <IconMenu
              iconButtonElement={
              <IconButton><MoreVertIcon /></IconButton>
              }
              targetOrigin={{horizontal: 'right', vertical: 'top'}}
              anchorOrigin={{horizontal: 'right', vertical: 'top'}}
            >
            <MenuItem onClick={this.goSystems} primaryText="Back to systems" />
            <MenuItem onClick={logout} primaryText="Log out" />
            </IconMenu>}
            iconElementLeft={<IconButton
              tooltip="Update"
              onClick={this.applyJSON}>
              {this.state.wannaUpdate ? <NavigationRefresh /> : <NavigationCheck />}
            </IconButton>}
          />
          <Card style={styles.cardStyle}>
              <TextField
                floatingLabelText="userId"
                errorText={this.state.userIdErrorText}
                onChange={this.changeUserId}
                value={this.state.userId}
                disabled={true}
                fullWidth={true}
              />
              <TextField
                floatingLabelText="systemId"
                errorText={this.state.systemIdErrorText}
                onChange={this.changeSystemId}
                value={this.state.systemId}
                disabled={true}
                fullWidth={true}
              />
              <TextField
                floatingLabelText="publishToken"
                onChange={this.changePublishToken}
                value={this.state.publishToken}
                disabled={true}
                fullWidth={true}
              />
              <FlatButton onClick={() => this.regenerate()} label="Regenerate Token" />
              <TextField
                floatingLabelText="systemName"
                onChange={this.changeSystemName}
                value={this.state.systemName}
                fullWidth={true}
              />
              <TextField
                floatingLabelText="systemDescription"
                onChange={this.changeSystemDescription}
                value={this.state.systemDescription}
                fullWidth={true}
              />
              <SelectField
                floatingLabelText="systemType"
                onChange={this.changeSystemType}
                value={this.state.systemType}
                fullWidth={true}
                >
                <MenuItem value={"1C"} primaryText="1C" />
                <MenuItem value={"Other"} primaryText="Other" />
              </SelectField>
              <SelectField
                floatingLabelText="scriptLanguage"
                onChange={this.changeScriptLanguage}
                value={this.state.scriptLanguage}
                fullWidth={true}
                >
                <MenuItem value={"oscript"} primaryText="oscript" />
                <MenuItem value={"JS"} primaryText="JS" />
              </SelectField>
              <h3>Objects list</h3>
              <List>{objectTypes}</List>
              <SelectField
                  floatingLabelText="Select object"
                  value={this.state.selectedObject}
                  onChange={this.handleSelectObject}
                  errorText={this.state.selectedObjectErrorText}
                  fullWidth={true}
                >
                {objects}
              </SelectField>
              <br/>
              <FlatButton onClick={this.addObject} secondary={true} label="Add object" />
            </Card>

            <Dialog
              titleStyle={dialogHeader}
              title={this.state.deleteDialogHeader}
              actions={[
                <FlatButton
                  label="No"
                  primary={true}
                  onClick={this.handleDeleteDialogNo}
                />,
                <FlatButton
                  label="Yes"
                  primary={true}
                  onClick={this.handleDeleteDialogYes}
                />,
              ]}
              modal={true}
              open={this.state.openDeleteDialog}>
              <h3>{this.state.deleteDialogText}</h3>
            </Dialog>

          </div>
        );


  }
}

export default ChangeSystem;
