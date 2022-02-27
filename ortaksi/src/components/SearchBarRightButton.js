import { useNavigation } from '@react-navigation/core';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';

// bir yer arama barının yanındaki 3 tane çizgi butonu, yandan çıkan menüyü (kullanıcının profilini içeren) açmak için kullanılıyor
export default function SearchBarRightButton(props = {}) {
    const navigation = useNavigation(); // sayfalar arasında geçiş yapmaya yarayan şey

    return (
        <TouchableOpacity style={props.style ? { ...styles.headerButton, ...props.style } : styles.headerButton} onPress={() => {
            navigation.openDrawer(); // sağdan çıkan menüyü açma fonksiyonu
        }}>
            <Image source={require('../assets/images/logo_drawer.png')} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    headerButton: {
        marginLeft: 4, // dış soldan boşluk
        width: 54, // genişlik
        height: 54, // yükseklik
        backgroundColor: '#000', // arkaplan rengi
        borderWidth: 4,
        borderColor: '#FFCC00',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { x: 0, y: 0 },
        shadowRadius: 15,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center' // içindeki elemanları hizala
    }
});
