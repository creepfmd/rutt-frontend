// src/components/Object/index.js
import React, { Component } from 'react';
//import ReactDOM from 'react-dom';
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
import { makeRequest, logout, styles } from '../util';

class ChangeObject extends Component {
  static propTypes = {}
  static defaultProps = {}

  constructor(props) {
    super(props);
    this.state = {
      _id : '',
      objectId : '',
      objectName : '',
      preloadScript : '',
      preloadActions: [],
      destinations: [],
      addPreloadAction: '',
      setPreloadActions: [], // параметры видимости
      changePreloadActions: null,
      addPreloadActionParam: '',
      addDestination: '',
      systems: [],
      selectedSystem: '',
      openPreloadDialog : false,
      changePreloadActionsActionParameters: [],
      addPreloadActionParamErrorText : '',
      changePreloadActionsActionIdErrorText : '',
      addPreloadActionErrorText : '',
      openDeleteDialog : false,
      deleteDialogText : '',
      deleteDialogHeader : '',
      deleteId : null,
      deleteParam : '',
      selectedSystemErrorText : '',
      showProgress : styles.reloadBarOff,
      wannaUpdate : false,
      objectIdErrorText : '',
      originalSystem: null,
      openParamDialog : false,
      editPreloadActionParamAddDisabled : false,
      split: '$.*'
    };
  }

  componentDidMount () {
    this.getUser();
    if (this.props.params.systemId) {
      this.getDestinationInside(
        this.props.params.systemId,
        this.props.params.objectId,
        this.props.params.destinationId)
      }
    else
      this.getDestinationInObject(
        this.props.params.objectId,
        this.props.params.destinationId)
  }

	getUser = () => {
    let _this = this;
    makeRequest('GET', 'me').then(data => {
      let response = JSON.parse(data);
      _this.setState({
        user : response,
      });
      this.getSystems();
    })
    .catch(err => {
      if (err.status === 401)
        window.location.href = `/login`
    });
  }

	getSystems = () => {
    let _this = this;
    makeRequest('GET', 'systems/' + this.state.user._id).then(data => {
      let response = JSON.parse(data);
      _this.setState({
        systems : response.systems,
      });
    })
    .catch(err => {
      window.location.href = `/login`
    });
  }

	getDestinationInObject = (id, destinationIndex) => {
    let _this = this;
    makeRequest('GET', 'object/' + id).then(data => {
      let o = JSON.parse(data);
      let d = o.destinations[destinationIndex];
      _this.setState({
          id : d.id,
          systemId : d.systemId,
          systemName : d.systemName,
          split : d.split,
          preloadScript : d.preloadScript,
          afterloadScript : d.afterloadScript,
          preloadActions: d.preloadActions,
          originalObject: o
        });
      _this.setState({ showProgress : styles.reloadBarOff });
    })
    .catch(err => {
      window.location.href = `/login`
    });
  }

	getDestinationInside = (systemId, objectIndex, destinationIndex) => {
    let _this = this;
    this.setState({ showProgress : styles.reloadBarOn });
    makeRequest('GET', 'system/' + systemId).then(data => {
      let s = JSON.parse(data)[0];
      let o = s.objectTypes[objectIndex];
      let d = o.destinations[destinationIndex];
      _this.setState({
          id : d.id,
          systemId : d.systemId,
          systemName : d.systemName,
          split : d.split,
          preloadScript : d.preloadScript,
          afterloadScript : d.afterloadScript,
          preloadActions: d.preloadActions,
          originalSystem: s
        });
      _this.setState({ showProgress : styles.reloadBarOff });
    })
    .catch(err => {
      _this.setState({ showProgress : styles.reloadBarOff });
      if (err.status === 401)
        window.location.href = `/notauth`
    });
  }

  /* Params func */
  changePreloadScript = (event) => {
    this.setState({preloadScript : event.target.value});
    this.setState({ wannaUpdate : true });
  }

