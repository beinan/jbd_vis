import React from 'react'

import Actor from './actor.jsx'
import Signal from './signal.jsx'
import Lifeline from './lifeline.jsx'
import {ImmutablePropComponent, PureRenderComponent, ContentBox} from '../common_components.jsx';

import SimulationBar from '../replay_controls/simulation_bar.jsx'
import Monitor from '../replay_controls/monitor.jsx'

import StoreFactory from '../../stores/store_factory'

export default class SeqDiagram extends PureRenderComponent{
  constructor(props){
    super(props);
  }
  
  //for actor reconcile
  componentDidMount(){
    super.componentDidMount();
    this.setState({data: this.props.store.getData()});
  }
  render(){
    console.log("seq diagram is rendering", this.state,this.props);
    var actors = [];
    var signals = [];
    var lifelines = [];
    if(this.state.data.get("status") === "ready"){
      actors = this.state.data.get("actor_map").toArray().map(
        (actor_store) => {
          //console.log("actor store", actor_store);
          return <Actor key={"actor_"+actor_store.get("_id")} jvm_id={this.props.jvm_id} store={actor_store}/>
        }
      );
      signals = this.state.data.get("signal_map").toArray().map(
        (signal_store) => {
          //console.log("signal store", signal_store);
          return <Signal key={"signal_" + signal_store.get("_id")} 
                           max_width = {this.state.data.get("width")}
                           jvm_id={this.props.jvm_id} store={signal_store} /> 
        }
      )
      lifelines = this.state.data.get("lifeline_map").toArray().map(
        (lifeline_store)=> {
          //console.log("lifeline store", lifeline_store);
          return <Lifeline key={"lifeline_" + lifeline_store.get("_id")} jvm_id={this.props.jvm_id} store={lifeline_store} />
        }
      );
    }
    var marker='<marker id="end" viewBox="0 -5 10 10" refX="10" refY="0" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,-5L10,0L0,5"></path></marker>';
    return(
      <div>
        <div style={{position: 'fixed',top: 50, left: 200, backgroundColor: 'white'}}>
          <Monitor store={StoreFactory.getSimulationListStore().get("simulation_map").get(this.props.jvm_id).getMonitorStore()}/>
        </div>
      <svg width={this.state.data.get("width")} height={this.state.data.get("height")}>
        <defs dangerouslySetInnerHTML={{__html: marker}}>          
        </defs>
        {actors}
        {signals}
        {lifelines}
        <SimulationBar jvm_id={this.props.jvm_id} 
                       seq_diag_store={this.props.store} 
                       max_width = {this.state.data.get("width")}
                       store={StoreFactory.getSimulationListStore().get("simulation_map").get(this.props.jvm_id)}/>
      </svg>
      </div>
    );
  }
}

