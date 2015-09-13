import React from 'react'

import SimulationStore from '../../stores/simulation_store';


import {Accordion, Panel} from 'react-bootstrap';
import SimulationAction from '../../actions/simulation_action';

import ReplayPanel from './replay_panel.jsx'
import {PureRenderComponent, ImmutablePropComponent} from '../common_components.jsx'


class ControlSideBar extends PureRenderComponent{
  
    
  constructor(props){
    super(props);
  }
  
  
  replayStartOnClick(e){
    console.log("replay start on click");
    e.preventDefault();
    SimulationAction.replayStart();
  }

  replayPauseOnClick(e){
    console.log("replay pause on click");
    e.preventDefault();
    SimulationAction.replayPause();
  }

  render(){
    console.log("control_side_bar is rendering", this.props, this.state);
    var active_jvm_id = this.state.data.get("active_jvm_id");
    var replay_panel;
    if(active_jvm_id){
      replay_panel = <ReplayPanel store = {this.state.data.get("simulation_map").get(active_jvm_id)}/>
    }
    return(
      <aside className="control-sidebar control-sidebar-light" 
             style={{position:"fixed", bottom:10, overflowY:'auto', width: this.state.data.get("width", 200)}}>
        <ul className="nav nav-tabs nav-justified control-sidebar-tabs">
          <li><a href="#" data-toggle="tab" ><i className="fa fa-step-backward"></i></a></li>
          <li><a href="#" data-toggle="tab" onClick={this.replayStartOnClick}><i className="fa fa-play-circle"></i></a></li>
          <li><a href="#" data-toggle="tab"><i className="fa fa-step-forward"></i></a></li>
          <li><a href="#" data-toggle="tab" onClick={this.replayPauseOnClick}><i className="fa fa-pause"></i></a></li>          
                
        </ul>
        
        {replay_panel}
        
        
      </aside>
    );
  }
}

export default ControlSideBar
