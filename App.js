import React, { useState, useEffect } from 'react';
import { Pressable, Image, View, StyleSheet, Text, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Spacer, Container, LogoBox } from './components';
import * as NavigationBar from 'expo-navigation-bar';
import { AntDesign } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import Loader from './components/loader';

export default function App() {
	// const visibility = NavigationBar.useVisibility();
	const [image, setImage] = useState(null);
	const [varietyName, setVarietyName] = useState(null);
	const [accuracy, setAccuracy] = useState(null);
    // const [details, setDetails] = useState('No show');
    const [loading,setLoading] = useState(false);


	const pickImage = async () => {
		// No permissions request is necessary for launching the image library
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});

		console.log(result);

		if (!result.canceled) {
			setImage(result.assets[0].uri);
			setVarietyName('Verifying...');
			setAccuracy('');
      setLoading(true);

			getCornVariety(result.assets[0].uri, result.assets[0].mimeType);
		}
	};

	const openCamera = async () => {
		let result = await ImagePicker.launchCameraAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});


		if (!result.canceled) {
			setImage(result.assets[0].uri);
			setVarietyName('Verifying...');
			setAccuracy('');
      setLoading(true);
			getCornVariety(result.assets[0].uri, result.assets[0].mimeType);

		}
	};

  const getCornVariety = async (img, type) => {
	try {

		console.log(Platform.OS, 'get platform');

		let base64String = '';

		if(Platform.OS != 'web'){
					 base64String = await FileSystem.readAsStringAsync(img, {
						encoding: FileSystem.EncodingType.Base64,
					});

		}else{
			base64String = img;
		}

		const splitType = type.split('/');
		const getType = splitType[1];
		const fileName = 'myImage.' + getType;

		const result = await fetch(`https://corn-service.onrender.com/upload-image`, {
			mode: 'cors',
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ filename: fileName, filedata: base64String }),
		});

		if (!result.ok) {
			throw new Error(`Failed to upload image: ${result.status} ${result.statusText}`);
		}

		const data = await result.json();
		console.log(data);

		if (data) {
			setVarietyName(data.variety);
			setAccuracy(data.accuracy);
			setLoading(false);
		}
	} catch (error) {
		console.error('Error:', error);
		// Handle error state, show error message, etc.
		setLoading(false); // Ensure loading state is set to false
	}
};


  function b64toBlob(dataURI) {
		var byteString = atob(dataURI.split(',')[1]);
		var ab = new ArrayBuffer(byteString.length);
		var ia = new Uint8Array(ab);

		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}
		return new Blob([ab], { type: 'image/jpeg' });
	}





	return (
		<Container style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
			{/* <Text style={{ fontSize: '2.25rem', textAlign: 'center', fontWeight: '700', color: '#222423' }}>CORN VARIETY</Text> */}
			<Pressable onPress={getCornVariety}></Pressable>
			<Spacer size={6} />
			<LogoBox />
			<Spacer size={24} />
			<View style={{ width: 250 }}>
				{/* <Text>{details}</Text> */}
				<View style={{ display: 'flex', marginTop: '1rem', gap: 1, flexDirection: 'column' }}>
					<Pressable style={{ padding: 10, maxWidth: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 8, flexGrow: 1 }} onPress={pickImage}>
						{image && !loading ? (
							<>
								<Image source={{ uri: image }} style={styles.image} />
								{varietyName && (
									<>
										<Text style={{ textTransform: 'uppercase', fontSize: 12, fontWeight: '600', color: '#303030', textAlign: 'center', paddingTop: '1rem' }}>
											Variety: {varietyName}
											{accuracy && (
												<>
													<Text style={styles.percentage}>({accuracy}</Text>
													<Text>%)</Text>
												</>
											)}
										</Text>
									</>
								)}
							</>
						) : (
							<>
								{loading ? (
									<Loader />
								) : (
									<>
										<Entypo name='upload' size={64} color='#88d450' />

										<Text style={{ textTransform: 'uppercase', fontSize: 10, fontWeight: 600, color: '#303030' }}>Upload an Image</Text>
									</>
								)}
							</>
						)}
					</Pressable>
					<Spacer size={16} />
					<Pressable style={{ padding: 10, marginTop: '1rem', maxWidth: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 8, flexGrow: 1 }} onPress={openCamera}>
						<AntDesign name='camera' size={64} color='#f37521' />
						<Text style={{ textTransform: 'uppercase', fontSize: 10, fontWeight: 600, color: '#303030' }}>Capture an Image</Text>
					</Pressable>
				</View>
				<Spacer size={16} />
				<Text style={{ fontSize: 12, color: '#a1a1a1', textAlign: 'center' }}>Corn variety v1.0</Text>
			</View>
		</Container>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		gap: 1,
		alignItems: 'center',
		padding: '1rem',
	},
	image: {
		width: 200, // Set the width here
		height: 200, // Set the height here
	},
	percentage: {
		fontWeight: 'bold',
		paddingLeft: '0.5rem',
	},
});
