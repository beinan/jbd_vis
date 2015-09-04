import React from 'react'
import ViewType from '../view_type'

import AppAction from '../actions/app_action'

import {ImmutablePropComponent} from './common_components.jsx'

class MenuItem extends ImmutablePropComponent{

  constructor(props) {
    super(props); 
    this._handleClick = this._handleClick.bind(this);
  }
    
  render() {
    console.log("menu item is rendering", this.props);
    var li_class = "";
    if(this.props.is_active){
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
 
  _handleClick(e){
    e.preventDefault();
    console.log("menu item click", this.props.view_name);
    AppAction.setView(this.props.view_name);
  }
}

class MainSideBar extends ImmutablePropComponent{
  constructor(props) {
    super(props);
  }
  

  render(){
    var sideBarMenu = (
      <ul className="sidebar-menu">
        <li className="header" key="main_menu_section">Main Menu</li>
        <MenuItem view_name={ViewType.JVMS_VIEW} title="JVM Processes" is_active={this.props.view_name == ViewType.JVMS_VIEW}/>
        <MenuItem view_name={ViewType.SIMULATION_VIEW} title="Simulation" is_active={this.props.view_name == ViewType.SIMULATION_VIEW}/>
        
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
