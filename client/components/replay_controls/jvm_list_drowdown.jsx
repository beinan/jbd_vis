import React from 'react'

import SimulationStore from '../../stores/simulation_store';


class JvmListDrowDown extends React.Component{
  
    
  constructor(props){
    super(props);
    this.state = {jvm_count:0, is_open: false, jvm_list:[]};
    this._onChange = this._onChange.bind(this);
    this._onClick = this._onClick.bind(this);
    this._jvmOnClick = this._jvmOnClick.bind(this);
  }
  
  componentDidMount() {
    SimulationStore.addUpdateEventListener(this._onChange);
  }

  componentWillUnmount() {
    SimulationStore.removeUpdateEventListener(this._onChange);
  }

  _onChange(){
    var jvm_count = 0, jvm_list = [];
    for(var jvm_name in SimulationStore.getData().seq_diagrams){
      jvm_count ++;
      jvm_list.push(jvm_name);
    }
    this.setState({jvm_count:jvm_count , jvm_list:jvm_list});
  }
 
  _onClick(e){
    e.preventDefault();
    //console.log("onclick",e);
    this.setState({is_open:!this.state.is_open}); 
  }
  _jvmOnClick(jvm_name, e){
    e.preventDefault();
    SimulationStore.setActiveJvm(jvm_name);
  }
  render(){
    //console.log("jvm list drow down is rendering", this.state);
    var jvm_seq_diagrams = this.state.jvm_list.map(
      (jvm_name)=>
      <li>
        <i class="fa fa-users text-aqua"></i>
        <a href="#" onClick={this._jvmOnClick.bind(this, jvm_name)}>
          {jvm_name}
        </a>
      </li>
    );
    return(
      <li className={"dropdown tasks-menu " + (this.state.is_open?"open":"")}>
        <a href="#" className="dropdown-toggle" onClick={this._onClick}>
          <i className="fa fa-flag-o"></i>
          <span className="label label-danger">{this.state.jvm_count}</span>
        </a>
        <ul className="dropdown-menu">
          <li className="header">You have {this.state.jvm_count} sequence diagram(s) ready.</li>
          {jvm_seq_diagrams}
        </ul>
      </li>
    );
  }
}

export default JvmListDrowDown