  changeAfterloadScript = (event) => {
    this.setState({afterloadScript : event.target.value});
    this.setState({ wannaUpdate : true });
  }

  changeSplit = (event) => {
    this.setState({split : event.target.value});
    this.setState({ wannaUpdate : true });
  }

  /* preloadActions func */
  addAction = () => {
    let o = this.state.preloadActions;
    if (this.state.addPreloadAction.trim().length > 0) {
      switch (this.state.addPreloadAction) {
        case 'calculate':
          o.push({
            actionId : this.state.addPreloadAction,
            actionParameters : ['edit', 'edit', 'edit']
          });
          break;
        default:
          o.push({
            actionId : this.state.addPreloadAction,
            actionParameters : ['edit', 'edit']
          });
          break;
      }
      this.setState({ addPreloadActionErrorText : '' });
      this.setState({ wannaUpdate : true });
    } else {
      this.setState({ addPreloadActionErrorText : 'This field is required' });
    }
  }

  changePreloadAction = (event, index, value) => {
    this.setState({addPreloadAction : value})
  }

  goObjects = () => {
    window.location.href = `/objects`;
  }

  goSystem = () => {
    window.location.href = `/system/${this.props.params.systemId}`;
  }

  apply = () => {
    if (this.props.params.systemId)
      this.applyJSONInside()
    else
      this.applyJSONInsideObject()
  }

  applyJSONInsideObject = () => {
    let _this = this;
    let o = this.state.originalObject;

    this.setState({ showProgress : styles.reloadBarOn });

    o.destinations[this.props.params.destinationId] = {
      systemId : this.state.systemId,
      systemName : this.state.systemName,
      split: this.state.split,
      afterloadScript : this.state.afterloadScript,
      preloadScript : this.state.preloadScript,
      preloadActions: this.state.preloadActions
    };

    makeRequest('PUT',
    `object/${this.props.params.objectId}`,
      {
        objectId : o.objectId,
        objectName : o.objectName,
        preloadScript : o.preloadScript,
        preloadActions: o.preloadActions,
        destinations: o.destinations,
      }).then( data => {
        _this.getDestinationInObject(_this.props.params.objectId, _this.props.params.destinationId);
        _this.setState({ showProgress : styles.reloadBarOff });
        _this.setState({ wannaUpdate : false });
    })
    .catch(err => {
      window.location.href = `/login`
    });
  }

  applyJSONInside = () => {
    let _this = this;
    let o = this.state.originalSystem.objectTypes;

    this.setState({ showProgress : styles.reloadBarOn });

    o[this.props.params.objectId].destinations[this.props.params.destinationId] = {
      systemId : this.state.systemId,
      systemName : this.state.systemName,
      split: this.state.split,
      afterloadScript : this.state.afterloadScript,
      preloadScript : this.state.preloadScript,
      preloadActions: this.state.preloadActions
    };

    makeRequest('PUT',
    `system/${this.props.params.systemId}`,
    {
      userId : this.state.originalSystem.userId,
      systemId : this.state.originalSystem.systemId,
      publishToken : this.state.originalSystem.publishToken,
      systemName : this.state.originalSystem.systemName,
      systemDescription : this.state.originalSystem.systemDescription,
      systemType : this.state.originalSystem.systemType,
      scriptLanguage : this.state.originalSystem.scriptLanguage,
      objectTypes : o
    }).then( data => {
      _this.getDestinationInside(_this.props.params.systemId, _this.props.params.objectId, _this.props.params.destinationId);
      _this.setState({ showProgress : styles.reloadBarOff });
      _this.setState({ wannaUpdate : false });
    })
    .catch(err => {
      _this.setState({ showProgress : styles.reloadBarOff });
      alert('System update error')
    })
  }

  casePreload = (index) => {
    return this.state.setPreloadActions[index] ?
      { display: 'none'}
     : { display: 'flex'}
  }

