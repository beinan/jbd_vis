import React from 'react'

import SimulationStore from '../../stores/simulation_store';
import {PureRenderComponent, ImmutablePropComponent} from '../common_components.jsx'
import SimulationAction from '../../actions/simulation_action';

const VALUE_COLOR = {
  'read':'green',
  'write':'red',
  'invoke': 'blue',
  'params': 'black'
};
class SourceLine extends React.Component{
  constructor(props){
    super(props);
    this.state= {is_value_display:false};
  }
  render(){
    var class_name = "";
    if(this.props.is_current){
      class_name = "hierarchy bring-up";
    }
    var is_value_display = 'none';
    if(this.state.is_value_display)
      is_value_display = 'block';
    var values = [(<span style={{display:'block', color:'Orange'}}>Unreached code or no data.</span>)];
    if(this.props.display_value){
      var watch=(field_data, e)=>{
        e.preventDefault();
        console.log(field_data);
        SimulationAction.addWatchField(field_data.field_original);
      }
      values = this.props.display_value.map((v)=>{
        var msg="";
        var ops = null; //operation buttons if available
        if(v.op == "read"){
          msg = "Get " + v.value + " from " + v.field;
          ops = (<a href="#" onClick={watch.bind(null, v)} className="btn btn-primary btn-sm">Watch</a>);
        }else if(v.op == 'write'){
          msg = 'Set ' + v.value + " to " + v.field;
        }else if(v.op == 'invoke'){
          msg = 'Invoke ' + v.method.split('#')[1].split('(')[0] + JSON.stringify(v.params);
        }else if(v.op=='params'){
          msg = 'Pass in ' + JSON.stringify(v.value);
        }
        return (
          <span style={{display:'block', color:VALUE_COLOR[v.op]}}>{msg}<span style={{marginLeft:10}}>{ops}</span></span>
        );
      });
    }
    return (
      <div>
        <div style={{marginTop:10, paddingLeft:20, backgroundColor:'#cccccc', display:is_value_display}}>{values}</div>
        <pre className={class_name} style={{margin:0, fontSize:10, padding:2}} onClick={()=>{this.setState({is_value_display:!this.state.is_value_display})}}>
          <code className="language-java" data-lang="java">{this.props.line_number + ":" + this.props.line}</code>
        </pre>
      </div>
    );
  }

}

class SourceCodePanel extends PureRenderComponent{
  constructor(props){
    super(props);
  }

  render(){
    console.log("Source Code panel is rendering", this.state.data.get('data', {}).codes);
    var codes = [];
    var data = this.state.data.get('data', {});
    var source_codes = data.codes;
    if(source_codes){
      var start = 
      codes = source_codes.map((line, i)=>{
        var line_number = data.parent.pos.begin_line + i;
        return (
          <SourceLine line={line} line_number={line_number} 
                      is_current={line_number == data.signal.line_number} 
                      display_value={data.values[line_number]}/>
        );
      });
    }
    
    return (
      <div>
        {codes}
      </div>
    );
  }
}

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
    if(this.props.store.getCurrentSignalDetailStore()){
      console.log("update source code panel");
      codes = <SourceCodePanel key={this.props.store.getCurrentSignal()._id} store={this.props.store.getCurrentSignalDetailStore()}/>
    }
    /*
    if(current_signal && current_signal.line_number){
      var line = current_signal.line_number;
      var start = (line - 8 < 0)?0:line - 8;
      var end = line + 15;
      var source = this.props.store.get_source(current_signal);
      console.log("source", source);
    }
    */
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
