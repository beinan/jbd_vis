import React from 'react'
import ViewType from '../view_type'
import AppStore from '../stores/app_store'

import AppAction from '../actions/app_action'

class MenuItem extends React.Component{

  constructor(props) {
    super(props);
    this.state = {is_active : AppStore.getData().view_name == props.view_name};
    this._onChange = this._onChange.bind(this);
    this._handleClick = this._handleClick.bind(this);
  }
    
  

  componentDidMount() {
    AppStore.addEventListener(AppStore.VIEW_CHANGE_EVENT, this._onChange);
  }

  componentWillUnmount() {
    AppStore.removeEventListener(AppStore.VIEW_CHANGE_EVENT , this._onChange);
  }

  render() {
    console.log("menu item is rendering", this.props);
    var li_class = "";
    if(this.state.is_active){
      li_class = "active";
    }
    return (
      <li className={li_class}>
        <a href="#" onClick={this._handleClick}>
          <i className='fa fa-link'></i> 
          <span>{this.props.title}</span>
        </a>
      </li>           
    );
  }

  _onChange() {
    var is_active = (AppStore.getData().view_name === this.props.view_name);
    if(is_active !== this.state.is_active)
      this.setState({is_active : is_active});
  }
 
  _handleClick(e){
    console.log("menu item onclick", this.props);
    e.preventDefault();
    console.log("menu item click", this.props.view_name);
    AppAction.setView(this.props.view_name);
  }
}

class MainSideBar extends React.Component{
  constructor(props) {
    super(props);
//    this.state = SessionStore.getData();
//    this._onChange = this._onChange.bind(this);
  }
    
  

//  componentDidMount() {
//    SessionStore.addEventListener(SessionStore.SESSION_READY_EVENT, this._onChange);
//  }

//  componentWillUnmount() {
//    SessionStore.removeEventListener(SessionStore.SESSION_READY_EVENT , this._onChange);
//  }

//  _onChange() {
//     this.setState(SessionStore.getData());
//  }
  

  render(){
    var sideBarMenu = (
      <ul className="sidebar-menu">
        <li className="header" key="main_menu_section">Main Menu</li>
        <MenuItem view_name={ViewType.JVMS_VIEW} title="JVM Processes" />
        <MenuItem view_name={ViewType.SIMULATION_VIEW} title="Simulation" />
        
      </ul>
    );
    
    return (
      <aside className="main-sidebar">
        <section className="sidebar">
          {sideBarMenu}
        </section>
      </aside>
    );
  }
}

export default MainSideBar