  casePreloadInvert = (index) => {
    return this.state.setPreloadActions[index] ?
      { display: 'flex'}
     : { display: 'none'}
  }

  changeAction = (item, index) => {
    let s = item.actionParameters;
    this.setState({ changePreloadActionsIndex : index });
    this.setState({ changePreloadActionsActionId : item.actionId });
    this.setState({ changePreloadActionsActionParameters : s });
    this.setState({ editPreloadActionParamAddDisabled : this.isAddPreloadParamDisabled(item.actionId) });
    this.setState({ openPreloadDialog : true });
  }

  changeSelectedAction = (id) => {
    let s = this.state.setPreloadActions;
    this.setState({ changePreloadActions : id });
    s[id] = !s[id];
    this.setState({ setPreloadActions : s });
  }

  changeSelectedInputAction = (event) => {
    this.setState({changePreloadActionsActionId : event.target.value})
  }

  newSelectedInputActionParams = (event) => {
    this.setState({addPreloadActionParam : event.target.value})
  }

  newSelectedActionParamClick = (event) => {
    let s = this.state.changePreloadActionsActionParameters;
    if (this.state.addPreloadActionParam.length > 0) {
      s.push(this.state.addPreloadActionParam);
      this.setState({ changePreloadActionsActionParameters : s });
      this.setState({ addPreloadActionParam : '' });
      this.setState({ addPreloadActionParamErrorText : '' });
    } else {
      this.setState({ addPreloadActionParamErrorText : 'This field is required' });
    }
  }

  handleSelectSystem = (event, index, value)  => {
    this.setState({selectedSystem : value});
  }

  handleDialogSelectedPreloadCancel = () => {
    this.setState({ openPreloadDialog : false });
  }

  handleDialogSelectedPreloadSave = () => {
    let s = this.state.preloadActions;
    if (this.state.changePreloadActionsActionId.length > 0) {
      s[this.state.changePreloadActionsIndex].actionId = this.state.changePreloadActionsActionId;
      s[this.state.changePreloadActionsIndex].actionParameters = this.state.changePreloadActionsActionParameters;
      this.setState({ preloadActions : s });
      this.setState({ changePreloadActionsActionIdErrorText : '' });
      this.setState({ openPreloadDialog : false });
      this.setState({ wannaUpdate : true });
    } else {
      this.setState({ changePreloadActionsActionIdErrorText : 'This field is required' });
    }

  }

  deleteDialog = (index, param)  => {
    this.setState({deleteId: index});
    this.setState({deleteParam: param});
    this.setState({ deleteDialogText : 'Are you sure?' });
    switch (param) {
      case 'action':
        this.setState({ deleteDialogHeader : 'Delete preload action' });
        break;
      case 'destination':
        this.setState({ deleteDialogHeader : 'Delete destination' });
        break;
      case 'parameter':
        this.setState({ deleteDialogHeader : 'Delete preload parameter' });
        break;
      default:
        break;
    }
    this.setState({openDeleteDialog: true});
  }

  handleDeleteDialogYes = () => {
    let o = this.state.preloadActions;
    let d = this.state.destinations;
    let p = this.state.changePreloadActionsActionParameters;

    switch (this.state.deleteParam) {
      case 'action':
        o.splice(this.state.deleteId, 1);
        this.setState({ preloadActions : o });
        break;
      case 'destination':
        d.splice(this.state.deleteId, 1);
        this.setState({ destinations : d });
        break;
      case 'parameter':
        p.splice(this.state.deleteId, 1);
        this.setState({ changePreloadActionsActionParameters : p });
        break;
      default:
        break;
    }

    this.setState({ wannaUpdate : true });
    this.setState({openDeleteDialog: false});
  }

  handleDeleteDialogNo = () => {
    this.setState({openDeleteDialog: false})
  }

  linearProgress = () => {
    return this.state.showProgress ? `<LinearProgress mode="indeterminate" color"red"/>` : ''
  }

