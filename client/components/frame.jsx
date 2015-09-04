import React from 'react';



import JvmListDrowDown from './replay_controls/jvm_list_drowdown.jsx'

import {PureRenderCommponent, ImmutablePropComponent} from './common_components.jsx'

class TopNavBar extends React.Component{
  constructor(props){
    super(props);
    this._sidebarToggle = this._sidebarToggle.bind(this);
  }
  
  _sidebarToggle(){
    $("body").toggleClass('sidebar-collapse');
  }
  render(){
    return (
      <nav className="navbar navbar-static-top" role="navigation">
        <a href="#" onClick={this._sidebarToggle} className="sidebar-toggle" role="button">
          <span className="sr-only">Toggle navigation</span>
        </a>
        <div className="navbar-custom-menu">
          <ul className="nav navbar-nav">
            <JvmListDrowDown />
            <li>
              <a href="#" onClick={()=>$(".control-sidebar").toggleClass("control-sidebar-open")}><i className="fa fa-gears"></i></a>
            </li>
          </ul>
        </div>
      </nav>  
    )
  }
}

class Header extends React.Component{
  render() {
    return (
      <header className="main-header">
        <a href="index2.html" className="logo">
          <span className="logo-mini"><b>J</b></span>
          <span className="logo-lg"><b>J</b>BD</span>
        </a>
        <TopNavBar/>
      </header>
    )
  }  
}

import MainSideBar from './main_side_bar.jsx'
import ContentWrapper from './content_wrapper.jsx'
import ControlSideBar from './replay_controls/control_side_bar.jsx'

class Frame extends PureRenderCommponent{
  constructor(props) {
    super(props);
  }
      
  render() {
    return (
      <div className="wrapper" style={{height:this.state.data.get("height"), overflowY:'auto'}}>
        <Header/>
        <MainSideBar view_name = {this.state.data.get("view_name")}/>
        <ContentWrapper view_name = {this.state.data.get("view_name")}/>
        <ControlSideBar/>
      </div>
    );
  }
  
}
 
export default Frame;
