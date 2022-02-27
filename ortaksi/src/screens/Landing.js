import React from 'react';
import { Image, StyleSheet, View } from "react-native";
import DefaultButton from '../components/DefaultButton';

// uygulamayı ilk açışta çıkan sayfa
// prop olarak sayfalar arasında geçiş yapmaya yarayan navigation u alıyor
export default function Landing({ navigation }) {
    // ortaksi logosunu ve altında da 2 tane buton içeriyor
    // kullanıcı girişi butonu ve şoför girişi butonu
    return (
        <View style={styles.container}>
            <View style={styles.verticalContainer}>
                <View style={{ marginBottom: 124 }}>
                    <Image source={require('../assets/images/logo.png')} />
                </View>
                <View style={{ marginBottom: 12 }}>
                    <DefaultButton onPress={() => {
                        navigation.navigate('Customer Login')
                    }}>KULLANICI GİRİŞİ</DefaultButton>
                </View>
                <View>
                    <DefaultButton onPress={() => {
                        navigation.navigate('Driver Login')
                    }}>ŞOFÖR GİRİŞİ</DefaultButton>
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
    input: {
        borderWidth: 2,
        borderColor: '#000',
        padding: 8, // kendi içinde içten boşluk
        fontSize: 20,
        width: 260 // genişlik
    }
})