  changeSystem = (item) => {
    window.location.href = `/system/${item.systemId}`;
  }

  editPreloadParam = (item, index) => {
    this.setState({ editPreloadActionParam : item });
    this.setState({ editPreloadActionParamIndex : index });
    this.setState({ editPreloadActionParamTitle : 'Edit '  + this.getSecondaryText(index, this.state.changePreloadActionsActionId) });
    this.setState({ openParamDialog: true});
  }

  handleParamCancel = () => {
    this.setState({openParamDialog: false});
  }

  handleParamOk = () => {
    let s = this.state.changePreloadActionsActionParameters;
    s[this.state.editPreloadActionParamIndex] = this.state.editPreloadActionParam;
    this.setState({ changePreloadActionsActionParameters : s });
    this.setState({openParamDialog: false});
  }

  editSelectedActionParams = (event) => {
    this.setState({ editPreloadActionParam : event.target.value })
  }

  getSecondaryText = (index, edited) => {
    let t = '';
    switch (edited) {
      case 'replaceValue':
        t = 'param' + (index + 1);
        break;
      case 'replaceKey':
        t = 'param' + (index + 1);
        break;
      case 'addPrefix':
        t = index === 0 ? 'jsonPath' : 'prefix';
        break;
      case 'addSuffix':
        t = index === 0 ? 'jsonPath' : 'suffix';
        break;
      case 'calculate':
        t = index === 0 ? 'jsonPath' : ( index === 1 ? 'operation' : 'rightPart' );
        break;
      default:
        break;
    }
    return t
  }

  isAddPreloadParamDisabled = (edited) => {
    switch (edited) {
      case 'replaceValue':
        return false;
      case 'replaceKey':
        return false;
      default:
        return true;
    }
  }

