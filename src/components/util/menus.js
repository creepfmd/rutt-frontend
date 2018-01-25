import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

export class menuSystems extends Component {

  logout = () => {
    window.location.href = `/login`;
  }

  render() {
    return (
      <IconMenu
        iconButtonElement={
          <IconButton><MoreVertIcon /></IconButton>
        }
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
      >
        <MenuItem onClick={() => this.defaultObjects} primaryText="Default Objects" />
        <MenuItem onClick={() => this.logout} primaryText="Logout" />
      </IconMenu>
    );
  }
};
