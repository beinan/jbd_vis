import React from 'react'


import {Button, Input, Label, Fade, Collapse,Badge, Grid, Row, Col, Well} from 'react-bootstrap';

import {ImmutablePropComponent, PureRenderComponent, ContentBox} from '../common_components.jsx';

import SeqDiagram from '../seq_diagram/seq_diagram.jsx'

import StoreFactory from '../../stores/store_factory';

export default class SimulationView extends React.Component{
  
  constructor(props){
    super(props);
  }

 
  render(){
    console.log("rendering simulation_view", this.props);
    var jvm_id = this.props.jvm_id;
    console.log(jvm_id,  StoreFactory.getJvmProcessListStore().getJvm(jvm_id));
    var seq_store = StoreFactory.getJvmProcessListStore().getJvm(jvm_id).getSeqDiagram();
    var seq_diagram = (
      <SeqDiagram jvm_id={jvm_id} store ={seq_store} />
    )
    return (
      <div>
        {/*header*/}
        <section className="content-header">
          <h1>
            Execution Simulation 
            <small></small>
          </h1>
          <ol className="breadcrumb">
            <li><i className="fa fa-dashboard"></i> Home</li>
            <li className="active">Execution Simulation</li>
          </ol>
        </section>
        {/*content*/}
        <div className="content body">
          
          <div className="row" style={{overflow:'auto'}}>
            {seq_diagram}
          </div>
          
        </div>
      </div>
    )
  }

}
