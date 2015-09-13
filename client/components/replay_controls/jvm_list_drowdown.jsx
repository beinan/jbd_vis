import React from 'react'


import AppAction from '../../actions/app_action';
import SimulationAction from '../../actions/simulation_action';

import ViewType from '../../view_type.js';

//import SimulationAction from '../../actions/simulation_action';

import {PureRenderComponent, ImmutablePropComponent} from '../common_components.jsx'


import {Button} from 'react-bootstrap';


class JvmListDropDownEntry extends PureRenderComponent{
  constructor(props){
    super(props);
    this._onClickVisualizeButton = this._onClickVisualizeButton.bind(this);
  }
  
  _onClickVisualizeButton(){
    console.log("click vis");
    AppAction.setView(ViewType.SIMULATION_VIEW, {jvm_id: this.props.jvm_id});
    //console.log("sim", SimulationAction);
    SimulationAction.startSimulation(this.props.jvm_id);
  }

  render(){
    var simulation_button = null
    if(this.state.data.get('status') == 'ready'){
      simulation_button = <Button bsStyle="primary" bsSize='xsmall'  onClick={this._onClickVisualizeButton}>Simulation</Button>
    }
    return (
     <li>
       <i class="fa fa-users text-aqua"></i>
       <a href="#" onClick={this.onClick}>
         {this.props.jvm_id}
         (status:{this.state.data.get('status')})
         {simulation_button}
       </a>
     </li>
   
   ); 
  }
}



class JvmListDropDown extends PureRenderComponent{
  
    
  constructor(props){
    super(props);
    this._onClick = this._onClick.bind(this);
  }
  
 
  _onClick(e){
    e.preventDefault();
    //console.log("onclick",e);
    this.setState({is_open:!this.state.is_open}); 
  }

  render(){
    //console.log("jvm list drow down is rendering", this.state);
    var jvm_array = this.state.data.get("jvm_map") ? this.state.data.get("jvm_map").toArray() : [];
    var jvm_seq_diagrams = jvm_array.map(
      (jvm_store)=>  //each element is a JvmStore instance
      <JvmListDropDownEntry jvm_id={jvm_store.get("_id")} store={jvm_store.get('seq_diag_store')}/>
    );
    var count = this.state.data.get("ready_seq_count");
    return(
      <li className={"dropdown tasks-menu " + (this.state.is_open?"open":"")}>
        <a href="#" className="dropdown-toggle" onClick={this._onClick}>
          <i className="fa fa-flag-o"></i>
          <span className="label label-danger">{count}</span>
        </a>
        <ul className="dropdown-menu">
          <li className="header">You have {count} sequence diagram(s) ready.</li>
          {jvm_seq_diagrams}
        </ul>
      </li>
    );
  }
}

export default JvmListDropDown
