import React from 'react'

import SimulationStore from '../../stores/simulation_store';
import {PureRenderComponent, ImmutablePropComponent} from '../common_components.jsx'
import SimulationAction from '../../actions/simulation_action';




class ReplayPanel extends PureRenderComponent{
  
    
  constructor(props){
    super(props);
    
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
    //this._onChange = this._onChange.bind(this);
    //this.seq_diag_store = SimulationStore.getData().seq_diagrams[this.props.jvm_name];
    //current replay signal in seq diagram is a method invocation 
    //this.state = {current_method: this.seq_diag_store.curr_replay_signal};  
    //this.replay_store = this.seq_diag_store.replay_store;
  }
  componentDidUpdate(prevProps, prevState){
    var current_signal = this.props.store.getCurrentSignal();
    if(current_signal){
       SimulationAction.activeLifeline(current_signal.from_id);
    }
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
    var current_signal = this.props.store.getCurrentSignal();
    console.log("current signal", current_signal);
    var codes, json;
    if(current_signal){
      json = (<p>{JSON.stringify(current_signal)}</p>);
      //SimulationAction.activeLifeline(current_signal.from_id);
    }
    if(current_signal && current_signal.line_number){
      var line = current_signal.line_number;
      var start = (line - 8 < 0)?0:line - 8;
      var end = line + 15;
      var source = this.props.store.get_source(start, end);
      console.log("source", source);
      codes = source.map((line, i)=>{
        var line_number = start + i + 1;
        if(line_number == current_signal.line_number){
          var value = "";
          if(current_signal.field)
            value = "//{" + current_signal.field + ":" + current_signal.value + "}";
          return (
            <pre className="hierarchy bring-up" style={{margin:0, fontSize:10, padding:2}}>
              <code className="language-java" data-lang="java">{line_number + ":" + line + value}</code>
            </pre>
          );
        }
        return (
          <pre style={{margin:0, fontSize:10, padding:2}}>
            <code className="language-java" data-lang="java" >{line_number + ":" + line }</code>
          </pre>
        );
      });
    }

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
         
          {codes}
        </ul>
      </div>
      
    );
  }
}

export default ReplayPanel
