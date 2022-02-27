import auth from '@react-native-firebase/auth';
import React from 'react';
import { StyleSheet, Text, View } from "react-native";

// plakası doğrulanmayan şoför için oluşturulan kod dizini
export default function PlateNotVerified() {
	// sadece ekranın ortasına bir yazı ve kullanıcının emailini yazar
	return (
		<View style={styles.container}>
			<View style={styles.verticalContainer}>
				<View style={{ marginBottom: 32 }}>
					<View style={styles.textContainer}>
						<Text style={{ fontSize: 20, marginBottom: 12 }}>Hesabınızı kullanmadan önce plakanızın bir yetkili tarafından doğrulanması gerekmektedir.</Text>
						<Text style={styles.email}>{auth().currentUser.email}</Text>
					</View>
				</View>
			</View>
		</View>
	);
}
const styles = StyleSheet.create({
	container: {
		flex: 1, // içinde olduğu komponenti doldur
		flexDirection: 'row', // içindeki elemanların diziliş yönü
		alignItems: 'center', // içindeki elemanları hizala
		justifyContent: 'center',
		width: '100%', // genişlik
		height: '100%' // yükseklik
	},
	verticalContainer: {
		flex: 1, // içinde olduğu komponenti doldur
		flexDirection: 'column', // içindeki elemanların diziliş yönü
		width: '100%', // genişlik
		alignItems: 'center' // içindeki elemanları hizala
	},
	textContainer: {
		flexDirection: 'column', // içindeki elemanların diziliş yönü
		width: '80%', // genişlik
		alignItems: 'center' // içindeki elemanları hizala
	},
	email: {
		fontWeight: 'bold', // yazı kalınlığı
		fontSize: 20
	}
})