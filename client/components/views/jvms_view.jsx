import React from 'react'

import StoreFactory from '../../stores/store_factory';
import JvmsAction from '../../actions/jvm_action';

import ViewType from '../../view_type';

import {ImmutablePropComponent, PureRenderComponent, ContentBox, UploadFileForm} from '../common_components.jsx';

import {Button, Input, Label, Fade, Collapse,Badge, Grid, Row, Col, Well,DropdownButton, MenuItem} from 'react-bootstrap';

import {getJson} from '../../utils/ajax'

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
        {" " + this.state.data.get('main_class') + " id: " + this.state.data.get('_id')}
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



class GitRepositoryForm extends ImmutablePropComponent{
  constructor(props){
    super(props);
    this.state = {};
  }

  render(){

    var main_classes = [];
    if(this.state.data){
      var app_id = this.state.data.app_id
      main_classes = this.state.data.main_classes.map(function(main_class){
        var run_click = function(){
          getJson("/run", {app_id: app_id, main_class_name: main_class}).then(function(data){
            alert(data.msg);
          });
        }
        return (
          <li>
            {main_class}
            <div className="pull-right">
              <Button bsStyle="warning" bsSize='xsmall'  onClick={run_click}>Run</Button>
            </div>
       
          </li>
        );
      });
    }
    
    var fetch = ()=>{
      var uri = this.refs.git_uri.getValue();
      console.log("fetching git Repository:", this,this.refs, this.refs.git_uri, uri);
      var localHistory = JSON.parse(localStorage.getItem('git_uri'));
      if(!localHistory)
        localHistory = [];
      if(localHistory.indexOf(uri) == -1){
        localHistory.push(uri);
        localStorage.setItem('git_uri', JSON.stringify(localHistory));
      }

      getJson('/fetch_git', {uri:uri}).then((data)=>{
        console.log('data from /fetch_git', data);
        this.setState(data); 
       
      }).catch((err)=> {console.log(err)})
    }

    var fetch_but = <Button  bsStyle="warning"  onClick={fetch.bind(this)}>Fetch</Button>;
    var localHistory = JSON.parse(localStorage.getItem('git_uri'));
    if(!localHistory)
        localHistory = [];
    var history_items = localHistory.map((h, i)=>{
      var item_onclick = ()=>{
        console.log("click history",this, this.state, h);
        this.setState({uri:h});
      };

      return (<MenuItem key={"history_item_" + i} onSelect={item_onclick}>{h}</MenuItem>);
    });
    var uri_history=(
      <DropdownButton title="History" id="input-dropdown-addon">
        {history_items}
      </DropdownButton>
    );
    return (
      <div>
        <div className="form-group">          
          <label className="control-label" htmlFor="gitUri">Git Repository</label>
          <Input type="text" name="git_uri" id="gitUri" ref="git_uri" 
                 buttonBefore={uri_history} buttonAfter={fetch_but} value={this.state.uri}/>
          
        </div>
        <div>
          <ul className="todo-list ui-sortable">
            {main_classes}
          </ul>
        </div>
      </div>
    );
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
            <GitRepositoryForm></GitRepositoryForm>           
          </div>
          
          <div className="row" >
            <UploadFileForm url="/upload" title="Upload Java source files or jars" dese="" />           
          </div>
          
        </div>
      </div>
    )
  }

}

export default JvmsView;
