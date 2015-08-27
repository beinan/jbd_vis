import React from 'react'

import JvmListStore from '../../stores/jvm_list_store';
import JvmsAction from '../../actions/jvm_action';
import AppAction from '../../actions/app_action';
import SimulationAction from '../../actions/simulation_action';

import ViewType from '../../view_type';

import {ContentSection, ContentBox, UploadFileForm} from '../common_components.jsx';

import {Button, Input, Label, Fade, Collapse,Badge, Grid, Row, Col, Well} from 'react-bootstrap';

class JvmMethodsFilterClassEntry extends React.Component{
  
  constructor(props){
    super(props);
    this.state = {};
    this._onChange = this._onChange.bind(this);
  }
  
  _onChange(){ 
    this.props.class_meta.checked = !this.state.checked;
    this.setState({checked: !this.state.checked});
  }
  render(){
    var class_meta = this.props.class_meta;
    //console.log(class_meta);
    var methods = [];
    for(var method_name in class_meta.value){
      //console.log(method_name);
    }
    
    return (
      <Row>
        <Col xs={4} md={3}><Button bsStyle="info" active={this.state.checked} onClick={this._onChange}>{class_meta._id.split("/").join(".")}</Button></Col>  
        <Col xs={2}><input type='checkbox' checked={this.state.checked} onChange={this._onChange} /></Col>
      </Row>
    )
  }
}


class JvmMethodsFilter extends React.Component{
  constructor(props){
    super(props);
    this.state = this.props.jvm_data.methods_meta_data;
    //this._onClickWatchFilterButton = this._onClickWatchFilterButton.bind(this);
    this._onChange = this._onChange.bind(this);
  }

  componentDidMount() {
    this.props.jvm_data.addUpdateEventListener(this._onChange);
  }

  componentWillUnmount() {
    this.props.jvm_data.removeUpdateEventListener(this._onChange);
  }
  
  _onChange(){
    //console.log("JvmMethodsFilter _onChange");
    this.setState(this.props.jvm_data.methods_meta_data);
  }

  render(){
    console.log("method filter is rendering",this.state);
    var filter;
    if(this.state.status !== "ready"){
      filter = <p>Loading</p>;
    } else {         
      
      filter = (
        <Grid>
          {this.state.classes.map((meta)=><JvmMethodsFilterClassEntry class_meta={meta}/>)}
        </Grid>
      );
      
      //console.log("item_list is rendering");
    }
    return filter;
  }
}

class JvmEntry extends React.Component{
  constructor(props){
    super(props);
    //this.jvm_store = props.jvm_store;
    this.state = {};
    this._onClickWatchFilterButton = this._onClickWatchFilterButton.bind(this);
    this._onClickVisualizeButton = this._onClickVisualizeButton.bind(this);
    this._onClickBuildButton = this._onClickBuildButton.bind(this);
    //this._onChange = this._onChange.bind(this);

  }
  
  _onClickBuildButton(){
    console.log(this.props.jvm_data);
    this.props.jvm_data.buildSeqDiagram();
  }
  _onClickVisualizeButton(){
    console.log("click vis");
    AppAction.setView(ViewType.SIMULATION_VIEW);
    console.log("sim", SimulationAction);
    SimulationAction.startSimulation(this.props.jvm_data);
  }
  _onClickWatchFilterButton() {
    this.setState({show_watch_filter: !this.state.show_watch_filter});
  }
  
  render(){
    return (
      <li>
        {this.props.jvm_data._id}
        <Badge>{this.props.jvm_data.value.count}</Badge>
        <div className="pull-right">
          <Button bsStyle="warning" bsSize='xsmall'  onClick={this._onClickWatchFilterButton}>Watch Filter</Button>
          <Button bsStyle="primary" bsSize='xsmall'  onClick={this._onClickBuildButton}>Build</Button>
          <Button bsStyle="primary" bsSize='xsmall'  onClick={this._onClickVisualizeButton}>Simulation</Button>
        </div>
        <Collapse in={this.state.show_watch_filter}>
          <Well>
            <JvmMethodsFilter jvm_data={this.props.jvm_data}/>
          </Well>
        </Collapse>
      </li>
    );
  }
}

class JvmListBox extends React.Component{
  constructor(props){
    super(props);
    this.state = JvmListStore.getData();
    this._onChange = this._onChange.bind(this);
  }
  
  componentDidMount() {
    JvmListStore.addUpdateEventListener(this._onChange);
  }

  componentWillUnmount() {
    JvmListStore.removeUpdateEventListener(this._onChange);
  }

  _onChange() {
    this.setState(JvmListStore.getData());
  }
  
 
  render(){
    console.log(this.state);
    var item_list;
    if(this.state.status !== "ready")
      item_list = <p>Loading</p>
    else{
      var items = this.state.jvm_list.map((data)=>
         <JvmEntry key={data._id} jvm_data={data}/>
         
         );
         
      item_list = <ul className="todo-list ui-sortable">{items}</ul>;
      
      console.log("item_list is rendering");
    }
    return (
      <ContentBox title="Jvm Processes List">
        {item_list}        
      </ContentBox>
    )
  }
}




class JvmsView extends React.Component{
  constructor(props){
    super(props);
  }
  
 
  render(){
    return (
      <div>
        {/*header*/}
        <section className="content-header">
          <h1>
            JVM Processes 
            <small></small>
          </h1>
          <ol className="breadcrumb">
            <li><i className="fa fa-dashboard"></i> Home</li>
            <li className="active">JVM Processes</li>
          </ol>
        </section>
        {/*content*/}
        <div className="content body">
          <div className="row" >
            <JvmListBox />           
          </div>
          
        </div>
      </div>
    )
  }

}

export default JvmsView;
