import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DefaultButton from './DefaultButton';

// aşağıdan çıkan Taksi bekleniyor. İPTAL arayüzünün komponenti
export default function BottomPopupWithButton({ onPress, message, buttonMessage, button2Message, button2OnPress }) {
    return (
        <View style={styles.container}>
            <View style={{ marginLeft: 4, marginBottom: 6 }}>
                <Text style={{ color: '#ffcc00', fontSize: 16 }}>{message}</Text>
            </View>
            <View style={{ display: 'flex', flexDirection: 'row' }}>
                <DefaultButton style={styles.button} onPress={onPress}>{buttonMessage}</DefaultButton>
                {
                    // eğer 2. buton için bilgiler verildiyse 2 tane buton gösteriyoruz
                    button2Message && <DefaultButton style={styles.button} onPress={button2OnPress}>{button2Message}</DefaultButton>
                }
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute', // konumu diğer komponentlere göre değil sabit belli bir yerde
        bottom: '14%', // konumuna altan bu kadar ekle
        backgroundColor: '#000', // arkaplan rengi
        padding: 8, // kendi içinde içten boşluk
        alignSelf: 'center', // kendini hizala // kendini hizala
        width: 255 // genişlik
    },
    button: {
        flex: 1
    },
});