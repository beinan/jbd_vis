var $ = global.$ = global.jQuery = require('jquery');
//var bootstrap = require('bootstrap');


var React = require('react');
import Frame from './components/frame.jsx';
import AppAction from './actions/app_action';
import ViewType from './view_type';
import StoreFactory from './stores/store_factory';

AppAction.setHeight($(window).height());
$(window).resize(()=> AppAction.setHeight($(window).height()));

AppAction.setView(ViewType.JVMS_VIEW);

React.render( <Frame store={StoreFactory.getAppStore()}/>, document.getElementById('app_wrapper'));
