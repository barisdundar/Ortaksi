import React from 'react';
import { Image, StyleSheet, View } from "react-native";

// sadece ekranın ortasında ortaksi logosunu içeren yükleniyor ekranı
export default function Loading() {
    return (
        <View style={styles.container}>
            <View style={styles.verticalContainer}>
                <View>
                    <Image source={require('../assets/images/logo.png')} />
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
    }
})