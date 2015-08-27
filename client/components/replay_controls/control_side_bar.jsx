import React from 'react'

import SimulationStore from '../../stores/simulation_store';


import {Accordion, Panel} from 'react-bootstrap';

import ReplayPanel from './replay_panel.jsx'

class ControlSideBar extends React.Component{
  
    
  constructor(props){
    super(props);
    this.state = {width:200, active_jvm_name: SimulationStore.getData().active_jvm_name};
    this._onChange = this._onChange.bind(this);
  }
  
  componentDidMount() {
    SimulationStore.addUpdateEventListener(this._onChange);
  }

  componentWillUnmount() {
    SimulationStore.removeUpdateEventListener(this._onChange);
  }

  _onChange() {
    this.setState({active_jvm_name: SimulationStore.getData().active_jvm_name});
  }

  render(){
    console.log("control_side_bar is rendering", this.props, this.state, SimulationStore.getData());
    var replay_panel;
    if(this.state.active_jvm_name){
      replay_panel = <ReplayPanel jvm_name={this.state.active_jvm_name}/>
    }
    return(
      <aside className="control-sidebar control-sidebar-light" style={{position:"fixed", bottom:10, overflowY:'auto', width: this.state.width}}>
        <ul className="nav nav-tabs nav-justified control-sidebar-tabs">
          <li><a href="#" onClick={()=>this.setState({width: this.state.width+150})}><i className="fa fa-expand"></i></a></li>
          <li><a href="#" onClick={()=>this.setState({width: this.state.width-150})}><i className="fa fa-compress"></i></a></li>          
          <li><a href="#" data-toggle="tab"><i className="fa fa-step-backward"></i></a></li>
          <li><a href="#" data-toggle="tab"><i className="fa fa-play-circle"></i></a></li>
          <li><a href="#" data-toggle="tab"><i className="fa fa-step-forward"></i></a></li>
          <li><a href="#" data-toggle="tab"><i className="fa fa-pause"></i></a></li>          
                
        </ul>
        
        {replay_panel}
        
        
      </aside>
    );
  }
}

export default ControlSideBar
