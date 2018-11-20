import React, {Component, PureComponent} from "react";
import {StyleSheet, AppRegistry, DeviceEventEmitter, View} from 'react-native';
type Props={

}
type State={
	elements:any
}
let keyValue = 0;

export default class TopView extends Component<Props,State> {

	static add(element) {
		let key = ++keyValue;
		DeviceEventEmitter.emit("addOverlay", {key, element});
		return key;
	}

	static remove(key) {
		DeviceEventEmitter.emit("removeOverlay", {key});
	}

	static removeAll() {
		DeviceEventEmitter.emit("removeAllOverlay", {});
	}


	constructor(props) {
		super(props);
		this.state = {
			elements: []
		};
		DeviceEventEmitter.addListener("addOverlay", e => this.add(e));
		DeviceEventEmitter.addListener("removeOverlay", e => this.remove(e));
		DeviceEventEmitter.addListener("removeAllOverlay", e => this.removeAll(e));
	}


	componentWillUnmount() {
		DeviceEventEmitter.removeAllListeners("addOverlay");
		DeviceEventEmitter.removeAllListeners("removeOverlay");
		DeviceEventEmitter.removeAllListeners("removeAllOverlay");
	}

	add(e) {
		let {elements} = this.state;
		elements.push(e);
		this.setState({elements});
	}
	remove(e) {
		let {elements} = this.state;
		for (let i = elements.length - 1; i >= 0; --i) {
			if(typeof elements[i]==='object'){
				// @ts-ignore
				if ( elements[i]!.key === e.key) {
					elements.splice(i, 1);
					break;
				}
			}
		}
		this.setState({elements});
	}

	removeAll(e) {
		let {elements} = this.state;
		this.setState({elements: []});
	}



// @ts-ignore
	render() {
		let {elements} = this.state;
		return (
			<React.Fragment>
				<PureView>
					{this.props.children}
				</PureView>
				{elements.map((item, index) => {
					return (
						<View key={'topView' + item!.key} style={styles.overlay} pointerEvents='box-none'>
							{item!.element}
						</View>
					);
				})}
			</React.Fragment>
		);
	}

}

var styles = StyleSheet.create({
	overlay: {
		backgroundColor: 'rgba(0, 0, 0, 0)',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex:9999999
	},
});

class PureView extends PureComponent {
	render() {
		return (
			<View style={{flex: 1}}>
				{this.props.children}
			</View>
		);
	}
}

if (!AppRegistry.registerComponentOld) {
	AppRegistry.registerComponentOld = AppRegistry.registerComponent;
}

AppRegistry.registerComponent = function(appKey, componentProvider) {

	class RootElement extends Component {
		render() {
			let Component = componentProvider();
			return (
				<TopView>
					<Component {...this.props} />
				</TopView>
			);
		}
	}

	return AppRegistry.registerComponentOld(appKey, () => RootElement);
}