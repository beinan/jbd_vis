import React from 'react'

import StoreFactory from '../../stores/store_factory';
import JvmsAction from '../../actions/jvm_action';

import ViewType from '../../view_type';

import {ImmutablePropComponent, PureRenderComponent, ContentBox, UploadFileForm} from '../common_components.jsx';

import {Button, Input, Label, Fade, Collapse,Badge, Grid, Row, Col, Well} from 'react-bootstrap';

class JvmMethodsFilterClassEntry extends PureRenderComponent{
  
  constructor(props){
    super(props);
  }
  
  
  render(){
    var class_meta = this.state;
    //console.log(class_meta);
    var methods = [];
    for(var method_name in class_meta.value){
      console.log(method_name);
    }
    var is_checked = this.state.data.get("is_selected");
    var class_name = this.state.data.get("_id").split("/").join(".");
    var on_click = ()=>{
      JvmsAction.selectClass(this.state.data.get("jvm_id"), this.state.data.get("_id"), !is_checked);
    }
    return (
      <Row>
        <Col xs={4} md={3}><Button bsStyle="info" active={is_checked} onClick={on_click}>{class_name}</Button></Col>  
        <Col xs={2}><input type='checkbox' checked={is_checked} onChange={on_click} /></Col>
      </Row>
    )
  }
}


class JvmMethodsFilter extends PureRenderComponent{
  constructor(props){
    super(props);
  }

  render(){
    console.log("method filter is rendering",this.state);
    var filter;
    if(this.state.data.get("status") !== "ready"){
      filter = <p>Loading</p>;
    } else {         
      
      filter = (
        <Grid>
          {this.state.data.get("class_meta_map").toArray().map((meta)=><JvmMethodsFilterClassEntry store={meta}/>)}
        </Grid>
      );
      
      //console.log("item_list is rendering");
    }
    return filter;
  }
}

class JvmEntry extends PureRenderComponent{
  constructor(props){
    super(props);
    //this.jvm_store = props.jvm_store;
    //this.state = {};
    this._onClickWatchFilterButton = this._onClickWatchFilterButton.bind(this);
     this._onClickBuildButton = this._onClickBuildButton.bind(this);
    //this._onChange = this._onChange.bind(this);

  }
  
  _onClickBuildButton(){
    console.log("start building jvm" ,this.state.data);
    JvmsAction.startBuild(this.state.data.get("_id"));
  }
  
  _onClickWatchFilterButton() {
    this.setState({show_watch_filter: !this.state.show_watch_filter});
  }
  
  render(){
    console.log("rendering jvm entry", this.state);
    return (
      <li>
        {this.state.data.get('_id')}
        <Badge>{this.state.data.get("value").count}</Badge>
        <div className="pull-right">
          <Button bsStyle="warning" bsSize='xsmall'  onClick={this._onClickWatchFilterButton}>Watch Filter</Button>
        </div>
        <Collapse in={this.state.show_watch_filter}>
          <Well>
            <JvmMethodsFilter store={this.props.store}/>
            <Button bsStyle="primary"  onClick={this._onClickBuildButton}>Build</Button>
          
          </Well>
        </Collapse>
      </li>
    );
  }
}

class JvmListBox extends PureRenderComponent{
  constructor(props){
    super(props);
  }
  
  
  render(){
    console.log("jvm process list rendering", this.state);
    var item_list;
    if(this.state.data.get("status") != "ready")
      item_list = <p>Loading</p>
    else{
      var items = this.state.data.get("jvm_map").toArray().map((data)=>
         <JvmEntry key={data.get("_id")} store={data}/>
         
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




class JvmsView extends ImmutablePropComponent{
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
            <JvmListBox store={StoreFactory.getJvmProcessListStore()}/>           
          </div>
          <div className="row" >
            <UploadFileForm url="/upload" title="Upload Java source files or jars" dese="" />           
          </div>
          
        </div>
      x</div>
    )
  }

}

export default JvmsView;