  render() {
    const dialogHeader = styles.dialogHeader;

    let preloadActions =
    this.state.preloadActions.map((item, index) =>
      <ListItem
        key={index}
        primaryText={item.actionId}
        onClick={() => this.changeAction(item, index)}
        rightIconButton={<IconButton onClick={() => this.deleteDialog(index, 'action')}><Delete /></IconButton>}>
      </ListItem>
    );

    let actionParameters =
    this.state.changePreloadActionsActionParameters.map((item, index) =>
      <ListItem
        key={index}
        primaryText={item}
        secondaryText={this.getSecondaryText(index, this.state.changePreloadActionsActionId)}
        onClick={() => this.editPreloadParam(item, index)}
        rightIconButton={<IconButton onClick={() => this.deleteDialog(index, 'parameter')}><Delete /></IconButton>}>
      </ListItem>
    );

    return (
      <div>
        <LinearProgress mode="indeterminate" color="red" style={this.state.showProgress}/>
        <AppBar
          title={this.state.systemName ? 'Destination ' + this.state.systemName : 'Destination ' + this.state.systemId}
          style={styles.appBarStyle}
          iconElementRight={this.props.params.systemId ?
            <IconMenu
              iconButtonElement={
              <IconButton><MoreVertIcon /></IconButton>
              }
              targetOrigin={{horizontal: 'right', vertical: 'top'}}
              anchorOrigin={{horizontal: 'right', vertical: 'top'}}
            >
            <MenuItem onClick={this.goSystem} primaryText="Back to system" />
            <MenuItem onClick={logout} primaryText="Logout" />
          </IconMenu> :
          <IconMenu
              iconButtonElement={
              <IconButton><MoreVertIcon /></IconButton>
              }
              targetOrigin={{horizontal: 'right', vertical: 'top'}}
              anchorOrigin={{horizontal: 'right', vertical: 'top'}}
            >
            <MenuItem onClick={this.goObjects} primaryText="Default Objects" />
            <MenuItem onClick={logout} primaryText="Logout" />
          </IconMenu>}
          iconElementLeft={<IconButton
            tooltip="Update"
            onClick={this.apply}>
            {this.state.wannaUpdate ? <NavigationRefresh /> : <NavigationCheck />}
          </IconButton>}
        />
        <Card style={styles.cardStyle}>
            <TextField
              floatingLabelText="systemId"
              disabled={true}
              value={this.state.systemId}
              fullWidth={true}
            />
            <TextField
              floatingLabelText="systemName"
              disabled={true}
              value={this.state.systemName}
              fullWidth={true}
            />
            <TextField
              floatingLabelText="preloadScript"
              onChange={this.changePreloadScript}
              value={this.state.preloadScript}
              fullWidth={true}
            />
            <TextField
              floatingLabelText="afterloadScript"
              onChange={this.changeAfterloadScript}
              value={this.state.afterloadScript}
              fullWidth={true}
            />
            <TextField
              floatingLabelText="split"
              onChange={this.changeSplit}
              value={this.state.split}
              fullWidth={true}
            />
            <h3>preloadActions list</h3>
            <List>{preloadActions}
              <SelectField
                onChange={this.changePreloadAction}
                value={this.state.addPreloadAction}
                hintText="New preload action"
                errorText={this.state.addPreloadActionErrorText}
                fullWidth={true}
                >
                <MenuItem value={"replaceValue"} primaryText="replaceValue" />
                <MenuItem value={"replaceKey"} primaryText="replaceKey" />
                <MenuItem value={"addPrefix"} primaryText="addPrefix" />
                <MenuItem value={"addSuffix"} primaryText="addSuffix" />
                <MenuItem value={"calculate"} primaryText="calculate" />
              </SelectField>
              <FlatButton onClick={this.addAction} secondary={true} label="Add preload action" />
            </List>
          </Card>

          <Dialog
          title="Edit preload action"
          titleStyle={dialogHeader}
          actions={[
            <FlatButton
              label="Cancel"
              onClick={this.handleDialogSelectedPreloadCancel}
            />,
            <FlatButton
              label="Save"
              primary={true}
              onClick={this.handleDialogSelectedPreloadSave}
            />,
          ]}
          modal={true}
          open={this.state.openPreloadDialog}>
            <TextField
              floatingLabelText="actionId"
              hintText="actionId"
              onChange={this.changeSelectedInputAction}
              errorText={this.state.changePreloadActionsActionIdErrorText}
              fullWidth={true}
              disabled={true}
              value={this.state.changePreloadActionsActionId} />
            <h3>actionParameters</h3>
            <List>
            {actionParameters}
            </List>
            <TextField
              floatingLabelText="New preload param"
              hintText="New preload param"
              value={this.state.addPreloadActionParam}
              errorText={this.state.addPreloadActionParamErrorText}
              fullWidth={true}
              disabled={this.state.editPreloadActionParamAddDisabled}
              onChange={this.newSelectedInputActionParams}/>
            <br/>
            <FlatButton
              label="Add param"
              disabled={this.state.editPreloadActionParamAddDisabled}
              onClick={this.newSelectedActionParamClick}
            />
          </Dialog>

          <Dialog
            style={{paddingLeft: '60px', paddingRight: '60px'}}
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

          <Dialog
            style={{paddingLeft: '60px', paddingRight: '60px'}}
            titleStyle={dialogHeader}
            title={this.state.editPreloadActionParamTitle}
            actions={[
              <FlatButton
                label="Cancel"
                primary={false}
                onClick={this.handleParamCancel}
              />,
              <FlatButton
                label="Save"
                primary={true}
                onClick={this.handleParamOk}
              />,
            ]}
            modal={true}
            open={this.state.openParamDialog}>
            <TextField
              floatingLabelText={this.state.editPreloadActionParamName}
              hintText={this.state.editPreloadActionParamName}
              value={this.state.editPreloadActionParam}
              errorText={this.state.editPreloadActionParamErrorText}
              fullWidth={true}
              onChange={this.editSelectedActionParams}/>
          </Dialog>

      </div>
    );
  }
}

export default ChangeObject;
