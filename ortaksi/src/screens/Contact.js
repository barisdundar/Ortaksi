import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Contacts() {
    return <View style={{ backgroundColor: '#000', height: '100%' }}>
        <Text style={styles.title}>İletişim</Text>
        <View style={styles.viewStyle}>
            <Text>
                <Text style={styles.question}>İletişim e-mail adresimiz: </Text>
                <Text style={styles.answer}>barisyunusbarisyunus@gmail.com</Text>
            </Text>
        </View>
    </View>;
}

const styles = StyleSheet.create({
    title: {
        alignSelf: 'center', // kendini hizala
        textAlign: 'center', // yazıyı hizala
        fontSize: 24,
        marginTop: 16, // dış yukardan boşluk
        marginBottom: 14, // dış aşşağıdan boşluk
        fontWeight: 'bold', // yazı kalınlığı
        color: '#ffcc00' // yazı rengi
    },
    viewStyle: {
        paddingLeft: 16, // içten boşluk sol taraftan
        padding: 8, // içten boşluk her taraftan
        marginBottom: 4, // alttan boşluk dıştan
        color: '#ffcc00' // yazı rengi
    },
    question: {
        fontWeight: 'bold', // font kalınlığı
        fontSize: 17,
        color: '#ffcc00' // yazı rengi
    },
    answer: {
        fontSize: 15,
        color: '#ffcc00' // yazı rengi
    }
});