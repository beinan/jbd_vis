import React from 'react'

import SimulationStore from '../../stores/simulation_store';
import {PureRenderComponent, ImmutablePropComponent} from '../common_components.jsx'




class ReplayPanel extends PureRenderComponent{
  
    
  constructor(props){
    super(props);
    
    this._onChange = this._onChange.bind(this);
    //this.seq_diag_store = SimulationStore.getData().seq_diagrams[this.props.jvm_name];
    //current replay signal in seq diagram is a method invocation 
    //this.state = {current_method: this.seq_diag_store.curr_replay_signal};  
    //this.replay_store = this.seq_diag_store.replay_store;
  }
  
  //componentDidMount(){
    //this.seq_diag_store.addReplayEventListener(this._onChange);
    //this.replay_store.addUpdateEventListener(this._onChange);
  //}

  //componentWillUnmount() {
    //this.seq_diag_store.removeReplayEventListener(this._onChange);
    //this.replay_store.removeUpdateEventListener(this._onChange);
  //}

  //_onChange() {
    //this.setState({current_method: this.seq_diag_store.curr_replay_signal, method_invocation_data: this.replay_store.data});
  //}

  render(){
    console.log("ReplayPanel is rendering", this.props, this.state);
    var signal_messages = [];
    if(this.state.method_invocation_data){
      signal_messages.push({msg:"parameters passed in:[" + 
                                this.state.method_invocation_data.params.map((p)=>p.value).join(",") + "]",
                            icon: "fa-info  bg-aqua"
      });
      for(let signal of this.state.method_invocation_data.out_signals){
        var msg, icon;
        if(signal.signal_type == "method_invoke"){
          msg = "Call method: " + signal.method_desc;
          icon = "fa-phone  bg-yellow";
        }
        if(signal.signal_type == "field_setter"){
          msg = "Store a value " + signal.value + "  to field:" + signal.field + " version:" + signal.version;
          icon = "fa-save bg-red";
        }
        if(signal.signal_type == "field_getter"){
          msg = "Read a value " + signal.value + "  from field:" + signal.field + " version:" + signal.version;
          icon = "fa-search bg-green";
        }
        signal_messages.push({
          msg: msg,
          icon: icon
        });
      }
    }
    var timeline_nodes = signal_messages.map(
      (m)=>
      {
        return (<li>
          <i className={"fa " + m.icon}></i>
          <div className="timeline-item">
            
            <h4 className="timeline-header no-border">
              {m.msg}
            </h4>
          </div>
        </li>);
      }
    );
    return(
      <div>
        <ul className="timeline">
          <li className="time-label">
            <span className="bg-red">
            {this.state.data.get('tick')}
            </span>
          </li>
          {timeline_nodes}
        </ul>
      </div>
      
    );
  }
}

export default ReplayPanel
