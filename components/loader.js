import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

const Loader = () => (
	<View style={styles.container}>
    <Text style={{color:'#000'}}>Checking</Text>
		<ActivityIndicator size='large' color='#eaeaea' />
	</View>
);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default Loader;
