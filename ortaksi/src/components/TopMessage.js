import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ekranın yukarsında çıkan 60 dakika sonraya randevun var iptal etmek için tıkla yazısını sağlayan komponent
export default function TopMessage(props) {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={props.onPress ? props.onPress : () => { }}>
                <View style={styles.box}>
                    <Text style={styles.text}>{props.children}</Text>
                    {
                        // iptal etmek için tıkla kısmı verildiyse o kısmı da yazıyoruz
                        props.boldText && <Text style={styles.boldText}>{props.boldText}</Text>
                    }
                </View>
            </TouchableOpacity>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute', // konumu diğer komponentlere göre değil sabit belli bir yerde
        top: 15, // üstten bırakılacak boşluk
        left: 15,
        width: '100%' // genişlik
    },
    box: {
        backgroundColor: '#000', // arkaplan rengi
        borderWidth: 4,
        borderColor: '#ffcc00',
        padding: 8, // kendi içinde içten boşluk
        width: 303 // genişlik
    },
    text: {
        color: '#ffcc00' // yazı rengi
    },
    boldText: {
        color: '#ffcc00', // yazı rengi
        fontWeight: 'bold' // yazı kalınlığı
    }
});